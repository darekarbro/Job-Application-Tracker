import { useMemo, useState } from 'react';

import { InlineError } from '../../components/ui/InlineError';
import type {
  ApplicationFormValues,
  UpdateApplicationInput,
  JobApplication,
} from '../../types/application';
import { applicationStatuses } from '../../types/application';
import {
  applicationFormSchema,
  type ApplicationFormInput,
} from './application.validation';

interface ApplicationDetailsModalProps {
  application: JobApplication;
  isSaving: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onSave: (applicationId: string, input: UpdateApplicationInput) => Promise<void>;
  onDelete: (applicationId: string) => Promise<void>;
}

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

const toPayload = (input: ApplicationFormInput): UpdateApplicationInput => ({
  company: input.company,
  role: input.role,
  jdLink: input.jdLink?.trim() ? input.jdLink.trim() : undefined,
  notes: input.notes?.trim() ? input.notes.trim() : undefined,
  dateApplied: input.dateApplied,
  status: input.status,
  salaryRange: input.salaryRange?.trim() ? input.salaryRange.trim() : undefined,
});

const formatDate = (dateString: string): string => {
  const parsedDate = new Date(dateString);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateString;
  }

  return parsedDate.toLocaleDateString();
};

const formatStatusLabel = (status: string): string => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

export const ApplicationDetailsModal = ({
  application,
  isSaving,
  isDeleting,
  onClose,
  onSave,
  onDelete,
}: ApplicationDetailsModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState<ApplicationFormValues>(() =>
    mapApplicationToFormValues(application),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateField = <K extends keyof ApplicationFormValues>(
    field: K,
    value: ApplicationFormValues[K],
  ) => {
    setFormValues((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const modalTitle = useMemo(() => {
    return `${application.company} - ${application.role}`;
  }, [application.company, application.role]);

  const handleSave = async () => {
    setErrorMessage(null);

    const parsedResult = applicationFormSchema.safeParse(formValues);

    if (!parsedResult.success) {
      setErrorMessage(parsedResult.error.issues[0]?.message ?? 'Invalid input data');
      return;
    }

    try {
      await onSave(application.id, toPayload(parsedResult.data));
      setIsEditing(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Update failed');
    }
  };

  const handleDelete = async () => {
    const shouldDelete = window.confirm(
      'Delete this application? This action cannot be undone.',
    );

    if (!shouldDelete) {
      return;
    }

    setErrorMessage(null);

    try {
      await onDelete(application.id);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Delete failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{modalTitle}</h3>
            <p className="mt-1 text-xs text-slate-500">
              Status: {formatStatusLabel(application.status)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        {!isEditing ? (
          <div className="mt-5 space-y-3 text-sm text-slate-700">
            <p>
              <span className="font-semibold text-slate-900">Company:</span> {application.company}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Role:</span> {application.role}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Date Applied:</span>{' '}
              {formatDate(application.dateApplied)}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Salary Range:</span>{' '}
              {application.salaryRange ?? '-'}
            </p>
            <p>
              <span className="font-semibold text-slate-900">JD Link:</span>{' '}
              {application.jdLink ? (
                <a
                  href={application.jdLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-700 underline"
                >
                  Open job description
                </a>
              ) : (
                '-'
              )}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Notes:</span>{' '}
              {application.notes?.trim() ? application.notes : '-'}
            </p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              value={formValues.company}
              onChange={(event) => updateField('company', event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
              placeholder="Company"
            />
            <input
              value={formValues.role}
              onChange={(event) => updateField('role', event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
              placeholder="Role"
            />
            <input
              type="date"
              value={formValues.dateApplied}
              onChange={(event) => updateField('dateApplied', event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
            />
            <select
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
            <input
              value={formValues.salaryRange}
              onChange={(event) => updateField('salaryRange', event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
              placeholder="Salary range"
            />
            <input
              value={formValues.jdLink}
              onChange={(event) => updateField('jdLink', event.target.value)}
              className="md:col-span-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
              placeholder="JD link"
            />
            <textarea
              value={formValues.notes}
              onChange={(event) => updateField('notes', event.target.value)}
              rows={4}
              className="md:col-span-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
              placeholder="Notes"
            />
          </div>
        )}

        {errorMessage ? <div className="mt-4"><InlineError message={errorMessage} /></div> : null}

        <div className="mt-6 flex flex-wrap gap-2">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSaving}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormValues(mapApplicationToFormValues(application));
                  setIsEditing(false);
                  setErrorMessage(null);
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel Edit
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
