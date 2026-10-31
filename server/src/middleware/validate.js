import { ApiError } from '../utils/ApiError.js';

const safeAssign = (req, property, value) => {
  try {
    req[property] = value;
  } catch {
    Object.defineProperty(req, property, {
      value,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }
};

export const validate = ({ body, query, params } = {}) => {
  return (req, res, next) => {
    const details = [];

    if (body) {
      const result = body.safeParse(req.body);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          details.push({
            target: 'body',
            path: issue.path.length > 0 ? issue.path.join('.') : 'body',
            message: issue.message,
          });
        });
      } else {
        safeAssign(req, 'body', result.data);
      }
    }

    if (query) {
      const result = query.safeParse(req.query);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          details.push({
            target: 'query',
            path: issue.path.length > 0 ? issue.path.join('.') : 'query',
            message: issue.message,
          });
        });
      } else {
        safeAssign(req, 'query', result.data);
      }
    }

    if (params) {
      const result = params.safeParse(req.params);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          details.push({
            target: 'params',
            path: issue.path.length > 0 ? issue.path.join('.') : 'params',
            message: issue.message,
          });
        });
      } else {
        safeAssign(req, 'params', result.data);
      }
    }

    if (details.length > 0) {
      return next(new ApiError(400, 'VALIDATION_ERROR', 'Request validation failed', details));
    }

    return next();
  };
};

export default validate;
