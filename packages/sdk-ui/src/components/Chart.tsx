/* eslint-disable max-lines */
/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable promise/catch-or-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable complexity */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable max-lines-per-function */
import { Attribute, Data, DataSource, Filter, isDataSource, Measure } from '@sisense/sdk-data';
import { useEffect, useMemo, useState, type FunctionComponent } from 'react';
import {
  getAttributes,
  getMeasures,
  translateChartDataOptions,
} from '../chart-data-options/translate_data_options';
import { ChartDataOptionsInternal } from '../chart-data-options/types';
import { createDataTableFromData, isDataTableEmpty } from '../chart-data-processor/table_creators';
import { chartDataService } from '../chart-data/chart_data_service';
import { filterAndAggregateChartData } from '../chart-data/filter_and_aggregate_chart_data';
import { ChartData } from '../chart-data/types';
import { translateStyleOptionsToDesignOptions } from '../chart-options-processor/style-to-design-options-translator/translate_style_to_design_options';
import { ChartDesignOptions } from '../chart-options-processor/translations/types';
import { ChartProps } from '../props';
import { executeQuery } from '../query/execute-query';
import { applyDateFormats } from '../query/query_result_date_formatting';
import { ChartDataOptions, ChartType, StyleOptions } from '../types';
import {
  IndicatorCanvas,
  isIndicatorChartData,
  isIndicatorDataOptionsInternal,
  isIndicatorDesignOptions,
} from './IndicatorCanvas';
import { SisenseChart } from './SisenseChart';
import { useSisenseContext } from './SisenseContextProvider';
import merge from 'ts-deepmerge';
import { useThemeContext } from './ThemeProvider';
import {
  applyDefaultChartDataOptions,
  DataColumnNamesMapping,
  generateUniqueDataColumnsNames,
  validateDataOptionsAgainstData,
} from '../chart-data-options/validate_data_options';
import { translateAttributeToCategory, translateMeasureToValue } from '../chart-data-options/utils';
import { translation } from '../locales/en';
import { ErrorBoundary } from './ErrorBoundary/ErrorBoundary';
import { useSetError } from './ErrorBoundary/useSetError';
import { getDefaultStyleOptions } from '../chart-options-processor/chart_options_service';
import { TrackingContextProvider, useTrackComponentInit } from '../useTrackComponentInit';

/**
 * Mixed chart component used for easily switching chart types or rendering multiple series of different types.
 *
 * @example
 * (1) Example of using the `Chart` component to
 * plot a column chart of the Sample ECommerce data source hosted in a Sisense instance:
 * ```tsx
 * <Chart
 *   chartType={'column'}
 *   dataSet={DM.DataSource}
 *   dataOptions={{
 *     category: [DM.Commerce.AgeRange],
 *     value: [measures.sum(DM.Commerce.Revenue)],
 *     breakBy: [DM.Commerce.Gender],
 *   }}
 *   filters={[filters.members(DM.Commerce.Gender,['Female', 'Male'])]}
 *   onDataPointClick= {(point, nativeEvent) => { console.log('clicked', point, nativeEvent); }}
 * />
 * ```
 * ##
 * <img src="media://chart-data-source-example-1.png" width="800px" />
 *
 * (2) Example of using the `Chart` component to
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
 * ##
 * <img src="media://chart-local-data-example-1.png" width="800px" />
 * @param props - Chart properties
 * @returns Chart component representing a chart type as specified in `ChartProps.`{@link ChartProps.chartType}
 */
/* @privateRemarks
 This component is just an UnwrappedChart wrapped in a ErrorBoundary
 Such approach allows to catch errors thrown by the chart and display an error message
 For all the details, please refer to the UnwrappedChart component.
 */
export const Chart: FunctionComponent<ChartProps> = (props) => {
  useTrackComponentInit('Chart', props);

  return (
    <TrackingContextProvider>
      <ErrorBoundary>
        <UnwrappedChart {...props} />
      </ErrorBoundary>
    </TrackingContextProvider>
  );
};

/**
 * Unwrapped in the name means that this component is not wrapped in error boundary
 * ##
 * <img src="media://chart-local-data-example-1.png" width="800px" />
 */
/* @privateRemarks
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
export const UnwrappedChart: FunctionComponent<ChartProps> = (props) => {
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
  );

  const designOptions = useMemo((): ChartDesignOptions | null => {
    if (!chartDataOptions) {
      return null;
    }

    const mergedStyleOptions = merge.withOptions(
      {
        mergeArrays: false,
      },
      getDefaultStyleOptions(),
      styleOptions ?? {},
    ) as StyleOptions;

    return translateStyleOptionsToDesignOptions(chartType, mergedStyleOptions, chartDataOptions);
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

    // TODO: instead of Error Box (from ErrorBoundary), No Results Box should be shown
    if (isDataTableEmpty(dataTable)) {
      throw new Error(translation.errors.chartNoData);
    }

    return chartDataService(chartType, chartDataOptions, dataTable);
    // chartType is omitted from the dependency array because chartDataOptions
    // will always update when a new chartType is selected.
  }, [data, chartDataOptions]);

  if (!chartData || !chartDataOptions || !designOptions) {
    return null;
  }

  if (chartType === 'indicator') {
    if (
      isIndicatorChartData(chartData) &&
      isIndicatorDataOptionsInternal(chartDataOptions) &&
      isIndicatorDesignOptions(designOptions)
    ) {
      return (
        <IndicatorCanvas
          chartData={chartData}
          dataOptions={chartDataOptions}
          designOptions={designOptions}
          themeSettings={themeSettings}
        />
      );
    }

    return null;
  }

  return (
    <SisenseChart
      chartType={chartType}
      chartData={chartData}
      chartDataOptions={chartDataOptions}
      designOptions={designOptions}
      themeSettings={themeSettings}
      onDataPointClick={onDataPointClick}
      onDataPointContextMenu={onDataPointContextMenu}
      onDataPointsSelected={onDataPointsSelected}
      onBeforeRender={onBeforeRender}
    />
  );
};

type DataSet = DataSource | Data | undefined;
const useSyncedData = (
  dataSet: DataSet,
  chartDataOptions: ChartDataOptionsInternal,
  chartType: ChartType,
  attributes: Attribute[],
  measures: Measure[],
  dataColumnNamesMapping: DataColumnNamesMapping,
  filters?: Filter[],
  highlights?: Filter[],
  refreshCounter?: number,
) => {
  const setError = useSetError();

  const [data, setData] = useState<Data>();
  const { isInitialized, app } = useSisenseContext();

  useEffect(() => {
    if (dataSet === undefined || isDataSource(dataSet)) {
      if (!isInitialized) {
        setError(new Error(translation.errors.chartNoSisenseContext));
      }

      if (!app) {
        return;
      }

      executeQuery(dataSet, attributes, measures, filters, highlights, app)
        .then((queryResultData) => {
          const dataWithDateFormatting =
            'breakBy' in chartDataOptions
              ? applyDateFormats(
                  queryResultData,
                  chartDataOptions,
                  app.appConfig.locale,
                  app.appConfig.dateConfig,
                )
              : queryResultData;

          setData(dataWithDateFormatting);
        })
        .catch((asyncError: Error) => {
          // set error state to trigger rerender and throw synchronous error
          setError(asyncError);
        });
    } else {
      // Issues related to queried data such as data access permission, non-existent data source,
      // mismatched or ill-formed attributes/measures should already be caught by JAQL API.
      // The following validates data options against user-provided data.
      validateDataOptionsAgainstData(
        dataSet,
        attributes,
        measures,
        dataColumnNamesMapping,
        filters,
        highlights,
      );

      const dataWithDateFormatting =
        'breakBy' in chartDataOptions
          ? applyDateFormats(
              dataSet,
              chartDataOptions,
              app?.appConfig.locale,
              app?.appConfig.dateConfig,
            )
          : dataSet;

      setData(dataWithDateFormatting);
    }
  }, [chartType, chartDataOptions, dataSet, filters, highlights, app, refreshCounter]);

  return data;
};

const useTranslatedDataOptions = (dataOptions: ChartDataOptions, chartType: ChartType) => {
  return useMemo(() => {
    // translate to internal options and apply default options
    const chartDataOptions = applyDefaultChartDataOptions(
      translateChartDataOptions(chartType, dataOptions),
      chartType,
    );
    const attributes = getAttributes(chartDataOptions, chartType);
    const measures = getMeasures(chartDataOptions, chartType);
    const dataColumnNamesMapping = generateUniqueDataColumnsNames(
      measures.map(translateMeasureToValue),
    );

    return {
      chartDataOptions,
      attributes,
      measures,
      dataColumnNamesMapping,
    };
  }, [dataOptions, chartType]);
};
