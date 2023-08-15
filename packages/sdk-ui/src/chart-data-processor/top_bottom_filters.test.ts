import { DatePeriod, getBaseDateFnsLocale } from './data_table_date_period';
import { createSortableTable, TableData } from './table_creators';
import { DataTable, getColumnByName, getDistinctTable } from './table_processor';
import { filtersTopBottomValues, transformDateColumn } from './top_bottom_filters';

const locale = getBaseDateFnsLocale();

const dataTable: DataTable = createSortableTable({
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
    ['0', 'a', '2019-02-20T11:00:00Z', '1.618', 'x'],
    ['1', 'a', '2019-01-20T08:00:00Z', '42.0', 'x'],
    ['2', 'z', '2019-01-10T02:00:00Z', '3.14', 'x'],
    ['3', 'z', '2019-03-05T01:00:00Z', '', 'x'],
    ['4', 'z', '2019-02-08T08:00:00Z', 'a', 'x'],
  ],
};

const convertDateColumn = (period: DatePeriod) => {
  const dateColumnName = 'col_date';
  const dataTableWithDates = createSortableTable(tableData);
  const adjustedDataTable = transformDateColumn(dataTableWithDates, dateColumnName, period, locale);
  // get column of this attribute
  const column = getColumnByName(adjustedDataTable, dateColumnName);
  if (!column) {
    throw new Error(`getColumnByName ${dateColumnName} failed`);
  }

  // return distinct values of a transformed date column
  const distinctDataTable = getDistinctTable(adjustedDataTable, [column]);
  return distinctDataTable.rows
    .map((row) => row[0].displayValue)
    .map((ms) => new Date(parseInt(ms)).toString());
};

// Technology sales = 6
// Furniture sales = 5
// Office Supplies sales = 5
// Home Supplies sales = 4
describe('filtersTopBottomValues', () => {
  it('get top 3 Category by Sales', () => {
    const values = filtersTopBottomValues(
      dataTable,
      'category', // column
      'sales', // agg column
      3, // limit
      'top', // direction
    );
    expect(values).toEqual(['Technology', 'Furniture', 'Office Supplies']);
  });

  it('get bottom 2 Category by Sales', () => {
    const values = filtersTopBottomValues(
      dataTable,
      'category', // column
      'sales', // agg column
      2, // limit
      'bottom', // direction
    );
    expect(values).toEqual(['Home Supplies', 'Furniture']);
  });
});

describe('transformDateColumn', () => {
  it('change date column to months', () => {
    const expectedValues = [
      'Tue Jan 01 2019 00:00:00 GMT+0000 (GMT)',
      'Fri Feb 01 2019 00:00:00 GMT+0000 (GMT)',
      'Fri Mar 01 2019 00:00:00 GMT+0000 (GMT)',
    ];
    const values = convertDateColumn(DatePeriod.MONTH);
    expect(values).toEqual(expectedValues);
  });
  it('change date column to year', () => {
    const expectedValues = ['Tue Jan 01 2019 00:00:00 GMT+0000 (GMT)'];
    const values = convertDateColumn(DatePeriod.YEAR);
    expect(values).toEqual(expectedValues);
  });
  it('change date column to date', () => {
    const expectedValues = [
      'Thu Jan 10 2019 00:00:00 GMT+0000 (GMT)',
      'Sun Jan 20 2019 00:00:00 GMT+0000 (GMT)',
      'Fri Feb 08 2019 00:00:00 GMT+0000 (GMT)',
      'Wed Feb 20 2019 00:00:00 GMT+0000 (GMT)',
      'Tue Mar 05 2019 00:00:00 GMT+0000 (GMT)',
    ];
    const values = convertDateColumn(DatePeriod.DATE);
    expect(values).toEqual(expectedValues);
  });
});
