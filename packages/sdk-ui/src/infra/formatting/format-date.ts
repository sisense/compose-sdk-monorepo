import type { Locale } from 'date-fns';

import type { DateConfig } from '@/domains/query-execution/core/date-formats';
import {
  defaultDateConfig,
  formatDateValue,
  getDefaultDateMask,
} from '@/domains/query-execution/core/date-formats/apply-date-format';
import { getBaseDateFnsLocale } from '@/domains/visualizations/core/chart-data-processor/data-table-date-period';

/**
 * Options for {@link formatDate}.
 */
export type FormatDateOptions = {
  /**
   * A [date-fns Locale](https://date-fns.org/v2.30.0/docs/Locale) for language-specific formatting.
   * Defaults to 'en-US'.
   */
  locale?: Locale;
  /**
   * Fiscal year, timezone, and date-level configuration.
   */
  dateConfig?: DateConfig;
};

/**
 * Formats a single date value (Date instance or ISO 8601 string) using the
 * provided format mask.
 *
 * Accepts standard [date-fns format tokens](https://date-fns.org/v2.30.0/docs/format)
 * plus the SDK's extended Angular-style masks (locale-aware; examples use en-US):
 *
 * ```
 * shortDate   → '3/15/26'                  (M/d/yy)
 * mediumDate  → 'Mar 15, 2026'             (MMM d, y)
 * longDate    → 'March 15, 2026'           (MMMM d, y)
 * fullDate    → 'Sunday, March 15, 2026'   (EEEE, MMMM d, y)
 * shortTime   → '1:45 PM'                  (h:mm a)
 * mediumTime  → '1:45:00 PM'               (h:mm:ss a)
 * short       → '3/15/26 1:45 PM'          (M/d/yy h:mm a)
 * medium      → 'Mar 15, 2026 1:45:00 PM'  (MMM d, y h:mm:ss a)
 * ```
 *
 * Returns the input unchanged if it matches the reserved "not available" value (`'N\A'`).
 *
 * @example
 * formatDate(new Date('2026-03-15'), 'MM/yyyy');
 * // returns '03/2026'
 *
 * formatDate('2026-03-15T13:45:00Z', 'shortDate');
 * // returns '3/15/26'  (en-US locale)
 *
 * formatDate('2026-03-15T13:45:00Z', 'mediumDate');
 * // returns 'Mar 15, 2026'
 *
 * @param value - Date value to format.
 * @param format - Format mask string (date-fns tokens or SDK extended masks).
 * @param options - Optional locale and date configuration.
 * @returns Formatted date string.
 * @group Formatting
 */
export function formatDate(
  value: Date | string,
  format: string,
  options?: FormatDateOptions,
): string {
  return formatDateValue(
    value,
    format,
    options?.locale ?? getBaseDateFnsLocale(),
    options?.dateConfig ?? defaultDateConfig,
  );
}

/**
 * Returns a default date-format mask for a given granularity level from {@link @sisense/sdk-data!DateLevels | `DateLevels`}
 *
 * Falls back to default `'fullDate'` for unknown or absent granularities.
 *
 * @example
 * getDefaultDateFormat('months'); // 'MM/yyyy'
 * getDefaultDateFormat('years');  // 'yyyy'
 * getDefaultDateFormat('days');   // 'shortDate'
 * @param granularity - Optional granularity string.
 * @returns A date-format mask string.
 * @group Formatting
 */
export function getDefaultDateFormat(granularity?: string): string {
  return getDefaultDateMask(granularity);
}
