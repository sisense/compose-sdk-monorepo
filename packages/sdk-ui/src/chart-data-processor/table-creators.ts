/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable sonarjs/no-identical-functions */
import { Cell, Data, isDatetime } from '@sisense/sdk-data';
import { createCompareValue } from './row-comparator';
import { ComparableData, DataTable } from './table-processor';
import { NOT_AVAILABLE_DATA_VALUE } from '@/const';

// for item table, index of original source of data is stored
// in a column, and it is not changed by filtering or sorting
export const itemIndexColumnName = '$itemIndex';

export type TableColumn = {
  readonly name: string;
  readonly type: string;
};

// DataTable corresponds to the generated JAQLQueryResult
export type TableData = {
  columns: readonly TableColumn[];
  rows: readonly (readonly string[])[];
};

export const createSortableTable = (tableData: TableData) => {
  const columns = tableData.columns.map((c) => {
    return { name: c.name, type: c.type };
  });
  const rows = tableData.rows;
  return createSortableFromColumnsRows(columns, rows);
};

export const createSortableFromColumnsRows = (
  columns: TableData['columns'],
  rows: TableData['rows'],
  rownumColumn?: string,
) => {
  let rownum = 0;
  const sortableRows = rows.map((row) => {
    const sortableRow = columns.map((column, index) => {
      return {
        displayValue: row[index] || '',
      };
    });
    if (rownumColumn) {
      sortableRow.push({
        displayValue: `${rownum++}`,
      });
    }
    return sortableRow;
  });
  const sortableColumns = columns.map((column, index) => {
    return {
      name: column.name,
      type: column.type,
      index: index,
      direction: 0,
    };
  });
  if (rownumColumn) {
    sortableColumns.push({
      name: rownumColumn,
      type: 'number',
      index: sortableColumns.length,
      direction: 0,
    });
  }
  return {
    columns: sortableColumns,
    rows: sortableRows,
  };
};

type RowValue = Data['rows'][number][number];
export const isCell = (rowValue: RowValue): rowValue is Cell => {
  return rowValue instanceof Object && 'data' in rowValue;
};

export const isDataTableEmpty = (dataTable: DataTable): boolean => {
  return dataTable.rows.length === 0;
};

export const rownumColumnName = '$rownum';

// eslint-disable-next-line max-lines-per-function
export const createDataTableFromData = (data: Data): DataTable => {
  let rownum = 0;
  const sortableRows = data.rows.map((row) => {
    const sortableRow = data.columns.map((column, index): ComparableData => {
      const rowValue = row[index];
      if (isCell(rowValue)) {
        let convertableValue = rowValue.data.toString();
        // when date uses time aggregate (e.g. 15min), then ignore the date
        if (isDatetime(column.type)) {
          const aggDatePrefix = '1111-11-11T';
          const epocZeroDate = '1970-01-01T';
          if (convertableValue.startsWith(aggDatePrefix)) {
            convertableValue = convertableValue.replace(aggDatePrefix, epocZeroDate);
          }
        }
        return {
          rawValue: rowValue.data,
          displayValue: rowValue.text ?? convertableValue,
          compareValue: createCompareValue(convertableValue, column.type),
          ...(rowValue.blur !== undefined ? { blur: rowValue.blur } : {}),
          ...(rowValue.color ? { color: rowValue.color } : {}),
        };
      }
      let compareValue;
      let rawValue;
      if (isDatetime(column.type)) {
        if (rowValue === NOT_AVAILABLE_DATA_VALUE) {
          compareValue = { value: rowValue, valueUndefined: false, valueIsNaN: true };
          rawValue = rowValue;
        } else {
          compareValue = createCompareValue(`${rowValue}`, column.type);
          rawValue = new Date(compareValue.value).toISOString();
        }
      }
      return {
        rawValue: rawValue ?? rowValue,
        displayValue: `${rowValue ?? ''}`,
        compareValue,
      };
    });
    if (rownumColumnName) {
      rownum++;
      sortableRow.push({
        displayValue: `${rownum}`,
        rawValue: rownum,
      });
    }
    return sortableRow;
  });
  const sortableColumns = data.columns.map((column, index) => {
    return {
      name: column.name,
      type: column.type,
      index: index,
      direction: 0,
    };
  });
  if (rownumColumnName) {
    sortableColumns.push({
      name: rownumColumnName,
      type: 'number',
      index: sortableColumns.length,
      direction: 0,
    });
  }
  return {
    columns: sortableColumns,
    rows: sortableRows,
  };
};
