/**
 * Custom processors for measure factory functions that require attribute type validation.
 */
import { Attribute, MetadataTypes } from '@sisense/sdk-data';

import { FunctionContext, ProcessedArg } from '../../types.js';
import { getAttributeTypeDisplayString, isNumericAttribute } from '../utils/attribute-helpers.js';

function extractAttribute(processedArgs: ProcessedArg[], context: FunctionContext): Attribute {
  const attribute = processedArgs[0];

  if (!MetadataTypes.isAttribute(attribute)) {
    throw new Error(`${context.pathPrefix}args[0]: Expected attribute as first argument`);
  }

  return attribute;
}

/**
 * Validates that the first argument is a numeric attribute.
 * Used by: sum, average, avg, stdev, variance, median
 *
 * SUM, AVG, STDEV, VAR, MEDIAN require numeric columns; applying them to text or datetime
 * attributes causes the BE translation engine to throw (AGGREGATION_OVER_NON_NUMERIC_FIELD guard).
 *
 * @param processedArgs - Processed arguments where args[0] is the attribute
 * @param context - Processing context with error prefix and other metadata
 * @returns Same `processedArgs` reference when validation succeeds
 * @throws Error with descriptive message if validation fails
 *
 * @internal
 */
export function processNumericMeasure(
  processedArgs: ProcessedArg[],
  context: FunctionContext,
): ProcessedArg[] {
  const attribute = extractAttribute(processedArgs, context);

  if (!isNumericAttribute(attribute)) {
    throw new Error(
      `${
        context.pathPrefix
      }args[0]: Attribute must be numeric type, got ${getAttributeTypeDisplayString(
        attribute,
      )} attribute`,
    );
  }

  return processedArgs;
}
