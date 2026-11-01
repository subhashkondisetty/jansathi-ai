/**
 * @fileoverview Zod validation schemas for Document endpoints.
 */

import { z } from 'zod';
import {
  DOC_TYPES,
  DOC_CATEGORIES,
  VISIBILITY,
  LANGUAGES,
  DOC_STATUS,
} from '../config/constants.js';
import { objectId } from './common.js';

export const documentIdParamSchema = z.object({
  id: objectId,
});

const SORT_WHITELIST = [
  'createdAt',
  '-createdAt',
  'publishedAt',
  '-publishedAt',
  'title',
  '-title',
  'fetchedAt',
  '-fetchedAt',
];

export const uploadMetadataSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(300).optional(),
  issuingAuthority: z.string().trim().max(200).optional(),
  sourceUrl: z
    .string()
    .trim()
    .max(2048)
    .refine(
      (val) => {
        if (!val) return true;
        try {
          const parsed = new URL(val);
          return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
          return false;
        }
      },
      { message: 'Source URL must begin with http:// or https://' }
    )
    .optional(),
  publishedAt: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const d = new Date(val);
        return !isNaN(d.getTime()) && d <= new Date();
      },
      { message: 'publishedAt must be a valid date not in the future' }
    ),
  docType: z.enum(DOC_TYPES).default('other'),
  category: z.enum(DOC_CATEGORIES).default('other'),
  language: z.enum([...LANGUAGES, 'unknown']).default('unknown'),
  visibility: z.enum(VISIBILITY).optional(),
});

export const listDocumentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(100).optional(),
  category: z.enum(DOC_CATEGORIES).optional(),
  docType: z.enum(DOC_TYPES).optional(),
  issuingAuthority: z.string().trim().max(200).optional(),
  language: z.enum([...LANGUAGES, 'unknown']).optional(),
  status: z.enum(DOC_STATUS).optional(),
  publishedFrom: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(new Date(val).getTime()), {
      message: 'Invalid publishedFrom date',
    }),
  publishedTo: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(new Date(val).getTime()), {
      message: 'Invalid publishedTo date',
    }),
  includeOlderVersions: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (val === undefined) return false;
      if (typeof val === 'boolean') return val;
      return val === 'true';
    }),
  scope: z.enum(['library', 'mine', 'all']).default('library'),
  sort: z
    .string()
    .optional()
    .refine((val) => !val || SORT_WHITELIST.includes(val), {
      message: `Sort must be one of: ${SORT_WHITELIST.join(', ')}`,
    })
    .default('-createdAt'),
});

export const documentPagesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(20, 'Maximum 20 pages per request').default(10),
});

export const adminUpdateDocumentSchema = z
  .object({
    title: z.string().trim().min(2).max(300).optional(),
    issuingAuthority: z.string().trim().max(200).optional(),
    sourceUrl: z
      .string()
      .trim()
      .max(2048)
      .refine(
        (val) => {
          if (!val) return true;
          try {
            const parsed = new URL(val);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
          } catch {
            return false;
          }
        },
        { message: 'Source URL must begin with http:// or https://' }
      )
      .optional(),
    publishedAt: z
      .string()
      .nullable()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          const d = new Date(val);
          return !isNaN(d.getTime()) && d <= new Date();
        },
        { message: 'publishedAt must be a valid date not in the future' }
      ),
    lastUpdatedAt: z
      .string()
      .nullable()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          const d = new Date(val);
          return !isNaN(d.getTime());
        },
        { message: 'lastUpdatedAt must be a valid date' }
      ),
    docType: z.enum(DOC_TYPES).optional(),
    category: z.enum(DOC_CATEGORIES).optional(),
    language: z.enum([...LANGUAGES, 'unknown']).optional(),
  })
  .strict();
