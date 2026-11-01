/**
 * @fileoverview Civic AI Assistant Citizen Page.
 * Connects directly to POST /api/ai/ask.
 * Preserves the Non-AI foundation principle by transparently handling HTTP 501 NOT_IMPLEMENTED
 * without fabricated responses or fake conversational bots.
 */

import { useState } from 'react';
import { Sparkles, Send, RotateCcw, Info, BookOpen } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader.jsx';
import { Card, CardHeader, CardBody } from '../components/common/Card.jsx';
import { Button } from '../components/common/Button.jsx';
import { AIUnavailableState } from '../components/common/AIUnavailableState.jsx';
import { askQuestion } from '../services/aiService.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function AssistantPage() {
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittedQuery, setSubmittedQuery] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [validationError, setValidationError] = useState('');

  const minLength = 3;
  const maxLength = 1000;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const trimmed = question.trim();
    if (trimmed.length < minLength) {
      setValidationError(
        t(
          'assistant_min_chars_error',
          `Please enter a question with at least ${minLength} characters.`
        )
      );
      return;
    }
    if (trimmed.length > maxLength) {
      setValidationError(
        t('assistant_max_chars_error', `Question cannot exceed ${maxLength} characters.`)
      );
      return;
    }

    setLoading(true);
    setAiError(null);
    setSubmittedQuery(trimmed);

    try {
      await askQuestion({
        question: trimmed,
        language,
      });
      // If ever implemented in the future, handle real response
    } catch (err) {
      // Expected 501 NOT_IMPLEMENTED in current phase
      setAiError(err);
      if (err.isNotImplemented) {
        showToast(
          t(
            'ai_not_implemented_toast',
            'AI Assistant endpoint is scheduled for future integration.'
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
    setQuestion('');
    setSubmittedQuery(null);
    setAiError(null);
    setValidationError('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader
        title={t('assistant_page_title', 'Civic AI Assistant')}
        subtitle={t(
          'assistant_page_subtitle',
          'Multilingual conversational assistant providing accurate guidance on Indian government schemes, citizen benefits, and public services.'
        )}
        phase="Phase 10"
      />

      {/* Honest Architectural Context Alert */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-xs sm:text-sm text-slate-700 flex items-start space-x-3">
        <Info className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-900">
            {t('assistant_grounding_title', 'Grounded Civic Architecture')}
          </p>
          <p className="text-slate-600 leading-relaxed">
            {t(
              'assistant_grounding_desc',
              'This assistant is designed to answer questions strictly using verified official gazettes and statutory policies. To prevent false welfare promises, conversational synthesis is kept inactive until full citation pipelines are online.'
            )}
          </p>
        </div>
      </div>

      {/* Query Form */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader
          title={t('assistant_form_title', 'Ask a Civic Question')}
          subtitle={t(
            'assistant_form_subtitle',
            'Enter your inquiry regarding welfare policies, gazettes, or eligibility criteria.'
          )}
        />
        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="assistant-question-input"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                {t('assistant_question_label', 'Your Question / Inquiry')}
                <span className="text-rose-500 ml-1">*</span>
              </label>

              <div className="relative">
                <textarea
                  id="assistant-question-input"
                  rows={4}
                  value={question}
                  onChange={(e) => {
                    setQuestion(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  placeholder={t(
                    'assistant_placeholder',
                    'e.g. What are the income limits and documentation required for PM-Kisan Samman Nidhi?'
                  )}
                  maxLength={maxLength}
                  aria-invalid={!!validationError}
                  aria-describedby="question-counter question-error"
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 resize-none transition-colors disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>

              {/* Character Counter & Validation */}
              <div className="flex items-center justify-between mt-1 text-xs">
                {validationError ? (
                  <p id="question-error" role="alert" className="text-rose-600 font-medium">
                    {validationError}
                  </p>
                ) : (
                  <p className="text-slate-500">
                    {t('assistant_min_chars_note', 'Minimum 3 characters')}
                  </p>
                )}
                <span
                  id="question-counter"
                  className={`font-mono ${
                    question.length > maxLength - 50 ? 'text-amber-600 font-bold' : 'text-slate-400'
                  }`}
                >
                  {question.length}/{maxLength}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              {(question || aiError) && (
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
                disabled={loading || question.trim().length < minLength}
                className="text-xs sm:text-sm font-semibold"
              >
                <Send className="w-4 h-4 mr-1.5" aria-hidden="true" />
                {loading
                  ? t('assistant_submitting', 'Submitting Inquiry...')
                  : t('assistant_submit_btn', 'Submit Inquiry')}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Transparent AI Unavailable State when 501 is returned */}
      {aiError && (
        <AIUnavailableState
          featureName={t('nav_assistant', 'Civic AI Assistant')}
          endpoint="POST /api/ai/ask"
          querySnippet={submittedQuery}
          description={t(
            'assistant_unavailable_desc',
            'To ensure zero hallucinations in civic welfare delivery, conversational question-answering is locked until our sovereign RAG pipeline and verified citation engine are connected.'
          )}
          plannedFeatures={[
            t(
              'plan_feat_rag',
              'Conversational RAG pipeline indexed over verified Indian government gazettes'
            ),
            t(
              'plan_feat_citation',
              'Official statutory citations with exact gazette notification and page numbers'
            ),
            t(
              'plan_feat_voice',
              'Indic language speech input and voice synthesis powered by Bhashini'
            ),
            t(
              'plan_feat_guardrails',
              'Strict guardrails preventing hallucinated welfare schemes or fake benefits'
            ),
          ]}
        />
      )}

      {/* Illustrative Sample Questions Section */}
      <div className="mt-8">
        <div className="mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center">
            <BookOpen className="w-4 h-4 mr-1.5 text-slate-400" aria-hidden="true" />
            {t(
              'assistant_examples_title',
              'Illustrative Sample Inquiries (UI Interaction Examples)'
            )}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {t(
              'assistant_examples_disclaimer',
              'These queries are provided solely for interface demonstration and do not represent official scheme rules, verified facts, or government advice.'
            )}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            t(
              'example_q1',
              'What are the eligibility criteria for the PM Awas Yojana rural housing grant?'
            ),
            t(
              'example_q2',
              'Which documents are required for state disability pension enrollment?'
            ),
            t(
              'example_q3',
              'How can a small farmer apply for subsidized drip irrigation under PMKSY?'
            ),
            t(
              'example_q4',
              'What is the minimum landholding required for central fertilizer subsidy?'
            ),
          ].map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuestion(sample);
                setValidationError('');
              }}
              className="text-left p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors text-xs text-slate-700 leading-snug group flex items-start space-x-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span>{sample}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
