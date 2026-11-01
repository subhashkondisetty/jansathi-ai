/**
 * @fileoverview Document catalog and upload routes.
 */

import { Router } from 'express';
import {
  uploadDocument,
  listDocuments,
  getFacets,
  getDocumentById,
  getDocumentPages,
  deleteDocument,
} from '../controllers/documentController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadLimiter } from '../middleware/rateLimiters.js';
import { uploadPdf } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import {
  uploadMetadataSchema,
  listDocumentsQuerySchema,
  documentPagesQuerySchema,
} from '../validators/documentValidators.js';

const router = Router();

// Gated for authenticated users
router.use(authenticate);

router.post(
  '/upload',
  uploadLimiter,
  uploadPdf,
  validate({ body: uploadMetadataSchema }),
  uploadDocument
);

router.get('/facets', getFacets);
router.get('/', validate({ query: listDocumentsQuerySchema }), listDocuments);
router.get('/:id', getDocumentById);
router.get('/:id/pages', validate({ query: documentPagesQuerySchema }), getDocumentPages);
router.delete('/:id', deleteDocument);

export default router;
