import { RefObject, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useThemeContext } from '@/infra/contexts/theme-provider/index.js';
import type { KpiIconCondition, NumberFormatConfig } from '@/types.js';

import { formatDelta, formatKpiValue, KpiComparisonDisplay } from './helpers.js';
import {
  COMPARISON_ARROW_EM,
  COMPARISON_PRIMARY_GAP_PX,
  ComparisonArea,
  ComparisonArrow,
  ComparisonPrimaryText,
  ComparisonRoot,
  ComparisonSecondaryText,
  CONDITIONAL_ICON_EM,
  CONDITIONAL_ICON_GAP_PX,
  ConditionalIconSpan,
} from './kpi-card-styles.js';
import { AUTO_FIT_MAX_PX, AUTO_FIT_MIN_PX } from './kpi-value.js';
import type { AutoFitAffix } from './use-auto-fit-font-size.js';
import { useAutoFitFontSize } from './use-auto-fit-font-size.js';

/**
 * Defines the props of {@link KpiComparison}.
 * @internal
 */
export type KpiComparisonProps = {
  comparison: KpiComparisonDisplay;
  /** Pre-resolved display color (via `resolveComparisonColor` for delta/target, or the data-driven color for `'value'`). */
  color?: string;
  /** Format config for the comparison's own numbers -- the `'value'` measure's format, or the headline's. */
  numberFormatConfig?: NumberFormatConfig;
  display: 'percent' | 'value' | 'both';
  showIcon: boolean;
  /**
   * First matching condition-driven icon for the comparison readout, if any -- resolved by the
   * renderer against the same metric the comparison color conditions evaluate (`deltaPercent` /
   * `percentOfTarget`); mirrors the headline's `KpiValueProps.icon`.
   */
  conditionalIcon?: KpiIconCondition;
  /** `designOptions.comparison.label` -- overrides the data-driven label when set. */
  labelOverride?: string;
  /**
   * `'headline'` in the `'big-comparison'` layout, where the comparison takes over the headline
   * role -- reading big and participating in auto-fit sizing exactly like the value does in the
   * `'standard'` layout (mirrors `KpiValueProps.scale`). `'compact'` (the `'standard'` layout's
   * default) keeps the fixed small readout.
   */
  scale: 'headline' | 'compact';
  /**
   * Collapses the two-line readout (value + label) onto a single line at the `'sm'`/`'xs'` tiers.
   * Only honored at the `'compact'` scale: a `'headline'`-scale readout always stacks its label
   * on its own line below the headline, so the label never competes with the auto-fitted
   * headline for width.
   */
  compact: boolean;
  onColor: boolean;
  /**
   * Non-circular height budget for the `'headline'` auto-fit computation, forwarded to
   * {@link useAutoFitFontSize}'s `maxHeightPxOverride`. Required whenever `scale` is `'headline'`
   * -- see `KpiValueProps.maxHeightPx`'s TSDoc for why `ComparisonArea`'s own box isn't a safe
   * self-measurement target.
   */
  maxHeightPx?: number;
  /**
   * External ref to `ComparisonArea`, so the orchestrator can measure it (e.g. as the *other*
   * sibling's height budget input when this component plays the `'compact'` role). Falls back to
   * an internal ref when not supplied.
   */
  areaRef?: RefObject<HTMLDivElement | null>;
};

/**
 * Renders the KPI card's comparison readout. Switches on {@link KpiComparisonDisplay}'s `type`:
 * - `'previous-period'` / `'delta'`: an arrow plus the delta/percent (per `display`).
 * - `'target'`: `'82% of goal'` + `'$250K to go'` (percent sign baked into the interpolation).
 * - `'value'`: the label plus the comparison's own formatted number.
 * @internal
 */
export function KpiComparison({
  comparison,
  color,
  numberFormatConfig,
  display,
  showIcon,
  conditionalIcon,
  labelOverride,
  scale,
  compact,
  onColor,
  maxHeightPx,
  areaRef,
}: KpiComparisonProps) {
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();
  const internalRef = useRef<HTMLDivElement>(null);
  const containerRef = areaRef ?? internalRef;
  const label = labelOverride ?? comparison.label;
  const iconElement = conditionalIcon && (
    <ConditionalIconSpan aria-hidden="true" $color={conditionalIcon.color ?? color}>
      {conditionalIcon.icon}
    </ConditionalIconSpan>
  );

  const roundedPercent =
    comparison.type === 'target' && comparison.percentOfTarget !== undefined
      ? Math.round(comparison.percentOfTarget)
      : undefined;
  // The '{{percent}} of goal' template carries no unit of its own, so the percent sign must be
  // baked into the interpolated value (matching the aria path's formatting).
  const ofGoalText =
    roundedPercent !== undefined
      ? t('kpi.target.ofGoal', { percent: `${roundedPercent}%`, goal: label })
      : undefined;
  const deltaText =
    comparison.type === 'previous-period' || comparison.type === 'delta'
      ? formatDelta(comparison, display, numberFormatConfig)
      : undefined;
  const toGoText =
    comparison.type === 'target'
      ? t('kpi.target.toGo', {
          value: formatKpiValue(Math.abs(comparison.toGo), numberFormatConfig),
        })
      : undefined;

  // `display` semantics for a 'target' comparison: 'percent' renders only the percent-of-goal
  // line, 'value' only the amount-to-go line (as the primary), 'both' renders percent primary +
  // to-go secondary. When the percent isn't meaningful (undefined percentOfTarget), the to-go
  // line is promoted to primary regardless of `display` -- the readout never renders empty.
  const targetPrimaryText =
    comparison.type === 'target'
      ? display === 'value'
        ? toGoText
        : ofGoalText ?? toGoText
      : undefined;
  const targetSecondaryText =
    comparison.type === 'target' && display === 'both' && ofGoalText ? toGoText : undefined;

  // Whatever primary text is *actually* about to render for this comparison.type -- computed up
  // front so the auto-fit hook below (which must run unconditionally, per the rules of hooks)
  // always measures the real rendered text (including which target line `display` promotes to
  // primary), not a stand-in.
  const primaryText: string =
    comparison.type === 'value'
      ? formatKpiValue(comparison.value, numberFormatConfig)
      : comparison.type === 'target'
      ? targetPrimaryText ?? ''
      : deltaText ?? '';

  // Inline decorations that share the primary text's nowrap flex box and must be budgeted into
  // the auto-fit (mirrors KpiValue's icon affix): the trend arrow (delta-shaped comparisons
  // only, when enabled) and the conditional icon ('value'-type comparisons render neither).
  // Gaps mirror the CSS: every extra flex item adds the primary text's flex gap; the icon also
  // carries its own margin-inline-end.
  const isDeltaShaped = comparison.type === 'previous-period' || comparison.type === 'delta';
  const showArrow = isDeltaShaped && showIcon;
  const increased = isDeltaShaped && (comparison.deltaPercent ?? comparison.deltaValue) >= 0;
  const arrowGlyph = increased ? '▲' : '▼';
  const affixes: AutoFitAffix[] = [
    ...(conditionalIcon && comparison.type !== 'value'
      ? [
          {
            text: conditionalIcon.icon,
            emScale: CONDITIONAL_ICON_EM,
            gapPx: CONDITIONAL_ICON_GAP_PX + COMPARISON_PRIMARY_GAP_PX,
          },
        ]
      : []),
    ...(showArrow
      ? [{ text: arrowGlyph, emScale: COMPARISON_ARROW_EM, gapPx: COMPARISON_PRIMARY_GAP_PX }]
      : []),
  ];

  const autoFitFontSizePx = useAutoFitFontSize({
    containerRef,
    text: primaryText,
    font: { family: themeSettings.typography.fontFamily, weight: 600 },
    minPx: AUTO_FIT_MIN_PX,
    maxPx: AUTO_FIT_MAX_PX,
    maxHeightPxOverride: maxHeightPx,
    affixes,
    // The auto-fit result is only consumed at the 'headline' scale (see `primaryStyle`
    // below); skip the observer/canvas/font-watch work entirely at 'compact'.
    enabled: scale === 'headline',
  });
  const primaryStyle = scale === 'headline' ? { fontSize: `${autoFitFontSizePx}px` } : undefined;

  // At headline scale the label ALWAYS stacks on its own line below the headline (it must never
  // compete with the auto-fitted headline for width -- it would ellipsize at exactly the size
  // the fit claimed was safe). The tier-driven single-line collapse only applies at compact
  // scale.
  const singleLine = compact && scale !== 'headline';

  if (comparison.type === 'target') {
    return (
      <ComparisonArea ref={containerRef} data-kpi-area="comparison">
        <ComparisonRoot $compact={singleLine}>
          <ComparisonPrimaryText
            theme={themeSettings}
            $color={color}
            $scale={scale}
            style={primaryStyle}
          >
            {iconElement}
            {targetPrimaryText}
          </ComparisonPrimaryText>
          {targetSecondaryText && (
            <ComparisonSecondaryText theme={themeSettings} $onColor={onColor}>
              {targetSecondaryText}
            </ComparisonSecondaryText>
          )}
        </ComparisonRoot>
      </ComparisonArea>
    );
  }

  if (comparison.type === 'value') {
    return (
      <ComparisonArea ref={containerRef} data-kpi-area="comparison">
        <ComparisonRoot $compact={singleLine}>
          <ComparisonPrimaryText
            theme={themeSettings}
            $color={color}
            $scale={scale}
            style={primaryStyle}
          >
            {primaryText}
          </ComparisonPrimaryText>
          {label && (
            <ComparisonSecondaryText theme={themeSettings} $onColor={onColor}>
              {label}
            </ComparisonSecondaryText>
          )}
        </ComparisonRoot>
      </ComparisonArea>
    );
  }

  // 'previous-period' | 'delta'
  return (
    <ComparisonArea ref={containerRef} data-kpi-area="comparison">
      <ComparisonRoot $compact={singleLine}>
        <ComparisonPrimaryText
          theme={themeSettings}
          $color={color}
          $scale={scale}
          style={primaryStyle}
        >
          {iconElement}
          {showArrow && <ComparisonArrow aria-hidden="true">{arrowGlyph}</ComparisonArrow>}
          {deltaText}
        </ComparisonPrimaryText>
        {label && (
          <ComparisonSecondaryText theme={themeSettings} $onColor={onColor}>
            {label}
          </ComparisonSecondaryText>
        )}
      </ComparisonRoot>
    </ComparisonArea>
  );
}
