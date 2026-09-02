/**
 * Formats a row count with the given locale's thousands separator
 * (e.g. `3,201` for `en-US`, `3 201` for `fr-FR`).
 *
 * @param count - Row count to format.
 * @param locale - BCP 47 locale tag used to pick the thousands separator.
 * @returns The locale-formatted row count.
 * @internal
 */
export function formatRowCount(count: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(count);
}
