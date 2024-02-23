import { DataTable } from '../../../chart-data-processor/table-processor';
import { TableDataOptions, TableDataOptionsInternal } from '../../../chart-data-options/types';
import { formatNumbers } from './format-numbers';

describe('formatNumbers', () => {
  it('should create a new table and apply the number format to displayValue', () => {
    const table: DataTable = {
      columns: [
        { name: 'item', type: 'string', index: 0, direction: 0 },
        { name: 'price', type: 'number', index: 1, direction: 0 },
        { name: 'revenue', type: 'number', index: 1, direction: 0 },
      ],
      rows: [
        [{ displayValue: 'abc' }, { displayValue: '54321.54321' }, { displayValue: '12345.12345' }],
      ],
    };

    const chartDataOptions: TableDataOptions = {
      columns: [
        {
          name: 'item',
          type: 'string',
          enabled: true,
        },
        {
          name: 'price',
          type: 'number',
          enabled: true,
        },
        {
          name: 'revenue',
          type: 'number',
          enabled: true,
          numberFormatConfig: { name: 'Currency' },
        },
      ],
    };

    const newTable = {
      columns: [
        {
          direction: 0,
          index: 0,
          name: 'item',
          type: 'string',
        },
        {
          direction: 0,
          index: 1,
          name: 'price',
          type: 'number',
        },
        {
          direction: 0,
          index: 1,
          name: 'revenue',
          type: 'number',
        },
      ],
      rows: [
        [
          {
            displayValue: 'abc',
          },
          {
            compareValue: {
              value: 54321.54321,
              valueIsNaN: false,
              valueUndefined: false,
            },
            displayValue: '54.32K',
          },
          {
            compareValue: {
              value: 12345.12345,
              valueIsNaN: false,
              valueUndefined: false,
            },
            displayValue: '$12.35K',
          },
        ],
      ],
    };

    expect(formatNumbers(table, chartDataOptions as TableDataOptionsInternal)).toEqual(newTable);
  });
});
