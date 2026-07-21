import { ChartOnReadyStateInput } from '../../../types.js';
import { isSankeyChartData } from '../types.js';

/**
 * Rising-edge readiness for Sankey `onReady` (Fusion `domready` / PDF).
 *
 * Implements the `ChartBuilder.onReady` contract for Sankey — other
 * Fusion widgets fire `domready` from their native Prism renderers, not via
 * Compose SDK `Chart`, so they omit the contract.
 *
 * - Ready after Highcharts paint when not loading
 * - Empty / no-dimensions: ready when the terminal overlay is shown **and**
 *   loading has finished (so empty→empty refetch still gets a false→true edge)
 *
 * @param state - Current loading, paint, and data signals.
 * @returns `true` when the consumer `onReady` callback should fire for this cycle.
 * @internal
 */
export function isSankeyReadyForOnReady({
  isLoading,
  rendererPainted,
  hasNoDimensions,
  chartData,
}: ChartOnReadyStateInput): boolean {
  const isTerminalEmptyState =
    !isLoading &&
    (hasNoDimensions ||
      (!!chartData && isSankeyChartData(chartData) && chartData.links.length === 0));

  return (!isLoading && rendererPainted) || isTerminalEmptyState;
}
