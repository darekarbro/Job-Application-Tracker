import { httpClient } from '../../services/http';
import type { ApiResponse } from '../../types/api';
import { getApiErrorMessage } from '../../utils/api-error';
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
  return getApiErrorMessage(error, 'Unable to process application request right now.');
};
