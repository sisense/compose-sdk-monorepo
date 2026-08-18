import type {
  KpiChartDataOptionsInternal,
  KpiComparisonInternal,
  StyledMeasureColumn,
} from '@/domains/visualizations/core/chart-data-options/types.js';
import {
  createFormatter,
  getDataPointMetadata,
} from '@/domains/visualizations/core/chart-options-processor/data-points.js';
import {
  applyFormat,
  getCompleteNumberFormatConfig,
} from '@/domains/visualizations/core/chart-options-processor/translations/number-format-config.js';
import type {
  DataPointEntry,
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
 * Minimal translate signature the KPI formatters need -- structurally compatible with
 * react-i18next's `t`, but narrow enough for tests to stub with a plain function.
 * @internal
 */
export type KpiTranslateFn = (key: string, options?: Record<string, unknown>) => string;

/**
 * Interpolates `{{name}}` placeholders in a consumer-supplied template (e.g.
 * `KpiComparisonStyleOptions.ofGoalText`). Uses i18next's `{{...}}` placeholder syntax so
 * override templates read the same as the built-in locale strings, but interpolates directly --
 * an override is a literal string, not a translation key. Unknown placeholders are left as-is.
 * @internal
 */
export function interpolateTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name: string) => vars[name] ?? match);
}

/**
 * Formats a KPI number through the shared number-format pipeline (plain text, no markup).
 * @internal
 */
export function formatKpiValue(value: number, config?: NumberFormatConfig): string {
  return applyFormat(getCompleteNumberFormatConfig(config), value);
}

/**
 * Number format for the derived percent-of-target metric: the shared pipeline's defaults
 * ('auto' decimal scale — up to 2 decimals, trailing zeros trimmed), minus unit abbreviations —
 * an extreme ratio must render as '500,000%', never '500K%'. Deliberately NOT the measure's own
 * config: the percent is a derived ratio, and inheriting a currency prefix would corrupt it
 * ('$83.33%').
 */
const PERCENT_OF_TARGET_FORMAT: NumberFormatConfig = {
  decimalScale: 'auto',
  trillion: false,
  billion: false,
  million: false,
  kilo: false,
};

/**
 * Renders an already-formatted percent magnitude through the locale's `kpi.percentFormat`
 * template, which owns the percent sign's placement (suffix in English `82%`, prefix in Turkish
 * `%82`, spaced in French `82 %`) instead of a `%` hardcoded in TS.
 * @internal
 */
export function formatPercentText(
  t: KpiTranslateFn,
  value: string,
  sign: '' | '+' | '-' = '',
): string {
  return t('kpi.percentFormat', { sign, value });
}

/**
 * Formats a `'target'` comparison's percent-of-goal metric for display (e.g. `'83.33%'`) through
 * the shared number-format pipeline — the same formatting path the indicator chart uses — instead
 * of hardcoded integer rounding. The percent sign's placement is locale-driven (see
 * {@link formatPercentText}).
 * @internal
 */
export function formatPercentOfTarget(percentOfTarget: number, t: KpiTranslateFn): string {
  return formatPercentText(t, formatKpiValue(percentOfTarget, PERCENT_OF_TARGET_FORMAT));
}

/**
 * Reads the number-format config carried by a `'delta'`/`'target'` comparison's own measure, or
 * `undefined` when there is no measure-backed config to honor (fixed-number target,
 * `'previous-period'`, or no comparison at all). `'value'`-type comparisons intentionally return
 * `undefined` here — their config is resolved in the data layer
 * (`KpiComparisonData.numberFormatConfig`) alongside their measure-driven color.
 * @internal
 */
export function comparisonMeasureNumberFormatConfig(
  comparison: KpiComparisonInternal | undefined,
): NumberFormatConfig | undefined {
  if (!comparison) {
    return undefined;
  }
  switch (comparison.type) {
    case 'delta':
      return comparison.value.numberFormatConfig;
    case 'target':
      return typeof comparison.target === 'number'
        ? undefined
        : comparison.target.numberFormatConfig;
    default:
      return undefined;
  }
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
 * The sign rides through the locale's `kpi.percentFormat` template as its own placeholder, so a
 * percent-sign-prefix locale renders `+%20` rather than `%+20`.
 * @internal
 */
export function formatPercentDiff(percentDiff: number, t: KpiTranslateFn): string {
  const capped = Math.max(
    -MAX_DISPLAY_PERCENT_DIFF,
    Math.min(MAX_DISPLAY_PERCENT_DIFF, percentDiff),
  );
  return formatPercentText(t, Math.abs(capped).toFixed(2), capped >= 0 ? '+' : '-');
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
  t: KpiTranslateFn,
  numberFormatConfig?: NumberFormatConfig,
): string | null {
  const percentText = isMeaningfulPercentDiff(comparison.deltaPercent)
    ? formatPercentDiff(comparison.deltaPercent, t)
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
 * Reads the comparison's own measure column -- the one queried alongside the headline -- or
 * `undefined` when the comparison has none (`'previous-period'`, or a fixed-number `'target'`).
 *
 * @param comparison - Internal comparison config to read the measure from
 * @returns The comparison's measure column, or `undefined` when it has none
 * @internal
 */
export function comparisonMeasureColumn(
  comparison: KpiComparisonInternal | undefined,
): StyledMeasureColumn | undefined {
  if (!comparison) {
    return undefined;
  }
  switch (comparison.type) {
    case 'delta':
    case 'value':
      return comparison.value;
    case 'target':
      return typeof comparison.target === 'number' ? undefined : comparison.target;
    default:
      return undefined;
  }
}

/**
 * Picks the figure that IS the comparison measure's queried value, as opposed to the figures
 * derived from it (`deltaValue`, `deltaPercent`, `toGo`, ...) which belong to no data option.
 * `'previous-period'`'s `baseline` is deliberately excluded: it's a prior bucket of the headline
 * measure, not a measure of its own, and has no data option to hang an entry off.
 *
 * @param comparison - Public comparison info to read the queried value from
 * @returns The comparison measure's queried value, or `undefined` when it has no measure
 */
function comparisonMeasureValue(comparison: KpiComparisonInfo): number | undefined {
  switch (comparison.type) {
    case 'delta':
      return comparison.baseline;
    case 'target':
      return comparison.target;
    case 'value':
      return comparison.value;
    default:
      return undefined;
  }
}

/**
 * Builds a measure-backed entry, formatted with that measure's own config.
 *
 * @param measure - Measure column the entry describes
 * @param value - Queried value of that measure
 * @returns The data point entry for the measure
 */
function toMeasureEntry(measure: StyledMeasureColumn, value: number): DataPointEntry {
  return {
    ...getDataPointMetadata(measure),
    value,
    displayValue: formatKpiValue(value, measure.numberFormatConfig),
  };
}

/**
 * Builds the click/context-menu payload: the standard `entries` structure, keyed by the
 * `KpiChartDataOptions` field each zone comes from, plus the resolved `comparison` math.
 *
 * Numbers come from the (possibly `onBeforeRender`-adjusted) render options, so entries always
 * describe what the card actually shows. `categoryValue` is the exception -- it's the raw
 * category cell of the bucket the query resolved (`KpiChartData.categoryValue`), since
 * `onBeforeRender` can only restate the period as an epoch, not as the attribute's own value.
 *
 * @param renderOptions - Render options the card was painted from
 * @param dataOptions - Internal KPI data options supplying each entry's column metadata
 * @param categoryValue - Raw category value of the bucket the headline was read from
 * @returns The public data point passed to click/context-menu handlers
 * @internal
 */
export function toKpiDataPoint(
  renderOptions: KpiRenderOptions,
  dataOptions: KpiChartDataOptionsInternal,
  categoryValue?: string | number,
): KpiDataPoint {
  const entries: NonNullable<KpiDataPoint['entries']> = {};

  if (renderOptions.value !== undefined) {
    entries.value = toMeasureEntry(dataOptions.value, renderOptions.value);
  }

  if (dataOptions.category && categoryValue !== undefined) {
    entries.category = {
      ...getDataPointMetadata(dataOptions.category),
      value: categoryValue,
      displayValue: createFormatter(dataOptions.category)(categoryValue),
    };
  }

  // Guarded on the type still matching, same rule as `toComparisonDisplay`: an `onBeforeRender`
  // consumer can swap the comparison's type outright, and the configured measure then describes
  // a different quantity than the one on display -- attaching it would mislabel the entry.
  const comparisonMeasure = comparisonMeasureColumn(dataOptions.comparison);
  const comparisonValue =
    renderOptions.comparison?.type === dataOptions.comparison?.type && renderOptions.comparison
      ? comparisonMeasureValue(renderOptions.comparison)
      : undefined;
  if (comparisonMeasure && comparisonValue !== undefined) {
    entries.comparison = toMeasureEntry(comparisonMeasure, comparisonValue);
  }

  return {
    comparison: renderOptions.comparison,
    entries,
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
 * Consumer overrides for the `'target'` comparison's built-in strings
 * (`KpiComparisonStyleOptions.ofGoalText` / `.toGoText`), already threaded through design
 * options. When set, each replaces its localized `kpi.target.*` template.
 * @internal
 */
export type KpiTargetTextOverrides = {
  ofGoalText?: string;
  toGoText?: string;
};

/**
 * Builds the two display strings of a `'target'` comparison -- the percent-of-goal line (e.g.
 * `'82% of goal'`, absent when the percent isn't computable) and the amount-to-go line (e.g.
 * `'$250K to go'`) -- from the localized `kpi.target.*` templates, or the consumer's per-instance
 * override templates when set. Shared by the visible readout (`kpi-comparison.tsx`) and the aria
 * summary ({@link summarizeComparisonForAria}) so assistive tech always hears exactly the
 * displayed wording.
 * @internal
 */
export function buildTargetReadout(
  comparison: { percentOfTarget?: number; toGo: number; label: string },
  numberFormatConfig: NumberFormatConfig | undefined,
  t: KpiTranslateFn,
  overrides?: KpiTargetTextOverrides,
): { ofGoalText?: string; toGoText: string } {
  // The '{{percent}} of goal' template carries no unit of its own, so the percent sign must be
  // baked into the interpolated value; `{{goal}}` (the target's display label) is offered to
  // templates that want to name the goal.
  const percentText =
    comparison.percentOfTarget !== undefined
      ? formatPercentOfTarget(comparison.percentOfTarget, t)
      : undefined;
  const ofGoalVars = { percent: percentText ?? '', goal: comparison.label };
  const ofGoalText =
    percentText !== undefined
      ? overrides?.ofGoalText !== undefined
        ? interpolateTemplate(overrides.ofGoalText, ofGoalVars)
        : t('kpi.target.ofGoal', ofGoalVars)
      : undefined;

  const toGoVars = { value: formatKpiValue(Math.abs(comparison.toGo), numberFormatConfig) };
  const toGoText =
    overrides?.toGoText !== undefined
      ? interpolateTemplate(overrides.toGoText, toGoVars)
      : t('kpi.target.toGo', toGoVars);

  return { ofGoalText, toGoText };
}

/**
 * Builds the comparison segment of the card's `aria-label`, e.g. `'+20.00% vs prior month'`.
 *
 * For `'target'` comparisons the summary reads the same localized (or consumer-overridden)
 * strings as the visible readout ({@link buildTargetReadout}) and follows the same `display`
 * semantics (see `kpi-comparison.tsx`), so assistive tech never hears content that isn't shown:
 * `'percent'` reads the percent-of-goal line, `'value'` the amount-to-go line, `'both'` reads
 * both; an unavailable percent falls back to the amount-to-go line.
 * @internal
 */
export function summarizeComparisonForAria(
  comparison: KpiComparisonDisplay,
  numberFormatConfig: NumberFormatConfig | undefined,
  t: KpiTranslateFn,
  display: 'percent' | 'value' | 'both' = 'percent',
  targetTextOverrides?: KpiTargetTextOverrides,
): string {
  switch (comparison.type) {
    case PREVIOUS_PERIOD:
    case 'delta': {
      const deltaText = formatDelta(comparison, display, t, numberFormatConfig);
      return comparison.label ? `${deltaText} ${comparison.label}` : deltaText ?? '';
    }
    case 'target': {
      const { ofGoalText, toGoText } = buildTargetReadout(
        comparison,
        numberFormatConfig,
        t,
        targetTextOverrides,
      );
      if (display === 'value' || !ofGoalText) {
        return toGoText;
      }
      return display === 'both' ? `${ofGoalText}, ${toGoText}` : ofGoalText;
    }
    case 'value':
      return `${comparison.label} ${formatKpiValue(
        comparison.value,
        comparison.numberFormatConfig,
      )}`;
  }
}
