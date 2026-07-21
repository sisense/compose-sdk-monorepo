import {
  applyFormat,
  getCompleteNumberFormatConfig,
} from '@/domains/visualizations/core/chart-options-processor/translations/number-format-config.js';
import type {
  KpiComparisonInfo,
  KpiDataPoint,
  KpiIconCondition,
  KpiRenderOptions,
  NumberFormatConfig,
} from '@/types.js';

import { KpiChartData, KpiComparisonData } from '../types.js';

/**
 * Caps the displayed percent difference so a near-zero baseline doesn't blow up the readout.
 * @internal
 */
export const MAX_DISPLAY_PERCENT_DIFF = 999.99;

/** The `'previous-period'` comparison type discriminant, factored out to avoid repeating the literal. */
const PREVIOUS_PERIOD = 'previous-period';

/**
 * Formats a KPI number through the shared number-format pipeline (plain text, no markup).
 * @internal
 */
export function formatKpiValue(value: number, config?: NumberFormatConfig): string {
  return applyFormat(getCompleteNumberFormatConfig(config), value);
}

/**
 * Computes the non-circular height budget for whichever of value/comparison plays the
 * "headline" (auto-fit) role in `BodyArea`: its `flex: 0 0 auto` sibling's own box is
 * content-sized, so subtracting the *sibling's* measured height (plus the gap between them) from
 * `BodyArea`'s own (grid-derived, safe-to-self-measure) height gives the headline element's real
 * available height -- see `use-auto-fit-font-size.ts`'s `maxHeightPxOverride` TSDoc for why this
 * indirection is needed at all. Clamped to 0 so a not-yet-measured (0-height) `BodyArea` -- or a
 * compact sibling briefly taller than `BodyArea` mid-resize -- never yields a negative budget.
 * @internal
 */
export function computeHeadlineMaxHeightPx(
  bodyHeightPx: number,
  compactSiblingHeightPx: number,
  gapPx: number,
): number {
  return Math.max(0, bodyHeightPx - compactSiblingHeightPx - gapPx);
}

/**
 * Formats a percent difference with an explicit sign, capped at {@link MAX_DISPLAY_PERCENT_DIFF}.
 * @internal
 */
export function formatPercentDiff(percentDiff: number): string {
  const capped = Math.max(
    -MAX_DISPLAY_PERCENT_DIFF,
    Math.min(MAX_DISPLAY_PERCENT_DIFF, percentDiff),
  );
  const sign = capped >= 0 ? '+' : '';
  return `${sign}${capped.toFixed(2)}%`;
}

/**
 * A percent diff is only worth displaying when it's a finite, non-extreme number.
 * @internal
 */
export function isMeaningfulPercentDiff(percentDiff: number | undefined): percentDiff is number {
  return (
    percentDiff !== undefined &&
    Number.isFinite(percentDiff) &&
    Math.abs(percentDiff) <= MAX_DISPLAY_PERCENT_DIFF
  );
}

/**
 * Formats a delta value with an explicit sign, e.g. `+$1.2K` / `-$3.4K`.
 * @internal
 */
export function formatDeltaValue(deltaValue: number, config?: NumberFormatConfig): string {
  const sign = deltaValue >= 0 ? '+' : '';
  return `${sign}${formatKpiValue(deltaValue, config)}`;
}

/**
 * Resolves the first icon condition matching `value` (first-match-wins), or `undefined` when
 * nothing matches or an input is missing.
 * @internal
 */
export function resolveConditionalIcon(
  conditions: KpiIconCondition[] | undefined,
  value: number | undefined,
): KpiIconCondition | undefined {
  if (!conditions || value === undefined) {
    return undefined;
  }
  return conditions.find((condition) =>
    matchesCondition(value, condition.operator, condition.expression),
  );
}

function matchesCondition(
  value: number,
  operator: KpiIconCondition['operator'],
  expression: string,
): boolean {
  const threshold = Number(expression);
  // A malformed/empty expression parses to NaN, which every comparison (including `!=`/`≠`,
  // since NaN never equals anything -- not even itself) would otherwise treat as "always
  // matches"; reject it outright instead of letting an invalid threshold match every value.
  if (Number.isNaN(threshold)) {
    return false;
  }
  switch (operator) {
    case '<':
      return value < threshold;
    case '>':
      return value > threshold;
    case '≤':
    case '<=':
      return value <= threshold;
    case '≥':
    case '>=':
      return value >= threshold;
    case '=':
      return value === threshold;
    case '≠':
    case '!=':
      return value !== threshold;
    default:
      return false;
  }
}

/**
 * Builds the readout text for a delta-shaped comparison (`'previous-period'`/`'delta'`),
 * honoring `display`. `deltaValue` is guaranteed on this shape, so every branch always resolves
 * to a string (falling back to the formatted absolute delta when the percent isn't meaningful).
 * @internal
 */
export function formatDelta(
  comparison: { deltaValue: number; deltaPercent?: number },
  display: 'percent' | 'value' | 'both',
  numberFormatConfig?: NumberFormatConfig,
): string | null {
  const percentText = isMeaningfulPercentDiff(comparison.deltaPercent)
    ? formatPercentDiff(comparison.deltaPercent)
    : null;
  const valueText = formatDeltaValue(comparison.deltaValue, numberFormatConfig);

  switch (display) {
    case 'percent':
      return percentText ?? valueText;
    case 'value':
      return valueText;
    case 'both':
      return percentText ? `${percentText} (${valueText})` : valueText;
    default:
      return valueText;
  }
}

/**
 * Picks the metric a comparison's color (and conditional icon) should be evaluated against, per
 * the contract documented on {@link KpiComparisonInfo} / `KpiComparisonStyleOptions.color`:
 * delta-shaped comparisons compare on `deltaPercent`, `'target'` compares on `percentOfTarget`,
 * and `'value'` has no applicable metric here -- it's colored by its own measure instead.
 *
 * A zero baseline leaves `deltaPercent` undefined (division by zero); this deliberately does
 * NOT fall back to `deltaValue` -- an absolute delta isn't the same unit as a user's percent
 * condition (e.g. `> 5` meaning 5%), and sign-based default coloring would misapply too.
 * `undefined` means "no metric to evaluate against", which `resolveComparisonColor` /
 * `resolveConditionalIcon` both already treat as no color / no icon.
 * @internal
 */
export function metricFor(comparison: {
  type: string;
  deltaValue?: number;
  deltaPercent?: number;
  percentOfTarget?: number;
}): number | undefined {
  switch (comparison.type) {
    case PREVIOUS_PERIOD:
    case 'delta':
      return comparison.deltaPercent;
    case 'target':
      return comparison.percentOfTarget;
    default:
      return undefined;
  }
}

/**
 * Translates the internal {@link KpiComparisonData} into the public {@link KpiComparisonInfo}
 * shape exposed to `onBeforeRender`/`onDataPointClick` consumers, resolving `'previous-period'`'s
 * `labelKey` to display text via `t()`. Internal-only rendering metadata (`color`,
 * `numberFormatConfig`) is intentionally dropped -- it's not part of the public contract.
 * @internal
 */
export function toKpiComparisonInfo(
  comparison: KpiComparisonData,
  t: (key: string) => string,
): KpiComparisonInfo {
  switch (comparison.type) {
    case PREVIOUS_PERIOD:
      return {
        type: PREVIOUS_PERIOD,
        baseline: comparison.baseline,
        deltaValue: comparison.deltaValue,
        deltaPercent: comparison.deltaPercent,
        label: t(comparison.labelKey),
      };
    case 'delta':
      return {
        type: 'delta',
        baseline: comparison.baseline,
        deltaValue: comparison.deltaValue,
        deltaPercent: comparison.deltaPercent,
        label: comparison.label,
      };
    case 'target':
      return {
        type: 'target',
        target: comparison.target,
        percentOfTarget: comparison.percentOfTarget,
        toGo: comparison.toGo,
        label: comparison.label,
      };
    case 'value':
      return {
        type: 'value',
        value: comparison.value,
        label: comparison.label,
      };
  }
}

/**
 * Builds the public {@link KpiRenderOptions} passed to `onBeforeRender`, translating the
 * comparison's `labelKey` (when present) to display text up front -- this always runs, whether
 * or not a consumer supplied `onBeforeRender`, so the label is resolved exactly once per render.
 * @internal
 */
export function toKpiRenderOptions(
  chartData: KpiChartData,
  t: (key: string) => string,
): KpiRenderOptions {
  return {
    value: chartData.value,
    valueTitle: chartData.valueTitle,
    valueColor: chartData.valueColor,
    valuePeriodMs: chartData.valuePeriodMs,
    comparison: chartData.comparison ? toKpiComparisonInfo(chartData.comparison, t) : undefined,
    sparklinePoints: chartData.sparklinePoints,
  };
}

/**
 * Builds the click/context-menu payload from the (possibly `onBeforeRender`-adjusted) render options.
 * @internal
 */
export function toKpiDataPoint(renderOptions: KpiRenderOptions): KpiDataPoint {
  return {
    value: renderOptions.value,
    date: renderOptions.valuePeriodMs,
    comparison: renderOptions.comparison,
  };
}

/**
 * Comparison data shaped for display: same as {@link KpiComparisonData}, but with
 * `'previous-period'`'s `labelKey` already resolved to `label` (matching `'delta'`'s shape), so
 * `kpi-comparison.tsx` only ever needs to read `label`.
 * @internal
 */
export type KpiComparisonDisplay =
  | {
      type: 'previous-period' | 'delta';
      baseline: number;
      deltaValue: number;
      deltaPercent?: number;
      label: string;
      color?: string;
    }
  | {
      type: 'target';
      target: number;
      percentOfTarget?: number;
      toGo: number;
      label: string;
      color?: string;
    }
  | {
      type: 'value';
      value: number;
      label: string;
      color?: string;
      numberFormatConfig?: NumberFormatConfig;
    };

/**
 * Combines the (possibly `onBeforeRender`-modified) public comparison info with the internal-only
 * metadata (`color`, `numberFormatConfig`) that never left `original` in the first place, so the
 * card can display a consumer's numeric/label override without losing its coloring/formatting.
 * The metadata is only carried over when the type is unchanged -- if a consumer's callback swaps
 * the comparison type entirely, there's no matching original metadata to reuse.
 * @internal
 */
export function toComparisonDisplay(
  original: KpiComparisonData | undefined,
  publicInfo: KpiComparisonInfo,
): KpiComparisonDisplay {
  const matchingOriginal = original && original.type === publicInfo.type ? original : undefined;
  const color =
    matchingOriginal && 'color' in matchingOriginal ? matchingOriginal.color : undefined;

  switch (publicInfo.type) {
    case PREVIOUS_PERIOD:
    case 'delta':
      return {
        type: publicInfo.type,
        baseline: publicInfo.baseline,
        deltaValue: publicInfo.deltaValue,
        deltaPercent: publicInfo.deltaPercent,
        label: publicInfo.label,
        color,
      };
    case 'target':
      return {
        type: 'target',
        target: publicInfo.target,
        percentOfTarget: publicInfo.percentOfTarget,
        toGo: publicInfo.toGo,
        label: publicInfo.label,
        color,
      };
    case 'value':
      return {
        type: 'value',
        value: publicInfo.value,
        label: publicInfo.label,
        color,
        numberFormatConfig:
          matchingOriginal?.type === 'value' ? matchingOriginal.numberFormatConfig : undefined,
      };
  }
}

/**
 * Builds the comparison segment of the card's `aria-label`, e.g. `'+20.00% vs prior month'`.
 *
 * For `'target'` comparisons the summary follows the same `display` semantics as the visible
 * readout (see `kpi-comparison.tsx`), so assistive tech never hears content that isn't shown:
 * `'percent'` reads the percent-of-goal line, `'value'` the amount-to-go line, `'both'` reads
 * both; an unavailable percent falls back to the amount-to-go line.
 * @internal
 */
export function summarizeComparisonForAria(
  comparison: KpiComparisonDisplay,
  numberFormatConfig: NumberFormatConfig | undefined,
  display: 'percent' | 'value' | 'both' = 'percent',
): string {
  switch (comparison.type) {
    case PREVIOUS_PERIOD:
    case 'delta': {
      const deltaText = formatDelta(comparison, display, numberFormatConfig);
      return comparison.label ? `${deltaText} ${comparison.label}` : deltaText ?? '';
    }
    case 'target': {
      const toGoText = `${formatKpiValue(Math.abs(comparison.toGo), numberFormatConfig)} to go`;
      const percentText =
        comparison.percentOfTarget !== undefined
          ? `${Math.round(comparison.percentOfTarget)}% of ${comparison.label}`
          : undefined;
      if (display === 'value' || !percentText) {
        return toGoText;
      }
      return display === 'both' ? `${percentText}, ${toGoText}` : percentText;
    }
    case 'value':
      return `${comparison.label} ${formatKpiValue(
        comparison.value,
        comparison.numberFormatConfig,
      )}`;
  }
}
