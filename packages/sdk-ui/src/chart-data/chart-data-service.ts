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
  ScattermapChartDataOptionsInternal,
} from '../chart-data-options/types';
import {
  isCartesian,
  isCategorical,
  isScatter,
  isIndicator,
  isBoxplot,
  isScattermap,
} from '../chart-options-processor/translations/types';
import { DataTable } from '../chart-data-processor/table-processor';
import { ChartType, NumberFormatConfig, SeriesChartType } from '../types';
import { cartesianData } from './cartesian-data';
import { categoricalData } from './categorical-data';
import { scatterData } from './scatter-data';
import { indicatorData } from './indicator-data';

import { ChartData } from './types';
import { boxplotData } from './boxplot-data';
import { scattermapData } from './scattermap-data';

export const chartDataService = (
  chartType: ChartType,
  chartDataOptions: ChartDataOptionsInternal,
  dataTable: DataTable,
): ChartData => {
  if (isCartesian(chartType)) {
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
  } else throw new Error(`Unexpected chart type: ${chartType}`);
};

export type ValueColumn = {
  column: string;
  agg: string;
  columnTitle: string;
  enabled: boolean;
  sort: SortDirection;
  showOnRightAxis?: boolean; // true is on right axis, false is on left axis
  numberFormatConfig?: NumberFormatConfig;
  chartType?: SeriesChartType;
  color?: string;
  legacyInstanceId?: string;
};

export type SortDirection = 'sortAsc' | 'sortDesc' | 'sortNone';
