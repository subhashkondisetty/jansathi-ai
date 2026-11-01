/**
 * @fileoverview Safe localStorage wrapper for JWT and client preferences.
 *
 * SECURITY NOTICE & ARCHITECTURAL TRADE-OFF:
 * Storing authentication tokens in localStorage presents an inherent security trade-off.
 * localStorage is accessible to any script running on this origin, making it vulnerable
 * to token exfiltration if a Cross-Site Scripting (XSS) vulnerability occurs.
 * We employ localStorage here because the JanSathi AI REST API contract mandates
 * HTTP Bearer token authorization in request headers ('Authorization: Bearer <token>').
 * This mechanism is NOT as secure as HttpOnly, SameSite, Secure cookies, but is safe
 * when paired with strict Content Security Policy (CSP), sanitization, and output encoding.
 * Never log or expose raw token values.
 */

const TOKEN_KEY = 'jansathi_auth_token';
const LANGUAGE_KEY = 'jansathi_preferred_lang';

export const tokenStorage = {
  /**
   * Retrieves the stored JWT token, returning null if unavailable or on storage error.
   * @returns {string|null}
   */
  getToken() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      return window.localStorage.getItem(TOKEN_KEY) || null;
    } catch {
      return null;
    }
  },

  /**
   * Securely saves the JWT token into local storage.
   * @param {string} token
   * @returns {boolean} True if successfully stored.
   */
  setToken(token) {
    if (!token || typeof token !== 'string') return false;
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      window.localStorage.setItem(TOKEN_KEY, token.trim());
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Removes the JWT token from storage.
   */
  removeToken() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      // Quietly ignore storage access restrictions
    }
  },

  /**
   * Retrieves the stored fallback language preference for unauthenticated visitors.
   * @returns {string|null}
   */
  getStoredLanguage() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      return window.localStorage.getItem(LANGUAGE_KEY) || null;
    } catch {
      return null;
    }
  },

  /**
   * Stores fallback language preference for unauthenticated visitors.
   * @param {string} lang
   */
  setStoredLanguage(lang) {
    if (!lang || typeof lang !== 'string') return;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(LANGUAGE_KEY, lang.trim().toLowerCase());
      }
    } catch {
      // Quietly ignore storage access restrictions
    }
  },
};

export default tokenStorage;
