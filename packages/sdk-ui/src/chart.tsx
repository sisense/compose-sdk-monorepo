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
import { useEffect, useMemo, useState } from 'react';
import {
  getAttributes,
  getMeasures,
  translateChartDataOptions,
} from './chart-data-options/translate-data-options';
import { ChartDataOptionsInternal } from './chart-data-options/types';
import { createDataTableFromData } from './chart-data-processor/table-creators';
import { chartDataService } from './chart-data/chart-data-service';
import { filterAndAggregateChartData } from './chart-data/filter-and-aggregate-chart-data';
import { ChartData } from './chart-data/types';
import { translateStyleOptionsToDesignOptions } from './chart-options-processor/style-to-design-options-translator/translate-style-to-design-options';
import { ChartDesignOptions } from './chart-options-processor/translations/types';
import { ChartProps } from './props';
import { executeQuery } from './query/execute-query';
import { applyDateFormats } from './query/query-result-date-formatting';
import { ChartDataOptions, ChartType, StyleOptions } from './types';
import {
  IndicatorCanvas,
  isIndicatorChartData,
  isIndicatorDataOptionsInternal,
  isIndicatorDesignOptions,
} from './indicator-canvas';
import { SisenseChart } from './sisense-chart';
import { useSisenseContext } from './sisense-context/sisense-context';
import merge from 'ts-deepmerge';
import { useThemeContext } from './theme-provider';
import {
  applyDefaultChartDataOptions,
  DataColumnNamesMapping,
  generateUniqueDataColumnsNames,
  validateDataOptions,
  validateDataOptionsAgainstData,
} from './chart-data-options/validate-data-options';
import { translateAttributeToCategory, translateMeasureToValue } from './chart-data-options/utils';
import { useSetError } from './error-boundary/use-set-error';
import { getDefaultStyleOptions } from './chart-options-processor/chart-options-service';
import { NoResultsOverlay } from './no-results-overlay/no-results-overlay';
import { asSisenseComponent } from './decorators/as-sisense-component';
import { DynamicSizeContainer, getChartDefaultSize } from './dynamic-size-container';

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
 *     value: [measures.sum(DM.Commerce.Revenue)],
 *     breakBy: [DM.Commerce.Gender],
 *   }}
 *   filters={[filters.members(DM.Commerce.Gender,['Female', 'Male'])]}
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

    return chartDataService(chartType, chartDataOptions, dataTable);
    // chartType is omitted from the dependency array because chartDataOptions
    // will always update when a new chartType is selected.
  }, [data, chartDataOptions]);

  if (!chartData || !chartDataOptions || !designOptions) {
    return null;
  }

  return (
    <DynamicSizeContainer
      defaultSize={defaultSize}
      size={{
        width: styleOptions?.width,
        height: styleOptions?.height,
      }}
    >
      {() => {
        const hasNoResults = 'series' in chartData && chartData.series.length === 0;
        if (hasNoResults) {
          return <NoResultsOverlay iconType={chartType} />;
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
      }}
    </DynamicSizeContainer>
  );
});

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
  const { app } = useSisenseContext();

  useEffect(() => {
    let ignore = false;

    if (dataSet === undefined || isDataSource(dataSet)) {
      executeQuery(
        { dataSource: dataSet, dimensions: attributes, measures, filters, highlights },
        app!,
      )
        .then((queryResultData) => {
          const dataWithDateFormatting =
            'breakBy' in chartDataOptions
              ? applyDateFormats(
                  queryResultData,
                  chartDataOptions,
                  app?.settings.locale,
                  app?.settings.dateConfig,
                )
              : queryResultData;

          if (!ignore) {
            setData(dataWithDateFormatting);
          }
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
              app?.settings.locale,
              app?.settings.dateConfig,
            )
          : dataSet;

      setData(dataWithDateFormatting);
    }

    // Set up cleanup function to ignore async fetch results of previous render
    // when the Effect is firing twice in Strict Mode
    // Reference: https://react.dev/learn/synchronizing-with-effects#fetching-data
    return () => {
      ignore = true;
    };
  }, [chartType, chartDataOptions, dataSet, filters, highlights, app, refreshCounter]);

  return data;
};

const useTranslatedDataOptions = (dataOptions: ChartDataOptions, chartType: ChartType) => {
  return useMemo(() => {
    const validatedDataOptions = validateDataOptions(chartType, dataOptions);

    // translate to internal options and apply default options
    const chartDataOptions = applyDefaultChartDataOptions(
      translateChartDataOptions(chartType, validatedDataOptions),
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

function isCompleteDataSet(dataSet: ChartProps['dataSet']): dataSet is Data {
  return !!dataSet && typeof dataSet !== 'string' && 'rows' in dataSet && 'columns' in dataSet;
}
