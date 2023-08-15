import {
  CategoricalChartDataOptionsInternal,
  CartesianChartDataOptionsInternal,
  Value,
} from '../chart-data-options/types';
import { cartesianData } from './cartesian_data';
import { DataTable } from '../chart-data-processor/table_processor';
import { isEnabled } from './utils';
import { CategoricalChartData } from './types';
import { applyFormatPlainText } from '../chart-options-processor/translations/number_format_config';
import { isNumber } from '@sisense/sdk-data';

export const validateCategoricalChartDataOptions = (
  chartDataOptions: CategoricalChartDataOptionsInternal,
): CategoricalChartDataOptionsInternal => {
  const y = chartDataOptions.y.filter((value: Value) => isEnabled(value.enabled));

  // break by series column only when there is one y column
  const breakByChart = y.length === 1 && chartDataOptions.breakBy.length > 0;
  const breakBy = breakByChart ? chartDataOptions.breakBy : [];

  return {
    ...chartDataOptions,
    y,
    breakBy,
  };
};

export const categoricalData = (
  chartDataOptions: CategoricalChartDataOptionsInternal,
  dataTable: DataTable, // 	chartSourceData: ChartSource,
): CategoricalChartData => {
  const cartesianChartDataOptions: CartesianChartDataOptionsInternal = {
    ...chartDataOptions,
    x: chartDataOptions.breakBy,
    breakBy: [],
  };
  let cartesianChartData = cartesianData(cartesianChartDataOptions, dataTable);

  // maybe format break By values
  const breakByHasNumberFormatConfig = chartDataOptions.breakBy.some(
    (s) => isNumber(s.type) && s?.numberFormatConfig,
  );
  if (breakByHasNumberFormatConfig) {
    const xValues = cartesianChartData.xValues.map((xValue) => {
      const formattedXValues: string[] = [];
      chartDataOptions.breakBy.forEach((breakBy, index) => {
        const numberFormatConfig = breakBy?.numberFormatConfig;
        const value = xValue.xValues[index];
        if (isNumber(breakBy.type) && numberFormatConfig) {
          formattedXValues.push(applyFormatPlainText(numberFormatConfig, parseFloat(value)));
        } else {
          formattedXValues.push(xValue.xValues[index]);
        }
      });
      return {
        ...xValue,
        xValues: formattedXValues,
      };
    });
    cartesianChartData = {
      ...cartesianChartData,
      xValues,
    };
  }

  return {
    ...cartesianChartData,
    type: 'categorical',
  };
};
