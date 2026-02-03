import { Attribute } from '@sisense/sdk-data';

import { NlqTranslationError, NlqTranslationErrorContext, NlqTranslationResult } from '../types.js';
import { createAttributeFromName } from './common.js';
import { DimensionsInput, isStringArray } from './types.js';

/**
 * Translate an array of JSON objects to attributes.
 * Direction: JSON → CSDK
 *
 * @param input - DimensionsInput object`
 * @returns NlqTranslationResult<Attribute[]>
 */
export const translateDimensionsFromJSON = (
  input: DimensionsInput,
): NlqTranslationResult<Attribute[]> => {
  const { data: dimensionsJSON } = input;
  const { dataSource, schemaIndex } = input.context;

  if (!dimensionsJSON) {
    return { success: true, data: [] };
  }

  if (!isStringArray(dimensionsJSON)) {
    return {
      success: false,
      errors: [
        {
          category: 'dimensions',
          index: -1,
          input: dimensionsJSON,
          message: 'Invalid dimensions JSON. Expected an array of strings.',
        },
      ],
    };
  }

  const results: Attribute[] = [];
  const errors: NlqTranslationError[] = [];

  // Process each dimension and collect errors instead of throwing
  dimensionsJSON.forEach((dimensionString, index) => {
    const context: NlqTranslationErrorContext = {
      category: 'dimensions',
      index,
      input: dimensionString,
    };
    try {
      const attribute = createAttributeFromName(dimensionString, dataSource, schemaIndex);
      results.push(attribute);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push({ ...context, message: errorMsg });
    }
  });

  return errors.length > 0 ? { success: false, errors } : { success: true, data: results };
};
