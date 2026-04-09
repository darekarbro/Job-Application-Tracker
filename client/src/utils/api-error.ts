import axios from 'axios';

interface ApiErrorResponse {
  message?: string;
}

export const getApiErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as ApiErrorResponse | undefined)?.message;

    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }

    if (typeof error.message === 'string' && error.message.trim().length > 0) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallbackMessage;
};
