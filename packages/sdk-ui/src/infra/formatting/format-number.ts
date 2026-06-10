import {
  applyFormatPlainText,
  getCompleteNumberFormatConfig,
} from '@/domains/visualizations/core/chart-options-processor/translations/number-format-config';
import type { NumberFormatConfig } from '@/types';

/**
 * Formats a single numeric value using the provided {@link NumberFormatConfig}.
 *
 * Missing config falls back to defaults:
 * Numbers type, auto decimal scale, thousand separator enabled, all abbreviations (K/M/B/T) enabled.
 *
 * Returns an empty string when `value` is `NaN`.
 *
 * @example
 * formatNumber(1234567);
 * // returns '1.23M'
 *
 * formatNumber(0.42, { name: 'Percent', decimalScale: 1 });
 * // returns '42.0%'
 *
 * formatNumber(1500, { name: 'Currency', symbol: '€', prefix: true });
 * // returns '€1.5K'
 * @param value - The numeric value to format.
 * @param config - Formatting configuration.
 * @returns Formatted string representation of the value.
 * @group Formatting
 */
export function formatNumber(value: number, config?: NumberFormatConfig): string {
  return applyFormatPlainText(getCompleteNumberFormatConfig(config), value);
}
