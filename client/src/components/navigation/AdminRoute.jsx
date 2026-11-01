/**
 * @fileoverview Strict admin route guard requiring both server-verified admin role
 * and an active, verified administrative session (GET /api/admin/session).
 */

import { useState, useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { authService } from '../../services/authService.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import { ShieldAlert } from 'lucide-react';

export const AdminRoute = ({ children }) => {
  const { user, status, isAdmin } = useAuth();
  const location = useLocation();
  const [sessionVerified, setSessionVerified] = useState(false);
  const [sessionChecking, setSessionChecking] = useState(true);
  const [verificationError, setVerificationError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function verifyAdminSession() {
      if (status !== 'authenticated' || !isAdmin) {
        if (isMounted) setSessionChecking(false);
        return;
      }

      setSessionChecking(true);
      setVerificationError(null);

      try {
        const res = await authService.getAdminSession();
        if (isMounted) {
          if (res.success && res.data?.role === 'admin') {
            setSessionVerified(true);
          } else {
            setSessionVerified(false);
            setVerificationError('Admin session verification failed');
          }
        }
      } catch (err) {
        if (isMounted) {
          setSessionVerified(false);
          setVerificationError(err.response?.data?.error?.message || 'Unauthorized admin access');
        }
      } finally {
        if (isMounted) setSessionChecking(false);
      }
    }

    if (status !== 'loading') {
      verifyAdminSession();
    }

    return () => {
      isMounted = false;
    };
  }, [status, isAdmin, user?.id]);

  if (status === 'loading' || sessionChecking) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <LoadingSpinner message="Verifying administrative authority..." />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Non-admin citizen attempting to access admin route
  if (!isAdmin || !sessionVerified) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 shadow-sm p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 text-rose-600 mb-4">
            <ShieldAlert className="w-6 h-6" aria-hidden="true" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 mb-1">Access Restricted</h1>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            {verificationError ||
              'This section requires verified government administrator authority.'}
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Return to Citizen Home
          </a>
        </div>
      </div>
    );
  }

  return children ? children : <Outlet />;
};

export default AdminRoute;
