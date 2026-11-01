/**
 * @fileoverview Zod validation schemas for IngestionJob management and querying.
 */

import { z } from 'zod';
import { JOB_STATUS, JOB_TYPES } from '../config/constants.js';
import { objectId } from './common.js';

export const listIngestionJobsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(JOB_STATUS).optional(),
  type: z.enum(JOB_TYPES).optional(),
  sourceId: objectId.optional(),
  documentId: objectId.optional(),
  sort: z.string().optional().default('-createdAt'),
});

export const ingestionJobIdParamSchema = z.object({
  id: objectId,
});

export default {
  listIngestionJobsQuerySchema,
  ingestionJobIdParamSchema,
};
