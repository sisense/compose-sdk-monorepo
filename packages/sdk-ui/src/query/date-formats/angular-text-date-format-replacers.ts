import type { DateFormat } from './apply-date-format';
import { newDateFormat } from './new-date-format';

const angularTextDates = [
  'shortDate',
  'shortTime',
  'short', // Purposely ordered so that this is after other values that contain `short`
  'mediumDate',
  'mediumTime',
  'medium', // Purposely ordered so that this is after other values that contain `medium`
  'longDate',
  'fullDate',
] as const;
export type AngularTextDate = (typeof angularTextDates)[number];

type AngularTextDatesForLocale = Record<AngularTextDate, DateFormat>;

const enUSTextDates: AngularTextDatesForLocale = Object.freeze({
  fullDate: 'EEEE, MMMM d, y',
  longDate: 'MMMM d, y',
  medium: 'MMM d, y h:mm:ss a',
  mediumDate: 'MMM d, y',
  mediumTime: 'h:mm:ss a',
  short: 'M/d/yy h:mm a',
  shortDate: 'M/d/yy',
  shortTime: 'h:mm a',
});

type LocaleCode = string;

const textDates: Record<LocaleCode, AngularTextDatesForLocale> = Object.freeze({
  'en-US': enUSTextDates,
});

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
  let localeTextDates: AngularTextDatesForLocale = textDates[locale.code ?? ''];

  // Fallback to the formats of en-US for now.
  if (!localeTextDates) {
    localeTextDates = textDates['en-US'];
  }

  angularTextDates.forEach((textDate: AngularTextDate) => {
    const textDateFormat: DateFormat = localeTextDates[textDate];
    newFormat = newDateFormat(newFormat, textDate, function () {
      return textDateFormat;
    });
  });

  return newFormat;
}
