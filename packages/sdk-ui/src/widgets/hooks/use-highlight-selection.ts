import { useCallback, useMemo, useState } from 'react';

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

  const isSelectionAllowed = useMemo(() => {
    const isSupportedChart =
      (isCartesian(chartType) &&
        (dataOptions as CartesianChartDataOptions).category?.length === 1) ||
      isScatter(chartType);
    return enabled && isSupportedChart;
  }, [enabled, chartType, dataOptions]);

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
      if (isSelectionAllowed) {
        options = applyPointSelections(options as HighchartsOptionsInternal) as HighchartsOptions;
        options = setOnClickOutside(options);
      }
      return options;
    },
    [applyPointSelections, setOnClickOutside, isSelectionAllowed],
  );

  const onDataPointsSelected = useCallback(
    (dataPoints: ChartDataPoints): void => {
      if (isSelectionAllowed) {
        setSelectedDataPoints(dataPoints);
      }
    },
    [isSelectionAllowed],
  );

  const onDataPointClick = useCallback(
    (dataPoint: ChartDataPoint) => {
      if (isSelectionAllowed) {
        setSelectedDataPoints([dataPoint] as ChartDataPoints);
      }
    },
    [isSelectionAllowed],
  );

  return {
    onBeforeRender,
    onDataPointsSelected,
    onDataPointClick,
  };
}
