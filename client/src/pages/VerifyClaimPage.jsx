/**
 * @fileoverview Government Claim & Fact Verification Citizen Page.
 * Connects directly to POST /api/verify/claim.
 * Validates public claims against official gazettes.
 * Transparently handles HTTP 501 NOT_IMPLEMENTED without fabricated verdicts or mock fact-checks.
 */

import { useState } from 'react';
import { ShieldCheck, AlertTriangle, Send, RotateCcw, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader.jsx';
import { Card, CardHeader, CardBody } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { AIUnavailableState } from '../components/common/AIUnavailableState.jsx';
import { verifyClaim } from '../services/aiService.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function VerifyClaimPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [claim, setClaim] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittedClaim, setSubmittedClaim] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [validationError, setValidationError] = useState('');

  const minLength = 10;
  const maxLength = 2000;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const trimmed = claim.trim();
    if (trimmed.length < minLength) {
      setValidationError(
        t('verify_min_chars_error', `Please enter a claim with at least ${minLength} characters.`)
      );
      return;
    }
    if (trimmed.length > maxLength) {
      setValidationError(
        t('verify_max_chars_error', `Claim text cannot exceed ${maxLength} characters.`)
      );
      return;
    }

    setLoading(true);
    setAiError(null);
    setSubmittedClaim(trimmed);

    try {
      await verifyClaim({
        claim: trimmed,
        language,
      });
    } catch (err) {
      setAiError(err);
      if (err.isNotImplemented) {
        showToast(
          t(
            'ai_not_implemented_toast',
            'Claim verification service is scheduled for future integration.'
          ),
          'info'
        );
      } else {
        showToast(err.message || t('error_generic', 'An error occurred'), 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setClaim('');
    setSubmittedClaim(null);
    setAiError(null);
    setValidationError('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader
        title={t('verify_page_title', 'Government Claim & Fact Verification')}
        subtitle={t(
          'verify_page_subtitle',
          'Cross-references viral messages, social media claims, and circulars against verified government sources to curb civic misinformation.'
        )}
        phase="Phase 10"
      />

      {/* Honest Civic Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-xs sm:text-sm text-slate-700 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-900">
            {t('verify_grounding_title', 'Anti-Misinformation Guardrails')}
          </p>
          <p className="text-slate-600 leading-relaxed">
            {t(
              'verify_grounding_desc',
              'To eliminate rumors responsibly, JanSathi AI refuses to issue automated "True" or "False" verdicts without cryptographic gazette citations and Press Information Bureau (PIB) verification. The verification pipeline returns HTTP 501 until full source cross-referencing is ready.'
            )}
          </p>
        </div>
      </div>

      {/* Verification Query Form */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader
          title={t('verify_form_title', 'Submit Claim or Viral Circular')}
          subtitle={t(
            'verify_form_subtitle',
            'Paste a message, policy rumor, or news excerpt to evaluate against official gazette publications.'
          )}
        />
        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="verify-claim-input"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                {t('verify_claim_label', 'Claim / Rumor / Public Notice Text')}
                <span className="text-rose-500 ml-1">*</span>
              </label>

              <div className="relative">
                <textarea
                  id="verify-claim-input"
                  rows={5}
                  value={claim}
                  onChange={(e) => {
                    setClaim(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  placeholder={t(
                    'verify_placeholder',
                    'e.g. Government is distributing free solar pumps without any electricity connection charges under PM-KUSUM Component B...'
                  )}
                  maxLength={maxLength}
                  aria-invalid={!!validationError}
                  aria-describedby="claim-counter claim-error"
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 resize-none transition-colors disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>

              {/* Counter and Validation */}
              <div className="flex items-center justify-between mt-1 text-xs">
                {validationError ? (
                  <p id="claim-error" role="alert" className="text-rose-600 font-medium">
                    {validationError}
                  </p>
                ) : (
                  <p className="text-slate-500">
                    {t('verify_min_chars_note', 'Minimum 10 characters required')}
                  </p>
                )}
                <span
                  id="claim-counter"
                  className={`font-mono ${
                    claim.length > maxLength - 100 ? 'text-amber-600 font-bold' : 'text-slate-400'
                  }`}
                >
                  {claim.length}/{maxLength}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              {(claim || aiError) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={loading}
                  className="text-xs text-slate-700 border-slate-300 hover:bg-slate-100"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                  {t('btn_reset', 'Reset Form')}
                </Button>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                disabled={loading || claim.trim().length < minLength}
                className="text-xs sm:text-sm font-semibold"
              >
                <Send className="w-4 h-4 mr-1.5" aria-hidden="true" />
                {loading
                  ? t('verify_submitting', 'Cross-Referencing Sources...')
                  : t('verify_submit_btn', 'Verify Claim Against Sources')}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Transparent AI Unavailable State when 501 is returned */}
      {aiError && (
        <AIUnavailableState
          featureName={t('nav_verify', 'Government Claim Verification')}
          endpoint="POST /api/verify/claim"
          querySnippet={submittedClaim}
          description={t(
            'verify_unavailable_desc',
            'To prevent false fact-checking or inaccurate verdicts, the claim verification engine is intentionally locked with HTTP 501 NOT_IMPLEMENTED until official PIB Fact Check feeds and gazette semantic indexing are connected.'
          )}
          plannedFeatures={[
            t(
              'plan_feat_semantic',
              'Automated semantic comparison against official gazettes and PIB Fact Check feeds'
            ),
            t(
              'plan_feat_verdict',
              'Transparent verdict: Confirmed Official, Debunked Misinformation, or Unverified'
            ),
            t(
              'plan_feat_debunk_refs',
              'Official debunking references, press releases, and statutory gazette links'
            ),
            t(
              'plan_feat_shareable',
              'Citizen shareable card with verifiable citations to combat WhatsApp rumors'
            ),
          ]}
        />
      )}

      {/* Illustrative Sample Claims Section */}
      <div className="mt-8">
        <div className="mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center">
            <ShieldCheck className="w-4 h-4 mr-1.5 text-slate-400" aria-hidden="true" />
            {t('verify_examples_title', 'Illustrative Sample Claims (Hypothetical UI Examples)')}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {t(
              'verify_examples_disclaimer',
              'These statements are hypothetical examples provided solely for interface testing. They are NOT actual government announcements, verified facts, or official circulars.'
            )}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            t(
              'verify_ex1',
              'Viral message claims central government is offering Rs 5,000 monthly allowance to all unemployed youth.'
            ),
            t(
              'verify_ex2',
              'Notice circulating online states Aadhaar linkage is mandatory for state pension withdrawal by tomorrow.'
            ),
            t(
              'verify_ex3',
              'Message claims all farmer crop loans up to Rs 2 lakh have been waived unconditionally across India.'
            ),
            t(
              'verify_ex4',
              'Social post asserts new gazette has made Ayushman Bharat coverage universal without income ceilings.'
            ),
          ].map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setClaim(sample);
                setValidationError('');
              }}
              className="text-left p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors text-xs text-slate-700 leading-snug group flex items-start space-x-2"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span>{sample}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
