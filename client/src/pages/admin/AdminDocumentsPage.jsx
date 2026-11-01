/**
 * @fileoverview Administrative Document Management and Editorial Review Page.
 * Uses GET /api/documents?scope=all, PATCH /api/admin/documents/:id, and DELETE /api/documents/:id.
 */

import { useState, useEffect, useCallback } from 'react';
import { Search, Edit, Trash2, ExternalLink, Eye, RotateCcw } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { AdminDataTable } from '../../components/admin/AdminDataTable.jsx';
import { AdminConfirmDialog } from '../../components/admin/AdminConfirmDialog.jsx';
import { adminUpdateDocument } from '../../services/adminService.js';
import { listDocuments, deleteDocument, getDocumentById } from '../../services/documentService.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/common/Button.jsx';

export const AdminDocumentsPage = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('');

  // Selected document for inspection/modal
  const [inspectDoc, setInspectDoc] = useState(null);

  // Selected document for edit
  const [editDoc, setEditDoc] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    issuingAuthority: '',
    sourceUrl: '',
    category: 'other',
    docType: 'other',
    language: 'unknown',
  });
  const [editLoading, setEditLoading] = useState(false);

  // Selected document for delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        scope: 'all',
        page,
        limit: 15,
        sort: '-createdAt',
      };
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (docTypeFilter) params.docType = docTypeFilter;

      const res = await listDocuments(params);
      setDocuments(res.items);
      setTotalItems(res.meta.total);
      setTotalPages(res.meta.totalPages);
    } catch (err) {
      showToast(err.message || t('error_generic', 'Failed to load documents'), 'error');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter, categoryFilter, docTypeFilter, t, showToast]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  // Handle Inspection
  const handleInspect = async (docId) => {
    try {
      const res = await getDocumentById(docId);
      setInspectDoc(res.document);
    } catch (err) {
      showToast(err.message || 'Failed to inspect document', 'error');
    }
  };

  // Open Edit Modal
  const openEditModal = (doc) => {
    setEditDoc(doc);
    setEditForm({
      title: doc.title || '',
      issuingAuthority: doc.issuingAuthority || '',
      sourceUrl: doc.sourceUrl || '',
      category: doc.category || 'other',
      docType: doc.docType || 'other',
      language: doc.language || 'unknown',
    });
  };

  // Submit Metadata Update
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editDoc) return;
    setEditLoading(true);
    try {
      await adminUpdateDocument(editDoc.id || editDoc._id, editForm);
      showToast('Document metadata updated successfully', 'success');
      setEditDoc(null);
      await fetchDocs();
    } catch (err) {
      showToast(err.message || 'Failed to update document metadata', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  // Confirm and Execute Deletion (No optimistic UI updates)
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteDocument(deleteTarget.id || deleteTarget._id);
      showToast('Document deleted permanently from repository', 'success');
      setDeleteTarget(null);
      await fetchDocs();
    } catch (err) {
      showToast(err.message || 'Failed to delete document', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setCategoryFilter('');
    setDocTypeFilter('');
    setPage(1);
  };

  const getStatusBadge = (status) => {
    const styles =
      {
        ready: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        processing: 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse',
        pending: 'bg-amber-100 text-amber-800 border-amber-200',
        failed: 'bg-rose-100 text-rose-800 border-rose-200',
        needs_ocr: 'bg-purple-100 text-purple-800 border-purple-200',
      }[status] || 'bg-slate-100 text-slate-700 border-slate-200';

    return (
      <span
        className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${styles} uppercase tracking-wider`}
      >
        {status}
      </span>
    );
  };

  const columns = [
    {
      header: 'Title & Authority',
      className: 'min-w-[220px]',
      render: (doc) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-900 line-clamp-1" title={doc.title}>
            {doc.title || 'Untitled Document'}
          </p>
          <p className="text-[11px] text-slate-500 truncate">
            {doc.issuingAuthority || 'Government of India'}
          </p>
        </div>
      ),
    },
    {
      header: 'Category / Type',
      className: 'whitespace-nowrap',
      render: (doc) => (
        <div className="text-xs space-y-0.5">
          <span className="font-medium text-slate-800 capitalize block">
            {doc.category || 'other'}
          </span>
          <span className="text-[11px] text-slate-500 capitalize block">
            {doc.docType || 'other'}
          </span>
        </div>
      ),
    },
    {
      header: 'Visibility',
      render: (doc) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
            doc.visibility === 'public'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          {doc.visibility}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (doc) => getStatusBadge(doc.status),
    },
    {
      header: 'Pages / Chunks',
      className: 'whitespace-nowrap font-mono text-xs',
      render: (doc) => (
        <span>
          {doc.pageCount ?? 0}p • {doc.chunkCount ?? 0}c
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right whitespace-nowrap',
      render: (doc) => (
        <div className="flex items-center justify-end space-x-1.5">
          <button
            type="button"
            onClick={() => handleInspect(doc.id || doc._id)}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            title="Inspect metadata and checksum"
          >
            <Eye className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => openEditModal(doc)}
            className="p-1.5 text-emerald-600 hover:text-emerald-800 rounded-lg hover:bg-emerald-50 transition-colors"
            title="Edit document metadata"
          >
            <Edit className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setDeleteTarget(doc)}
            className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors"
            title="Delete document"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin_docs_title', 'Document Corpus & Editorial Management')}
        subtitle={t(
          'admin_docs_subtitle',
          'Review, verify, edit metadata, and manage civic documents across the public and private library.'
        )}
        phase="Phase 11"
      />

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search title, authority..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="ready">Ready</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
            <option value="needs_ocr">Needs OCR</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 bg-white"
          >
            <option value="">All Categories</option>
            <option value="scholarship">Scholarship</option>
            <option value="education">Education</option>
            <option value="agriculture">Agriculture</option>
            <option value="business">Business</option>
            <option value="health">Health</option>
            <option value="housing">Housing</option>
            <option value="employment">Employment</option>
            <option value="legal">Legal</option>
            <option value="other">Other</option>
          </select>

          {/* DocType Filter */}
          <div className="flex items-center space-x-2">
            <select
              value={docTypeFilter}
              onChange={(e) => {
                setDocTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 bg-white"
            >
              <option value="">All Document Types</option>
              <option value="scheme">Scheme</option>
              <option value="notification">Notification</option>
              <option value="circular">Circular</option>
              <option value="guideline">Guideline</option>
              <option value="act">Act</option>
              <option value="other">Other</option>
            </select>

            {(searchQuery || statusFilter || categoryFilter || docTypeFilter) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="text-xs text-slate-600 px-2 py-2"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Documents Data Table */}
      <AdminDataTable
        title="Official & Citizen Documents Repository"
        subtitle={`Showing ${documents.length} of ${totalItems} total documents`}
        columns={columns}
        data={documents}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={(newPage) => setPage(newPage)}
        emptyMessage="No documents found matching the specified filters."
      />

      {/* Document Inspection Modal */}
      {inspectDoc && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Document Inspection</h3>
                <span className="font-mono text-xs text-slate-500">
                  ID: {inspectDoc.id || inspectDoc._id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInspectDoc(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <span className="font-bold text-slate-900 block">Title</span>
                <p className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  {inspectDoc.title}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-bold text-slate-900 block">Issuing Authority</span>
                  <p className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    {inspectDoc.issuingAuthority || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Visibility</span>
                  <p className="p-2 bg-slate-50 rounded-lg border border-slate-100 capitalize">
                    {inspectDoc.visibility}
                  </p>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-900 block">
                  Cryptographic Checksum (SHA-256)
                </span>
                <p className="p-2 bg-slate-50 rounded-lg border border-slate-100 font-mono text-[11px] break-all">
                  {inspectDoc.checksum || 'Not computed'}
                </p>
              </div>

              {inspectDoc.storage && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="font-bold text-slate-900 block">File Size</span>
                    <p className="p-2 bg-slate-50 rounded-lg border border-slate-100 font-mono">
                      {inspectDoc.storage.sizeBytes
                        ? `${(inspectDoc.storage.sizeBytes / 1024).toFixed(1)} KB`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">MIME Type</span>
                    <p className="p-2 bg-slate-50 rounded-lg border border-slate-100 font-mono">
                      {inspectDoc.storage.mimeType || 'application/pdf'}
                    </p>
                  </div>
                </div>
              )}

              {inspectDoc.sourceUrl && (
                <div>
                  <span className="font-bold text-slate-900 block">Source URL</span>
                  <a
                    href={inspectDoc.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-emerald-700 hover:underline flex items-center space-x-1 truncate block"
                  >
                    <span className="truncate">{inspectDoc.sourceUrl}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button type="button" variant="outline" size="sm" onClick={() => setInspectDoc(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Metadata Modal */}
      {editDoc && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleUpdateSubmit}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Document Metadata</h3>
                <span className="font-mono text-xs text-slate-500">
                  ID: {editDoc.id || editDoc._id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditDoc(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-900 block mb-1">Title *</label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={300}
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1">Issuing Authority</label>
                <input
                  type="text"
                  maxLength={200}
                  value={editForm.issuingAuthority}
                  onChange={(e) => setEditForm({ ...editForm, issuingAuthority: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-900 block mb-1">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white"
                  >
                    <option value="scholarship">Scholarship</option>
                    <option value="education">Education</option>
                    <option value="agriculture">Agriculture</option>
                    <option value="business">Business</option>
                    <option value="health">Health</option>
                    <option value="housing">Housing</option>
                    <option value="employment">Employment</option>
                    <option value="legal">Legal</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-900 block mb-1">Document Type</label>
                  <select
                    value={editForm.docType}
                    onChange={(e) => setEditForm({ ...editForm, docType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white"
                  >
                    <option value="scheme">Scheme</option>
                    <option value="notification">Notification</option>
                    <option value="circular">Circular</option>
                    <option value="guideline">Guideline</option>
                    <option value="act">Act</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1">Source URL</label>
                <input
                  type="url"
                  maxLength={2048}
                  value={editForm.sourceUrl}
                  onChange={(e) => setEditForm({ ...editForm, sourceUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditDoc(null)}
                disabled={editLoading}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={editLoading}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Document from Repository?"
        description={`Are you sure you want to permanently delete "${deleteTarget?.title || 'this document'}"? This action cannot be undone and will purge all extracted pages, vector chunks, and disk storage.`}
        confirmText="Permanently Delete"
        cancelText="Cancel"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        variant="danger"
      />
    </div>
  );
};

export default AdminDocumentsPage;
