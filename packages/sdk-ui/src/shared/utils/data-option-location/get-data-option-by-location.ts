import isArray from 'lodash-es/isArray';
import isPlainObject from 'lodash-es/isPlainObject';

import type {
  AnyColumn,
  ChartDataOptions,
  PivotTableDataOptions,
} from '@/domains/visualizations/core/chart-data-options/types';
import type { DataOptionLocation } from '@/types';

/**
 * Retrieves a data option from the dataOptions structure at the specified location.
 *
 * This function is the inverse of {@link getDataOptionLocation} - it takes a location
 * and returns the data option at that location.
 *
 * The function handles both array-based locations (e.g., `category`, `rows`, `values`)
 * and single-value locations (e.g., `x`, `y`, `date`). For array-based locations,
 * the `dataOptionIndex` specifies which item to retrieve (defaults to 0 if not provided).
 *
 * @param dataOptions - The data options structure to search within (e.g., from various chart types or pivot table)
 * @param location - The location of the data option to retrieve
 * @returns The data option at the specified location, or `undefined` if the location doesn't exist
 *
 * @example
 * ```typescript
 * const dataOptions = {
 *   category: [DM.Commerce.Date, DM.Category.Category],
 *   value: [DM.Commerce.Revenue],
 *   breakBy: [],
 * };
 *
 * // Get first category
 * const firstCategory = getDataOptionByLocation(dataOptions, {
 *   dataOptionName: 'category',
 *   dataOptionIndex: 0,
 * });
 * // Result: DM.Commerce.Date
 *
 * // Get single value (index defaults to 0)
 * const scatterDataOptions = {
 *   x: DM.Commerce.Date,
 *   y: DM.Commerce.Revenue,
 * };
 * const xValue = getDataOptionByLocation(scatterDataOptions, {
 *   dataOptionName: 'x',
 * });
 * // Result: DM.Commerce.Date
 * ```
 */
export function getDataOptionByLocation<T = AnyColumn>(
  dataOptions: ChartDataOptions | PivotTableDataOptions,
  location: DataOptionLocation,
): T | undefined {
  const { dataOptionName, dataOptionIndex = 0 } = location;

  // Get the property value by name
  const propertyValue = (dataOptions as Record<string, unknown>)[dataOptionName];

  // Return undefined if property doesn't exist or is null/undefined
  if (propertyValue === null || propertyValue === undefined) {
    return undefined;
  }

  // Handle array-based data options (e.g., rows, columns, category, value, etc.)
  if (isArray(propertyValue)) {
    // Check if index is within bounds
    if (dataOptionIndex >= 0 && dataOptionIndex < propertyValue.length) {
      return propertyValue[dataOptionIndex] as T;
    }
    return undefined;
  }

  // Handle single data option (e.g., x, y, date, geo, etc.)
  // For single values, dataOptionIndex should be 0 (or not provided)
  if (isPlainObject(propertyValue)) {
    // If index is explicitly provided and not 0, return undefined
    if (dataOptionIndex !== 0 && location.dataOptionIndex !== undefined) {
      return undefined;
    }
    return propertyValue as T;
  }

  return undefined;
}
