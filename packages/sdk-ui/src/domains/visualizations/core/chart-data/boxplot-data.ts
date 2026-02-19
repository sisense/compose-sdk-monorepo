import { type SortDirection } from '../../../../types.js';
import { BoxplotChartDataOptionsInternal } from '../chart-data-options/types.js';
import { rownumColumnName } from '../chart-data-processor/table-creators.js';
import {
  Column,
  DataTable,
  getColumnByName,
  getIndexedRows,
  getValue,
  isBlurred,
} from '../chart-data-processor/table-processor.js';
import { getOrderedXValues, sortDirection } from './cartesian-data.js';
import {
  BoxplotChartData,
  BoxplotOutliersSeriesValueData,
  BoxplotSeriesValueData,
  ChartData,
} from './types.js';

/**
 * Creates data for box plot charts given chart data table and data options
 *
 * @param chartDataOptions - Data options for box plot chart
 * @param dataTable - Chart data table
 * @returns Box plot chart data
 */
// eslint-disable-next-line max-lines-per-function
export const boxplotData = (
  dataOptions: BoxplotChartDataOptionsInternal,
  dataTable: DataTable,
): BoxplotChartData => {
  const xColumn: Column | undefined =
    dataOptions.category && getColumnByName(dataTable, dataOptions.category.column.name);

  if (xColumn) {
    xColumn.direction = sortDirection(dataOptions.category!.sortType as SortDirection);
  }

  const xValuesOrdered = getOrderedXValues(
    dataTable,
    [],
    xColumn ? [xColumn] : [],
    xColumn?.direction === 0 ? rownumColumnName : undefined,
  );

  const rowsByXColumns = getIndexedRows(dataTable.rows, xColumn ? [xColumn] : []);
  const boxMinColumn = getColumnByName(dataTable, dataOptions.boxMin.column.name);
  const boxMedianColumn = getColumnByName(dataTable, dataOptions.boxMedian.column.name);
  const boxMaxColumn = getColumnByName(dataTable, dataOptions.boxMax.column.name);
  const whiskerMinColumn = getColumnByName(dataTable, dataOptions.whiskerMin.column.name);
  const whiskerMaxColumn = getColumnByName(dataTable, dataOptions.whiskerMax.column.name);
  const outliersColumn =
    dataOptions.outliers && getColumnByName(dataTable, dataOptions.outliers.column.name);

  const seriesValues: BoxplotSeriesValueData[] = [];
  const outliersSeriesValues: BoxplotOutliersSeriesValueData[] = [];

  xValuesOrdered.forEach((xValue, index) => {
    const rows = rowsByXColumns[xValue.key];
    // since we aggregated we know it is single number
    // expect one row or none
    const row = rows ? rows[0] : [];
    const blur = xColumn && !!isBlurred(row, xColumn);

    seriesValues.push({
      q1: boxMinColumn ? (getValue(row, boxMinColumn) as number) : 0,
      median: boxMedianColumn ? (getValue(row, boxMedianColumn) as number) : 0,
      q3: boxMaxColumn ? (getValue(row, boxMaxColumn) as number) : 0,
      low: whiskerMinColumn ? (getValue(row, whiskerMinColumn) as number) : 0,
      high: whiskerMaxColumn ? (getValue(row, whiskerMaxColumn) as number) : 0,
      blur,
    } as BoxplotSeriesValueData);

    const outliers = outliersColumn
      ? (row[outliersColumn.index].rawValue as string).split(',').map((s) => parseFloat(s))
      : [];
    outliersSeriesValues.push(
      ...outliers.map(
        (value) =>
          ({
            x: index,
            y: value,
            blur,
          } as BoxplotOutliersSeriesValueData),
      ),
    );
  });

  const series: BoxplotChartData['series'] = [
    {
      name: dataOptions.valueTitle,
      title: dataOptions.valueTitle,
      data: seriesValues,
    },
  ];

  if (outliersSeriesValues.length > 0) {
    series.push({
      name: dataOptions.valueTitle,
      title: dataOptions.valueTitle,
      data: outliersSeriesValues,
    });
  }

  return {
    type: 'boxplot',
    xValues: xValuesOrdered,
    series,
  };
};

export function isBoxplotChartData(chartData: ChartData): chartData is BoxplotChartData {
  return chartData.type === 'boxplot';
}
