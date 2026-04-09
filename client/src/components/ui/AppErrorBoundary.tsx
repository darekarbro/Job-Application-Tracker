import { Component, type ErrorInfo, type ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Unhandled React render error', error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-10">
        <section className="w-full rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-700">
            Unexpected Error
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Something went wrong
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            The app hit an unexpected problem. Reload to recover safely.
          </p>

          {import.meta.env.DEV && this.state.error ? (
            <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-slate-100 p-3 text-xs text-slate-700">
              {this.state.error.stack ?? this.state.error.message}
            </pre>
          ) : null}

          <button
            type="button"
            onClick={this.handleReload}
            className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Reload App
          </button>
        </section>
      </main>
    );
  }
}
