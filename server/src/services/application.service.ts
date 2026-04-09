import { HTTP_STATUS } from '../constants/http-status';
import { JobApplicationDocument, JobApplicationModel } from '../models/job-application.model';
import { ApplicationStatus } from '../types/application.types';
import { ApiError } from '../utils/api-error';
import {
  CreateApplicationInput,
  UpdateApplicationInput,
} from '../validations/application.validation';

const normalizeOptionalString = (value?: string): string | undefined => {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  return trimmed;
};

const sanitizeCreateInput = (input: CreateApplicationInput) => ({
  ...input,
  jdLink: normalizeOptionalString(input.jdLink),
  notes: normalizeOptionalString(input.notes),
  salaryRange: normalizeOptionalString(input.salaryRange),
});

const sanitizeUpdateInput = (input: UpdateApplicationInput): UpdateApplicationInput => ({
  ...input,
  jdLink: normalizeOptionalString(input.jdLink),
  notes: normalizeOptionalString(input.notes),
  salaryRange: normalizeOptionalString(input.salaryRange),
});

const toResponse = (application: JobApplicationDocument) => ({
  id: application._id.toString(),
  userId: application.userId.toString(),
  company: application.company,
  role: application.role,
  jdLink: application.jdLink,
  notes: application.notes,
  dateApplied: application.dateApplied,
  status: application.status,
  salaryRange: application.salaryRange,
  createdAt: application.createdAt,
  updatedAt: application.updatedAt,
});

export const createApplication = async (
  userId: string,
  input: CreateApplicationInput,
) => {
  const createdApplication = await JobApplicationModel.create({
    ...sanitizeCreateInput(input),
    userId,
    status: input.status ?? 'applied',
  });

  return toResponse(createdApplication);
};

export const getApplications = async (
  userId: string,
  status?: ApplicationStatus,
) => {
  const query: { userId: string; status?: ApplicationStatus } = { userId };

  if (status) {
    query.status = status;
  }

  const applications = await JobApplicationModel.find(query)
    .sort({ dateApplied: -1, createdAt: -1 })
    .exec();

  return applications.map(toResponse);
};

export const getApplicationById = async (userId: string, id: string) => {
  const application = await JobApplicationModel.findOne({
    _id: id,
    userId,
  }).exec();

  if (!application) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Application not found');
  }

  return toResponse(application);
};

export const updateApplication = async (
  userId: string,
  id: string,
  input: UpdateApplicationInput,
) => {
  const sanitizedInput = sanitizeUpdateInput(input);

  const application = await JobApplicationModel.findOneAndUpdate(
    { _id: id, userId },
    sanitizedInput,
    { new: true },
  ).exec();

  if (!application) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Application not found');
  }

  return toResponse(application);
};

export const deleteApplication = async (userId: string, id: string): Promise<void> => {
  const deleted = await JobApplicationModel.findOneAndDelete({ _id: id, userId }).exec();

  if (!deleted) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Application not found');
  }
};
