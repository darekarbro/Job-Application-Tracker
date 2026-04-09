import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { InlineError } from '../components/ui/InlineError';
import { FormField } from '../components/ui/FormField';
import { useToast } from '../components/ui/useToast';
import { getAuthErrorMessage } from '../features/auth/auth.api';
import { loginFormSchema } from '../features/auth/auth.validation';
import { useAuth } from '../features/auth/useAuth';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isSubmitting } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const parsed = loginFormSchema.safeParse({ email, password });

    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message ?? 'Please check your form input.');
      return;
    }

    try {
      await login(parsed.data);
      showToast({
        title: 'Welcome back',
        message: 'You are now logged in.',
        variant: 'success',
      });
      navigate('/', { replace: true });
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
      showToast({
        title: 'Login failed',
        message: getAuthErrorMessage(error),
        variant: 'error',
      });
    }
  };

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Sign In</h2>
      <p className="mt-2 text-sm text-slate-600">
        Use your credentials to continue to your application dashboard.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <FormField label="Email" htmlFor="login-email">
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
            placeholder="name@company.com"
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="login-password"
          helperText="Minimum 8 characters"
        >
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
            placeholder="********"
          />
        </FormField>

        {errorMessage ? <InlineError message={errorMessage} /> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in...' : 'Login'}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-600">
        New here?{' '}
        <Link to="/register" className="font-medium text-slate-900 underline">
          Create an account
        </Link>
      </p>
    </section>
  );
};
