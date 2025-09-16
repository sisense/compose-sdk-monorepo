import { CALENDAR_HEATMAP_DEFAULTS, CALENDAR_LAYOUT } from '../../../constants.js';
import { CalendarHeatmapChartData, CalendarHeatmapDataValue } from '../../../data.js';
import { DateFormatter } from '@/common/formatters/create-date-formatter.js';

const CALENDAR_DATA_DATE_FORMAT = 'yyyy-MM-dd';

/**
 * Represents a calendar chart data point for Highcharts
 */
export interface CalendarChartDataPoint {
  /** X coordinate (day of week, 0-6) */
  x: number;
  /** Y coordinate (week row, 0-5) */
  y: number;
  /** Data value or null for empty cells */
  value: number | null;
  /** Date timestamp or null for empty cells */
  date: number | null;
  /** Date string for tooltip display */
  dateString?: string;
  /** Custom color override */
  color?: string;
  /** Custom properties for the data point */
  custom: {
    /** Day of the month (1-31) */
    monthDay?: number;
    /** Whether this cell has data */
    hasData?: boolean;
    /** Whether this is an empty calendar cell */
    empty?: boolean;
  };
}

/**
 * Generates calendar chart data for an entire month with provided data values
 *
 * @param dataPoints - Array of data points with dates and values
 * @returns Array of calendar chart data points formatted for Highcharts
 */
export function generateCalendarChartData(
  data: CalendarHeatmapChartData,
  dateFormatter: DateFormatter,
): CalendarChartDataPoint[] {
  if (data.values.length === 0) return [];

  // Create a map of date strings to values for quick lookup
  const dataMap = new Map<string, CalendarHeatmapDataValue>();
  data.values.forEach((item) => {
    // Normalize date to common format for consistent lookup
    const dataString = dateFormatter(item.date, CALENDAR_DATA_DATE_FORMAT);
    dataMap.set(dataString, item);
  });

  // Get the month and year from the first date
  const firstDataDate = new Date(data.values[0].date);
  const year = firstDataDate.getFullYear();
  const month = firstDataDate.getMonth(); // 0-based month

  // Calculate first day of the month and total days in month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const firstWeekday = firstDayOfMonth.getDay(); // 0 = Sunday, 6 = Saturday

  const chartData: CalendarChartDataPoint[] = [];

  // Add empty tiles before the first day of the month
  for (let emptyDay = 0; emptyDay < firstWeekday; emptyDay++) {
    chartData.push(createEmptyCalendarCell(emptyDay, 5));
  }

  // Generate all days in the month
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(Date.UTC(year, month, day));
    const dateString = dateFormatter(currentDate, CALENDAR_DATA_DATE_FORMAT);

    const xCoordinate = (firstWeekday + day - 1) % CALENDAR_LAYOUT.WEEKDAY_LABELS.length;
    const yCoordinate = Math.floor(
      (firstWeekday + day - 1) / CALENDAR_LAYOUT.WEEKDAY_LABELS.length,
    );

    // Look up the value for this date, or use null if no data available
    const value = dataMap.get(dateString)?.value || null;
    const hasData = dataMap.has(dateString);

    chartData.push({
      x: xCoordinate,
      y: 5 - yCoordinate, // Invert Y coordinate so first week is at top
      value: value,
      date: currentDate.getTime(),
      dateString: dateString,
      color: hasData ? undefined : CALENDAR_HEATMAP_DEFAULTS.NO_DATA_COLOR,
      custom: {
        monthDay: day,
        hasData: hasData,
      },
    });
  }

  // Calculate how many cells we need to complete the calendar grid
  const totalCellsUsed = firstWeekday + daysInMonth;
  const remainingCells = CALENDAR_HEATMAP_DEFAULTS.TOTAL_CALENDAR_CELLS - totalCellsUsed;

  // Add empty tiles after the last day of the month to complete the grid
  for (
    let emptyDay = 0;
    emptyDay < remainingCells && emptyDay < CALENDAR_LAYOUT.WEEKDAY_LABELS.length;
    emptyDay++
  ) {
    const lastFilledCell = chartData[chartData.length - 1];
    const nextX = (lastFilledCell.x + 1) % CALENDAR_LAYOUT.WEEKDAY_LABELS.length;
    const nextY = lastFilledCell.y - (lastFilledCell.x === 6 ? 1 : 0); // Move to next row if at end of week

    chartData.push(createEmptyCalendarCell(nextX, nextY));
  }

  return chartData;
}

/**
 * Creates an empty calendar cell data point
 *
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns Empty calendar cell data point
 */
function createEmptyCalendarCell(x: number, y: number): CalendarChartDataPoint {
  return {
    x,
    y,
    value: null,
    date: null,
    color: CALENDAR_HEATMAP_DEFAULTS.EMPTY_CELL_COLOR,
    custom: {
      empty: true,
    },
  };
}
