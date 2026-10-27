import type { SupportedChartType } from './types.js';

/**
 * Chart types rendered by the restructured-charts architecture: the keys of `chartBuildersMap`.
 *
 * Kept in this leaf module (type-only imports) so that `isRestructuredChartType` can use it
 * without importing `chart-builder-factory`, whose builders transitively import modules that
 * call `isRestructuredChartType` (a runtime import cycle).
 * A type-level test asserts this list matches the keys of `chartBuildersMap`.
 *
 * @internal
 */
export const RESTRUCTURED_CHART_TYPES = [
  'areamap',
  'area',
  'column',
  'bar',
  'line',
  'polar',
  'streamgraph',
  'pie',
  'funnel',
  'treemap',
  'sunburst',
  'calendar-heatmap',
  'sankey',
  'kpi',
] as const satisfies readonly SupportedChartType[];
