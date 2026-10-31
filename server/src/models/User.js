/**
 * @fileoverview User model schema representing citizens and administrators.
 */

import mongoose from 'mongoose';
import {
  ROLES,
  LANGUAGES,
  USER_CATEGORIES,
  EDUCATION_LEVELS,
  INCOME_RANGES,
  INDIAN_STATES_AND_UTS,
} from '../config/constants.js';
import { env } from '../config/env.js';
import { toJSONPlugin } from '../utils/modelHelpers.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      unique: true,
      match: [emailRegex, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ROLES,
        message: '{VALUE} is not a valid role',
      },
      default: 'citizen',
    },
    preferredLanguage: {
      type: String,
      enum: {
        values: LANGUAGES,
        message: '{VALUE} is not a valid language code',
      },
      default: 'en',
    },
    state: {
      type: String,
      enum: {
        values: INDIAN_STATES_AND_UTS,
        message: '{VALUE} is not a recognized Indian State or Union Territory',
      },
    },
    district: {
      type: String,
      trim: true,
      maxlength: [80, 'District cannot exceed 80 characters'],
    },
    userCategory: {
      type: String,
      enum: {
        values: USER_CATEGORIES,
        message: '{VALUE} is not a valid user category',
      },
      default: 'general_citizen',
    },
    educationLevel: {
      type: String,
      enum: {
        values: EDUCATION_LEVELS,
        message: '{VALUE} is not a valid education level',
      },
    },
    courseOrOccupation: {
      type: String,
      trim: true,
      maxlength: [100, 'Course or occupation cannot exceed 100 characters'],
    },
    annualFamilyIncomeRange: {
      type: String,
      enum: {
        values: INCOME_RANGES,
        message: '{VALUE} is not a valid income range',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    strict: true,
    autoIndex: env.AUTO_INDEX,
  }
);

// Indexes
userSchema.index({ role: 1 });

// Apply shared plugins
userSchema.plugin(toJSONPlugin);

export const User = mongoose.model('User', userSchema);
export default User;
