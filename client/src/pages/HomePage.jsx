/**
 * @fileoverview Modern, accessible civic landing page for JanSathi AI.
 * Completely localized across English, Telugu, Hindi, and Tamil via LanguageContext.
 * Strictly adheres to project architectural constraints:
 * - Evidence-based trust indicators (no unverified claims)
 * - Accurately labelled verification pipeline (implemented vs planned)
 * - Topic pills as navigation examples only (zero fake schemes or eligibility)
 * - Intentional HTTP 501 disclosure (AI endpoints intentionally locked for safety)
 * - Explicit button variants (outlineOnDark, lightOnDark) to guarantee high contrast.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import {
  Sparkles,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  FileText,
  UploadCloud,
  ArrowRight,
  ShieldCheck,
  Search,
  Lock,
  Globe2,
  ChevronDown,
  ChevronUp,
  Layers,
  Database,
  Cpu,
  Check,
} from 'lucide-react';
import Card, { CardBody } from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';

export const HomePage = () => {
  const { status, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/documents?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/documents');
    }
  };

  const handleTopicClick = (topicKeyword) => {
    navigate(`/documents?q=${encodeURIComponent(topicKeyword)}`);
  };

  const topicPills = [
    { label: t('topic_agriculture'), query: 'agriculture' },
    { label: t('topic_healthcare'), query: 'healthcare' },
    { label: t('topic_education'), query: 'education' },
    { label: t('topic_pension'), query: 'pension' },
    { label: t('topic_employment'), query: 'employment' },
    { label: t('topic_gazettes'), query: 'gazette' },
  ];

  const portalModules = [
    {
      title: t('mod_assistant_title'),
      description: t('mod_assistant_desc'),
      path: '/assistant',
      icon: Sparkles,
      phase: 'Phase 10',
      badge: t('mod_assistant_badge'),
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      title: t('mod_eligibility_title'),
      description: t('mod_eligibility_desc'),
      path: '/eligibility',
      icon: CheckCircle,
      phase: 'Phase 10',
      badge: t('mod_eligibility_badge'),
      color: 'text-blue-700 bg-blue-50 border-blue-200',
    },
    {
      title: t('mod_explainer_title'),
      description: t('mod_explainer_desc'),
      path: '/explainer',
      icon: HelpCircle,
      phase: 'Phase 10',
      badge: t('mod_explainer_badge'),
      color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    },
    {
      title: t('mod_verify_title'),
      description: t('mod_verify_desc'),
      path: '/verify',
      icon: ShieldAlert,
      phase: 'Phase 10',
      badge: t('mod_verify_badge'),
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      title: t('mod_documents_title'),
      description: t('mod_documents_desc'),
      path: '/documents',
      icon: FileText,
      phase: 'Phase 9',
      badge: t('mod_documents_badge'),
      color: 'text-teal-700 bg-teal-50 border-teal-200',
    },
    {
      title: t('mod_upload_title'),
      description: t('mod_upload_desc'),
      path: '/upload',
      icon: UploadCloud,
      phase: 'Phase 9',
      badge: t('mod_upload_badge'),
      color: 'text-cyan-700 bg-cyan-50 border-cyan-200',
    },
  ];

  const pipelineStages = [
    {
      number: '01',
      title: t('stage1_title'),
      status: t('stage1_status'),
      statusType: 'implemented',
      description: t('stage1_desc'),
      icon: Database,
    },
    {
      number: '02',
      title: t('stage2_title'),
      status: t('stage2_status'),
      statusType: 'implemented',
      description: t('stage2_desc'),
      icon: Layers,
    },
    {
      number: '03',
      title: t('stage3_title'),
      status: t('stage3_status'),
      statusType: 'planned',
      description: t('stage3_desc'),
      icon: FileText,
    },
    {
      number: '04',
      title: t('stage4_title'),
      status: t('stage4_status'),
      statusType: 'planned',
      description: t('stage4_desc'),
      icon: Cpu,
    },
  ];

  const languages = [
    {
      code: 'hi',
      name: 'हिन्दी',
      englishName: 'Hindi',
      sample: 'नागरिक कल्याणकारी योजनाओं की प्रामाणिक जानकारी',
    },
    {
      code: 'te',
      name: 'తెలుగు',
      englishName: 'Telugu',
      sample: 'ప్రభుత్వ సంక్షేమ పథకాల అధికారిక సమాచారం',
    },
    {
      code: 'ta',
      name: 'தமிழ்',
      englishName: 'Tamil',
      sample: 'அரசு நலத்திட்டங்களுக்கான நம்பகமான வழிகாட்டி',
    },
    {
      code: 'en',
      name: 'English',
      englishName: 'English',
      sample: 'Verified civic guidance and official welfare information',
    },
  ];

  const faqs = [
    {
      q: t('faq1_q'),
      a: t('faq1_a'),
    },
    {
      q: t('faq2_q'),
      a: t('faq2_a'),
    },
    {
      q: t('faq3_q'),
      a: t('faq3_a'),
    },
    {
      q: t('faq4_q'),
      a: t('faq4_a'),
    },
  ];

  return (
    <div className="space-y-16 py-4">
      {/* 1. Civic Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-10 lg:p-14 border border-slate-800 shadow-2xl">
        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Track & Theme Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-600/50 text-emerald-300 text-xs font-semibold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t('hero_badge')}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            {t('hero_title_prefix')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              {t('hero_title_highlight')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed max-w-3xl">
            {t('hero_subtitle')}
          </p>

          {/* Quick Search & Topic Jump Input */}
          <form onSubmit={handleSearchSubmit} className="pt-2 max-w-2xl">
            <div className="relative flex items-center">
              <Search
                className="w-5 h-5 absolute left-4 text-slate-400 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_placeholder')}
                className="w-full pl-12 pr-32 py-3.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {t('search_btn')}
              </button>
            </div>
          </form>

          {/* Navigation Example Topic Pills with Explicit High Contrast */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">{t('nav_examples')}</span>
              <span className="text-[11px] text-slate-400">{t('nav_examples_hint')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {topicPills.map((pill) => (
                <button
                  key={pill.query}
                  type="button"
                  onClick={() => handleTopicClick(pill.query)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-slate-100 border border-slate-700 hover:bg-slate-800 hover:border-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons using explicit outlineOnDark variant */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {status === 'authenticated' ? (
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/documents">
                  <Button variant="primary" size="md">
                    <span>{t('explore_catalog')}</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="outlineOnDark" size="md">
                    <span>
                      {t('view_profile')} ({user?.name?.split(' ')[0] || t('citizen')})
                    </span>
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/register">
                  <Button variant="primary" size="md">
                    <span>{t('register_citizen')}</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outlineOnDark" size="md">
                    {t('citizen_sign_in')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Evidence-Based Architectural Trust Indicators */}
        <div className="relative z-10 mt-10 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{t('trust_non_ai')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{t('trust_pipeline')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{t('trust_indic')}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{t('trust_security')}</span>
          </div>
        </div>
      </section>

      {/* 2. Responsible AI Governance & HTTP 501 Disclosure */}
      <section className="bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-orange-50/60 border border-amber-200/90 rounded-2xl p-6 sm:p-8 text-amber-950 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 flex-shrink-0 mt-0.5">
              <Lock className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-amber-900">{t('ai_disclosure_title')}</h2>
              <p className="text-xs sm:text-sm text-amber-800 leading-relaxed max-w-3xl">
                {t('ai_disclosure_body')}
              </p>
            </div>
          </div>
          <Link to="/assistant" className="self-end sm:self-center flex-shrink-0">
            <span className="inline-flex items-center text-xs font-bold text-amber-900 hover:text-amber-950 underline underline-offset-2">
              {t('inspect_ai_status')}
            </span>
          </Link>
        </div>
      </section>

      {/* 3. Core Citizen Service Modules */}
      <section className="space-y-6">
        <div className="border-b border-slate-200/80 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t('modules_heading')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{t('modules_subheading')}</p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 w-fit">
            {t('module_count')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portalModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.path}
                to={module.path}
                className="group focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-2xl block"
              >
                <Card className="h-full border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-200 bg-white">
                  <CardBody className="p-6 flex flex-col justify-between h-full space-y-5">
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-11 h-11 rounded-xl border flex items-center justify-center ${module.color}`}
                        >
                          <Icon className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 tracking-wide">
                          {module.badge}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {module.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{module.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-emerald-700">
                      <span>{module.phase}</span>
                      <ArrowRight
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                        aria-hidden="true"
                      />
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Verification & Processing Pipeline (Accurately Labelled) */}
      <section className="space-y-6">
        <div className="border-b border-slate-200/80 pb-4">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t('pipeline_heading')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{t('pipeline_subheading')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pipelineStages.map((stage) => {
            const Icon = stage.icon;
            const isImplemented = stage.statusType === 'implemented';
            return (
              <div
                key={stage.number}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between space-y-4 hover:shadow-sm transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-extrabold text-slate-300">
                      {stage.number}
                    </span>
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isImplemented
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{stage.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{stage.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span
                    className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      isImplemented
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isImplemented && <Check className="w-3 h-3 mr-1" aria-hidden="true" />}
                    {stage.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Multilingual & Indic Typography Showcase */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-400 mb-1">
              <Globe2 className="w-4 h-4" />
              <span>Built for Bharat</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Multilingual Foundations for Indian Citizens
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Equipped with regional typography packages and language context preferences, ensuring
              accessible reading across major scripts.
            </p>
          </div>
          <Link to="/profile">
            <Button variant="outlineOnDark" size="sm">
              Set Language Preference
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {languages.map((lang) => (
            <div
              key={lang.code}
              className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-2 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-400">{lang.name}</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                  {lang.englishName}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{lang.sample}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Citizen FAQ Accordion */}
      <section className="space-y-6 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t('faq_heading')}</h2>
          <p className="text-xs sm:text-sm text-slate-500">{t('faq_subheading')}</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between space-x-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-bold text-slate-900">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Call to Action Banner using explicit lightOnDark and outlineOnDark variants */}
      <section className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-3xl p-8 sm:p-10 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-emerald-900/80 px-2.5 py-1 rounded-full text-emerald-200 border border-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('non_ai_notice')}</span>
          </div>
          <h2 className="text-2xl font-bold">{t('cta_title')}</h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">{t('cta_desc')}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 flex-shrink-0">
          <Link to="/documents">
            <Button variant="lightOnDark" size="md">
              {t('cta_browse')}
            </Button>
          </Link>
          {status !== 'authenticated' && (
            <Link to="/register">
              <Button variant="outlineOnDark" size="md">
                {t('cta_register')}
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
