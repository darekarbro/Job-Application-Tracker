import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import { FormField } from '../../components/ui/FormField';
import { InlineError } from '../../components/ui/InlineError';
import type { ParsedJobDescription } from '../ai/ai.types';
import {
  type ApplicationFormValues,
  applicationStatuses,
  type JobApplication,
} from '../../types/application';
import {
  applicationFormSchema,
  type ApplicationFormInput,
} from './application.validation';

interface ApplicationFormProps {
  editingApplication: JobApplication | null;
  isSubmitting: boolean;
  isParsingJobDescription: boolean;
  isGeneratingResumeBullets: boolean;
  onSubmit: (values: ApplicationFormInput) => Promise<void>;
  onCancelEdit: () => void;
  onParseJobDescription: (rawText: string) => Promise<ParsedJobDescription>;
  onGenerateResumeBullets: (role: string, skills: string[]) => Promise<string[]>;
}

const getDefaultFormValues = (): ApplicationFormValues => ({
  company: '',
  role: '',
  jdLink: '',
  notes: '',
  dateApplied: new Date().toISOString().slice(0, 10),
  status: 'applied',
  salaryRange: '',
});

const mapApplicationToFormValues = (
  application: JobApplication,
): ApplicationFormValues => ({
  company: application.company,
  role: application.role,
  jdLink: application.jdLink ?? '',
  notes: application.notes ?? '',
  dateApplied: application.dateApplied.slice(0, 10),
  status: application.status,
  salaryRange: application.salaryRange ?? '',
});

const formatStatusLabel = (status: string): string => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

export const ApplicationForm = ({
  editingApplication,
  isSubmitting,
  isParsingJobDescription,
  isGeneratingResumeBullets,
  onSubmit,
  onCancelEdit,
  onParseJobDescription,
  onGenerateResumeBullets,
}: ApplicationFormProps) => {
  const [formValues, setFormValues] = useState<ApplicationFormValues>(() => {
    if (!editingApplication) {
      return getDefaultFormValues();
    }

    return mapApplicationToFormValues(editingApplication);
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rawJobDescription, setRawJobDescription] = useState('');
  const [parseErrorMessage, setParseErrorMessage] = useState<string | null>(null);
  const [resumeSkillsInput, setResumeSkillsInput] = useState('');
  const [resumeBulletsError, setResumeBulletsError] = useState<string | null>(null);
  const [resumeBullets, setResumeBullets] = useState<string[]>([]);
  const [copiedBulletIndex, setCopiedBulletIndex] = useState<number | null>(null);

  const submitLabel = useMemo(() => {
    if (isSubmitting && editingApplication) {
      return 'Updating...';
    }

    if (isSubmitting) {
      return 'Adding...';
    }

    return editingApplication ? 'Update Application' : 'Add Application';
  }, [editingApplication, isSubmitting]);

  const updateField = <K extends keyof ApplicationFormValues>(
    field: K,
    value: ApplicationFormValues[K],
  ) => {
    setFormValues((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleParseJobDescription = async (): Promise<void> => {
    setParseErrorMessage(null);

    const text = rawJobDescription.trim();

    if (text.length < 30) {
      setParseErrorMessage('Please paste at least 30 characters of job description text.');
      return;
    }

    try {
      const parsed = await onParseJobDescription(text);
      const detailsLines = [
        `Seniority: ${parsed.seniority || 'N/A'}`,
        `Location: ${parsed.location || 'N/A'}`,
        `Required Skills: ${parsed.requiredSkills.join(', ') || 'N/A'}`,
        `Nice-to-Have Skills: ${parsed.niceToHaveSkills.join(', ') || 'N/A'}`,
      ];

      setFormValues((previous) => {
        const existingNotes = previous.notes.trim();
        const aiGeneratedNotes = detailsLines.join('\n');

        return {
          ...previous,
          company: parsed.company || previous.company,
          role: parsed.role || previous.role,
          notes: existingNotes
            ? `${existingNotes}\n\n${aiGeneratedNotes}`
            : aiGeneratedNotes,
        };
      });

      const parsedSkills = [
        ...parsed.requiredSkills,
        ...parsed.niceToHaveSkills,
      ]
        .map((skill) => skill.trim())
        .filter((skill, index, allSkills) => {
          return skill.length > 0 && allSkills.indexOf(skill) === index;
        });

      if (parsedSkills.length > 0) {
        setResumeSkillsInput(parsedSkills.join(', '));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to parse description';
      setParseErrorMessage(message);
    }
  };

  const parseSkillsInput = (input: string): string[] => {
    return input
      .split(/[\n,;]+/)
      .map((skill) => skill.trim())
      .filter((skill, index, allSkills) => {
        return skill.length > 0 && allSkills.indexOf(skill) === index;
      });
  };

  const handleGenerateResumeBullets = async (): Promise<void> => {
    setResumeBulletsError(null);
    setCopiedBulletIndex(null);

    const role = formValues.role.trim();
    const skills = parseSkillsInput(resumeSkillsInput);

    if (role.length < 2) {
      setResumeBulletsError('Please enter a valid role before generating bullet points.');
      return;
    }

    if (skills.length === 0) {
      setResumeBulletsError('Please provide at least one skill to generate bullet points.');
      return;
    }

    try {
      const bullets = await onGenerateResumeBullets(role, skills);
      setResumeBullets(bullets);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to generate resume bullets';
      setResumeBulletsError(message);
    }
  };

  const handleCopyBullet = async (bullet: string, index: number): Promise<void> => {
    setResumeBulletsError(null);

    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard is not available in this browser context.');
      }

      await navigator.clipboard.writeText(bullet);
      setCopiedBulletIndex(index);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to copy bullet point right now';
      setResumeBulletsError(message);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const parsedResult = applicationFormSchema.safeParse(formValues);

    if (!parsedResult.success) {
      setErrorMessage(parsedResult.error.issues[0]?.message ?? 'Invalid form data');
      return;
    }

    try {
      await onSubmit(parsedResult.data);

      if (!editingApplication) {
        setFormValues(getDefaultFormValues());
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Request failed';
      setErrorMessage(message);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        {editingApplication ? 'Edit Application' : 'Add Job Application'}
      </h2>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <label htmlFor="rawJobDescription" className="mb-1 block text-sm font-medium text-slate-700">
          Paste Job Description (AI Parse)
        </label>
        <textarea
          id="rawJobDescription"
          value={rawJobDescription}
          onChange={(event) => setRawJobDescription(event.target.value)}
          rows={6}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500"
          placeholder="Paste raw job description text here to auto-fill company, role, and skills summary in notes."
        />

        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => void handleParseJobDescription()}
            disabled={isParsingJobDescription}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isParsingJobDescription ? 'Parsing...' : 'Parse'}
          </button>
          <p className="text-xs text-slate-500">AI will return strict JSON and auto-fill fields.</p>
        </div>

        {parseErrorMessage ? <div className="mt-3"><InlineError message={parseErrorMessage} /></div> : null}
      </div>

      <form className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <FormField label="Company" htmlFor="company">
          <input
            id="company"
            value={formValues.company}
            onChange={(event) => updateField('company', event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
            placeholder="Acme Corp"
          />
        </FormField>

        <FormField label="Role" htmlFor="role">
          <input
            id="role"
            value={formValues.role}
            onChange={(event) => updateField('role', event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
            placeholder="Frontend Engineer"
          />
        </FormField>

        <FormField label="Date Applied" htmlFor="dateApplied">
          <input
            id="dateApplied"
            type="date"
            value={formValues.dateApplied}
            onChange={(event) => updateField('dateApplied', event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
          />
        </FormField>

        <FormField label="Status" htmlFor="status">
          <select
            id="status"
            value={formValues.status}
            onChange={(event) =>
              updateField('status', event.target.value as ApplicationFormValues['status'])
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
          >
            {applicationStatuses.map((status) => (
              <option key={status} value={status}>
                {formatStatusLabel(status)}
              </option>
            ))}
          </select>
        </FormField>

        <div>
          <label htmlFor="salaryRange" className="mb-1 block text-sm text-slate-700">
            Salary Range
          </label>
          <input
            id="salaryRange"
            value={formValues.salaryRange}
            onChange={(event) => updateField('salaryRange', event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
            placeholder="$80k - $100k"
          />
        </div>

        <div>
          <label htmlFor="jdLink" className="mb-1 block text-sm text-slate-700">
            JD Link
          </label>
          <input
            id="jdLink"
            value={formValues.jdLink}
            onChange={(event) => updateField('jdLink', event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
            placeholder="https://company.com/jobs/123"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="notes" className="mb-1 block text-sm text-slate-700">
            Notes
          </label>
          <textarea
            id="notes"
            value={formValues.notes}
            onChange={(event) => updateField('notes', event.target.value)}
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
            placeholder="Interview rounds, referrals, preparation notes..."
          />
        </div>

        {errorMessage ? (
          <div className="md:col-span-2">
            <InlineError message={errorMessage} />
          </div>
        ) : null}

        <div className="md:col-span-2 flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitLabel}
          </button>

          {editingApplication ? (
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          AI Resume Bullet Suggestions
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Generate 3 to 5 tailored, action-oriented bullet points from role and skills.
        </p>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <label htmlFor="resumeSkills" className="mb-1 block text-sm text-slate-700">
              Skills (comma or new line separated)
            </label>
            <textarea
              id="resumeSkills"
              value={resumeSkillsInput}
              onChange={(event) => setResumeSkillsInput(event.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500"
              placeholder="React, TypeScript, Node.js, MongoDB"
            />
          </div>

          <button
            type="button"
            onClick={() => void handleGenerateResumeBullets()}
            disabled={isGeneratingResumeBullets}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGeneratingResumeBullets ? 'Generating...' : 'Generate Bullets'}
          </button>
        </div>

        {resumeBulletsError ? <div className="mt-3"><InlineError message={resumeBulletsError} /></div> : null}

        {resumeBullets.length > 0 ? (
          <div className="mt-4 space-y-2">
            {resumeBullets.map((bullet, index) => (
              <div
                key={`${bullet}-${index}`}
                className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
              >
                <p className="text-sm text-slate-700">- {bullet}</p>
                <button
                  type="button"
                  onClick={() => void handleCopyBullet(bullet, index)}
                  className="shrink-0 rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {copiedBulletIndex === index ? 'Copied' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};
