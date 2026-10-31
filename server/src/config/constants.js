export const ROLES = Object.freeze(['citizen', 'admin']);

export const LANGUAGES = Object.freeze(['en', 'te', 'hi', 'ta']);

export const USER_CATEGORIES = Object.freeze([
  'student',
  'farmer',
  'business_owner',
  'senior_citizen',
  'general_citizen',
]);

export const EDUCATION_LEVELS = Object.freeze([
  'below_10th',
  'class_10',
  'class_12',
  'diploma',
  'undergraduate',
  'postgraduate',
  'doctorate',
  'other',
]);

export const INCOME_RANGES = Object.freeze([
  'below_1_lakh',
  '1_to_2_5_lakh',
  '2_5_to_5_lakh',
  '5_to_8_lakh',
  'above_8_lakh',
  'prefer_not_to_say',
]);

export const DOCUMENT_TYPES = Object.freeze([
  'scheme',
  'notification',
  'act',
  'circular',
  'guidelines',
  'other',
]);

export const DOCUMENT_STATUS = Object.freeze(['pending', 'processing', 'ingested', 'failed']);

export const VISIBILITY = Object.freeze(['public', 'private']);

export const ORIGINS = Object.freeze(['upload', 'source_url']);

export const CONTENT_TYPES = Object.freeze(['pdf', 'html']);

export const JOB_STATUS = Object.freeze(['queued', 'running', 'succeeded', 'failed']);

export const JOB_TRIGGERS = Object.freeze(['upload', 'source_fetch', 'retry']);

export const ERROR_CODES = Object.freeze({
  VALIDATION_ERROR: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  SERVICE_UNAVAILABLE: 503,
});

export const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 50,
});
