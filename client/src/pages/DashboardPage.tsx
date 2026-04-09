import { ApplicationsSection } from '../features/applications/ApplicationsSection';

export const DashboardPage = () => {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Job Applications</h2>
        <p className="mt-2 text-sm text-slate-600">
          Add, edit, and track your job applications with a typed full-stack CRUD
          module.
        </p>
      </div>

      <ApplicationsSection />
    </section>
  );
};
