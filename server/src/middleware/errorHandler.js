import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, 'NOT_FOUND', `Route not found: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';

  if (status >= 500) {
    logger.error(
      { err, req: { method: req.method, url: req.originalUrl } },
      'Internal server error'
    );
  }

  const message =
    env.NODE_ENV === 'production' && status === 500
      ? 'Internal server error'
      : err.message || 'An unexpected error occurred';

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      ...(err.details ? { details: err.details } : {}),
    },
  });
};
