/**
 * @fileoverview Accessible error state banner with role="alert" and optional retry action.
 */

import { AlertOctagon, RotateCw } from 'lucide-react';
import Button from './Button.jsx';

export const ErrorState = ({
  title = 'Unable to load content',
  message = 'An unexpected error occurred while communicating with the server.',
  onRetry,
}) => {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center p-8 text-center bg-rose-50/50 rounded-2xl border border-rose-200"
    >
      <div className="w-12 h-12 rounded-2xl bg-white border border-rose-200 flex items-center justify-center text-rose-600 mb-3 shadow-sm">
        <AlertOctagon className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-bold text-rose-900 mb-1">{title}</h3>
      <p className="text-xs text-rose-700 max-w-sm mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="border-rose-300 text-rose-800 hover:bg-rose-100"
        >
          <RotateCw className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
          Retry Request
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
