import invert from 'lodash-es/invert';

import type { DateFormatter } from '@/shared/formatters/create-date-formatter.js';

import {
  CALENDAR_HEATMAP_DEFAULTS,
  REFERENCE_SUNDAY_DATE,
  SINGLE_LETTER_DAY_DATE_FORMAT,
} from '../constants.js';

/**
 * Day of the week
 */
export type CalendarDayOfWeek =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

/**
 * Internal enum for start of week values
 * @internal
 */
export enum CalendarDayOfWeekEnum {
  SUNDAY = 'sunday',
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
}

/**
 * Map CalendarDayOfWeekEnum values to day of week values (0-6)
 */
const CALENDAR_DAY_OF_WEEK_TO_INDEX_MAP: Record<CalendarDayOfWeek, number> = {
  [CalendarDayOfWeekEnum.SUNDAY]: 0,
  [CalendarDayOfWeekEnum.MONDAY]: 1,
  [CalendarDayOfWeekEnum.TUESDAY]: 2,
  [CalendarDayOfWeekEnum.WEDNESDAY]: 3,
  [CalendarDayOfWeekEnum.THURSDAY]: 4,
  [CalendarDayOfWeekEnum.FRIDAY]: 5,
  [CalendarDayOfWeekEnum.SATURDAY]: 6,
};

/**
 * Map day of week index to day of week string
 */
const CALENDAR_DAY_OF_WEEK_INDEX_TO_STRING_MAP: Record<number, CalendarDayOfWeek> = invert(
  CALENDAR_DAY_OF_WEEK_TO_INDEX_MAP,
) as Record<number, CalendarDayOfWeek>;

/**
 * Get day of week index from day of week string
 */
export function getDayOfWeekIndex(dayOfWeek: CalendarDayOfWeek): number {
  return CALENDAR_DAY_OF_WEEK_TO_INDEX_MAP[dayOfWeek];
}

/**
 * Get day of week string from day of week index
 */
export function getDayOfWeek(index: number): CalendarDayOfWeek {
  return CALENDAR_DAY_OF_WEEK_INDEX_TO_STRING_MAP[index];
}

/**
 * Get localized weekday labels based on week start preference
 * @param startOfWeek - Week start preference
 * @param dateFormatter - Date formatter function for consistent formatting
 * @returns Array of localized weekday abbreviations
 */
export function getWeekdayLabels(
  startOfWeek: CalendarDayOfWeek,
  dateFormatter: DateFormatter,
  format: string = SINGLE_LETTER_DAY_DATE_FORMAT,
): string[] {
  // Create a reference date (any Sunday will work)
  const referenceDate = new Date(REFERENCE_SUNDAY_DATE);
  const startOfWeekIndex = getDayOfWeekIndex(startOfWeek);

  // Generate all 7 days starting from the week start
  const weekdays: string[] = [];
  for (
    let i = startOfWeekIndex;
    i < startOfWeekIndex + CALENDAR_HEATMAP_DEFAULTS.DAYS_IN_WEEK;
    i++
  ) {
    const day = new Date(referenceDate);
    day.setDate(referenceDate.getDate() + i);
    const abbreviation = dateFormatter(day, format);
    weekdays.push(abbreviation);
  }

  return weekdays;
}
