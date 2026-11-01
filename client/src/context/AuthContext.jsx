/**
 * @fileoverview Authentication context managing authentication status machine,
 * token lifecycle, citizen profile synchronization, and admin role resolution.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { tokenStorage } from '../utils/tokenStorage.js';
import { authService } from '../services/authService.js';
import { setUnauthorizedHandler, normalizeApiError } from '../services/api.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => tokenStorage.getToken());
  const [status, setStatus] = useState('loading'); // 'loading' | 'authenticated' | 'unauthenticated'
  const { error: toastError, info: toastInfo } = useToast();

  const logout = useCallback(
    (reason) => {
      tokenStorage.removeToken();
      setTokenState(null);
      setUser(null);
      setStatus('unauthenticated');
      if (reason) {
        toastInfo(reason);
      }
    },
    [toastInfo]
  );

  // Synchronize 401 interceptor callback without circular dependencies
  useEffect(() => {
    setUnauthorizedHandler((_err, _url) => {
      logout('Your session has expired. Please sign in again.');
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await authService.getProfile();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        setStatus('authenticated');
        return res.data.user;
      }
      throw new Error('Invalid user payload');
    } catch {
      tokenStorage.removeToken();
      setTokenState(null);
      setUser(null);
      setStatus('unauthenticated');
      return null;
    }
  }, []);

  // Initial authentication verification on app load
  useEffect(() => {
    const storedToken = tokenStorage.getToken();
    if (!storedToken) {
      setStatus('unauthenticated');
      setUser(null);
      return;
    }

    refreshProfile();
  }, [refreshProfile]);

  const login = useCallback(async (credentials) => {
    try {
      const res = await authService.login(credentials);
      if (res.success && res.data?.token && res.data?.user) {
        tokenStorage.setToken(res.data.token);
        setTokenState(res.data.token);
        setUser(res.data.user);
        setStatus('authenticated');
        return { success: true, user: res.data.user };
      }
      throw new Error('Malformed login response');
    } catch (err) {
      const norm = normalizeApiError(err);
      return { success: false, error: norm };
    }
  }, []);

  const register = useCallback(async (data) => {
    try {
      const res = await authService.register(data);
      if (res.success && res.data?.token && res.data?.user) {
        tokenStorage.setToken(res.data.token);
        setTokenState(res.data.token);
        setUser(res.data.user);
        setStatus('authenticated');
        return { success: true, user: res.data.user };
      }
      throw new Error('Malformed register response');
    } catch (err) {
      const norm = normalizeApiError(err);
      return { success: false, error: norm };
    }
  }, []);

  const updateProfile = useCallback(
    async (updates) => {
      try {
        const res = await authService.updateProfile(updates);
        if (res.success && res.data?.user) {
          setUser(res.data.user);
          return { success: true, user: res.data.user };
        }
        throw new Error('Failed to update profile');
      } catch (err) {
        const norm = normalizeApiError(err);
        toastError(norm.message);
        return { success: false, error: norm };
      }
    },
    [toastError]
  );

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        status,
        isAdmin,
        login,
        register,
        logout,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
