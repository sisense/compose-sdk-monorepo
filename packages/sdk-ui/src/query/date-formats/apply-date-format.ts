/* eslint-disable max-params */
//  In all the helper functions here, Date instances are never mutated.
//  A new Date instance is created if a different Date is needed. Functions in the
//  `date-fns` library also do not mutate Date instances and always return a new Date instance.

import setYear from 'date-fns/setYear';
import formatInTimeZone from 'date-fns-tz/formatInTimeZone';
import { newDateFormatWithExpandedAngularTextFormats } from './angular-text-date-format-replacers';
import {
  newDateFormatWithUnicodeMillisecondsMasks,
  newDateFormatWithExpandedAMPM,
  newDateFormatWithExpandedTimezoneOffset,
} from './simple-date-format-replacers';
import {
  subtractYearForFiscal,
  shiftMonthForFiscal,
  newDateFormatWithExpandedYearsMasks,
  newDateFormatWithExpandedQuartersMasks,
} from './fiscal-date-format-replacers';
import { getBaseDateFnsLocale } from '../../chart-data-processor/data-table-date-period';
import { DateLevels } from '@sisense/sdk-data';

export type DateFormat = string;

const dateLevels = [
  'years',
  'quarters',
  'months',
  'weeks',
  'days',
  'dateAndTime',
  'minutes',
] as const;
/** @expandType */
export type DateLevel = (typeof dateLevels)[number];
export const YEARS: DateLevel = 'years';
export const QUARTERS: DateLevel = 'quarters';
export const MONTHS: DateLevel = 'months';
export const WEEKS: DateLevel = 'weeks';
export const DAYS: DateLevel = 'days';
export const DATE_AND_TIME: DateLevel = 'dateAndTime';
export const MINUTES: DateLevel = 'minutes';

export type MonthOfYear = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export const JAN: MonthOfYear = 0;
export const FEB: MonthOfYear = 1;
export const MAR: MonthOfYear = 2;
export const APR: MonthOfYear = 3;
export const MAY: MonthOfYear = 4;
export const JUN: MonthOfYear = 5;
export const JUL: MonthOfYear = 6;
export const AUG: MonthOfYear = 7;
export const SEP: MonthOfYear = 8;
export const OCT: MonthOfYear = 9;
export const NOV: MonthOfYear = 10;
export const DEC: MonthOfYear = 11;

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export const SUN: DayOfWeek = 0;
export const MON: DayOfWeek = 1;
export const TUE: DayOfWeek = 2;
export const WED: DayOfWeek = 3;
export const THU: DayOfWeek = 4;
export const FRI: DayOfWeek = 5;
export const SAT: DayOfWeek = 6;

/**
 * Date configurations
 */
export type DateConfig = {
  /** Boolean flag whether fiscal year is enabled */
  isFiscalOn: boolean;

  /** First month of the fiscal year that is configured */
  fiscalMonth: MonthOfYear;

  /**
   * First day of the week
   */
  weekFirstDay: DayOfWeek;

  /**
   * The selected date level for this particular column of data
   */
  selectedDateLevel: DateLevel;

  /**
   * The IANA time zone
   */
  timeZone: string;
};

export const defaultDateConfig: DateConfig = Object.freeze({
  weekFirstDay: MON,
  isFiscalOn: false,
  fiscalMonth: JAN,
  selectedDateLevel: DAYS,
  timeZone: 'UTC',
});

/**
 * Returns a formatted date, according to the provided date format string.
 *
 * @param date -
 * @param format -
 * @param locale -
 * @param cfg -
 */
export function applyDateFormat(
  date: Date,
  format: DateFormat,
  locale: Locale = getBaseDateFnsLocale(),
  cfg: DateConfig = defaultDateConfig,
): string {
  if (date.getFullYear() < 100) {
    date = setYear(date, 1900 + date.getFullYear());
    // datetime values without a year are defaulted to the year 1111 for format unification
    // replace 1111 with 1970 — the earliest acceptable year for formatting
  } else if (date.getFullYear() === 1111) {
    date = setYear(date, 1970);
  }

  if (!cfg.isFiscalOn) {
    date = subtractYearForFiscal(date, cfg.selectedDateLevel, cfg.fiscalMonth);
  }

  format = newDateFormatWithExpandedAngularTextFormats(format, locale);

  format = newDateFormatWithUnicodeMillisecondsMasks(format);

  format = newDateFormatWithExpandedAMPM(format, date, cfg.timeZone);

  format = newDateFormatWithExpandedTimezoneOffset(format, date, cfg.timeZone, locale);

  format = newDateFormatWithExpandedYearsMasks(
    format,
    date,
    cfg.timeZone,
    cfg.selectedDateLevel,
    cfg.isFiscalOn,
    cfg.fiscalMonth,
  );

  // TODO: Port over or rewrite the non-Unicode behavior related to week numbering masks (`w` and `ww`)
  // for the scenario when `fiscalMonth` is not January.

  if (!cfg.isFiscalOn && cfg.selectedDateLevel === QUARTERS) {
    date = shiftMonthForFiscal(date, cfg.fiscalMonth);
  }

  format = newDateFormatWithExpandedQuartersMasks(
    format,
    date,
    cfg.selectedDateLevel,
    cfg.fiscalMonth,
  );

  // previously was using formatInTimeZone and can revit when
  // completing cfg implementation
  return formatInTimeZone(date, cfg.timeZone, format, {
    locale,
    weekStartsOn: cfg.weekFirstDay,
  });
}

export function getDefaultDateMask(granularity?: string) {
  switch (granularity) {
    case DateLevels.Years:
      return 'yyyy';
    case DateLevels.Quarters:
      return 'Q yyyy';
    case DateLevels.Months:
      return 'MM/yyyy';
    case DateLevels.Weeks:
      return 'ww yyyy';
    case DateLevels.Days:
      return 'shortDate';
    case DateLevels.Hours:
    case DateLevels.Minutes:
    case DateLevels.MinutesRoundTo15:
    case DateLevels.MinutesRoundTo30:
    case DateLevels.AggMinutesRoundTo1:
    case DateLevels.AggMinutesRoundTo15:
    case DateLevels.AggMinutesRoundTo30:
    case DateLevels.AggHours:
      return 'HH:mm';
    case DateLevels.Seconds:
      return 'HH:mm:ss';
    default:
      return 'fullDate';
  }
}
