/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-params */
/*
 * Relatively simple helper functions that create a new date format to replace
 * an old date format. For any more complicated helper functions related to
 * fiscal year adjustments, see ./fiscal_date_format_replacers.ts
 */

import { formatInTimeZone } from 'date-fns-tz';
import type { DateFormat } from './apply_date_format';
import { newDateFormat } from './new_date_format';

export function newDateFormatWithUnicodeMillisecondsMasks(oldFormat: DateFormat): DateFormat {
  if (!oldFormat.includes('sss')) {
    return oldFormat;
  }

  const newFormat: DateFormat = newDateFormat(
    oldFormat,
    'sss',
    function expand_sss_with_fraction_of_a_second() {
      return 'SSS';
    },
  );

  return newFormat;
}

export function newDateFormatWithExpandedAMPM(
  oldFormat: DateFormat,
  date: Date,
  timeZone: string,
): DateFormat {
  if (!(oldFormat.includes('a') || oldFormat.includes('A'))) {
    return oldFormat;
  }

  let newFormat: DateFormat = newDateFormat(oldFormat, 'a', function expand_a_with_am_or_pm() {
    return `\0${formatInTimeZone(date, timeZone, 'a').toLowerCase()}\0`;
  });

  newFormat = newDateFormat(newFormat, 'A', function expand_A_with_AM_or_PM() {
    return `\0${formatInTimeZone(date, timeZone, 'a').toUpperCase()}\0`;
  });

  // Handles edge case of aa or AA
  newFormat = newFormat.replace(/\0\0/g, ``);
  newFormat = newFormat.replace(/\0/g, `'`);

  return newFormat;
}

export function newDateFormatWithExpandedTimezoneOffset(
  oldFormat: DateFormat,
  date: Date,
  timeZone: string,
  locale: Locale,
): DateFormat {
  if (!oldFormat.includes('Z')) {
    return oldFormat;
  }

  const newFormat: DateFormat = newDateFormat(oldFormat, 'Z', function expandZWithTimezoneOffset() {
    return formatInTimeZone(date, timeZone, 'xx', { locale });
  });

  return newFormat;
}
