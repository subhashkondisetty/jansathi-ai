/**
 * @fileoverview Zod validation schemas for Source administrative endpoints.
 */

import { z } from 'zod';
import { SOURCE_TYPES, DOC_TYPES, DOC_CATEGORIES } from '../config/constants.js';
import { objectId } from './common.js';

export const sourceIdParamSchema = z.object({
  id: objectId,
});

/**
 * Checks whether a hostname matches private, loopback, link-local, cloud metadata, or reserved IP patterns.
 *
 * @param {string} hostname - Hostname from parsed URL.
 * @returns {boolean} True if hostname is disallowed.
 */
export const isDisallowedHostname = (hostname) => {
  const raw = (hostname || '').toLowerCase();
  const lower = raw.replace(/^\[|\]$/g, '');

  if (
    lower === 'localhost' ||
    lower === '127.0.0.1' ||
    lower === '0.0.0.0' ||
    lower === '::1' ||
    lower === '::' ||
    lower === 'metadata.google.internal' ||
    lower === 'instance-data'
  ) {
    return true;
  }

  // IPv6 loopback, link-local, unique-local, and IPv4-mapped IPv6 ranges
  if (
    lower.startsWith('fe80:') ||
    lower.startsWith('fc00:') ||
    (lower.startsWith('fd') && lower.includes(':')) ||
    lower.startsWith('::ffff:')
  ) {
    return true;
  }

  // IPv4 private, loopback, link-local, carrier-grade NAT, and reserved ranges
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = lower.match(ipv4Regex);
  if (match) {
    const [, a, b, c, d] = match.map(Number);
    if ([a, b, c, d].some((p) => p > 255)) return true;
    if (a === 0) return true; // Current network
    if (a === 127) return true; // Loopback (127.0.0.0/8)
    if (a === 10) return true; // Class A private (10.0.0.0/8)
    if (a === 172 && b >= 16 && b <= 31) return true; // Class B private (172.16.0.0/12)
    if (a === 192 && b === 168) return true; // Class C private (192.168.0.0/16)
    if (a === 169 && b === 254) return true; // Link-local / Cloud metadata (169.254.0.0/16)
    if (a === 100 && b >= 64 && b <= 127) return true; // Carrier-grade NAT (100.64.0.0/10)
    if (a >= 224) return true; // Multicast and reserved
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
