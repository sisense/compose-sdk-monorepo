import { Category, Value } from '../chart-data-options/types';
import {
  createSortableTable,
  rownumColumnName,
  TableData,
} from '../chart-data-processor/table-creators';
import { filterAndAggregateChartData } from './filter-and-aggregate-chart-data';

const tableData: TableData = {
  columns: [
    {
      name: rownumColumnName,
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
    ['0', 'z', '2019-02-20T00:00:00Z', '1.618', 'x'],
    ['1', 'z', '2019-01-20T00:00:00Z', '42.0', 'x'],
    ['2', 'a', '2019-01-10T00:00:00Z', '3.14', 'x'],
    ['3', 'a', '2019-01-05T00:00:00Z', '', 'x'],
    ['4', 'a', '2019-01-08T00:00:00Z', '3.45', 'x'],
  ],
};

const sortableTable = createSortableTable(tableData);

describe('Aggregate Chart Data', () => {
  it('measures grouped by columns', () => {
    const catColumn = {
      name: 'col_string',
      type: 'string',
    } as Category;
    const measColumn = {
      name: 'col_number',
      aggregation: 'sum',
      type: 'number',
      title: 'Col Number Title',
    } as Value;

    const groupByTable = filterAndAggregateChartData(sortableTable, [catColumn], [measColumn]);

    expect(groupByTable.rows.map((row) => row.map((v) => v.displayValue))).toEqual([
      ['z', '43.618', '0'],
      ['a', '6.59', '2'],
    ]);

    expect(groupByTable.columns).toEqual([
      {
        name: 'col_string',
        type: 'varchar',
        index: 0,
        direction: 0,
      },
      {
        name: 'col_number',
        type: 'number',
        index: 1,
        direction: 0,
      },
      {
        name: rownumColumnName,
        type: 'number',
        index: 2,
        direction: 0,
      },
    ]);
  });
});
