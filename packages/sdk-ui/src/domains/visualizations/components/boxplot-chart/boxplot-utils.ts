import {
  Attribute,
  DataSource,
  Filter,
  FilterRelationsJaql,
  Measure,
  QueryResultData,
} from '@sisense/sdk-data';
import isNull from 'lodash-es/isNull';

import { type ClientApplication } from '../../../../infra/app/types.js';
import { executeQuery as executeQueryFunction } from '../../../query-execution/core/execute-query.js';
import { translateBoxplotDataOptions } from '../../core/chart-data-options/translate-boxplot-data-options.js';
import {
  BoxplotChartCustomDataOptions,
  BoxplotChartDataOptionsInternal,
  StyledColumn,
  StyledMeasureColumn,
} from '../../core/chart-data-options/types.js';

const OUTLIERS_LIMIT = 20000;

function getDataColumnIndex(
  dataColumns: QueryResultData['columns'],
  dataOption?: StyledColumn | StyledMeasureColumn,
) {
  if (dataColumns && dataOption) {
    const targetColumnName = dataOption.column.name;
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
  if (!boxWhiskerData) return { columns: [], rows: [] };

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

  // Capture the post-guard non-null index in a const so the narrowing holds inside the closures below.
  const outliersValueIndex = outliersValueColumnIndex;

  const combinedData: QueryResultData = {
    columns: [...boxWhiskerData.columns, outliersData.columns[outliersValueIndex]],
    rows: boxWhiskerData.rows.map((row) => {
      const boxCategory = isNull(boxCategoryColumnIndex) ? null : row[boxCategoryColumnIndex].data;
      const whiskerMax = row[boxWhiskerMaxColumnIndex!].data;
      const whiskerMin = row[boxWhiskerMinColumnIndex!].data;
      const outliersCombinedString = outliersData.rows
        .filter((outliersRow) => {
          const outlierCategory = isNull(outliersCategoryColumnIndex)
            ? null
            : outliersRow[outliersCategoryColumnIndex].data;
          const outlierValue = outliersRow[outliersValueIndex].data;
          return (
            outlierCategory === boxCategory &&
            // manually removes points located between the whiskers, due to the back-end issue that returns incorrect points
            (outlierValue < whiskerMin || outlierValue > whiskerMax)
          );
        })
        .map((outliersRow) => outliersRow[outliersValueIndex].data)
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
 * @example
 * Without custom `dataOptions`, the category is expected at column index 0, and the whisker
 * min/max at columns 4 and 5, matching the query shape used internally by
 * {@link @sisense/sdk-ui!BoxplotChart | `BoxplotChart`}.
 *
 * ```ts
 * import { boxWhiskerProcessResult } from '@sisense/sdk-ui';
 *
 * const boxWhiskerData = {
 *   columns: [
 *     { name: 'Category' },
 *     { name: 'Median' },
 *     { name: 'Q1' },
 *     { name: 'Q3' },
 *     { name: 'Min' },
 *     { name: 'Max' },
 *   ],
 *   rows: [[{ data: 'A' }, { data: 30 }, { data: 20 }, { data: 40 }, { data: 10 }, { data: 50 }]],
 * };
 * const outliersData = {
 *   columns: [{ name: 'Category' }, { name: 'Value' }],
 *   rows: [[{ data: 'A' }, { data: 75 }]],
 * };
 *
 * // Each result row gains an extra cell listing outlier values outside the whisker range.
 * const combined = boxWhiskerProcessResult(boxWhiskerData, outliersData);
 * ```
 *
 * @param boxWhiskerData - The data for the box whisker.
 * @param outliersData - The data for the outliers.
 * @param dataOptions - Optional data options for customizing data processing.
 * @returns The combined data with outliers included in the box whisker plot.
 * @shortDescription Utility function that combines box whisker data and outliers data
 * @group Charts
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
    filterRelations,
    highlights,
  }: {
    app: ClientApplication;
    chartDataOptions: BoxplotChartDataOptionsInternal;
    dataSource?: DataSource;
    attributes: Attribute[];
    measures: Measure[];
    filters?: Filter[];
    filterRelations?: FilterRelationsJaql;
    highlights?: Filter[];
  },
  executeQuery: typeof executeQueryFunction,
) => {
  const mainQuery = {
    dataSource,
    dimensions: chartDataOptions.category ? [attributes[0]] : [],
    measures,
    filters,
    filterRelations,
    highlights,
  };

  const mainQueryResultData = await executeQuery(mainQuery, app);
  let queryResultData = mainQueryResultData;

  const outliersTotalCount = chartDataOptions.outliersCount
    ? getOutliersTotalCount(mainQueryResultData, chartDataOptions.outliersCount.column.name)
    : 0;

  if (chartDataOptions.outliers && outliersTotalCount < OUTLIERS_LIMIT) {
    const outliersQuery = {
      dataSource,
      dimensions: attributes,
      measures: [],
      filters,
      filterRelations,
      highlights,
    };
    try {
      const outliersQueryResultData = await executeQuery(outliersQuery, app);
      queryResultData = boxWhiskerProcessResultInternal(
        mainQueryResultData,
        outliersQueryResultData,
        chartDataOptions,
      );
    } catch (error) {
      if ((error as Error)?.message?.includes('UnsupportedFunctionalityException')) {
        console.warn('Functionality not supported by platform: Boxplot outliers');
      } else {
        throw error;
      }
    }
  }

  return queryResultData;
};

const getOutliersTotalCount = (data: QueryResultData, outliersCountColumnName: string) => {
  if (!data?.columns) return 0;
  const outliersCountColumnIndex = data.columns.findIndex(
    ({ name }) => name === outliersCountColumnName,
  );
  let totalCount = 0;

  data.rows.forEach((row) => {
    totalCount += parseInt(row[outliersCountColumnIndex].data);
  });

  return totalCount;
};
