import { JaqlDataSourceForDto, JSONArray, Measure } from '@sisense/sdk-data';
import { NormalizedTable } from '../types.js';
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
): Measure[] => {
  return measuresJSON.map((measureJSON) => {
    const measure = processNode(measureJSON, dataSource, tables);
    if (!isMeasureElement(measure)) {
      throw new Error('Invalid measure JSON');
    }
    return measure;
  });
};

export const translateMeasuresJSON = (
  measuresJSON: JSONArray,
  dataSource: JaqlDataSourceForDto,
  tables: NormalizedTable[],
): Measure[] => {
  if (!measuresJSON) {
    return [];
  }
  if (!isParsedFunctionCallArray(measuresJSON)) {
    throw new Error(
      'Invalid measures JSON. Expected an array of function calls with "function" and "args" properties.',
    );
  }
  return translateMeasuresFromJSONFunctionCall(measuresJSON, dataSource, tables);
};
