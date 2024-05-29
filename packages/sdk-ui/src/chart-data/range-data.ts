/* eslint-disable no-unused-vars */
/* eslint-disable sonarjs/cognitive-complexity */
import { DataTable } from '../chart-data-processor/table-processor';
import { RangeChartData } from './types';
import {
  RangeChartDataOptionsInternal,
  CartesianChartDataOptionsInternal,
} from '../chart-data-options/types';
import { cartesianData as getCartesianData } from './cartesian-data';

/**
 * Creates data for range charts given chart data table and data options
 *
 * @param chartDataOptions - Data options for range charts
 * @param dataTable - Chart data table
 * @returns range chart data
 */
export const rangeData = (
  chartDataOptions: RangeChartDataOptionsInternal,
  dataTable: DataTable,
): RangeChartData => {
  const cartesianChartDataOptionsUpper = {
    ...chartDataOptions,
    y: [],
  } as CartesianChartDataOptionsInternal;

  const upperValueIndex = 0;
  const lowerValueIndex = 1;

  // assumes no sorting by Y for range chart - open issue
  chartDataOptions.rangeValues.forEach((value) => {
    cartesianChartDataOptionsUpper.y.push(value[upperValueIndex]);
  });
  const cartesianChartDataUpper = getCartesianData(cartesianChartDataOptionsUpper, dataTable);

  const cartesianChartDataOptionsLower = {
    ...chartDataOptions,
    y: [],
  } as CartesianChartDataOptionsInternal;
  chartDataOptions.rangeValues.forEach((value) => {
    cartesianChartDataOptionsLower.y.push(value[lowerValueIndex]);
  });
  const cartesianChartDataLower = getCartesianData(cartesianChartDataOptionsLower, dataTable);

  return {
    ...cartesianChartDataUpper,
    type: 'range',
    seriesOther: cartesianChartDataLower,
  };
};
