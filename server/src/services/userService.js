/**
 * @fileoverview User domain service handling registration, login, and profile operations.
 */

import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { hashPassword, verifyPassword, signToken, DUMMY_PASSWORD_HASH } from './authService.js';

/**
 * Registers a new citizen user account. Role is strictly pinned to 'citizen'.
 *
 * @param {Object} data - Registration payload.
 * @param {string} data.name - Full citizen name.
 * @param {string} data.email - Unique email address.
 * @param {string} data.password - Plaintext password candidate.
 * @param {string} [data.preferredLanguage='en'] - Preferred UI language code.
 * @param {string} [data.state] - Indian state or UT.
 * @param {string} [data.userCategory='general_citizen'] - Demographics category.
 * @returns {Promise<{user: Object, token: string}>} Registered user object and signed JWT.
 * @throws {ApiError} 409 CONFLICT if email is already taken.
 */
export const registerUser = async ({
  name,
  email,
  password,
  preferredLanguage = 'en',
  state,
  userCategory = 'general_citizen',
}) => {
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new ApiError(409, 'CONFLICT', 'An account with this email address already exists');
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: 'citizen',
    preferredLanguage,
    state: state || undefined,
    userCategory,
  });

  const token = signToken({
    sub: user.id,
    role: user.role,
  });

  return { user, token };
};

/**
 * Authenticates user credentials with constant-time comparison against timing attacks.
 *
 * @param {Object} credentials - Login credentials.
 * @param {string} credentials.email - Account email address.
 * @param {string} credentials.password - Plaintext password candidate.
 * @returns {Promise<{user: Object, token: string}>} Authenticated user and signed JWT.
 * @throws {ApiError} 401 INVALID_CREDENTIALS on bad credentials or inactive status.
 */
export const loginUser = async ({ email, password }) => {
  const normalizedEmail = (email || '').toLowerCase().trim();

  // Explicitly select passwordHash which is hidden by default
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

  // Compare against dummy hash if user doesn't exist to eliminate timing discrepancies
  const hashToCompare = user?.passwordHash || DUMMY_PASSWORD_HASH;
  const isMatch = await verifyPassword(password, hashToCompare);

  if (!user || !isMatch || !user.isActive) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken({
    sub: user.id,
    role: user.role,
  });

  // Re-fetch clean user instance without passwordHash
  const cleanUser = await User.findById(user.id);

  return { user: cleanUser, token };
};

/**
 * Retrieves the profile of an active user by ID.
 *
 * @param {string} userId - User identifier.
 * @returns {Promise<Object>} Clean user document.
 * @throws {ApiError} 404 NOT_FOUND if user does not exist or is inactive.
 */
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw new ApiError(404, 'NOT_FOUND', 'User profile not found');
  }
  return user;
};

/**
 * Updates citizen profile attributes with state-district consistency validation.
 *
 * @param {string} userId - User identifier.
 * @param {Object} updates - Updatable profile fields.
 * @returns {Promise<Object>} Updated user document.
 * @throws {ApiError} 400 VALIDATION_ERROR if district is set without a state.
 * @throws {ApiError} 404 NOT_FOUND if user does not exist or is inactive.
 */
export const updateUserProfile = async (userId, updates) => {
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw new ApiError(404, 'NOT_FOUND', 'User profile not found');
  }

  // Validate state-district dependency
  if (updates.district !== undefined && updates.district !== null) {
    const effectiveState = updates.state !== undefined ? updates.state : user.state;
    if (!effectiveState) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        'District requires a state or UT to be selected first',
        [{ target: 'body', path: 'district', message: 'District requires state to be set' }]
      );
    }
  }

  const allowedFields = [
    'name',
    'preferredLanguage',
    'state',
    'district',
    'userCategory',
    'educationLevel',
    'courseOrOccupation',
    'annualFamilyIncomeRange',
  ];

  for (const field of allowedFields) {
    if (updates[field] === null) {
      user[field] = undefined;
    } else if (updates[field] !== undefined) {
      user[field] = typeof updates[field] === 'string' ? updates[field].trim() : updates[field];
    }
  }

  await user.save();
  return user;
};
