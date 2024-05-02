import { Attribute, Measure, Filter, QueryResultData, DataSource } from '@sisense/sdk-data';
import isNull from 'lodash/isNull';
import { ClientApplication } from './app/client-application.js';
import { executeQuery as executeQueryFunction } from './query/execute-query.js';
import {
  BoxplotChartCustomDataOptions,
  BoxplotChartDataOptionsInternal,
  Category,
  Value,
} from './chart-data-options/types.js';
import { translateBoxplotDataOptions } from './chart-data-options/translate-boxplot-data-options.js';

const OUTLIERS_LIMIT = 20000;

function getDataColumnIndex(
  dataColumns: QueryResultData['columns'],
  dataOption?: Value | Category,
) {
  if (dataOption) {
    const targetColumnName = dataOption.name;
    const index = dataColumns.findIndex((column) => column.name === targetColumnName);

    return index === -1 ? null : index;
  }
  return null;
}

/**
 * Processes box whisker data and outliers data to combine them into a single data set.
 *
 * @param {QueryResultData} boxWhiskerData - The data for the box whisker.
 * @param {QueryResultData} outliersData - The data for the outliers.
 * @param {BoxplotChartDataOptionsInternal} [dataOptions] - Optional data options for customizing data processing.
 * @returns {QueryResultData} The combined data with outliers included in the box whisker plot.
 */
export const boxWhiskerProcessResultInternal = (
  boxWhiskerData: QueryResultData,
  outliersData: QueryResultData,
  dataOptions?: BoxplotChartDataOptionsInternal,
): QueryResultData => {
  let boxCategoryColumnIndex: number | null = 0;
  let boxWhiskerMinColumnIndex: number | null = 4;
  let boxWhiskerMaxColumnIndex: number | null = 5;
  let outliersCategoryColumnIndex: number | null = 0;
  let outliersValueColumnIndex: number | null = 1;

  if (dataOptions) {
    boxCategoryColumnIndex = getDataColumnIndex(boxWhiskerData.columns, dataOptions.category);
    boxWhiskerMinColumnIndex = getDataColumnIndex(boxWhiskerData.columns, dataOptions.whiskerMin);
    boxWhiskerMaxColumnIndex = getDataColumnIndex(boxWhiskerData.columns, dataOptions.whiskerMax);
    outliersCategoryColumnIndex = getDataColumnIndex(outliersData.columns, dataOptions.category);
    outliersValueColumnIndex = getDataColumnIndex(outliersData.columns, dataOptions.outliers);
  }

  if (isNull(outliersValueColumnIndex)) {
    return boxWhiskerData;
  }

  const combinedData: QueryResultData = {
    columns: [...boxWhiskerData.columns, outliersData.columns[outliersValueColumnIndex]],
    rows: boxWhiskerData.rows.map((row) => {
      const boxCategory = isNull(boxCategoryColumnIndex) ? null : row[boxCategoryColumnIndex].data;
      const whiskerMax = row[boxWhiskerMaxColumnIndex!].data;
      const whiskerMin = row[boxWhiskerMinColumnIndex!].data;
      const outliersCombinedString = outliersData.rows
        .filter((outliersRow) => {
          const outlierCategory = isNull(outliersCategoryColumnIndex)
            ? null
            : outliersRow[outliersCategoryColumnIndex].data;
          const outlierValue = outliersRow[outliersValueColumnIndex!].data;
          return (
            outlierCategory === boxCategory &&
            // manually removes points located between the whiskers, due to the back-end issue that returns incorrect points
            (outlierValue < whiskerMin || outlierValue > whiskerMax)
          );
        })
        .map((outliersRow) => outliersRow[outliersValueColumnIndex!].data)
        .join(',');
      return [
        ...row,
        {
          data: outliersCombinedString,
        },
      ];
    }),
  };

  return combinedData;
};

/**
 * Processes box whisker data and outliers data to combine them into a single data set.
 *
 * @param {QueryResultData} boxWhiskerData - The data for the box whisker.
 * @param {QueryResultData} outliersData - The data for the outliers.
 * @param {BoxplotChartCustomDataOptions} [dataOptions] - Optional data options for customizing data processing.
 * @returns {QueryResultData} The combined data with outliers included in the box whisker plot.
 * @group Chart Utilities
 */
export function boxWhiskerProcessResult(
  boxWhiskerData: QueryResultData,
  outliersData: QueryResultData,
  dataOptions?: BoxplotChartCustomDataOptions,
) {
  const dataOptionsInternal = dataOptions && translateBoxplotDataOptions(dataOptions);
  return boxWhiskerProcessResultInternal(boxWhiskerData, outliersData, dataOptionsInternal);
}

export const executeBoxplotQuery = async (
  {
    app,
    chartDataOptions,
    dataSource,
    attributes,
    measures,
    filters,
    highlights,
  }: {
    app: ClientApplication;
    chartDataOptions: BoxplotChartDataOptionsInternal;
    dataSource?: DataSource;
    attributes: Attribute[];
    measures: Measure[];
    filters?: Filter[];
    highlights?: Filter[];
  },
  executeQuery: typeof executeQueryFunction,
) => {
  const mainQuery = {
    dataSource,
    dimensions: chartDataOptions.category ? [attributes[0]] : [],
    measures,
    filters,
    highlights,
  };

  const mainQueryResultData = await executeQuery(mainQuery, app);
  let queryResultData = mainQueryResultData;

  const outliersTotalCount = chartDataOptions.outliersCount
    ? getOutliersTotalCount(mainQueryResultData, chartDataOptions.outliersCount.name)
    : 0;

  if (chartDataOptions.outliers && outliersTotalCount < OUTLIERS_LIMIT) {
    const outliersQuery = {
      dataSource,
      dimensions: attributes,
      measures: [],
      filters,
      highlights,
    };

    const outliersQueryResultData = await executeQuery(outliersQuery, app);
    queryResultData = boxWhiskerProcessResultInternal(
      mainQueryResultData,
      outliersQueryResultData,
      chartDataOptions,
    );
  }

  return queryResultData;
};

const getOutliersTotalCount = (data: QueryResultData, outliersCountColumnName: string) => {
  const outliersCountColumnIndex = data.columns.findIndex(
    ({ name }) => name === outliersCountColumnName,
  );
  let totalCount = 0;

  data.rows.forEach((row) => {
    totalCount += parseInt(row[outliersCountColumnIndex].data);
  });

  return totalCount;
};
