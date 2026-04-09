import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';

import { env } from '../config/env';
import { HTTP_STATUS } from '../constants/http-status';
import { ApiError } from '../utils/api-error';

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Malformed JSON request body',
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      issues: error.issues,
    });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Database validation failed',
      issues: Object.values(error.errors).map((item) => item.message),
    });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: `Invalid value for ${error.path}`,
    });
    return;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: number }).code === 11000
  ) {
    res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: 'Duplicate value violates a unique field constraint',
    });
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  const message =
    error instanceof Error ? error.message : 'An unexpected server error occurred';

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message,
    stack: env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
  });
};
