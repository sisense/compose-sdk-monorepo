import {
  SupportedChartType,
  TypedLoadDataFunction,
} from '@/domains/visualizations/components/chart/restructured-charts/types';
import { DataTable } from '@/domains/visualizations/core/chart-data-processor/table-processor';

import { getCategoricalChartDataFromTable, loadCategoricalData } from '../../helpers/data';
import { FunnelChartData, FunnelChartDataOptionsInternal } from '../types';

/**
 * Maximum number of data points allowed for funnel charts.
 * This limit ensures optimal performance and user experience.
 */
export const FUNNEL_CHART_DATA_LIMIT = 50;

/**
 * Wraps the load data function to limit the number of data points to funnel-specific data limit.
 */
const withFunnelChartDataLimit = <CT extends SupportedChartType>(
  loadData: TypedLoadDataFunction<CT>,
): TypedLoadDataFunction<CT> => {
  return (...args) => {
    const [params, ...rest] = args;
    const existingCount = params.queryDescription?.count;
    const clampedCount = Math.min(
      existingCount ?? FUNNEL_CHART_DATA_LIMIT,
      FUNNEL_CHART_DATA_LIMIT,
    );

    const newFirstArg = {
      ...params,
      queryDescription: {
        ...params.queryDescription,
        count: clampedCount,
      },
    };

    return loadData(newFirstArg, ...rest);
  };
};

/**
 * Data translators for funnel charts.
 */
export const dataTranslators = {
  /**
   * Loads data for funnel charts with funnel-specific data limiting for optimal performance.
   */
  loadData: withFunnelChartDataLimit(loadCategoricalData),

  /**
   * Transforms data table to funnel chart data.
   */
  getChartData: (
    dataOptions: FunnelChartDataOptionsInternal,
    dataTable: DataTable,
  ): FunnelChartData => {
    return getCategoricalChartDataFromTable(dataOptions, dataTable);
  },
};
