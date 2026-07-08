import { Attribute, DateLevels } from '@sisense/sdk-data';

import { DIMENSIONAL_NAME_PREFIX } from '../../types.js';

/** Period granularities that accept calendar-date bounds in JAQL (matches sdk-data DateLevels.dateOnly). */
export const PERIOD_DATE_LEVELS: readonly string[] = [
  DateLevels.Years,
  DateLevels.Quarters,
  DateLevels.Months,
  DateLevels.Weeks,
  DateLevels.Days,
];

/** Relative date filters supported on the Sisense backend for period levels. */
export const RELATIVE_DATE_LEVELS: readonly string[] = [
  DateLevels.Years,
  DateLevels.Quarters,
  DateLevels.Months,
  DateLevels.Weeks,
  DateLevels.Days,
];

/** Sisense default first day of week (system.firstday), used when normalizing week members. */
export const DEFAULT_WEEK_STARTS_ON = 1; // Monday

const ISO_DATE_PREFIX = /^\d{4}-\d{2}-\d{2}/;
const COMPACT_YEAR_WEEK = /^\d{6}$/;
const FOUR_DIGIT_YEAR = /^\d{4}$/;
const END_OF_DAY_EXCLUSIVE_TO = /T23:59:59(?:\.\d+)?(?:Z)?$/;

/**
 * Checks if a string is a valid ISO date or datetime (YYYY-MM-DD…).
 */
export function isValidIsoDateString(value: string): boolean {
  if (typeof value !== 'string' || !ISO_DATE_PREFIX.test(value)) {
    return false;
  }
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp) || value.length < 10) {
    return false;
  }
  return !Number.isNaN(new Date(value).getTime());
}

/**
 * Checks if a string is a compact YYYYWW week key (e.g. `202500`), not a valid ISO datetime.
 */
export function isCompactYearWeekKey(value: string): boolean {
  return COMPACT_YEAR_WEEK.test(value);
}

/**
 * Checks if a string is exactly a four-digit calendar year (e.g. `2024`).
 */
export function isFourDigitYear(value: string): boolean {
  return FOUR_DIGIT_YEAR.test(value);
}

/**
 * Checks if a datetime string ends with `T23:59:59`, which is an invalid exclusive upper bound.
 */
export function hasExclusiveEndOfDayAntiPattern(value: string): boolean {
  return END_OF_DAY_EXCLUSIVE_TO.test(value);
}

/**
 * Normalizes a date range bound to its string form for validation and comparison.
 */
export function toDateBoundString(bound: Date | string): string {
  return bound instanceof Date ? bound.toISOString() : bound;
}

/**
 * Strips the time component from an ISO datetime, returning the calendar date portion only.
 */
export function stripClockFromIsoDateTime(bound: string): string {
  const tIndex = bound.indexOf('T');
  return tIndex === -1 ? bound : bound.slice(0, tIndex);
}

/**
 * Returns a human-readable hint describing valid member formats for the given date granularity.
 */
export function formatExpectedMemberHint(granularity: string): string {
  switch (granularity) {
    case DateLevels.Years:
      return "ISO datetime like '2024-01-01T00:00:00' or a 4-digit year like '2024'";
    case DateLevels.Weeks:
      return "ISO datetime at the start of the week, like '2024-12-30T00:00:00' (not compact keys like '202500')";
    default:
      return "ISO datetime like '2024-03-15T00:00:00'";
  }
}

/**
 * Returns the user-facing table.column name for a date level attribute (e.g. `Commerce.Date`),
 * derived from composeCode rather than the internal JAQL expression.
 */
export function getDateColumnDisplayName(attribute: Attribute): string {
  const composeCode = attribute.composeCode;
  if (composeCode?.startsWith(DIMENSIONAL_NAME_PREFIX)) {
    const path = composeCode.slice(DIMENSIONAL_NAME_PREFIX.length);
    const parts = path.split('.');
    const lastPart = parts[parts.length - 1];
    if (parts.length >= 3 && DateLevels.all.includes(lastPart)) {
      return parts.slice(0, -1).join('.');
    }
    return path;
  }
  return attribute.expression;
}
