/**
 * @fileoverview Accessible button component with variant support and focus outlines.
 * Supports explicit light and dark surface variants to guarantee high contrast.
 */

import clsx from 'clsx';
import LoadingSpinner from './LoadingSpinner.jsx';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  icon = null,
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles =
    {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-xs sm:text-sm',
      lg: 'px-6 py-2.5 text-sm sm:text-base',
    }[size] || 'px-4 py-2 text-sm';

  const variantStyles =
    {
      primary:
        'bg-emerald-700 text-white hover:bg-emerald-800 focus:ring-emerald-600 shadow-sm shadow-emerald-900/10 active:bg-emerald-900',
      secondary:
        'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-700 shadow-sm active:bg-black',
      outline:
        'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:ring-slate-400 active:bg-slate-100 shadow-sm',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm active:bg-rose-800',
      ghost:
        'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400 active:bg-slate-200',
      outlineOnDark:
        'bg-slate-900 text-white border border-slate-600 hover:bg-slate-800 focus:ring-emerald-400 active:bg-slate-950 shadow-sm',
      lightOnDark:
        'bg-white text-emerald-950 border border-white hover:bg-emerald-50 focus:ring-white active:bg-emerald-100 shadow-sm',
    }[variant] || 'bg-emerald-700 text-white hover:bg-emerald-800 focus:ring-emerald-600';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(baseStyles, sizeStyles, variantStyles, className)}
      {...props}
    >
      {loading ? (
        <span className="flex items-center space-x-2">
          <LoadingSpinner size="sm" message="" />
          <span>Processing...</span>
        </span>
      ) : (
        <span className="inline-flex items-center justify-center">
          {icon && (
            <span className="mr-1.5 flex-shrink-0" aria-hidden="true">
              {icon}
            </span>
          )}
          {children}
        </span>
      )}
    </button>
  );
};

export default Button;
