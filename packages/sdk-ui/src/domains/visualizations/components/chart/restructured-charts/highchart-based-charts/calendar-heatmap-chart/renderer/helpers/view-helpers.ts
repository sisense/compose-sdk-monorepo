import { CalendarHeatmapViewType } from '@/types';

import {
  CALENDAR_HEATMAP_DEFAULTS,
  FULL_MONTH_DATE_FORMAT,
  SHORT_MONTH_DATE_FORMAT,
} from '../../constants.js';
import { CalendarHeatmapChartData } from '../../data.js';
import { ViewType } from '../../types.js';

export interface MonthData {
  year: number;
  month: number;
}

export interface MonthInfo extends MonthData {
  monthName: string;
  shortMonthName: string;
}

/**
 * Creates a Date from MonthData
 */
export function convertMonthDataToDate(monthData: MonthData): Date {
  // Use the 2nd day of the month to avoid issues with daylight saving time
  const DEFAULT_MONTH_DAY = 2;
  return new Date(monthData.year, monthData.month, DEFAULT_MONTH_DAY);
}

/**
 * Creates a MonthData from a Date
 */
export function convertDateToMonthData(date: Date): MonthData {
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
  };
}

/**
 * Compares two MonthData objects chronologically
 * @returns negative if a < b, positive if a > b, zero if equal
 */
export function compareMonthData(a: MonthData, b: MonthData): number {
  if (a.year !== b.year) return a.year - b.year;
  return a.month - b.month;
}

/**
 * Checks if a MonthData is within a range (inclusive)
 */
function isMonthInRange(target: MonthData, start: MonthData, end: MonthData): boolean {
  const isAfterStart = compareMonthData(target, start) >= 0;
  const isBeforeEnd = compareMonthData(target, end) <= 0;
  return isAfterStart && isBeforeEnd;
}

/**
 * Adds/subtracts a specified number of months to a MonthData object
 * Use negative `monthsToAdd` number to subtract months
 */
function addMonthsToMonthData(monthData: MonthData, monthsToAdd: number): MonthData {
  let { year, month } = monthData;
  month += monthsToAdd;

  // Handle year overflow
  while (month > 11) {
    month -= 12;
    year++;
  }

  // Handle year underflow
  while (month < 0) {
    month += 12;
    year--;
  }

  return { year, month };
}

/**
 * Ensures there are at least the minimum required months for the viewType
 */
function ensureMinimumMonths(
  months: MonthInfo[],
  minMonths: number,
  dateFormatter: (date: Date, format: string) => string,
): MonthInfo[] {
  if (months.length >= minMonths) {
    return months;
  }

  if (months.length === 0) {
    // If no months at all, create months starting from current date
    const now = new Date();
    const startMonth: MonthData = { year: now.getFullYear(), month: now.getMonth() };
    const endMonth = addMonthsToMonthData(startMonth, minMonths - 1);
    return generateMonthSequence(startMonth, endMonth, dateFormatter);
  }

  // Extend after the last month to reach minimum
  const lastMonth = months[months.length - 1];
  const monthsNeeded = minMonths - months.length;
  const endMonth = addMonthsToMonthData(lastMonth, monthsNeeded);

  const additionalMonths = generateMonthSequence(
    addMonthsToMonthData(lastMonth, 1),
    endMonth,
    dateFormatter,
  );

  return [...months, ...additionalMonths];
}

/**
 * Generates a sequence of months between two MonthData objects (inclusive)
 */
function generateMonthSequence(
  start: MonthData,
  end: MonthData,
  dateFormatter: (date: Date, format: string) => string,
): MonthInfo[] {
  const months: MonthInfo[] = [];
  const current: MonthData = { year: start.year, month: start.month };

  while (compareMonthData(current, end) <= 0) {
    const monthDate = convertMonthDataToDate(current);
    months.push({
      year: current.year,
      month: current.month,
      monthName: dateFormatter(monthDate, FULL_MONTH_DATE_FORMAT),
      shortMonthName: dateFormatter(monthDate, SHORT_MONTH_DATE_FORMAT),
    });

    current.month++;
    if (current.month > 11) {
      current.month = 0;
      current.year++;
    }
  }

  return months;
}

/**
 * Adds months before the existing range
 */
function addMonthsBefore(
  existingMonths: MonthInfo[],
  target: MonthData,
  dateFormatter: (date: Date, format: string) => string,
): MonthInfo[] {
  if (existingMonths.length === 0) {
    return generateMonthSequence(target, target, dateFormatter);
  }

  const firstMonth: MonthData = existingMonths[0];

  // If target is not before the first month, return existing months
  if (compareMonthData(target, firstMonth) >= 0) {
    return existingMonths;
  }

  // Generate months from target to just before the first existing month
  const end: MonthData = {
    year: firstMonth.month === 0 ? firstMonth.year - 1 : firstMonth.year,
    month: firstMonth.month === 0 ? 11 : firstMonth.month - 1,
  };

  const newMonths = generateMonthSequence(target, end, dateFormatter);

  return [...newMonths, ...existingMonths];
}

/**
 * Adds months after the existing range
 */
function addMonthsAfter(
  existingMonths: MonthInfo[],
  target: MonthData,
  dateFormatter: (date: Date, format: string) => string,
): MonthInfo[] {
  if (existingMonths.length === 0) {
    return generateMonthSequence(target, target, dateFormatter);
  }

  const lastMonth: MonthData = existingMonths[existingMonths.length - 1];

  // If target is not after the last month, return existing months
  if (compareMonthData(target, lastMonth) <= 0) {
    return existingMonths;
  }

  // Generate months from just after the last existing month to target
  const start: MonthData = {
    year: lastMonth.month === 11 ? lastMonth.year + 1 : lastMonth.year,
    month: lastMonth.month === 11 ? 0 : lastMonth.month + 1,
  };

  const newMonths = generateMonthSequence(start, target, dateFormatter);

  return [...existingMonths, ...newMonths];
}

// Helper function to determine if short month names should be used based on calendar size
export function shouldUseShortMonthNames(width: number): boolean {
  return width <= CALENDAR_HEATMAP_DEFAULTS.SHORT_MONTH_NAME_SPLIT_LAYOUT_WIDTH_THRESHOLD;
}

// Helper function to generates available months from chart data
export function generateAvailableMonthsFromData(
  chartData: CalendarHeatmapChartData,
  dateFormatter: (date: Date, format: string) => string,
): MonthInfo[] {
  if (!chartData.values || chartData.values.length === 0) return [];

  const monthsSet = new Set<string>();
  const months: MonthInfo[] = [];

  chartData.values.forEach((dataPoint) => {
    const year = dataPoint.date.getFullYear();
    const month = dataPoint.date.getMonth();
    const key = `${year}-${month}`;

    if (!monthsSet.has(key)) {
      monthsSet.add(key);
      months.push({
        year,
        month,
        monthName: dateFormatter(dataPoint.date, FULL_MONTH_DATE_FORMAT),
        shortMonthName: dateFormatter(dataPoint.date, SHORT_MONTH_DATE_FORMAT),
      });
    }
  });

  // Sort months chronologically
  return months.sort((a, b) => compareMonthData(a, b));
}

// Helper function to get available months with initialMonth if needed
export function getAvailableMonths(
  chartData: CalendarHeatmapChartData,
  dateFormatter: (date: Date, format: string) => string,
  initialMonth?: MonthData,
  viewType?: CalendarHeatmapViewType,
): MonthInfo[] {
  const dataMonths = generateAvailableMonthsFromData(chartData, dateFormatter);
  const monthsPerView = viewType ? getMonthsPerView(viewType) : 1;

  if (!initialMonth) {
    return ensureMinimumMonths(dataMonths, monthsPerView, dateFormatter);
  }

  // If no data months, create months starting from initialMonth
  if (dataMonths.length === 0) {
    const endMonth = addMonthsToMonthData(initialMonth, monthsPerView - 1);
    return generateMonthSequence(initialMonth, endMonth, dateFormatter);
  }

  const firstDataMonth: MonthData = dataMonths[0];
  const lastDataMonth: MonthData = dataMonths[dataMonths.length - 1];

  // Check if initialMonth is already within the data range
  if (isMonthInRange(initialMonth, firstDataMonth, lastDataMonth)) {
    return ensureMinimumMonths(dataMonths, monthsPerView, dateFormatter);
  }

  let extendedMonths: MonthInfo[];

  // Add months before the data range if initialMonth is earlier
  if (compareMonthData(initialMonth, firstDataMonth) < 0) {
    extendedMonths = addMonthsBefore(dataMonths, initialMonth, dateFormatter);
  }
  // Add months after the data range if initialMonth is later
  else {
    // For multi-month views, ensure initialMonth is positioned as the first month
    // by adding enough months after it to complete the view
    const targetEndMonth = addMonthsToMonthData(initialMonth, monthsPerView - 1);
    extendedMonths = addMonthsAfter(dataMonths, targetEndMonth, dateFormatter);
  }

  return ensureMinimumMonths(extendedMonths, monthsPerView, dateFormatter);
}

// Helper function to find the initial view index based on initialDate
export function getInitialViewIndex(availableMonths: MonthInfo[], initialDate?: Date): number {
  if (!initialDate || availableMonths.length === 0) {
    return 0;
  }

  const initialMonthData: MonthData = {
    year: initialDate.getFullYear(),
    month: initialDate.getMonth(),
  };

  // Find the index of the month that matches the initialDate using proper comparison
  const targetIndex = availableMonths.findIndex(
    (month) => compareMonthData(month, initialMonthData) === 0,
  );

  // If found, return that index, otherwise return 0
  return targetIndex >= 0 ? targetIndex : 0;
}

// Get number of months to display simultaneously based on viewType
export function getMonthsPerView(viewType: CalendarHeatmapViewType): number {
  switch (viewType) {
    case ViewType.MONTH:
      return 1;
    case ViewType.QUARTER:
      return 3;
    case ViewType.HALF_YEAR:
      return 6;
    case ViewType.YEAR:
      return 12;
    default:
      return 1;
  }
}

// Get grid layout configuration for different view types
export function getGridLayout(viewType: CalendarHeatmapViewType) {
  switch (viewType) {
    case ViewType.MONTH:
      return { columns: '1fr', rows: '1fr' };
    case ViewType.QUARTER:
      // eslint-disable-next-line sonarjs/no-duplicate-string
      return { columns: 'repeat(3, 1fr)', rows: '1fr' };
    case ViewType.HALF_YEAR:
      return { columns: 'repeat(3, 1fr)', rows: 'repeat(2, 1fr)' };
    case ViewType.YEAR:
      return { columns: 'repeat(4, 1fr)', rows: 'repeat(3, 1fr)' };
    default:
      return { columns: '1fr', rows: '1fr' };
  }
}

// Get the months to display for the current view based on viewType
export function getDisplayMonths(
  availableMonths: MonthInfo[],
  currentMonth: MonthData,
  viewType: CalendarHeatmapViewType,
): MonthInfo[] {
  const monthsPerView = getMonthsPerView(viewType);

  // Find the index of currentMonth in availableMonths
  const currentViewIndex = availableMonths.findIndex(
    (month) => compareMonthData(month, currentMonth) === 0,
  );

  // Use 0 as fallback if currentMonth doesn't match any available month
  const validCurrentViewIndex = currentViewIndex >= 0 ? currentViewIndex : 0;

  // For month view, just return the single month
  if (monthsPerView === 1) {
    return availableMonths.slice(validCurrentViewIndex, validCurrentViewIndex + 1);
  }

  // For multi-month views, ensure we don't have empty months at the end
  // If we're near the end, adjust the start index to show a full group ending with the last month
  let startIndex = validCurrentViewIndex;
  let endIndex = Math.min(startIndex + monthsPerView, availableMonths.length);

  // If we don't have enough months to fill the view, shift the start backwards
  if (endIndex - startIndex < monthsPerView && availableMonths.length >= monthsPerView) {
    startIndex = Math.max(0, availableMonths.length - monthsPerView);
    endIndex = availableMonths.length;
  }

  return availableMonths.slice(startIndex, endIndex);
}
