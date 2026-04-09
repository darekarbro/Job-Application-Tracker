import axios from 'axios';

import { httpClient } from '../../services/http';
import type { ApiResponse } from '../../types/api';
import type {
  CreateApplicationInput,
  JobApplication,
  UpdateApplicationInput,
} from '../../types/application';

const APPLICATIONS_ENDPOINT = '/applications';

const unwrap = <T>(response: ApiResponse<T>): T => {
  return response.data;
};

export const getApplications = async (): Promise<JobApplication[]> => {
  const response = await httpClient.get<ApiResponse<JobApplication[]>>(
    APPLICATIONS_ENDPOINT,
  );

  return unwrap(response.data);
};

export const createApplication = async (
  input: CreateApplicationInput,
): Promise<JobApplication> => {
  const response = await httpClient.post<ApiResponse<JobApplication>>(
    APPLICATIONS_ENDPOINT,
    input,
  );

  return unwrap(response.data);
};

export const updateApplication = async (
  id: string,
  input: UpdateApplicationInput,
): Promise<JobApplication> => {
  const response = await httpClient.patch<ApiResponse<JobApplication>>(
    `${APPLICATIONS_ENDPOINT}/${id}`,
    input,
  );

  return unwrap(response.data);
};

export const deleteApplication = async (id: string): Promise<void> => {
  await httpClient.delete(`${APPLICATIONS_ENDPOINT}/${id}`);
};

export const getApplicationErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message =
      (error.response?.data as { message?: string } | undefined)?.message;

    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }

  return 'Unable to process application request right now.';
};
