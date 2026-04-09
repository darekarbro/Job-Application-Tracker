import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

import { useToast } from '../ui/useToast';
import { useAuth } from '../../features/auth/useAuth';

type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'job-tracker-theme';

const getInitialThemeMode = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const saved = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (saved === 'light' || saved === 'dark') {
    return saved;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const AppLayout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isSubmitting } = useAuth();
  const { showToast } = useToast();
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => getInitialThemeMode());

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle('theme-dark', themeMode === 'dark');
    root.classList.toggle('theme-light', themeMode === 'light');
    root.setAttribute('data-theme', themeMode);

    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  const handleLogout = async () => {
    try {
      await logout();
      showToast({
        title: 'Logged out',
        message: 'You have been signed out safely.',
        variant: 'success',
      });
      navigate('/login', { replace: true });
    } catch {
      showToast({
        title: 'Logout failed',
        message: 'Please try again in a moment.',
        variant: 'error',
      });
    }
  };

  const toggleThemeMode = () => {
    setThemeMode((current) => (current === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-10 rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              AI-Assisted Workflow
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              Job Application Tracker
            </h1>
            {isAuthenticated && user ? (
              <p className="mt-2 text-sm text-slate-600">Signed in as {user.email}</p>
            ) : null}
          </div>

          <nav className="flex items-center gap-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={toggleThemeMode}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white"
            >
              {themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isSubmitting}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-white"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
};
