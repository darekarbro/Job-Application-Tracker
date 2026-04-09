import { Request, Response } from 'express';

import { HTTP_STATUS } from '../constants/http-status';
import * as applicationService from '../services/application.service';
import { AuthenticatedRequest } from '../types/request.types';
import {
  applicationStatusSchema,
  createApplicationSchema,
  updateApplicationSchema,
} from '../validations/application.validation';

const getUserId = (req: Request): string => {
  return (req as AuthenticatedRequest).userId;
};

const getApplicationId = (req: Request): string => {
  const idParam = req.params.id;

  if (Array.isArray(idParam)) {
    return idParam[0] ?? '';
  }

  return idParam;
};

export const createApplication = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const input = createApplicationSchema.parse(req.body);
  const created = await applicationService.createApplication(getUserId(req), input);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Application created successfully',
    data: created,
  });
};

export const getApplications = async (req: Request, res: Response): Promise<void> => {
  const status = req.query.status
    ? applicationStatusSchema.parse(req.query.status)
    : undefined;

  const applications = await applicationService.getApplications(getUserId(req), status);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Applications fetched successfully',
    data: applications,
  });
};

export const getApplicationById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const application = await applicationService.getApplicationById(
    getUserId(req),
    getApplicationId(req),
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Application fetched successfully',
    data: application,
  });
};

export const updateApplication = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const input = updateApplicationSchema.parse(req.body);
  const updated = await applicationService.updateApplication(
    getUserId(req),
    getApplicationId(req),
    input,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Application updated successfully',
    data: updated,
  });
};

export const deleteApplication = async (
  req: Request,
  res: Response,
): Promise<void> => {
  await applicationService.deleteApplication(getUserId(req), getApplicationId(req));

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Application deleted successfully',
    data: null,
  });
};
