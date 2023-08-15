/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */
/* eslint-disable max-params */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable sonarjs/no-ignored-return */
/* eslint-disable max-lines */
import {
  getColumnsByName,
  separateBy,
  getIndexedRows,
  orderBy,
  getColumnByName,
  getValue,
  Column,
  DataTable,
  getValues,
  groupBy,
  selectColumns,
  ColumnMeasure,
  isBlurred,
  Row,
} from '../chart-data-processor/table_processor';
import { rownumColumnName } from '../chart-data-processor/table_creators';
import { SeriesValueData, CartesianChartData, CategoricalXValues } from './types';
import { CartesianChartDataOptionsInternal, Category, Value } from '../chart-data-options/types';
import { isEnabled } from './utils';
import { isNumber } from '@sisense/sdk-data';
import { applyFormatPlainText } from '../chart-options-processor/translations/number_format_config';
import { seriesDataColorService } from './series-data-color-service';
import { SortDirection } from '../types';
import { getDataOptionTitle } from '../chart-data-options/utils';

//TODO we need to handle enabled
export const validateCartesianChartDataOptions = (
  chartDataOptions: CartesianChartDataOptionsInternal,
): CartesianChartDataOptionsInternal => {
  const x = chartDataOptions.x.filter((x) => isEnabled(x.enabled));
  const y = chartDataOptions.y.filter((value) => isEnabled(value.enabled));
  // break by series column only when there is one y column
  const breakByChart = y.length === 1 && chartDataOptions.breakBy.length > 0;
  const breakBy = breakByChart ? chartDataOptions.breakBy : [];

  return {
    ...chartDataOptions,
    x,
    y,
    breakBy,
  };
};

// Given table of data and options, create cartesian data for
// chart like line/area/bar and others
export const cartesianData = (
  chartDataOptions: CartesianChartDataOptionsInternal,
  dataTable: DataTable,
): CartesianChartData => {
  if (dataTable.rows.length === 0) {
    return { type: 'cartesian', series: [], xValues: [], xAxisCount: 0 };
  }
  const options = chartDataOptions;

  // get various columns lists
  const xAxisCount: number = options.x.length;
  let xColumns: Column[] = getColumnsByName(
    dataTable,
    options.x.map((x) => x.name),
  );
  // add direction of sorting
  xColumns = xColumns.map((c, index) => ({
    ...c,
    direction: sortDirection(options.x[index].sortType),
  }));
  const seriesColumns: Column[] = getColumnsByName(
    dataTable,
    options.breakBy.map((s) => s.name),
  );

  const sortedMeasures = options.y.filter((y) => y?.sortType && y.sortType !== 'sortNone');

  const x1Index = xColumns.length > 1 ? 1 : 0;
  const xValuesOrdered = getOrderedXValues(
    dataTable,
    sortedMeasures,
    xColumns,
    xColumns[x1Index]?.direction === 0 ? rownumColumnName : undefined,
  );

  // only support multiple values or breakBy not both
  // interface prevents having a combination of both
  const yColumnNames: string[] = options.y.map((value) => value.name);
  const chartData =
    options.breakBy.length > 0
      ? withBreakBy(
          dataTable,
          xValuesOrdered,
          xColumns,
          yColumnNames[0],
          seriesColumns,
          options.breakBy,
        )
      : withMultipleValues(dataTable, xValuesOrdered, xColumns, yColumnNames, options.y);

  const cartesianChartData: CartesianChartData = {
    ...chartData,
    xAxisCount,
    type: 'cartesian',
  };
  return cartesianChartData;
};

const sortDirection = (sortType: SortDirection | undefined) => {
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

const getOrderedXValues = (
  dataTable: DataTable,
  sortedMeasures: Value[],
  xColumns: Column[],
  rownumColumnName?: string,
): CategoricalXValues[] => {
  // handle special case, when there is no xAxis column
  // xValueOrdered should match index returned by getIndexedRows
  if (xColumns.length === 0) {
    return [{ key: '', xValues: [''], rawValues: [] }];
  }

  const measures: ColumnMeasure[] = sortedMeasures.map((sv) => ({
    column: sv.name,
    agg: 'sum', // any ranking or ordering is by sum
    title: sv.name,
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
    const IValue = getColumnByName(xValueTable, v.name);
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
    const key = displayValues.join(',');
    return { key, xValues: displayValues, rawValues, compareValues: compareValues };
  });
};

const withMultipleValues = (
  dataTable: DataTable,
  xValuesOrdered: CategoricalXValues[],
  xColumns: Column[],
  yColumnNames: string[],
  yDataOptions: Value[],
) => {
  const yAggColumns = getColumnsByName(dataTable, yColumnNames);
  const optionsByColumn = yDataOptions.reduce<Record<string, Value>>((acc, opts) => {
    acc[opts.name] = opts;
    return acc;
  }, {});

  // require at least one measure
  if (yAggColumns.length === 0) {
    return { type: 'cartesian', series: [], xValues: [] };
  }

  // separate rows by series
  const rowsByXColumns = getIndexedRows(dataTable.rows, xColumns);

  // for each value columns create a series
  const seriesValues = yAggColumns.map((yAggColumn) => {
    let seriesYValues = xValuesOrdered.map((xValue): SeriesValueData => {
      const rows = rowsByXColumns[xValue.key];
      // since we aggregated we know it is single number
      // expect one row or none
      const row = rows ? rows[0] : [];
      const value = getValue(row, yAggColumn) as number;
      const { color, rawValue } = row[yAggColumn.index] ?? {};
      return {
        rawValue,
        xValue: xValue.rawValues,
        xDisplayValue: xValue.xValues,
        xCompareValue: xValue.compareValues,
        value: value === undefined ? NaN : value,
        blur: isBlurred(row, yAggColumn),
        ...(color && { color }),
      };
    });

    const colorOpts = optionsByColumn[yAggColumn.name].color;
    if (colorOpts) {
      seriesYValues = seriesDataColorService(seriesYValues, colorOpts);
    }

    return {
      name: yAggColumn.name,
      title: getDataOptionTitle(optionsByColumn[yAggColumn.name]),
      data: seriesYValues,
    };
  });

  return { xValues: xValuesOrdered, series: seriesValues };
};

const getSeriesName = (row: Row, columns: readonly Column[], breakBy: Category[]) => {
  // maybe format series value
  return getValues(row, columns)
    .map((data, index) => {
      const numberFormatConfig = breakBy[index].numberFormatConfig;
      return isNumber(columns[index].type) && numberFormatConfig
        ? applyFormatPlainText(numberFormatConfig, parseFloat(data.displayValue))
        : data.displayValue;
    })
    .join(',');
};

const getSeriesValues = (row: Row, columns: readonly Column[]) => {
  return getValues(row, columns).map(({ rawValue }) => rawValue);
};

const withBreakBy = (
  dataTable: DataTable,
  xValuesOrdered: CategoricalXValues[],
  xColumns: Column[],
  yColumnName: string,
  seriesColumns: Column[],
  breakBy: Category[],
) => {
  const yAggColumn = getColumnByName(dataTable, yColumnName);

  // require a measure
  if (!yAggColumn) {
    return { type: 'cartesian', series: [], xValues: [] };
  }

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
      const row = rows ? rows[0] : [];
      // since we aggregated, expect one row or none
      const value = getValue(row, yAggColumn) as number;
      const { color, rawValue } = row[yAggColumn.index] ?? {};
      return {
        rawValue,
        value: value === undefined ? NaN : value,
        xValue: xValue.rawValues,
        xDisplayValue: xValue.xValues,
        xCompareValue: xValue.compareValues,
        blur: isBlurred(row, yAggColumn),
        ...(color && { color }),
      };
    });
    return {
      name: seriesRowsIndexed.seriesName,
      data: seriesYValues,
      custom: { rawValue: seriesRowsIndexed.seriesValues },
    };
  });

  return { xValues: xValuesOrdered, series: seriesValues };
};
