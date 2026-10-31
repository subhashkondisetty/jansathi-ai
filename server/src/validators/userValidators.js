/**
 * @fileoverview Zod validation schemas for user profile operations.
 */

import { z } from 'zod';
import {
  LANGUAGES,
  USER_CATEGORIES,
  EDUCATION_LEVELS,
  INCOME_RANGES,
  INDIAN_STATES_AND_UTS,
} from '../config/constants.js';

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(80, 'Name cannot exceed 80 characters')
      .optional(),
    preferredLanguage: z.enum(LANGUAGES).optional(),
    state: z.enum(INDIAN_STATES_AND_UTS).nullable().optional(),
    district: z
      .string()
      .trim()
      .max(80, 'District cannot exceed 80 characters')
      .nullable()
      .optional(),
    userCategory: z.enum(USER_CATEGORIES).optional(),
    educationLevel: z.enum(EDUCATION_LEVELS).nullable().optional(),
    courseOrOccupation: z
      .string()
      .trim()
      .max(100, 'Course or occupation cannot exceed 100 characters')
      .nullable()
      .optional(),
    annualFamilyIncomeRange: z.enum(INCOME_RANGES).nullable().optional(),
  })
  .strict()
  .refine(
    (data) => {
      // If state is explicitly set to null, district cannot be a non-null string
      if (data.state === null && data.district) {
        return false;
      }
      return true;
    },
    {
      message: 'District requires state to be set',
      path: ['district'],
    }
  );
