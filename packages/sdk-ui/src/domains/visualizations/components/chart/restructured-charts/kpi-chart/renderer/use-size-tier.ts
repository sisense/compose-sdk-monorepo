/**
 * Coarse size classification for a KPI card, used to switch layout/typography rules
 * as the card is resized rather than continuously scaling every property.
 * @internal
 */
export type KpiSizeTier = 'xs' | 'sm' | 'md' | 'lg';

const TIER_ORDER: readonly KpiSizeTier[] = ['xs', 'sm', 'md', 'lg'];

// Upper-bound thresholds (exclusive) for 'xs' | 'sm' | 'md', checked independently per axis;
// a value at or above the last threshold is 'lg'.
const WIDTH_THRESHOLDS_PX: readonly [number, number, number] = [200, 320, 520];
const HEIGHT_THRESHOLDS_PX: readonly [number, number, number] = [120, 180, 280];

function tierForAxis(value: number, thresholds: readonly [number, number, number]): KpiSizeTier {
  if (value < thresholds[0]) return 'xs';
  if (value < thresholds[1]) return 'sm';
  if (value < thresholds[2]) return 'md';
  return 'lg';
}

/**
 * Classifies a width/height pair into a coarse {@link KpiSizeTier}.
 *
 * Width and height are classified independently against their own thresholds, and the
 * smaller-tier axis wins -- a card that's wide but short is still capped to the smaller
 * tier. For example, 600x100 is `'xs'` (not `'lg'`) because the height falls below the
 * `'xs'` floor even though the width alone would qualify for `'lg'`.
 * @param width - Card width in CSS pixels.
 * @param height - Card height in CSS pixels.
 * @returns The size tier: `'xs'`, `'sm'`, `'md'`, or `'lg'`.
 * @internal
 */
export function getSizeTier(width: number, height: number): KpiSizeTier {
  const widthTier = tierForAxis(width, WIDTH_THRESHOLDS_PX);
  const heightTier = tierForAxis(height, HEIGHT_THRESHOLDS_PX);
  return TIER_ORDER[Math.min(TIER_ORDER.indexOf(widthTier), TIER_ORDER.indexOf(heightTier))];
}

/**
 * Classifies height alone (against the height thresholds), independent of width. Used where an
 * adaptation depends on vertical room specifically -- e.g. collapsing the comparison readout onto
 * one line only when the card is genuinely short (a decision that must ignore width, so a
 * narrow-but-tall card keeps its readout stacked rather than single-lining and clipping).
 * @param height - Card height in CSS pixels.
 * @internal
 */
export function getHeightTier(height: number): KpiSizeTier {
  return tierForAxis(height, HEIGHT_THRESHOLDS_PX);
}
