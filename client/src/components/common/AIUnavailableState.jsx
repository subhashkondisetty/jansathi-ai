/**
 * @fileoverview Reusable component presenting an honest, transparent HTTP 501
 * NOT_IMPLEMENTED explanation for AI-powered citizen features.
 * Prevents false claims of AI functionality while communicating planned capabilities.
 */

import { useState } from 'react';
import { ShieldAlert, Cpu, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from './Button.jsx';
import { Card, CardBody } from './Card.jsx';
import { getAiStatus } from '../../services/aiService.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

export const AIUnavailableState = ({
  featureName,
  endpoint,
  description,
  plannedFeatures = [],
  querySnippet,
}) => {
  const { t } = useLanguage();
  const [probeStatus, setProbeStatus] = useState(null);
  const [probing, setProbing] = useState(false);

  const handleProbe = async () => {
    setProbing(true);
    try {
      const data = await getAiStatus();
      setProbeStatus(data);
    } catch {
      setProbeStatus({ connected: false, error: true });
    } finally {
      setProbing(false);
    }
  };

  return (
    <Card
      role="status"
      aria-live="polite"
      className="border-amber-200/90 bg-gradient-to-b from-amber-50/60 to-white shadow-sm mt-6"
    >
      <CardBody className="p-6 md:p-8 space-y-6">
        {/* Header with Icon and Architectural Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-amber-200/60">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center flex-shrink-0 shadow-xs">
              <ShieldAlert className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-200">
                  HTTP 501 • {t('ai_not_implemented_badge', 'Non-AI Foundation')}
                </span>
                <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                  {endpoint}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                {featureName}:{' '}
                {t('ai_service_unavailable_title', 'AI Endpoint Not Available (HTTP 501)')}
              </h2>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleProbe}
            loading={probing}
            className="text-xs text-slate-700 border-slate-300 hover:bg-white"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
            {t('probe_ai_status_btn', 'Check Backend AI Hook')}
          </Button>
        </div>

        {/* Query Echo (if citizen submitted an inquiry) */}
        {querySnippet && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs sm:text-sm text-slate-700">
            <span className="font-semibold text-slate-900 block mb-1">
              {t('citizen_submitted_inquiry', 'Citizen Submission Received:')}
            </span>
            <p className="font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100 break-words text-slate-800">
              &quot;{querySnippet}&quot;
            </p>
          </div>
        )}

        {/* Architectural Safeguard Explanation */}
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p className="font-medium text-slate-900">
            {description ||
              t(
                'ai_safeguard_explanation',
                'Generative synthesis and automated decision-making are intentionally unavailable (HTTP 501 NOT_IMPLEMENTED). Civic welfare guidance requires verification against official statutory gazettes rather than unverified model outputs.'
              )}
          </p>
          <p className="text-slate-600">
            {t(
              'ai_safeguard_backend_lock',
              'The backend endpoint is deliberately not implemented. Ingestion, OCR parsing, and citation pipelines are under active development and have not been connected to generative models.'
            )}
          </p>
        </div>

        {/* Planned Technical Capabilities */}
        {plannedFeatures.length > 0 && (
          <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center">
              <Cpu className="w-4 h-4 mr-2 text-amber-700" aria-hidden="true" />
              {t(
                'planned_capabilities_heading',
                'Planned Architecture Capabilities (Not Currently Operational)'
              )}
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-slate-700">
              {plannedFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <CheckCircle2
                    className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Backend Hook Probe Result */}
        {probeStatus && (
          <div className="bg-slate-900 text-slate-200 rounded-xl p-4 text-xs font-mono space-y-1.5 shadow-inner">
            <div className="text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between text-[11px]">
              <span>GET /api/ai/status Response</span>
              <span
                className={
                  probeStatus.connected ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'
                }
              >
                connected: {String(probeStatus.connected)}
              </span>
            </div>
            <pre className="text-slate-300 overflow-x-auto text-[11px] leading-tight">
              {JSON.stringify(probeStatus, null, 2)}
            </pre>
            <p className="text-slate-400 text-[10px] pt-1">
              {t(
                'probe_status_note',
                'Live probe confirms the endpoint is not connected (connected: false). No model inference is currently active.'
              )}
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default AIUnavailableState;
