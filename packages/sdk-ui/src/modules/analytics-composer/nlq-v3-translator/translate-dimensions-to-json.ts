import {
  Attribute,
  convertSortToSortDirection,
  JSONArray,
  JSONValue,
  Sort,
} from '@sisense/sdk-data';

import { NlqTranslationError, NlqTranslationResult } from '../types.js';
import { DIMENSIONAL_NAME_PREFIX } from './types.js';

/**
 * Translates CSDK Attribute array to NLQ JSON format (string or StyledColumnJSON array).
 *
 * When an attribute has sort applied, outputs StyledColumnJSON with column and sortType;
 * otherwise outputs composeCode string. Delimiters are stripped at the final step in translateQueryToJSON.
 *
 * @param dimensions - Array of CSDK Attribute objects
 * @returns NlqTranslationResult<JSONArray> - JSON array output for NLQ dimensions
 * @internal
 */
export function translateDimensionsToJSON(
  dimensions: Attribute[],
): NlqTranslationResult<JSONArray> {
  const results: JSONArray = [];
  const errors: NlqTranslationError[] = [];

  dimensions.forEach((dimension, index) => {
    const getInputJson = () =>
      typeof dimension.toJSON === 'function' ? dimension.toJSON() : (dimension as any);

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

    const sort = dimension.getSort();
    if (sort !== undefined && sort !== Sort.None) {
      const styled: JSONValue = {
        column: dimension.composeCode,
        sortType: convertSortToSortDirection(sort),
      };
      results.push(styled);
    } else {
      results.push(dimension.composeCode);
    }
  });

  return errors.length > 0 ? { success: false, errors } : { success: true, data: results };
}
