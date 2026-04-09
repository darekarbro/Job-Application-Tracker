import OpenAI from 'openai';
import { z } from 'zod';

import { env } from '../config/env';
import { HTTP_STATUS } from '../constants/http-status';
import { ApiError } from '../utils/api-error';
import {
  ParseJobDescriptionInput,
  ResumeBulletsInput,
} from '../validations/ai.validation';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const parsedJobDescriptionSchema = z.object({
  company: z.string(),
  role: z.string(),
  requiredSkills: z.array(z.string()),
  niceToHaveSkills: z.array(z.string()),
  seniority: z.string(),
  location: z.string(),
});

export type ParsedJobDescription = z.infer<typeof parsedJobDescriptionSchema>;

const jobDescriptionJsonSchemaResponseFormat = {
  type: 'json_schema',
  json_schema: {
    name: 'job_description_parser',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        company: { type: 'string' },
        role: { type: 'string' },
        requiredSkills: {
          type: 'array',
          items: { type: 'string' },
        },
        niceToHaveSkills: {
          type: 'array',
          items: { type: 'string' },
        },
        seniority: { type: 'string' },
        location: { type: 'string' },
      },
      required: [
        'company',
        'role',
        'requiredSkills',
        'niceToHaveSkills',
        'seniority',
        'location',
      ],
    },
  },
} as const;

interface ResumeBulletsResponse {
  bullets: string[];
}

const resumeBulletsSchema = z.object({
  bullets: z.array(z.string()).min(3).max(5),
});

const resumeBulletsJsonSchemaResponseFormat = {
  type: 'json_schema',
  json_schema: {
    name: 'resume_bullets_generator',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        bullets: {
          type: 'array',
          minItems: 3,
          maxItems: 5,
          items: {
            type: 'string',
          },
        },
      },
      required: ['bullets'],
    },
  },
} as const;

const actionVerbPattern =
  /^(Developed|Built|Implemented|Designed|Optimized|Automated|Led|Created|Improved|Architected|Delivered|Reduced|Enhanced|Spearheaded|Integrated|Streamlined)\b/i;

const genericPhrasePattern =
  /(hardworking|team player|good communication|responsible for|detail-oriented|go-getter|works well under pressure)/i;

const safeJsonParse = (value: string): unknown => {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to parse AI response');
  }
};

const normalizeResumeBullets = (bullets: string[]): string[] => {
  const seen = new Set<string>();

  return bullets
    .map((bullet) => bullet.replace(/\s+/g, ' ').trim())
    .filter((bullet) => bullet.length > 0)
    .filter((bullet) => {
      const key = bullet.toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
};

const validateResumeBullets = (bullets: string[]): string[] => {
  const normalized = normalizeResumeBullets(bullets);

  if (normalized.length < 3 || normalized.length > 5) {
    throw new ApiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'AI returned an invalid number of bullet points',
    );
  }

  const hasInvalidBullet = normalized.some((bullet) => {
    return !actionVerbPattern.test(bullet) || genericPhrasePattern.test(bullet);
  });

  if (hasInvalidBullet) {
    throw new ApiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'AI returned low-quality bullet points',
    );
  }

  return normalized;
};

const parseResumeBulletsResponse = (content: string): ResumeBulletsResponse => {
  const parsedContent = safeJsonParse(content);
  const parsedResult = resumeBulletsSchema.safeParse(parsedContent);

  if (!parsedResult.success) {
    throw new ApiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'AI response did not match required bullet schema',
    );
  }

  return {
    bullets: validateResumeBullets(parsedResult.data.bullets),
  };
};

const normalizeParsedJobDescription = (
  parsed: ParsedJobDescription,
): ParsedJobDescription => {
  const sanitizeList = (items: string[]): string[] => {
    return items
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  };

  return {
    company: parsed.company.trim(),
    role: parsed.role.trim(),
    requiredSkills: sanitizeList(parsed.requiredSkills),
    niceToHaveSkills: sanitizeList(parsed.niceToHaveSkills),
    seniority: parsed.seniority.trim(),
    location: parsed.location.trim(),
  };
};

const parseStrictJobDescriptionResponse = (
  content: string,
): ParsedJobDescription => {
  const parsedContent = safeJsonParse(content);
  const parsedResult = parsedJobDescriptionSchema.safeParse(parsedContent);

  if (!parsedResult.success) {
    throw new ApiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'AI response did not match required schema',
    );
  }

  return normalizeParsedJobDescription(parsedResult.data);
};

const parseWithStructuredOutput = async (
  input: ParseJobDescriptionInput,
): Promise<ParsedJobDescription> => {
  const completion = await openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    temperature: 0,
    response_format: jobDescriptionJsonSchemaResponseFormat,
    messages: [
      {
        role: 'system',
        content:
          'Extract job details from raw job description text. Return only schema-compliant JSON.',
      },
      {
        role: 'user',
        content: input.jobDescriptionText,
      },
    ],
  });

  const content = completion.choices[0]?.message.content;

  if (!content) {
    throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'No AI response content returned');
  }

  return parseStrictJobDescriptionResponse(content);
};

const parseWithFallbackJsonObject = async (
  input: ParseJobDescriptionInput,
): Promise<ParsedJobDescription> => {
  const completion = await openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'Return ONLY JSON with keys: company, role, requiredSkills, niceToHaveSkills, seniority, location.',
      },
      {
        role: 'user',
        content: input.jobDescriptionText,
      },
    ],
  });

  const content = completion.choices[0]?.message.content;

  if (!content) {
    throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'No AI response content returned');
  }

  return parseStrictJobDescriptionResponse(content);
};

export const parseJobDescription = async (
  input: ParseJobDescriptionInput,
): Promise<ParsedJobDescription> => {
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await parseWithStructuredOutput(input);
    } catch {
      if (attempt === maxAttempts) {
        break;
      }
    }
  }

  try {
    return await parseWithFallbackJsonObject(input);
  } catch {
    throw new ApiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'Unable to parse job description. Please try again with more context.',
    );
  }
};

export const suggestResumeBullets = async (
  input: ResumeBulletsInput,
): Promise<ResumeBulletsResponse> => {
  const skillsList = input.skills
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0);

  if (skillsList.length === 0) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'At least one skill is required');
  }

  const role = input.role.trim();

  const structuredCall = async (): Promise<ResumeBulletsResponse> => {
    const completion = await openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      temperature: 0.35,
      response_format: resumeBulletsJsonSchemaResponseFormat,
      messages: [
        {
          role: 'system',
          content:
            'Generate resume bullet points that are specific, action-oriented, and unique. Every bullet must start with a strong action verb and include concrete impact, tools, or measurable outcomes.',
        },
        {
          role: 'user',
          content: `Role: ${role}\nSkills: ${skillsList.join(', ')}\nReturn 3 to 5 bullet points.`,
        },
      ],
    });

    const content = completion.choices[0]?.message.content;

    if (!content) {
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'No AI response content returned');
    }

    return parseResumeBulletsResponse(content);
  };

  const fallbackCall = async (): Promise<ResumeBulletsResponse> => {
    const completion = await openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      temperature: 0.35,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Return only JSON with a bullets array containing 3 to 5 unique, action-oriented, role-specific resume bullet points.',
        },
        {
          role: 'user',
          content: `Role: ${role}\nSkills: ${skillsList.join(', ')}\nGenerate bullet points now.`,
        },
      ],
    });

    const content = completion.choices[0]?.message.content;

    if (!content) {
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'No AI response content returned');
    }

    return parseResumeBulletsResponse(content);
  };

  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await structuredCall();
    } catch {
      if (attempt === maxAttempts) {
        break;
      }
    }
  }

  try {
    return await fallbackCall();
  } catch {
    throw new ApiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'Unable to generate resume bullets. Please refine role and skills and try again.',
    );
  }
};
