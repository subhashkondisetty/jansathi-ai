/**
 * @fileoverview Metadata controller serving reference enum and options lists to clients.
 */

import {
  LANGUAGE_OPTIONS,
  USER_CATEGORY_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  INCOME_RANGE_OPTIONS,
  INDIAN_STATES_AND_UTS,
  DOC_TYPE_OPTIONS,
  DOC_CATEGORY_OPTIONS,
} from '../config/constants.js';
import { sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Returns reference configurations and selectable options for client UI rendering.
 */
export const getOptions = asyncHandler(async (_req, res) => {
  return sendSuccess(
    res,
    {
      languages: LANGUAGE_OPTIONS,
      userCategories: USER_CATEGORY_OPTIONS,
      educationLevels: EDUCATION_LEVEL_OPTIONS,
      incomeRanges: INCOME_RANGE_OPTIONS,
      states: INDIAN_STATES_AND_UTS,
      docTypes: DOC_TYPE_OPTIONS,
      docCategories: DOC_CATEGORY_OPTIONS,
    },
    undefined,
    200
  );
});
