/**
 * @fileoverview Official Government Sources Administration Page.
 * Implements full CRUD, active status toggling, and manual crawl ingestion triggers.
 * Integrates with /api/admin/sources endpoints using central adminService.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Play,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  RotateCcw,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { AdminDataTable } from '../../components/admin/AdminDataTable.jsx';
import { AdminConfirmDialog } from '../../components/admin/AdminConfirmDialog.jsx';
import {
  listSources,
  createSource,
  updateSource,
  updateSourceStatus,
  deleteSource,
  triggerSourceIngest,
} from '../../services/adminService.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/common/Button.jsx';

export const AdminSourcesPage = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Create / Edit Modal State
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [currentSource, setCurrentSource] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    sourceType: 'pdf',
    issuingAuthority: '',
    docType: 'scheme',
    category: 'other',
    notes: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Trigger Ingestion State
  const [triggeringId, setTriggeringId] = useState(null);

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchSources = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
      };
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (activeFilter !== '') params.isActive = activeFilter === 'true';
      if (categoryFilter) params.category = categoryFilter;

      const res = await listSources(params);
      setSources(res.items);
      setTotalItems(res.meta.total);
      setTotalPages(res.meta.totalPages);
    } catch (err) {
      showToast(err.message || 'Failed to load official sources', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, activeFilter, categoryFilter, showToast]);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  // Open Create Modal
  const openCreateModal = () => {
    setModalMode('create');
    setCurrentSource(null);
    setFormData({
      name: '',
      url: '',
      sourceType: 'pdf',
      issuingAuthority: '',
      docType: 'scheme',
      category: 'other',
      notes: '',
    });
    setFormError(null);
  };

  // Open Edit Modal
  const openEditModal = (src) => {
    setModalMode('edit');
    setCurrentSource(src);
    setFormData({
      name: src.name || '',
      url: src.url || '',
      sourceType: src.sourceType || 'pdf',
      issuingAuthority: src.issuingAuthority || '',
      docType: src.docType || 'scheme',
      category: src.category || 'other',
      notes: src.notes || '',
    });
    setFormError(null);
  };

  // Form Submission (Create or Update)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      if (modalMode === 'create') {
        await createSource(formData);
        showToast('Official government source created successfully', 'success');
      } else if (modalMode === 'edit' && currentSource) {
        await updateSource(currentSource.id || currentSource._id, formData);
        showToast('Official source updated successfully', 'success');
      }

      setModalMode(null);
      await fetchSources();
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to save source';
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (src) => {
    const id = src.id || src._id;
    try {
      await updateSourceStatus(id, !src.isActive);
      showToast(`Source ${src.isActive ? 'deactivated' : 'activated'} successfully`, 'success');
      await fetchSources();
    } catch (err) {
      showToast(err.message || 'Failed to update source status', 'error');
    }
  };

  // Trigger Immediate Ingestion Crawl
  const handleTriggerIngest = async (src) => {
    const id = src.id || src._id;
    setTriggeringId(id);
    try {
      const res = await triggerSourceIngest(id);
      showToast(
        `Ingestion task queued successfully (Job ID: ${(res.job?.id || res.job?._id || '').slice(-8)})`,
        'success'
      );
    } catch (err) {
      showToast(err.message || 'Failed to trigger ingestion job', 'error');
    } finally {
      setTriggeringId(null);
    }
  };

  // Delete Confirmation (No optimistic deletion)
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteSource(deleteTarget.id || deleteTarget._id);
      showToast('Source deleted successfully', 'success');
      setDeleteTarget(null);
      await fetchSources();
    } catch (err) {
      showToast(err.message || 'Failed to delete source', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      header: 'Source Name & Authority',
      className: 'min-w-[200px]',
      render: (src) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-900">{src.name}</p>
          <p className="text-[11px] text-slate-500">{src.issuingAuthority}</p>
          <a
            href={src.url}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-mono text-emerald-700 hover:underline flex items-center space-x-1 truncate max-w-[240px]"
          >
            <span className="truncate">{src.url}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        </div>
      ),
    },
    {
      header: 'Type / Category',
      render: (src) => (
        <div className="space-y-0.5 text-xs">
          <span className="font-mono text-[11px] uppercase bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 block w-max">
            {src.sourceType}
          </span>
          <span className="text-[11px] text-slate-600 capitalize block pt-0.5">
            {src.category} • {src.docType}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (src) => (
        <button
          type="button"
          onClick={() => handleToggleStatus(src)}
          className={`px-2 py-0.5 rounded text-[11px] font-semibold border flex items-center space-x-1 cursor-pointer transition-colors ${
            src.isActive
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
          }`}
          title="Click to toggle active state"
        >
          {src.isActive ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Active</span>
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 text-slate-400" />
              <span>Inactive</span>
            </>
          )}
        </button>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right whitespace-nowrap',
      render: (src) => (
        <div className="flex items-center justify-end space-x-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!src.isActive || triggeringId === (src.id || src._id)}
            loading={triggeringId === (src.id || src._id)}
            onClick={() => handleTriggerIngest(src)}
            className="text-[11px] px-2 py-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
            title="Trigger immediate crawler ingestion"
          >
            <Play className="w-3 h-3 mr-1" />
            Ingest
          </Button>

          <button
            type="button"
            onClick={() => openEditModal(src)}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            title="Edit source configuration"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setDeleteTarget(src)}
            className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors"
            title="Delete source"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title={t('admin_sources_title', 'Official Government Sources Management')}
          subtitle={t(
            'admin_sources_subtitle',
            'Curate and configure verified government portals, gazette publications, and automated crawler targets.'
          )}
          phase="Phase 11"
        />

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={openCreateModal}
          className="text-xs font-semibold"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Official Source
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search source name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900"
          />
        </div>

        <select
          value={activeFilter}
          onChange={(e) => {
            setActiveFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-700 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-700 bg-white"
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

        {(searchQuery || activeFilter || categoryFilter) && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('');
              setCategoryFilter('');
              setPage(1);
            }}
            className="text-xs text-slate-600 px-2 py-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {/* Main Sources Table */}
      <AdminDataTable
        title="Curated Civic Sources"
        subtitle={`Showing ${sources.length} of ${totalItems} verified official portals`}
        columns={columns}
        data={sources}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={(newPage) => setPage(newPage)}
        emptyMessage="No official government sources found matching the specified filters."
      />

      {/* Create / Edit Source Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleFormSubmit}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {modalMode === 'create'
                    ? 'Add Official Government Source'
                    : 'Edit Source Configuration'}
                </h3>
                <p className="text-xs text-slate-500">
                  Validates against private IPs and strict government URL protocols
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
                {formError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-900 block mb-1">Source Name *</label>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={200}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Press Information Bureau (PIB)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1">Official Source URL *</label>
                <input
                  type="url"
                  required
                  maxLength={2048}
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://pib.gov.in/PressReleasePage.aspx..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Must start with http:// or https://. Private IPs and localhost are strictly
                  rejected.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-900 block mb-1">Source Type *</label>
                  <select
                    value={formData.sourceType}
                    onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="html">HTML Portal</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-900 block mb-1">Issuing Authority *</label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={200}
                    value={formData.issuingAuthority}
                    onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
                    placeholder="e.g. Ministry of Agriculture"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-900 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                    value={formData.docType}
                    onChange={(e) => setFormData({ ...formData, docType: e.target.value })}
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
                <label className="font-bold text-slate-900 block mb-1">
                  Operational Notes (Optional)
                </label>
                <textarea
                  maxLength={500}
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Daily gazette circular feed for southern zone"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalMode(null)}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={formLoading}>
                {modalMode === 'create' ? 'Create Source' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Official Source?"
        description={`Are you sure you want to delete "${deleteTarget?.name || 'this source'}"? Crawlers associated with this source will no longer run.`}
        confirmText="Delete Source"
        cancelText="Cancel"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        variant="danger"
      />
    </div>
  );
};

export default AdminSourcesPage;
