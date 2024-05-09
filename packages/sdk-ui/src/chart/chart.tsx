/* eslint-disable react-hooks/exhaustive-deps */
import { isDataSource } from '@sisense/sdk-data';
import { useMemo, useState } from 'react';
import { createDataTableFromData } from '../chart-data-processor/table-creators';
import { chartDataService } from '../chart-data/chart-data-service';
import { filterAndAggregateChartData } from '../chart-data/filter-and-aggregate-chart-data';
import { ChartData } from '../chart-data/types';
import { ChartDesignOptions, DesignOptions } from '../chart-options-processor/translations/types';
import { ChartProps } from '../props';
import { IndicatorCanvas, IndicatorCanvasProps, isIndicatorCanvasProps } from '../indicator-canvas';

import {
  isScattermapProps,
  Scattermap,
  ScattermapProps,
} from '../charts/map-charts/scattermap/scattermap';
import { SisenseChart, SisenseChartProps } from '../sisense-chart';
import { useThemeContext } from '../theme-provider';
import { translateAttributeToCategory, translateMeasureToValue } from '../chart-data-options/utils';
import { NoResultsOverlay } from '../no-results-overlay/no-results-overlay';
import { asSisenseComponent } from '../decorators/component-decorators/as-sisense-component';
import { DynamicSizeContainer, getChartDefaultSize } from '../dynamic-size-container';
import { LoadingIndicator } from '../common/components/loading-indicator';
import './chart.css';

import { Areamap, AreamapProps, isAreamapProps } from '../charts/map-charts/areamap/areamap';
import { prepareChartDesignOptions } from '../chart-options-processor/style-to-design-options-translator';
import { LoadingOverlay } from '../common/components/loading-overlay';
import { useSyncedData } from './helpers/use-synced-data';
import { useTranslatedDataOptions } from './helpers/use-translated-data-options';
import { ChartType } from '@/types';

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

/** Function to check if we should wait for sisense context for rendering the chart */
export const shouldSkipSisenseContextWaiting = (props: ChartProps) => {
  const { dataSet } = props;
  // check if complete dataset
  return !!dataSet && typeof dataSet !== 'string' && 'rows' in dataSet && 'columns' in dataSet;
};

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
 * A React component used for easily switching chart types or rendering multiple series of different chart types.
 *
 * ## Example
 *
 * A chart component displaying total revenue per quarter from the Sample ECommerce data model. The component is currently set to show the data in a column chart.
 *
 * <iframe
 *  src='https://csdk-playground.sisense.com/?example=charts/chart&mode=docs'
 *  width=800
 *  height=870
 *  style='border:none;'
 * />
 *
 * @param props - Chart properties
 * @returns Chart component representing a chart type as specified in `ChartProps.`{@link ChartProps.chartType | chartType}
 * @group Charts
 */
export const Chart = asSisenseComponent({
  componentName: 'Chart',
  shouldSkipSisenseContextWaiting,
  customContextErrorMessageKey: 'errors.chartNoSisenseContext',
})((props: ChartProps) => {
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

  const { dataOptions, attributes, measures, dataColumnNamesMapping } = useTranslatedDataOptions(
    chartDataOptions,
    chartType,
  );

  const data = useSyncedData(
    dataSet,
    dataOptions,
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
    // chartType is omitted from the dependency array because chartDataOptions
    // will always update when a new chartType is selected.
  }, [styleOptions, chartDataOptions]);

  const chartData = useMemo((): ChartData | null => {
    if (!data || !chartDataOptions) {
      return null;
    }

    let dataTable = createDataTableFromData(data);

    if (dataSet && !isDataSource(dataSet)) {
      dataTable = filterAndAggregateChartData(
        dataTable,
        attributes.map(translateAttributeToCategory),
        measures.map(translateMeasureToValue),
        dataColumnNamesMapping,
      );
    }

    return chartDataService(chartType, dataOptions, dataTable);
  }, [data, chartType]);

  const chartProps = useMemo(
    () => ({
      dataSource: isDataSource(dataSet) ? dataSet : null,
      chartType,
      chartData,
      dataOptions,
      designOptions,
      themeSettings,
      onDataPointClick,
      onDataPointContextMenu,
      onDataPointsSelected,
      onBeforeRender,
      filters,
    }),
    [
      chartType,
      chartData,
      dataOptions,
      designOptions,
      themeSettings,
      onDataPointClick,
      onDataPointContextMenu,
      onDataPointsSelected,
      onBeforeRender,
    ],
  );

  if (!dataOptions || !designOptions) {
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

        if (chartType === 'scattermap') {
          if (!isScattermapProps(chartProps as ScattermapProps)) return null;

          return (
            <LoadingOverlay themeSettings={themeSettings} isVisible={isLoading}>
              <Scattermap {...(chartProps as ScattermapProps)} />
            </LoadingOverlay>
          );
        }

        if (chartType === 'indicator') {
          if (isIndicatorCanvasProps(chartProps as IndicatorCanvasProps)) {
            return (
              <LoadingOverlay themeSettings={themeSettings} isVisible={isLoading}>
                <IndicatorCanvas {...(chartProps as IndicatorCanvasProps)} />
              </LoadingOverlay>
            );
          }

          return null;
        }

        if (chartType === 'areamap') {
          if (isAreamapProps(chartProps as AreamapProps)) {
            return (
              <LoadingOverlay themeSettings={themeSettings} isVisible={isLoading}>
                <Areamap {...(chartProps as AreamapProps)} />
              </LoadingOverlay>
            );
          }
          return null;
        }

        return (
          <LoadingOverlay themeSettings={themeSettings} isVisible={isLoading}>
            <SisenseChart {...(chartProps as SisenseChartProps)} />
          </LoadingOverlay>
        );
      }}
    </DynamicSizeContainer>
  );
});
