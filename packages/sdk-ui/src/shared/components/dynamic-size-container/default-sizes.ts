/**
 * Default body sizes of widgets, without the widget header.
 *
 * A dependency-free leaf, so React-free modules (the widget descriptors) can read the same values
 * the size containers use without importing the chart type utilities.
 */

/** Default size of a pivot table. */
export const DEFAULT_PIVOT_TABLE_SIZE = {
  width: 400,
  height: 500,
} as const;

/** Default size of a chart, and of every widget without a size of its own. */
export const DEFAULT_CHART_SIZE = {
  width: 400,
  height: 400,
} as const;

/** Default size of a table chart. */
export const DEFAULT_TABLE_SIZE = {
  width: 400,
  height: 500,
} as const;

/** Default size of an indicator chart. */
export const DEFAULT_INDICATOR_SIZE = {
  width: 200,
  height: 200,
} as const;
