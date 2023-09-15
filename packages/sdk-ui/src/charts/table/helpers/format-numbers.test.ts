import { DataTable } from '../../../chart-data-processor/table-processor';
import { TableDataOptions, TableDataOptionsInternal } from '../../../chart-data-options/types';
import { defaultConfig } from '../../../chart-options-processor/translations/number-format-config';
import { formatNumbers } from './format-numbers';

describe('formatNumbers', () => {
  it('should create a new table and apply the number format to displayValue', () => {
    const table: DataTable = {
      columns: [
        { name: 'item', type: 'string', index: 0, direction: 0 },
        { name: 'price', type: 'int', index: 1, direction: 0 },
      ],
      rows: [[{ displayValue: 'abc' }, { displayValue: '1000' }]],
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
          type: 'int',
          enabled: true,
          numberFormatConfig: defaultConfig,
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
          type: 'int',
        },
      ],
      rows: [
        [
          {
            displayValue: 'abc',
          },
          {
            compareValue: {
              value: 1000,
              valueIsNaN: false,
              valueUndefined: false,
            },
            displayValue: '1K',
          },
        ],
      ],
    };

    expect(formatNumbers(table, chartDataOptions as TableDataOptionsInternal)).toEqual(newTable);
  });
});
