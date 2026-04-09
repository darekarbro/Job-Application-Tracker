import { Request, Response } from 'express';

import { HTTP_STATUS } from '../constants/http-status';

export const notFoundMiddleware = (req: Request, res: Response): void => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};
