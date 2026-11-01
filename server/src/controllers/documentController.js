/**
 * @fileoverview Document controller managing PDF uploads, catalog listing, facets, and lifecycle.
 */

import * as documentService from '../services/documentService.js';
import { logAudit } from '../services/auditService.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const uploadDocument = asyncHandler(async (req, res) => {
  try {
    const result = await documentService.uploadDocument({
      file: req.file,
      metadata: req.body,
      user: req.user,
    });

    await logAudit({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'documents.upload',
      resourceType: 'Document',
      resourceId: result.data.document?.id,
      outcome: 'success',
      requestId: req.id,
      metadata: {
        duplicate: result.data.duplicate,
        status: result.status,
      },
    });

    return sendSuccess(res, result.data, undefined, result.status);
  } catch (err) {
    await logAudit({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'documents.upload',
      resourceType: 'Document',
      outcome: 'failure',
      requestId: req.id,
      metadata: { reason: err.code || 'UPLOAD_FAILED' },
    });
    throw err;
  }
});

export const listDocuments = asyncHandler(async (req, res) => {
  const result = await documentService.listDocuments({
    ...req.query,
    user: req.user,
  });

  return sendPaginated(
    res,
    result.items,
    {
      page: result.page,
      limit: result.limit,
      total: result.total,
    },
    200
  );
});

export const getFacets = asyncHandler(async (_req, res) => {
  const facets = await documentService.getFacets();
  return sendSuccess(res, facets, undefined, 200);
});

export const getDocumentById = asyncHandler(async (req, res) => {
  const data = await documentService.getDocumentById(req.params.id, req.user);
  return sendSuccess(res, data, undefined, 200);
});

export const getDocumentPages = asyncHandler(async (req, res) => {
  const result = await documentService.getDocumentPages(req.params.id, req.query, req.user);
  return sendPaginated(
    res,
    result.items,
    {
      page: result.page,
      limit: result.limit,
      total: result.total,
    },
    200
  );
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const result = await documentService.deleteDocument(req.params.id, req.user);

  await logAudit({
    actorId: req.user.id,
    actorRole: req.user.role,
    action: 'documents.delete',
    resourceType: 'Document',
    resourceId: req.params.id,
    outcome: 'success',
    requestId: req.id,
  });

  return sendSuccess(res, result, undefined, 200);
});

export const adminUpdateDocument = asyncHandler(async (req, res) => {
  const doc = await documentService.adminUpdateDocument(req.params.id, req.body);

  await logAudit({
    actorId: req.user.id,
    actorRole: req.user.role,
    action: 'documents.update',
    resourceType: 'Document',
    resourceId: req.params.id,
    outcome: 'success',
    requestId: req.id,
  });

  return sendSuccess(res, doc, undefined, 200);
});
