/**
 * @fileoverview Search controller handling citizen document search requests.
 * Guaranteed privacy: search query strings are strictly not persisted to DB or audit logs.
 */

import * as retrievalService from '../services/retrievalService.js';
import { sendPaginated } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const search = asyncHandler(async (req, res) => {
  const {
    q,
    category,
    docType,
    issuingAuthority,
    language,
    documentId,
    publishedFrom,
    publishedTo,
    includeOlderVersions,
    page = 1,
    limit = 8,
  } = req.query;

  const filters = {};
  if (category) filters.category = category;
  if (docType) filters.docType = docType;
  if (issuingAuthority) filters.issuingAuthority = issuingAuthority;
  if (language) filters.language = language;
  if (documentId) filters.documentIds = [documentId];
  if (publishedFrom) filters.publishedFrom = publishedFrom;
  if (publishedTo) filters.publishedTo = publishedTo;

  const searchResult = await retrievalService.retrieve({
    query: q,
    filters,
    limit,
    page,
    user: req.user,
    includeText: false, // Per specification: returns snippet only, no full text
    includeOlderVersions,
  });

  return sendPaginated(
    res,
    searchResult.results,
    {
      page,
      limit,
      total: searchResult.total,
    },
    200
  );
});

export default {
  search,
};
