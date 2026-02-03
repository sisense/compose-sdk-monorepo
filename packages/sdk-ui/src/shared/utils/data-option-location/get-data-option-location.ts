import { Column } from '@sisense/sdk-data';

import type {
  ChartDataOptions,
  PivotTableDataOptions,
  StyledColumn,
} from '@/domains/visualizations/core/chart-data-options/types';
import { translateColumnToAttribute } from '@/domains/visualizations/core/chart-data-options/utils';
import { isSameAttribute } from '@/shared/utils/filters';
import type { DataOptionLocation } from '@/types';

const ALLOWED_DATA_OPTIONS_NAME: DataOptionLocation['dataOptionName'][] = [
  'rows',
  'columns',
  'values',
  'category',
  'value',
  'breakBy',
  'x',
  'y',
  'breakByPoint',
  'breakByColor',
  'size',
  'date',
  'geo',
  'color',
  'colorBy',
  'details',
  'outliers',
  'secondary',
  'min',
  'max',
];

function isAllowedDataOptionName(key: string): key is DataOptionLocation['dataOptionName'] {
  return ALLOWED_DATA_OPTIONS_NAME.includes(key as DataOptionLocation['dataOptionName']);
}

/**
 * Finds the location of a data option within abstract dataOptions structure.
 *
 * This utility searches through various chart data option structures (e.g., `PivotTableDataOptions`,
 * `ScattermapChartDataOptions`, `CartesianChartDataOptions`) to locate a specific `Column` (or `StyledColumn`).
 *
 * The function uses a generic approach that inspects properties of the `dataOptions` object:
 * - If a property is an array, each item is treated as a potential data option
 * - If a property is an object, it is treated as a potential data option
 *
 * Data options can be:
 * - Plain `Column` (attribute)
 * - `StyledColumn` (attribute with nested `column` property)
 *
 * **Limitations:**
 * - It will **not** find `MeasureColumn`, `CalculatedMeasureColumn`, or `StyledMeasureColumn`. Attempting to search for measures will return `undefined`
 *
 * @param dataOptions - The data options structure to search within (e.g., from various chart types or pivot table)
 * @param targetColumn - The target `Column` (attribute) or `StyledColumn` to find
 * @returns The location of the data option if found, otherwise `undefined`
 *
 * @example
 * ```typescript
 * const dataOptions = {
 *   category: [DM.Commerce.Date],
 *   value: [DM.Commerce.Revenue],
 *   breakBy: [],
 * };
 * const location = getDataOptionLocation(dataOptions, DM.Commerce.Date);
 * // Result: { dataOptionName: 'category', dataOptionIndex: 0 }
 * ```
 */
export function getDataOptionLocation(
  dataOptions: ChartDataOptions | PivotTableDataOptions,
  targetColumn: Column | StyledColumn,
): DataOptionLocation | undefined {
  // Collect all potential column locations
  const potentialLocations: Array<{ location: DataOptionLocation; column: Column | StyledColumn }> =
    [];

  for (const [key, value] of Object.entries(dataOptions)) {
    // Skip invalid data option names or empty properties
    if (!isAllowedDataOptionName(key) || value === null || value === undefined) {
      continue;
    }

    // Handle array-based data options (e.g., rows, columns, category, value, etc.)
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (isColumnLike(item)) {
          potentialLocations.push({
            location: { dataOptionName: key, dataOptionIndex: index },
            column: item,
          });
        }
      });
    }
    // Handle single data option (e.g., x, y, date, geo, etc.)
    else if (typeof value === 'object' && !Array.isArray(value) && isColumnLike(value)) {
      potentialLocations.push({
        location: { dataOptionName: key, dataOptionIndex: 0 },
        column: value,
      });
    }
  }

  // Check collected columns for a match
  for (const { location, column } of potentialLocations) {
    if (isSameColumn(column, targetColumn)) {
      return location;
    }
  }

  return undefined;
}

/**
 * Type guard that checks if a value is a `Column` (attribute) or `StyledColumn`.
 *
 * This function verifies if the value is a column by checking for the presence of
 * `type` and `expression` properties, which are characteristic of attribute columns.
 * It handles both plain `Column` objects and `StyledColumn` objects (which have a nested `column` property).
 *
 * @param potentialColumn - The value to check
 * @returns `true` if the value is a `Column` or `StyledColumn`, `false` otherwise
 */
function isColumnLike(potentialColumn: unknown): potentialColumn is Column | StyledColumn {
  if (!potentialColumn || typeof potentialColumn !== 'object') {
    return false;
  }

  // Extract the plain column from styled variant
  const potentialPlainColumn =
    'column' in potentialColumn ? (potentialColumn as { column: unknown }).column : potentialColumn;

  return (
    typeof potentialPlainColumn === 'object' &&
    potentialPlainColumn !== null &&
    'type' in potentialPlainColumn &&
    'expression' in potentialPlainColumn
  );
}

/**
 * Compares two columns to determine if they represent the same attribute.
 *
 * This function handles both plain `Column` and `StyledColumn` arguments variants.
 *
 * @param columnA - The first column to compare (can be `Column` or `StyledColumn`)
 * @param columnB - The second column to compare (can be `Column` or `StyledColumn`)
 * @returns `true` if both columns represent the same attribute, `false` otherwise
 */
export function isSameColumn(
  columnA: Column | StyledColumn,
  columnB: Column | StyledColumn,
): boolean {
  return isSameAttribute(translateColumnToAttribute(columnA), translateColumnToAttribute(columnB));
}
