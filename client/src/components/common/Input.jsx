/**
 * @fileoverview Accessible form input component with error messaging and label association.
 */

import { forwardRef } from 'react';
import clsx from 'clsx';

export const Input = forwardRef(
  (
    {
      id,
      label,
      type = 'text',
      error,
      helperText,
      required = false,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const describedBy = clsx({
      [errorId]: !!error,
      [helperId]: !!helperText && !error,
    });

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={describedBy || undefined}
          className={clsx(
            'w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border bg-white transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            'disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed',
            error
              ? 'border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-rose-200'
              : 'border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-emerald-100',
            className
          )}
          {...props}
        />
        {error && (
          <p id={errorId} role="alert" className="text-xs font-medium text-rose-600">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-xs text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
