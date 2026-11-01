/**
 * @fileoverview Scheme Eligibility Evaluator Citizen Page.
 * Connects directly to POST /api/ai/eligibility.
 * Collects citizen demographic criteria and transparently handles HTTP 501 NOT_IMPLEMENTED
 * without fabricated eligibility percentages or fake qualification verdicts.
 */

import { useState } from 'react';
import { UserCheck, Shield, Send, RotateCcw, ListChecks } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader.jsx';
import { Card, CardHeader, CardBody } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { AIUnavailableState } from '../components/common/AIUnavailableState.jsx';
import { evaluateEligibility } from '../services/aiService.js';
import { useOptions } from '../context/OptionsContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function EligibilityPage() {
  const { t, language } = useLanguage();
  const { options } = useOptions();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    query: '',
    state: '',
    district: '',
    userCategory: '',
    educationLevel: '',
    annualFamilyIncomeRange: '',
    courseOrOccupation: '',
    socialCategory: '',
  });

  const [loading, setLoading] = useState(false);
  const [submittedQuery, setSubmittedQuery] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [validationError, setValidationError] = useState('');

  const minQueryLength = 3;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (validationError) setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const trimmedQuery = form.query.trim();
    if (trimmedQuery.length < minQueryLength) {
      setValidationError(
        t(
          'eligibility_min_query_error',
          `Please specify a target scheme or benefit with at least ${minQueryLength} characters.`
        )
      );
      return;
    }

    setLoading(true);
    setAiError(null);
    setSubmittedQuery(trimmedQuery);

    const payload = {
      query: trimmedQuery,
      language,
      applicant: {
        state: form.state || undefined,
        district: form.district.trim() || undefined,
        userCategory: form.userCategory || undefined,
        educationLevel: form.educationLevel || undefined,
        annualFamilyIncomeRange: form.annualFamilyIncomeRange || undefined,
        courseOrOccupation: form.courseOrOccupation.trim() || undefined,
        socialCategory: form.socialCategory.trim() || undefined,
      },
    };

    try {
      await evaluateEligibility(payload);
    } catch (err) {
      setAiError(err);
      if (err.isNotImplemented) {
        showToast(
          t(
            'ai_not_implemented_toast',
            'Eligibility evaluation service is scheduled for future integration.'
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
    setForm({
      query: '',
      state: '',
      district: '',
      userCategory: '',
      educationLevel: '',
      annualFamilyIncomeRange: '',
      courseOrOccupation: '',
      socialCategory: '',
    });
    setSubmittedQuery(null);
    setAiError(null);
    setValidationError('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader
        title={t('eligibility_page_title', 'Scheme Eligibility Evaluator')}
        subtitle={t(
          'eligibility_page_subtitle',
          'Deterministic & AI-assisted eligibility verification matching citizen demographic criteria against official scheme rules.'
        )}
        phase="Phase 10"
      />

      {/* Honest Civic Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-xs sm:text-sm text-slate-700 flex items-start space-x-3">
        <Shield className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-900">
            {t('eligibility_notice_title', 'Statutory Eligibility Verification Notice')}
          </p>
          <p className="text-slate-600 leading-relaxed">
            {t(
              'eligibility_notice_desc',
              'Official scheme eligibility is governed by gazette notification criteria. To prevent wrongful denials or misleading expectations, automated matching is not enabled until verified deterministic evaluation tables are loaded.'
            )}
          </p>
        </div>
      </div>

      {/* Eligibility Evaluation Form */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader
          title={t('eligibility_form_title', 'Enter Scheme & Applicant Criteria')}
          subtitle={t(
            'eligibility_form_subtitle',
            'Provide the target scheme name and demographic parameters to check against official qualifications.'
          )}
        />
        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Scheme Query */}
            <div>
              <label
                htmlFor="eligibility-query-input"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                {t('eligibility_scheme_label', 'Target Scheme or Benefit Program')}
                <span className="text-rose-500 ml-1">*</span>
              </label>
              <input
                id="eligibility-query-input"
                type="text"
                value={form.query}
                onChange={(e) => handleChange('query', e.target.value)}
                placeholder={t(
                  'eligibility_scheme_placeholder',
                  'e.g. PM Kisan Samman Nidhi, Post-Matric Scholarship, Ayushman Bharat'
                )}
                maxLength={500}
                required
                disabled={loading}
                aria-invalid={!!validationError}
                aria-describedby={validationError ? 'query-error' : undefined}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 transition-colors disabled:bg-slate-50 disabled:text-slate-400"
              />
              {validationError && (
                <p id="query-error" role="alert" className="text-rose-600 text-xs font-medium mt-1">
                  {validationError}
                </p>
              )}
            </div>

            {/* Grid of Applicant Demographics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* State */}
              <div>
                <label
                  htmlFor="eligibility-state-select"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  {t('eligibility_state_label', 'State of Residence')}
                </label>
                <select
                  id="eligibility-state-select"
                  value={form.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  disabled={loading}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">
                    {t('select_state_placeholder', 'All India / Not Specified')}
                  </option>
                  {(options.states || []).map((s) => {
                    const val = typeof s === 'object' ? s.value : s;
                    const lbl = typeof s === 'object' ? s.label : s;
                    return (
                      <option key={val} value={val}>
                        {lbl}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* District */}
              <div>
                <label
                  htmlFor="eligibility-district-input"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  {t('eligibility_district_label', 'District (Optional)')}
                </label>
                <input
                  id="eligibility-district-input"
                  type="text"
                  value={form.district}
                  onChange={(e) => handleChange('district', e.target.value)}
                  placeholder={t('eligibility_district_placeholder', 'e.g. Warangal, Patna, Pune')}
                  maxLength={100}
                  disabled={loading}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>

              {/* User Category */}
              <div>
                <label
                  htmlFor="eligibility-category-select"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  {t('eligibility_category_label', 'Citizen / Beneficiary Category')}
                </label>
                <select
                  id="eligibility-category-select"
                  value={form.userCategory}
                  onChange={(e) => handleChange('userCategory', e.target.value)}
                  disabled={loading}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">
                    {t('select_category_placeholder', 'Select Citizen Category')}
                  </option>
                  {(options.userCategories || []).map((c) => {
                    const val = typeof c === 'object' ? c.value : c;
                    const lbl = typeof c === 'object' ? c.label : c;
                    return (
                      <option key={val} value={val}>
                        {lbl}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Education Level */}
              <div>
                <label
                  htmlFor="eligibility-education-select"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  {t('eligibility_education_label', 'Education Level')}
                </label>
                <select
                  id="eligibility-education-select"
                  value={form.educationLevel}
                  onChange={(e) => handleChange('educationLevel', e.target.value)}
                  disabled={loading}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">
                    {t('select_education_placeholder', 'Select Education Level')}
                  </option>
                  {(options.educationLevels || []).map((edu) => {
                    const val = typeof edu === 'object' ? edu.value : edu;
                    const lbl = typeof edu === 'object' ? edu.label : edu;
                    return (
                      <option key={val} value={val}>
                        {lbl}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Annual Family Income */}
              <div>
                <label
                  htmlFor="eligibility-income-select"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  {t('eligibility_income_label', 'Annual Family Income Range')}
                </label>
                <select
                  id="eligibility-income-select"
                  value={form.annualFamilyIncomeRange}
                  onChange={(e) => handleChange('annualFamilyIncomeRange', e.target.value)}
                  disabled={loading}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">{t('select_income_placeholder', 'Select Income Range')}</option>
                  {(options.incomeRanges || []).map((inc) => {
                    const val = typeof inc === 'object' ? inc.value : inc;
                    const lbl = typeof inc === 'object' ? inc.label : inc;
                    return (
                      <option key={val} value={val}>
                        {lbl}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Course or Occupation */}
              <div>
                <label
                  htmlFor="eligibility-occupation-input"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  {t('eligibility_occupation_label', 'Course or Specific Occupation')}
                </label>
                <input
                  id="eligibility-occupation-input"
                  type="text"
                  value={form.courseOrOccupation}
                  onChange={(e) => handleChange('courseOrOccupation', e.target.value)}
                  placeholder={t(
                    'eligibility_occupation_placeholder',
                    'e.g. Small Farmer, B.Tech 2nd Year, Handloom Weaver'
                  )}
                  maxLength={100}
                  disabled={loading}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>

              {/* Social Category (Optional text per backend schema) */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="eligibility-social-input"
                  className="block text-xs font-semibold text-slate-700 mb-1"
                >
                  {t('eligibility_social_label', 'Social Category (Optional)')}
                </label>
                <input
                  id="eligibility-social-input"
                  type="text"
                  value={form.socialCategory}
                  onChange={(e) => handleChange('socialCategory', e.target.value)}
                  placeholder={t(
                    'eligibility_social_placeholder',
                    'e.g. General, OBC, SC, ST, EWS'
                  )}
                  maxLength={50}
                  disabled={loading}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
            </div>

            {/* Qualified Technical Notice */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 flex items-start space-x-2">
              <UserCheck
                className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <p>
                {t(
                  'eligibility_privacy_note',
                  'Demographic fields are sent as parameters to POST /api/ai/eligibility solely for criteria matching. Because this endpoint currently returns HTTP 501, no eligibility assessment is evaluated or stored.'
                )}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              {(form.query || aiError) && (
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
                disabled={loading || form.query.trim().length < minQueryLength}
                className="text-xs sm:text-sm font-semibold"
              >
                <Send className="w-4 h-4 mr-1.5" aria-hidden="true" />
                {loading
                  ? t('eligibility_evaluating', 'Evaluating Criteria...')
                  : t('eligibility_submit_btn', 'Evaluate Eligibility')}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Transparent AI Unavailable State when 501 is returned */}
      {aiError && (
        <AIUnavailableState
          featureName={t('nav_eligibility', 'Scheme Eligibility Evaluator')}
          endpoint="POST /api/ai/eligibility"
          querySnippet={submittedQuery}
          description={t(
            'eligibility_unavailable_desc',
            'To prevent wrongful denial of public benefits, automated eligibility evaluation is intentionally disabled until statutory rule engines and deterministic policy criteria are verified against gazettes.'
          )}
          plannedFeatures={[
            t(
              'plan_feat_matching',
              'Automated criteria matching against citizen profile (state, category, income, occupation)'
            ),
            t(
              'plan_feat_checklist',
              'Checklist of statutory documentation required before visiting government offices'
            ),
            t(
              'plan_feat_portals',
              'Direct links to official application portals and offline nodal officers'
            ),
            t(
              'plan_feat_breakdown',
              'Transparent breakdown of passing and failing qualification criteria (zero black-box AI)'
            ),
          ]}
        />
      )}

      {/* Criteria Breakdown Reference Guide */}
      <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center">
          <ListChecks className="w-4 h-4 mr-1.5 text-emerald-600" aria-hidden="true" />
          {t('eligibility_criteria_guide_title', 'Statutory Eligibility Verification Architecture')}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          {t(
            'eligibility_criteria_guide_desc',
            'When activated, JanSathi AI uses a hybrid deterministic rule engine. First, deterministic filters evaluate hard statutory thresholds (age, income ceiling, state domicile). Second, citation models verify documentation checklists directly from the gazette order.'
          )}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="font-bold text-slate-900 block mb-1">
              1. {t('criteria_step1_title', 'Deterministic Filter')}
            </span>
            <p className="text-slate-600">
              {t(
                'criteria_step1_desc',
                'Exact threshold checks for income, state domicile, and age.'
              )}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="font-bold text-slate-900 block mb-1">
              2. {t('criteria_step2_title', 'Gazette Verification')}
            </span>
            <p className="text-slate-600">
              {t(
                'criteria_step2_desc',
                'Cross-referenced against verified notification text in the repository.'
              )}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="font-bold text-slate-900 block mb-1">
              3. {t('criteria_step3_title', 'Zero Fabrication')}
            </span>
            <p className="text-slate-600">
              {t(
                'criteria_step3_desc',
                'If a rule is ambiguous, the system flags it for officer consultation.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
