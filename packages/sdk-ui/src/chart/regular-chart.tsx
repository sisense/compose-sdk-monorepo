/* eslint-disable react-hooks/exhaustive-deps */
import { isDataSource } from '@sisense/sdk-data';
import { useMemo, useState } from 'react';
import { createDataTableFromData } from '../chart-data-processor/table-creators';
import { chartDataService } from '../chart-data/chart-data-service';
import { filterAndAggregateChartData } from '../chart-data/filter-and-aggregate-chart-data';
import { ChartData } from '../chart-data/types';
import { ChartDesignOptions, DesignOptions } from '../chart-options-processor/translations/types';
import { RegularChartProps } from '../props';
import { IndicatorCanvas, isIndicatorCanvasProps } from '../indicator-canvas';

import { isScattermapProps, Scattermap } from '../charts/map-charts/scattermap/scattermap';
import { isSisenseChartProps, isSisenseChartType, SisenseChart } from '../sisense-chart';
import { useThemeContext } from '../theme-provider';
import { translateAttributeToCategory, translateMeasureToValue } from '../chart-data-options/utils';
import { NoResultsOverlay } from '../no-results-overlay/no-results-overlay';
import { DynamicSizeContainer, getChartDefaultSize } from '../dynamic-size-container';
import { LoadingIndicator } from '../common/components/loading-indicator';
import './chart.css';

import { Areamap, isAreamapProps } from '../charts/map-charts/areamap/areamap';
import { prepareChartDesignOptions } from '../chart-options-processor/style-to-design-options-translator';
import { LoadingOverlay } from '../common/components/loading-overlay';
import { useSyncedData } from './helpers/use-synced-data';
import { useTranslatedDataOptions } from './helpers/use-translated-data-options';
import { ChartType } from '@/types';
import { useChartRendererProps } from './helpers/use-chart-renderer-props';

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
  if (
    chartType === 'scattermap' &&
    'scatterDataTable' in chartData &&
    chartData.scatterDataTable.length === 0
  ) {
    return true;
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
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const defaultSize = getChartDefaultSize(chartType);
  const { themeSettings } = useThemeContext();

  const {
    dataOptions: syncDataOptions,
    attributes,
    measures,
    dataColumnNamesMapping,
  } = useTranslatedDataOptions(chartDataOptions, chartType);

  const [data, dataOptions] = useSyncedData(
    dataSet,
    syncDataOptions,
    chartType,
    attributes,
    measures,
    dataColumnNamesMapping,
    filters,
    highlights,
    refreshCounter,
    setIsLoading,
  );

  const designOptions = useMemo((): ChartDesignOptions | DesignOptions | null => {
    if (!chartDataOptions) {
      return null;
    }

    return prepareChartDesignOptions(chartType, dataOptions, styleOptions);
  }, [chartDataOptions, chartType, dataOptions, styleOptions]);

  const chartData = useMemo((): ChartData | null => {
    if (!data || !chartDataOptions) {
      return null;
    }

    let dataTable = createDataTableFromData(data);

    if (!isDataSource(dataSet)) {
      dataTable = filterAndAggregateChartData(
        dataTable,
        attributes.map(translateAttributeToCategory),
        measures.map(translateMeasureToValue),
        dataColumnNamesMapping,
      );
    }

    return chartDataService(chartType, dataOptions, dataTable);
  }, [data, chartType]);

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
      {() => {
        if (!chartData) {
          return <LoadingIndicator themeSettings={themeSettings} />;
        }
        if (hasNoResults(chartType, chartData)) {
          return <NoResultsOverlay iconType={chartType} />;
        }

        if (chartType === 'scattermap' && isScattermapProps(chartRendererProps)) {
          return (
            <LoadingOverlay themeSettings={themeSettings} isVisible={isLoading}>
              <Scattermap {...chartRendererProps} />
            </LoadingOverlay>
          );
        }

        if (chartType === 'indicator' && isIndicatorCanvasProps(chartRendererProps)) {
          return (
            <LoadingOverlay themeSettings={themeSettings} isVisible={isLoading}>
              <IndicatorCanvas {...chartRendererProps} />
            </LoadingOverlay>
          );
        }

        if (chartType === 'areamap' && isAreamapProps(chartRendererProps)) {
          return (
            <LoadingOverlay themeSettings={themeSettings} isVisible={isLoading}>
              <Areamap {...chartRendererProps} />
            </LoadingOverlay>
          );
        }

        if (isSisenseChartType(chartType) && isSisenseChartProps(chartRendererProps)) {
          return (
            <LoadingOverlay themeSettings={themeSettings} isVisible={isLoading}>
              <SisenseChart
                {...chartRendererProps}
                designOptions={{
                  ...chartRendererProps.designOptions,
                }}
              />
            </LoadingOverlay>
          );
        }

        return null;
      }}
    </DynamicSizeContainer>
  );
};
