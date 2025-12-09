import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { HighchartsOptionsInternal } from '@/chart-options-processor/chart-options-service';
import { isCartesian, isScatter } from '@/chart-options-processor/translations/types';

import {
  CartesianChartDataOptions,
  ChartDataOptions,
  ChartDataPoint,
  ChartDataPoints,
  ChartType,
  DataPoint,
  HighchartsOptions,
  ScatterDataPoint,
} from '../..';

/**
 * Checks if selection is allowed for the given chart type and data options.
 * @param chartType - The type of the chart.
 * @param dataOptions - The data options for the chart.
 * @param enabled - Whether selection is enabled.
 * @returns Whether selection is allowed.
 */
const isSelectionAllowedForChart = (
  chartType: ChartType,
  dataOptions: ChartDataOptions,
): boolean => {
  return (
    (isCartesian(chartType) && (dataOptions as CartesianChartDataOptions).category?.length === 1) ||
    isScatter(chartType)
  );
};

export function useHighlightSelection({
  chartType,
  dataOptions,
  enabled,
}: {
  chartType: ChartType;
  dataOptions: ChartDataOptions;
  enabled: boolean;
}) {
  const [selectedDataPoints, setSelectedDataPoints] = useState<ChartDataPoints>([]);
  // Use a ref to avoid handlers updating (chart re-rendering) when the enabled flag changes
  const isSelectionAllowedRef = useRef<boolean>(
    enabled && isSelectionAllowedForChart(chartType, dataOptions),
  );

  useEffect(() => {
    isSelectionAllowedRef.current = enabled && isSelectionAllowedForChart(chartType, dataOptions);
  }, [chartType, dataOptions, enabled]);

  const applyPointSelections = useMemo(() => {
    if (selectedDataPoints.length === 0) {
      return (options: HighchartsOptionsInternal) =>
        ({
          ...options,
          series: options.series.map((s) => ({
            ...s,
            data: s.data.map((d) => ({ ...d, selected: false })),
          })),
        } as HighchartsOptions);
    }
    if (isScatter(chartType)) {
      return (options: HighchartsOptionsInternal) =>
        ({
          ...options,
          series: options.series.map((s) => ({
            ...s,
            data: s.data.map((d) => {
              return {
                ...d,
                selected: !(selectedDataPoints as ScatterDataPoint[]).some(
                  (point) =>
                    point.x === d.x &&
                    point.y === d.y &&
                    point.size === d.z &&
                    point.breakByPoint === d.custom?.maskedBreakByPoint &&
                    point.breakByColor === d.custom?.maskedBreakByColor,
                ),
              };
            }),
          })),
        } as HighchartsOptions);
    } else {
      const categoryValueMap = (selectedDataPoints as DataPoint[]).reduce(
        (accu, { categoryValue }) => {
          if (categoryValue) {
            accu[`${categoryValue}`] = true;
          }
          return accu;
        },
        {},
      );

      return (options: HighchartsOptionsInternal) => ({
        ...options,
        series: options.series.map((s) => ({
          ...s,
          data: s.data.map((d) =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            categoryValueMap[d.custom?.xValue?.[0]] ? d : { ...d, selected: true },
          ),
        })),
      });
    }
  }, [selectedDataPoints, chartType]);

  const setOnClickOutside = useMemo(
    () => (options: HighchartsOptions) =>
      ({
        ...options,
        chart: {
          ...options.chart,
          events: {
            ...options.chart?.events,
            click: () => {
              setSelectedDataPoints([]);
            },
          },
        },
      } as HighchartsOptions),
    [],
  );

  const onBeforeRender = useCallback(
    (options: HighchartsOptions) => {
      if (isSelectionAllowedRef.current) {
        options = applyPointSelections(options as HighchartsOptionsInternal) as HighchartsOptions;
        options = setOnClickOutside(options);
      }
      return options;
    },
    [applyPointSelections, setOnClickOutside],
  );

  const onDataPointsSelected = useCallback((dataPoints: ChartDataPoints): void => {
    if (isSelectionAllowedRef.current) {
      setSelectedDataPoints(dataPoints);
    }
  }, []);

  const onDataPointClick = useCallback((dataPoint: ChartDataPoint) => {
    if (isSelectionAllowedRef.current) {
      setSelectedDataPoints([dataPoint] as ChartDataPoints);
    }
  }, []);

  return {
    onBeforeRender,
    onDataPointsSelected,
    onDataPointClick,
  };
}
