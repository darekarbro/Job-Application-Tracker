import type { JobApplication } from '../../types/application';

interface ApplicationListProps {
  applications: JobApplication[];
  isLoading: boolean;
  onEdit: (application: JobApplication) => void;
  onDelete: (applicationId: string) => Promise<void>;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString();
};

export const ApplicationList = ({
  applications,
  isLoading,
  onEdit,
  onDelete,
}: ApplicationListProps) => {
  if (isLoading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 text-sm text-slate-600 shadow-sm">
        Loading applications...
      </section>
    );
  }

  if (applications.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 text-sm text-slate-600 shadow-sm">
        No applications added yet.
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date Applied</th>
              <th className="px-4 py-3">Salary</th>
              <th className="px-4 py-3">Notes</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr key={application.id} className="border-t border-slate-200 align-top">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {application.company}
                  {application.jdLink ? (
                    <div>
                      <a
                        href={application.jdLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium text-amber-700 underline"
                      >
                        View JD
                      </a>
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3">{application.role}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                    {application.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">{formatDate(application.dateApplied)}</td>
                <td className="px-4 py-3">{application.salaryRange ?? '-'}</td>
                <td className="max-w-xs px-4 py-3 text-xs text-slate-600">
                  {application.notes?.trim() ? application.notes : '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(application)}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void onDelete(application.id)}
                      className="rounded-md border border-red-300 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
