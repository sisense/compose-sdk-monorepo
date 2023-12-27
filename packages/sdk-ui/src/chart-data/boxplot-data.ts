/* eslint-disable sonarjs/cognitive-complexity */
import {
  Column,
  DataTable,
  getColumnByName,
  getIndexedRows,
  getValue,
  isBlurred,
} from '../chart-data-processor/table-processor.js';
import {
  BoxplotChartData,
  BoxplotOutliersSeriesValueData,
  BoxplotSeriesValueData,
} from './types.js';
import { BoxplotChartDataOptionsInternal } from '../chart-data-options/types.js';
import { getOrderedXValues, sortDirection } from './cartesian-data.js';
import { rownumColumnName } from '../chart-data-processor/table-creators.js';

/**
 * Creates data for box plot charts given chart data table and data options
 *
 * @param chartDataOptions - Data options for box plot chart
 * @param dataTable - Chart data table
 * @returns Box plot chart data
 */
// eslint-disable-next-line max-lines-per-function
export const boxplotData = (
  chartDataOptions: BoxplotChartDataOptionsInternal,
  dataTable: DataTable,
): BoxplotChartData => {
  const xColumn: Column | undefined =
    chartDataOptions.category && getColumnByName(dataTable, chartDataOptions.category.name);

  if (xColumn) {
    xColumn.direction = sortDirection(chartDataOptions.category!.sortType);
  }

  const xValuesOrdered = getOrderedXValues(
    dataTable,
    [],
    xColumn ? [xColumn] : [],
    xColumn?.direction === 0 ? rownumColumnName : undefined,
  );

  const rowsByXColumns = getIndexedRows(dataTable.rows, xColumn ? [xColumn] : []);
  const boxMinColumn = getColumnByName(dataTable, chartDataOptions.boxMin.name);
  const boxMedianColumn = getColumnByName(dataTable, chartDataOptions.boxMedian.name);
  const boxMaxColumn = getColumnByName(dataTable, chartDataOptions.boxMax.name);
  const whiskerMinColumn = getColumnByName(dataTable, chartDataOptions.whiskerMin.name);
  const whiskerMaxColumn = getColumnByName(dataTable, chartDataOptions.whiskerMax.name);
  const outliersColumn =
    chartDataOptions.outliers && getColumnByName(dataTable, chartDataOptions.outliers.name);

  const seriesValues: BoxplotSeriesValueData[] = [];
  const outliersSeriesValues: BoxplotOutliersSeriesValueData[] = [];

  xValuesOrdered.forEach((xValue, index) => {
    const rows = rowsByXColumns[xValue.key];
    // since we aggregated we know it is single number
    // expect one row or none
    const row = rows ? rows[0] : [];
    const blur = xColumn && isBlurred(row, xColumn);

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
      name: chartDataOptions.valueTitle,
      title: chartDataOptions.valueTitle,
      data: seriesValues,
    },
  ];

  if (outliersSeriesValues.length > 0) {
    series.push({
      name: chartDataOptions.valueTitle,
      title: chartDataOptions.valueTitle,
      data: outliersSeriesValues,
    });
  }

  return {
    type: 'boxplot',
    xValues: xValuesOrdered,
    series,
  };
};
