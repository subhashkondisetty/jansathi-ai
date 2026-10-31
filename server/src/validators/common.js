import { z } from 'zod';
import { PAGINATION } from '../config/constants.js';

// Valid 24-character hex MongoDB ObjectId
export const objectId = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId format');

// Standard pagination query parameters with coercion and bounds
export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(PAGINATION.MAX_LIMIT, `Limit cannot exceed ${PAGINATION.MAX_LIMIT}`)
    .default(PAGINATION.DEFAULT_LIMIT),
});

// Trimmed string with configurable length constraints
export const trimmedString = (min = 1, max = 255) =>
  z
    .string()
    .trim()
    .min(min, `Must be at least ${min} character(s)`)
    .max(max, `Must not exceed ${max} character(s)`);

// Valid ISO-8601 UTC date string
export const isoDate = z
  .string()
  .trim()
  .datetime({ message: 'Must be a valid ISO-8601 date string' });
