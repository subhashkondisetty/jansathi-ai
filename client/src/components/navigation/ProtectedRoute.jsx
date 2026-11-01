/**
 * @fileoverview Protected route guard redirecting unauthenticated visitors to /login.
 */

import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';

export const ProtectedRoute = ({ children }) => {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <LoadingSpinner message="Verifying authentication..." />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
