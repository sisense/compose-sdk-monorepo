/**
 * Translation result and JSON helpers.
 *
 * @internal
 */
import { JSONValue } from '@sisense/sdk-data';

import type { NlqTranslationError, NlqTranslationResult } from '../../../types.js';

/**
 * Recursively strips [[delimiters]] from all strings in a JSON structure.
 * Transforms "DM.[[Commerce Sales]].[[Order Date]]" → "DM.Commerce Sales.Order Date"
 *
 * @param value - The JSON value to process
 * @returns The value with all [[delimiters]] stripped from strings
 * @internal
 */
export function stripDelimitersFromJson<T extends JSONValue>(value: T): T {
  if (typeof value === 'string') {
    return value.replace(/\[\[([^\]]+)\]\]/g, '$1') as T;
  }
  if (Array.isArray(value)) {
    return value.map(stripDelimitersFromJson) as T;
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, stripDelimitersFromJson(v)]),
    ) as T;
  }
  return value; // numbers, booleans, null
}

export function getSuccessData<T>(result: NlqTranslationResult<T>): T {
  if (!result.success) throw new Error('Expected success result');
  return result.data;
}

export function getErrors<T>(result: NlqTranslationResult<T>): string[] {
  if (result.success) throw new Error('Expected error result');
  return result.errors.map((error) => error.message);
}

/**
 * Helper function to collect structured errors from translation operations.
 *
 * Executes a translation function and collects any errors into the provided errors array.
 * Returns the translated data if successful, or null if errors occurred.
 *
 * @param translateFn - Function that returns a NlqTranslationResult
 * @param errors - Array to collect errors into
 * @param mapError - Optional mapper to transform errors before pushing (e.g., add axis context for chart dataOptions)
 * @returns The translated data if successful, or null if errors occurred
 * @internal
 */
export function collectTranslationErrors<T>(
  translateFn: () => NlqTranslationResult<T>,
  errors: NlqTranslationError[],
  mapError?: (e: NlqTranslationError) => NlqTranslationError,
): T | null {
  const result = translateFn();
  if (!result.success) {
    const toPush = mapError ? result.errors.map(mapError) : result.errors;
    errors.push(...toPush);
    return null;
  }
  return result.data;
}
