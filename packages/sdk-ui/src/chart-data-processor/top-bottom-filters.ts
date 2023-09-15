/* eslint-disable max-params */
import {
  DataTable,
  getColumnByName,
  getColumnValues,
  groupBy,
  orderBy,
  ComparableData,
} from './table-processor';

import { ExtendedDatePeriod, toPeriodCompareValue } from './data-table-date-period';

export const filtersTopBottomValues = (
  dataTable: DataTable,
  columnName: string,
  aggColumnName: string,
  limit: number,
  direction: 'top' | 'bottom',
): string[] => {
  const dir = direction === 'top' ? -1 : 1;

  const column = getColumnByName(dataTable, columnName);
  const aggColumn = getColumnByName(dataTable, aggColumnName);
  if (!column || !aggColumn) return [];

  const totalSales = {
    column: aggColumn.name,
    agg: 'sum',
    title: `$sortIndex`,
  };
  const groupByTable = groupBy(dataTable, [column], [totalSales]);

  const sortIndexColumn = getColumnByName(groupByTable, `$sortIndex`);
  const groupByColumn = getColumnByName(groupByTable, columnName);
  if (!sortIndexColumn || !groupByColumn) return [];

  sortIndexColumn.direction = dir;
  const sortedTable = orderBy(groupByTable, [sortIndexColumn, groupByColumn]);

  return getColumnValues(sortedTable, groupByColumn)
    .filter((v) => v)
    .slice(0, limit)
    .map((v) => v) as string[];
};

export const transformDateColumn = (
  dataTable: DataTable,
  columnName: string,
  period: ExtendedDatePeriod,
  locale: Locale,
): DataTable => {
  const column = getColumnByName(dataTable, columnName);
  if (!column) return dataTable;

  const transformDate = (data: ComparableData) => {
    const value = toPeriodCompareValue(period, data.displayValue, locale);
    return {
      displayValue: `${toPeriodCompareValue(period, data.displayValue, locale)}`,
      compareValue: {
        value,
        valueIsNaN: isNaN(value),
        valueUndefined: !data.displayValue,
      },
    } as ComparableData;
  };
  const rows = dataTable.rows.map((row) =>
    row.map((c, cindex) => (column.index === cindex ? transformDate(c) : c)),
  );
  return { columns: [...dataTable.columns], rows } as DataTable;
};
