import {
  CategoricalChartDataOptionsInternal,
  CartesianChartDataOptionsInternal,
} from '../chart-data-options/types';
import { cartesianData } from './cartesian-data';
import { DataTable } from '../chart-data-processor/table-processor';
import { isEnabled } from './utils';
import { CategoricalChartData } from './types';
import {
  applyFormatPlainText,
  getCompleteNumberFormatConfig,
} from '../chart-options-processor/translations/number-format-config';
import { isNumber } from '@sisense/sdk-data';

export const validateCategoricalChartDataOptions = (
  chartDataOptions: CategoricalChartDataOptionsInternal,
): CategoricalChartDataOptionsInternal => {
  const y = chartDataOptions.y.filter(({ enabled }) => isEnabled(enabled));

  // break by series column only when there is one y column
  const isBreakByAllowed = y.length === 1 && chartDataOptions.breakBy.length > 0;
  const breakBy = isBreakByAllowed ? chartDataOptions.breakBy : [];

  return {
    ...chartDataOptions,
    y,
    breakBy,
  };
};

export const categoricalData = (
  dataOptions: CategoricalChartDataOptionsInternal,
  dataTable: DataTable,
): CategoricalChartData => {
  const cartesianChartDataOptions = {
    ...dataOptions,
    x: dataOptions.breakBy,
    breakBy: [],
  } as CartesianChartDataOptionsInternal;
  let cartesianChartData = cartesianData(cartesianChartDataOptions, dataTable);
  // maybe format break By values
  const breakByHasNumberFormatConfig = dataOptions.breakBy.some(
    ({ column: { type }, numberFormatConfig }) => isNumber(type) && numberFormatConfig,
  );
  if (breakByHasNumberFormatConfig) {
    const xValues = cartesianChartData.xValues.map((xValue) => {
      const formattedXValues: string[] = [];
      dataOptions.breakBy.forEach(({ column: { type }, numberFormatConfig }, index) => {
        const completeNumberFormatConfig = getCompleteNumberFormatConfig(numberFormatConfig);
        const value = xValue.xValues[index];
        if (isNumber(type)) {
          formattedXValues.push(
            applyFormatPlainText(completeNumberFormatConfig, parseFloat(value)),
          );
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
