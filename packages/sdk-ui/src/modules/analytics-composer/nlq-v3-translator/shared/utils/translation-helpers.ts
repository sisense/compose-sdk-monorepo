/**
 * Translation result and JSON helpers.
 *
 * @internal
 */
import type { DataSource, JSONObject } from '@sisense/sdk-data';

import type { WidgetsOptions } from '@/domains/dashboarding/dashboard-model/types.js';

import type { NlqTranslationError, NlqTranslationResult } from '../../../types.js';
import type { DataSourceJSON, SpecificWidgetOptionsJSON, WidgetsOptionsJSON } from '../../types.js';

type WithOptionalToJSON = {
  toJSON?: () => JSONObject;
};

/**
 * Returns a JSON-friendly snapshot for translation error reporting.
 * Uses `toJSON()` when present (CSDK Attribute/Measure); otherwise returns the value as-is.
 *
 * @internal
 */
/**
 * Serializes a CSDK data source to NLQ JSON (title string only).
 *
 * @param dataSource - Widget or dashboard data source
 * @returns Data source title for JSON output
 * @internal
 */
export function translateDataSourceToJSON(dataSource: DataSource): DataSourceJSON {
  return typeof dataSource === 'string' ? dataSource : dataSource.title;
}

/**
 * Extracts JSON-serializable widget options from dashboard `widgetsOptions`.
 * Omits `jtdConfig` and other non-JSON-safe fields.
 *
 * @param widgetsOptions - Dashboard widget options map
 * @returns Widget options safe for NLQ JSON, or `undefined` when empty
 * @internal
 */
export function translateWidgetsOptionsToJSON(
  widgetsOptions: WidgetsOptions,
): WidgetsOptionsJSON | undefined {
  const result: WidgetsOptionsJSON = {};

  for (const [widgetId, options] of Object.entries(widgetsOptions)) {
    const jsonOptions: SpecificWidgetOptionsJSON = {};
    if (options.filtersOptions !== undefined) {
      jsonOptions.filtersOptions = options.filtersOptions;
    }
    if (options.partialDtoOptions !== undefined) {
      jsonOptions.partialDtoOptions = options.partialDtoOptions;
    }
    if (Object.keys(jsonOptions).length > 0) {
      result[widgetId] = jsonOptions;
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

export function toNlqErrorInput(value: WithOptionalToJSON | unknown): unknown {
  if (
    typeof value === 'object' &&
    value !== null &&
    'toJSON' in value &&
    typeof (value as WithOptionalToJSON).toJSON === 'function'
  ) {
    return (value as WithOptionalToJSON).toJSON!();
  }
  return value;
}

/**
 * Recursively strips [[delimiters]] from all strings in a JSON structure.
 * Transforms "DM.[[Commerce Sales]].[[Order Date]]" → "DM.Commerce Sales.Order Date"
 *
 * Accepts NLQ output shapes (e.g. ChartJSON) that are JSON-serializable at runtime but are not
 * assignable to sdk-data `JSONValue` because of `Record<string, unknown>` style fields.
 *
 * @param value - The value to process
 * @returns The value with all [[delimiters]] stripped from strings
 * @internal
 */
export function stripDelimitersFromJson<T>(value: T): T {
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
