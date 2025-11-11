import { CalendarHeatmapChartDesignOptions } from '@/chart-options-processor/translations/design-options.js';
import { DateFormatter } from '@/common/formatters/create-date-formatter.js';

import { CALENDAR_HEATMAP_DEFAULTS, CALENDAR_HEATMAP_SIZING } from '../../../constants.js';
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
 * Generates calendar chart data for a single month with provided data values (split view)
 *
 * @param data - Array of data points with dates and values
 * @param dateFormatter - Date formatter function
 * @param startOfWeek - Week start preference
 * @param weekendsConfig - Weekend configuration (days, cellColor, hideValues)
 * @returns Array of calendar chart data points formatted for Highcharts
 */
export function generateSplitCalendarChartData(
  data: CalendarHeatmapChartData,
  dateFormatter: DateFormatter,
  startOfWeek: CalendarDayOfWeek,
  weekendsConfig: CalendarHeatmapChartDesignOptions['weekends'],
): CalendarChartDataPoint[] {
  if (data.values.length === 0) return [];

  // Get the month and year from the first date
  const firstDataDate = new Date(data.values[0].date);
  const year = firstDataDate.getFullYear();
  const month = firstDataDate.getMonth(); // 0-based month

  // Calculate first day of the month for positioning
  const firstDayOfMonth = new Date(year, month, 1);
  const rawFirstWeekday = firstDayOfMonth.getDay(); // 0 = Sunday, 6 = Saturday
  const startOfWeekDayIndex = getDayOfWeekIndex(startOfWeek);

  // This adjusts the rawFirstWeekday (0-6, Sunday=0) to be relative to our chosen start of week
  const firstWeekday = (rawFirstWeekday - startOfWeekDayIndex + 7) % 7;

  const weekdayLabels = getWeekdayLabels(startOfWeek, dateFormatter);
  const chartData: CalendarChartDataPoint[] = [];

  // Process each data value (all days should already be present from data preparation)
  data.values.forEach((dataValue) => {
    const currentDate = new Date(dataValue.date);
    const day = currentDate.getDate();
    const dateString = dateFormatter(currentDate, CALENDAR_DATA_DATE_FORMAT);

    const xCoordinate = (firstWeekday + day - 1) % weekdayLabels.length;
    const yCoordinate = Math.floor((firstWeekday + day - 1) / weekdayLabels.length);

    const value = dataValue.value ?? null;
    const hasData = dataValue.value !== undefined;

    // Determine if this day should be highlighted based on the weekend configuration
    const isWeekend = isWeekendDay(currentDate, weekendsConfig.days);

    // Determine color based on priority: no-data > weekend highlighting > data colors
    let cellColor: string | undefined = undefined;
    if (!hasData) {
      cellColor = CALENDAR_HEATMAP_DEFAULTS.NO_DATA_COLOR;
    } else if (weekendsConfig.enabled && weekendsConfig.days.length > 0 && isWeekend) {
      cellColor = weekendsConfig.cellColor || CALENDAR_HEATMAP_DEFAULTS.WEEKEND_CELL_COLOR;
    } else if (dataValue.color) {
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
        blur: dataValue.blur,
      },
      className: hasData && dataValue.blur ? 'csdk-highcharts-point-blured' : '',
    });
  });

  return chartData;
}

/**
 * Generates calendar chart data for multiple months in continuous layout (GitHub-like layout)
 *
 * @param data - Array of data points with dates and values from multiple months
 * @param dateFormatter - Date formatter function
 * @param startOfWeek - Week start preference
 * @param weekendsConfig - Weekend configuration (days, cellColor, hideValues)
 * @returns Array of calendar chart data points formatted for continuous Highcharts layout
 */
export function generateContinuousCalendarChartData(
  data: CalendarHeatmapChartData,
  dateFormatter: DateFormatter,
  startOfWeek: CalendarDayOfWeek,
  weekendsConfig: CalendarHeatmapChartDesignOptions['weekends'],
): CalendarChartDataPoint[] {
  if (data.values.length === 0) return [];

  // Find the date range from the data
  const dates = data.values
    .map((item) => new Date(item.date))
    .sort((a, b) => a.getTime() - b.getTime());
  const firstDataDate = dates[0];
  const lastDataDate = dates[dates.length - 1];

  // Get the first day of the first month and last day of the last month
  const startDate = new Date(firstDataDate.getFullYear(), firstDataDate.getMonth(), 1);
  const endDate = new Date(lastDataDate.getFullYear(), lastDataDate.getMonth() + 1, 0); // Last day of the month

  // Group data by month
  const monthlyData = new Map<string, CalendarHeatmapDataValue[]>();

  // Create entries for all months in the range, even if they have no data
  for (let date = new Date(startDate); date <= endDate; date.setMonth(date.getMonth() + 1)) {
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    monthlyData.set(monthKey, []);
  }

  // Distribute data values to their respective months
  data.values.forEach((item) => {
    const itemDate = new Date(item.date);
    const monthKey = `${itemDate.getFullYear()}-${itemDate.getMonth()}`;
    if (monthlyData.has(monthKey)) {
      monthlyData.get(monthKey)!.push(item);
    }
  });

  // Generate chart data for each month using generateSplitCalendarChartData
  const allMonthData: CalendarChartDataPoint[] = [];

  // Calculate the start of the first week for the entire continuous layout
  const startOfWeekIndex = getDayOfWeekIndex(startOfWeek);
  const firstWeekStart = new Date(startDate);
  const daysDiff = (startDate.getDay() - startOfWeekIndex + 7) % 7;
  firstWeekStart.setDate(startDate.getDate() - daysDiff);

  for (const [monthKey, monthValues] of monthlyData) {
    const [yearStr, monthStr] = monthKey.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    // Create month data structure for generateSplitCalendarChartData
    const monthData: CalendarHeatmapChartData = {
      type: 'calendar-heatmap',
      values:
        monthValues.length > 0
          ? monthValues
          : [
              // Add a dummy entry for empty months to ensure they get processed
              { date: new Date(year, month, 1), value: undefined },
            ],
    };

    // Generate split calendar data for this month
    const monthChartData = generateSplitCalendarChartData(
      monthData,
      dateFormatter,
      startOfWeek,
      weekendsConfig,
    );

    allMonthData.push(...monthChartData);
  }

  // Adjust the x and y coordinates to fit the continuous layout
  let y = CALENDAR_HEATMAP_SIZING.ROWS - 1 - allMonthData[0].x;
  let x = 0;

  for (let i = 0; i < allMonthData.length; i++) {
    allMonthData[i].y = y;
    allMonthData[i].x = x;
    y--;
    if (y < 0) {
      y = CALENDAR_HEATMAP_SIZING.ROWS - 1;
      x++;
    }
  }

  return allMonthData;
}
