import type { ReactNode } from 'react';

import { InlineError } from './InlineError';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  helperText?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export const FormField = ({
  label,
  htmlFor,
  helperText,
  error,
  children,
  className = '',
}: FormFieldProps) => {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1 block text-sm text-slate-700">
        {label}
      </label>
      {children}
      {helperText ? <p className="mt-1 text-xs text-slate-500">{helperText}</p> : null}
      {error ? <div className="mt-2"><InlineError message={error} /></div> : null}
    </div>
  );
};
