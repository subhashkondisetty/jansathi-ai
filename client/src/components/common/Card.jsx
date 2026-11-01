/**
 * @fileoverview Card container for grouping related content and actions.
 */

import clsx from 'clsx';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={clsx(
        'bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', title, subtitle, action }) => {
  return (
    <div
      className={clsx(
        'px-6 py-5 border-b border-slate-100 flex items-center justify-between',
        className
      )}
    >
      <div>
        {title && <h2 className="text-base font-bold text-slate-900 tracking-tight">{title}</h2>}
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        {children}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export const CardBody = ({ children, className = '' }) => {
  return <div className={clsx('p-6 space-y-4', className)}>{children}</div>;
};

export const CardFooter = ({ children, className = '' }) => {
  return (
    <div
      className={clsx(
        'px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
