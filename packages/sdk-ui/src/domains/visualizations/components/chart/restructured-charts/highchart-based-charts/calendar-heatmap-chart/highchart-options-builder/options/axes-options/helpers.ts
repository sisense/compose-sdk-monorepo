import { BuildContext } from '../../../../types.js';
import { CALENDAR_TYPOGRAPHY } from '../../../constants.js';
import {
  CALENDAR_HEATMAP_DEFAULTS,
  FULL_MONTH_DATE_FORMAT,
  SHORT_MONTH_DATE_FORMAT,
} from '../../../constants.js';
import { getDayOfWeekIndex } from '../../../utils/index.js';

/**
 * Calculates axis font size based on cell size
 *
 * @param cellSize - The size of each calendar cell
 * @returns Calculated font size for axis labels
 */
export function calculateAxisFontSize(cellSize: number): number {
  const calculatedSize = cellSize * CALENDAR_TYPOGRAPHY.FONT_SIZE_RATIO;
  return Math.max(
    CALENDAR_TYPOGRAPHY.MIN_AXIS_FONT_SIZE,
    Math.min(CALENDAR_TYPOGRAPHY.MAX_FONT_SIZE, calculatedSize),
  );
}

/**
 * Calculates label Y position based on cell size
 *
 * @param cellSize - The size of each calendar cell
 * @returns Calculated Y position for axis labels
 */
export function calculateLabelYPosition(cellSize: number): number {
  const LABEL_Y_POSITION_RATIO = 0.5;
  const LABEL_Y_POSITION_THRESHOLD = 30;
  return cellSize < LABEL_Y_POSITION_THRESHOLD ? cellSize * LABEL_Y_POSITION_RATIO : 0;
}

/**
 * Generates month labels with their correct X-axis positions for continuous layout
 *
 * @param chartData - The calendar heatmap chart data
 * @param dateFormatter - Date formatter function
 * @param startOfWeek - Week start preference
 * @returns X-axis categories array for month positioning
 */
export function generateContinuousMonthLabels(
  chartData: BuildContext<'calendar-heatmap'>['chartData'],
  dateFormatter: BuildContext<'calendar-heatmap'>['extraConfig']['dateFormatter'],
  startOfWeek: BuildContext<'calendar-heatmap'>['designOptions']['startOfWeek'],
  cellSize = 0,
): string[] {
  if (!chartData.values || chartData.values.length === 0) {
    return [];
  }

  // Sort dates to get the range
  const dates = chartData.values
    .map((item) => new Date(item.date))
    .sort((a, b) => a.getTime() - b.getTime());
  const firstDate = dates[0];

  // Calculate the initial offset (how many days from start of week to first date)
  const startOfWeekIndex = getDayOfWeekIndex(startOfWeek);
  const firstDateDayOfWeek = firstDate.getDay();
  const initialOffset =
    (firstDateDayOfWeek - startOfWeekIndex + CALENDAR_HEATMAP_DEFAULTS.DAYS_IN_WEEK) %
    CALENDAR_HEATMAP_DEFAULTS.DAYS_IN_WEEK;

  // Group dates by month and calculate their positions in the continuous layout
  const monthsMap = new Map<
    string,
    { firstDate: Date; lastDate: Date; firstColumn: number; lastColumn: number }
  >();

  dates.forEach((date, index) => {
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

    // Calculate column position in continuous layout
    // Each day takes one position, accounting for the initial offset
    const columnPosition = Math.floor(
      (index + initialOffset) / CALENDAR_HEATMAP_DEFAULTS.DAYS_IN_WEEK,
    );

    if (!monthsMap.has(monthKey)) {
      monthsMap.set(monthKey, {
        firstDate: date,
        lastDate: date,
        firstColumn: columnPosition,
        lastColumn: columnPosition,
      });
    } else {
      const monthData = monthsMap.get(monthKey)!;
      monthData.lastDate = date;
      monthData.lastColumn = columnPosition;
    }
  });

  // Calculate total columns needed for the chart
  const totalDays = dates.length;
  const totalColumns = Math.ceil(
    (totalDays + initialOffset) / CALENDAR_HEATMAP_DEFAULTS.DAYS_IN_WEEK,
  );

  // Create categories array
  const categories: string[] = new Array(totalColumns).fill('');

  // Calculate label positions for each month
  // eslint-disable-next-line no-unused-vars
  Array.from(monthsMap.entries()).forEach(([monthKey, monthData]) => {
    const { firstDate, firstColumn, lastColumn } = monthData;
    const availableWidth = (lastColumn - firstColumn) * cellSize;

    // Position the label in the middle of the month's columns
    const labelPosition = firstColumn + Math.floor((lastColumn - firstColumn) / 2);

    // Format month name using the first date of the month
    const monthLabel = dateFormatter(
      firstDate,
      availableWidth > CALENDAR_HEATMAP_DEFAULTS.SHORT_MONTH_NAME_CONTINUES_LAYOUT_WIDTH_THRESHOLD
        ? FULL_MONTH_DATE_FORMAT
        : SHORT_MONTH_DATE_FORMAT,
    );

    // Set the label at the calculated position
    if (labelPosition >= 0 && labelPosition < categories.length) {
      categories[labelPosition] = monthLabel;
    }
  });

  return categories;
}
