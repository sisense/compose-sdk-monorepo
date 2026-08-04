import { useCallback, useEffect, useRef } from 'react';

import { ChartData } from '@/domains/visualizations/core/chart-data/types';
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
   * `ChartRendererProps.onReady`, or `undefined` when the chart type has no
   * `ChartBuilder` (non-restructured types do not participate).
   */
  onRendererReady: (() => void) | undefined;
};

/**
 * Fires the consumer `onReady` prop (Fusion `domready` / PDF) on each rising edge of
 * the chart's `ChartBuilder.renderer.isReady` predicate, feeding it the renderer paint
 * signal alongside the loading and data signals.
 *
 * Readiness lives here rather than in the renderer because `onReady` must still fire
 * for the empty / no-results case, where RegularChart shows a terminal overlay and the
 * renderer never mounts.
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
  const readinessCheck = isRestructuredChartType(chartType)
    ? getChartBuilder(chartType).renderer.isReady
    : undefined;

  const rendererPaintedRef = useRef(false);
  const wasReadyRef = useRef(false);
  // Latest consumer callback, so re-creating it between renders never refires.
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const fireIfReady = useCallback(() => {
    if (!readinessCheck) {
      rendererPaintedRef.current = false;
      wasReadyRef.current = false;
      return;
    }

    const isReady = readinessCheck({
      chartType,
      isLoading,
      rendererPainted: rendererPaintedRef.current,
      hasNoDimensions,
      chartData,
    });

    if (isReady && !wasReadyRef.current) {
      onReadyRef.current?.();
    }
    wasReadyRef.current = isReady;
  }, [readinessCheck, chartType, isLoading, hasNoDimensions, chartData]);

  // `onRendererReady` reaches Highcharts inside the chart options, where a new identity
  // would rebuild them and force an extra `chart.update()`. Keep it stable and read the
  // current evaluator through a ref.
  const fireIfReadyRef = useRef(fireIfReady);
  fireIfReadyRef.current = fireIfReady;

  const onRendererReady = useCallback(() => {
    rendererPaintedRef.current = true;
    fireIfReadyRef.current();
  }, []);

  useEffect(() => {
    // A new query invalidates the previous paint, so an empty → empty refetch still
    // produces a false → true edge.
    if (isLoading) {
      rendererPaintedRef.current = false;
    }
    // Covers readiness reached without a paint at all (terminal empty state) and
    // re-checks after each loading / data change.
    fireIfReady();
  }, [fireIfReady, isLoading]);

  return { onRendererReady: readinessCheck ? onRendererReady : undefined };
}
