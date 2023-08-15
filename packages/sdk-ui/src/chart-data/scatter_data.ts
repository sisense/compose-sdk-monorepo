import { ComparableData, DataTable, Row } from '../chart-data-processor/table_processor';
import {
  ScatterDataRow,
  ScatterCategories,
  ScatterChartData,
  ScatterAxisCategoriesMap,
  ScatterDataTable,
} from './types';
import {
  ScatterChartDataOptionsInternal,
  Category,
  Value,
  isCategory,
} from '../chart-data-options/types';

export const defaultScatterDataValue: ComparableData = { displayValue: '0' };

export type AxisColumnName = 'xAxis' | 'yAxis';

export interface DataOptionsIndexes {
  x: number;
  y: number;
  breakByPoint: number;
  breakByColor: number;
  size: number;
}

const getColumnIndex = (table: DataTable, column?: Category | Value): number => {
  if (column) {
    for (let i = 0; i < table.columns.length; i++) {
      if (table.columns[i].name === column.name) {
        return i;
      }
    }
  }
  return -1;
};

const defineIndexes = (
  chartDataOptions: ScatterChartDataOptionsInternal,
  dataTable: DataTable,
): DataOptionsIndexes => {
  return {
    x: getColumnIndex(dataTable, chartDataOptions.x),
    y: getColumnIndex(dataTable, chartDataOptions.y),
    breakByPoint: getColumnIndex(dataTable, chartDataOptions.breakByPoint),
    breakByColor: getColumnIndex(dataTable, chartDataOptions.breakByColor),
    size: getColumnIndex(dataTable, chartDataOptions.size),
  };
};

const defineValue = (index: number, row: Row): ComparableData =>
  row[index] || defaultScatterDataValue;

export const buildCategories = (
  data: ScatterDataTable,
  axisColumnName: AxisColumnName,
): string[] => {
  const result = new Set<string>();

  data.forEach((row: ScatterDataRow) => {
    result.add(row[axisColumnName].displayValue);
  });

  return Array.from(result.values());
};

const getCategories = (
  data: ScatterDataRow[],
  axisColumnName: AxisColumnName,
  axis?: Category | Value,
): ScatterCategories => {
  if (axis && isCategory(axis)) {
    return buildCategories(data, axisColumnName);
  }
  return undefined;
};

const mapTo = (value: string, index: number): [string, number] => [value, index];

export const createCategoriesMap = (
  xCategories?: ScatterCategories,
  yCategories?: ScatterCategories,
): ScatterAxisCategoriesMap => {
  const xCategoriesMap = new Map<string, number>(xCategories?.map(mapTo));
  const yCategoriesMap = new Map<string, number>(yCategories?.map(mapTo));

  return {
    xCategoriesMap,
    yCategoriesMap,
  };
};

export const groupData = (
  chartDataOptions: ScatterChartDataOptionsInternal,
  dataTable: DataTable,
): ScatterDataTable => {
  const indexes = defineIndexes(chartDataOptions, dataTable);
  return dataTable.rows.map((row) => ({
    xAxis: defineValue(indexes.x, row),
    yAxis: defineValue(indexes.y, row),
    breakByPoint: row[indexes.breakByPoint],
    breakByColor: row[indexes.breakByColor],
    size: row[indexes.size],
  }));
};

/**
 * Creates data for scatter charts given chart data table and data options,
 *
 * @param chartDataOptions - Data options for scatter chart
 * @param dataTable - Chart data table
 * @returns Scatter chart data
 */
export const scatterData = (
  chartDataOptions: ScatterChartDataOptionsInternal,
  dataTable: DataTable,
): ScatterChartData => {
  // TODO consider applyNullMask
  const scatterDataTable = groupData(chartDataOptions, dataTable);

  const { x: xAxis, y: yAxis } = chartDataOptions;

  const xCategories = getCategories(scatterDataTable, 'xAxis', xAxis);
  const yCategories = getCategories(scatterDataTable, 'yAxis', yAxis);

  return {
    type: 'scatter',
    scatterDataTable,
    xCategories,
    yCategories,
  };
};
