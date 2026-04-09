import { Router } from 'express';

import * as authController from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/async-handler';

const authRouter = Router();

authRouter.post('/register', asyncHandler(authController.register));
authRouter.post('/login', asyncHandler(authController.login));
authRouter.get('/me', authMiddleware, asyncHandler(authController.me));
authRouter.post('/logout', asyncHandler(authController.logout));

export { authRouter };
