/**
 * Custom processors for filter functions that require cross-argument validation.
 *
 * These processors validate that attribute types are compatible with the expected
 * value types for specific filter functions.
 */
import { Attribute } from '@sisense/sdk-data';

import {
  getAttributeTypeDisplayString,
  isDateLevelAttribute,
  isNumericAttribute,
  isTextAttribute,
  isTextOrNumericAttribute,
} from '../common.js';
import { FunctionContext, ProcessedArg } from '../types.js';

/**
 * Safely extracts the first argument as an Attribute from processed args
 *
 * @param processedArgs - Array of processed arguments
 * @param context - Processing context for error messages
 * @returns The first argument as an Attribute
 * @throws Error if the first argument is not an Attribute
 */
function extractAttribute(processedArgs: ProcessedArg[], context: FunctionContext): Attribute {
  const attribute = processedArgs[0];

  if (!attribute || typeof attribute !== 'object' || !('type' in attribute)) {
    throw new Error(`${context.pathPrefix}args[0]: Expected attribute as first argument`);
  }

  return attribute as Attribute;
}

/**
 * Processes filters that accept string | number values
 * Used by: equals, doesntEqual
 *
 * @param processedArgs - [attribute, value, config?]
 * @param context - Processing context with error prefix and other metadata
 * @throws Error with descriptive message if validation fails
 */
export function processStringOrNumericFilter(
  processedArgs: ProcessedArg[],
  context: FunctionContext,
): void {
  const attribute = extractAttribute(processedArgs, context);

  if (!isTextOrNumericAttribute(attribute)) {
    throw new Error(
      `${
        context.pathPrefix
      }args[0]: Attribute must be string or numeric type, got ${getAttributeTypeDisplayString(
        attribute,
      )} attribute`,
    );
  }
}

/**
 * Processes filters that only accept numeric values
 * Used by: greaterThan, lessThan, between, etc.
 *
 * @param processedArgs - [attribute, value, config?]
 * @param context - Processing context with error prefix and other metadata
 * @throws Error with descriptive message if validation fails
 */
export function processNumericFilter(
  processedArgs: ProcessedArg[],
  context: FunctionContext,
): void {
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
}

/**
 * Processes filters that only accept string values
 * Used by: contains, startsWith, endsWith, like, etc.
 *
 * @param processedArgs - [attribute, value, config?]
 * @param context - Processing context with error prefix and other metadata
 * @throws Error with descriptive message if validation fails
 */
export function processStringFilter(processedArgs: ProcessedArg[], context: FunctionContext): void {
  const attribute = extractAttribute(processedArgs, context);

  if (!isTextAttribute(attribute)) {
    throw new Error(
      `${
        context.pathPrefix
      }args[0]: Attribute must be string type, got ${getAttributeTypeDisplayString(
        attribute,
      )} attribute`,
    );
  }
}

/**
 * Processes filters that only accept datetime values
 * Used by: dateFrom, dateTo, dateRange, etc.
 *
 * @param processedArgs - [attribute, value, config?]
 * @param context - Processing context with error prefix and other metadata
 * @throws Error with descriptive message if validation fails
 */
export function processDateFilter(processedArgs: ProcessedArg[], context: FunctionContext): void {
  const attribute = extractAttribute(processedArgs, context);

  if (!isDateLevelAttribute(attribute)) {
    throw new Error(
      `${
        context.pathPrefix
      }args[0]: Attribute must be date/datetime type, got ${getAttributeTypeDisplayString(
        attribute,
      )} attribute`,
    );
  }
}
