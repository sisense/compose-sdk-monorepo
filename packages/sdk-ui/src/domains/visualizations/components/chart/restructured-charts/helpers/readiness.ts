import { hasNoResults } from '../../components/regular-chart/has-no-results.js';
import { ChartReadinessState } from '../types.js';

/**
 * Whether the terminal empty overlay is what the chart settles on: no dimensions to
 * query, or a finished query with nothing to visualize. Loading must be finished so an
 * empty → empty refetch still produces a false → true edge.
 * @param state - Current loading and data signals.
 * @returns `true` when the chart settles on an empty state rather than a rendered chart.
 */
function isSettledOnEmptyState({
  chartType,
  isLoading,
  hasNoDimensions,
  chartData,
}: ChartReadinessState): boolean {
  return !isLoading && (hasNoDimensions || (!!chartData && hasNoResults(chartType, chartData)));
}

/**
 * Readiness for renderers that report paint (Highcharts, via
 * `ChartRendererProps.onReady`): ready once the renderer has painted with a finished
 * query, or once the chart settles on the terminal empty overlay instead — where the
 * renderer never mounts and so never paints.
 * @param state - Current loading, paint, and data signals.
 * @returns `true` when the consumer `onReady` callback should fire for this cycle.
 * @internal
 */
export function isRendererReady(state: ChartReadinessState): boolean {
  return (!state.isLoading && state.rendererPainted) || isSettledOnEmptyState(state);
}

/**
 * Readiness for renderers that never report paint (areamap, kpi): ready once the query
 * has finished and there is either chart data to render or a terminal empty state.
 * `rendererPainted` is ignored.
 * @param state - Current loading and data signals.
 * @returns `true` when the consumer `onReady` callback should fire for this cycle.
 * @internal
 */
export function isRendererDataReady(state: ChartReadinessState): boolean {
  if (state.isLoading) {
    return false;
  }
  return isSettledOnEmptyState(state) || !!state.chartData;
}
