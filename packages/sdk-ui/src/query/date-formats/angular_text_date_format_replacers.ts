import type { DateFormat } from './apply_date_format';
import { newDateFormat } from './new_date_format';

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

// This was copied from
// https://github.com/angular/angular.js/blob/47bf11ee94664367a26ed8c91b9b586d3dd420f5/src/ngLocale/angular-locale_en-us.js#L101-L108
// which is the same as:
// https://gitlab.sisense.com/SisenseTeam/Product/FE/PrismWebClient/-/blob/66ab2c1a8b32079e9ee1e406934c80b48f594cb8/src/base.module/resources/localization/angular-locale_en-us.js#L101-108
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

// NOTE(norman): If Angular-style text dates need to be supported for other locales,
// this implementation needs to be extended for more locales.
//
// PrismWebClient has a copy of all Angular locales code in https://gitlab.sisense.com/SisenseTeam/Product/FE/PrismWebClient/-/tree/develop/src/base.module/resources/localization
// so many locales are actually supported.
//
// Perhaps this SDK could also bundle in all of those Angular locales files.
// But that might be too much excess code.
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
