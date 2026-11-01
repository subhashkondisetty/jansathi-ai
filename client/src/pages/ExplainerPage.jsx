/**
 * @fileoverview Civic Document Explainer Citizen Page.
 * Supports /explainer and /explainer/:documentId.
 * Fetches authentic document metadata and parsed OCR text from /api/documents.
 * Transparently discloses that AI document summarization maps to POST /api/ai/ask
 * and currently returns HTTP 501 NOT_IMPLEMENTED, while keeping authentic text readable.
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  FileCheck2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Info,
  Layers,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader.jsx';
import { Card, CardHeader, CardBody } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { AIUnavailableState } from '../components/common/AIUnavailableState.jsx';
import { getDocumentById, getDocumentPages } from '../services/documentService.js';
import { askQuestion } from '../services/aiService.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function ExplainerPage() {
  const { documentId } = useParams();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [document, setDocument] = useState(null);
  const [pages, setPages] = useState([]);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [docError, setDocError] = useState(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    if (!documentId) return;

    let mounted = true;
    const fetchDocData = async () => {
      setLoadingDoc(true);
      setDocError(null);
      try {
        const docRes = await getDocumentById(documentId);
        if (mounted) {
          setDocument(docRes.document);
        }

        const pagesRes = await getDocumentPages(documentId, { page: 1, limit: 5 });
        if (mounted) {
          setPages(pagesRes.items || []);
        }
      } catch (err) {
        if (mounted) {
          setDocError(err.message || t('explainer_doc_fetch_error', 'Failed to load document'));
        }
      } finally {
        if (mounted) {
          setLoadingDoc(false);
        }
      }
    };

    fetchDocData();

    return () => {
      mounted = false;
    };
  }, [documentId, t]);

  const handleRequestExplanation = async () => {
    if (!documentId) return;

    setAiLoading(true);
    setAiError(null);

    try {
      await askQuestion({
        question: `Explain document: ${document?.title || documentId} in simple citizen terms`,
        documentId,
        language,
      });
    } catch (err) {
      setAiError(err);
      if (err.isNotImplemented) {
        showToast(
          t(
            'ai_not_implemented_toast',
            'Document explanation service is scheduled for future integration.'
          ),
          'info'
        );
      } else {
        showToast(err.message || t('error_generic', 'An error occurred'), 'error');
      }
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader
        title={t('explainer_page_title', 'Civic Document Explainer')}
        subtitle={t(
          'explainer_page_subtitle',
          'Simplifies complex gazette notifications, government orders (G.O.s), and legal circulars into clear citizen summaries.'
        )}
        phase="Phase 10"
      />

      {/* Honest Architectural Context Alert */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-xs sm:text-sm text-slate-700 flex items-start space-x-3">
        <Info className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-900">
            {t('explainer_grounding_title', 'Document Grounding & Verification Notice')}
          </p>
          <p className="text-slate-600 leading-relaxed">
            {t(
              'explainer_grounding_desc',
              'The Document Explainer operates on authentic gazettes stored in the official repository. You can read the verified extracted text below. AI summarization is deliberately locked with HTTP 501 until full citation and validation models are connected.'
            )}
          </p>
        </div>
      </div>

      {/* Case 1: Specific Document Selected */}
      {documentId ? (
        <div className="space-y-6">
          {loadingDoc ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <LoadingSpinner
                size="lg"
                message={t('loading_document', 'Loading authentic document...')}
              />
            </div>
          ) : docError ? (
            <Card className="border-rose-200 bg-rose-50/50">
              <CardBody className="p-6 text-center space-y-3">
                <p className="text-sm font-semibold text-rose-800">{docError}</p>
                <Link
                  to="/documents"
                  className="inline-flex items-center text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  <ArrowRight className="w-3.5 h-3.5 mr-1" />
                  {t('browse_catalog_btn', 'Browse Available Documents Catalog')}
                </Link>
              </CardBody>
            </Card>
          ) : document ? (
            <>
              {/* Document Overview Card */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader
                  title={document.title || t('untitled_document', 'Untitled Document')}
                  subtitle={`${document.issuingAuthority || t('official_authority', 'Government of India')} • ${
                    document.docType || 'Gazette'
                  } • ${document.language?.toUpperCase() || 'EN'}`}
                  action={
                    <Link
                      to={`/documents/${document._id}`}
                      className="inline-flex items-center text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      <span>{t('view_full_reader', 'Full Reader')}</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  }
                />
                <CardBody className="p-6 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-500 block">
                        {t('table_col_category', 'Category')}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {document.category || 'General'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{t('table_col_pages', 'Pages')}</span>
                      <span className="font-semibold text-slate-800">
                        {document.pageCount || pages.length || 1}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">
                        {t('table_col_status', 'Status')}
                      </span>
                      <span className="font-semibold text-emerald-700 capitalize">
                        {document.status || 'Ready'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">
                        {t('filter_language', 'Language')}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {document.language || 'English'}
                      </span>
                    </div>
                  </div>

                  {/* Trigger AI Explanation Action */}
                  <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-100">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">
                        {t('request_summary_title', 'AI Document Simplification')}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {t(
                          'request_summary_desc',
                          'Sends document context to POST /api/ai/ask for structured citizen takeaways.'
                        )}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={handleRequestExplanation}
                      loading={aiLoading}
                      className="text-xs font-semibold"
                    >
                      <Sparkles className="w-4 h-4 mr-1.5" aria-hidden="true" />
                      {aiLoading
                        ? t('explaining_btn', 'Requesting Explanation...')
                        : t('explain_document_btn', 'Request AI Explanation')}
                    </Button>
                  </div>
                </CardBody>
              </Card>

              {/* AI Unavailable Notice when clicked */}
              {aiError && (
                <AIUnavailableState
                  featureName={t('nav_explainer', 'Document Explainer')}
                  endpoint="POST /api/ai/ask (with documentId)"
                  querySnippet={`Explain document ID: ${documentId} ("${document.title}")`}
                  description={t(
                    'explainer_unavailable_desc',
                    'Document explanation requires sovereign LLM summarization over parsed OCR tokens. This endpoint is intentionally locked with HTTP 501 NOT_IMPLEMENTED until verified citation extraction is completed.'
                  )}
                  plannedFeatures={[
                    t(
                      'plan_feat_plain_lang',
                      'Plain-language simplification without legalistic jargon'
                    ),
                    t(
                      'plan_feat_takeaways',
                      'Key citizen takeaways: who is affected, what changes, and action steps'
                    ),
                    t(
                      'plan_feat_multilingual_synth',
                      'Multilingual synthesis into English, Hindi, Telugu, and Tamil'
                    ),
                    t(
                      'plan_feat_side_by_side',
                      'Side-by-side view with original gazette text and page highlights'
                    ),
                  ]}
                />
              )}

              {/* Authentic Extracted Text Preview */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader
                  title={t('extracted_text_heading', 'Authentic Extracted Text (From Repository)')}
                  subtitle={t(
                    'extracted_text_subheading',
                    'Direct OCR text stored in database from verified PDF processing.'
                  )}
                />
                <CardBody className="p-6 space-y-4">
                  {pages.length > 0 ? (
                    <div className="space-y-4">
                      {pages.map((p) => (
                        <div
                          key={p._id || p.pageNumber}
                          className="border border-slate-200 rounded-xl p-4 bg-slate-50/50"
                        >
                          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2 pb-1 border-b border-slate-200/60">
                            <span className="flex items-center">
                              <Layers className="w-3.5 h-3.5 mr-1 text-slate-400" />
                              {t('page_label', 'Page')} {p.pageNumber}
                            </span>
                            <span className="font-mono text-[11px]">
                              {p.charCount || p.text?.length || 0} chars
                            </span>
                          </div>
                          <p className="text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed line-clamp-6">
                            {p.text || t('no_page_text', 'No text extracted on this page.')}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-500">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p>
                        {t('no_pages_preview', 'No page text preview available for this document.')}
                      </p>
                    </div>
                  )}
                </CardBody>
              </Card>
            </>
          ) : null}
        </div>
      ) : (
        /* Case 2: No Document Selected (Overview & Catalog Selector) */
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader
              title={t('explainer_select_title', 'Select a Civic Document to Explain')}
              subtitle={t(
                'explainer_select_subtitle',
                'Choose an official gazette notification, circular, or scheme order from the repository.'
              )}
            />
            <CardBody className="p-6 space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t(
                  'explainer_select_desc',
                  'To explain a document, browse the verified document library and click "Explain Document" on any policy or circular. You will be able to inspect both the raw text and the scheduled AI simplification.'
                )}
              </p>

              <div className="pt-2">
                <Link to="/documents">
                  <Button variant="primary" size="md" className="text-xs sm:text-sm font-semibold">
                    <BookOpen className="w-4 h-4 mr-1.5" aria-hidden="true" />
                    {t('browse_catalog_btn', 'Browse Available Documents Catalog')}
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>

          {/* Planned Features Preview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center">
              <FileCheck2 className="w-4 h-4 mr-1.5 text-emerald-600" aria-hidden="true" />
              {t('explainer_capabilities_title', 'Document Explainer Features')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="font-bold text-slate-900 block mb-1">
                  {t(
                    'plan_feat_plain_lang',
                    'Plain-language simplification without legalistic jargon'
                  )}
                </span>
                <p className="text-slate-600">
                  {t(
                    'explainer_feat1_desc',
                    'Translates complex administrative orders into understandable civic guidance.'
                  )}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="font-bold text-slate-900 block mb-1">
                  {t(
                    'plan_feat_takeaways',
                    'Key citizen takeaways: who is affected, what changes, and next steps'
                  )}
                </span>
                <p className="text-slate-600">
                  {t(
                    'explainer_feat2_desc',
                    'Clear action steps, deadlines, and requirements highlighted for citizens.'
                  )}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="font-bold text-slate-900 block mb-1">
                  {t(
                    'plan_feat_multilingual_synth',
                    'Multilingual synthesis into English, Hindi, Telugu, and Tamil'
                  )}
                </span>
                <p className="text-slate-600">
                  {t(
                    'explainer_feat3_desc',
                    'Accessible across regional languages with accurate civic terminology.'
                  )}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="font-bold text-slate-900 block mb-1">
                  {t(
                    'plan_feat_side_by_side',
                    'Side-by-side view with original gazette text and page highlights'
                  )}
                </span>
                <p className="text-slate-600">
                  {t(
                    'explainer_feat4_desc',
                    'Verify every summary bullet directly against the authentic gazette page.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
