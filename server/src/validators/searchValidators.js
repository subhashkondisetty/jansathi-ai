/**
 * @fileoverview Zod validation schema for keyword search endpoints.
 */

import { z } from 'zod';
import { DOC_CATEGORIES, DOC_TYPES, LANGUAGES } from '../config/constants.js';
import { objectId } from './common.js';

export const searchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(2, 'Search query must be at least 2 characters')
    .max(200, 'Search query cannot exceed 200 characters'),
  category: z.enum(DOC_CATEGORIES).optional(),
  docType: z.enum(DOC_TYPES).optional(),
  issuingAuthority: z.string().trim().max(200).optional(),
  language: z.enum([...LANGUAGES, 'unknown']).optional(),
  documentId: objectId.optional(),
  publishedFrom: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(new Date(val).getTime()), {
      message: 'Invalid publishedFrom date format',
    }),
  publishedTo: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(new Date(val).getTime()), {
      message: 'Invalid publishedTo date format',
    }),
  includeOlderVersions: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (val === undefined) return false;
      if (typeof val === 'boolean') return val;
      return val === 'true';
    }),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(20, 'Maximum 20 results per page').default(8),
});

export default {
  searchQuerySchema,
};
