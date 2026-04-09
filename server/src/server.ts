import { app } from './app';
import { connectToDatabase } from './config/db';
import { env } from './config/env';

const logFatalError = (label: string, error: unknown): void => {
  const details = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(`[${label}]`, details);
};

const startServer = async (): Promise<void> => {
  try {
    await connectToDatabase();

    app.listen(env.PORT, () => {
      console.log(`API server listening on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    logFatalError('STARTUP_ERROR', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason) => {
  logFatalError('UNHANDLED_REJECTION', reason);
});

process.on('uncaughtException', (error) => {
  logFatalError('UNCAUGHT_EXCEPTION', error);
});

void startServer();
