/**
 * @fileoverview Document Detail and Text Reader page (Phase 9).
 * Displays verified metadata, recorded cryptographic SHA-256 integrity checksum,
 * background ingestion job tracking, and paginated extracted text pages.
 * Supports complete multilingual UI localization across en, te, hi, and ta.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Layers,
  FileText,
  ExternalLink,
  ShieldCheck,
  RotateCw,
  Copy,
  Check,
  Trash2,
  AlertCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { getDocumentById, getDocumentPages, deleteDocument } from '../services/documentService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Button from '../components/common/Button.jsx';
import Card, { CardHeader, CardBody } from '../components/common/Card.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { formatBytes, formatDate, formatDateTime } from '../utils/formatters.js';

export default function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { success: toastSuccess, error: toastError } = useToast();

  // Document and Job State
  const [document, setDocument] = useState(null);
  const [latestJob, setLatestJob] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(true);
  const [docError, setDocError] = useState(null);

  // Pages Reader State
  const [pages, setPages] = useState([]);
  const [pagesMeta, setPagesMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loadingPages, setLoadingPages] = useState(false);
  const [pagesError, setPagesError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Checksum copy state
  const [copiedChecksum, setCopiedChecksum] = useState(false);

  // Deletion modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch document metadata
  const fetchDocument = useCallback(async () => {
    if (!id) return;
    setLoadingDoc(true);
    setDocError(null);
    try {
      const data = await getDocumentById(id);
      setDocument(data.document);
      setLatestJob(data.latestJob);
    } catch (err) {
      setDocError(err);
    } finally {
      setLoadingDoc(false);
    }
  }, [id]);

  // Fetch extracted pages
  const fetchPages = useCallback(
    async (pageNum = 1) => {
      if (!id) return;
      setLoadingPages(true);
      setPagesError(null);
      try {
        const data = await getDocumentPages(id, { page: pageNum, limit: 10 });
        setPages(data.items || []);
        setPagesMeta(data.meta || { page: pageNum, limit: 10, total: 0, totalPages: 1 });
        setCurrentPage(pageNum);
      } catch (err) {
        // 409 CONFLICT is expected if document is still processing
        if (err.status !== 409) {
          setPagesError(err);
        }
      } finally {
        setLoadingPages(false);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  // Load pages once document status is ready
  useEffect(() => {
    if (document?.status === 'ready') {
      fetchPages(1);
    }
  }, [document?.status, fetchPages]);

  // Copy SHA-256 Checksum helper with accessible announcement
  const handleCopyChecksum = async () => {
    if (!document?.checksum) return;
    try {
      await navigator.clipboard.writeText(document.checksum);
      setCopiedChecksum(true);
      setTimeout(() => setCopiedChecksum(false), 2500);
    } catch {
      toastError('Failed to copy checksum to clipboard');
    }
  };

  // Ownership verification: user is owner if user ID matches document uploadedBy
  const isOwner = user && document && String(document.uploadedBy) === String(user.id);

  // Handle document deletion
  const handleDeleteConfirm = async () => {
    if (!id || !isOwner) return;
    setDeleting(true);
    try {
      await deleteDocument(id);
      toastSuccess('Document deleted successfully.');
      navigate('/documents?scope=mine', { replace: true });
    } catch (err) {
      toastError(err.message || 'Failed to delete document. Please try again.');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Status badge styling helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
            {t('status_ready', 'Ready')}
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" aria-hidden="true" />
            {t('status_processing', 'Processing')}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
            {t('status_pending', 'Queued')}
          </span>
        );
      case 'needs_ocr':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-800 border border-orange-200">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-600 shrink-0" aria-hidden="true" />
            {t('status_needs_ocr', 'Needs OCR')}
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" aria-hidden="true" />
            {t('status_failed', 'Failed')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 capitalize">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            {status || 'Unknown'}
          </span>
        );
    }
  };

  // Helper for status banner rendering
  const renderStatusBanner = () => {
    if (!document) return null;

    if (document.status === 'ready') {
      return null; // Ready documents display the reader directly
    }

    if (document.status === 'pending' || document.status === 'processing') {
      return (
        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 mb-6 text-blue-900">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Clock
                className="w-5 h-5 text-blue-600 animate-spin mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <div>
                <h2 className="text-sm font-bold text-blue-950">
                  {document.status === 'pending'
                    ? 'Document Queued for Background Ingestion'
                    : 'Document Currently Processing'}
                </h2>
                <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                  The document has been securely stored and queued for text extraction and chunking.
                  {latestJob && (
                    <span className="block mt-1 font-mono text-[11px] text-blue-700">
                      Current Stage:{' '}
                      <span className="font-semibold uppercase">{latestJob.stage}</span> • Attempt:{' '}
                      {latestJob.attempts}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDocument}
              disabled={loadingDoc}
              className="border-blue-300 text-blue-900 hover:bg-blue-100 shrink-0 text-xs"
            >
              <RotateCw
                className={`w-3.5 h-3.5 mr-1.5 ${loadingDoc ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              {t('reader_refresh_status', 'Refresh Status')}
            </Button>
          </div>
        </div>
      );
    }

    if (document.status === 'needs_ocr') {
      return (
        <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-5 mb-6 text-amber-950">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-bold text-amber-950">Scanned Document (OCR Required)</h2>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                This PDF contains scanned image pages with insufficient embedded text (&gt;80% empty
                pages). In accordance with non-AI platform governance, OCR background processing
                will be enabled in Phase 10.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (document.status === 'failed') {
      return (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 mb-6 text-rose-950">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-bold text-rose-950">Text Extraction Failed</h2>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                {document.failure?.message ||
                  latestJob?.error?.message ||
                  'The ingestion worker was unable to parse this document.'}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  if (loadingDoc) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-medium text-slate-500 mt-4">Loading document reader...</p>
      </div>
    );
  }

  if (docError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ErrorState
          title={docError.status === 404 ? 'Document not found' : 'Unable to load document'}
          message={
            docError.status === 404
              ? 'This document does not exist, or you do not have permission to view it.'
              : docError.message ||
                'An error occurred while communicating with the document service.'
          }
          onRetry={docError.status === 404 ? undefined : fetchDocument}
        />
        <div className="mt-6 text-center">
          <Link to="/documents">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
              {t('reader_back_to_library', 'Back to Document Library')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!document) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link
            to={`/documents?scope=${document.visibility === 'public' ? 'library' : 'mine'}`}
            className="flex items-center gap-1 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            {t('reader_back_to_library', 'Document Library')}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-slate-700 truncate max-w-md">{document.title}</span>
        </div>

        <div className="flex items-center gap-2">
          {document.sourceUrl && (
            <a
              href={document.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              {t('reader_official_portal', 'Official Source Portal')}
            </a>
          )}

          <Link to={`/explainer/${document._id}`}>
            <Button
              variant="outline"
              size="sm"
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              title={t('explain_document_btn', 'Explain Document')}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-600" aria-hidden="true" />
              {t('explain_document_btn', 'Explain Document')}
            </Button>
          </Link>

          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="border-rose-300 text-rose-700 hover:bg-rose-50"
              title={t('reader_delete_btn', 'Delete Document')}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5 text-rose-600" aria-hidden="true" />
              {t('reader_delete_btn', 'Delete Document')}
            </Button>
          )}
        </div>
      </div>

      {/* Ingestion & Status Alert Banner */}
      {renderStatusBanner()}

      {/* Main Layout Grid: Left Content / Right Metadata Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Document Title & Extracted Text Reader (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 capitalize">
                {document.docType || 'Document'}
              </span>
              {document.category && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 capitalize">
                  {document.category}
                </span>
              )}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  document.visibility === 'public'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                }`}
              >
                {document.visibility === 'public' ? 'Public Gazette' : 'Citizen Private Upload'}
              </span>
              {/* Document Processing Status Badge in Header Card */}
              {renderStatusBadge(document.status)}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug tracking-tight mb-3">
              {document.title}
            </h1>

            {document.issuingAuthority && (
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                <span className="font-medium">{document.issuingAuthority}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>
                  {t('reader_uploaded_date', 'Uploaded Date')}:{' '}
                  {formatDate(document.publishedAt || document.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>
                  {document.pageCount} {t('doc_pages_count', 'pages')} • {document.chunkCount || 0}{' '}
                  {t('doc_chunks_count', 'chunks')}
                </span>
              </div>
              {document.storage?.originalName && (
                <div className="flex items-center gap-1.5 truncate max-w-xs font-mono">
                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                  <span className="truncate">{document.storage.originalName}</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Feature Callout Notice */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-bold text-amber-950">
                  {t('reader_ai_callout_title', 'Looking for AI Simplification or Scheme Rules?')}
                </h2>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  {t(
                    'reader_ai_callout_desc',
                    'Conversational Document Explainer and statutory eligibility reasoning will connect directly to this document in Phase 10.'
                  )}
                </p>
              </div>
            </div>
            <Link to={`/explainer/${id}`} className="shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="border-amber-300 text-amber-900 hover:bg-amber-100 text-xs"
              >
                {t('reader_ai_callout_btn', 'View Explainer (501)')}
              </Button>
            </Link>
          </div>

          {/* Extracted Text Reader Area */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <h2 className="text-sm font-bold text-slate-900">
                  {t('reader_extracted_text', 'Extracted Text Content')}
                </h2>
              </div>
              {document.status === 'ready' && pagesMeta.total > 0 && (
                <span className="text-xs font-medium text-slate-500">
                  {t('doc_showing', 'Showing')} {(pagesMeta.page - 1) * pagesMeta.limit + 1}–
                  {Math.min(pagesMeta.page * pagesMeta.limit, pagesMeta.total)}{' '}
                  {t('doc_page_of', 'of')} {pagesMeta.total}
                </span>
              )}
            </div>

            <div className="p-6">
              {document.status !== 'ready' ? (
                <div className="text-center py-12 text-slate-500">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-sm font-medium">Text reader unavailable while processing.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Once the document finishes ingestion and enters `ready` status, extracted pages
                    will render here.
                  </p>
                </div>
              ) : loadingPages ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <LoadingSpinner size="md" />
                  <p className="text-xs text-slate-500 mt-3">Fetching document pages...</p>
                </div>
              ) : pagesError ? (
                <ErrorState
                  title="Unable to load document pages"
                  message={
                    pagesError.message || 'An error occurred while loading parsed text pages.'
                  }
                  onRetry={() => fetchPages(currentPage)}
                />
              ) : pages.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-sm font-medium text-slate-600">
                    {t('reader_empty_text', 'No extracted text pages available.')}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    This document contains no readable text content.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pages.map((pageItem) => (
                    <article
                      key={pageItem.pageNumber}
                      className="border border-slate-200 rounded-xl p-5 bg-slate-50/30 transition-all hover:bg-white hover:border-slate-300"
                    >
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 text-xs">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg">
                          Page {pageItem.pageNumber}
                        </span>
                        {pageItem.sectionHeading && (
                          <span className="font-semibold text-emerald-800 truncate max-w-sm">
                            {pageItem.sectionHeading}
                          </span>
                        )}
                        <span className="text-slate-400 font-mono text-[11px]">
                          {pageItem.charCount} chars
                        </span>
                      </div>

                      <div className="prose prose-sm max-w-none text-slate-800 text-xs sm:text-sm font-serif leading-relaxed whitespace-pre-wrap select-text">
                        {pageItem.text || <span className="italic text-slate-400">Empty page</span>}
                      </div>
                    </article>
                  ))}

                  {/* Pagination Controls for Extracted Pages */}
                  {pagesMeta.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage <= 1 || loadingPages}
                        onClick={() => fetchPages(currentPage - 1)}
                      >
                        {t('doc_prev_page', 'Previous')}
                      </Button>

                      <span className="font-semibold text-slate-600">
                        Page {pagesMeta.page} {t('doc_page_of', 'of')} {pagesMeta.totalPages}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= pagesMeta.totalPages || loadingPages}
                        onClick={() => fetchPages(currentPage + 1)}
                      >
                        {t('doc_next_page', 'Next')}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Metadata & Cryptographic Integrity (1 col) */}
        <div className="space-y-6">
          {/* Integrity & Provenance Card */}
          <Card>
            <CardHeader
              title={t('reader_integrity_title', 'Document Integrity & Provenance')}
              subtitle={t(
                'reader_integrity_subtitle',
                'Recorded storage parameters and cryptographic checksum'
              )}
            />
            <CardBody className="space-y-4 text-xs">
              {/* Checksum Row */}
              <div>
                <span className="block font-semibold text-slate-700 mb-1">
                  {t('reader_recorded_sha256', 'Recorded SHA-256 Checksum')}
                </span>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-mono text-[11px] text-slate-700 truncate select-all flex-1">
                    {document.checksum || 'Not recorded'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyChecksum}
                    className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
                    title={
                      copiedChecksum
                        ? t('reader_checksum_copied', 'Checksum copied to clipboard')
                        : 'Copy recorded SHA-256 checksum'
                    }
                    aria-label="Copy recorded SHA-256 checksum"
                  >
                    {copiedChecksum ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {/* Accessible live feedback */}
                <div className="sr-only" aria-live="polite">
                  {copiedChecksum
                    ? t('reader_checksum_copied', 'Checksum copied to clipboard')
                    : ''}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {t(
                    'reader_checksum_desc',
                    'Calculated by the backend upload service at file ingestion to detect duplicates and prevent uncorrupted storage.'
                  )}
                </p>
              </div>

              {/* Verified Storage Properties */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{t('reader_file_type', 'File Type')}:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {document.storage?.mimeType || 'application/pdf'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{t('reader_file_size', 'File Size')}:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {formatBytes(document.storage?.sizeBytes)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{t('reader_scope', 'Access Scope')}:</span>
                  <span className="font-medium text-slate-800 capitalize">
                    {document.visibility === 'public'
                      ? 'Public (All Citizens)'
                      : 'Private (Owner Only)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">
                    {t('reader_uploaded_date', 'Uploaded Date')}:
                  </span>
                  <span className="font-medium text-slate-800">
                    {formatDateTime(document.createdAt)}
                  </span>
                </div>
                {document.lastUpdatedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">
                      {t('reader_last_modified', 'Last Modified')}:
                    </span>
                    <span className="font-medium text-slate-800">
                      {formatDateTime(document.lastUpdatedAt)}
                    </span>
                  </div>
                )}
              </div>

              {/* Security Safeguards */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-emerald-800 font-semibold mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>Verified Backend Controls</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                  <li>Magic-byte (%PDF-) validation verified on ingestion</li>
                  <li>User-scoped data isolation enforced at database layer</li>
                  <li>Sanitized storage identifiers preventing directory traversal</li>
                </ul>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Accessible Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-6 h-6" aria-hidden="true" />
            </div>

            <div>
              <h2 id="delete-dialog-title" className="text-base font-bold text-slate-900">
                {t('delete_modal_title', 'Delete Uploaded Document?')}
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {t(
                  'delete_modal_desc',
                  'Are you sure you want to delete this document? This will permanently remove the stored PDF, extracted pages, and associated search chunks. This action cannot be undone.'
                )}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                {t('delete_modal_cancel', 'Cancel')}
              </Button>
              <Button variant="danger" size="sm" onClick={handleDeleteConfirm} disabled={deleting}>
                {deleting
                  ? t('delete_modal_deleting', 'Deleting...')
                  : t('delete_modal_confirm', 'Confirm Delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
