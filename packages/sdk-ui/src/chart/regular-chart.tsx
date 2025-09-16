import { Data } from '@sisense/sdk-data';
import { useMemo, useState } from 'react';
import { ChartData } from '../chart-data/types';
import { ChartDesignOptions, DesignOptions } from '../chart-options-processor/translations/types';
import { RegularChartProps } from '../props';
import { IndicatorCanvas, isIndicatorCanvasProps } from '../indicator-canvas';

import {
  isScattermapData,
  isScattermapProps,
  Scattermap,
} from '../charts/map-charts/scattermap/scattermap';
import { useThemeContext } from '../theme-provider';
import { NoResultsOverlay } from '../no-results-overlay/no-results-overlay';
import { DynamicSizeContainer, getChartDefaultSize } from '../dynamic-size-container';
import { LoadingIndicator } from '../common/components/loading-indicator';
import './chart.css';

import { isAreamapData } from './restructured-charts/areamap-chart/renderer/areamap';
import { prepareChartDesignOptions } from '../chart-options-processor/style-to-design-options-translator';
import { LoadingOverlay } from '../common/components/loading-overlay';
import { useSyncedData } from './helpers/use-synced-data';
import { useTranslatedDataOptions } from './helpers/use-translated-data-options';
import { ChartType } from '@/types';
import { useChartRendererProps } from './helpers/use-chart-renderer-props';
import { isBoxplotChartData } from '@/chart-data/boxplot-data';
import isArray from 'lodash-es/isArray';
import { getLoadDataFunction } from './helpers/get-load-data-function';
import { useChartDataPreparation } from './helpers/use-chart-data-preparation';
import { isRestructuredChartType, hasForecastOrTrend } from './restructured-charts/utils';
import { getChartBuilder } from './restructured-charts/chart-builder-factory';
import { isSisenseChartProps, isSisenseChartType, SisenseChart } from '../sisense-chart';
import { isCalendarHeatmapChartData } from './restructured-charts/highchart-based-charts/calendar-heatmap-chart/data';

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

/** Functoin to check if chart type has results */
const hasNoResults = (chartType: ChartType, chartData: ChartData) => {
  if (chartType === 'scatter' && 'scatterDataTable' in chartData) {
    return chartData.scatterDataTable.length === 0;
  }
  if (chartType === 'areamap' && isAreamapData(chartData)) {
    return chartData.geoData.length === 0;
  }
  if (chartType === 'scattermap' && isScattermapData(chartData)) {
    return chartData.locations.length === 0;
  }
  if (chartType === 'boxplot' && isBoxplotChartData(chartData)) {
    return chartData.xValues.length === 0;
  }
  if (chartType === 'calendar-heatmap' && isCalendarHeatmapChartData(chartData)) {
    return chartData.values.length === 0;
  }
  return 'series' in chartData && chartData.series.length === 0;
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
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const defaultSize = getChartDefaultSize(chartType);
  const { themeSettings } = useThemeContext();

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
  const [data, dataOptions] = useSyncedData({
    dataSet,
    chartDataOptions: syncDataOptions,
    chartType,
    attributes,
    measures,
    dataColumnNamesMapping,
    filters,
    highlights,
    refreshCounter,
    setIsLoading,
    enabled: !hasNoDimensions,
    loadData,
  });

  const designOptions = useMemo((): ChartDesignOptions | DesignOptions | null => {
    if (!chartDataOptions) {
      return null;
    }

    return prepareChartDesignOptions(chartType, dataOptions, styleOptions);
  }, [chartDataOptions, chartType, dataOptions, styleOptions]);

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
    filters,
  });

  if (!chartRendererProps) {
    return null;
  }

  return (
    <DynamicSizeContainer
      defaultSize={defaultSize}
      size={{
        width: styleOptions?.width,
        height: styleOptions?.height,
      }}
      rerenderOnResize={shouldRerenderOnResize(chartType)}
    >
      {(size) => {
        if (!chartData && isLoading) {
          return <LoadingIndicator themeSettings={themeSettings} />;
        }
        if ((chartData && hasNoResults(chartType, chartData)) || hasNoDimensions) {
          return <NoResultsOverlay iconType={chartType} />;
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
      }}
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
