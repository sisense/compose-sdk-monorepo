import { JaqlDataSourceForDto, JSONArray, Measure } from '@ethings-os/sdk-data';
import { NlqTranslationResult, NormalizedTable } from '../types.js';
import {
  isMeasureElement,
  isParsedFunctionCallArray,
  ParsedFunctionCall,
  processNode,
} from './common.js';

/**
 * Translate an array of JSON objects to measures
 *
 * @example
 * [
 *   {
 *     "function": "measureFactory.sum",
 *     "args": ["DM.Commerce.Revenue", "Total Revenue"]
 *   },
 *   {
 *     "function": "measureFactory.sum",
 *     "args": ["DM.Commerce.Cost", "Total Cost"]
 *   }
 * ]
 *
 * is translated to the following Measure[] object:
 * [
 *   measureFactory.sum("DM.Commerce.Revenue", "Total Revenue"),
 *   measureFactory.sum("DM.Commerce.Cost", "Total Cost")
 * ]
 * @param measuresJSON - A JSON array representing the measures
 * @param dataSource - The data source to use for the measures
 * @param tables - The tables to use for the measures
 * @returns A Measure[] object
 */
export const translateMeasuresFromJSONFunctionCall = (
  measuresJSON: ParsedFunctionCall[],
  dataSource: JaqlDataSourceForDto,
  tables: NormalizedTable[],
): NlqTranslationResult<Measure[]> => {
  const results: Measure[] = [];
  const errors: string[] = [];

  // Process each measure and collect errors instead of throwing
  measuresJSON.forEach((measureJSON, index) => {
    try {
      const measure = processNode(measureJSON, dataSource, tables);
      if (!isMeasureElement(measure)) {
        errors.push(`Measure ${index + 1} (${measureJSON.function}): Invalid measure JSON`);
      } else {
        results.push(measure);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Measure ${index + 1} (${measureJSON.function}): ${errorMsg}`);
    }
  });

  return errors.length > 0 ? { success: false, errors } : { success: true, data: results };
};

export const translateMeasuresJSON = (
  measuresJSON: JSONArray,
  dataSource: JaqlDataSourceForDto,
  tables: NormalizedTable[],
): NlqTranslationResult<Measure[]> => {
  if (!measuresJSON) {
    return { success: true, data: [] };
  }

  if (!isParsedFunctionCallArray(measuresJSON)) {
    return {
      success: false,
      errors: [
        'Invalid measures JSON. Expected an array of function calls with "function" and "args" properties.',
      ],
    };
  }

  return translateMeasuresFromJSONFunctionCall(measuresJSON, dataSource, tables);
};
