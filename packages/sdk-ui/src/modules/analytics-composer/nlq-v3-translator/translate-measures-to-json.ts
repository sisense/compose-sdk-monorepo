import { convertSortToSortDirection, JSONArray, JSONValue, Measure, Sort } from '@sisense/sdk-data';

import { NlqTranslationError, NlqTranslationResult } from '../types.js';
import { parseComposeCodeToFunctionCall } from './parse-compose-code.js';

/**
 * Translates CSDK Measure array to NLQ JSON format (FunctionCall or StyledMeasureColumnJSON array).
 *
 * When a measure has sort applied, outputs StyledMeasureColumnJSON with column and sortType;
 * otherwise outputs the parsed FunctionCall. Delimiters are stripped at the final step in translateQueryToJSON.
 *
 * @param measures - Array of CSDK Measure objects
 * @returns NlqTranslationResult<JSONArray> - JSON array output for NLQ measures
 * @internal
 */
export function translateMeasuresToJSON(measures: Measure[]): NlqTranslationResult<JSONArray> {
  const results: JSONArray = [];
  const errors: NlqTranslationError[] = [];

  measures.forEach((measure, index) => {
    const getInputJson = () =>
      typeof measure.toJSON === 'function' ? measure.toJSON() : (measure as unknown as JSONValue);

    if (!measure.composeCode) {
      errors.push({
        category: 'measures',
        index,
        input: getInputJson(),
        message: `Measure at index ${index} (${measure.name || 'unnamed'}) is missing composeCode`,
      });
      return;
    }

    try {
      const functionCall = parseComposeCodeToFunctionCall(measure.composeCode);
      const sort = measure.getSort();
      if (sort !== undefined && sort !== Sort.None) {
        const styled: JSONValue = {
          column: functionCall,
          sortType: convertSortToSortDirection(sort),
        };
        results.push(styled);
      } else {
        results.push(functionCall);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push({
        category: 'measures',
        index,
        input: getInputJson(),
        message: `Failed to parse composeCode for measure at index ${index} (${
          measure.name || 'unnamed'
        }): ${errorMessage}. ComposeCode: "${measure.composeCode}"`,
      });
    }
  });

  return errors.length > 0 ? { success: false, errors } : { success: true, data: results };
}
