import { getColumnByName, getValue, DataTable } from '../chart-data-processor/table-processor';
import { IndicatorChartDataOptionsInternal, Value } from '../chart-data-options/types';
import { IndicatorChartData } from './types';

const valueFromFirstRow = (
  dataTable: DataTable,
  measure: Value[] | undefined,
): [number | undefined, string | undefined] => {
  if (!measure || measure.length !== 1) {
    return [undefined, undefined];
  }
  const column = getColumnByName(dataTable, measure[0].name);
  if (column) {
    return [getValue(dataTable.rows[0], column) as number, measure[0].name];
  }
  return [undefined, undefined];
};

// Given chart source and data options, generate indicator data
export const indicatorData = (
  chartDataOptions: IndicatorChartDataOptionsInternal,
  dataTable: DataTable,
): IndicatorChartData => {
  const emptyIndicatorData: IndicatorChartData = { type: 'indicator' };
  if (!chartDataOptions.value || dataTable.rows.length === 0) {
    return emptyIndicatorData;
  }

  // required field
  const [value] = valueFromFirstRow(dataTable, chartDataOptions.value);
  if (!value) {
    return emptyIndicatorData;
  }

  // optional fields
  const [secondary] = valueFromFirstRow(dataTable, chartDataOptions.secondary);
  const [min] = valueFromFirstRow(dataTable, chartDataOptions.min);
  const [max] = valueFromFirstRow(dataTable, chartDataOptions.max);

  return {
    type: 'indicator',
    value,
    secondary,
    min,
    max,
  };
};
