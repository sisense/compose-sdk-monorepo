import { useCallback, useMemo } from 'react';

import { Data } from '@sisense/sdk-data';
import isArray from 'lodash-es/isArray';

import {
  DynamicSizeContainer,
  getChartDefaultSize,
} from '@/shared/components/dynamic-size-container';
import { ContainerSize } from '@/shared/components/dynamic-size-container/dynamic-size-container';
import { NoResultsOverlay } from '@/shared/components/no-results-overlay/no-results-overlay';
import { ChartType } from '@/types';

import { RegularChartProps } from '../../../../../../props';
import { LoadingOverlay } from '../../../../../../shared/components/loading-overlay';
import { prepareChartDesignOptions } from '../../../../core/chart-options-processor/style-to-design-options-translator';
import {
  ChartDesignOptions,
  DesignOptions,
} from '../../../../core/chart-options-processor/translations/types';
import '../../chart.css';
import { getLoadDataFunction } from '../../helpers/get-load-data-function';
import { useChartDataPreparation } from '../../helpers/use-chart-data-preparation';
import { useChartOnReady } from '../../helpers/use-chart-on-ready';
import { useChartRendererProps } from '../../helpers/use-chart-renderer-props';
import { useSyncedData } from '../../helpers/use-synced-data';
import { useTranslatedDataOptions } from '../../helpers/use-translated-data-options';
import { getChartBuilder } from '../../restructured-charts/chart-builder-factory';
import { hasForecastOrTrend, isRestructuredChartType } from '../../restructured-charts/utils';
import { IndicatorCanvas, isIndicatorCanvasProps } from '../indicator-canvas';
import { isScattermapProps, Scattermap } from '../scattermap/scattermap';
import { isSisenseChartProps, isSisenseChartType, SisenseChart } from '../sisense-chart';
import { hasNoResults } from './has-no-results';

/*
Roughly speaking, there are 10 steps to transform chart props to highcharts options:
  1. Get Attributes and Measures from dataOptions and chartType
  2. Translate dataOptions of type ChartDataOptions to ChartDataOptionsInternal
  3. If a data source is specified, execute the query constructed from
  data source, attributes, measures, filters, highlights. Then apply date formats to the query result data.
  4. Create a Data Table from Data
  5. For user-provided data, filter and aggregate the Data Table
  6. Using chart data service, transform Data Table to Chart Data based on the chart type
  7. Translate StyleOptions to DesignOptions
  8. Using highchartsOptionsService, build highcharts options based on the chart type
  9. Apply event handlers to highcharts options
  10. Apply themeSettings to highcharts options
*/

/** Function to check if chart type is rerendered on resize */
const shouldRerenderOnResize = (chartType: ChartType) => {
  return chartType === 'indicator';
};

/**
 *
 * @param props
 * @returns
 */
export const RegularChart = (props: RegularChartProps) => {
  const {
    chartType,
    dataSet,
    dataOptions: chartDataOptions,
    filters,
    highlights,
    styleOptions,
    refreshCounter,
    onDataPointClick,
    onDataPointContextMenu,
    onDataPointsSelected,
    onBeforeRender,
    onDataReady,
    onReady,
  } = props;
  const { width, height } = styleOptions || {};

  const defaultSize = getChartDefaultSize(chartType);

  const size = useMemo(
    () => ({
      width,
      height,
    }),
    [width, height],
  );

  /** Indicates if the chart is a forecast or trend chart for routing between legacy and restructured charts processing */
  const isForecastOrTrendChart = hasForecastOrTrend(chartDataOptions, chartType);

  const {
    dataOptions: syncDataOptions,
    attributes,
    measures,
    dataColumnNamesMapping,
  } = useTranslatedDataOptions(chartDataOptions, chartType, isForecastOrTrendChart);

  /** Indicates if the provided data options has no dimensions */
  const hasNoDimensions = attributes.length === 0 && measures.length === 0;

  const loadData = useMemo(() => {
    return getLoadDataFunction(chartType, isForecastOrTrendChart);
  }, [chartType, isForecastOrTrendChart]);

  const { data, dataOptions, isLoading } = useSyncedData({
    dataSet,
    chartDataOptions: syncDataOptions,
    chartType,
    attributes,
    measures,
    dataColumnNamesMapping,
    filters,
    highlights,
    refreshCounter,
    enabled: !hasNoDimensions,
    loadData,
  });

  const designOptions = useMemo((): ChartDesignOptions | DesignOptions | null => {
    if (!chartDataOptions || hasNoDimensions) {
      return null;
    }

    return prepareChartDesignOptions(chartType, dataOptions, styleOptions);
  }, [chartDataOptions, chartType, dataOptions, styleOptions, hasNoDimensions]);

  const chartData = useChartDataPreparation({
    dataSet,
    data,
    chartDataOptions: syncDataOptions,
    chartType,
    isForecastOrTrendChart,
    attributes,
    measures,
    dataColumnNamesMapping,
    onDataReady,
  });

  // `onReady` (Fusion `domready` / PDF): chart types opt in via their
  // ChartBuilder's `onReady` contract. This hook forwards the renderer paint
  // signal and fires the consumer callback; non-participating types no-op.
  const { onRendererReady } = useChartOnReady({
    chartType,
    isLoading,
    hasNoDimensions,
    chartData,
    onReady,
  });

  const chartRendererProps = useChartRendererProps({
    dataSet,
    chartType,
    chartData,
    internalDataOptions: dataOptions,
    designOptions,
    onBeforeRender,
    onDataPointClick,
    onDataPointContextMenu,
    onDataPointsSelected,
    onReady: onRendererReady,
    filters,
  });

  const renderChartWithSize = useCallback(
    (size: ContainerSize) => {
      if ((chartData && hasNoResults(chartType, chartData)) || hasNoDimensions) {
        return <NoResultsOverlay iconType={chartType} />;
      }

      if (!chartRendererProps) {
        return null;
      }

      if (!chartData && isLoading) {
        return <LoadingOverlay />;
      }

      // Check if chart should use restructured architecture
      const shouldUseRestructured = isRestructuredChartType(chartType) && !isForecastOrTrendChart;

      if (shouldUseRestructured) {
        const chartBuilder = getChartBuilder(chartType);
        if (chartBuilder.renderer.isCorrectRendererProps(chartRendererProps)) {
          return (
            <LoadingOverlay isVisible={isLoading}>
              <chartBuilder.renderer.ChartRendererComponent {...chartRendererProps} size={size} />
            </LoadingOverlay>
          );
        }
        return null;
      }

      if (chartType === 'scattermap' && isScattermapProps(chartRendererProps)) {
        return (
          <LoadingOverlay isVisible={isLoading}>
            <Scattermap {...chartRendererProps} />
          </LoadingOverlay>
        );
      }

      if (chartType === 'indicator' && isIndicatorCanvasProps(chartRendererProps)) {
        return (
          <LoadingOverlay isVisible={isLoading}>
            <IndicatorCanvas {...chartRendererProps} />
          </LoadingOverlay>
        );
      }

      if (isSisenseChartType(chartType) && isSisenseChartProps(chartRendererProps)) {
        return (
          <LoadingOverlay isVisible={isLoading}>
            <SisenseChart
              {...chartRendererProps}
              designOptions={{
                ...chartRendererProps.designOptions,
              }}
              size={size}
            />
          </LoadingOverlay>
        );
      }

      return null;
    },
    [chartData, isLoading, chartType, hasNoDimensions, isForecastOrTrendChart, chartRendererProps],
  );

  // Allow the container when dimensions are missing even if renderer props are
  // null — `renderChartWithSize` shows No Results for `hasNoDimensions`.
  if (!chartRendererProps && !hasNoDimensions) {
    return null;
  }

  return (
    <DynamicSizeContainer
      defaultSize={defaultSize}
      size={size}
      rerenderOnResize={shouldRerenderOnResize(chartType)}
    >
      {renderChartWithSize}
    </DynamicSizeContainer>
  );
};

/** Type guard for Data */
export function isData(data: any): data is Data {
  return (
    data &&
    typeof data === 'object' &&
    'columns' in data &&
    isArray(data.columns) &&
    'rows' in data &&
    isArray(data.rows)
  );
}
