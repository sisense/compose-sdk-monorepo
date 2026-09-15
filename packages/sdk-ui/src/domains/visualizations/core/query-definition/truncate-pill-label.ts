import { FILTER_CHIP_SEPARATOR } from './filter-to-readable-label';

/**
 * Truncates a pill label when it exceeds `maxLength`. When `maxLength` is zero or negative,
 * the label is returned unchanged.
 * Filter chips (`Label: Value`) are cut from the **value** side so the field name stays intact.
 * Other pills are cut from the start.
 * @param label - Full pill label
 * @param maxLength - Maximum number of characters before truncation; `0` disables truncation
 * @returns Truncated label with an ellipsis suffix when shortened
 * @internal
 */
export function truncatePillLabel(label: string, maxLength: number): string {
  if (maxLength <= 0 || label.length <= maxLength) {
    return label;
  }
  const separatorIndex = label.indexOf(FILTER_CHIP_SEPARATOR);
  if (separatorIndex !== -1) {
    const prefix = label.slice(0, separatorIndex + FILTER_CHIP_SEPARATOR.length);
    const value = label.slice(separatorIndex + FILTER_CHIP_SEPARATOR.length);
    const valueBudget = maxLength - prefix.length;
    if (valueBudget <= 0) {
      return `${prefix}...`;
    }
    return `${prefix}${value.slice(0, valueBudget)}...`;
  }
  return `${label.slice(0, maxLength)}...`;
}
