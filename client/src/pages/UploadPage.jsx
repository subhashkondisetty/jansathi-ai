/**
 * @fileoverview Citizen Document Upload page (Phase 9).
 * Provides multi-stage drag-and-drop PDF upload with client validation,
 * upload progress tracking, metadata enrichment, and honest deduplication handling.
 * Supports complete multilingual UI localization across en, te, hi, and ta.
 */

import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  X,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  FileCheck,
} from 'lucide-react';
import { uploadDocument } from '../services/documentService.js';
import { useOptions } from '../context/OptionsContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Card, { CardHeader, CardBody } from '../components/common/Card.jsx';
import { formatBytes } from '../utils/formatters.js';

export default function UploadPage() {
  const { options } = useOptions();
  const { t } = useLanguage();
  const { error: toastError, success: toastSuccess } = useToast();
  const fileInputRef = useRef(null);

  // Dynamic limits from server /api/meta/options
  const maxMb = options.limits?.maxUploadMb || 10;
  const maxBytes = maxMb * 1024 * 1024;

  // Form State
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Metadata Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('other');
  const [docType, setDocType] = useState('other');
  const [language, setLanguage] = useState('unknown');
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [publishedAt, setPublishedAt] = useState('');

  // Upload Progress & Result State
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [rateLimitNotice, setRateLimitNotice] = useState(null);
  const [formError, setFormError] = useState(null);

  // Validate selected file
  const validateFile = (selectedFile) => {
    setFileError('');
    if (!selectedFile) return false;

    // Check extension
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf') {
      setFileError('Invalid file format. Only PDF documents (.pdf) are supported.');
      return false;
    }

    // Check size limit
    if (selectedFile.size > maxBytes) {
      setFileError(
        `File exceeds maximum allowable size of ${maxMb}MB (${formatBytes(selectedFile.size)}).`
      );
      return false;
    }

    return true;
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (validateFile(selected)) {
        setFile(selected);
      } else {
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      } else {
        setFile(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Reset form for fresh upload
  const handleResetForm = () => {
    setFile(null);
    setFileError('');
    setTitle('');
    setCategory('other');
    setDocType('other');
    setLanguage('unknown');
    setIssuingAuthority('');
    setSourceUrl('');
    setPublishedAt('');
    setUploadResult(null);
    setProgress(0);
    setFormError(null);
    setRateLimitNotice(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setFileError('Please select a PDF document to upload.');
      return;
    }

    if (!validateFile(file)) return;

    setUploading(true);
    setProgress(0);
    setFormError(null);
    setRateLimitNotice(null);

    const formData = new FormData();
    // Strictly field name 'file' per server uploadPdf middleware
    formData.append('file', file);

    if (title.trim()) formData.append('title', title.trim());
    if (category) formData.append('category', category);
    if (docType) formData.append('docType', docType);
    if (language) formData.append('language', language);
    if (issuingAuthority.trim()) formData.append('issuingAuthority', issuingAuthority.trim());
    if (sourceUrl.trim()) formData.append('sourceUrl', sourceUrl.trim());
    if (publishedAt) formData.append('publishedAt', publishedAt);

    try {
      const result = await uploadDocument(formData, (percent) => {
        setProgress(percent);
      });

      setUploadResult(result);
      if (result.status === 202) {
        toastSuccess('Document uploaded and queued for processing.');
      } else if (result.status === 200 && result.data?.duplicate) {
        toastSuccess('Document recognized (identical file already in system).');
      }
    } catch (err) {
      if (err.isRateLimited) {
        setRateLimitNotice(
          err.retryAfterSeconds
            ? `Upload rate limit reached. Please wait ${err.retryAfterSeconds} seconds before uploading another document.`
            : err.message || 'Upload rate limit reached. Please try again later.'
        );
      } else {
        setFormError(err.message || 'Failed to upload document.');
        toastError(err.message || 'Upload failed.');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <PageHeader
        title={t('upload_page_title', 'Upload Citizen Document')}
        subtitle={t(
          'upload_page_subtitle',
          'Submit official notifications, gazette clippings, or welfare guidelines for private text extraction and personal indexing.'
        )}
        phase="Phase 9"
      />

      {/* Upload Success View (202 Queued or 200 Duplicate) */}
      {uploadResult ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {uploadResult.status === 202
                ? t('upload_success_queued_title', 'Upload Accepted & Queued for Ingestion')
                : t('upload_success_duplicate_title', 'Identical Document Recognized (Duplicate)')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-lg mx-auto">
              {uploadResult.status === 202 ? (
                <>
                  Your document has passed cryptographic integrity checks and magic-byte validation.
                  Text extraction and indexing have been queued in the background.
                </>
              ) : uploadResult.data?.reason === 'already_in_library' ? (
                <>
                  An identical document with this exact SHA-256 checksum is already available in the{' '}
                  <span className="font-semibold text-slate-900">Official Public Library</span>. You
                  can view the verified gazette directly.
                </>
              ) : (
                <>
                  This document already exists in your personal documents. Storage was reused to
                  prevent duplicate storage.
                </>
              )}
            </p>
          </div>

          {/* Result Metadata Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Document ID:</span>
              <span className="text-slate-800 font-semibold truncate max-w-xs">
                {uploadResult.data?.document?.id || uploadResult.data?.document?._id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Status:</span>
              <span className="capitalize font-semibold text-emerald-700">
                {uploadResult.data?.document?.status === 'pending'
                  ? 'Pending Ingestion (Queued)'
                  : uploadResult.data?.document?.status || 'pending'}
              </span>
            </div>
            {uploadResult.data?.job && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Ingestion Stage:</span>
                <span className="uppercase text-blue-700 font-semibold">
                  {uploadResult.data?.job?.stage || 'queued'}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500 font-sans">Recorded Checksum:</span>
              <span className="truncate max-w-xs text-slate-600">
                {uploadResult.data?.document?.checksum}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to={`/documents/${uploadResult.data?.document?.id || uploadResult.data?.document?._id}`}
            >
              <Button variant="primary" size="md">
                {t('upload_success_open_reader', 'Open in Document Reader')}
                <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
              </Button>
            </Link>
            <Button variant="outline" size="md" onClick={handleResetForm}>
              <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
              {t('upload_success_another', 'Upload Another Document')}
            </Button>
          </div>
        </div>
      ) : (
        /* Main Upload Form Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: File Dropzone & Metadata Inputs (2 cols) */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dropzone Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  {t('upload_select_pdf', 'Select PDF Document')}
                </h2>

                {/* Dropzone area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : file
                        ? 'border-emerald-300 bg-emerald-50/20'
                        : 'border-slate-300 hover:border-slate-400 bg-slate-50/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="sr-only"
                    id="file-upload-input"
                    disabled={uploading}
                  />

                  {file ? (
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-emerald-200 shadow-sm max-w-md mx-auto">
                      <div className="flex items-center gap-3 truncate text-left">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                          <FileCheck className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {formatBytes(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        disabled={uploading}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-2"
                        title="Remove selected file"
                        aria-label="Remove selected file"
                      >
                        <X className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 mx-auto">
                        <Upload className="w-6 h-6" aria-hidden="true" />
                      </div>
                      <div>
                        <label
                          htmlFor="file-upload-input"
                          className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer focus:outline-none focus:underline"
                        >
                          {t('upload_click_browse', 'Click to browse')}
                        </label>
                        <span className="text-xs text-slate-500">
                          {' '}
                          {t('upload_drag_drop', 'or drag and drop a PDF here')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {t('upload_pdf_only_hint', 'PDF format only • Maximum allowable size:')}{' '}
                        {maxMb}MB
                      </p>
                    </div>
                  )}
                </div>

                {fileError && (
                  <p
                    role="alert"
                    className="text-xs font-semibold text-rose-600 flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    {fileError}
                  </p>
                )}
              </div>

              {/* Optional Metadata Enrichment Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-slate-900">
                    {t('upload_meta_title', 'Document Metadata (Optional)')}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Providing metadata improves search indexing across your personal catalog.
                  </p>
                </div>

                {/* Title */}
                <Input
                  id="doc-title"
                  label={t('upload_meta_title_label', 'Document Title')}
                  value={title}
                  maxLength={300}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t(
                    'upload_meta_title_placeholder',
                    'Leave empty to auto-extract from file name'
                  )}
                  disabled={uploading}
                  helperText="Recommended for official gazettes or scheme guidelines (min 2 characters)."
                />

                {/* Category and Doc Type Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label
                      htmlFor="meta-category"
                      className="block font-semibold text-slate-700 mb-1.5"
                    >
                      {t('upload_meta_category', 'Category')}
                    </label>
                    <select
                      id="meta-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      disabled={uploading}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs sm:text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
                    >
                      {options.docCategories?.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label || cat.value}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="meta-doctype"
                      className="block font-semibold text-slate-700 mb-1.5"
                    >
                      {t('upload_meta_doctype', 'Document Type')}
                    </label>
                    <select
                      id="meta-doctype"
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      disabled={uploading}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs sm:text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
                    >
                      {options.docTypes?.map((dt) => (
                        <option key={dt.value} value={dt.value}>
                          {dt.label || dt.value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Language and Published Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label
                      htmlFor="meta-language"
                      className="block font-semibold text-slate-700 mb-1.5"
                    >
                      {t('upload_meta_language', 'Document Language')}
                    </label>
                    <select
                      id="meta-language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      disabled={uploading}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs sm:text-sm focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="unknown">
                        {t('upload_meta_auto_detect', 'Auto-detect from text')}
                      </option>
                      {options.languages?.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.nativeLabel ? `${lang.label} (${lang.nativeLabel})` : lang.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Input
                      id="meta-published"
                      type="date"
                      label={t('upload_meta_published', 'Publication Date')}
                      value={publishedAt}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setPublishedAt(e.target.value)}
                      disabled={uploading}
                      helperText="Date of publication (must not be in the future)."
                    />
                  </div>
                </div>

                {/* Issuing Authority & Source URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="meta-authority"
                    label={t('upload_meta_authority', 'Issuing Authority')}
                    value={issuingAuthority}
                    maxLength={200}
                    onChange={(e) => setIssuingAuthority(e.target.value)}
                    placeholder="e.g. Ministry of Agriculture"
                    disabled={uploading}
                  />

                  <Input
                    id="meta-source"
                    type="url"
                    label={t('upload_meta_source', 'Source URL')}
                    value={sourceUrl}
                    maxLength={2048}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://..."
                    disabled={uploading}
                    helperText="Public portal link (http:// or https://)"
                  />
                </div>
              </div>

              {/* Progress Bar (during active upload) */}
              {uploading && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Uploading and verifying checksum...</span>
                    <span>{progress}%</span>
                  </div>
                  <div
                    className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <div
                      className="h-full bg-emerald-600 transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Rate Limit Notice (uses backend retry information only when present) */}
              {rateLimitNotice && (
                <div
                  role="alert"
                  className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3"
                >
                  <AlertTriangle
                    className="w-4 h-4 text-amber-600 mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <p className="leading-relaxed font-medium">{rateLimitNotice}</p>
                </div>
              )}

              {/* Form Level Error Banner */}
              {formError && (
                <div
                  role="alert"
                  className="bg-rose-50 border border-rose-300 rounded-2xl p-4 text-xs text-rose-900 flex items-start gap-3"
                >
                  <AlertCircle
                    className="w-4 h-4 text-rose-600 mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <p className="leading-relaxed font-medium">{formError}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Link to="/documents">
                  <Button variant="outline" size="md" disabled={uploading}>
                    {t('upload_cancel_btn', 'Cancel')}
                  </Button>
                </Link>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={uploading || !file}
                  className="px-6"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                      {t('upload_uploading_btn', 'Uploading')} ({progress}%)
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
                      {t('upload_submit_btn', 'Upload & Queue Ingestion')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column: Policies & Verification Guarantees (1 col) */}
          <div className="space-y-6">
            <Card>
              <CardHeader
                title={t('upload_specs_title', 'Upload Specifications')}
                subtitle={t(
                  'upload_specs_subtitle',
                  'Rules enforced by backend upload security pipeline'
                )}
              />
              <CardBody className="space-y-4 text-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-600">Allowed Format:</span>
                    <span className="font-mono font-bold text-slate-800">.pdf only</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-600">Maximum File Size:</span>
                    <span className="font-mono font-bold text-slate-800">{maxMb} MB</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-600">Files Per Upload:</span>
                    <span className="font-mono font-bold text-slate-800">1 single file</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-600">Default Visibility:</span>
                    <span className="font-bold text-purple-700">Private (Owner Only)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Hourly Rate Limit:</span>
                    <span className="font-mono text-slate-800">10 uploads / hour</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                    <span>Verified Platform Controls</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-600 leading-relaxed text-[11px]">
                    <li>
                      <span className="font-semibold text-slate-800">Magic Byte Inspection:</span>{' '}
                      Validates %PDF- header in the first 1024 bytes.
                    </li>
                    <li>
                      <span className="font-semibold text-slate-800">
                        Cryptographic Deduplication:
                      </span>{' '}
                      Computes SHA-256 checksum to prevent redundant storage.
                    </li>
                    <li>
                      <span className="font-semibold text-slate-800">Private Data Isolation:</span>{' '}
                      Citizen uploads are partitioned under user-scoped database keys.
                    </li>
                    <li>
                      <span className="font-semibold text-slate-800">Safe Filenames:</span>{' '}
                      Characters are sanitized to prevent directory traversal attacks.
                    </li>
                  </ul>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
