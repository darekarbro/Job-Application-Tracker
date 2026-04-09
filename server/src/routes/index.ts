import { Router } from 'express';

import { aiRouter } from './ai.routes';
import { applicationRouter } from './application.routes';
import { authRouter } from './auth.routes';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/applications', applicationRouter);
apiRouter.use('/ai', aiRouter);

export { apiRouter };
