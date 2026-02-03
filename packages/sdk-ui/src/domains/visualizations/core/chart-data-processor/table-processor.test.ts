/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable max-params */
import parseISO from 'date-fns/parseISO';
import cloneDeep from 'lodash-es/cloneDeep';

import { createSortableTable, TableData } from './table-creators.js';
import {
  BooleanOperator,
  Column,
  DataTable,
  filterBy,
  FilterTypes,
  getColumnsByName,
  getDistinctTable,
  getIndexedRows,
  getValuesAsString,
  groupBy,
  innerJoin,
  limitRows,
  orderBy,
  selectColumns,
} from './table-processor.js';

const tableData: TableData = {
  columns: [
    {
      name: 'rownum',
      type: 'integer',
    },
    {
      name: 'col_string',
      type: 'varchar',
    },
    {
      name: 'col_date',
      type: 'datetime',
    },
    {
      name: 'col_number',
      type: 'number',
    },
    {
      name: 'col_string2',
      type: 'varchar',
    },
    {
      name: 'col_string3',
      type: 'varchar',
    },
  ],
  rows: [
    ['0', 'a', '2019-02-20T00:00:00Z', '1.618', 'x', 'san'],
    ['1', 'a', '2019-01-20T00:00:00Z', '42.0', 'x', 'San'],
    ['2', 'z', '2019-01-10T00:00:00Z', '3.14', 'x', 'SAN'],
    ['3', 'z', '2019-01-05T00:00:00Z', '', 'x', 'san diego'],
    ['4', 'z', '2019-01-08T00:00:00Z', 'a', 'x', 'san Diego'],
  ],
};

const baseTable: DataTable = createSortableTable({
  columns: [
    {
      name: 'category',
      type: 'varchar',
    },
    {
      name: 'region',
      type: 'varchar',
    },
    {
      name: 'sales',
      type: 'number',
    },
  ],
  rows: [
    ['Technology', 'East', '2.0'],
    ['Furniture', 'East', '1.0'],
    ['Office Supplies', 'East', '1.0'],
    ['Home Supplies', 'East', '1.0'],
    ['Furniture', 'Central', '1.0'],
    ['Office Supplies', 'Central', '1.0'],
    ['Home Supplies', 'Central', '1.0'],
    ['Technology', 'Central', '1.0'],
    ['Furniture', 'South', '1.0'],
    ['Office Supplies', 'South', '1.0'],
    ['Home Supplies', 'South', '1.0'],
    ['Technology', 'South', '1.0'],
    ['Technology', 'West', '2.0'],
    ['Furniture', 'West', '2.0'],
    ['Office Supplies', 'West', '2.0'],
    ['Home Supplies', 'West', '1.0'],
  ],
});

const joinTable: DataTable = createSortableTable({
  columns: [
    {
      name: 'category',
      type: 'varchar',
    },
    {
      name: 'subcategory',
      type: 'varchar',
    },
  ],
  rows: [
    ['Technology', 'Hi Tech'],
    ['Furniture', 'Low Tech'],
  ],
});

const sortableTable = createSortableTable(tableData);
const rownumColumnIndex = 0;
const varcharColumnIndex = 1;
const datetimeColumnIndex = 2;
const numberColumnIndex = 3;
const varchar2ColumnIndex = 4;
const varchar3ColumnIndex = 5;

const rownumOrderAfterOrderBy = (sortByColumns: Column[]) => {
  const dateSortableTable = orderBy(sortableTable, sortByColumns);
  return dateSortableTable.rows.map((row) => row[rownumColumnIndex].displayValue);
};

const rownumOrderAfterFilterBy = (
  filterColumns: Column[],
  filterValues: any,
  filterTypes: FilterTypes[],
  filterBooleanOperator?: BooleanOperator,
) => {
  const dateSortableTable = filterBy(
    sortableTable,
    filterColumns,
    filterValues,
    filterTypes,
    true,
    filterBooleanOperator,
  );
  return dateSortableTable.rows.map((row) => row[rownumColumnIndex].displayValue);
};

describe('Table Processor', () => {
  it('sort table by date column', () => {
    const rownumOrder = rownumOrderAfterOrderBy([sortableTable.columns[datetimeColumnIndex]]);
    expect(rownumOrder).toEqual(['3', '4', '2', '1', '0']);
  });

  it('sort table by varchar column', () => {
    const rownumOrder = rownumOrderAfterOrderBy([sortableTable.columns[varcharColumnIndex]]);
    expect(rownumOrder).toEqual(['0', '1', '2', '3', '4']);
  });

  it('sort table by varchar column #3 in correct order ("case-insensitive" first, then "case-sensitive" for equal strings)', () => {
    const rownumOrder = rownumOrderAfterOrderBy([sortableTable.columns[varchar3ColumnIndex]]);
    expect(rownumOrder).toEqual(['2', '1', '0', '4', '3']);
  });

  it('sort table by number column', () => {
    const rownumOrder = rownumOrderAfterOrderBy([sortableTable.columns[numberColumnIndex]]);
    expect(rownumOrder).toEqual(['0', '2', '1', '4', '3']);
  });

  it('sort table by multiple column', () => {
    const varcharColumn = sortableTable.columns[varcharColumnIndex];
    const dateColumn = sortableTable.columns[datetimeColumnIndex];
    const rownumOrder = rownumOrderAfterOrderBy([varcharColumn, dateColumn]);
    expect(rownumOrder).toEqual(['1', '0', '3', '4', '2']);
  });

  it('sort table by multiple column with reverse direction', () => {
    const varcharColumn = sortableTable.columns[varcharColumnIndex];
    varcharColumn.direction = -1;
    const dateColumn = sortableTable.columns[datetimeColumnIndex];
    dateColumn.direction = -1;
    const rownumOrder = rownumOrderAfterOrderBy([varcharColumn, dateColumn]);
    expect(rownumOrder).toEqual(['2', '4', '3', '0', '1']);
  });

  describe('case insensitive', () => {
    const filterTypes: FilterTypes[] = ['contains'];

    it('filters by `string contains` with capitalized filterValue', () => {
      const varcharColumn = sortableTable.columns[varcharColumnIndex];
      const filterColumns: Column[] = [varcharColumn];
      const filterValues: any[] = ['A']; // Capitalized value

      const rownumOrder = rownumOrderAfterFilterBy(filterColumns, filterValues, filterTypes);
      expect(rownumOrder).toEqual(['0', '1']);
    });

    it('filters by `string contains` with capitalized displayValue', () => {
      const copiedSortableTable = JSON.parse(JSON.stringify(sortableTable));

      copiedSortableTable.rows[varcharColumnIndex] = [
        { displayValue: '1' },
        { displayValue: 'A' }, // Capitalized value
        { displayValue: '2019-01-20T00:00:00Z' },
        { displayValue: '42.0' },
        { displayValue: 'x' },
      ];

      const varcharColumn = copiedSortableTable.columns[varcharColumnIndex];
      const filterColumns: Column[] = [varcharColumn];
      const filterValues: any[] = ['a'];

      const rownumOrder = rownumOrderAfterFilterBy(filterColumns, filterValues, filterTypes);
      expect(rownumOrder).toEqual(['0', '1']);
    });
  });

  it('filter by string contains', () => {
    const varcharColumn = sortableTable.columns[varcharColumnIndex];
    const filterColumns: Column[] = [varcharColumn];
    const filterValues: any[] = ['a'];
    const filterTypes: FilterTypes[] = ['contains'];
    const rownumOrder = rownumOrderAfterFilterBy(filterColumns, filterValues, filterTypes);
    expect(rownumOrder).toEqual(['0', '1']);
  });

  it('filter by string equal', () => {
    const varcharColumn = sortableTable.columns[varcharColumnIndex];
    const filterColumns: Column[] = [varcharColumn];
    const filterValues: any[] = ['z'];
    const filterTypes: FilterTypes[] = ['equal'];
    const rownumOrder = rownumOrderAfterFilterBy(filterColumns, filterValues, filterTypes);
    expect(rownumOrder).toEqual(['2', '3', '4']);
  });

  it('filter by number equal', () => {
    const numberColumn = sortableTable.columns[numberColumnIndex];
    const filterColumns: Column[] = [numberColumn];
    const filterValues: any[] = [1.618];
    const filterTypes: FilterTypes[] = ['equal'];
    const rownumOrder = rownumOrderAfterFilterBy(filterColumns, filterValues, filterTypes);
    expect(rownumOrder).toEqual(['0']);
  });

  it('filter by string not equal', () => {
    const varcharColumn = sortableTable.columns[varcharColumnIndex];
    const filterColumns: Column[] = [varcharColumn];
    const filterValues: any[] = ['z'];
    const filterTypes: FilterTypes[] = ['not equal'];
    const rownumOrder = rownumOrderAfterFilterBy(filterColumns, filterValues, filterTypes);
    expect(rownumOrder).toEqual(['0', '1']);
  });

  it('filter by number not equal', () => {
    const numberColumn = sortableTable.columns[numberColumnIndex];
    const filterColumns: Column[] = [numberColumn];
    const filterValues: any[] = [1.618];
    const filterTypes: FilterTypes[] = ['not equal'];
    const rownumOrder = rownumOrderAfterFilterBy(filterColumns, filterValues, filterTypes);
    expect(rownumOrder).toEqual(['1', '2', '3', '4']);
  });

  it('filter by number lesser', () => {
    const numberColumn = sortableTable.columns[numberColumnIndex];
    const filterColumns: Column[] = [numberColumn];
    const filterValues: any[] = [40.0];
    const filterTypes: FilterTypes[] = ['lesser'];
    const rownumOrder = rownumOrderAfterFilterBy(filterColumns, filterValues, filterTypes);
    expect(rownumOrder).toEqual(['0', '2']);
  });

  it('filter by number greater', () => {
    const numberColumn = sortableTable.columns[numberColumnIndex];
    const filterColumns: Column[] = [numberColumn];
    const filterValues: any[] = [40.0];
    const filterTypes: FilterTypes[] = ['greater'];
    const rownumOrder = rownumOrderAfterFilterBy(filterColumns, filterValues, filterTypes);
    expect(rownumOrder).toEqual(['1']);
  });

  it('filter by date equal', () => {
    const dateValue = parseISO('2019-01-20T00:00:00Z').valueOf();
    const datetimeColumn = sortableTable.columns[datetimeColumnIndex];
    const filterColumns: Column[] = [datetimeColumn];
    const filterValues: any[] = [dateValue];
    const filterTypes: FilterTypes[] = ['equal'];
    const rownumOrder = rownumOrderAfterFilterBy(filterColumns, filterValues, filterTypes);
    expect(rownumOrder).toEqual(['1']);
  });

  it('filter by contains and filter by number greater with OR operator', () => {
    const varcharColumn = sortableTable.columns[varcharColumnIndex];
    const numberColumn = sortableTable.columns[numberColumnIndex];
    const filterColumns: Column[] = [varcharColumn, numberColumn];
    const filterValues: any[] = ['a', 40.0];
    const filterTypes: FilterTypes[] = ['contains', 'lesser'];
    const rownumOrder = rownumOrderAfterFilterBy(filterColumns, filterValues, filterTypes, 'or');
    expect(rownumOrder).toEqual(['0', '1', '2']);
  });

  it('filter by contains and filter by number greater with AND operator', () => {
    const varcharColumn = sortableTable.columns[varcharColumnIndex];
    const numberColumn = sortableTable.columns[numberColumnIndex];
    const filterColumns: Column[] = [varcharColumn, numberColumn];
    const filterValues: any[] = ['a', 40.0];
    const filterTypes: FilterTypes[] = ['contains', 'lesser'];
    const rownumOrder = rownumOrderAfterFilterBy(filterColumns, filterValues, filterTypes, 'and');
    expect(rownumOrder).toEqual(['0']);
  });

  it('group by and aggregate table', () => {
    const varcharColumn = sortableTable.columns[varcharColumnIndex];
    const numberColumn = sortableTable.columns[numberColumnIndex];
    const aggColumn = {
      column: numberColumn.name,
      agg: 'sum',
      title: `Total ${numberColumn.name}`,
    };
    const groupByTable = orderBy(groupBy(sortableTable, [varcharColumn], [aggColumn]), [
      varcharColumn,
    ]);
    expect(groupByTable.columns).toHaveLength(2);
    expect(groupByTable.rows).toHaveLength(2);
    expect(groupByTable.columns.map((c) => c.name)).toEqual(['col_string', 'Total col_number']);
    expect(groupByTable.columns[0].name).toEqual(varcharColumn.name);
    expect(groupByTable.columns[0].index).toBe(0);
    expect(groupByTable.columns[1].name).toBe(`Total ${numberColumn.name}`);
    expect(groupByTable.columns[1].index).toBe(1);
    expect(groupByTable.rows.map((r) => r[0].displayValue)).toEqual(['z', 'a']);
    expect(groupByTable.rows.map((r) => r[1].displayValue)).toEqual(['NaN', '43.618']);
  });

  it('aggregate retains color and blur', () => {
    const newTable = cloneDeep(sortableTable);
    const varcharColumn = newTable.columns[varcharColumnIndex];
    const numberColumn = newTable.columns[numberColumnIndex];
    newTable.rows = newTable.rows.map((r, rowIndex) =>
      r.map((c, colIndex) =>
        rowIndex === 1 && colIndex === numberColumnIndex ? { ...c, blur: true, color: 'red' } : c,
      ),
    );
    const aggColumn = {
      column: numberColumn.name,
      agg: 'sum',
      title: `Total ${numberColumn.name}`,
    };
    const groupByTable = orderBy(groupBy(newTable, [varcharColumn], [aggColumn]), [varcharColumn]);
    expect(groupByTable.columns).toHaveLength(2);
    expect(groupByTable.rows).toHaveLength(2);
    expect(groupByTable.columns.map((c) => c.name)).toEqual(['col_string', 'Total col_number']);
    expect(groupByTable.columns[0].name).toEqual(varcharColumn.name);
    expect(groupByTable.columns[0].index).toBe(0);
    expect(groupByTable.columns[1].name).toBe(`Total ${numberColumn.name}`);
    expect(groupByTable.columns[1].index).toBe(1);
    expect(groupByTable.rows.map((r) => r[0].displayValue)).toEqual(['z', 'a']);
    expect(groupByTable.rows.map((r) => r[1].blur)).toEqual([undefined, true]);
    expect(groupByTable.rows.map((r) => r[1].color)).toEqual([undefined, 'red']);
    expect(groupByTable.rows.map((r) => r[1].displayValue)).toEqual(['NaN', '43.618']);
  });

  it('group by handle numeric value of zero', () => {
    const rownumColumn = sortableTable.columns[rownumColumnIndex];
    const varcharColumn = sortableTable.columns[varcharColumnIndex];
    const numberColumn = sortableTable.columns[numberColumnIndex];
    const aggColumn = {
      column: numberColumn.name,
      agg: 'sum',
      title: `Total ${numberColumn.name}`,
    };
    const filterTypes: FilterTypes[] = ['lesser'];

    const removeNaNTable = filterBy(sortableTable, [rownumColumn], ['4'], filterTypes);
    const groupByTable = orderBy(groupBy(removeNaNTable, [varcharColumn], [aggColumn]), [
      varcharColumn,
    ]);
    expect(groupByTable.columns).toHaveLength(2);
    expect(groupByTable.rows).toHaveLength(2);
    expect(groupByTable.columns.map((c) => c.name)).toEqual(['col_string', 'Total col_number']);
    expect(groupByTable.columns[0].name).toEqual(varcharColumn.name);
    expect(groupByTable.columns[0].index).toBe(0);
    expect(groupByTable.columns[1].name).toBe(`Total ${numberColumn.name}`);
    expect(groupByTable.columns[1].index).toBe(1);
    expect(groupByTable.rows.map((r) => r[0].displayValue)).toEqual(['a', 'z']);
    expect(groupByTable.rows.map((r) => r[1].displayValue)).toEqual(['43.618', '3.14']);
  });

  it('get distinct table', () => {
    const varcharColumn = {
      ...sortableTable.columns[varcharColumnIndex],
      direction: 0,
    };
    const varchar2Column = {
      ...sortableTable.columns[varchar2ColumnIndex],
      direction: 0,
    };
    const distinctTable = getDistinctTable(sortableTable, [varcharColumn, varchar2Column]);
    expect(distinctTable.columns[0].name).toEqual(varcharColumn.name);
    expect(distinctTable.columns[0].index).toBe(0);
    expect(distinctTable.columns[1].name).toEqual(varchar2Column.name);
    expect(distinctTable.columns[1].index).toBe(1);
    expect(getValuesAsString(distinctTable.rows[0], distinctTable.columns)).toBe('a,x');
    expect(getValuesAsString(distinctTable.rows[1], distinctTable.columns)).toBe('z,x');
  });

  it('get columns by list of names', () => {
    const varcharColumn = sortableTable.columns[varcharColumnIndex];
    const numberColumn = sortableTable.columns[numberColumnIndex];
    const varchar2Column = sortableTable.columns[varchar2ColumnIndex];
    const columnsExpected = [varcharColumn, numberColumn, varchar2Column];
    const columns = getColumnsByName(
      sortableTable,
      columnsExpected.map((c) => c.name),
    );
    expect(columns).toEqual(columnsExpected);
  });

  it('get indexed rows', () => {
    const varcharColumn = sortableTable.columns[varcharColumnIndex];
    const varchar2Column = sortableTable.columns[varchar2ColumnIndex];
    const indexColumns = [varcharColumn, varchar2Column];
    const indexedRows = getIndexedRows(sortableTable.rows, indexColumns);
    expect(indexedRows['a,x']).toHaveLength(2);
    expect(indexedRows['z,x']).toHaveLength(3);
  });

  it('select columns', () => {
    const varcharColumn = sortableTable.columns[varcharColumnIndex];
    const varchar2Column = sortableTable.columns[varchar2ColumnIndex];
    const indexColumns = [varcharColumn, varchar2Column];
    const newTable = selectColumns(sortableTable, indexColumns);
    expect(newTable.columns.map((c) => c.name)).toEqual([varcharColumn.name, varchar2Column.name]);
    expect(newTable.columns.map((c) => c.index)).toEqual([0, 1]);
    expect(newTable.rows.map((r) => r[0].displayValue)).toEqual(['a', 'a', 'z', 'z', 'z']);
    expect(newTable.rows.map((r) => r[1].displayValue)).toEqual(['x', 'x', 'x', 'x', 'x']);
  });
});

describe('innerJoin', () => {
  it('join two tables', () => {
    const results = innerJoin(baseTable, joinTable, ['category']);
    expect(results.columns).toEqual([
      { direction: 0, index: 0, name: 'category', type: 'varchar' },
      { direction: 0, index: 1, name: 'region', type: 'varchar' },
      { direction: 0, index: 2, name: 'sales', type: 'number' },
      { direction: 0, index: 3, name: 'subcategory', type: 'varchar' },
    ]);
    expect(results.rows.map((row) => row.map((v) => v.displayValue))).toEqual([
      ['Technology', 'East', '2.0', 'Hi Tech'],
      ['Furniture', 'East', '1.0', 'Low Tech'],
      ['Furniture', 'Central', '1.0', 'Low Tech'],
      ['Technology', 'Central', '1.0', 'Hi Tech'],
      ['Furniture', 'South', '1.0', 'Low Tech'],
      ['Technology', 'South', '1.0', 'Hi Tech'],
      ['Technology', 'West', '2.0', 'Hi Tech'],
      ['Furniture', 'West', '2.0', 'Low Tech'],
    ]);
  });
});

describe('limitRows', () => {
  it('reduce rows to specified limit', () => {
    const results = limitRows(baseTable, 7);
    expect(results.rows).toHaveLength(7);
    expect(results.rows).toEqual(baseTable.rows.slice(0, 7));
  });
});
