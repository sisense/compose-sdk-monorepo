/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { DataTable, getValue } from './table-processor';
import {
  createDataTableFromData,
  createSortableFromColumnsRows,
  createSortableTable,
  TableColumn,
  TableData,
} from './table-creators';

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
  ],
  rows: [
    ['0', 'a', '2019-02-20T00:00:00Z', '1.618', 'x'],
    ['1', 'a', '2019-01-20T00:00:00Z', '42.0', 'x'],
    ['2', 'z', '2019-01-10T00:00:00Z', '3.14', 'x'],
    ['3', 'z', '2019-01-05T00:00:00Z', '', 'x'],
    ['4', 'z', '2019-01-08T00:00:00Z', 'a', 'x'],
  ],
};

const expectedSortableTable: DataTable = {
  columns: [
    {
      name: 'rownum',
      type: 'integer',
      index: 0,
      direction: 0,
    },
    {
      name: 'col_string',
      type: 'varchar',
      index: 1,
      direction: 0,
    },
    {
      name: 'col_date',
      type: 'datetime',
      index: 2,
      direction: 0,
    },
    {
      name: 'col_number',
      type: 'number',
      index: 3,
      direction: 0,
    },
    {
      name: 'col_string2',
      type: 'varchar',
      index: 4,
      direction: 0,
    },
  ],
  rows: [
    [
      { displayValue: '0' },
      { displayValue: 'a' },
      { displayValue: '2019-02-20T00:00:00Z' },
      { displayValue: '1.618' },
      { displayValue: 'x' },
    ],
    [
      { displayValue: '1' },
      { displayValue: 'a' },
      { displayValue: '2019-01-20T00:00:00Z' },
      { displayValue: '42.0' },
      { displayValue: 'x' },
    ],
    [
      { displayValue: '2' },
      { displayValue: 'z' },
      { displayValue: '2019-01-10T00:00:00Z' },
      { displayValue: '3.14' },
      { displayValue: 'x' },
    ],
    [
      { displayValue: '3' },
      { displayValue: 'z' },
      { displayValue: '2019-01-05T00:00:00Z' },
      { displayValue: '' },
      { displayValue: 'x' },
    ],
    [
      { displayValue: '4' },
      { displayValue: 'z' },
      { displayValue: '2019-01-08T00:00:00Z' },
      { displayValue: 'a' },
      { displayValue: 'x' },
    ],
  ],
};

const compareBase = {
  lowercaseValue: undefined,
  valueIsNaN: false,
  valueUndefined: false,
  value: 0,
};

describe('Create Data Table', () => {
  it('converts a query result into a sortable table', () => {
    const sortableTable = createSortableTable(tableData);
    expect(sortableTable).toEqual(expectedSortableTable);
  });
  it('columns and rows into a sortable table', () => {
    const columns = tableData.columns as TableColumn[];
    const rows = tableData.rows;
    const sortableTable = createSortableFromColumnsRows(columns, rows);
    expect(sortableTable).toEqual(expectedSortableTable);
  });
  it('adds a rownum column when creating table from rows and columns', () => {
    const columns = tableData.columns as TableColumn[];
    const rows = tableData.rows;
    const sortableTable = createSortableFromColumnsRows(columns, rows, '$rownum');
    const expectedRownumColumn = {
      name: '$rownum',
      type: 'number',
      direction: 0,
      index: 5,
    };
    expect(sortableTable.columns[5]).toEqual(expectedRownumColumn);
    expect(sortableTable.rows.map((r) => getValue(r, expectedRownumColumn))).toEqual([
      0, 1, 2, 3, 4,
    ]);
  });

  describe('createDataTableFromData', () => {
    const data = {
      columns: [
        { name: 'Years', type: 'date' },
        { name: 'Group', type: 'string' },
        { name: 'Quantity', type: 'number' },
        { name: 'Units', type: 'number' },
      ],
      rows: [
        ['2009', 'A', 6781, 10],
        ['2010', 'A', 4471, 70],
        ['2011', 'B', 1812, 50],
        ['2012', 'B', 5001, 60],
      ],
    };

    it('forwards per-datapoint color values', () => {
      const dataWithColor = {
        ...data,
        rows: [
          ['2009', 'A', { data: 6781, text: '6781', color: '#0ff' }, 10],
          ['2010', 'A', { data: 4471, text: '4471', color: '#f0f' }, 70],
          ['2011', 'B', { data: 1812, text: '1812', color: '#ff0' }, 50],
          ['2012', 'B', { data: 5001, text: '5001', color: '#000' }, 60],
        ],
      };
      const dataTable = createDataTableFromData(dataWithColor);
      expect(dataTable.rows).toEqual([
        expect.arrayContaining([
          {
            displayValue: '6781',
            rawValue: 6781,
            color: '#0ff',
            compareValue: expect.anything(),
          },
        ]),
        expect.arrayContaining([
          {
            displayValue: '4471',
            rawValue: 4471,
            color: '#f0f',
            compareValue: expect.anything(),
          },
        ]),
        expect.arrayContaining([
          {
            displayValue: '1812',
            rawValue: 1812,
            color: '#ff0',
            compareValue: expect.anything(),
          },
        ]),
        expect.arrayContaining([
          {
            displayValue: '5001',
            rawValue: 5001,
            color: '#000',
            compareValue: expect.anything(),
          },
        ]),
      ]);
    });

    it('works without per-datapoint color values', () => {
      const dataTable = createDataTableFromData(data);
      expect(dataTable.rows).toEqual([
        expect.arrayContaining([
          {
            displayValue: '2009',
            rawValue: '2009-01-01T00:00:00.000Z',
            compareValue: { ...compareBase, value: 1230768000000 },
          },
        ]),
        expect.arrayContaining([
          {
            displayValue: '2010',
            rawValue: '2010-01-01T00:00:00.000Z',
            compareValue: { ...compareBase, value: 1262304000000 },
          },
        ]),
        expect.arrayContaining([
          {
            displayValue: '2011',
            rawValue: '2011-01-01T00:00:00.000Z',
            compareValue: { ...compareBase, value: 1293840000000 },
          },
        ]),
        expect.arrayContaining([
          {
            displayValue: '2012',
            rawValue: '2012-01-01T00:00:00.000Z',
            compareValue: { ...compareBase, value: 1325376000000 },
          },
        ]),
      ]);
    });

    it('when date is specified', () => {
      const dataTable = createDataTableFromData(data);
      expect(dataTable.rows).toEqual([
        expect.arrayContaining([{ displayValue: '6781', rawValue: 6781 }]),
        expect.arrayContaining([{ displayValue: '4471', rawValue: 4471 }]),
        expect.arrayContaining([{ displayValue: '1812', rawValue: 1812 }]),
        expect.arrayContaining([{ displayValue: '5001', rawValue: 5001 }]),
      ]);
    });

    it('works with aggregate datetime', () => {
      const dataAgg15 = {
        columns: [
          { name: 'Years', type: 'date' },
          { name: 'Group', type: 'string' },
          { name: 'Quantity', type: 'number' },
          { name: 'Units', type: 'number' },
        ],
        rows: [
          [{ data: '1111-11-11T12:45', text: '12:45' }, 'A', 6781, 10],
          [{ data: '1111-11-11T13:00', text: '13:00' }, 'A', 4471, 70],
          [{ data: '1111-11-11T13:15', text: '13:15' }, 'B', 1812, 50],
          [{ data: '1111-11-11T13:30', text: '13:30' }, 'B', 5001, 60],
        ],
      };

      const dataTable = createDataTableFromData(dataAgg15);
      expect(dataTable.rows).toEqual([
        expect.arrayContaining([
          {
            displayValue: '12:45',
            rawValue: '1111-11-11T12:45',
            compareValue: { ...compareBase, value: 45900000 },
          },
        ]),
        expect.arrayContaining([
          {
            displayValue: '13:00',
            rawValue: '1111-11-11T13:00',
            compareValue: { ...compareBase, value: 46800000 },
          },
        ]),
        expect.arrayContaining([
          {
            displayValue: '13:15',
            rawValue: '1111-11-11T13:15',
            compareValue: { ...compareBase, value: 47700000 },
          },
        ]),
        expect.arrayContaining([
          {
            displayValue: '13:30',
            rawValue: '1111-11-11T13:30',
            compareValue: { ...compareBase, value: 48600000 },
          },
        ]),
      ]);
    });
  });
});
