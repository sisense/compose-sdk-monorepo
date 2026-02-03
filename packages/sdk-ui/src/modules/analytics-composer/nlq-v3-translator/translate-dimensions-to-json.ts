import { Attribute } from '@sisense/sdk-data';

import { NlqTranslationError, NlqTranslationResult } from '../types.js';
import { DIMENSIONAL_NAME_PREFIX } from './types.js';

/**
 * Translates CSDK Attribute array to NLQ JSON format (string array).
 *
 * Returns composeCode from each attribute directly. The composeCode contains [[delimiters]]
 * around names that need normalization, which are stripped at the final step in translateQueryToJSON.
 *
 * @param dimensions - Array of CSDK Attribute objects
 * @returns NlqTranslationResult<string[]> with array of composeCode strings or structured errors
 * @internal
 */
export function translateDimensionsToJSON(dimensions: Attribute[]): NlqTranslationResult<string[]> {
  const results: string[] = [];
  const errors: NlqTranslationError[] = [];

  dimensions.forEach((dimension, index) => {
    // Helper to safely get JSON representation
    const getInputJson = () =>
      typeof dimension.toJSON === 'function' ? dimension.toJSON() : (dimension as any);

    // Check if composeCode exists
    if (!dimension.composeCode) {
      errors.push({
        category: 'dimensions',
        index,
        input: getInputJson(),
        message: `Dimension at index ${index} (${
          dimension.name || 'unnamed'
        }) is missing composeCode`,
      });
      return;
    }

    // Validate composeCode format
    if (!dimension.composeCode.startsWith(DIMENSIONAL_NAME_PREFIX)) {
      errors.push({
        category: 'dimensions',
        index,
        input: getInputJson(),
        message: `Expected composeCode to start with "${DIMENSIONAL_NAME_PREFIX}" for dimension at index ${index} (${
          dimension.name || 'unnamed'
        }). Got: "${dimension.composeCode}"`,
      });
      return;
    }

    // Use composeCode directly - delimiters stripped at end in translateQueryToJSON
    results.push(dimension.composeCode);
  });

  return errors.length > 0 ? { success: false, errors } : { success: true, data: results };
}
