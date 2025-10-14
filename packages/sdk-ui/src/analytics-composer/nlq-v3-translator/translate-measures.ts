import { Measure } from '@sisense/sdk-data';

import { NlqTranslationError, NlqTranslationErrorContext, NlqTranslationResult } from '../types.js';
import { processNode } from './process-function/process-node.js';
import {
  isFunctionCallArray,
  isMeasureElement,
  MeasuresFunctionCallInput,
  MeasuresInput,
} from './types.js';

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
 * {success: true, data: [
 *   measureFactory.sum("DM.Commerce.Revenue", "Total Revenue"),
 *   measureFactory.sum("DM.Commerce.Cost", "Total Cost")
 * ]}
 * @param measuresJSON - A JSON array representing the measures
 * @param dataSource - The data source to use for the measures
 * @param tables - The tables to use for the measures
 * @returns A Measure[] object
 */
export const translateMeasuresFromJSONFunctionCall = (
  input: MeasuresFunctionCallInput,
): NlqTranslationResult<Measure[]> => {
  const { data: measuresJSON } = input;
  const { dataSource, tables } = input.context;
  const results: Measure[] = [];
  const errors: NlqTranslationError[] = [];

  // Process each measure and collect errors instead of throwing
  measuresJSON.forEach((measureJSON, index) => {
    const context: NlqTranslationErrorContext = {
      category: 'measures',
      index,
      input: measureJSON,
    };
    try {
      const measure = processNode({
        data: measureJSON,
        context: { dataSource, tables, pathPrefix: '' },
      });
      if (!isMeasureElement(measure)) {
        errors.push({ ...context, message: `Invalid measure JSON` });
      } else {
        results.push(measure);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push({ ...context, message: errorMsg });
    }
  });

  return errors.length > 0 ? { success: false, errors } : { success: true, data: results };
};

/**
 * Translate an array of JSON objects to measures
 *
 * @param input - MeasuresInput object
 * @returns NlqTranslationResult<Measure[]>
 */
export const translateMeasuresJSON = (input: MeasuresInput): NlqTranslationResult<Measure[]> => {
  const { data: measuresJSON } = input;
  const { dataSource, tables } = input.context;

  if (!measuresJSON) {
    return { success: true, data: [] };
  }

  if (!isFunctionCallArray(measuresJSON)) {
    return {
      success: false,
      errors: [
        {
          category: 'measures',
          index: -1,
          input: measuresJSON,
          message:
            'Invalid measures JSON. Expected an array of function calls with "function" and "args" properties.',
        },
      ],
    };
  }

  return translateMeasuresFromJSONFunctionCall({
    data: measuresJSON,
    context: { dataSource, tables },
  });
};
