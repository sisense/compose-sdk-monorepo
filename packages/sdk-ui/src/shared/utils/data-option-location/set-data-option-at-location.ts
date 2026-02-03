import isArray from 'lodash-es/isArray';
import isPlainObject from 'lodash-es/isPlainObject';

import type {
  AnyColumn,
  ChartDataOptions,
  PivotTableDataOptions,
} from '@/domains/visualizations/core/chart-data-options/types';
import type { DataOptionLocation } from '@/types';

/**
 * Sets a data option in the dataOptions structure at the specified location.
 *
 * This function creates a new dataOptions object with the value updated at the specified location,
 * following immutable patterns. The original dataOptions object is not modified.
 *
 * The function handles both array-based locations (e.g., `category`, `rows`, `values`)
 * and single-value locations (e.g., `x`, `y`, `date`). For array-based locations,
 * the `dataOptionIndex` specifies which item to update (defaults to 0 if not provided).
 *
 * @param value - The new value to set at the specified location
 * @param location - The location where to set the data option
 * @param dataOptions - The data options structure to update (e.g., from various chart types or pivot table)
 * @returns A new dataOptions object with the updated value, or the original object if the location is invalid
 *
 * @example
 * ```typescript
 * const dataOptions = {
 *   category: [DM.Commerce.Date.Years, DM.Category.Category],
 *   value: [DM.Commerce.Revenue],
 *   breakBy: [],
 * };
 *
 * // Set first category
 * const updatedDataOptions = setDataOptionAtLocation(DM.Commerce.Date.Months, { dataOptionName: 'category', dataOptionIndex: 0 }, dataOptions);
 * // Result: { category: [DM.Commerce.Date.Months, DM.Category.Category], ... }
 *
 * // Set single value (index defaults to 0)
 * const scatterDataOptions = {
 *   x: DM.Category.Category,
 *   y: DM.Commerce.Revenue,
 * };
 * const updatedScatterDataOptions = setDataOptionAtLocation(DM.Commerce.Cost, { dataOptionName: 'y' }, scatterDataOptions);
 * // Result: { x: DM.Category.Category, y: DM.Commerce.Cost }
 * ```
 */
export function setDataOptionAtLocation<T extends ChartDataOptions | PivotTableDataOptions>(
  value: AnyColumn,
  location: DataOptionLocation,
  dataOptions: T,
): T {
  const { dataOptionName, dataOptionIndex = 0 } = location;

  // Get the property value by name
  const propertyValue = (dataOptions as Record<string, unknown>)[dataOptionName];

  // If property doesn't exist or is null/undefined, return original object
  if (propertyValue === null || propertyValue === undefined) {
    return dataOptions;
  }

  // Handle array-based data options (e.g., rows, columns, category, value, etc.)
  if (isArray(propertyValue)) {
    // Check if index is within bounds
    if (dataOptionIndex >= 0 && dataOptionIndex < propertyValue.length) {
      // Create a new array with the updated value
      const updatedArray = [...propertyValue];
      updatedArray[dataOptionIndex] = value;

      // Return new dataOptions object with updated array
      return {
        ...dataOptions,
        [dataOptionName]: updatedArray,
      } as T;
    }
    // If index is out of bounds, return original object
    return dataOptions;
  }

  // Handle single data option (e.g., x, y, date, geo, etc.)
  // For single values, dataOptionIndex should be 0 (or not provided)
  if (isPlainObject(propertyValue)) {
    // If index is explicitly provided and not 0, return original object
    if (dataOptionIndex !== 0 && location.dataOptionIndex !== undefined) {
      return dataOptions;
    }

    // Return new dataOptions object with updated single value
    return {
      ...dataOptions,
      [dataOptionName]: value,
    } as T;
  }

  // If property type is not supported, return original object
  return dataOptions;
}
