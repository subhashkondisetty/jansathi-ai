/**
 * @fileoverview Zod validation schemas for Source administrative endpoints.
 */

import { z } from 'zod';
import { SOURCE_TYPES, DOC_TYPES, DOC_CATEGORIES } from '../config/constants.js';

/**
 * Checks whether a hostname matches private, loopback, or link-local IP patterns.
 *
 * @param {string} hostname - Hostname from parsed URL.
 * @returns {boolean} True if hostname is private or loopback.
 */
export const isDisallowedHostname = (hostname) => {
  const lower = (hostname || '').toLowerCase();
  if (lower === 'localhost' || lower === '127.0.0.1' || lower === '::1') {
    return true;
  }

  // IPv4 private ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16, 127.0.0.0/8)
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = lower.match(ipv4Regex);
  if (match) {
    const [, a, b] = match.map(Number);
    if (a === 127) return true; // loopback
    if (a === 10) return true; // Class A private
    if (a === 172 && b >= 16 && b <= 31) return true; // Class B private
    if (a === 192 && b === 168) return true; // Class C private
    if (a === 169 && b === 254) return true; // Link-local
    if (a === 0) return true;
  }

  return false;
};

export const sourceUrlSchema = z
  .string({ required_error: 'Source URL is required' })
  .trim()
  .max(2048, 'URL cannot exceed 2048 characters')
  .refine(
    (val) => {
      try {
        const parsed = new URL(val);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'Source URL must begin with http:// or https://' }
  )
  .refine(
    (val) => {
      try {
        const parsed = new URL(val);
        return !parsed.username && !parsed.password;
      } catch {
        return false;
      }
    },
    { message: 'Source URL cannot contain embedded credentials' }
  )
  .refine(
    (val) => {
      try {
        const parsed = new URL(val);
        return !isDisallowedHostname(parsed.hostname);
      } catch {
        return false;
      }
    },
    { message: 'Source URL hostname cannot be localhost or a private IP address' }
  );

export const createSourceSchema = z
  .object({
    name: z
      .string({ required_error: 'Source name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(200, 'Name cannot exceed 200 characters'),
    url: sourceUrlSchema,
    sourceType: z.enum(SOURCE_TYPES, {
      errorMap: () => ({ message: 'Invalid source type' }),
    }),
    issuingAuthority: z
      .string({ required_error: 'Issuing authority is required' })
      .trim()
      .min(2, 'Issuing authority must be at least 2 characters')
      .max(200, 'Issuing authority cannot exceed 200 characters'),
    docType: z.enum(DOC_TYPES).default('other'),
    category: z.enum(DOC_CATEGORIES).default('other'),
    notes: z.string().trim().max(500, 'Notes cannot exceed 500 characters').optional(),
  })
  .strict();

export const updateSourceSchema = z
  .object({
    name: z.string().trim().min(2).max(200).optional(),
    url: sourceUrlSchema.optional(),
    sourceType: z.enum(SOURCE_TYPES).optional(),
    issuingAuthority: z.string().trim().min(2).max(200).optional(),
    docType: z.enum(DOC_TYPES).optional(),
    category: z.enum(DOC_CATEGORIES).optional(),
    notes: z.string().trim().max(500).nullable().optional(),
  })
  .strict();

export const updateSourceStatusSchema = z
  .object({
    isActive: z.boolean({ required_error: 'isActive boolean flag is required' }),
  })
  .strict();

export const listSourcesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  isActive: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      if (typeof val === 'boolean') return val;
      return val === 'true';
    }),
  category: z.enum(DOC_CATEGORIES).optional(),
  q: z.string().trim().max(100).optional(),
});
