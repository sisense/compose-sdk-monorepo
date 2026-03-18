/**
 * Determines whether a dataOptions axis contains dimensions or measures.
 * Uses schema metadata and content-based detection for mixed axes.
 *
 * @internal
 */
import type { DimensionItemJSON, MeasureItemJSON } from '../../types.js';
import { isFunctionCall, isRecordStringUnknown } from '../../types.js';
import { DIMENSION_AXES, MEASURE_AXES } from './chart-type-schemas.js';

/**
 * Determines if an axis contains dimensions (vs measures).
 * Uses axis name and type detection to make the determination.
 *
 * @param axisKey - The dataOptions axis key (e.g., 'category', 'value', 'x')
 * @param axisValue - The axis value (dimension or measure item(s))
 * @param chartType - Optional chart type for chart-specific overrides
 * @returns true if the axis contains dimensions, false if measures
 */
export function isDimensionAxisType(
  axisKey: string,
  axisValue: DimensionItemJSON | DimensionItemJSON[] | MeasureItemJSON | MeasureItemJSON[],
  chartType?: string,
): boolean {
  // Chart-type-specific overrides
  if (chartType === 'boxplot' && axisKey === 'value') return true;
  if (chartType === 'calendar-heatmap' && axisKey === 'date') return true;

  // Check known axis types first
  if (DIMENSION_AXES.has(axisKey)) {
    return true;
  }
  if (MEASURE_AXES.has(axisKey)) {
    return false;
  }

  // For mixed axes (x, y, breakByColor, columns), detect by content
  // If the value contains FunctionCall objects, it's measures
  const firstItem = Array.isArray(axisValue) ? axisValue[0] : axisValue;
  if (!firstItem) {
    // Default to dimensions for empty arrays
    return true;
  }

  // Check if it's a measure (FunctionCall or object with column that's a FunctionCall)
  let column: unknown = undefined;
  if (isRecordStringUnknown(firstItem) && 'column' in firstItem) {
    column = (firstItem as Record<string, unknown>).column;
  }
  return !(isFunctionCall(firstItem) || (column !== undefined && isFunctionCall(column)));
}
