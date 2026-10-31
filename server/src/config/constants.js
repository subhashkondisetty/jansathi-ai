/**
 * @fileoverview Frozen system enums, options lists, Indian administrative divisions,
 * error codes, and pagination constraints for JanSathi AI.
 */

// User and Access Enums
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

// Document and Content Enums
export const DOC_TYPES = Object.freeze([
  'scheme',
  'notification',
  'circular',
  'guideline',
  'act',
  'other',
]);

export const DOC_CATEGORIES = Object.freeze([
  'scholarship',
  'education',
  'agriculture',
  'business',
  'health',
  'housing',
  'employment',
  'legal',
  'other',
]);

export const DOC_STATUS = Object.freeze(['pending', 'processing', 'ready', 'failed', 'needs_ocr']);

export const DOC_ORIGIN = Object.freeze(['uploaded', 'fetched']);

export const VISIBILITY = Object.freeze(['public', 'private']);

export const SOURCE_TYPES = Object.freeze(['pdf', 'html']);

// Ingestion and Processing Jobs
export const JOB_TYPES = Object.freeze(['upload', 'source_fetch']);

export const JOB_STATUS = Object.freeze([
  'queued',
  'running',
  'succeeded',
  'failed',
  'skipped_duplicate',
]);

export const JOB_STAGES = Object.freeze([
  'queued',
  'fetching',
  'extracting',
  'cleaning',
  'chunking',
  'storing',
  'done',
]);

// AI Claim Verification and Conversation Enums
export const CLAIM_ASSESSMENTS = Object.freeze(['supported', 'contradicted', 'unverified']);

export const MESSAGE_ROLES = Object.freeze(['user', 'assistant']);

export const CONVERSATION_MODES = Object.freeze(['ask', 'eligibility', 'document']);

export const AUDIT_OUTCOMES = Object.freeze(['success', 'failure']);

// Option Lists for Client Consumption (served by GET /api/meta/options)
export const LANGUAGE_OPTIONS = Object.freeze([
  { value: 'en', label: 'English', nativeLabel: 'English' },
  { value: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { value: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { value: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
]);

export const USER_CATEGORY_OPTIONS = Object.freeze([
  { value: 'student', label: 'Student' },
  { value: 'farmer', label: 'Farmer' },
  { value: 'business_owner', label: 'Business Owner' },
  { value: 'senior_citizen', label: 'Senior Citizen' },
  { value: 'general_citizen', label: 'General Citizen' },
]);

export const EDUCATION_LEVEL_OPTIONS = Object.freeze([
  { value: 'class_10', label: 'Class 10' },
  { value: 'class_12', label: 'Class 12' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'postgraduate', label: 'Postgraduate' },
  { value: 'doctorate', label: 'Doctorate' },
  { value: 'other', label: 'Other' },
]);

export const INCOME_RANGE_OPTIONS = Object.freeze([
  { value: 'below_1_lakh', label: 'Below ₹1 Lakh' },
  { value: '1_to_2_5_lakh', label: '₹1 Lakh to ₹2.5 Lakh' },
  { value: '2_5_to_5_lakh', label: '₹2.5 Lakh to ₹5 Lakh' },
  { value: '5_to_8_lakh', label: '₹5 Lakh to ₹8 Lakh' },
  { value: 'above_8_lakh', label: 'Above ₹8 Lakh' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]);

export const DOC_TYPE_OPTIONS = Object.freeze([
  { value: 'scheme', label: 'Scheme' },
  { value: 'notification', label: 'Notification' },
  { value: 'circular', label: 'Circular' },
  { value: 'guideline', label: 'Guideline' },
  { value: 'act', label: 'Act' },
  { value: 'other', label: 'Other' },
]);

export const DOC_CATEGORY_OPTIONS = Object.freeze([
  { value: 'scholarship', label: 'Scholarship' },
  { value: 'education', label: 'Education' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'business', label: 'Business' },
  { value: 'health', label: 'Health' },
  { value: 'housing', label: 'Housing' },
  { value: 'employment', label: 'Employment' },
  { value: 'legal', label: 'Legal' },
  { value: 'other', label: 'Other' },
]);

// All 28 Indian States and 8 Union Territories
export const INDIAN_STATES_AND_UTS = Object.freeze([
  // 28 States
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  // 8 Union Territories
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
]);

// HTTP Error Code Mappings
export const ERROR_CODES = Object.freeze({
  VALIDATION_ERROR: 400,
  INVALID_CREDENTIALS: 401,
  UNAUTHENTICATED: 401,
  TOKEN_EXPIRED: 401,
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

// Pagination Defaults
export const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});
