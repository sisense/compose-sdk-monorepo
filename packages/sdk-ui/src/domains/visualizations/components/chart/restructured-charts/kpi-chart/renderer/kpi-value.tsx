import { RefObject, useRef } from 'react';

import { useThemeContext } from '@/infra/contexts/theme-provider/index.js';
import type { KpiIconCondition, KpiTextSize } from '@/types.js';

import { ValueArea, ValueText } from './kpi-card-styles.js';
import { KpiConditionalIcon, toIconAffix } from './kpi-conditional-icon.js';
import type { AutoFitAffix } from './use-auto-fit-font-size.js';
import { useAutoFitFontSize } from './use-auto-fit-font-size.js';

/**
 * Auto-fit corridor for whichever of value/comparison currently plays the "headline" role.
 * Exported so `kpi-comparison.tsx` uses the exact same range when it plays that role instead
 * (`layout: 'comparison-first'`), keeping the two visually interchangeable.
 * @internal
 */
export const AUTO_FIT_MIN_PX = 16;
/** @internal */
export const AUTO_FIT_MAX_PX = 64;

/** Fixed font size for the "compact" scale -- matches the comparison readout's own compact size. */
const COMPACT_FONT_SIZE = '0.9rem';

/**
 * Defines the props of {@link KpiValue}.
 * @internal
 */
export type KpiValueProps = {
  /** Already-formatted display text (the formatted value, or `designOptions.value.noDataText`). */
  text: string;
  /**
   * Resolves to the display color for a real value -- the measure's data-driven color, or the
   * theme-accent default (either one possibly overridden by `onBeforeRender`). Left unset for the
   * no-data placeholder, which falls back to the styled `ValueText`'s own onColor/theme text
   * styling instead.
   */
  color?: string;
  /** `'auto'` for auto-fit sizing, or a fixed font size in px. */
  textSize: KpiTextSize;
  /** First matching conditional icon for the value, if any. */
  icon?: KpiIconCondition;
  onColor: boolean;
  /**
   * `'headline'` in the `'standard'` layout, where the value reads big and participates in
   * auto-fit sizing; `'compact'` in `'comparison-first'`, where the comparison takes the headline
   * role instead and the value renders small (mirrors `KpiComparisonProps.scale`). Only affects
   * sizing when `textSize` is `'auto'` -- an explicit fixed `textSize` always wins.
   */
  scale: 'headline' | 'compact';
  /**
   * Non-circular height budget for the `'headline'` auto-fit computation, forwarded to
   * {@link useAutoFitFontSize}'s `maxHeightPxOverride`. Required whenever `scale` is
   * `'headline'`, since `ValueArea`'s own box is `flex: 0 0 auto` (content-sized) inside
   * `BodyArea`, not a safe self-measurement target -- see that hook's TSDoc for why.
   */
  maxHeightPx?: number;
  /**
   * External ref to `ValueArea`, so the orchestrator can measure it (e.g. as the *other*
   * sibling's height budget input when this component plays the `'compact'` role). Falls back to
   * an internal ref when not supplied.
   */
  areaRef?: RefObject<HTMLDivElement | null>;
};

/**
 * Renders the KPI card's headline value, auto-fitting its font size to the available box when
 * `textSize` is `'auto'` and `scale` is `'headline'`. A conditional icon shares the value's
 * nowrap box, so it's budgeted into the fit as an {@link AutoFitAffix} (its glyph is em-scaled
 * with the fitted font; its margin is fixed px) -- otherwise the icon's width would push the
 * text into `text-overflow: ellipsis` at exactly the size the fit claimed was safe.
 * @internal
 */
export function KpiValue({
  text,
  color,
  textSize,
  icon,
  onColor,
  scale,
  maxHeightPx,
  areaRef,
}: KpiValueProps) {
  const { themeSettings } = useThemeContext();
  const internalRef = useRef<HTMLDivElement>(null);
  const containerRef = areaRef ?? internalRef;

  const affixes: AutoFitAffix[] | undefined = icon ? [toIconAffix(icon.icon)] : undefined;

  const autoFitFontSizePx = useAutoFitFontSize({
    containerRef,
    text,
    font: { family: themeSettings.typography.fontFamily, weight: 700 },
    minPx: AUTO_FIT_MIN_PX,
    maxPx: AUTO_FIT_MAX_PX,
    maxHeightPxOverride: maxHeightPx,
    affixes,
    // The auto-fit result is only consumed at the 'auto' + 'headline' combination (see
    // `fontSize` below); skip the observer/canvas/font-watch work entirely otherwise.
    enabled: textSize === 'auto' && scale === 'headline',
  });

  const fontSize =
    textSize !== 'auto'
      ? `${textSize}px`
      : scale === 'headline'
      ? `${autoFitFontSizePx}px`
      : COMPACT_FONT_SIZE;

  return (
    <ValueArea ref={containerRef} data-kpi-area="value">
      <ValueText theme={themeSettings} $onColor={onColor} $color={color} style={{ fontSize }}>
        {icon && <KpiConditionalIcon icon={icon.icon} color={color} />}
        {text}
      </ValueText>
    </ValueArea>
  );
}
