import { DataTable } from '../chart-data-processor/table-processor';
import { CartesianChartData } from './types';
import {
  CartesianChartDataOptionsInternal,
  RangeChartDataOptionsInternal,
} from '../chart-data-options/types';
import { rangeData } from './range-data';
import {
  isForecastSeries,
  isTrendSeries,
  rangeTitle,
} from '@/chart-options-processor/advanced-chart-options';

export const isForecastChart = (dataOptions: CartesianChartDataOptionsInternal) => {
  const rangeOptions = dataOptions as unknown as RangeChartDataOptionsInternal;
  if (rangeOptions.rangeValues) return false;
  return dataOptions.y.some((v) => isForecastSeries(v.title));
};

export const isTrendChart = (dataOptions: CartesianChartDataOptionsInternal) => {
  const rangeOptions = dataOptions as unknown as RangeChartDataOptionsInternal;
  if (rangeOptions.rangeValues) return false;
  return dataOptions.y.some((v) => isTrendSeries(v.title));
};

export const createForecastDataOptions = (dataOptions: CartesianChartDataOptionsInternal) => {
  const rangeValues = dataOptions.y
    .filter((v) => isForecastSeries(v.title))
    .map((f) => {
      const upper = { ...f, title: rangeTitle(f.title), name: `${f.name}_upper` };
      const lower = { ...f, title: rangeTitle(f.title), name: `${f.name}_lower` };
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
