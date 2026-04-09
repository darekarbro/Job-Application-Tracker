import type { PropsWithChildren } from 'react';
import { useCallback, useMemo, useState } from 'react';

import {
  ToastContext,
  type ToastContextValue,
  type ToastPayload,
  type ToastVariant,
} from './toast-context';

interface ToastItem extends Required<Omit<ToastPayload, 'durationMs'>> {
  id: string;
}

const getVariantStyles = (variant: ToastVariant): string => {
  if (variant === 'success') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-900';
  }

  if (variant === 'error') {
    return 'border-red-200 bg-red-50 text-red-900';
  }

  return 'border-slate-200 bg-white text-slate-900';
};

export const ToastProvider = ({ children }: PropsWithChildren) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, message, variant = 'info', durationMs = 3500 }: ToastPayload) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      setToasts((current) => [
        ...current,
        {
          id,
          title,
          message: message ?? '',
          variant,
        },
      ]);

      window.setTimeout(() => {
        removeToast(id);
      }, durationMs);
    },
    [removeToast],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[120] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl border p-3 shadow-lg backdrop-blur ${getVariantStyles(toast.variant)}`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.message ? <p className="mt-1 text-xs opacity-90">{toast.message}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="rounded-md border border-current/20 px-2 py-1 text-[11px] font-semibold"
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
