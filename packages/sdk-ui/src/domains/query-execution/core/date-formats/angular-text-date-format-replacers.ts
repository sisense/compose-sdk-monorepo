import type { DateFormat } from './apply-date-format.js';
import { newDateFormat } from './new-date-format.js';

const angularDateFormats = [
  'shortDate',
  'shortTime',
  'short', // Purposely ordered so that this is after other values that contain `short`
  'mediumDate',
  'mediumTime',
  'medium', // Purposely ordered so that this is after other values that contain `medium`
  'longDate',
  'fullDate',
] as const;

type AngularDateFormat = (typeof angularDateFormats)[number];

const defaultAngularDateFormats = Object.freeze({
  fullDate: 'EEEE, MMMM d, y',
  longDate: 'MMMM d, y',
  medium: 'MMM d, y h:mm:ss a',
  mediumDate: 'MMM d, y',
  mediumTime: 'h:mm:ss a',
  short: 'M/d/yy h:mm a',
  shortDate: 'M/d/yy',
  shortTime: 'h:mm a',
});

/*
 * Transform Fusion date format to corresponding mask in provided locale.
 */
function transformAngularFormatToLocaleFormat(
  angularFormat: AngularDateFormat,
  locale: Locale,
): DateFormat {
  if (!locale.formatLong) {
    console.warn('Locale does not have formatLong property. Using default date formats.');
    return defaultAngularDateFormats[angularFormat];
  }

  switch (angularFormat) {
    case 'fullDate':
      return locale.formatLong.date({ width: 'full' });
    case 'longDate':
      return locale.formatLong.date({ width: 'long' });
    case 'mediumDate':
      return locale.formatLong.date({ width: 'medium' });
    case 'shortDate':
      return locale.formatLong.date({ width: 'short' });
    case 'mediumTime':
      return locale.formatLong.time({ width: 'medium' });
    case 'shortTime':
      return locale.formatLong.time({ width: 'short' });
    case 'medium':
      return locale.formatLong
        .dateTime({ width: 'medium' })
        .replace('{{date}}', locale.formatLong.date({ width: 'medium' }))
        .replace('{{time}}', locale.formatLong.time({ width: 'medium' }));
    case 'short':
      return locale.formatLong
        .dateTime({ width: 'short' })
        .replace('{{date}}', locale.formatLong.date({ width: 'short' }))
        .replace('{{time}}', locale.formatLong.time({ width: 'short' }));
  }
}

/*
 * Replaces 'shortDate', 'shortTime', 'short', 'mediumDate', 'mediumTime',
 * 'medium', 'longDate', or 'fullDate' in the provided date format with the
 * locale-specific equivalent format pattern.
 *
 * This provides backward compatibility with Angular's `date` filter function.
 */
export function newDateFormatWithExpandedAngularTextFormats(
  oldFormat: DateFormat,
  locale: Locale,
): DateFormat {
  if (
    !(
      oldFormat.includes('short') ||
      oldFormat.includes('medium') ||
      oldFormat.includes('long') ||
      oldFormat.includes('full')
    )
  ) {
    return oldFormat;
  }

  let newFormat: DateFormat = oldFormat;

  angularDateFormats.forEach((textDate: AngularDateFormat) => {
    const textDateFormat: DateFormat = transformAngularFormatToLocaleFormat(textDate, locale);
    newFormat = newDateFormat(newFormat, textDate, function () {
      return textDateFormat;
    });
  });

  return newFormat;
}
