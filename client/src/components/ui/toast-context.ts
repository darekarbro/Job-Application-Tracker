import { createContext } from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastPayload {
  title: string;
  message?: string;
  variant?: ToastVariant;
  durationMs?: number;
}

export interface ToastContextValue {
  showToast: (payload: ToastPayload) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
