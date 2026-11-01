/**
 * @fileoverview Document service handling secure PDF uploads, deduplication, listing,
 * pagination, facets, and lifecycle operations.
 */

import { Document } from '../models/Document.js';
import { DocumentPage } from '../models/DocumentPage.js';
import { DocumentChunk } from '../models/DocumentChunk.js';
import { IngestionJob } from '../models/IngestionJob.js';
import { ApiError } from '../utils/ApiError.js';
import { calculateFileSha256 } from '../utils/checksum.js';
import { sanitizeOriginalFilename, extractTitleFromFilename } from '../utils/safeFilename.js';
import { moveToFinal, deleteFile, deleteTempFile } from './fileStorageService.js';
import { createJobForDocument } from './ingestionQueueService.js';
import { verifyPdfMagicBytes } from '../middleware/upload.js';
import { escapeRegex } from './sourceService.js';

/**
 * Handles PDF upload verification, checksumming, deduplication, and database insertion.
 *
 * @param {Object} params - Upload parameters.
 * @param {Object} params.file - Multer file object from request.
 * @param {Object} params.metadata - Validated metadata fields.
 * @param {Object} params.user - Authenticated user identity (id, role).
 * @returns {Promise<{status: number, data: Object}>}
 */
export const uploadDocument = async ({ file, metadata = {}, user }) => {
  const tempPath = file.path;

  try {
    // 1. Verify magic bytes within first 1024 bytes
    await verifyPdfMagicBytes(tempPath);

    // 2. Compute SHA-256 checksum
    const checksum = await calculateFileSha256(tempPath);

    // 3. Determine visibility and title according to role rules
    let visibility = 'private';
    let title = metadata.title ? metadata.title.trim() : '';

    if (user.role === 'citizen') {
      visibility = 'private';
      if (!title) {
        title = extractTitleFromFilename(file.originalname);
      }
    } else if (user.role === 'admin') {
      visibility = metadata.visibility || 'public';
      if (visibility === 'public') {
        const missingFields = [];
        if (!title) missingFields.push('title');
        if (!metadata.issuingAuthority) missingFields.push('issuingAuthority');
        if (!metadata.sourceUrl) missingFields.push('sourceUrl');

        if (missingFields.length > 0) {
          await deleteTempFile(tempPath);
          throw new ApiError(
            400,
            'VALIDATION_ERROR',
            'Public documents require title, issuingAuthority, and sourceUrl',
            missingFields.map((f) => ({
              target: 'body',
              path: f,
              message: `${f} is required for public documents`,
            }))
          );
        }
      } else if (!title) {
        title = extractTitleFromFilename(file.originalname);
      }
    }

    const scopeKey = visibility === 'public' ? 'public' : `user:${user.id}`;

    // 4. Dedupe check: If citizen uploads a file identical to an existing PUBLIC ready document
    if (visibility === 'private') {
      const publicDoc = await Document.findOne({
        scopeKey: 'public',
        checksum,
        status: 'ready',
      });
      if (publicDoc) {
        await deleteTempFile(tempPath);
        return {
          status: 200,
          data: {
            duplicate: true,
            document: publicDoc,
            reason: 'already_in_library',
          },
        };
      }
    }

    // 5. Dedupe check: Look up document within current scopeKey
    const existingDoc = await Document.findOne({ scopeKey, checksum });
    if (existingDoc) {
      if (['pending', 'processing', 'ready'].includes(existingDoc.status)) {
        await deleteTempFile(tempPath);
        return {
          status: 200,
          data: {
            duplicate: true,
            document: existingDoc,
          },
        };
      }

      if (['failed', 'needs_ocr'].includes(existingDoc.status)) {
        // Reuse document entry: replace stored file, reset status, create fresh job
        if (existingDoc.storage?.storedName) {
          await deleteFile(existingDoc.storage.storedName);
        }
        const finalStorage = await moveToFinal(tempPath);
        existingDoc.status = 'pending';
        existingDoc.failure = undefined;
        existingDoc.storage = {
          storedName: finalStorage.storedName,
          originalName: sanitizeOriginalFilename(file.originalname),
          mimeType: 'application/pdf',
          sizeBytes: finalStorage.sizeBytes,
        };
        await existingDoc.save();

        const job = await createJobForDocument(existingDoc.id, user.id);
        return {
          status: 202,
          data: {
            duplicate: true,
            document: existingDoc,
            job,
          },
        };
      }
    }

    // 6. Non-duplicate: Move temporary file to final storage
    const finalStorage = await moveToFinal(tempPath);

    let doc;
    try {
      doc = await Document.create({
        title,
        issuingAuthority: metadata.issuingAuthority ? metadata.issuingAuthority.trim() : undefined,
        sourceUrl: metadata.sourceUrl ? metadata.sourceUrl.trim() : undefined,
        origin: 'uploaded',
        visibility,
        uploadedBy: user.id,
        scopeKey,
        checksum,
        version: 1,
        isLatest: true,
        docType: metadata.docType || 'other',
        category: metadata.category || 'other',
        language: metadata.language || 'unknown',
        publishedAt: metadata.publishedAt ? new Date(metadata.publishedAt) : undefined,
        status: 'pending',
        fetchedAt: null,
        storage: {
          storedName: finalStorage.storedName,
          originalName: sanitizeOriginalFilename(file.originalname),
          mimeType: 'application/pdf',
          sizeBytes: finalStorage.sizeBytes,
        },
      });
    } catch (createErr) {
      // E11000 duplicate race condition
      await deleteFile(finalStorage.storedName);
      if (createErr.code === 11000) {
        const racedDoc = await Document.findOne({ scopeKey, checksum });
        if (racedDoc) {
          return {
            status: 200,
            data: {
              duplicate: true,
              document: racedDoc,
            },
          };
        }
      }
      throw createErr;
    }

    const job = await createJobForDocument(doc.id, user.id);
    return {
      status: 202,
      data: {
        duplicate: false,
        document: doc,
        job,
      },
    };
  } catch (err) {
    await deleteTempFile(tempPath);
    throw err;
  }
};

/**
 * Lists documents with filtering, scoping, pagination, and sorting.
 *
 * @param {Object} params - Query parameters.
 * @param {Object} params.user - Current authenticated user.
 * @returns {Promise<{items: Array, total: number, page: number, limit: number}>}
 */
export const listDocuments = async ({
  q,
  category,
  docType,
  issuingAuthority,
  language,
  status,
  publishedFrom,
  publishedTo,
  includeOlderVersions = false,
  scope = 'library',
  sort = '-createdAt',
  page = 1,
  limit = 20,
  user,
}) => {
  const filter = {};

  // Scope gating
  if (scope === 'all') {
    if (user.role !== 'admin') {
      throw new ApiError(403, 'FORBIDDEN', 'Only administrators can access all document scopes');
    }
  } else if (scope === 'mine') {
    filter.uploadedBy = user.id;
  } else {
    // Default: 'library'
    filter.visibility = 'public';
    filter.status = 'ready';
  }

  if (!includeOlderVersions) {
    filter.isLatest = true;
  }

  if (category) filter.category = category;
  if (docType) filter.docType = docType;
  if (issuingAuthority) filter.issuingAuthority = issuingAuthority.trim();
  if (language) filter.language = language;

  if (status && (user.role === 'admin' || scope === 'mine')) {
    filter.status = status;
  }

  if (publishedFrom || publishedTo) {
    filter.publishedAt = {};
    if (publishedFrom) filter.publishedAt.$gte = new Date(publishedFrom);
    if (publishedTo) filter.publishedAt.$lte = new Date(publishedTo);
  }

  if (q && q.trim()) {
    const safeRegex = new RegExp(escapeRegex(q.trim()), 'i');
    filter.$or = [{ title: safeRegex }, { issuingAuthority: safeRegex }];
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  // Sorting
  const sortObj = {};
  if (sort.startsWith('-')) {
    sortObj[sort.slice(1)] = -1;
  } else {
    sortObj[sort] = 1;
  }

  const [docs, total] = await Promise.all([
    Document.find(filter)
      .select('-extraction -metadata')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Document.countDocuments(filter),
  ]);

  // Strip sensitive storage details from private docs of other users when viewed by admin in 'all'
  const items = docs.map((doc) => {
    const isOwner = String(doc.uploadedBy) === String(user.id);
    if (doc.visibility === 'private' && !isOwner && user.role === 'admin') {
      return {
        ...doc,
        id: doc._id,
        storage: doc.storage
          ? { mimeType: doc.storage.mimeType, sizeBytes: doc.storage.sizeBytes }
          : undefined,
      };
    }
    return { ...doc, id: doc._id };
  });

  return {
    items,
    total,
    page: pageNum,
    limit: limitNum,
  };
};

/**
 * Computes facet aggregation counts over public ready documents.
 *
 * @returns {Promise<Object>} Aggregated facet counts.
 */
export const getFacets = async () => {
  const match = { visibility: 'public', status: 'ready', isLatest: true };

  const [categories, docTypes, issuingAuthorities, languages, total] = await Promise.all([
    Document.aggregate([
      { $match: match },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, value: '$_id', count: 1 } },
    ]),
    Document.aggregate([
      { $match: match },
      { $group: { _id: '$docType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, value: '$_id', count: 1 } },
    ]),
    Document.aggregate([
      { $match: { ...match, issuingAuthority: { $exists: true, $ne: '' } } },
      { $group: { _id: '$issuingAuthority', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
      { $project: { _id: 0, value: '$_id', count: 1 } },
    ]),
    Document.aggregate([
      { $match: match },
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, value: '$_id', count: 1 } },
    ]),
    Document.countDocuments(match),
  ]);

  return {
    total,
    categories,
    docTypes,
    issuingAuthorities,
    languages,
  };
};

/**
 * Retrieves a document by ID enforcing public/private access rules.
 *
 * @param {string} id - Document ObjectId.
 * @param {Object} user - Authenticated user identity.
 * @returns {Promise<{document: Object, latestJob: Object|null}>}
 * @throws {ApiError} 404 If document does not exist or access is unauthorized.
 */
export const getDocumentById = async (id, user) => {
  const doc = await Document.findById(id);
  if (!doc) {
    throw new ApiError(404, 'NOT_FOUND', 'Document not found');
  }

  const isOwner = String(doc.uploadedBy) === String(user.id);
  const isAdmin = user.role === 'admin';

  if (doc.visibility === 'public') {
    if (doc.status !== 'ready' && !isAdmin && !isOwner) {
      throw new ApiError(404, 'NOT_FOUND', 'Document not found');
    }
  } else if (doc.visibility === 'private') {
    if (!isOwner && !isAdmin) {
      // Return 404 to prevent enumeration
      throw new ApiError(404, 'NOT_FOUND', 'Document not found');
    }
  }

  // Include latest ingestion job for owner or admin
  let latestJob = null;
  if (isOwner || isAdmin) {
    const job = await IngestionJob.findOne({ documentId: id }).sort({ createdAt: -1 });
    if (job) {
      latestJob = {
        id: job.id,
        status: job.status,
        stage: job.stage,
        error: job.error,
        attempts: job.attempts,
        finishedAt: job.finishedAt,
      };
    }
  }

  let sanitizedDoc = doc.toJSON();
  if (doc.visibility === 'private' && !isOwner && isAdmin) {
    // Admin gets metadata only for other users' private documents
    sanitizedDoc = {
      id: doc.id,
      title: doc.title,
      visibility: doc.visibility,
      status: doc.status,
      docType: doc.docType,
      category: doc.category,
      language: doc.language,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      pageCount: doc.pageCount,
      chunkCount: doc.chunkCount,
      storage: {
        mimeType: doc.storage?.mimeType,
        sizeBytes: doc.storage?.sizeBytes,
      },
    };
  }

  return { document: sanitizedDoc, latestJob };
};

/**
 * Retrieves paginated parsed pages for a ready document.
 *
 * @param {string} id - Document ObjectId.
 * @param {Object} pagination - { page, limit }.
 * @param {Object} user - Authenticated user identity.
 * @returns {Promise<{items: Array, total: number, page: number, limit: number}>}
 * @throws {ApiError} 403 If admin attempts to view private document pages.
 * @throws {ApiError} 404 If document does not exist.
 * @throws {ApiError} 409 If document is not in ready status.
 */
export const getDocumentPages = async (id, { page = 1, limit = 10 }, user) => {
  const doc = await Document.findById(id);
  if (!doc) {
    throw new ApiError(404, 'NOT_FOUND', 'Document not found');
  }

  if (doc.status !== 'ready') {
    throw new ApiError(
      409,
      'CONFLICT',
      'Document pages are not available until processing has completed (ready status)'
    );
  }

  const isOwner = String(doc.uploadedBy) === String(user.id);

  if (doc.visibility === 'private') {
    if (user.role === 'admin' && !isOwner) {
      throw new ApiError(
        403,
        'FORBIDDEN',
        'Administrators are not permitted to inspect citizen private document pages'
      );
    }
    if (!isOwner) {
      throw new ApiError(404, 'NOT_FOUND', 'Document not found');
    }
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(20, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    DocumentPage.find({ documentId: id })
      .sort({ pageNumber: 1 })
      .skip(skip)
      .limit(limitNum)
      .select('pageNumber sectionHeading text charCount isEmpty -_id')
      .lean(),
    DocumentPage.countDocuments({ documentId: id }),
  ]);

  return {
    items,
    total,
    page: pageNum,
    limit: limitNum,
  };
};

/**
 * Deletes a document and its associated pages, chunks, and storage file.
 *
 * @param {string} id - Document ObjectId.
 * @param {Object} user - Authenticated user identity.
 * @returns {Promise<{deleted: boolean}>}
 * @throws {ApiError} 403/404 If unauthorized or document not found.
 */
export const deleteDocument = async (id, user) => {
  const doc = await Document.findById(id);
  if (!doc) {
    throw new ApiError(404, 'NOT_FOUND', 'Document not found');
  }

  const isOwner = String(doc.uploadedBy) === String(user.id);
  const isAdmin = user.role === 'admin';

  if (!isAdmin) {
    if (doc.visibility === 'public') {
      throw new ApiError(403, 'FORBIDDEN', 'Citizens cannot delete public documents');
    }
    if (!isOwner) {
      throw new ApiError(404, 'NOT_FOUND', 'Document not found');
    }
  }

  // Delete pages, chunks, and stored file
  await DocumentPage.deleteMany({ documentId: id });
  await DocumentChunk.deleteMany({ documentId: id });

  if (doc.storage?.storedName) {
    await deleteFile(doc.storage.storedName);
  }

  await Document.findByIdAndDelete(id);

  return { deleted: true };
};

/**
 * Updates document metadata (admin-only) and denormalizes updates across associated chunks.
 *
 * @param {string} id - Document ObjectId.
 * @param {Object} updates - Metadata updates.
 * @returns {Promise<Object>} Updated document.
 */
export const adminUpdateDocument = async (id, updates) => {
  const doc = await Document.findById(id);
  if (!doc) {
    throw new ApiError(404, 'NOT_FOUND', 'Document not found');
  }

  const chunkUpdates = {};

  if (updates.title !== undefined) {
    doc.title = updates.title.trim();
    chunkUpdates.title = doc.title;
  }
  if (updates.issuingAuthority !== undefined) {
    doc.issuingAuthority = updates.issuingAuthority.trim();
    chunkUpdates.issuingAuthority = doc.issuingAuthority;
  }
  if (updates.sourceUrl !== undefined) {
    doc.sourceUrl = updates.sourceUrl.trim();
    chunkUpdates.sourceUrl = doc.sourceUrl;
  }
  if (updates.publishedAt !== undefined) {
    doc.publishedAt = updates.publishedAt ? new Date(updates.publishedAt) : undefined;
    chunkUpdates.publishedAt = doc.publishedAt;
  }
  if (updates.lastUpdatedAt !== undefined) {
    doc.lastUpdatedAt = updates.lastUpdatedAt ? new Date(updates.lastUpdatedAt) : undefined;
    chunkUpdates.lastUpdatedAt = doc.lastUpdatedAt;
  }
  if (updates.docType !== undefined) {
    doc.docType = updates.docType;
    chunkUpdates.docType = doc.docType;
  }
  if (updates.category !== undefined) {
    doc.category = updates.category;
    chunkUpdates.category = doc.category;
  }
  if (updates.language !== undefined) {
    doc.language = updates.language;
    chunkUpdates.language = doc.language;
  }

  await doc.save();

  if (Object.keys(chunkUpdates).length > 0) {
    await DocumentChunk.updateMany({ documentId: id }, { $set: chunkUpdates });
  }

  return doc;
};
