import { getDataOptionTitle, safeMerge } from '@/chart-data-options/utils';
import {
  isForecastSeries,
  isTrendSeries,
  rangeTitle,
} from '@/chart-options-processor/advanced-chart-options';

import {
  CartesianChartDataOptionsInternal,
  RangeChartDataOptionsInternal,
  StyledMeasureColumn,
} from '../chart-data-options/types';
import { DataTable } from '../chart-data-processor/table-processor';
import { rangeData } from './range-data';
import { CartesianChartData } from './types';

export const isForecastChart = (dataOptions: CartesianChartDataOptionsInternal) => {
  const rangeOptions = dataOptions as unknown as RangeChartDataOptionsInternal;
  if (rangeOptions.rangeValues) return false;
  return dataOptions.y.some((v) => isForecastSeries(getDataOptionTitle(v)));
};

export const isTrendChart = (dataOptions: CartesianChartDataOptionsInternal) => {
  const rangeOptions = dataOptions as unknown as RangeChartDataOptionsInternal;
  if (rangeOptions.rangeValues) return false;
  return dataOptions.y.some((v) => isTrendSeries(getDataOptionTitle(v)));
};

export const createForecastDataOptions = (dataOptions: CartesianChartDataOptionsInternal) => {
  const rangeValues = dataOptions.y
    .filter((v) => isForecastSeries(getDataOptionTitle(v)))
    .map((f) => {
      const upper: StyledMeasureColumn = {
        ...f,
        column: safeMerge(f.column, {
          title: f.column.title && rangeTitle(f.column.title),
          name: `${f.column.name}_upper`,
        }),
      };
      const lower: StyledMeasureColumn = {
        ...f,
        column: safeMerge(f.column, {
          title: f.column.title && rangeTitle(f.column.title),
          name: `${f.column.name}_lower`,
        }),
      };
      return [lower, upper];
    });

  const y = rangeValues.concat(dataOptions.y);
  const cartesianValues = y.flat();
  const seriesValues = dataOptions.y;
  return {
    ...dataOptions,
    rangeValues: rangeValues,
    seriesValues: seriesValues,
    y: cartesianValues,
  };
};

export const advancedAnalyticsData = (
  dataOptions: CartesianChartDataOptionsInternal,
  dataTable: DataTable,
) => {
  const rangeChartDataOptionsInternal = createForecastDataOptions(dataOptions);
  return {
    ...rangeData(rangeChartDataOptionsInternal, dataTable),
    type: 'cartesian',
  } as unknown as CartesianChartData;
};
