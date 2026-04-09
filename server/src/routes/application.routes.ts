import { Router } from 'express';

import * as applicationController from '../controllers/application.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/async-handler';

const applicationRouter = Router();

applicationRouter.use(authMiddleware);

applicationRouter.post('/', asyncHandler(applicationController.createApplication));
applicationRouter.get('/', asyncHandler(applicationController.getApplications));
applicationRouter.get('/:id', asyncHandler(applicationController.getApplicationById));
applicationRouter.patch('/:id', asyncHandler(applicationController.updateApplication));
applicationRouter.delete('/:id', asyncHandler(applicationController.deleteApplication));

export { applicationRouter };
