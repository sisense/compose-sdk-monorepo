import {
  IndicatorChartDataOptionsInternal,
  StyledMeasureColumn,
} from '../chart-data-options/types';
import { DataTable, getColumnByName, getValue } from '../chart-data-processor/table-processor';
import { IndicatorChartData } from './types.js';

const valueFromFirstRow = (
  dataTable: DataTable,
  measure: StyledMeasureColumn[] | undefined,
): [number | undefined, string | undefined] => {
  if (!measure || measure.length !== 1) {
    return [undefined, undefined];
  }
  const column = getColumnByName(dataTable, measure[0].column.name);
  if (column) {
    return [getValue(dataTable.rows[0], column) as number, measure[0].column.name];
  }
  return [undefined, undefined];
};

const colorConditionValuesFromRow = (
  dataTable: DataTable,
  colorConditionMeasures: StyledMeasureColumn[] | undefined,
): Record<string, number> | undefined => {
  if (!colorConditionMeasures?.length) {
    return undefined;
  }
  const entries = colorConditionMeasures
    .map((measure) => [measure.column.name, valueFromFirstRow(dataTable, [measure])[0]] as const)
    .filter((entry): entry is [string, number] => entry[1] !== undefined);
  return entries.length ? Object.fromEntries(entries) : undefined;
};

// Given chart source and data options, generate indicator data
export const indicatorData = (
  dataOptions: IndicatorChartDataOptionsInternal,
  dataTable: DataTable,
): IndicatorChartData => {
  const emptyIndicatorData: IndicatorChartData = { type: 'indicator' };
  if (!dataOptions.value?.length || dataTable.rows.length === 0) {
    return emptyIndicatorData;
  }

  // required field
  const [value] = valueFromFirstRow(dataTable, dataOptions.value);
  if (value === undefined) {
    return emptyIndicatorData;
  }

  // optional fields
  const [secondary] = valueFromFirstRow(dataTable, dataOptions.secondary);
  const [min] = valueFromFirstRow(dataTable, dataOptions.min);
  const [max] = valueFromFirstRow(dataTable, dataOptions.max);
  const colorConditionValues = colorConditionValuesFromRow(
    dataTable,
    dataOptions.colorConditionMeasures,
  );

  return {
    type: 'indicator',
    value,
    secondary,
    min,
    max,
    ...(colorConditionValues && { colorConditionValues }),
  };
};
