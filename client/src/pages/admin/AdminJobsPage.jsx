/**
 * @fileoverview Administrative Ingestion Queue Monitor Page.
 * Uses GET /api/admin/ingestion-jobs, GET /api/admin/ingestion-jobs/:id,
 * and POST /api/admin/ingestion-jobs/:id/retry.
 */

import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, RefreshCw, Eye, Filter } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { AdminDataTable } from '../../components/admin/AdminDataTable.jsx';
import {
  listIngestionJobs,
  getIngestionJob,
  retryIngestionJob,
} from '../../services/adminService.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/common/Button.jsx';

export const AdminJobsPage = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Selected job for detail modal
  const [selectedJob, setSelectedJob] = useState(null);

  // Retrying job state tracking
  const [retryingId, setRetryingId] = useState(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        sort: '-createdAt',
      };
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;

      const res = await listIngestionJobs(params);
      setJobs(res.items);
      setTotalItems(res.meta.total);
      setTotalPages(res.meta.totalPages);
    } catch (err) {
      showToast(err.message || t('error_generic', 'Failed to load ingestion jobs'), 'error');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter, t, showToast]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Handle Manual Retry (Mandatory Correction 7: Only failed jobs, handle 409, refresh real state)
  const handleRetry = async (jobId) => {
    setRetryingId(jobId);
    try {
      await retryIngestionJob(jobId);
      showToast('Job reset to queued state and scheduled for immediate processing', 'success');
      // Refresh real state after successful retry
      await fetchJobs();
      if (selectedJob && (selectedJob.id === jobId || selectedJob._id === jobId)) {
        const updated = await getIngestionJob(jobId);
        setSelectedJob(updated);
      }
    } catch (err) {
      // Gracefully handle 409 or other errors
      const msg = err.response?.data?.error?.message || err.message || 'Job retry failed';
      showToast(msg, 'error');
    } finally {
      setRetryingId(null);
    }
  };

  // Inspect full job details
  const handleInspect = async (jobId) => {
    try {
      const data = await getIngestionJob(jobId);
      setSelectedJob(data);
    } catch (err) {
      showToast(err.message || 'Failed to fetch job details', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const styles =
      {
        succeeded: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        running: 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse',
        queued: 'bg-amber-100 text-amber-800 border-amber-200',
        failed: 'bg-rose-100 text-rose-800 border-rose-200',
        skipped_duplicate: 'bg-slate-100 text-slate-700 border-slate-200',
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
      header: 'Job ID & Target',
      className: 'min-w-[200px]',
      render: (job) => (
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-slate-900">
              {(job.id || job._id).slice(-8)}
            </span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
              {job.type}
            </span>
          </div>
          <p className="text-xs text-slate-600 truncate max-w-[220px]">
            {job.documentId?.title || job.sourceId?.name || 'Corpus Item'}
          </p>
        </div>
      ),
    },
    {
      header: 'Pipeline Stage',
      className: 'whitespace-nowrap',
      render: (job) => (
        <div className="space-y-0.5">
          <span className="font-mono text-xs font-semibold text-slate-800 capitalize block">
            {job.stage || 'queued'}
          </span>
          <span className="text-[11px] text-slate-500 block">
            Attempts: {job.attempts || 0}
            {job.manualRetries ? ` (${job.manualRetries} retried)` : ''}
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (job) => getStatusBadge(job.status),
    },
    {
      header: 'Created / Updated',
      className: 'whitespace-nowrap text-xs text-slate-500 font-mono',
      render: (job) => (
        <div className="space-y-0.5">
          <span className="block">
            {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '—'}
          </span>
          <span className="block text-[11px] text-slate-400">
            {job.updatedAt ? new Date(job.updatedAt).toLocaleTimeString() : '—'}
          </span>
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right whitespace-nowrap',
      render: (job) => (
        <div className="flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={() => handleInspect(job.id || job._id)}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            title="Inspect job telemetry"
          >
            <Eye className="w-4 h-4" aria-hidden="true" />
          </button>

          {/* Mandatory Correction 7: Only available for status === 'failed' */}
          {job.status === 'failed' ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={retryingId === (job.id || job._id)}
              onClick={() => handleRetry(job.id || job._id)}
              className="text-[11px] font-semibold text-amber-700 border-amber-300 hover:bg-amber-50 px-2 py-1"
              title="Retry failed ingestion job"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          ) : (
            <span className="text-slate-300 text-xs px-2">—</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title={t('admin_jobs_title', 'Ingestion Pipeline & Job Queue Monitor')}
          subtitle={t(
            'admin_jobs_subtitle',
            'Real-time status of asynchronous background crawlers, PDF text extraction, and chunking jobs.'
          )}
          phase="Phase 11"
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={fetchJobs}
          loading={loading}
          className="text-xs font-semibold text-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Refresh Queue
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600">Filters:</span>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-700 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="queued">Queued</option>
          <option value="running">Running</option>
          <option value="succeeded">Succeeded</option>
          <option value="failed">Failed</option>
          <option value="skipped_duplicate">Duplicate (Skipped)</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-700 bg-white"
        >
          <option value="">All Job Types</option>
          <option value="upload">Citizen Upload</option>
          <option value="source_fetch">Official Source Crawler</option>
        </select>

        {(statusFilter || typeFilter) && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setStatusFilter('');
              setTypeFilter('');
              setPage(1);
            }}
            className="text-xs text-slate-600 px-2.5 py-1"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Main Table */}
      <AdminDataTable
        title="Background Worker Queue Tasks"
        subtitle={`Showing ${jobs.length} of ${totalItems} total jobs across worker pool`}
        columns={columns}
        data={jobs}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={(newPage) => setPage(newPage)}
        emptyMessage="No ingestion jobs found in queue matching the selected filter."
      />

      {/* Job Telemetry Inspection Modal (Mandatory Correction 8: Clean error display, no stack traces or secrets) */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Ingestion Job Inspection</h3>
                <span className="font-mono text-xs text-slate-500">
                  ID: {selectedJob.id || selectedJob._id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-bold text-slate-900 block">Job Type</span>
                  <p className="p-2 bg-slate-50 rounded-lg border border-slate-100 uppercase font-mono">
                    {selectedJob.type}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Job Status</span>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center">
                    {getStatusBadge(selectedJob.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-bold text-slate-900 block">Current Stage</span>
                  <p className="p-2 bg-slate-50 rounded-lg border border-slate-100 font-mono capitalize">
                    {selectedJob.stage}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">Execution Attempts</span>
                  <p className="p-2 bg-slate-50 rounded-lg border border-slate-100 font-mono">
                    {selectedJob.attempts || 0} / {selectedJob.maxAttempts || 3}
                  </p>
                </div>
              </div>

              {selectedJob.documentId && (
                <div>
                  <span className="font-bold text-slate-900 block">Associated Document</span>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                    <p className="font-semibold text-slate-900">
                      {selectedJob.documentId.title || 'Untitled Document'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Status: <span className="capitalize">{selectedJob.documentId.status}</span> •
                      Visibility:{' '}
                      <span className="capitalize">{selectedJob.documentId.visibility}</span>
                    </p>
                  </div>
                </div>
              )}

              {selectedJob.sourceId && (
                <div>
                  <span className="font-bold text-slate-900 block">Associated Source</span>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                    <p className="font-semibold text-slate-900">{selectedJob.sourceId.name}</p>
                    <p className="font-mono text-[11px] text-slate-500 truncate">
                      {selectedJob.sourceId.url}
                    </p>
                  </div>
                </div>
              )}

              {/* Error Information without raw stack traces or internal secrets */}
              {selectedJob.error && (
                <div>
                  <span className="font-bold text-rose-800 block">Error Telemetry</span>
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 space-y-1">
                    <p className="font-semibold text-xs">
                      {selectedJob.error.code ? `[${selectedJob.error.code}] ` : ''}
                      {selectedJob.error.message || 'An error occurred during ingestion'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <div>
                {selectedJob.status === 'failed' && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    loading={retryingId === (selectedJob.id || selectedJob._id)}
                    onClick={() => handleRetry(selectedJob.id || selectedJob._id)}
                    className="text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Retry Job
                  </Button>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedJob(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobsPage;
