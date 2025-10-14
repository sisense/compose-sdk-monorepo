import { QueryResultData } from '@sisense/sdk-data';
import { QueryExecutionConfig } from '@sisense/sdk-query-client';

import { ClientApplication } from '@/app/client-application';
import { executeBoxplotQuery } from '@/boxplot-utils';
import {
  executeQueryWithCache,
  executeQuery as executeQueryWithoutCache,
  QueryDescription,
} from '@/query/execute-query';
import { ChartType } from '@/types';

import {
  BoxplotChartDataOptionsInternal,
  ChartDataOptionsInternal,
} from '../../chart-data-options/types';
import { getChartBuilder } from '../restructured-charts/chart-builder-factory';
import { isRestructuredChartType } from '../restructured-charts/utils';

export type LoadDataFunction = (options: {
  app: ClientApplication;
  chartDataOptionsInternal?: ChartDataOptionsInternal;
  queryDescription: QueryDescription;
  executionConfig?: QueryExecutionConfig;
}) => Promise<QueryResultData>;

/**
 * Get the load data function based on the chart type
 */
export function getLoadDataFunction(
  chartType: ChartType,
  /** Indicates if the chart is a forecast or trend chart for temporal routing between legacy and restructured charts processing */
  isForecastOrTrendChart: boolean,
): LoadDataFunction {
  if (isRestructuredChartType(chartType) && !isForecastOrTrendChart) {
    const chartBuilder = getChartBuilder(chartType);
    return chartBuilder.data.loadData as LoadDataFunction;
  }
  if (chartType === 'boxplot') {
    return loadDataForBoxplotChart;
  }
  return loadDataForRegularChart;
}

const loadDataForRegularChart: LoadDataFunction = async ({
  app,
  queryDescription,
  executionConfig,
}) => {
  // TODO: move selection of cache vs no-cache to a common place
  const isCacheEnabled = app?.settings.queryCacheConfig?.enabled ?? false;
  const executeQuery = isCacheEnabled ? executeQueryWithCache : executeQueryWithoutCache;
  return executeQuery(queryDescription, app, executionConfig);
};

const loadDataForBoxplotChart: LoadDataFunction = async ({
  app,
  chartDataOptionsInternal,
  queryDescription,
}) => {
  // TODO: move selection of cache vs no-cache to a common place
  const isCacheEnabled = app?.settings.queryCacheConfig?.enabled ?? false;
  const executeQuery = isCacheEnabled ? executeQueryWithCache : executeQueryWithoutCache;
  return executeBoxplotQuery(
    {
      app,
      chartDataOptions: chartDataOptionsInternal as BoxplotChartDataOptionsInternal,
      dataSource: queryDescription.dataSource,
      attributes: queryDescription.dimensions ?? [],
      measures: queryDescription.measures ?? [],
      filters: queryDescription.filters,
      highlights: queryDescription.highlights,
      filterRelations: queryDescription.filterRelations,
    },
    executeQuery,
  );
};
