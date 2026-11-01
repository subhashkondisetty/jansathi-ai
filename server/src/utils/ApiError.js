export class ApiError extends Error {
  constructor(status, code, message, details = undefined) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusCode = status;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotImplementedError extends ApiError {
  constructor(feature = 'Feature') {
    super(501, 'NOT_IMPLEMENTED', `${feature} is not implemented yet`);
    this.name = 'NotImplementedError';
  }
}

export default ApiError;
