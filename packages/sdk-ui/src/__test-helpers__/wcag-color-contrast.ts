/**
 * WCAG 2.x sRGB relative luminance and contrast ratio utilities for unit tests.
 *
 * @internal
 */

/** Linearizes an 8-bit sRGB channel value (0–255) for luminance calculation. */
export function linearizeChannel(channel255: number): number {
  const c = channel255 / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Relative luminance for a `#RRGGBB` hex color (leading `#` optional). */
export function relativeLuminance(hex6: string): number {
  const normalized = hex6.replace('#', '');
  const n = parseInt(normalized, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.2126 * linearizeChannel(r) + 0.7152 * linearizeChannel(g) + 0.0722 * linearizeChannel(b);
}

/** WCAG contrast ratio between two `#RRGGBB` hex colors. */
export function wcagContrastRatio(foregroundHex: string, backgroundHex: string): number {
  const l1 = relativeLuminance(foregroundHex);
  const l2 = relativeLuminance(backgroundHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
