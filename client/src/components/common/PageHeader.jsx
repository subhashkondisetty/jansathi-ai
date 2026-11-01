/**
 * @fileoverview Standard civic page header with title, subtitle, phase badge, and action buttons.
 */

export const PageHeader = ({ title, subtitle, phase, action, children }) => {
  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-6">
      <div>
        <div className="flex items-center space-x-3 mb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h1>
          {phase && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {phase}
            </span>
          )}
        </div>
        {subtitle && <p className="text-sm text-slate-600 max-w-2xl">{subtitle}</p>}
        {children}
      </div>
      {action && <div className="flex-shrink-0 flex items-center space-x-2">{action}</div>}
    </div>
  );
};

export default PageHeader;
