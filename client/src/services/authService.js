/**
 * @fileoverview Authentication and user profile service interacting with the JanSathi API.
 */

import api from './api.js';

export const authService = {
  /**
   * Authenticates user credentials.
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ success: boolean, data: { user: Object, token: string } }>}
   */
  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  /**
   * Registers a new citizen account.
   * @param {Object} data - { name, email, password, preferredLanguage?, state?, userCategory? }
   * @returns {Promise<{ success: boolean, data: { user: Object, token: string } }>}
   */
  async register(data) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  /**
   * Retrieves the authenticated citizen's current profile.
   * @returns {Promise<{ success: boolean, data: { user: Object } }>}
   */
  async getProfile() {
    const res = await api.get('/users/profile');
    return res.data;
  },

  /**
   * Updates mutable citizen profile attributes.
   * @param {Object} updates - { name?, preferredLanguage?, state?, district?, userCategory?, ... }
   * @returns {Promise<{ success: boolean, data: { user: Object } }>}
   */
  async updateProfile(updates) {
    const res = await api.put('/users/profile', updates);
    return res.data;
  },

  /**
   * Validates active administrator session with the backend.
   * @returns {Promise<{ success: boolean, data: { id: string, role: 'admin' } }>}
   */
  async getAdminSession() {
    const res = await api.get('/admin/session');
    return res.data;
  },
};

export default authService;
