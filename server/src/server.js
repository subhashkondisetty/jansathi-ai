import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDb, disconnectDb } from './config/db.js';
import { logger } from './utils/logger.js';

// Global process error handlers
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception encountered');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.fatal({ reason, promise }, 'Unhandled promise rejection encountered');
  process.exit(1);
});

const startServer = async () => {
  try {
    await connectDb();
  } catch (err) {
    logger.error({ err }, 'Initial database connection failed');
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`JanSathi AI Server listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });

  const shutdown = async (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      logger.info('HTTP server closed successfully.');
      try {
        await disconnectDb();
      } catch (err) {
        logger.error({ err }, 'Error disconnecting database during shutdown');
      }
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forceful shutdown triggered after timeout.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

startServer();
