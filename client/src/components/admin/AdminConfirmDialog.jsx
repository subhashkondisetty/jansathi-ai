/**
 * @fileoverview Accessible administrative confirmation dialog for destructive actions.
 * Enforces server confirmation before updating UI state (no optimistic destruction).
 */

import { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import Button from '../common/Button.jsx';

export const AdminConfirmDialog = ({
  isOpen,
  title,
  description,
  confirmText = 'Confirm Action',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  variant = 'danger', // 'danger' | 'warning'
}) => {
  const dialogRef = useRef(null);
  const confirmBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Focus the confirm button when modal opens
    setTimeout(() => {
      confirmBtnRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <div
        ref={dialogRef}
        className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg p-1"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="flex items-start space-x-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isDanger
                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            {isDanger ? (
              <Trash2 className="w-5 h-5" aria-hidden="true" />
            ) : (
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            )}
          </div>

          <div className="space-y-1.5 flex-1 pr-4">
            <h3 id="confirm-dialog-title" className="text-base font-bold text-slate-900">
              {title}
            </h3>
            <p
              id="confirm-dialog-desc"
              className="text-xs sm:text-sm text-slate-600 leading-relaxed"
            >
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>

          <Button
            ref={confirmBtnRef}
            type="button"
            variant={isDanger ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            loading={loading}
            className={
              isDanger ? 'bg-rose-600 hover:bg-rose-700 text-white border-transparent' : ''
            }
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminConfirmDialog;
