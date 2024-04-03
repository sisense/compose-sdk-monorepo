/* eslint-disable max-lines */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable max-lines-per-function */
import { Data, isDataSource } from '@sisense/sdk-data';
import { useMemo, useState } from 'react';
import { createDataTableFromData } from '../chart-data-processor/table-creators';
import { chartDataService } from '../chart-data/chart-data-service';
import { filterAndAggregateChartData } from '../chart-data/filter-and-aggregate-chart-data';
import { ChartData } from '../chart-data/types';
import { ChartDesignOptions } from '../chart-options-processor/translations/types';
import {
  AreamapDataPointEventHandler,
  ChartProps,
  ScattermapDataPointEventHandler,
} from '../props';
import {
  IndicatorCanvas,
  isIndicatorChartData,
  isIndicatorChartDataOptionsInternal,
  isIndicatorDesignOptions,
} from '../indicator-canvas';

import {
  isScattermapChartDesignOptions,
  isScattermapData,
  isScattermapDataOptions,
  Scattermap,
} from '../charts/map-charts/scattermap/scattermap';
import { isString } from 'lodash';
import { SisenseChart, SisenseChartDataPointEventHandler } from '../sisense-chart';
import { useThemeContext } from '../theme-provider';
import { translateAttributeToCategory, translateMeasureToValue } from '../chart-data-options/utils';
import { NoResultsOverlay } from '../no-results-overlay/no-results-overlay';
import { asSisenseComponent } from '../decorators/component-decorators/as-sisense-component';
import { DynamicSizeContainer, getChartDefaultSize } from '../dynamic-size-container';
import { LoadingIndicator } from '../common/components/loading-indicator';
import './chart.css';

import {
  Areamap,
  isAreamapData,
  isAreamapDataOptions,
  isAreamapChartDesignOptions,
} from '../charts/map-charts/areamap/areamap';
import { prepareChartDesignOptions } from '../chart-options-processor/style-to-design-options-translator';
import { LoadingOverlay } from '../common/components/loading-overlay';
import { useSyncedData } from './helpers/use-synced-data';
import { useTranslatedDataOptions } from './helpers/use-translated-data-options';

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
export const shouldSkipSisenseContextWaiting = (props: ChartProps) =>
  isCompleteDataSet(props.dataSet);

/**
 * A React component used for easily switching chart types or rendering multiple series of different chart types.
 *
 * @example
 * (1) An example of using the `Chart` component to
 * plot a column chart of the Sample ECommerce data source hosted in a Sisense instance:
 * ```tsx
 * <Chart
 *   chartType={'column'}
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     category: [DM.Commerce.AgeRange],
 *     value: [measureFactory.sum(DM.Commerce.Revenue)],
 *     breakBy: [DM.Commerce.Gender],
 *   }}
 *   filters={[filterFactory.members(DM.Commerce.Gender,['Female', 'Male'])]}
 *   onDataPointClick= {(point, nativeEvent) => { console.log('clicked', point, nativeEvent); }}
 * />
 * ```
 *
 * <img src="media://chart-data-source-example-1.png" width="800px" />
 *
 * (2) An example of using the `Chart` component to
 * plot a pie chart of static data provided in code:
 * ```tsx
 * <Chart
 *    chartType={'pie'}
 *    dataSet={{
 *      columns: [
 *        { name: 'Years', type: 'date' },
 *        { name: 'Group', type: 'string' },
 *        { name: 'Quantity', type: 'number' },
 *        { name: 'Units', type: 'number' },
 *      ],
 *      rows: [
 *        ['2009', 'A', 6781, 10],
 *        ['2009', 'B', 5500, 15],
 *        ['2010', 'A', 4471, 70],
 *        ['2011', 'B', 1812, 50],
 *        ['2012', 'B', 5001, 60],
 *        ['2013', 'A', 2045, 40],
 *        ['2014', 'B', 3010, 90],
 *        ['2015', 'A', 5447, 80],
 *        ['2016', 'B', 4242, 70],
 *        ['2017', 'B', 936, 20],
 *      ],
 *    }}
 *    dataOptions={{
 *      category: [
 *        {
 *          name: 'Years',
 *          type: 'date',
 *        },
 *      ],
 *      value: [
 *        {
 *          name: 'Quantity',
 *          aggregation: 'sum',
 *          title: 'Total Quantity',
 *        },
 *      ],
 *    }}
 *    styleOptions={{
 *      legend: {
 *        enabled: true,
 *        position: 'bottom',
 *      },
 *    }}
 *  />
 * ```
 *
 * <img src="media://chart-local-data-example-1.png" width="800px" />
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
    dataOptions,
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

  const { chartDataOptions, attributes, measures, dataColumnNamesMapping } =
    useTranslatedDataOptions(dataOptions, chartType);

  const data = useSyncedData(
    dataSet,
    chartDataOptions,
    chartType,
    attributes,
    measures,
    dataColumnNamesMapping,
    filters,
    highlights,
    refreshCounter,
    setIsLoading,
  );

  const chartDesignOptions = useMemo((): ChartDesignOptions | null => {
    if (!chartDataOptions) {
      return null;
    }

    return prepareChartDesignOptions(chartType, chartDataOptions, styleOptions);
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

    return chartDataService(chartType, chartDataOptions, dataTable);
  }, [data, chartType]);

  if (!chartDataOptions || !chartDesignOptions) {
    return null;
  }

  return (
    <DynamicSizeContainer
      defaultSize={defaultSize}
      size={{
        width: styleOptions?.width,
        height: styleOptions?.height,
      }}
      rerenderOnResize={chartType === 'indicator'}
    >
      {() => {
        if (!chartData) {
          return <LoadingIndicator themeSettings={themeSettings} />;
        }
        const hasNoResults =
          ('series' in chartData && chartData.series.length === 0) ||
          ('scatterDataTable' in chartData && chartData.scatterDataTable.length === 0);
        if (hasNoResults) {
          return <NoResultsOverlay iconType={chartType} />;
        }

        if (chartType === 'scattermap') {
          if (
            isScattermapData(chartData) &&
            isScattermapDataOptions(chartDataOptions) &&
            isScattermapChartDesignOptions(chartDesignOptions.globalDesign)
          ) {
            return (
              <LoadingOverlay themeSettings={themeSettings} isVisible={isLoading}>
                <Scattermap
                  chartData={chartData}
                  dataOptions={chartDataOptions}
                  designOptions={chartDesignOptions.globalDesign}
                  dataSource={isString(dataSet) ? dataSet : null}
                  filters={filters}
                  onMarkerClick={onDataPointClick as ScattermapDataPointEventHandler}
                />
              </LoadingOverlay>
            );
          }
          return null;
        }

        if (chartType === 'indicator') {
          if (
            isIndicatorChartData(chartData) &&
            isIndicatorChartDataOptionsInternal(chartDataOptions) &&
            isIndicatorDesignOptions(chartDesignOptions.globalDesign)
          ) {
            return (
              <LoadingOverlay themeSettings={themeSettings} isVisible={isLoading}>
                <IndicatorCanvas
                  chartData={chartData}
                  dataOptions={chartDataOptions}
                  designOptions={chartDesignOptions.globalDesign}
                  themeSettings={themeSettings}
                />
              </LoadingOverlay>
            );
          }

          return null;
        }

        if (chartType === 'areamap') {
          if (
            isAreamapData(chartData) &&
            isAreamapDataOptions(chartDataOptions) &&
            isAreamapChartDesignOptions(chartDesignOptions.globalDesign)
          ) {
            return (
              <LoadingOverlay themeSettings={themeSettings} isVisible={isLoading}>
                <Areamap
                  chartData={chartData}
                  dataOptions={chartDataOptions}
                  designOptions={chartDesignOptions.globalDesign}
                  themeSettings={themeSettings}
                  onDataPointClick={onDataPointClick as AreamapDataPointEventHandler | undefined}
                />
              </LoadingOverlay>
            );
          }
          return null;
        }

        return (
          <LoadingOverlay themeSettings={themeSettings} isVisible={isLoading}>
            <SisenseChart
              chartType={chartType}
              chartData={chartData}
              chartDataOptions={chartDataOptions}
              chartDesignOptions={chartDesignOptions}
              themeSettings={themeSettings}
              onDataPointClick={onDataPointClick as SisenseChartDataPointEventHandler | undefined}
              onDataPointContextMenu={
                onDataPointContextMenu as SisenseChartDataPointEventHandler | undefined
              }
              onDataPointsSelected={onDataPointsSelected}
              onBeforeRender={onBeforeRender}
            />
          </LoadingOverlay>
        );
      }}
    </DynamicSizeContainer>
  );
});

function isCompleteDataSet(dataSet: ChartProps['dataSet']): dataSet is Data {
  return !!dataSet && typeof dataSet !== 'string' && 'rows' in dataSet && 'columns' in dataSet;
}
