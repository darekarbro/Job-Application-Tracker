import { NextFunction, Request, Response } from 'express';

import { env } from '../config/env';
import { HTTP_STATUS } from '../constants/http-status';
import { AuthenticatedRequest } from '../types/request.types';
import { ApiError } from '../utils/api-error';
import { verifyAccessToken } from '../utils/jwt';

const getTokenFromRequest = (req: Request): string | null => {
  const header = req.headers.authorization;

  if (header?.startsWith('Bearer ')) {
    return header.slice('Bearer '.length).trim();
  }

  const cookies = req.cookies as Record<string, unknown> | undefined;
  const cookieToken = cookies?.[env.JWT_COOKIE_NAME];

  if (typeof cookieToken === 'string' && cookieToken.trim().length > 0) {
    return cookieToken.trim();
  }

  return null;
};

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const token = getTokenFromRequest(req);

  if (!token) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Missing authentication token');
  }

  let payload: ReturnType<typeof verifyAccessToken>;

  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired token');
  }

  if (typeof payload !== 'object' || payload === null || !('userId' in payload)) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid token payload');
  }

  const { userId } = payload;

  if (typeof userId !== 'string') {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid token user id');
  }

  (req as AuthenticatedRequest).userId = userId;
  next();
};
