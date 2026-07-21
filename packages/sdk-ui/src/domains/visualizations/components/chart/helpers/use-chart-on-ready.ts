import { useCallback, useEffect, useState } from 'react';

import { ChartData } from '@/domains/visualizations/core/chart-data/types';
import { useFireOnReady } from '@/domains/widgets/hooks/use-fire-on-ready';
import { ChartType } from '@/types';

import { getChartBuilder } from '../restructured-charts/chart-builder-factory.js';
import { isRestructuredChartType } from '../restructured-charts/utils.js';

type UseChartOnReadyInput = {
  chartType: ChartType;
  /** Whether a query / data sync is in progress. */
  isLoading: boolean;
  /** Whether data options have no attributes or measures. */
  hasNoDimensions: boolean;
  /** Prepared chart data, or `null` while unavailable. */
  chartData: ChartData | null;
  /** Consumer `onReady` callback to fire on each rising edge of readiness. */
  onReady?: () => void;
};

type UseChartOnReadyResult = {
  /**
   * Paint signal handler to forward to the renderer via
   * `ChartRendererProps.onReady`, or `undefined` when the chart type does not
   * participate in the `onReady` contract.
   */
  onRendererReady: (() => void) | undefined;
};

/**
 * Wires the shared chart `onReady` (Fusion `domready` / PDF) readiness contract.
 *
 * Chart types opt in by declaring `onReady` on their `ChartBuilder`; this
 * hook tracks the renderer paint flag, feeds it into the builder's readiness
 * predicate together with the loading / data signals, and fires the consumer
 * `onReady` callback via {@link useFireOnReady} on each rising edge. Chart types
 * without the contract get a no-op (`onRendererReady` is `undefined`).
 *
 * Readiness lives here rather than inside the renderer because `onReady` must
 * still fire in the empty / no-results case, where RegularChart shows a terminal
 * overlay and the renderer never mounts.
 *
 * @internal
 */
export function useChartOnReady({
  chartType,
  isLoading,
  hasNoDimensions,
  chartData,
  onReady,
}: UseChartOnReadyInput): UseChartOnReadyResult {
  const readiness = isRestructuredChartType(chartType)
    ? getChartBuilder(chartType).onReady
    : undefined;

  const [rendererPainted, setRendererPainted] = useState(false);

  useEffect(() => {
    if (readiness && isLoading) {
      setRendererPainted(false);
    }
  }, [readiness, isLoading]);

  const onRendererReady = useCallback(() => {
    setRendererPainted(true);
  }, []);

  const isReady = readiness
    ? readiness.isReadyForOnReady({ isLoading, rendererPainted, hasNoDimensions, chartData })
    : false;

  useFireOnReady(isReady, readiness ? onReady : undefined);

  return { onRendererReady: readiness ? onRendererReady : undefined };
}
