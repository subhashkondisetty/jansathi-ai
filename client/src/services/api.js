/**
 * @fileoverview Central Axios HTTP client with Bearer authorization,
 * idempotent interceptor lifecycle, and standardized normalizeApiError().
 */

import axios from 'axios';
import { tokenStorage } from '../utils/tokenStorage.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Normalized API error shape.
 * @typedef {Object} NormalizedApiError
 * @property {string} code - Machine-readable error code (e.g. 'VALIDATION_ERROR', 'UNAUTHENTICATED')
 * @property {string} message - Human-friendly sanitized error message
 * @property {number} status - HTTP status code (0 for network errors)
 * @property {Array<{field?: string, message: string}>|undefined} details - Field-level validation issues
 * @property {number|null} retryAfterSeconds - Seconds to wait before retry (for 429)
 * @property {boolean} isNetworkError - True if request failed before server response
 * @property {boolean} isNotImplemented - True if endpoint returned HTTP 501
 * @property {boolean} isRateLimited - True if endpoint returned HTTP 429
 */

/**
 * Transforms any Axios, network, or server error into a unified, consistent shape.
 *
 * @param {Error|Object} err - Raw error candidate
 * @returns {NormalizedApiError}
 */
export const normalizeApiError = (err) => {
  if (!err) {
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred. Please try again.',
      status: 500,
      details: undefined,
      retryAfterSeconds: null,
      isNetworkError: false,
      isNotImplemented: false,
      isRateLimited: false,
    };
  }

  // 1. Network / Connection drop errors
  if (err.isAxiosError && !err.response) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to server. Please check your network connection.',
      status: 0,
      details: undefined,
      retryAfterSeconds: null,
      isNetworkError: true,
      isNotImplemented: false,
      isRateLimited: false,
    };
  }

  const response = err.response || {};
  const status = response.status || 500;
  const data = response.data || {};
  const serverError = data.error || {};

  const isNotImplemented = status === 501;
  const isRateLimited = status === 429;

  // Retry-After extraction from headers or body
  let retryAfterSeconds = null;
  if (isRateLimited) {
    const headerVal = response.headers ? response.headers['retry-after'] : null;
    if (headerVal) {
      retryAfterSeconds = parseInt(headerVal, 10) || null;
    }
    if (!retryAfterSeconds && serverError.details?.retryAfterSeconds) {
      retryAfterSeconds = serverError.details.retryAfterSeconds;
    }
  }

  // Standardize 501 message
  let message = serverError.message || err.message || 'An unexpected error occurred';
  if (isNotImplemented) {
    message = 'Not available yet.';
  } else if (isRateLimited) {
    message = message || 'Too many requests. Please slow down and try again.';
  }

  return {
    code:
      serverError.code ||
      (isNotImplemented ? 'NOT_IMPLEMENTED' : isRateLimited ? 'RATE_LIMITED' : 'API_ERROR'),
    message,
    status,
    details: Array.isArray(serverError.details) ? serverError.details : undefined,
    retryAfterSeconds,
    isNetworkError: false,
    isNotImplemented,
    isRateLimited,
  };
};

// Safe unauthorized callback registration to decouple Axios from React Router / Context
let unauthorizedHandler = null;

/**
 * Registers a global handler invoked when an authenticated request receives HTTP 401.
 * Avoids circular dependencies between React contexts and API services.
 *
 * @param {Function|null} handler - Callback accepting (error, requestedUrl)
 */
export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

// Clear existing interceptors during Vite HMR reloads
if (api._requestInterceptorId !== undefined) {
  api.interceptors.request.eject(api._requestInterceptorId);
}
if (api._responseInterceptorId !== undefined) {
  api.interceptors.response.eject(api._responseInterceptorId);
}

// 1. Request Interceptor: Attach Bearer JWT
api._requestInterceptorId = api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Handle 401 on non-auth endpoints
api._responseInterceptorId = api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    // Ignore 401s from login or register endpoints to avoid redirect loops
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');

    if (status === 401 && !isAuthEndpoint) {
      tokenStorage.removeToken();
      if (typeof unauthorizedHandler === 'function') {
        try {
          unauthorizedHandler(normalizeApiError(error), url);
        } catch {
          // Prevent handler failure from masking rejection
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
