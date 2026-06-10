/**
 * Truncates a pill label when it exceeds `maxLength`. When `maxLength` is zero or negative,
 * the label is returned unchanged.
 *
 * @param label - Full pill label
 * @param maxLength - Maximum number of characters before truncation; `0` disables truncation
 * @returns Truncated label with an ellipsis suffix when shortened
 * @internal
 */
export function truncatePillLabel(label: string, maxLength: number): string {
  if (maxLength <= 0 || label.length <= maxLength) {
    return label;
  }
  return `${label.slice(0, maxLength)}...`;
}
