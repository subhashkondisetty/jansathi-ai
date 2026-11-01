/**
 * @fileoverview Citizen Document Library page (Phase 9).
 * Provides discovery, searching, filtering, and pagination across official public
 * documents and private citizen-uploaded files using live backend APIs.
 * Supports complete multilingual UI localization across en, te, hi, and ta.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  RotateCw,
  Upload,
  BookOpen,
  FileText,
  Building2,
  Calendar,
  Layers,
  ExternalLink,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { listDocuments } from '../services/documentService.js';
import { useOptions } from '../context/OptionsContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Button from '../components/common/Button.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { formatBytes, formatDate } from '../utils/formatters.js';

export default function DocumentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { options } = useOptions();
  const { t } = useLanguage();
  const { error: toastError } = useToast();

  // Query parameter state synchronization
  const scope = searchParams.get('scope') === 'mine' ? 'mine' : 'library';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const qParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const docTypeParam = searchParams.get('docType') || '';
  const languageParam = searchParams.get('language') || '';
  const statusParam = searchParams.get('status') || '';
  const sortParam = searchParams.get('sort') || '-createdAt';

  // Local search input state (to allow typing before search dispatch)
  const [searchInput, setSearchInput] = useState(qParam);

  // Sync search input if URL changes externally
  useEffect(() => {
    setSearchInput(qParam);
  }, [qParam]);

  // Data fetching state
  const [documents, setDocuments] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update URL helper
  const updateParams = useCallback(
    (newParams) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(newParams).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') {
              next.delete(key);
            } else {
              next.set(key, String(value));
            }
          });
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // Fetch documents from backend
  const fetchDocs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        scope,
        page,
        limit: 12,
        sort: sortParam,
      };
      if (qParam.trim()) params.q = qParam.trim();
      if (categoryParam) params.category = categoryParam;
      if (docTypeParam) params.docType = docTypeParam;
      if (languageParam) params.language = languageParam;
      if (scope === 'mine' && statusParam) params.status = statusParam;

      const result = await listDocuments(params);
      setDocuments(result.items || []);
      setMeta(result.meta || { page: 1, limit: 12, total: 0, totalPages: 1 });
    } catch (err) {
      setError(err);
      toastError(err.message || 'Failed to retrieve documents from server.');
    } finally {
      setLoading(false);
    }
  }, [
    scope,
    page,
    qParam,
    categoryParam,
    docTypeParam,
    languageParam,
    statusParam,
    sortParam,
    toastError,
  ]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  // Search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ q: searchInput.trim(), page: 1 });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    updateParams({ q: '', page: 1 });
  };

  const handleScopeChange = (newScope) => {
    if (newScope === scope) return;
    setSearchParams(
      {
        scope: newScope,
        page: '1',
      },
      { replace: true }
    );
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchParams(
      {
        scope,
        page: '1',
      },
      { replace: true }
    );
  };

  // Active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (qParam) count++;
    if (categoryParam) count++;
    if (docTypeParam) count++;
    if (languageParam) count++;
    if (scope === 'mine' && statusParam) count++;
    return count;
  }, [qParam, categoryParam, docTypeParam, languageParam, scope, statusParam]);

  // Robust status badge helper using actual backend enums (ready, processing, pending, needs_ocr, failed)
  // Ensures unknown statuses display gracefully and accessible icons/text are always present.
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" aria-hidden="true" />
            {t('status_ready', 'Ready')}
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600 animate-spin shrink-0" aria-hidden="true" />
            {t('status_processing', 'Processing')}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600 shrink-0" aria-hidden="true" />
            {t('status_pending', 'Queued')}
          </span>
        );
      case 'needs_ocr':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-800 border border-orange-200">
            <AlertTriangle className="w-3 h-3 text-orange-600 shrink-0" aria-hidden="true" />
            {t('status_needs_ocr', 'Needs OCR')}
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" aria-hidden="true" />
            {t('status_failed', 'Failed')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 capitalize">
            <HelpCircle className="w-3 h-3 text-slate-400 shrink-0" aria-hidden="true" />
            {status || 'Unknown'}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <PageHeader
        title={t('doc_library_title', 'Official Document Library')}
        subtitle={t(
          'doc_library_subtitle',
          'Search and explore verified government notifications, statutory schemes, circulars, and private citizen uploads.'
        )}
        phase="Phase 9"
        action={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDocs}
              disabled={loading}
              title={t('doc_refresh_btn', 'Refresh')}
              aria-label={t('doc_refresh_btn', 'Refresh')}
            >
              <RotateCw
                className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              {t('doc_refresh_btn', 'Refresh')}
            </Button>
            <Link to="/upload">
              <Button size="sm" variant="primary">
                <Upload className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                {t('doc_upload_btn', 'Upload Document')}
              </Button>
            </Link>
          </div>
        }
      />

      {/* Scope Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-200">
        <div className="flex space-x-2" role="tablist" aria-label="Document Catalog Scope">
          <button
            type="button"
            role="tab"
            aria-selected={scope === 'library'}
            onClick={() => handleScopeChange('library')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
              scope === 'library'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
            {t('doc_scope_public', 'Official Public Library')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={scope === 'mine'}
            onClick={() => handleScopeChange('mine')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
              scope === 'mine'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" aria-hidden="true" />
            {t('doc_scope_mine', 'My Uploaded Documents')}
          </button>
        </div>

        <div className="text-xs text-slate-500 pb-2 sm:pb-0" aria-live="polite">
          {t('doc_showing', 'Showing')} {documents.length > 0 ? (page - 1) * meta.limit + 1 : 0}–
          {Math.min(page * meta.limit, meta.total)} {t('doc_page_of', 'of')} {meta.total}{' '}
          {t('nav_documents', 'documents')}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-8 shadow-sm space-y-4">
        {/* Search Input Row */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="text"
              maxLength={100}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t(
                'doc_search_placeholder',
                'Search by document title or issuing ministry...'
              )}
              className="w-full pl-10 pr-9 py-2 text-sm rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-md"
                aria-label="Clear search query"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
          <Button type="submit" variant="primary" size="sm" className="shrink-0 px-4">
            {t('doc_search_btn', 'Search')}
          </Button>
        </form>

        {/* Filter Dropdowns Grid: 5 columns on desktop, handles both Status & Sort Order */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Category Filter */}
          <div>
            <label htmlFor="filter-category" className="block font-medium text-slate-600 mb-1">
              {t('doc_filter_category', 'Category')}
            </label>
            <select
              id="filter-category"
              value={categoryParam}
              onChange={(e) => updateParams({ category: e.target.value, page: 1 })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">{t('doc_filter_all_categories', 'All Categories')}</option>
              {options.docCategories?.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label || cat.value}
                </option>
              ))}
            </select>
          </div>

          {/* Doc Type Filter */}
          <div>
            <label htmlFor="filter-doctype" className="block font-medium text-slate-600 mb-1">
              {t('doc_filter_doctype', 'Document Type')}
            </label>
            <select
              id="filter-doctype"
              value={docTypeParam}
              onChange={(e) => updateParams({ docType: e.target.value, page: 1 })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">{t('doc_filter_all_types', 'All Types')}</option>
              {options.docTypes?.map((dt) => (
                <option key={dt.value} value={dt.value}>
                  {dt.label || dt.value}
                </option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <label htmlFor="filter-language" className="block font-medium text-slate-600 mb-1">
              {t('doc_filter_language', 'Language')}
            </label>
            <select
              id="filter-language"
              value={languageParam}
              onChange={(e) => updateParams({ language: e.target.value, page: 1 })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">{t('doc_filter_all_languages', 'All Languages')}</option>
              {options.languages?.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.nativeLabel ? `${lang.label} (${lang.nativeLabel})` : lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter (Active when scope='mine') */}
          {scope === 'mine' ? (
            <div>
              <label htmlFor="filter-status" className="block font-medium text-slate-600 mb-1">
                {t('doc_filter_status', 'Processing Status')}
              </label>
              <select
                id="filter-status"
                value={statusParam}
                onChange={(e) => updateParams({ status: e.target.value, page: 1 })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">{t('doc_filter_all_statuses', 'All Statuses')}</option>
                <option value="ready">{t('status_ready', 'Ready')}</option>
                <option value="processing">{t('status_processing', 'Processing')}</option>
                <option value="pending">{t('status_pending', 'Queued')}</option>
                <option value="needs_ocr">{t('status_needs_ocr', 'Needs OCR')}</option>
                <option value="failed">{t('status_failed', 'Failed')}</option>
              </select>
            </div>
          ) : null}

          {/* Sort Order Filter */}
          <div>
            <label htmlFor="filter-sort" className="block font-medium text-slate-600 mb-1">
              {t('doc_filter_sort', 'Sort Order')}
            </label>
            <select
              id="filter-sort"
              value={sortParam}
              onChange={(e) => updateParams({ sort: e.target.value, page: 1 })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="-createdAt">{t('doc_sort_newest', 'Newest First')}</option>
              <option value="createdAt">{t('doc_sort_oldest', 'Oldest First')}</option>
              <option value="title">{t('doc_sort_title_asc', 'Title (A–Z)')}</option>
              <option value="-title">{t('doc_sort_title_desc', 'Title (Z–A)')}</option>
              <option value="-publishedAt">{t('doc_sort_published', 'Publication Date')}</option>
            </select>
          </div>

          {/* Reset Filters / Actions */}
          <div className="flex items-end">
            {activeFiltersCount > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="w-full text-slate-600 hover:text-slate-900 border-dashed"
              >
                <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" aria-hidden="true" />
                {t('doc_reset_filters', 'Reset Filters')} ({activeFiltersCount})
              </Button>
            ) : (
              <div className="text-xs text-slate-400 py-1.5 italic">No active filters</div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-medium text-slate-500 mt-4">Loading document catalog...</p>
        </div>
      ) : error ? (
        <ErrorState
          title="Unable to load documents"
          message={
            error.message || 'The server encountered an error while retrieving document records.'
          }
          onRetry={fetchDocs}
        />
      ) : documents.length === 0 ? (
        <EmptyState
          title={
            activeFiltersCount > 0
              ? t('doc_no_matching', 'No matching documents found')
              : scope === 'mine'
                ? t('doc_empty_personal', 'No uploaded documents yet')
                : t('doc_empty_library', 'No official documents available')
          }
          description={
            activeFiltersCount > 0
              ? t(
                  'doc_no_matching_desc',
                  'Try modifying your search terms or clearing selected category filters.'
                )
              : scope === 'mine'
                ? t(
                    'doc_empty_personal_desc',
                    'Upload personal scheme notices or gazettes to begin private text extraction.'
                  )
                : t(
                    'doc_empty_library_desc',
                    'The official document library is currently empty. Check back as new official sources are crawled.'
                  )
          }
          action={
            activeFiltersCount > 0 ? (
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                {t('doc_reset_filters', 'Clear All Filters')}
              </Button>
            ) : scope === 'mine' ? (
              <Link to="/upload">
                <Button variant="primary" size="sm">
                  <Upload className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                  {t('doc_upload_btn', 'Upload First Document')}
                </Button>
              </Link>
            ) : null
          }
        />
      ) : (
        <div className="space-y-6">
          {/* Document Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {documents.map((doc) => {
              const docId = doc.id || doc._id;
              return (
                <div
                  key={docId}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col overflow-hidden"
                >
                  {/* Top Badge Strip */}
                  <div className="px-5 pt-4 pb-2 flex items-center justify-between gap-2 text-xs border-b border-slate-50">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 capitalize">
                        {doc.docType || 'Document'}
                      </span>
                      {doc.category && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 capitalize">
                          {doc.category}
                        </span>
                      )}
                    </div>
                    <div>{renderStatusBadge(doc.status)}</div>
                  </div>

                  {/* Document Body */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 hover:text-emerald-700 transition-colors mb-2">
                      <Link to={`/documents/${docId}`}>{doc.title}</Link>
                    </h3>

                    {doc.issuingAuthority && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3">
                        <Building2
                          className="w-3.5 h-3.5 text-slate-400 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="truncate">{doc.issuingAuthority}</span>
                      </div>
                    )}

                    {/* Metadata Pill Row */}
                    <div className="mt-auto pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar
                          className="w-3.5 h-3.5 text-slate-400 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{formatDate(doc.publishedAt || doc.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-end">
                        <Layers
                          className="w-3.5 h-3.5 text-slate-400 shrink-0"
                          aria-hidden="true"
                        />
                        <span>
                          {doc.pageCount
                            ? `${doc.pageCount} ${t('doc_pages_count', 'pages')}`
                            : `0 ${t('doc_pages_count', 'pages')}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatBytes(doc.storage?.sizeBytes)}
                    </span>
                    <div className="flex items-center gap-2">
                      {doc.sourceUrl && (
                        <a
                          href={doc.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
                          title="Open original government source portal"
                          aria-label="Open original government source portal"
                        >
                          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                        </a>
                      )}
                      <Link to={`/documents/${docId}`}>
                        <Button variant="outline" size="sm" className="text-xs py-1 px-3">
                          {t('doc_open_reader', 'Open Reader')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Accessible Pagination Footer */}
          {meta.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
              <div className="text-xs text-slate-500">
                Page <span className="font-semibold text-slate-800">{meta.page}</span>{' '}
                {t('doc_page_of', 'of')}{' '}
                <span className="font-semibold text-slate-800">{meta.totalPages}</span>
              </div>

              <div className="flex items-center gap-2" role="navigation" aria-label="Pagination">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => updateParams({ page: page - 1 })}
                  aria-label={t('doc_prev_page', 'Go to previous page')}
                >
                  {t('doc_prev_page', 'Previous')}
                </Button>

                {/* Numbered Page Buttons */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: Math.min(meta.totalPages, 7) }, (_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = pageNum === page;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => updateParams({ page: pageNum })}
                        aria-current={isActive ? 'page' : undefined}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => updateParams({ page: page + 1 })}
                  aria-label={t('doc_next_page', 'Go to next page')}
                >
                  {t('doc_next_page', 'Next')}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
