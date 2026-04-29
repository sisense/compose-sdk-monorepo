/* eslint-disable @typescript-eslint/naming-convention */

/* eslint-disable max-params */

/*
 * Relatively simple helper functions that create a new date format to replace
 * an old date format. For any more complicated helper functions related to
 * fiscal year adjustments, see ./fiscal-date-format-replacers.ts
 */
import formatInTimeZone from 'date-fns-tz/formatInTimeZone';

import type { DateFormat } from './apply-date-format.js';
import { newDateFormat } from './new-date-format.js';

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

/**
 * Valid date format tokens used in the Fusion date format pipeline.
 * After all other preprocessing steps, these are the only letter sequences
 * that should pass through to `formatInTimeZone` as-is.
 */
const VALID_FUSION_TOKENS = new Set([
  'y',
  'yy',
  'yyy',
  'yyyy',
  'M',
  'MM',
  'MMM',
  'MMMM',
  'd',
  'dd',
  'EEE',
  'EEEE',
  'H',
  'HH',
  'h',
  'hh',
  'k',
  'kk',
  'm',
  'mm',
  's',
  'ss',
  'S',
  'SS',
  'SSS',
  'w',
  'ww',
  // Ordinal modifier used by date-fns locale format strings (e.g. `do` → "29th")
  'o',
]);

/** Matches a run of the same letter, e.g. `EEE`, `ww`, `MMMM`. */
const LETTER_RUN_RE = /^([a-zA-Z])\1*/;

function matchLetterRun(s: string): string | undefined {
  return s.match(LETTER_RUN_RE)?.[0];
}

/**
 * Collects the contiguous literal region starting at `startIndex` — a sequence of
 * non-token letter runs and non-letter characters — until a valid token, a quoted
 * section, or the end of the string is reached.
 *
 * Returns the collected literal text and the index after the last consumed character.
 */
function collectLiteralRegion(
  format: string,
  startIndex: number,
): { literal: string; endIndex: number } {
  let literal = '';
  let i = startIndex;
  while (i < format.length) {
    if (format[i] === "'") break;
    const run = matchLetterRun(format.slice(i));
    if (run) {
      if (VALID_FUSION_TOKENS.has(run)) break;
      literal += run;
      i += run.length;
    } else {
      literal += format[i];
      i++;
    }
  }
  return { literal, endIndex: i };
}

/**
 * Escapes Latin letter sequences that are not recognized Fusion date format tokens
 * by wrapping them in single quotes so that `date-fns` treats them as literal text.
 *
 * Handles cases like `WEEK-ww` where `WEEK-` is a literal text prefix, but `W`, `E`,
 * and `K` would otherwise be misinterpreted as `date-fns` format tokens, causing a
 * RangeError.
 *
 * Adjacent non-token sequences (separated only by non-letter characters) are merged
 * into a single quoted region to avoid `''` being interpreted as an escaped single
 * quote by `date-fns`.
 */
export function newDateFormatWithEscapedNonTokenChars(format: DateFormat): DateFormat {
  const result: string[] = [];
  let i = 0;

  while (i < format.length) {
    if (format[i] === "'") {
      // Pass through already-quoted text unchanged
      const closingQuote = format.indexOf("'", i + 1);
      if (closingQuote === -1) {
        result.push(format.slice(i));
        break;
      }
      result.push(format.slice(i, closingQuote + 1));
      i = closingQuote + 1;
      continue;
    }

    const letterRun = matchLetterRun(format.slice(i));
    if (letterRun && VALID_FUSION_TOKENS.has(letterRun)) {
      // Recognized token — pass through as-is
      result.push(letterRun);
      i += letterRun.length;
      continue;
    }

    if (letterRun) {
      // Non-token letter — collect the whole contiguous literal region as one
      // quoted string so adjacent escapes don't produce `''` (escaped quote).
      const { literal, endIndex } = collectLiteralRegion(format, i);
      result.push(`'${literal.replace(/'/g, "''")}'`);
      i = endIndex;
      continue;
    }

    // Non-letter character outside any literal region — pass through unchanged
    result.push(format[i]);
    i++;
  }

  return result.join('');
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
