import parseISO from 'date-fns/parseISO';

/**
 * Parses an ISO date string with timezone handling.
 * If the date string doesn't have a timezone offset, it appends 'Z' (UTC) to ensure consistent parsing.
 * This prevents parseISO from adding timezone based on daylight saving time.
 *
 * @param dateString - The ISO date string to parse
 * @returns A Date object parsed from the string
 */
export function parseISOWithTimezoneCheck(dateString: string): Date {
  // Check if dateString ends with a timezone offset (e.g., +0000, -0500, Z, +00:00, -05:00)
  const hasTimezone = /([+-]\d{2}:?\d{2}|Z)$/i.test(dateString);
  return parseISO(hasTimezone ? dateString : dateString + 'Z');
}
