import { getBaseDateFnsLocale } from '@/chart-data-processor/data-table-date-period';
import { defaultDateConfig, formatDateValue, DateConfig } from '@/query/date-formats';

export type DateFormatter = (date: Date, format: string) => string;

/**
 * Creates a date formatter function
 *
 * @param locale - The locale to use for formatting
 * @param cfg - The date configuration to use for formatting
 * @returns A function that formats dates
 */
export function createDateFormatter(
  locale: Locale = getBaseDateFnsLocale(),
  cfg: DateConfig = defaultDateConfig,
): DateFormatter {
  return (date: Date, format: string) => formatDateValue(date, format, locale, cfg);
}
