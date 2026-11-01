/**
 * @fileoverview Accessible toast notification context supporting live regions,
 * keyboard dismissal, and distinct icon cues.
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'info', message, duration = 5000 }) => {
      const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newToast = { id, type, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const success = useCallback(
    (msg, duration) => addToast({ type: 'success', message: msg, duration }),
    [addToast]
  );
  const error = useCallback(
    (msg, duration) => addToast({ type: 'error', message: msg, duration }),
    [addToast]
  );
  const warning = useCallback(
    (msg, duration) => addToast({ type: 'warning', message: msg, duration }),
    [addToast]
  );
  const info = useCallback(
    (msg, duration) => addToast({ type: 'info', message: msg, duration }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      {/* Toast Notification Container */}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        aria-label="Notifications"
      >
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';
          const isSuccess = toast.type === 'success';

          let bgClasses = 'bg-slate-900 text-white border-slate-700';
          let IconComponent = Info;
          let iconColor = 'text-blue-400';

          if (isSuccess) {
            bgClasses = 'bg-emerald-950 text-emerald-100 border-emerald-800';
            IconComponent = CheckCircle2;
            iconColor = 'text-emerald-400';
          } else if (isError) {
            bgClasses = 'bg-rose-950 text-rose-100 border-rose-800';
            IconComponent = AlertCircle;
            iconColor = 'text-rose-400';
          } else if (isWarning) {
            bgClasses = 'bg-amber-950 text-amber-100 border-amber-800';
            IconComponent = AlertTriangle;
            iconColor = 'text-amber-400';
          }

          return (
            <div
              key={toast.id}
              role={isError ? 'alert' : 'status'}
              aria-live={isError ? 'assertive' : 'polite'}
              className={`pointer-events-auto flex items-start p-3.5 rounded-xl border shadow-lg transition-all transform duration-200 ease-out ${bgClasses}`}
            >
              <div className="flex-shrink-0 pt-0.5">
                <IconComponent className={`w-5 h-5 ${iconColor}`} aria-hidden="true" />
              </div>
              <div className="ml-3 flex-1 text-xs font-medium leading-relaxed break-words">
                {toast.message}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="ml-2 flex-shrink-0 p-1 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4 opacity-70 hover:opacity-100" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
