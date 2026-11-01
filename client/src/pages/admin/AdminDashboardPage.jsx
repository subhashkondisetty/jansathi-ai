/**
 * @fileoverview Administrative Dashboard Overview Page.
 * Visualizes authentic database-backed corpus statistics, ingestion queue telemetry,
 * sources counts, real-time health telemetry, and recent pipeline activities.
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Activity,
  Globe,
  Users,
  RefreshCw,
  Server,
  ArrowRight,
  Cpu,
  Clock,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { AdminStatCard } from '../../components/admin/AdminStatCard.jsx';
import {
  getDocumentOverviewStats,
  getIngestionOverviewStats,
  getSourceOverviewStats,
  listIngestionJobs,
  getHealth,
  getAiStatus,
} from '../../services/adminService.js';
import { listDocuments } from '../../services/documentService.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../../components/common/Button.jsx';
import Card, { CardHeader, CardBody } from '../../components/common/Card.jsx';

export const AdminDashboardPage = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);

  // Database-backed metrics
  const [docStats, setDocStats] = useState({
    total: 0,
    ready: 0,
    pending: 0,
    processing: 0,
    failed: 0,
    needs_ocr: 0,
  });

  const [jobStats, setJobStats] = useState({
    total: 0,
    queued: 0,
    running: 0,
    succeeded: 0,
    failed: 0,
    skipped_duplicate: 0,
  });

  const [sourceStats, setSourceStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  const [systemHealth, setSystemHealth] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentDocs, setRecentDocs] = useState([]);

  const fetchDashboardData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const [dStats, jStats, sStats, healthData, aiData, jobsRes, docsRes] = await Promise.all([
          getDocumentOverviewStats(),
          getIngestionOverviewStats(),
          getSourceOverviewStats(),
          getHealth().catch(() => ({ status: 'unavailable', database: 'unknown' })),
          getAiStatus().catch(() => ({ connected: false })),
          listIngestionJobs({ limit: 5, sort: '-createdAt' }).catch(() => ({ items: [] })),
          listDocuments({ scope: 'all', limit: 5, sort: '-createdAt' }).catch(() => ({
            items: [],
          })),
        ]);

        setDocStats(dStats);
        setJobStats(jStats);
        setSourceStats(sStats);
        setSystemHealth(healthData);
        setAiStatus(aiData);
        setRecentJobs(jobsRes.items || []);
        setRecentDocs(docsRes.items || []);
        setLastRefreshedAt(new Date());

        if (isRefresh) {
          showToast(
            t('admin_refresh_success', 'Administrative metrics updated successfully'),
            'success'
          );
        }
      } catch (err) {
        showToast(err.message || t('error_generic', 'Failed to refresh telemetry'), 'error');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [t, showToast]
  );

  useEffect(() => {
    fetchDashboardData(false);
  }, [fetchDashboardData]);

  const getStatusBadge = (status) => {
    const styles =
      {
        ready: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        succeeded: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        running: 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse',
        processing: 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse',
        queued: 'bg-amber-100 text-amber-800 border-amber-200',
        pending: 'bg-amber-100 text-amber-800 border-amber-200',
        failed: 'bg-rose-100 text-rose-800 border-rose-200',
        needs_ocr: 'bg-purple-100 text-purple-800 border-purple-200',
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

  return (
    <div className="space-y-6">
      {/* Page Header with Live Refresh Trigger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title={t('admin_dashboard_title', 'Civic Operations Dashboard')}
          subtitle={t(
            'admin_dashboard_subtitle',
            'Real-time administrative telemetry, ingestion queue monitoring, and corpus status.'
          )}
          phase="Phase 11"
        />

        <div className="flex items-center space-x-3 self-end sm:self-auto">
          {lastRefreshedAt && (
            <span className="text-xs text-slate-500 hidden md:inline flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Refreshed: {lastRefreshedAt.toLocaleTimeString()}
            </span>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fetchDashboardData(true)}
            loading={refreshing}
            className="text-xs font-semibold text-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
            {t('admin_btn_refresh', 'Refresh All')}
          </Button>
        </div>
      </div>

      {/* Top 4 Primary Core Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <AdminStatCard
          title={t('admin_stat_total_docs', 'Total Documents')}
          value={docStats.total}
          subtitle={`${docStats.ready} ready • ${docStats.pending + docStats.processing} in progress`}
          icon={FileText}
          badge={`${docStats.ready} Ready`}
          badgeVariant="emerald"
          loading={loading}
        />

        <AdminStatCard
          title={t('admin_stat_ingestion_jobs', 'Ingestion Jobs')}
          value={jobStats.total}
          subtitle={`${jobStats.succeeded} succeeded • ${jobStats.failed} failed`}
          icon={Activity}
          badge={`${jobStats.failed} Failed`}
          badgeVariant={jobStats.failed > 0 ? 'rose' : 'emerald'}
          loading={loading}
        />

        <AdminStatCard
          title={t('admin_stat_sources', 'Official Sources')}
          value={sourceStats.total}
          subtitle={`${sourceStats.active} active • ${sourceStats.inactive} paused`}
          icon={Globe}
          badge={`${sourceStats.active} Active`}
          badgeVariant="blue"
          loading={loading}
        />

        <AdminStatCard
          title={t('admin_stat_user_accounts', 'User Accounts')}
          value={null}
          unavailable={true}
          unavailableMessage={t(
            'admin_users_api_unavailable_short',
            'No backend user listing endpoint'
          )}
          subtitle="User administration API is currently not implemented"
          icon={Users}
          badge="Unavailable"
          badgeVariant="slate"
          loading={loading}
        />
      </div>

      {/* Detailed Status Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Status Breakdown */}
        <Card className="border-slate-200">
          <CardHeader
            title={t('admin_doc_breakdown_title', 'Document Corpus Breakdown')}
            subtitle={t(
              'admin_doc_breakdown_subtitle',
              'Actual counts across all public and private documents (GET /api/documents?scope=all)'
            )}
            action={
              <Link
                to="/admin/documents"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center"
              >
                <span>View Documents</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            }
          />
          <CardBody className="p-5 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Ready
                </span>
                <span className="text-xl font-bold text-emerald-700">{docStats.ready}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Processing
                </span>
                <span className="text-xl font-bold text-blue-700">{docStats.processing}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Pending
                </span>
                <span className="text-xl font-bold text-amber-700">{docStats.pending}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Needs OCR
                </span>
                <span className="text-xl font-bold text-purple-700">{docStats.needs_ocr}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Failed
                </span>
                <span className="text-xl font-bold text-rose-700">{docStats.failed}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Corpus Total
                </span>
                <span className="text-xl font-bold text-slate-900">{docStats.total}</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Ingestion Queue Breakdown */}
        <Card className="border-slate-200">
          <CardHeader
            title={t('admin_jobs_breakdown_title', 'Ingestion Pipeline Status')}
            subtitle={t(
              'admin_jobs_breakdown_subtitle',
              'Asynchronous crawler and upload queue telemetry (GET /api/admin/ingestion-jobs)'
            )}
            action={
              <Link
                to="/admin/jobs"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center"
              >
                <span>View Jobs</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            }
          />
          <CardBody className="p-5 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Succeeded
                </span>
                <span className="text-xl font-bold text-emerald-700">{jobStats.succeeded}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Running
                </span>
                <span className="text-xl font-bold text-blue-700">{jobStats.running}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Queued
                </span>
                <span className="text-xl font-bold text-amber-700">{jobStats.queued}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Failed
                </span>
                <span className="text-xl font-bold text-rose-700">{jobStats.failed}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Duplicates
                </span>
                <span className="text-xl font-bold text-slate-600">
                  {jobStats.skipped_duplicate}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Jobs
                </span>
                <span className="text-xl font-bold text-slate-900">{jobStats.total}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* System Telemetry Banner */}
      <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
            <Server className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>System Infrastructure Telemetry</span>
              <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                Node {systemHealth?.environment || 'production'}
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Database:{' '}
              <span
                className={
                  systemHealth?.database === 'connected'
                    ? 'text-emerald-400 font-semibold'
                    : 'text-rose-400 font-semibold'
                }
              >
                {systemHealth?.database || 'checking...'}
              </span>{' '}
              • Uptime: {Math.floor((systemHealth?.uptimeSeconds || 0) / 60)} min • AI Subsystem:{' '}
              <span className="text-amber-400 font-semibold">
                {aiStatus?.connected ? 'Online' : 'Disabled (HTTP 501)'}
              </span>
            </p>
          </div>
        </div>

        <Link to="/admin/system-status">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white"
          >
            <Cpu className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            Inspect Full System Telemetry
          </Button>
        </Link>
      </div>

      {/* Recent Activity: Recent Ingestion Jobs & Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Ingestion Jobs */}
        <Card className="border-slate-200">
          <CardHeader
            title="Recent Ingestion Tasks"
            subtitle="Latest pipeline jobs across sources and PDF uploads"
            action={
              <Link
                to="/admin/jobs"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                All Jobs →
              </Link>
            }
          />
          <CardBody className="p-0">
            {recentJobs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No recent ingestion jobs found.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {recentJobs.map((job) => (
                  <div
                    key={job.id || job._id}
                    className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[11px] text-slate-500">
                          {(job.id || job._id).slice(-8)}
                        </span>
                        <span className="font-semibold text-slate-900 truncate max-w-[200px]">
                          {job.documentId?.title || job.sourceId?.name || 'Corpus Ingestion'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Type: <span className="font-semibold">{job.type}</span> • Stage:{' '}
                        <span className="font-mono">{job.stage}</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {getStatusBadge(job.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Recent Document Additions */}
        <Card className="border-slate-200">
          <CardHeader
            title="Recent Document Ingestion"
            subtitle="Latest civic documents registered in the repository"
            action={
              <Link
                to="/admin/documents"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                All Documents →
              </Link>
            }
          />
          <CardBody className="p-0">
            {recentDocs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No documents found in corpus.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {recentDocs.map((doc) => (
                  <div
                    key={doc.id || doc._id}
                    className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-semibold text-slate-900 truncate max-w-[220px]">
                        {doc.title || 'Untitled Document'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {doc.issuingAuthority || 'Government of India'} •{' '}
                        <span className="capitalize">{doc.docType || 'Gazette'}</span> •{' '}
                        <span className="font-semibold text-slate-700 capitalize">
                          {doc.visibility}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {getStatusBadge(doc.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
