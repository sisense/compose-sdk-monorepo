/* eslint-disable @typescript-eslint/restrict-template-expressions */
// Given generic data options and source data, translate into an intermediate
// data format that is suitable for translation into renderable options via highcharts
import {
  ChartDataOptionsInternal,
  CartesianChartDataOptionsInternal,
  CategoricalChartDataOptionsInternal,
  ScatterChartDataOptionsInternal,
  IndicatorChartDataOptionsInternal,
  BoxplotChartDataOptionsInternal,
  AreamapChartDataOptionsInternal,
  ScattermapChartDataOptionsInternal,
  RangeChartDataOptionsInternal,
} from '../chart-data-options/types';
import {
  isCartesian,
  isCategorical,
  isScatter,
  isIndicator,
  isBoxplot,
  isAreamap,
  isScattermap,
  isRange,
} from '../chart-options-processor/translations/types';
import { DataTable } from '../chart-data-processor/table-processor';
import type { ChartType } from '../types';
import { cartesianData } from './cartesian-data';
import { categoricalData } from './categorical-data';
import { scatterData } from './scatter-data';
import { indicatorData } from './indicator-data';

import { ChartData } from './types';
import { boxplotData } from './boxplot-data';
import { getAreamapData } from './areamap-data';
import { scattermapData } from './scattermap-data';
import { rangeData as getRangeData } from './range-data';
import { advancedAnalyticsData, isForecastChart } from './advanced-analytics-data';
import { TranslatableError } from '@/translation/translatable-error';

export const chartDataService = (
  chartType: ChartType,
  chartDataOptions: ChartDataOptionsInternal,
  dataTable: DataTable,
): ChartData => {
  if (isCartesian(chartType)) {
    if (isForecastChart(chartDataOptions as CartesianChartDataOptionsInternal)) {
      return advancedAnalyticsData(
        chartDataOptions as CartesianChartDataOptionsInternal,
        dataTable,
      );
    }
    return cartesianData(chartDataOptions as CartesianChartDataOptionsInternal, dataTable);
  } else if (isCategorical(chartType)) {
    return categoricalData(chartDataOptions as CategoricalChartDataOptionsInternal, dataTable);
  } else if (isScatter(chartType)) {
    return scatterData(chartDataOptions as ScatterChartDataOptionsInternal, dataTable);
  } else if (isScattermap(chartType)) {
    return scattermapData(chartDataOptions as ScattermapChartDataOptionsInternal, dataTable);
  } else if (isIndicator(chartType)) {
    return indicatorData(
      chartDataOptions as unknown as IndicatorChartDataOptionsInternal,
      dataTable,
    );
  } else if (isBoxplot(chartType)) {
    return boxplotData(chartDataOptions as BoxplotChartDataOptionsInternal, dataTable);
  } else if (isAreamap(chartType)) {
    return getAreamapData(
      chartDataOptions as unknown as AreamapChartDataOptionsInternal,
      dataTable,
    );
  } else if (isRange(chartType)) {
    return getRangeData(chartDataOptions as RangeChartDataOptionsInternal, dataTable);
  } else throw new TranslatableError('errors.unexpectedChartType', { chartType });
};
