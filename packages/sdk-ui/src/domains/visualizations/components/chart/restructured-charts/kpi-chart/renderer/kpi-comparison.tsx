import { RefObject, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { KpiTextStyleInternal } from '@/domains/visualizations/core/chart-options-processor/translations/design-options.js';
import { useThemeContext } from '@/infra/contexts/theme-provider/index.js';
import type { KpiIconCondition, NumberFormatConfig } from '@/types.js';

import {
  applyTextTransform,
  buildDeltaCaption,
  buildTargetReadout,
  formatDelta,
  formatKpiValue,
  KpiComparisonDisplay,
  KpiTargetTextOverrides,
} from './helpers.js';
import {
  CardTextAlign,
  COMPARISON_ARROW_EM,
  COMPARISON_PRIMARY_GAP_PX,
  ComparisonArea,
  ComparisonArrow,
  ComparisonClipText,
  ComparisonPrimaryText,
  ComparisonRoot,
  ComparisonSecondaryText,
} from './kpi-card-styles.js';
import { KpiConditionalIcon, toIconAffix } from './kpi-conditional-icon.js';
import { AUTO_FIT_MAX_PX, AUTO_FIT_MIN_PX } from './kpi-value.js';
import type { AutoFitAffix } from './use-auto-fit-font-size.js';
import { useAutoFitFontSize } from './use-auto-fit-font-size.js';
import { useElementSize } from './use-element-size.js';

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
  /** Resolved typography of the primary readout line (`designOptions.comparison.textStyle`). */
  textStyle: KpiTextStyleInternal;
  /**
   * `designOptions.comparison.label` -- when set, replaces the data-driven text verbatim: the whole
   * caption of a delta-shaped comparison (no baseline appended), the `{{goal}}` name of a
   * `'target'`, or the label of a `'value'` comparison.
   */
  labelOverride?: string;
  /**
   * `designOptions.comparison.{ofGoalText,toGoText}` -- consumer templates replacing the
   * localized `'target'` readout strings when set (see {@link KpiTargetTextOverrides}).
   */
  targetTextOverrides?: KpiTargetTextOverrides;
  /**
   * `'headline'` in the `'comparison-first'` layout, where the comparison takes over the headline
   * role -- reading big and participating in auto-fit sizing exactly like the value does in the
   * `'standard'` layout (mirrors `KpiValueProps.scale`). `'compact'` (the `'standard'` layout's
   * default) keeps the fixed small readout.
   */
  scale: 'headline' | 'compact';
  /**
   * Collapses the two-line readout (value + label) onto a single line at short cards. Only honored
   * at the `'compact'` scale: a `'headline'`-scale readout always stacks its label on its own line
   * below the headline, so the label never competes with the auto-fitted headline for width.
   */
  compact: boolean;
  /**
   * Card text alignment, applied to the readout's flex alignment (mirrors the value/title).
   * @default 'left'
   */
  textAlign?: CardTextAlign;
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
 * - `'previous-period'` / `'delta'`: an arrow plus the delta/percent (per `display`), captioned by
 *   the relation to the baseline and its value (`'vs Total Cost (107.27M)'`, see
 *   {@link buildDeltaCaption}).
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
  textStyle,
  labelOverride,
  targetTextOverrides,
  scale,
  compact,
  textAlign = 'left',
  onColor,
  maxHeightPx,
  areaRef,
}: KpiComparisonProps) {
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();
  const internalRef = useRef<HTMLDivElement>(null);
  const containerRef = areaRef ?? internalRef;
  // At headline scale the auto-fitted primary and this label stack in the same ComparisonArea, but
  // only the primary participates in the fit -- so the label's own height must be reserved out of
  // the headline height budget, or the label would push the whole readout past its budget and clip
  // the compact sibling (the value in 'comparison-first'). The label size is independent of the fit
  // (fixed 0.7rem), so measuring it is non-circular.
  const labelRef = useRef<HTMLDivElement>(null);
  const labelSize = useElementSize(labelRef);
  // Only attach (and thus observe) the label at headline scale, where its height is reserved from
  // the auto-fit budget. At compact scale the label needs no measurement, and attaching the ref
  // would spin up a ResizeObserver the compact path is contractually free of.
  const secondaryRef = scale === 'headline' ? labelRef : undefined;
  const label = labelOverride ?? comparison.label;
  const iconElement = conditionalIcon && (
    <KpiConditionalIcon icon={conditionalIcon.icon} color={color} />
  );

  // `label` (not `comparison.label`) feeds `{{goal}}`, so a `labelOverride` renames the goal in
  // templates that interpolate it -- same precedence the delta caption follows.
  const targetReadout =
    comparison.type === 'target'
      ? buildTargetReadout(
          {
            target: comparison.target,
            percentOfTarget: comparison.percentOfTarget,
            toGo: comparison.toGo,
            label,
          },
          numberFormatConfig,
          t,
          targetTextOverrides,
        )
      : undefined;
  const ofGoalText = targetReadout?.ofGoalText;
  const toGoText = targetReadout?.toGoText;
  const isDeltaShaped = comparison.type === 'previous-period' || comparison.type === 'delta';
  const deltaText = isDeltaShaped
    ? formatDelta(comparison, display, t, numberFormatConfig)
    : undefined;
  // The caption under a delta-shaped readout names what the delta is measured against and that
  // baseline's own value; a bare measure title there reads as the *subject* of the change.
  const deltaCaption = isDeltaShaped
    ? buildDeltaCaption(comparison, numberFormatConfig, t, labelOverride)
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
  // the auto-fit (mirrors KpiValue's icon affix): the comparison arrow (delta-shaped comparisons
  // only, when enabled) and the conditional icon ('value'-type comparisons render neither).
  // Gaps mirror the CSS: every extra flex item adds the primary text's flex gap; the icon also
  // carries its own margin-inline-end.
  const showArrow = isDeltaShaped && showIcon;
  const increased = isDeltaShaped && (comparison.deltaPercent ?? comparison.deltaValue) >= 0;
  const arrowGlyph = increased ? '▲' : '▼';
  const affixes: AutoFitAffix[] = [
    ...(conditionalIcon && comparison.type !== 'value'
      ? [toIconAffix(conditionalIcon.icon, COMPARISON_PRIMARY_GAP_PX, textStyle.textTransform)]
      : []),
    ...(showArrow
      ? [{ text: arrowGlyph, emScale: COMPARISON_ARROW_EM, gapPx: COMPARISON_PRIMARY_GAP_PX }]
      : []),
  ];

  // Reserve the stacked label's measured height out of the headline budget (see labelRef above).
  const headlineHeightBudget =
    scale === 'headline' && maxHeightPx !== undefined
      ? Math.max(0, maxHeightPx - labelSize.height)
      : maxHeightPx;
  const autoFitFontSizePx = useAutoFitFontSize({
    containerRef,
    // Measured as painted: see KpiValue for why the CSS transform is mirrored here.
    text: applyTextTransform(primaryText, textStyle.textTransform),
    font: {
      family: textStyle.fontFamily ?? themeSettings.typography.fontFamily,
      weight: textStyle.fontWeight,
      style: textStyle.fontStyle,
    },
    minPx: AUTO_FIT_MIN_PX,
    maxPx: AUTO_FIT_MAX_PX,
    maxHeightPxOverride: headlineHeightBudget,
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
        <ComparisonRoot $compact={singleLine} $align={textAlign}>
          <ComparisonPrimaryText
            theme={themeSettings}
            $color={color}
            $scale={scale}
            $textStyle={textStyle}
            style={primaryStyle}
          >
            {iconElement}
            <ComparisonClipText title={targetPrimaryText}>{targetPrimaryText}</ComparisonClipText>
          </ComparisonPrimaryText>
          {targetSecondaryText && (
            <ComparisonSecondaryText
              ref={secondaryRef}
              theme={themeSettings}
              $onColor={onColor}
              title={targetSecondaryText}
            >
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
        <ComparisonRoot $compact={singleLine} $align={textAlign}>
          <ComparisonPrimaryText
            theme={themeSettings}
            $color={color}
            $scale={scale}
            $textStyle={textStyle}
            style={primaryStyle}
          >
            <ComparisonClipText title={primaryText}>{primaryText}</ComparisonClipText>
          </ComparisonPrimaryText>
          {label && (
            <ComparisonSecondaryText
              ref={secondaryRef}
              theme={themeSettings}
              $onColor={onColor}
              title={label ?? undefined}
            >
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
      <ComparisonRoot $compact={singleLine} $align={textAlign}>
        <ComparisonPrimaryText
          theme={themeSettings}
          $color={color}
          $scale={scale}
          $textStyle={textStyle}
          style={primaryStyle}
        >
          {iconElement}
          {showArrow && <ComparisonArrow aria-hidden="true">{arrowGlyph}</ComparisonArrow>}
          <ComparisonClipText title={deltaText ?? undefined}>{deltaText}</ComparisonClipText>
        </ComparisonPrimaryText>
        {deltaCaption && (
          <ComparisonSecondaryText
            ref={secondaryRef}
            theme={themeSettings}
            $onColor={onColor}
            title={deltaCaption}
          >
            {deltaCaption}
          </ComparisonSecondaryText>
        )}
      </ComparisonRoot>
    </ComparisonArea>
  );
}
