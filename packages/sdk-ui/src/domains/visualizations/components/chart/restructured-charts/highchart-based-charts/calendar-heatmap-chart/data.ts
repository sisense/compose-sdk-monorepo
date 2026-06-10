import { CalendarHeatmapChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types.js';
import {
  DataTable,
  getColumnByName,
  getValue,
  getValues,
  isBlurred,
} from '@/domains/visualizations/core/chart-data-processor/table-processor.js';
import { ChartData } from '@/domains/visualizations/core/chart-data/types.js';

import { CALENDAR_HEATMAP_DATA_TYPE } from './constants.js';

export type CalendarHeatmapDataValue = {
  date: Date;
  value?: number;
  blur?: boolean;
  color?: string;
};

export type CalendarHeatmapChartData = {
  type: 'calendar-heatmap';
  values: CalendarHeatmapDataValue[];
};

/**
 * Converts a UTC-midnight timestamp (as returned by parseISOWithTimezoneCheck) to a local-midnight
 * Date so that getDate()/getMonth()/getFullYear() return the correct calendar day in all timezones.
 * The Sisense API sends date strings without timezone info; parseISOWithTimezoneCheck appends 'Z',
 * making every date UTC midnight. Without this normalization, UTC-offset timezones (e.g. UTC-5)
 * would shift all dates back by one day.
 *
 * Precondition: `value` must represent UTC midnight (e.g. "2024-01-15T00:00:00Z" or an equivalent
 * timestamp). Passing a local-midnight Date from a positive-offset timezone (UTC+N) will return the
 * previous calendar day.
 */
function toLocalCalendarDate(value: string | number | Date): Date {
  const d = new Date(value);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/**
 * Converts a data table to calendar heatmap chart data format
 *
 * Transforms raw data table rows into the specific format required for calendar heatmap visualization,
 * extracting date and value pairs from the configured columns.
 *
 * @param chartDataOptions - Internal data options specifying which columns to use
 * @param dataTable - Raw data table containing the source data
 * @returns Formatted calendar heatmap chart data
 */
export function getCalendarHeatmapChartData(
  chartDataOptions: CalendarHeatmapChartDataOptionsInternal,
  dataTable: DataTable,
): CalendarHeatmapChartData {
  // Get the actual columns from the data table
  const dateColumn = getColumnByName(dataTable, chartDataOptions.date.column.name);
  const valueColumn = getColumnByName(dataTable, chartDataOptions.value.column.name);

  // Return empty data if required columns are missing
  if (!dateColumn || !valueColumn) {
    return {
      type: CALENDAR_HEATMAP_DATA_TYPE,
      values: [],
    };
  }

  // Convert each row to a calendar heatmap data point
  const values: CalendarHeatmapDataValue[] = dataTable.rows.map((row) => {
    const date = getValue(row, dateColumn)!;
    const rawValue = getValue(row, valueColumn)!;
    const { compareValue, color } = getValues(row, [valueColumn])[0];
    const isValidValue = !compareValue?.valueIsNaN && !compareValue?.valueUndefined;
    const value = isValidValue ? (rawValue as number) : undefined;
    const blur = isBlurred(row, valueColumn);

    return {
      date: toLocalCalendarDate(date),
      value: value,
      color,
      blur,
    };
  });

  return {
    type: CALENDAR_HEATMAP_DATA_TYPE,
    values,
  };
}

/**
 * Type guard to check if chart data is calendar heatmap chart data
 *
 * Validates that the provided chart data is specifically formatted for calendar heatmap charts.
 *
 * @param chartData - Chart data to validate
 * @returns True if the chart data is calendar heatmap chart data
 */
export function isCalendarHeatmapChartData(
  chartData: ChartData,
): chartData is CalendarHeatmapChartData {
  return chartData.type === CALENDAR_HEATMAP_DATA_TYPE;
}
