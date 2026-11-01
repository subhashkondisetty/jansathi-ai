import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { sendError } from '../utils/response.js';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let status = err.status || err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'An unexpected error occurred';
  let details = err.details || undefined;

  // 1. Operational ApiError
  if (err instanceof ApiError || err.name === 'ApiError') {
    status = err.status || 500;
    code = err.code || 'INTERNAL_ERROR';
    message = err.message;
    details = Array.isArray(err.details)
      ? err.details.map((d) =>
          d && typeof d === 'object' && d.path && !d.field
            ? { field: d.path, message: d.message }
            : d
        )
      : err.details;
  }
  // 2. Zod validation error
  else if (err instanceof ZodError || err.name === 'ZodError') {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation error';
    details = err.issues?.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
  }
  // 3. Mongoose ValidationError
  else if (err.name === 'ValidationError') {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = 'Database validation failed';
    details = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }
  // 4. Mongoose CastError (invalid ObjectId or type casting)
  else if (err.name === 'CastError') {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = `Invalid value for ${err.path}: ${err.value}`;
    details = [
      {
        field: err.path,
        message: `Invalid value for field ${err.path}`,
      },
    ];
  }
  // 5. MongoDB duplicate key error (code 11000)
  else if (err.code === 11000) {
    status = 409;
    code = 'CONFLICT';
    message = 'Resource conflict: duplicate entry exists';
    details = err.keyValue ? { duplicateField: err.keyValue } : undefined;
  }
  // 6. JWT errors
  else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401;
    code = err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'UNAUTHENTICATED';
    message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid or malformed token';
  }
  // 7. Multer errors
  else if (err.code === 'LIMIT_FILE_SIZE') {
    status = 413;
    code = 'PAYLOAD_TOO_LARGE';
    message = 'Uploaded file exceeds maximum allowable size';
  } else if (err.name === 'MulterError') {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = err.message || 'File upload validation failed';
  }
  // 8. Body Parser / Express JSON parse error
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = 'Malformed JSON payload';
  }
  // 9. Payload entity too large
  else if (err.type === 'entity.too.large' || err.status === 413) {
    status = 413;
    code = 'PAYLOAD_TOO_LARGE';
    message = 'Request payload exceeds maximum allowable limit';
  }

  // Mask internal 500 error messages in production (501 NOT_IMPLEMENTED is an explicit contract)
  if (status >= 500 && status !== 501) {
    logger.error(
      {
        err,
        requestId: req.id,
        method: req.method,
        url: req.originalUrl ? req.originalUrl.split('?')[0] : '',
      },
      'Unhandled server error'
    );

    if (env.NODE_ENV === 'production') {
      message = 'Internal server error';
      details = undefined;
    }
  }

  if (status === 501) {
    details = undefined;
  }

  return sendError(
    res,
    {
      code,
      message,
      details,
      requestId: req.id,
    },
    status
  );
};

export default errorHandler;
