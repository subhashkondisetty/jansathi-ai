/**
 * @fileoverview Accessible loading spinner with polite live region announcement.
 */

export const LoadingSpinner = ({ size = 'md', message = 'Loading content...' }) => {
  const sizeClasses =
    {
      sm: 'w-4 h-4 border-2',
      md: 'w-8 h-8 border-3',
      lg: 'w-12 h-12 border-4',
    }[size] || 'w-8 h-8 border-3';

  return (
    <div
      role="status"
      aria-live="polite"
      className="inline-flex flex-col items-center justify-center space-y-2"
    >
      <div
        className={`${sizeClasses} border-emerald-600 border-t-transparent rounded-full animate-spin`}
        aria-hidden="true"
      />
      {message && <span className="text-xs font-medium text-slate-500">{message}</span>}
      <span className="sr-only">{message}</span>
    </div>
  );
};

export default LoadingSpinner;
