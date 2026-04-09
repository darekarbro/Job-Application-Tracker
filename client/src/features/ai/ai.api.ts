import { httpClient } from '../../services/http';
import type { ApiResponse } from '../../types/api';
import { getApiErrorMessage } from '../../utils/api-error';
import type {
  ParseJobDescriptionInput,
  ParsedJobDescription,
  ResumeBulletsResult,
  SuggestResumeBulletsInput,
} from './ai.types';

export const parseJobDescription = async (
  input: ParseJobDescriptionInput,
): Promise<ParsedJobDescription> => {
  const response = await httpClient.post<ApiResponse<ParsedJobDescription>>(
    '/ai/parse-job-description',
    input,
  );

  return response.data.data;
};

export const suggestResumeBullets = async (
  input: SuggestResumeBulletsInput,
): Promise<ResumeBulletsResult> => {
  const response = await httpClient.post<ApiResponse<ResumeBulletsResult>>(
    '/ai/resume-bullets',
    input,
  );

  return response.data.data;
};

export const getAiErrorMessage = (error: unknown): string => {
  return getApiErrorMessage(error, 'Unable to process AI request right now.');
};

export const getAiParseErrorMessage = (error: unknown): string => {
  return getAiErrorMessage(error);
};
