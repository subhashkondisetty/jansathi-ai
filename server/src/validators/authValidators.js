/**
 * @fileoverview Zod validation schemas for authentication endpoints.
 */

import { z } from 'zod';
import { LANGUAGES, USER_CATEGORIES, INDIAN_STATES_AND_UTS } from '../config/constants.js';

export const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password cannot exceed 72 characters')
  .refine((p) => p.trim() === p, {
    message: 'Password cannot contain leading or trailing whitespace',
  })
  .refine((p) => /[a-zA-Z]/.test(p) && /\d/.test(p), {
    message: 'Password must contain at least one letter and one number',
  });

export const emailSchema = z
  .string({ required_error: 'Email is required' })
  .trim()
  .toLowerCase()
  .email('Invalid email address format')
  .max(254, 'Email cannot exceed 254 characters');

export const registerSchema = z
  .object({
    name: z
      .string({ required_error: 'Name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(80, 'Name cannot exceed 80 characters'),
    email: emailSchema,
    password: passwordSchema,
    preferredLanguage: z.enum(LANGUAGES).optional(),
    state: z.enum(INDIAN_STATES_AND_UTS).optional(),
    userCategory: z.enum(USER_CATEGORIES).optional(),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .toLowerCase()
      .max(254, 'Email cannot exceed 254 characters'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(1, 'Password cannot be empty')
      .max(72, 'Password cannot exceed 72 characters'),
  })
  .strict();
