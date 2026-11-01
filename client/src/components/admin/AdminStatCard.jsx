/**
 * @fileoverview Reusable administrative metric stat card.
 * Supports live counters, loading skeleton, badge status, and unavailable states.
 */

import clsx from 'clsx';
import { HelpCircle } from 'lucide-react';

export const AdminStatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeVariant = 'emerald',
  loading = false,
  unavailable = false,
  unavailableMessage = 'Not Available',
  className = '',
  onClick,
}) => {
  const badgeClasses =
    {
      emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      amber: 'bg-amber-50 text-amber-800 border-amber-200',
      rose: 'bg-rose-50 text-rose-800 border-rose-200',
      blue: 'bg-blue-50 text-blue-800 border-blue-200',
      slate: 'bg-slate-100 text-slate-700 border-slate-200',
    }[badgeVariant] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white border border-slate-200 rounded-2xl p-5 shadow-xs transition-all relative overflow-hidden',
        onClick && 'cursor-pointer hover:border-slate-300 hover:shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            {title}
          </p>

          {loading ? (
            <div className="h-8 w-20 bg-slate-100 animate-pulse rounded-md mt-1" />
          ) : unavailable ? (
            <div className="flex items-center space-x-1.5 mt-1 text-slate-400">
              <span className="text-lg font-bold text-slate-400">—</span>
              <span className="text-xs italic">{unavailableMessage}</span>
            </div>
          ) : (
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {typeof value === 'number' ? value.toLocaleString() : (value ?? '0')}
            </p>
          )}

          {subtitle && <p className="text-xs text-slate-500 leading-normal pt-0.5">{subtitle}</p>}
        </div>

        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
        )}
      </div>

      {badge && !loading && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span
            className={clsx(
              'inline-flex items-center px-2 py-0.5 rounded-md font-semibold text-[11px] border',
              badgeClasses
            )}
          >
            {badge}
          </span>
          {unavailable && (
            <span title={unavailableMessage} className="text-slate-400 hover:text-slate-600">
              <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminStatCard;
