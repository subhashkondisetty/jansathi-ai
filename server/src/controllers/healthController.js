import { env } from '../config/env.js';
import { isDbReady } from '../config/db.js';
import { sendSuccess } from '../utils/response.js';
import { ApiError } from '../utils/ApiError.js';

// GET /api/health - Liveness probe
export const getHealth = (req, res) => {
  const dbStatus = isDbReady() ? 'connected' : 'disconnected';

  return sendSuccess(res, {
    status: 'ok',
    service: 'jansathi-ai-server',
    environment: env.NODE_ENV,
    database: dbStatus,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
};

// GET /api/health/ready - Readiness probe
export const getReadiness = (req, res, next) => {
  const ready = isDbReady();

  if (!ready) {
    return next(
      new ApiError(503, 'SERVICE_UNAVAILABLE', 'Database is not ready', {
        database: 'disconnected',
      })
    );
  }

  return sendSuccess(res, {
    status: 'ready',
    service: 'jansathi-ai-server',
    database: 'connected',
    timestamp: new Date().toISOString(),
  });
};
