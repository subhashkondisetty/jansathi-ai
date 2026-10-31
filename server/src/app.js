import express from 'express';
import { env } from './config/env.js';
import { requestId } from './middleware/requestId.js';
import { httpLogger } from './utils/logger.js';
import {
  helmetMiddleware,
  corsMiddleware,
  sanitizeMiddleware,
  hppMiddleware,
} from './middleware/security.js';
import { globalLimiter } from './middleware/rateLimiters.js';
import routes from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

export const createApp = () => {
  const app = express();

  // Support reverse proxy headers if configured
  if (env.TRUST_PROXY) {
    app.set('trust proxy', env.TRUST_PROXY);
  }

  // 1. Request ID
  app.use(requestId);

  // 2. HTTP Request Logger
  app.use(httpLogger);

  // 3. Helmet security headers
  app.use(helmetMiddleware);

  // 4. CORS allowlist
  app.use(corsMiddleware);

  // 5. Body parser: JSON with BODY_LIMIT (urlencoded is OFF)
  app.use(express.json({ limit: env.BODY_LIMIT }));

  // 6. NoSQL query sanitization
  app.use(sanitizeMiddleware);

  // 7. HTTP Parameter Pollution prevention
  app.use(hppMiddleware);

  // 8. Global rate limiter
  app.use(globalLimiter);

  // AUTH-HOOK

  // 9. API routes
  app.use('/api', routes);

  // 10. 404 Not Found handler
  app.use(notFound);

  // 11. Centralized error handler
  app.use(errorHandler);

  return app;
};

export default createApp;
