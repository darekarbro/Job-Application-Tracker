import { Router } from 'express';

import * as aiController from '../controllers/ai.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/async-handler';

const aiRouter = Router();

aiRouter.use(authMiddleware);

aiRouter.post('/parse-job-description', asyncHandler(aiController.parseJobDescription));
aiRouter.post('/resume-bullets', asyncHandler(aiController.suggestResumeBullets));

export { aiRouter };
