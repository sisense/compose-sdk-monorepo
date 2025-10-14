import { CalendarHeatmapChartDesignOptions } from '@/chart-options-processor/translations/design-options.js';
import { DateFormatter } from '@/common/formatters/create-date-formatter.js';

import { CALENDAR_HEATMAP_DEFAULTS } from '../../../constants.js';
import { CalendarHeatmapChartData, CalendarHeatmapDataValue } from '../../../data.js';
import {
  CalendarDayOfWeek,
  getDayOfWeek,
  getDayOfWeekIndex,
} from '../../../utils/calendar-utils.js';
import { getWeekdayLabels } from '../../../utils/index.js';

const CALENDAR_DATA_DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";

/**
 * Check if a given date is a weekend based on the weekend configuration
 */
function isWeekendDay(date: Date, weekendDays: CalendarDayOfWeek[]): boolean {
  const dayOfWeek = getDayOfWeek(date.getDay());
  return weekendDays.includes(dayOfWeek);
}

/**
 * Represents a calendar chart data point for Highcharts
 */
export interface CalendarChartDataPoint {
  /** X coordinate (day of week, 0-6) */
  x: number;
  /** Y coordinate (week row, 0-5) */
  y: number;
  /** Data value or null for cells without data */
  value: number | null;
  /** Date timestamp */
  date: number;
  /** Date string for tooltip display */
  dateString?: string;
  /** Custom color override */
  color?: string;
  /** Class name for the data point */
  className?: string;
  /** Custom properties for the data point */
  custom: {
    /** Day of the month (1-31) */
    monthDay?: number;
    /** Whether this cell has data */
    hasData?: boolean;
    /** Whether this data point should be blurred for highlighting */
    blur?: boolean;
  };
}

/**
 * Generates calendar chart data for an entire month with provided data values
 *
 * @param data - Array of data points with dates and values
 * @param dateFormatter - Date formatter function
 * @param startOfWeek - Week start preference
 * @param weekendsConfig - Weekend configuration (days, cellColor, hideValues)
 * @returns Array of calendar chart data points formatted for Highcharts
 */
export function generateCalendarChartData(
  data: CalendarHeatmapChartData,
  dateFormatter: DateFormatter,
  startOfWeek: CalendarDayOfWeek,
  weekendsConfig: CalendarHeatmapChartDesignOptions['weekends'],
): CalendarChartDataPoint[] {
  if (data.values.length === 0) return [];

  // Check if this is an empty month (single date entry without value)
  const isEmptyMonth = data.values.length === 1 && data.values[0].value === undefined;

  // Create a map of date strings to values for quick lookup
  const dataMap = new Map<string, CalendarHeatmapDataValue>();
  if (!isEmptyMonth) {
    data.values.forEach((item) => {
      // Normalize date to common format for consistent lookup
      const dataString = dateFormatter(item.date, CALENDAR_DATA_DATE_FORMAT);
      dataMap.set(dataString, item);
    });
  }

  // Get the month and year from the first date
  const firstDataDate = new Date(data.values[0].date);
  const year = firstDataDate.getFullYear();
  const month = firstDataDate.getMonth(); // 0-based month

  // Calculate first day of the month and total days in month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const rawFirstWeekday = firstDayOfMonth.getDay(); // 0 = Sunday, 6 = Saturday
  const startOfWeekDayIndex = getDayOfWeekIndex(startOfWeek);

  // This adjusts the rawFirstWeekday (0-6, Sunday=0) to be relative to our chosen start of week
  const firstWeekday = (rawFirstWeekday - startOfWeekDayIndex + 7) % 7;

  const weekdayLabels = getWeekdayLabels(startOfWeek, dateFormatter);
  const chartData: CalendarChartDataPoint[] = [];

  // Generate all days in the month
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(Date.UTC(year, month, day));
    const dateString = dateFormatter(currentDate, CALENDAR_DATA_DATE_FORMAT);

    const xCoordinate = (firstWeekday + day - 1) % weekdayLabels.length;
    const yCoordinate = Math.floor((firstWeekday + day - 1) / weekdayLabels.length);

    // Look up the value for this date, or use null if no data available
    const dataValue = dataMap.get(dateString);
    const value = dataValue?.value || null;
    const hasData = dataMap.has(dateString);

    // Determine if this day should be highlighted based on the weekend configuration
    const isWeekend = isWeekendDay(currentDate, weekendsConfig.days);

    // Determine color based on priority: no-data > weekend highlighting > data colors
    let cellColor: string | undefined = undefined;
    if (!hasData) {
      cellColor = CALENDAR_HEATMAP_DEFAULTS.NO_DATA_COLOR;
    } else if (weekendsConfig.enabled && weekendsConfig.days.length > 0 && isWeekend) {
      cellColor = weekendsConfig.cellColor || CALENDAR_HEATMAP_DEFAULTS.WEEKEND_CELL_COLOR;
    } else if (dataValue?.color) {
      // Use color from data (includes both data table colors and generated colors)
      cellColor = dataValue.color;
    }

    const shouldHideWeekendValue = weekendsConfig.enabled && weekendsConfig.hideValues && isWeekend;

    chartData.push({
      x: xCoordinate,
      y: 5 - yCoordinate, // Invert Y coordinate so first week is at top
      value: value,
      date: currentDate.getTime(),
      dateString,
      color: cellColor,
      custom: {
        monthDay: day,
        hasData: !shouldHideWeekendValue && hasData,
        blur: dataValue?.blur,
      },
      className: hasData && dataValue?.blur ? 'csdk-highcharts-point-blured' : '',
    });
  }

  return chartData;
}
