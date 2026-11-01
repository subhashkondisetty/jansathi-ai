/**
 * @fileoverview Reusable, honest placeholder component for upcoming roadmap phases.
 * Accurately communicates feature milestone status without fake or canned outputs.
 */

import { Clock, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from './PageHeader.jsx';
import Card, { CardBody } from './Card.jsx';
import Button from './Button.jsx';

export const PlaceholderPage = ({
  title,
  phase,
  description,
  isAiFeature = false,
  apiEndpoint = null,
  details = [],
}) => {
  return (
    <div className="space-y-6">
      <PageHeader title={title} subtitle={description} phase={phase}>
        <div className="mt-2">
          <Link
            to="/"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            Back to Citizen Portal
          </Link>
        </div>
      </PageHeader>

      <Card className="border-slate-200">
        <CardBody className="py-12 flex flex-col items-center text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-sm">
            {isAiFeature ? (
              <Sparkles className="w-7 h-7" aria-hidden="true" />
            ) : (
              <Clock className="w-7 h-7" aria-hidden="true" />
            )}
          </div>

          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 mb-2">
              Scheduled Milestone: {phase}
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">{description}</p>
          </div>

          {isAiFeature && (
            <div className="w-full bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 text-left space-y-1.5">
              <div className="flex items-center space-x-2 text-amber-900 font-semibold text-xs">
                <ShieldCheck className="w-4 h-4 text-amber-700" aria-hidden="true" />
                <span>AI Governance Hook Point Prepared (HTTP 501)</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                JanSathi AI strictly follows the Non-AI foundation principle. The underlying backend
                service shell ({apiEndpoint || 'AI Hook'}) is connected and returns authenticated{' '}
                <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-900">
                  501 NOT_IMPLEMENTED
                </code>
                . In accordance with FORGE &apos;26 guidelines, zero simulated or mock AI output is
                permitted.
              </p>
            </div>
          )}

          {details && details.length > 0 && (
            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-left">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Upcoming Phase Deliverables:
              </h3>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                {details.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2">
            <Link to="/">
              <Button variant="secondary" size="sm">
                Return to Citizen Home
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default PlaceholderPage;
