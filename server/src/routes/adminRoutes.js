/**
 * @fileoverview Administrator routes protected by authentication and admin role requirement.
 */

import { Router } from 'express';
import { getSession } from '../controllers/adminController.js';
import {
  createSource,
  listSources,
  getSourceById,
  updateSource,
  updateSourceStatus,
  deleteSource,
  triggerSourceIngest,
} from '../controllers/sourceController.js';
import { adminUpdateDocument } from '../controllers/documentController.js';
import {
  listIngestionJobs,
  getIngestionJob,
  retryIngestionJob,
} from '../controllers/ingestionController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  createSourceSchema,
  updateSourceSchema,
  updateSourceStatusSchema,
  listSourcesQuerySchema,
} from '../validators/sourceValidators.js';
import { adminUpdateDocumentSchema } from '../validators/documentValidators.js';
import {
  listIngestionJobsQuerySchema,
  ingestionJobIdParamSchema,
} from '../validators/ingestionValidators.js';

const router = Router();

// Apply authentication and admin role requirement across all admin routes
router.use(authenticate, requireRole('admin'));

router.get('/session', getSession);

// Source Management Routes
router.post('/sources', validate({ body: createSourceSchema }), createSource);
router.get('/sources', validate({ query: listSourcesQuerySchema }), listSources);
router.get('/sources/:id', getSourceById);
router.put('/sources/:id', validate({ body: updateSourceSchema }), updateSource);
router.patch(
  '/sources/:id/status',
  validate({ body: updateSourceStatusSchema }),
  updateSourceStatus
);
router.delete('/sources/:id', deleteSource);
router.post('/sources/:id/ingest', triggerSourceIngest);

// Document Administrative Routes
router.patch('/documents/:id', validate({ body: adminUpdateDocumentSchema }), adminUpdateDocument);

// Ingestion Jobs Administrative Routes
router.get('/ingestion-jobs', validate({ query: listIngestionJobsQuerySchema }), listIngestionJobs);
router.get('/ingestion-jobs/:id', validate({ params: ingestionJobIdParamSchema }), getIngestionJob);
router.post(
  '/ingestion-jobs/:id/retry',
  validate({ params: ingestionJobIdParamSchema }),
  retryIngestionJob
);

export default router;
