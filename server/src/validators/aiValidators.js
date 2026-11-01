/**
 * @fileoverview Zod validation schemas for AI interaction endpoints.
 * Enforces strict typing according to the JanSathi AI response contract.
 */

import { z } from 'zod';
import {
  LANGUAGES,
  DOC_CATEGORIES,
  DOC_TYPES,
  EDUCATION_LEVELS,
  USER_CATEGORIES,
  INCOME_RANGES,
  INDIAN_STATES_AND_UTS,
} from '../config/constants.js';
import { objectId } from './common.js';

export const askAiSchema = z
  .object({
    question: z
      .string()
      .trim()
      .min(3, 'Question must be at least 3 characters')
      .max(1000, 'Question cannot exceed 1000 characters'),
    language: z.enum(LANGUAGES).optional(),
    conversationId: objectId.optional(),
    documentId: objectId.optional(),
    filters: z
      .object({
        category: z.enum(DOC_CATEGORIES).optional(),
        docType: z.enum(DOC_TYPES).optional(),
        issuingAuthority: z.string().trim().max(200).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const eligibilityCheckSchema = z
  .object({
    query: z
      .string()
      .trim()
      .min(3, 'Query must be at least 3 characters')
      .max(500, 'Query cannot exceed 500 characters')
      .optional(),
    documentIds: z.array(objectId).max(5, 'Maximum 5 document IDs allowed').optional(),
    applicant: z
      .object({
        educationLevel: z.enum(EDUCATION_LEVELS).optional(),
        courseOrOccupation: z.string().trim().max(100).optional(),
        state: z.enum(INDIAN_STATES_AND_UTS).optional(),
        district: z.string().trim().max(100).optional(),
        userCategory: z.enum(USER_CATEGORIES).optional(),
        annualFamilyIncomeRange: z.enum(INCOME_RANGES).optional(),
        socialCategory: z.string().trim().max(50).optional(),
      })
      .strict()
      .default({}),
    language: z.enum(LANGUAGES).optional(),
  })
  .strict()
  .refine(
    (data) => {
      const hasQuery = Boolean(data.query && data.query.trim().length >= 3);
      const hasDocIds = Boolean(data.documentIds && data.documentIds.length > 0);
      return hasQuery || hasDocIds;
    },
    {
      message: 'At least one of query or documentIds is required for eligibility check',
      path: ['query'],
    }
  );

export const verifyClaimSchema = z
  .object({
    claim: z
      .string()
      .trim()
      .min(10, 'Claim must be at least 10 characters')
      .max(2000, 'Claim cannot exceed 2000 characters'),
    language: z.enum(LANGUAGES).optional(),
  })
  .strict();

export default {
  askAiSchema,
  eligibilityCheckSchema,
  verifyClaimSchema,
};
