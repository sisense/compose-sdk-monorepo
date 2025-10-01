import { Attribute, JaqlDataSourceForDto, JSONArray } from '@ethings-os/sdk-data';
import { NlqTranslationResult, NormalizedTable } from '../types.js';
import { createAttribute } from './common.js';

function isStringArray(value: JSONArray): value is string[] {
  return value.every((item) => typeof item === 'string');
}

export const translateDimensionsJSON = (
  dimensionsJSON: JSONArray,
  dataSource: JaqlDataSourceForDto,
  tables: NormalizedTable[],
): NlqTranslationResult<Attribute[]> => {
  if (!dimensionsJSON) {
    return { success: true, data: [] };
  }

  if (!isStringArray(dimensionsJSON)) {
    return {
      success: false,
      errors: ['Invalid dimensions JSON. Expected an array of strings.'],
    };
  }

  const results: Attribute[] = [];
  const errors: string[] = [];

  // Process each dimension and collect errors instead of throwing
  dimensionsJSON.forEach((dimension, index) => {
    try {
      const attribute = createAttribute(dimension, dataSource, tables);
      results.push(attribute);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Dimension ${index + 1} ("${dimension}"): ${errorMsg}`);
    }
  });

  return errors.length > 0 ? { success: false, errors } : { success: true, data: results };
};
