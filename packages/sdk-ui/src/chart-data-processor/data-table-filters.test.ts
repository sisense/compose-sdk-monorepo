import { DataTable, Row } from './table-processor';
import { getBaseDateFnsLocale } from './data-table-date-period';
import {
  FilterGroup,
  FilterOperator,
  FilterType,
  filterBy,
  filtersUpdatedForTable,
  getAppliedFilters,
  FilterSubType,
  Filter,
} from './data-table-filters';
import { simpleColumnType } from '@sisense/sdk-data';

const locale = getBaseDateFnsLocale();

const table: DataTable = {
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
  ],
  rows: [
    [
      { displayValue: '0' },
      { displayValue: 'a' },
      { displayValue: '2019-01-01T00:00:00Z' },
      { displayValue: '1.618' },
    ],
    [
      { displayValue: '1' },
      { displayValue: 'z' },
      { displayValue: '2019-01-31T00:00:00Z' },
      { displayValue: '42.0' },
    ],
    [
      { displayValue: '2' },
      { displayValue: 'z' },
      { displayValue: '2019-12-31T00:00:00Z' },
      { displayValue: '3.14' },
    ],
    [
      { displayValue: '3' },
      { displayValue: 'z' },
      { displayValue: '2020-01-01T00:00:00Z' },
      { displayValue: '' },
    ],
    [
      { displayValue: '4' },
      { displayValue: 'c' },
      { displayValue: '2019-05-20' },
      { displayValue: 'a' },
    ],
    [
      { displayValue: '5' },
      { displayValue: 'b' },
      { displayValue: '2019-07-25T00:00:00Z' },
      { displayValue: '40' },
    ],
    [
      { displayValue: '6' },
      { displayValue: 'c' },
      { displayValue: '2019-11-10T00:00:00Z' },
      { displayValue: '0' },
    ],
    [
      { displayValue: '7' },
      { displayValue: 'a' },
      { displayValue: '2019-10-01T00:00:00Z' },
      { displayValue: '-14' },
    ],
    [
      { displayValue: '8' },
      { displayValue: 'testing123' },
      { displayValue: '2021-10-01T00:00:00Z' },
      { displayValue: '-5000' },
    ],
  ],
};

const getRows = (indexes: number[]): Row[] => {
  const rows: Row[] = [];
  for (let i = 0; i < indexes.length; i++) {
    rows.push(table.rows[indexes[i]]);
  }
  return rows;
};

describe('Table Filters', () => {
  it('filter table by single text value', () => {
    const filterGroup: FilterGroup = {};
    const column = table.columns[1];
    filterGroup[column.name] = {};
    filterGroup[column.name][FilterType.TEXT] = {
      column,
      data: [
        {
          operator: FilterOperator.IN,
          values: ['c'],
        },
      ],
      type: FilterType.TEXT,
      userSelections: {
        columnName: column.name,
        dataType: FilterType.TEXT,
        type: FilterSubType.LIST,
      },
    };
    const filteredTable = filterBy(table, filterGroup, locale);
    expect(filteredTable.rows).toEqual(getRows([4, 6]));
  });

  it('filter table by single text value not in table', () => {
    const filterGroup: FilterGroup = {};
    const column = table.columns[1];
    filterGroup[column.name] = {};
    filterGroup[column.name][FilterType.TEXT] = {
      column,
      data: [
        {
          operator: FilterOperator.IN,
          values: ['test'],
        },
      ],
      type: FilterType.TEXT,
      userSelections: {
        columnName: column.name,
        dataType: FilterType.TEXT,
        type: FilterSubType.LIST,
      },
    };
    const filteredTable = filterBy(table, filterGroup, locale);
    expect(filteredTable.rows).toEqual([]);
  });

  it('filter table by multiple text values', () => {
    const filterGroup: FilterGroup = {};
    const column = table.columns[1];
    filterGroup[column.name] = {};
    filterGroup[column.name][FilterType.TEXT] = {
      column,
      data: [
        {
          operator: FilterOperator.IN,
          values: ['a', 'z'],
        },
      ],
      type: FilterType.TEXT,
      userSelections: {
        columnName: column.name,
        dataType: FilterType.TEXT,
        type: FilterSubType.LIST,
      },
    };
    const filteredTable = filterBy(table, filterGroup, locale);
    expect(filteredTable.rows).toEqual(getRows([0, 1, 2, 3, 7]));
  });

  it('filter table by text starts with', () => {
    const filterGroup: FilterGroup = {};
    const column = table.columns[1];
    filterGroup[column.name] = {};
    filterGroup[column.name][FilterType.TEXT] = {
      column,
      data: [
        {
          operator: FilterOperator.STARTS_WITH,
          values: ['test'],
        },
      ],
      type: FilterType.TEXT,
      userSelections: {
        columnName: column.name,
        dataType: FilterType.TEXT,
        type: FilterSubType.CONDITIONAL,
      },
    };
    const filteredTable = filterBy(table, filterGroup, locale);
    expect(filteredTable.rows).toEqual(getRows([8]));
  });

  it('filter table by text does not start with', () => {
    const filterGroup: FilterGroup = {};
    const column = table.columns[1];
    filterGroup[column.name] = {};
    filterGroup[column.name][FilterType.TEXT] = {
      column,
      data: [
        {
          operator: FilterOperator.DOES_NOT_START_WITH,
          values: ['z'],
        },
      ],
      type: FilterType.TEXT,
      userSelections: {
        columnName: column.name,
        dataType: FilterType.TEXT,
        type: FilterSubType.CONDITIONAL,
      },
    };
    const filteredTable = filterBy(table, filterGroup, locale);
    expect(filteredTable.rows).toEqual(getRows([0, 4, 5, 6, 7, 8]));
  });

  it('filter table by text ends with', () => {
    const filterGroup: FilterGroup = {};
    const column = table.columns[1];
    filterGroup[column.name] = {};
    filterGroup[column.name][FilterType.TEXT] = {
      column,
      data: [
        {
          operator: FilterOperator.ENDS_WITH,
          values: ['a'],
        },
      ],
      type: FilterType.TEXT,
      userSelections: {
        columnName: column.name,
        dataType: FilterType.TEXT,
        type: FilterSubType.CONDITIONAL,
      },
    };
    const filteredTable = filterBy(table, filterGroup, locale);
    expect(filteredTable.rows).toEqual(getRows([0, 7]));
  });

  it('filter table by text does not end with', () => {
    const filterGroup: FilterGroup = {};
    const column = table.columns[1];
    filterGroup[column.name] = {};
    filterGroup[column.name][FilterType.TEXT] = {
      column,
      data: [
        {
          operator: FilterOperator.DOES_NOT_END_WITH,
          values: ['123'],
        },
      ],
      type: FilterType.TEXT,
      userSelections: {
        columnName: column.name,
        dataType: FilterType.TEXT,
        type: FilterSubType.CONDITIONAL,
      },
    };
    const filteredTable = filterBy(table, filterGroup, locale);
    expect(filteredTable.rows).toEqual(getRows([0, 1, 2, 3, 4, 5, 6, 7]));
  });

  it('filter table by single number value', () => {
    const filterGroup: FilterGroup = {};
    const column = table.columns[3];
    filterGroup[column.name] = {};
    filterGroup[column.name][FilterType.NUMBER] = {
      column,
      data: [
        {
          operator: FilterOperator.IN,
          values: [1.618],
        },
      ],
      type: FilterType.TEXT,
      userSelections: {
        columnName: column.name,
        dataType: FilterType.NUMBER,
        type: FilterSubType.LIST,
      },
    };
    const filteredTable = filterBy(table, filterGroup, locale);
    expect(filteredTable.rows).toEqual(getRows([0]));
  });

  it('filter table by single number value not in table', () => {
    const filterGroup: FilterGroup = {};
    const column = table.columns[3];
    filterGroup[column.name] = {};
    filterGroup[column.name][FilterType.NUMBER] = {
      column,
      data: [
        {
          operator: FilterOperator.IN,
          values: [100],
        },
      ],
      type: FilterType.NUMBER,
      userSelections: {
        columnName: column.name,
        dataType: FilterType.NUMBER,
        type: FilterSubType.LIST,
      },
    };
    const filteredTable = filterBy(table, filterGroup, locale);
    expect(filteredTable.rows).toEqual([]);
  });

  it('filter table by multiple number values', () => {
    const filterGroup: FilterGroup = {};
    const column = table.columns[3];
    filterGroup[column.name] = {};
    filterGroup[column.name][FilterType.NUMBER] = {
      column,
      data: [
        {
          operator: FilterOperator.IN,
          values: [1.618, 3.14],
        },
      ],
      type: FilterType.NUMBER,
      userSelections: {
        columnName: column.name,
        dataType: FilterType.NUMBER,
        type: FilterSubType.LIST,
      },
    };
    const filteredTable = filterBy(table, filterGroup, locale);
    expect(filteredTable.rows).toEqual(getRows([0, 2]));
  });

  it('filter table by number range', () => {
    const filterGroup: FilterGroup = {};
    const column = table.columns[3];
    filterGroup[column.name] = {};
    filterGroup[column.name][FilterType.NUMBER] = {
      column,
      data: [
        {
          operator: FilterOperator.BETWEEN,
          values: [2, 40],
        },
      ],
      type: FilterType.NUMBER,
      userSelections: {
        columnName: column.name,
        dataType: FilterType.NUMBER,
        type: FilterSubType.RANGE,
      },
    };
    const filteredTable = filterBy(table, filterGroup, locale);
    expect(filteredTable.rows).toEqual(getRows([2, 5]));
  });

  it('filter table by single date value', () => {
    const filterGroup: FilterGroup = {};
    const column = table.columns[2];
    filterGroup[column.name] = {};
    filterGroup[column.name][FilterType.DATETIME] = {
      column,
      data: [
        {
          operator: FilterOperator.IN,
          values: [new Date('2019-12-31').getTime()],
        },
      ],
      type: FilterType.DATETIME,
      userSelections: {
        columnName: column.name,
        dataType: FilterType.DATETIME,
        type: FilterSubType.LIST,
      },
    };

    const filteredTable = filterBy(table, filterGroup, locale);
    expect(filteredTable.rows).toEqual(getRows([2]));
  });

  it('filter table by multiple date values', () => {
    const filterGroup: FilterGroup = {};
    const column = table.columns[2];
    filterGroup[column.name] = {};
    filterGroup[column.name][FilterType.DATETIME] = {
      column,
      data: [
        {
          operator: FilterOperator.IN,
          values: [new Date('2019-01-01').getTime(), new Date('2019-11-10').getTime()],
        },
      ],
      type: FilterType.DATETIME,
      userSelections: {
        columnName: column.name,
        dataType: FilterType.DATETIME,
        type: FilterSubType.LIST,
      },
    };
    const filteredTable = filterBy(table, filterGroup, locale);
    expect(filteredTable.rows).toEqual(getRows([0, 6]));
  });

  it('filter table by date range', () => {
    const filterGroup: FilterGroup = {};
    const column = table.columns[2];
    filterGroup[column.name] = {};
    filterGroup[column.name][FilterType.DATETIME] = {
      column,
      data: [
        {
          operator: FilterOperator.BETWEEN,
          values: [new Date('2019-01-01').getTime(), new Date('2019-12-31').getTime()],
        },
      ],
      type: FilterType.DATETIME,
      userSelections: {
        columnName: column.name,
        dataType: FilterType.DATETIME,
        type: FilterSubType.RANGE,
      },
    };
    const filteredTable = filterBy(table, filterGroup, locale);
    expect(filteredTable.rows).toEqual(getRows([0, 1, 2, 4, 5, 6, 7]));
  });

  it('filter table by multiple columns', () => {
    const filterGroup: FilterGroup = {};

    filterGroup[table.columns[2].name] = {};
    filterGroup[table.columns[2].name][FilterType.DATETIME] = {
      column: table.columns[2],
      data: [
        {
          operator: FilterOperator.IN,
          values: [new Date('2019-05-20').getTime(), new Date('2020-01-01').getTime()],
        },
      ],
      type: FilterType.DATETIME,
      userSelections: {
        columnName: table.columns[2].name,
        dataType: FilterType.DATETIME,
        type: FilterSubType.LIST,
      },
    };

    filterGroup[table.columns[3].name] = {};
    filterGroup[table.columns[3].name][FilterType.NUMBER] = {
      column: table.columns[3],
      data: [
        {
          operator: FilterOperator.BETWEEN,
          values: [-29, 0],
        },
      ],
      type: FilterType.NUMBER,
      userSelections: {
        columnName: table.columns[3].name,
        dataType: FilterType.NUMBER,
        type: FilterSubType.RANGE,
      },
    };

    filterGroup[table.columns[1].name] = {};
    filterGroup[table.columns[1].name][FilterType.TEXT] = {
      column: table.columns[1],
      data: [
        {
          operator: FilterOperator.IN,
          values: ['c', 'z'],
        },
      ],
      type: FilterType.TEXT,
      userSelections: {
        columnName: table.columns[1].name,
        dataType: FilterType.TEXT,
        type: FilterSubType.LIST,
      },
    };
    const filteredTable = filterBy(table, filterGroup, locale);
    expect(filteredTable.rows).toEqual(getRows([3]));
  });

  it('filter update applies to table', () => {
    const filterGroup: FilterGroup = {};
    const column = table.columns[3];
    filterGroup[column.name] = {};
    filterGroup[column.name][FilterType.NUMBER] = {
      column,
      data: [
        {
          operator: FilterOperator.BETWEEN,
          values: [2, 40],
        },
      ],
      type: FilterType.NUMBER,
      userSelections: {
        columnName: column.name,
        dataType: FilterType.NUMBER,
        type: FilterSubType.RANGE,
      },
    };
    const updated = filtersUpdatedForTable(table.columns, filterGroup, {});
    expect(updated).toBe(true);
  });

  it('filter update does not apply to table', () => {
    const filterGroup: FilterGroup = {};
    const column = { name: 'testing', type: 'number' };
    filterGroup[column.name] = {};
    filterGroup[column.name][FilterType.NUMBER] = {
      column,
      data: [
        {
          operator: FilterOperator.BETWEEN,
          values: [2, 40],
        },
      ],
      type: FilterType.NUMBER,
      userSelections: {
        columnName: column.name,
        dataType: FilterType.NUMBER,
        type: FilterSubType.RANGE,
      },
    };
    const updated = filtersUpdatedForTable(table.columns, filterGroup, {});
    expect(updated).toBe(false);
  });

  it('filter updated with same name but different type', () => {
    const filterGroup: FilterGroup = {};
    const column = { name: table.columns[2].name, type: 'number' };
    filterGroup[column.name] = {};
    filterGroup[column.name][FilterType.NUMBER] = {
      column,
      data: [
        {
          operator: FilterOperator.BETWEEN,
          values: [2, 40],
        },
      ],
      type: FilterType.NUMBER,
      userSelections: {
        columnName: column.name,
        dataType: FilterType.NUMBER,
        type: FilterSubType.RANGE,
      },
    };
    const updated = filtersUpdatedForTable(table.columns, filterGroup, {});
    expect(updated).toBe(false);
  });

  it('filters applied to table', () => {
    const filterGroup: FilterGroup = {};
    const column1 = table.columns[1];
    const column2 = table.columns[2];
    const column1Filter: Filter = {
      column: column1,
      data: [
        {
          operator: FilterOperator.IN,
          values: ['c', 'z'],
        },
      ],
      type: FilterType.TEXT,
      userSelections: {
        columnName: column1.name,
        dataType: FilterType.TEXT,
        type: FilterSubType.LIST,
      },
    };
    const column2Filter: Filter = {
      column: column2,
      data: [
        {
          operator: FilterOperator.BETWEEN,
          values: [2, 40],
        },
      ],
      type: FilterType.NUMBER,
      userSelections: {
        columnName: column2.name,
        dataType: FilterType.NUMBER,
        type: FilterSubType.RANGE,
      },
    };
    filterGroup[column1.name] = {};
    filterGroup[column2.name] = {};
    filterGroup[column1.name][simpleColumnType(column1.type)] = column1Filter;
    filterGroup[column2.name][simpleColumnType(column2.type)] = column2Filter;
    const result = getAppliedFilters(table.columns, filterGroup);
    //const expectedResult = [{}, {}] as Array<Record<string, Array<FilterData>>>;
    const expectedResult = [{}, {}] as Filter[];
    expectedResult[0] = column1Filter;
    expectedResult[1] = column2Filter;
    expect(result).toEqual(expectedResult);
  });

  it('filters not applied to table', () => {
    const filterGroup: FilterGroup = {};
    const column = { name: 'test', type: 'test' };
    const filters = {
      column,
      data: [
        {
          operator: FilterOperator.BETWEEN,
          values: [2, 40],
        },
      ],
      type: FilterType.NUMBER,
      userSelections: {
        columnName: column.name,
        dataType: FilterType.NUMBER,
        type: FilterSubType.RANGE,
      },
    };
    filterGroup[column.name] = {};
    filterGroup[column.name][simpleColumnType(column.type)] = filters;
    const result = getAppliedFilters(table.columns, filterGroup);
    expect(result).toEqual([]);
  });

  it('filter with no selections applied to table', () => {
    const filterGroup: FilterGroup = {};
    const column = table.columns[2];
    filterGroup[column.name] = {};
    filterGroup[column.name][simpleColumnType(column.type)] = {
      column,
      data: [],
      type: FilterType.DATETIME,
      userSelections: {
        columnName: column.name,
        dataType: FilterType.DATETIME,
        type: FilterSubType.LIST,
      },
    };
    const result = getAppliedFilters(table.columns, filterGroup);
    expect(result).toEqual([]);
  });
});
