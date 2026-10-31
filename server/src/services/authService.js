/**
 * @fileoverview Authentication service handling bcrypt password hashing and JWT lifecycle.
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Pre-computed 12-round dummy bcrypt hash used to maintain uniform execution timing
 * during login attempts for non-existent user accounts.
 */
export const DUMMY_PASSWORD_HASH = '$2a$12$3uE2QZk6oM8Y0h7J8K1mUe7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2';

/**
 * Hashes a plaintext password using bcrypt with configured work factor rounds.
 *
 * @param {string} password - Plaintext password.
 * @returns {Promise<string>} Salted password hash.
 */
export const hashPassword = async (password) => {
  return bcrypt.hash(password, env.BCRYPT_ROUNDS);
};

/**
 * Verifies a plaintext password against a stored bcrypt hash.
 *
 * @param {string} password - Plaintext password candidate.
 * @param {string} hash - Stored bcrypt hash.
 * @returns {Promise<boolean>} True if the password matches the hash.
 */
export const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Signs a JSON Web Token with HMAC-SHA256, pinned issuer, and configured expiry.
 *
 * @param {Object} payload - Token payload containing subject and role.
 * @param {string} payload.sub - Subject identifier (User ID).
 * @param {string} payload.role - User role ('citizen' or 'admin').
 * @returns {string} Signed JWT string.
 */
export const signToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: 'HS256',
    issuer: 'jansathi-ai',
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

/**
 * Verifies and decodes a JSON Web Token strictly ensuring HS256 algorithm and pinned issuer.
 *
 * @param {string} token - Raw JWT string.
 * @returns {Object} Decoded token payload.
 * @throws {jwt.JsonWebTokenError|jwt.TokenExpiredError} When token is invalid, forged, or expired.
 */
export const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET, {
    algorithms: ['HS256'],
    issuer: 'jansathi-ai',
  });
};
