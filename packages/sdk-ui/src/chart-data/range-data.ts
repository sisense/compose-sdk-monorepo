/* eslint-disable no-unused-vars */
/* eslint-disable sonarjs/cognitive-complexity */
import { DataTable } from '../chart-data-processor/table-processor';
import { RangeChartData } from './types';
import {
  RangeChartDataOptionsInternal,
  CartesianChartDataOptionsInternal,
} from '../chart-data-options/types';
import { cartesianData, cartesianData as getCartesianData } from './cartesian-data';

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
  const getInitialCartesianDataOptions = () =>
    ({
      ...chartDataOptions,
      y: [],
    } as CartesianChartDataOptionsInternal);
  const cartesianChartDataOptionsUpper = getInitialCartesianDataOptions();
  const cartesianChartDataOptionsLower = getInitialCartesianDataOptions();

  const upperValueIndex = 1;
  const lowerValueIndex = 0;

  // assumes no sorting by Y for range chart - open issue
  chartDataOptions.seriesValues.forEach((value) => {
    cartesianChartDataOptionsUpper.y.push(value);
    cartesianChartDataOptionsLower.y.push(value);
  });
  chartDataOptions.rangeValues.forEach((value) => {
    const upperValue = value[upperValueIndex];
    const lowerValue = value[lowerValueIndex];

    cartesianChartDataOptionsUpper.y.push(upperValue);
    cartesianChartDataOptionsLower.y.push(lowerValue);
  });
  const cartesianChartDataUpper = getCartesianData(cartesianChartDataOptionsUpper, dataTable);
  const cartesianChartDataLower = getCartesianData(cartesianChartDataOptionsLower, dataTable);

  return {
    ...cartesianChartDataUpper,
    type: 'range',
    seriesOther: cartesianChartDataLower,
  };
};
