/* eslint-disable @typescript-eslint/no-shadow */

/* eslint-disable @typescript-eslint/no-use-before-define */

/* eslint-disable max-params */

/* eslint-disable sonarjs/no-ignored-return */
import { isNumber } from '@sisense/sdk-data';

import {
  CartesianChartDataOptionsInternal,
  StyledColumn,
  StyledMeasureColumn,
} from '../chart-data-options/types';
import { getDataOptionTitle } from '../chart-data-options/utils';
import { rownumColumnName } from '../chart-data-processor/table-creators';
import {
  Column,
  ColumnMeasure,
  DataTable,
  getColumnByName,
  getColumnsByName,
  getIndexedRows,
  getValue,
  getValues,
  groupBy,
  isBlurred,
  orderBy,
  Row,
  selectColumns,
  separateBy,
} from '../chart-data-processor/table-processor';
import {
  applyFormatPlainText,
  getCompleteNumberFormatConfig,
} from '../chart-options-processor/translations/number-format-config';
import { type SortDirection } from '../types';
import { seriesDataColoringFunction } from './data-coloring';
import { CartesianChartData, CategoricalXValues, SeriesValueData } from './types';
import { isEnabled } from './utils';

export const validateCartesianChartDataOptions = (
  chartDataOptions: CartesianChartDataOptionsInternal,
): CartesianChartDataOptionsInternal => {
  const x = chartDataOptions.x.filter(({ enabled }) => isEnabled(enabled));
  const y = chartDataOptions.y.filter(({ enabled }) => isEnabled(enabled));
  // break by series column only when there is one y column
  const isBreakByAllowed = y.length === 1 && chartDataOptions.breakBy.length > 0;
  const breakBy = isBreakByAllowed ? chartDataOptions.breakBy : [];

  return {
    ...chartDataOptions,
    x,
    y,
    breakBy,
  };
};

/**
 * Creates cartesian data for chart like line/area/bar and others given table of data and options
 *
 * @param chartDataOptions - Internal cartesian chart data options
 * @param dataTable - Data table
 * @returns Cartesian chart data
 */
export const cartesianData = (
  dataOptions: CartesianChartDataOptionsInternal,
  dataTable: DataTable,
): CartesianChartData => {
  if (dataTable.rows.length === 0) {
    return { type: 'cartesian', series: [], xValues: [], xAxisCount: 0 };
  }

  // get various columns lists
  const xAxisCount: number = dataOptions.x.length;
  let xColumns: Column[] = getColumnsByName(
    dataTable,
    dataOptions.x.map(({ column: { name } }) => name),
  );
  // add direction of sorting
  xColumns = xColumns.map((c, index) => ({
    ...c,
    direction: sortDirection(dataOptions.x[index].sortType as SortDirection),
  }));
  const seriesColumns: Column[] = getColumnsByName(
    dataTable,
    dataOptions.breakBy.map(({ column: { name } }) => name),
  );

  const sortedMeasures = dataOptions.y.filter(
    ({ sortType }) => sortType && sortType !== 'sortNone',
  );

  const x1Index = xColumns.length > 1 ? 1 : 0;
  const xValuesOrdered = getOrderedXValues(
    dataTable,
    sortedMeasures,
    xColumns,
    xColumns[x1Index]?.direction === 0 ? rownumColumnName : undefined,
  );

  // only support multiple values or breakBy not both
  // interface prevents having a combination of both
  const yColumnNames: string[] = dataOptions.y.map(({ column: { name } }) => name);
  const chartData =
    dataOptions.breakBy.length > 0
      ? withBreakBy(
          dataTable,
          xValuesOrdered,
          xColumns,
          yColumnNames[0],
          seriesColumns,
          dataOptions.breakBy,
        )
      : withMultipleValues(dataTable, xValuesOrdered, xColumns, yColumnNames, dataOptions.y);

  const cartesianChartData: CartesianChartData = {
    ...chartData,
    xAxisCount,
    type: 'cartesian',
  };
  return cartesianChartData;
};

export const sortDirection = (sortType: SortDirection | undefined) => {
  switch (sortType) {
    case 'sortNone': // retain order from source data
      return 0;
    case 'sortDesc':
      return -1;
    case 'sortAsc':
    default: // undefined or explicit does ascending
      return 1;
  }
};

export const getOrderedXValues = (
  dataTable: DataTable,
  sortedMeasures: StyledMeasureColumn[],
  xColumns: Column[],
  rownumColumnName?: string,
): CategoricalXValues[] => {
  // handle special case, when there is no xAxis column
  // xValueOrdered should match index returned by getIndexedRows
  if (xColumns.length === 0) {
    return [{ key: '', xValues: [''], rawValues: [] }];
  }

  const measures: ColumnMeasure[] = sortedMeasures.map(({ column: { name } }) => ({
    column: name,
    agg: 'sum', // any ranking or ordering is by sum
    title: name,
  }));

  // check if source table has a $rownum for sorting
  // if no x specified, the results are going to be empty
  if (rownumColumnName) {
    // aggregate $rownum to min value default ordering of x1 axis
    const rownumMeasure = {
      column: rownumColumnName,
      title: rownumColumnName,
      agg: 'min',
    };
    measures.push(rownumMeasure);
  }

  // aggregate data table by X ignoring series
  const xValueTable = groupBy(dataTable, xColumns, measures);

  const sortColumns = [];
  let x1Index = 0;
  // first sort by X2 if X2 exists panels
  if (xColumns.length === 2) {
    x1Index = 1;
    const x2Index = 0;
    const x2Column = getColumnByName(xValueTable, xColumns[x2Index].name);
    if (x2Column) {
      sortColumns.push(x2Column);
    }
  }
  // optionally order by a value column
  sortedMeasures.map((v) => {
    const IValue = getColumnByName(xValueTable, v.column.name);
    if (IValue) {
      sortColumns.push({
        ...IValue,
        direction: v.sortType === 'sortAsc' ? 1 : -1,
      });
    }
    return v;
  });
  // if source is ordered, then it has priority over X1 column
  if (rownumColumnName) {
    const rownumColumn = getColumnByName(xValueTable, rownumColumnName);
    if (rownumColumn) {
      sortColumns.push(rownumColumn);
    }
  }
  // finally order by X1
  if (xColumns.length > 0) {
    const x1Column = getColumnByName(xValueTable, xColumns[x1Index].name);
    if (x1Column) {
      sortColumns.push(x1Column);
    }
  }

  // sort by sort columns
  const xValueTableOrdered = orderBy(xValueTable, sortColumns);

  // get only x value columns
  const xColumnOnly = getColumnsByName(
    xValueTableOrdered,
    xColumns.map((c) => c.name),
  );
  const orderedTable = selectColumns(xValueTableOrdered, xColumnOnly);

  // create list of key and array of xValues for each tic
  return orderedTable.rows.map((row) => {
    const values = getValues(row, orderedTable.columns);
    const displayValues = values.map((c) => c.displayValue);
    const rawValues = values.map((c) => c.rawValue ?? c.displayValue);
    const compareValues = values.map((c) => c?.compareValue?.value as number);
    const key = rawValues.join(',');
    return { key, xValues: displayValues, rawValues, compareValues: compareValues };
  });
};

/**
 * Get single series value for a row
 * taking into account whether the y-axis column is specified
 */
const getSingleSeriesValue = (
  row: Row,
  xValue: CategoricalXValues,
  yAggColumn: Column | undefined,
) => {
  // use a small value instead of 0 so pie chart can render
  const value = yAggColumn ? (getValue(row, yAggColumn) as number) : 0.00001;
  const { color, rawValue } = row[yAggColumn?.index ?? 0] ?? {};
  const normalizedValue = value === undefined ? NaN : value;

  return {
    // Fallback to computed value when rawValue is not available (e.g., sparse data)
    rawValue: rawValue ?? normalizedValue,
    xValue: xValue.rawValues,
    xDisplayValue: xValue.xValues,
    xCompareValue: xValue.compareValues,
    value: normalizedValue,
    blur: yAggColumn ? isBlurred(row, yAggColumn) : undefined,
    ...(color && { color }),
  };
};

/**
 * Builds series data for multiple measures without break by.
 * If there is no measure specified, returns series of 0 values.
 *
 * @param dataTable - Data table
 * @param xValuesOrdered - Ordered x-axis values
 * @param xColumns - x-axis columns
 * @param yColumnNames - y-axis column names
 * @returns series data
 */
const withMultipleValues = (
  dataTable: DataTable,
  xValuesOrdered: CategoricalXValues[],
  xColumns: Column[],
  yColumnNames: string[],
  yDataOptions: StyledMeasureColumn[],
) => {
  const yAggColumns =
    yColumnNames.length > 0 ? getColumnsByName(dataTable, yColumnNames) : [undefined];
  const optionsByColumn = yDataOptions.reduce<Record<string, StyledMeasureColumn>>((acc, opts) => {
    acc[opts.column.name] = opts;
    return acc;
  }, {});

  // separate rows by series
  const rowsByXColumns = getIndexedRows(dataTable.rows, xColumns);

  // for each value columns create a series
  const seriesValues = yAggColumns.map((yAggColumn) => {
    let seriesYValues = xValuesOrdered.map((xValue): SeriesValueData => {
      const rows = rowsByXColumns[xValue.key];
      // since we aggregated we know it is single number
      // expect one row or none
      const row = rows ? rows[0] : [];
      return getSingleSeriesValue(row, xValue, yAggColumn);
    });

    const yAggColumnName = yAggColumn?.name ?? '';
    const seriesTitle = yAggColumnName ? getDataOptionTitle(optionsByColumn[yAggColumnName]) : '';

    const colorOpts = optionsByColumn[yAggColumnName]?.color;
    if (colorOpts) {
      seriesYValues = seriesDataColoringFunction(seriesYValues, colorOpts);
    }

    return {
      name: yAggColumnName,
      title: seriesTitle,
      data: seriesYValues,
    };
  });

  return { xValues: xValuesOrdered, series: seriesValues };
};

const getSeriesName = (row: Row, columns: readonly Column[], breakBy: StyledColumn[]) => {
  // maybe format series value
  return getValues(row, columns)
    .map((data, index) => {
      const numberFormatConfig = getCompleteNumberFormatConfig(breakBy[index].numberFormatConfig);
      return isNumber(columns[index].type)
        ? applyFormatPlainText(numberFormatConfig, parseFloat(data.displayValue))
        : data.displayValue;
    })
    .join(',');
};

const getSeriesValues = (row: Row, columns: readonly Column[]) => {
  return getValues(row, columns).map(({ rawValue }) => rawValue);
};

/**
 * Builds series data for a single measure taking into break by.
 * If there is no measure specified, returns series of 0 values.
 *
 * @param dataTable - Data table
 * @param xValuesOrdered - Ordered x-axis values
 * @param xColumns - x-axis columns
 * @param yColumnName - y-axis column name
 * @param seriesColumns - series columns
 * @param breakBy - break by category
 * @returns series data
 */
const withBreakBy = (
  dataTable: DataTable,
  xValuesOrdered: CategoricalXValues[],
  xColumns: Column[],
  yColumnName: string,
  seriesColumns: Column[],
  breakBy: StyledColumn[],
) => {
  const yAggColumn = getColumnByName(dataTable, yColumnName);

  // separate rows by series
  const rowsBySeries = separateBy(dataTable.rows, seriesColumns);

  // for each series, index row by x column values
  const seriesRowsIndexByXValues = rowsBySeries.map((rows) => {
    const firstRow = rows[0];
    return {
      seriesName: getSeriesName(
        // all rows contain same series name
        firstRow,
        seriesColumns,
        breakBy,
      ),
      seriesValues: getSeriesValues(firstRow, seriesColumns),
      rowsByXColumns: getIndexedRows(rows, xColumns),
    };
  });

  // for each series create data list of value column
  const seriesValues = seriesRowsIndexByXValues.map((seriesRowsIndexed) => {
    const seriesYValues = xValuesOrdered.map((xValue): SeriesValueData => {
      const rows = seriesRowsIndexed.rowsByXColumns[xValue.key];
      // since we aggregated we know it is single number
      // expect one row or none
      const row = rows ? rows[0] : [];
      return getSingleSeriesValue(row, xValue, yAggColumn);
    });
    return {
      name: seriesRowsIndexed.seriesName,
      data: seriesYValues,
      custom: { rawValue: seriesRowsIndexed.seriesValues },
    };
  });

  return { xValues: xValuesOrdered, series: seriesValues };
};
