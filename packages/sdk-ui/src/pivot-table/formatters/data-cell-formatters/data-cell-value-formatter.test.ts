import { type JaqlPanel } from '@sisense/sdk-pivot-client';

import { type PivotTableDataOptions } from '../../../chart-data-options/types.js';
import { createDataCellValueFormatter } from './data-cell-value-formatter.js';

describe('createDataCellValueFormatter', () => {
  it('should format data cell value by format from dataOptions', () => {
    const dataOptions = {
      values: [
        {
          numberFormatConfig: {
            name: 'Percent',
            decimalScale: 1,
          },
        },
      ],
    } as PivotTableDataOptions;
    const cell = {
      value: 123.456,
      content: null,
    };
    const jaqlPanelItem = {
      field: {
        index: 0,
      },
    } as JaqlPanel;
    const formatter = createDataCellValueFormatter(dataOptions);

    formatter(cell, {}, {}, jaqlPanelItem);

    expect(cell.content).toBe('12,345.6%');
  });

  it('should format data cell value by default format', () => {
    const dataOptions = {} as PivotTableDataOptions;
    const cell = {
      value: 123.456,
      content: null,
    };
    const jaqlPanelItem = {} as JaqlPanel;
    const formatter = createDataCellValueFormatter(dataOptions);

    formatter(cell, {}, {}, jaqlPanelItem);

    expect(cell.content).toBe('123.46');
  });
});
