/* eslint-disable no-unused-vars */

/* eslint-disable sonarjs/cognitive-complexity */
import {
  CartesianChartDataOptionsInternal,
  RangeChartDataOptionsInternal,
} from '../chart-data-options/types';
import { DataTable } from '../chart-data-processor/table-processor';
import { cartesianData as getCartesianData } from './cartesian-data';
import { RangeChartData } from './types';

/**
 * Creates data for range charts given chart data table and data options
 *
 * @param dataOptions - Data options for range charts
 * @param dataTable - Chart data table
 * @returns range chart data
 */
export const rangeData = (
  dataOptions: RangeChartDataOptionsInternal,
  dataTable: DataTable,
): RangeChartData => {
  const getInitialCartesianDataOptions = () =>
    ({
      ...dataOptions,
      y: [],
    } as CartesianChartDataOptionsInternal);
  const cartesianChartDataOptionsUpper = getInitialCartesianDataOptions();
  const cartesianChartDataOptionsLower = getInitialCartesianDataOptions();

  const upperValueIndex = 1;
  const lowerValueIndex = 0;

  // assumes no sorting by Y for range chart - open issue
  dataOptions.seriesValues.forEach((value) => {
    cartesianChartDataOptionsUpper.y.push(value);
    cartesianChartDataOptionsLower.y.push(value);
  });
  dataOptions.rangeValues.forEach((value) => {
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
