import { JSONValue, Measure } from '@sisense/sdk-data';

import { NlqTranslationError, NlqTranslationResult } from '../types.js';
import { parseComposeCodeToFunctionCall } from './parse-compose-code.js';
import { FunctionCall } from './types.js';

/**
 * Translates CSDK Measure array to NLQ JSON format (FunctionCall array).
 *
 * Parses composeCode directly to FunctionCall format. The composeCode contains [[delimiters]]
 * around names that need normalization, which are stripped at the final step in translateQueryToJSON.
 *
 * @param measures - Array of CSDK Measure objects
 * @returns NlqTranslationResult<FunctionCall[]> with array of FunctionCall objects or structured errors
 * @internal
 */
export function translateMeasuresToJSON(measures: Measure[]): NlqTranslationResult<FunctionCall[]> {
  const results: FunctionCall[] = [];
  const errors: NlqTranslationError[] = [];

  measures.forEach((measure, index) => {
    // Helper to safely get JSON representation
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
      // Parse composeCode directly - delimiters stripped at end in translateQueryToJSON
      const functionCall = parseComposeCodeToFunctionCall(measure.composeCode);
      results.push(functionCall);
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
