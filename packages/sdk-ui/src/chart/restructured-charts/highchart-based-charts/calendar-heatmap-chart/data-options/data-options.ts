import { Attribute, Measure, DateLevels } from '@sisense/sdk-data';
import {
  CalendarHeatmapChartDataOptions,
  CalendarHeatmapChartDataOptionsInternal,
} from '@/chart-data-options/types';
import { ChartDataOptions } from '@/types';
import { ChartDataOptionsInternal } from '@/chart-data-options/types';
import {
  isMeasureColumn,
  normalizeColumn,
  normalizeMeasureColumn,
} from '@/chart-data-options/utils';
import { getDefaultDateFormat } from '@/chart-options-processor/translations/axis-section';
import { isAttributeColumn } from '../../cartesians/helpers/data-options.js';

/**
 * Translates calendar heatmap chart data options from user format to internal format
 *
 * Converts user-provided data options to the internal format used by the chart engine,
 * applying default date formatting and normalizing columns.
 *
 * @param dataOptions - User-provided calendar heatmap chart data options
 * @returns Normalized internal data options
 */
export function translateCalendarHeatmapChartDataOptions(
  dataOptions: CalendarHeatmapChartDataOptions,
): CalendarHeatmapChartDataOptionsInternal {
  const { date, value } = dataOptions;

  return {
    date: normalizeColumn(date, { dateFormat: getDefaultDateFormat(DateLevels.Days) }),
    value: normalizeMeasureColumn(value),
  };
}

/**
 * Extracts attributes from calendar heatmap chart data options
 *
 * Returns an array of attributes that can be used for data queries.
 * For calendar heatmaps, this typically includes the date attribute.
 *
 * @param dataOptions - Internal calendar heatmap chart data options
 * @returns Array of attributes extracted from the data options
 */
export function getCalendarHeatmapAttributes(
  dataOptions: CalendarHeatmapChartDataOptionsInternal,
): Attribute[] {
  const column = dataOptions.date.column;
  return isAttributeColumn(column) ? [column as Attribute] : [];
}

/**
 * Extracts measures from calendar heatmap chart data options
 *
 * Returns an array of measures that can be used for data queries.
 * For calendar heatmaps, this typically includes the value measure.
 *
 * @param dataOptions - Internal calendar heatmap chart data options
 * @returns Array of measures extracted from the data options
 */
export function getCalendarHeatmapMeasures(
  dataOptions: CalendarHeatmapChartDataOptionsInternal,
): Measure[] {
  const column = dataOptions.value.column;
  return isMeasureColumn(column) ? [column as Measure] : [];
}

/**
 * Type guard to check if data options are valid for calendar heatmap charts
 *
 * Validates that the provided data options contain the required properties
 * for calendar heatmap charts (date and value).
 *
 * @param dataOptions - Data options to validate
 * @returns True if the data options are valid for calendar heatmap charts
 */
export function isCalendarHeatmapChartDataOptions(
  dataOptions: ChartDataOptions,
): dataOptions is CalendarHeatmapChartDataOptions {
  return 'date' in dataOptions && 'value' in dataOptions;
}

/**
 * Type guard to check if internal data options are valid for calendar heatmap charts
 *
 * Validates that the provided internal data options contain the required properties
 * and are properly structured for calendar heatmap charts.
 *
 * @param dataOptions - Internal data options to validate
 * @returns True if the internal data options are valid for calendar heatmap charts
 */
export function isCalendarHeatmapChartDataOptionsInternal(
  dataOptions: ChartDataOptionsInternal,
): dataOptions is CalendarHeatmapChartDataOptionsInternal {
  return (
    'date' in dataOptions &&
    'value' in dataOptions &&
    typeof dataOptions.date === 'object' &&
    typeof dataOptions.value === 'object'
  );
}
