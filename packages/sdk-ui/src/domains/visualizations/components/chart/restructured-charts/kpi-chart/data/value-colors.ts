import {
  ColoringService,
  getColoringServiceByColorOptions,
} from '@/domains/visualizations/core/chart-data-options/coloring/index.js';
import { DataColorOptions, StyledMeasureColumn } from '@/types';

/** Default color applied to a positive comparison metric when no color options are configured. */
const DEFAULT_POSITIVE_COLOR = '#4CAF50';
/** Default color applied to a negative comparison metric when no color options are configured. */
const DEFAULT_NEGATIVE_COLOR = '#E53935';

/**
 * Resolves the display color of a KPI value from the measure's color options
 * (`StyledMeasureColumn.color`) — the same mechanism the indicator chart uses.
 * Static (string/uniform) and conditional options are supported; range coloring
 * needs a comparison population and is not applicable to a single KPI value.
 */
export function resolveValueColor(
  styledMeasureColumn: StyledMeasureColumn,
  value: number | undefined,
): string | undefined {
  const colorOptions = styledMeasureColumn.color;
  if (!colorOptions || value === undefined) {
    return undefined;
  }
  const coloringService = getColoringServiceByColorOptions(colorOptions);
  if (coloringService.type === 'Static') {
    return (coloringService as ColoringService<'Static'>).getColor();
  }
  if (coloringService.type === 'Absolute') {
    return (coloringService as ColoringService<'Absolute'>).getColor(value);
  }
  return undefined;
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

  const coloringService = getColoringServiceByColorOptions(colorOptions);
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
