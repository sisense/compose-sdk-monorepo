import { withResolvedConditionValues } from '@/domains/visualizations/core/chart-data-options/coloring/conditional-coloring.js';
import {
  ColoringService,
  getColoringServiceByColorOptions,
} from '@/domains/visualizations/core/chart-data-options/coloring/index.js';
import { DataColorOptions, StyledColumn, StyledMeasureColumn } from '@/types';

/** Default color applied to a positive comparison metric when no color options are configured. */
const DEFAULT_POSITIVE_COLOR = '#4CAF50';
/** Default color applied to a negative comparison metric when no color options are configured. */
const DEFAULT_NEGATIVE_COLOR = '#E53935';

/**
 * Resolves the display color of a KPI value from the measure's color options
 * (`StyledMeasureColumn.color`) — the same mechanism the indicator chart uses.
 * Static (string/uniform) and conditional options are supported; range coloring
 * needs a comparison population and is not applicable to a single KPI value.
 *
 * Conditions whose threshold is a measure rather than a literal number
 * (`DataColorCondition.valueMeasure`, authored in Fusion as a formula-driven color rule) are
 * resolved against `colorConditionValues`. A condition whose measure is absent from that map
 * is dropped by {@link withResolvedConditionValues} rather than evaluated: its unresolved
 * `expression` is the empty string, which `Number('')` would silently read as a threshold of
 * `0` and color the card against a rule the user never wrote.
 *
 * @param styledMeasureColumn - The measure column carrying the color options
 * @param value - The value being colored
 * @param colorConditionValues - Resolved values of formula-driven color condition measures,
 * keyed by their query column name
 * @returns The resolved color, or `undefined` to leave it to the renderer's default
 */
export function resolveValueColor(
  styledMeasureColumn: StyledMeasureColumn,
  value: number | undefined,
  colorConditionValues?: Record<string, number>,
): string | undefined {
  const colorOptions = styledMeasureColumn.color;
  if (!colorOptions || value === undefined) {
    return undefined;
  }
  const coloringService = getColoringServiceByColorOptions(
    withResolvedConditionValues(colorConditionValues)(colorOptions),
  );
  if (coloringService.type === 'Static') {
    return (coloringService as ColoringService<'Static'>).getColor();
  }
  if (coloringService.type === 'Absolute') {
    return (coloringService as ColoringService<'Absolute'>).getColor(value);
  }
  return undefined;
}

/**
 * Resolves the display color of a KPI series — the sparkline — from its category column's
 * color options (`StyledColumn.color`), the same `format.color` slot a measure's color rides.
 *
 * Only static (string/uniform) options apply. Conditional and range coloring both evaluate a
 * *number*, and a series is a set of them: there is no single value to test a condition
 * against, and nothing to say which point's color should win for the line as a whole.
 * Both resolve to `undefined`, leaving the caller its own default — the same stance
 * {@link resolveValueColor} takes on range options.
 *
 * @param styledColumn - The category column carrying the color options, when one is set
 * @returns The resolved color, or `undefined` to fall back to the caller's default
 */
export function resolveSeriesColor(styledColumn: StyledColumn | undefined): string | undefined {
  const colorOptions = styledColumn?.color;
  if (!colorOptions) {
    return undefined;
  }
  const coloringService = getColoringServiceByColorOptions(colorOptions);
  return coloringService.type === 'Static'
    ? (coloringService as ColoringService<'Static'>).getColor()
    : undefined;
}

/**
 * Resolves the display color of a KPI comparison metric (`deltaPercent`/`percentOfTarget`)
 * against the given color options, reusing the shared data-coloring evaluator
 * (`getColoringServiceByColorOptions`) so conditional/uniform/range options behave
 * identically to how they're evaluated elsewhere (indicator values, pivot table cells).
 *
 * - `metric === undefined` → `undefined` (renderer falls back to the default text color).
 * - `colorOptions` provided → evaluated against `metric` via the shared evaluator.
 * - No `colorOptions` → sign-based default: positive → green, negative → red, zero → undefined.
 * - `'Relative'` (range) options → `undefined`, same as {@link resolveValueColor}: range coloring
 *   is meant to place a value within a population of other values, and a single comparison
 *   metric has no such population to place itself within -- even with an explicit
 *   `minValue`/`maxValue`, there's no other data point for "relative" to mean anything against.
 *   Left unrejected, the previous approach of feeding the interpolator a one-item population
 *   compounds this: with the (common) population-derived min/max, the metric always equals both
 *   bounds, so the interpolator collapses to its fixed midpoint color regardless of the metric's
 *   actual sign or magnitude -- a range-colored comparison that can never visibly vary.
 */
export function resolveComparisonColor(
  colorOptions: DataColorOptions | undefined,
  metric: number | undefined,
): string | undefined {
  if (metric === undefined) {
    return undefined;
  }

  if (!colorOptions) {
    if (metric > 0) {
      return DEFAULT_POSITIVE_COLOR;
    }
    if (metric < 0) {
      return DEFAULT_NEGATIVE_COLOR;
    }
    return undefined;
  }

  // No query measure backs a style-authored comparison color, so a formula-driven condition
  // can never resolve here -- drop it rather than let `Number('')` read it as a threshold of 0.
  const coloringService = getColoringServiceByColorOptions(
    withResolvedConditionValues(undefined)(colorOptions),
  );
  switch (coloringService.type) {
    case 'Static':
      return (coloringService as ColoringService<'Static'>).getColor();
    case 'Absolute':
      return (coloringService as ColoringService<'Absolute'>).getColor(metric);
    case 'Relative':
      // Not applicable to a single comparison metric -- see this function's TSDoc.
      return undefined;
    default:
      return undefined;
  }
}
