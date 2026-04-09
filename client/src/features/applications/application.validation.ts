import { z } from 'zod';

import { applicationStatuses } from '../../types/application';

export const applicationFormSchema = z.object({
  company: z.string().trim().min(1, 'Company is required').max(140),
  role: z.string().trim().min(1, 'Role is required').max(160),
  jdLink: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || z.url().safeParse(value).success,
      'JD link must be a valid URL',
    ),
  notes: z.string().trim().max(4000).optional(),
  dateApplied: z.string().date('Date applied is required'),
  status: z.enum(applicationStatuses),
  salaryRange: z.string().trim().max(120).optional(),
});

export type ApplicationFormInput = z.infer<typeof applicationFormSchema>;
