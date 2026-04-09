import { Request, Response } from 'express';

import { HTTP_STATUS } from '../constants/http-status';
import * as aiService from '../services/ai.service';
import {
  parseJobDescriptionSchema,
  resumeBulletsSchema,
} from '../validations/ai.validation';

export const parseJobDescription = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const input = parseJobDescriptionSchema.parse(req.body);
  const result = await aiService.parseJobDescription(input);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
};

export const suggestResumeBullets = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const input = resumeBulletsSchema.parse(req.body);
  const result = await aiService.suggestResumeBullets(input);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
};
