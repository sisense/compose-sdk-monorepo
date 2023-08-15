/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/naming-convention */
/*
 * A lot of this code was ported from
 * https://gitlab.sisense.com/SisenseTeam/Product/FE/PrismWebClient/-/blob/f4b97f057ed22e578fc8ca27491096a275c89eca/src/base.module/filters/levelDateFilter.js
 * and modified so that:
 * - TypeScript types were added
 * - variable and function names were changed to be more readable
 * - Date instances are never mutated; new Date instances are created if a different Date is needed
 *
 * Functions in the `date-fns` library also do not mutate Date instances
 * and always return a new Date instance.
 */

import { addYears, subYears, setMonth } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import type { DateFormat, DateLevel, MonthOfYear } from './apply_date_format';
import { JAN, YEARS, QUARTERS, MONTHS, WEEKS, DAYS } from './apply_date_format';
import { newDateFormat } from './new_date_format';

// NOTE(norman): A lot of this code was ported from PrismWebClient.
// But a lot of the fiscal-year-related adjustments do not make any sense to me.
// Perhaps these are simply bugs in the existing implementation? There are no existing PrismWebClient unit
// tests related to fiscal year reformatting of the year, quarter, and week number. So it's possible
// that the existing PrismWebClient implementation for fiscal-year-related adjustments
// has various bugs.

// TODO(norman): Perhaps rename this function
export function subtractYearForFiscal(
  date: Date,
  selectedDateLevel: DateLevel,
  fiscalMonth: MonthOfYear,
): Date {
  if (shouldConvert(date, selectedDateLevel, fiscalMonth)) {
    return subYears(date, 1);
  }
  return date;
}

function isDateShiftedByFiscalMonth(date: Date, fiscalMonth: MonthOfYear): boolean {
  return fiscalMonth <= date.getMonth();
}

function shouldConvert(
  date: Date,
  selectedDateLevel: DateLevel,
  fiscalMonth: MonthOfYear,
): boolean {
  const isConvertibleDateLevel = ![YEARS, QUARTERS].includes(selectedDateLevel);

  const isFiscalMonthNotJanuary = fiscalMonth > JAN;

  return (
    isFiscalMonthNotJanuary &&
    isConvertibleDateLevel &&
    isDateShiftedByFiscalMonth(date, fiscalMonth)
  );
}

// TODO(norman): Perhaps rename this function
function addYearForFiscal(
  date: Date,
  selectedDateLevel: DateLevel,
  fiscalMonth: MonthOfYear,
  isFiscalOn: boolean,
): Date {
  // NOTE(norman): This was ported from PrismWebClient. But it does not make any sense to me.
  // Why would this apply when isFiscalOn is false???
  if (!isFiscalOn && shouldConvert(date, selectedDateLevel, fiscalMonth)) {
    return addYears(date, 1);
  }

  return date;
}

export function shiftMonthForFiscal(date: Date, fiscalMonth: MonthOfYear): Date {
  if (fiscalMonth > 0) {
    const month: number = (date.getMonth() + fiscalMonth) % 12;
    return setMonth(date, month);
  }
  return date;
}

/**
 * Substitutes any y, yy, yyyy, yyyp, yp masks with their numeric text and
 * returns a new date format string.
 *
 * Takes into consideration:
 * - the configured start month of the customer's fiscal year
 * - the currently selected date level for this particular column of data
 *
 * @param oldFormat
 * @param date
 * @param timeZone
 * @param selectedDateLevel
 * @param isFiscalOn
 * @param fiscalMonth
 */
export function newDateFormatWithExpandedYearsMasks(
  oldFormat: DateFormat,
  date: Date,
  timeZone: string,
  selectedDateLevel: DateLevel,
  isFiscalOn: boolean,
  fiscalMonth: MonthOfYear,
): DateFormat {
  if (!oldFormat.includes('y')) {
    return oldFormat;
  }

  const dateWithMaybeOneYearAddedForFiscal: Date = addYearForFiscal(
    date,
    selectedDateLevel,
    fiscalMonth,
    isFiscalOn,
  );

  let formatWithoutPrevYearMasks: DateFormat = oldFormat;

  if (oldFormat.includes('yp')) {
    const prevYearDate: Date = subYears(dateWithMaybeOneYearAddedForFiscal, 1);

    formatWithoutPrevYearMasks = newDateFormat(
      oldFormat,
      'yp|yyyp',
      function expand_yp_yyyp(match: string) {
        const yearFormat = 'y'.repeat(match.length);
        return formatInTimeZone(prevYearDate, timeZone, yearFormat);
      },
    );
  }

  const newFormatWithoutAnyYearsMasks: DateFormat = newDateFormat(
    formatWithoutPrevYearMasks,
    'yyyy|yy|y',
    function expand_yyyy_yy_y(match: string) {
      return formatInTimeZone(dateWithMaybeOneYearAddedForFiscal, timeZone, match);
    },
  );

  return newFormatWithoutAnyYearsMasks;
}

/**
 * Substitutes any QQ or Q with their escaped text describing the quarter number and
 * returns a new date format string.
 *
 * Takes into consideration:
 * - the configured start month of the customer's fiscal year
 * - the currently selected date level for this particular column of data
 *
 * @param oldFormat
 * @param date
 * @param selectedDateLevel
 * @param fiscalMonth
 */
export function newDateFormatWithExpandedQuartersMasks(
  oldFormat: DateFormat,
  date: Date,
  selectedDateLevel: DateLevel,
  fiscalMonth: MonthOfYear,
): DateFormat {
  if (!oldFormat.includes('Q')) {
    return oldFormat;
  }

  let month: number = date.getMonth();

  if (fiscalMonth && [QUARTERS, MONTHS, WEEKS, DAYS].includes(selectedDateLevel)) {
    month -= fiscalMonth > month ? fiscalMonth - 12 : fiscalMonth;
  }

  const quarterNum: number = parseInt(String(month / 3)) + 1;

  const newFormat: DateFormat = newDateFormat(
    oldFormat,
    'QQ|Q',
    function insertQuarterPrefixAndNumber(match: string) {
      const isReplacingQQ = match.length === 2;

      // Relevant quote from https://date-fns.org/v2.29.3/docs/format
      // > The characters wrapped between two single quotes characters (') are escaped.
      const escapedPrefix = isReplacingQQ ? "'Quarter '" : "'Q'";

      return `${escapedPrefix}${quarterNum}`;
    },
  );

  return newFormat;
}
