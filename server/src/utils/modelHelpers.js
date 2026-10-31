/**
 * @fileoverview Shared Mongoose model plugins and helpers for JanSathi AI.
 */

/**
 * Shared Mongoose plugin to normalize JSON serialization.
 * - Renames `_id` to `id`
 * - Strips `__v`
 * - Removes sensitive internal fields (passwordHash, lockedAt, etc.)
 *
 * @param {import('mongoose').Schema} schema - Mongoose schema to apply plugin to.
 */
export const toJSONPlugin = (schema) => {
  schema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
      if (ret._id) {
        ret.id = ret._id.toString();
        delete ret._id;
      }
      delete ret.__v;
      delete ret.passwordHash;
      delete ret.lockedAt;
      return ret;
    },
  });
};

export default toJSONPlugin;
