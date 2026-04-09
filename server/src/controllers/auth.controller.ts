import { CookieOptions, Request, Response } from 'express';

import { env } from '../config/env';
import { HTTP_STATUS } from '../constants/http-status';
import * as authService from '../services/auth.service';
import { AuthenticatedRequest } from '../types/request.types';
import { loginSchema, registerSchema } from '../validations/auth.validation';

const getAuthCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: env.JWT_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
});

const setAuthCookie = (res: Response, token: string): void => {
  res.cookie(env.JWT_COOKIE_NAME, token, getAuthCookieOptions());
};

const clearAuthCookie = (res: Response): void => {
  const { path, sameSite, secure, httpOnly } = getAuthCookieOptions();

  res.clearCookie(env.JWT_COOKIE_NAME, {
    path,
    sameSite,
    secure,
    httpOnly,
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const input = registerSchema.parse(req.body);
  const result = await authService.register(input);
  setAuthCookie(res, result.accessToken);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: result.user,
    },
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input);
  setAuthCookie(res, result.accessToken);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Login successful',
    data: {
      user: result.user,
    },
  });
};

export const me = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await authService.getCurrentUser(userId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Authenticated user fetched',
    data: result,
  });
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  clearAuthCookie(res);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Logout successful',
    data: null,
  });
};
