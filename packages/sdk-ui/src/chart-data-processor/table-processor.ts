/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { RowComparator, createCompareValue } from './row-comparator';
import { isDatetime, isNumber } from '@ethings-os/sdk-data';
import { Distribution } from './distribution';
import { CategoricalDistribution } from './categorical-distribution';
import { parseISOWithTimezoneCheck } from '../utils/parseISOWithTimezoneCheck';

export type FilterTypes = 'greater' | 'lesser' | 'equal' | 'contains' | 'not equal';

export type Value = string | number;

export type BooleanOperator = 'or' | 'and';

export type CompareValue = {
  value: Value;
  valueUndefined: boolean;
  valueIsNaN: boolean;
  lowercaseValue?: string;
};

export type ComparableData = {
  readonly displayValue: string;
  compareValue?: CompareValue;
  rawValue?: string | number;
  blur?: boolean;
  color?: string;
};

export type Row = readonly ComparableData[];

export type Column = {
  readonly name: string;
  readonly type: string;
  readonly index: number;
  direction: number;
};

export type DataTable = {
  readonly columns: readonly Column[];
  readonly rows: readonly Row[];
};

export type ColumnMeasure = {
  readonly column: string;
  readonly agg: string;
  readonly title: string;
};
export type AggregationColumn = {
  readonly aggFunc: string;
  readonly aggName: string;
  readonly column: Column;
};

export type IndexedRows = { [key: string]: Row[] };

// methods prefixed with underscore should never be exported
const _orderBy = (rows: readonly Row[], rowComparator: RowComparator) => {
  return rows.slice(0).sort((a: Row, b: Row) => rowComparator.compare(a, b));
};

export const separateBy = (rows: readonly Row[], separateByColumns: Column[]) => {
  if (!(rows && rows.length > 0)) {
    return [];
  }

  const rowComparator = new RowComparator(separateByColumns);
  const sortedRows = _orderBy(rows, rowComparator);

  let rowGroup = [];
  const allGroups = [];
  let prevRow = sortedRows[0];
  for (const row of Array.from(sortedRows)) {
    if (rowComparator.compare(row, prevRow) !== 0) {
      allGroups.push(rowGroup);
      rowGroup = [];
    }
    rowGroup.push(row);
    prevRow = row;
  }
  allGroups.push(rowGroup);
  return allGroups;
};

const _getAggregatedValues = (
  rows: Row[],
  aggregationColumns: AggregationColumn[],
): ComparableData[] => {
  const row: ComparableData[] = [];
  for (const aggregationColumn of aggregationColumns) {
    let value: number;
    const col = aggregationColumn.column;
    const { aggFunc } = aggregationColumn;

    //TODO will need to handle invalid floats
    const dataArray = rows.filter((r) => !!r[col.index] && r[col.index].displayValue !== '');

    // retain first color
    const color = dataArray.find((row) => row !== undefined && row?.[col.index]?.color)?.[col.index]
      ?.color;

    // any points are blur, then keep blur
    const blur = dataArray.some((row) => row[col.index].blur);

    if (isDatetime(col.type)) {
      const data = dataArray.map((r) =>
        parseISOWithTimezoneCheck(r[col.index].displayValue).valueOf(),
      );
      value = new Distribution(data).getStat(aggFunc);
    } else if (isNumber(col.type)) {
      // maybe want to use value if it exists before parsing displayValue
      const data = dataArray.map((r) => parseFloat(r[col.index].displayValue));
      value = new Distribution(data).getStat(aggFunc);
    } else {
      const categoricalData = dataArray.map((r) => r[col.index].displayValue);
      value = new CategoricalDistribution(categoricalData).getStat(aggFunc);
    }
    row.push({
      displayValue: `${value}`,
      ...(color && { color }),
      ...(blur && { blur }),
    });
  }
  return row;
};

export const orderBy = (table: DataTable, sortColumns: readonly Column[]) => {
  if (emptyTable(table)) {
    return { columns: [], rows: [] };
  }
  const rowComparator = new RowComparator(sortColumns);
  return { columns: table.columns, rows: _orderBy(table.rows, rowComparator) };
};

export const groupBy = (
  table: DataTable,
  groupByColumns: Column[],
  aggregationColumns: ColumnMeasure[],
) => {
  if (emptyTable(table)) {
    return { rows: [], columns: [] };
  }

  // find columns
  const columnNotFound = { name: 'n/a', type: 'n/a', index: -1, direction: 0 };
  const aggColumnsWithIndex: AggregationColumn[] = aggregationColumns
    .map((c) => {
      return {
        aggFunc: c.agg,
        aggName: c.title,
        column: getColumnByName(table, c.column) || columnNotFound,
      };
    })
    .filter((c) => c.column.index !== -1);

  const allGroups = separateBy(table.rows, groupByColumns);
  const aggNames = aggColumnsWithIndex.map((c) => c.aggName);
  const rows = [];
  for (const group of allGroups) {
    const groupByTitle = getValues(group[0], groupByColumns);
    const aggregationValues = _getAggregatedValues(group, aggColumnsWithIndex);
    const row = groupByTitle.slice(0).concat(aggregationValues);
    rows.push(row);
  }
  const columns: Column[] = groupByColumns.slice(0).concat(
    aggNames.map((name) => {
      return {
        name: name,
        type: 'number',
        index: 0,
        direction: 0,
      };
    }),
  );
  return {
    rows,
    columns: columns.map((c, i) => {
      return { ...c, index: i };
    }),
  };
};

export const getColumnByName = (table: DataTable, name: string) => {
  return table.columns.find((column) => column.name === name);
};

export const getColumnsByName = (table: DataTable, names: string[]): Column[] => {
  const undefinedColumn = {
    name: 'foo',
    type: 'string',
    index: -1,
    direction: 0,
  };
  return names
    .map((name) => getColumnByName(table, name) || undefinedColumn)
    .filter((c) => c !== undefinedColumn);
};

export const selectColumns = (table: DataTable, selectColumns: Column[]) => {
  const newRows = table.rows.map((row) => {
    return selectColumns.map((col) => row[col.index]);
  });
  const newColumns = selectColumns.map((c, index) => {
    return { ...c, index: index };
  });
  return { columns: newColumns, rows: newRows };
};

export const filterBy = (
  table: DataTable,
  filterColumns: Column[],
  filterValues: Value[],
  filterTypes: FilterTypes[],
  caseInsensitive = true,
  booleanOperator: BooleanOperator = 'and',
) => {
  const filteredRows = table.rows.filter((row) => {
    const matches = filterColumns.filter((column, index) => {
      let filterValue = filterValues[index];
      const filterType = filterTypes[index];
      let displayValue = row[column.index].displayValue;

      if (caseInsensitive && typeof filterValue === 'string') {
        displayValue = displayValue.toLowerCase();
        filterValue = filterValue.toLowerCase();
      }

      const value = createCompareValue(displayValue, column.type).value;
      switch (filterType) {
        case 'contains':
          if (typeof filterValue !== 'string') {
            return false;
          }
          return displayValue.includes(filterValue);
        case 'equal':
          return value === filterValue;
        case 'lesser':
          return value < filterValue;
        case 'greater':
          return value > filterValue;
        case 'not equal':
          return value !== filterValue;
        default:
          return false;
      }
    });
    return booleanOperator === 'and'
      ? // AND
        matches.length === filterColumns.length
      : // OR
        matches.length > 0;
  });
  return {
    columns: table.columns,
    rows: filteredRows,
  };
};

export const getValue = (row: Row, column: Column) => {
  if (!(row && column.index < row.length)) return undefined;
  const data = row[column.index];
  if (!data.compareValue) data.compareValue = createCompareValue(data.displayValue, column.type);
  return data.compareValue.value;
};

export const isBlurred = (row: Row, column: Column): boolean | undefined => {
  return row[column.index]?.blur;
};

export const getValues = (row: Row, columns: readonly Column[]): ComparableData[] => {
  const values = [];
  for (const col of columns) {
    values.push(row[col.index]);
  }
  return values;
};

export const getValuesAsString = (row: Row, columns: readonly Column[]) => {
  return getValues(row, columns)
    .map((c) => c.rawValue || c.displayValue)
    .join(',');
};

export const getIndexedRows = (rows: readonly Row[], indexColumns: Column[]): IndexedRows => {
  if (!(rows && rows.length > 0)) {
    return {};
  }
  const allGroups = separateBy(rows, indexColumns);
  const indexedRows: IndexedRows = {};
  for (const group of allGroups) {
    const groupByTitle: string = getValuesAsString(group[0], indexColumns);
    indexedRows[groupByTitle] = group;
  }

  return indexedRows;
};

export const getDistinctTable = (table: DataTable, distinctColumns: Column[]) => {
  if (emptyTable(table)) {
    return { rows: [], columns: [] };
  }

  const allGroups = separateBy(table.rows, distinctColumns);
  const rows: Row[] = [];
  for (const group of Array.from(allGroups)) {
    const distinctValues = getValues(group[0], distinctColumns);
    rows.push(distinctValues);
  }
  const columns = distinctColumns.map((c, i) => {
    return { ...c, index: i };
  });
  return { rows, columns: columns };
};

export const getColumnValues = (table: DataTable, column: Column) => {
  return table.rows.map((r) => getValue(r, column));
};

export const emptyTable = (table: DataTable) => {
  return !(table.rows && table.columns && table.rows.length > 0 && table.columns.length > 0);
};

export const limitRows = (table: DataTable, limit: number) => {
  if (emptyTable(table)) {
    return { columns: [], rows: [] };
  }
  return { columns: [...table.columns], rows: table.rows.slice(0, limit) };
};

export const innerJoin = (table: DataTable, joinTable: DataTable, joinKeys: string[]) => {
  if (emptyTable(table)) {
    return { rows: [], columns: [] };
  }
  if (emptyTable(joinTable)) {
    return { rows: [], columns: [] };
  }
  const tableJoinColumns = getColumnsByName(table, joinKeys);
  const joinColumns = getColumnsByName(joinTable, joinKeys);
  const joinGroups = separateBy(joinTable.rows, joinColumns);
  const joinHash: { [key: string]: Row[] } = {};
  joinGroups.forEach((group) => {
    const hashKey = getValuesAsString(group[0], joinColumns);
    joinHash[hashKey] = group;
  });

  const newRows: Row[] = [];
  const existingColumnNames = table.columns.map((c) => c.name);
  const additionalColumns = joinTable.columns.filter((c) => !existingColumnNames.includes(c.name));

  table.rows.forEach((row) => {
    const hashKey = getValuesAsString(row, tableJoinColumns);
    const joinRows = joinHash[hashKey] ?? [];
    joinRows.forEach((joinRow) => {
      const addValues: ComparableData[] = [];
      additionalColumns.forEach((col) => {
        addValues.push(joinRow[col.index]);
      });
      newRows.push([...row, ...addValues]);
    });
  });

  // create new columns
  const newColumns = [
    ...table.columns,
    ...additionalColumns.map((column, index) => ({
      ...column,
      index: table.columns.length + index,
    })),
  ];

  return { rows: newRows, columns: newColumns };
};
