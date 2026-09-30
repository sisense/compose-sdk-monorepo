import { NOT_AVAILABLE_DATA_VALUE } from '@/shared/const.js';
import { DateFormatter } from '@/shared/formatters/create-date-formatter.js';
import { parseISOWithTimezoneCheck } from '@/shared/utils/parseISOWithTimezoneCheck';

/**
 * Formats the date time string or Date object.
 * If the date is invalid, it returns the original value.
 *
 * @param value - The date to format, as an ISO string or a Date
 * @param dateFormatter - The formatter to render the date with
 * @param dateFormat - The format to render, or undefined to return the value unformatted
 * @returns The formatted date, or the original value when it cannot be formatted
 */
export function formatDatetimeString(
  value: string | Date,
  dateFormatter: DateFormatter,
  dateFormat?: string,
): string {
  if (value === NOT_AVAILABLE_DATA_VALUE) {
    return value;
  }

  if (!dateFormat) {
    return typeof value === 'string' ? value : value.toISOString();
  }

  const date = typeof value === 'string' ? parseISOWithTimezoneCheck(value) : value;

  if (isInvalidDate(date)) {
    return typeof value === 'string' ? value : value.toISOString();
  }
  return dateFormatter(date, dateFormat);
}

/**
 * Checks if the date is invalid.
 */
function isInvalidDate(date: Date): boolean {
  return date.toString() === 'Invalid Date';
}
