import axios from 'axios';

import { httpClient } from '../../services/http';
import type { ApiResponse } from '../../types/api';
import type { AuthPayload, LoginInput, RegisterInput } from './auth.types';

const AUTH_ENDPOINT = '/auth';

const unwrap = <T>(response: ApiResponse<T>): T => {
  return response.data;
};

export const registerUser = async (input: RegisterInput): Promise<AuthPayload> => {
  const response = await httpClient.post<ApiResponse<AuthPayload>>(
    `${AUTH_ENDPOINT}/register`,
    input,
  );

  return unwrap(response.data);
};

export const loginUser = async (input: LoginInput): Promise<AuthPayload> => {
  const response = await httpClient.post<ApiResponse<AuthPayload>>(
    `${AUTH_ENDPOINT}/login`,
    input,
  );

  return unwrap(response.data);
};

export const fetchCurrentUser = async (): Promise<AuthPayload | null> => {
  try {
    const response = await httpClient.get<ApiResponse<AuthPayload>>(
      `${AUTH_ENDPOINT}/me`,
    );

    return unwrap(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null;
    }

    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  await httpClient.post(`${AUTH_ENDPOINT}/logout`);
};

export const getAuthErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message =
      (error.response?.data as { message?: string } | undefined)?.message;

    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }

  return 'Something went wrong. Please try again.';
};
