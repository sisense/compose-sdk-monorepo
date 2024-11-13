import { StyledColumn, type PivotTableDataOptions } from '../../../chart-data-options/types.js';
import { createHeaderCellValueFormatter } from './header-cell-value-formatter.js';
import { JaqlRequest, PivotTreeNode, UserType, type JaqlPanel } from '@sisense/sdk-pivot-client';

const dateFormatterMock = vi.fn().mockReturnValue('formatted date');
const jaqlMock = {} as JaqlRequest;

describe('createHeaderCellValueFormatter', () => {
  beforeEach(() => {
    dateFormatterMock.mockClear();
  });

  it('should format header cell numeric value by format from dataOptions', () => {
    const dataOptions = {
      rows: [
        {
          numberFormatConfig: {
            name: 'Percent',
            decimalScale: 0,
          },
          column: {
            type: 'numeric',
          },
        },
      ],
    } as PivotTableDataOptions;
    const cell = {
      value: 123.456,
      content: null,
    } as unknown as PivotTreeNode;
    const jaqlPanelItem = {
      jaql: {
        datatype: 'numeric',
      },
      field: {
        index: 0,
      },
    } as JaqlPanel;
    const formatter = createHeaderCellValueFormatter(dataOptions, dateFormatterMock);

    formatter(cell, jaqlPanelItem, jaqlMock);

    expect(cell.content).toBe('12,346%');
  });

  it('should format header cell date value by format from dataOptions', () => {
    const dataOptions = {
      rows: [
        {
          dateFormat: 'YYYY',
          column: {
            type: 'datetime',
          },
        },
      ],
    } as PivotTableDataOptions;
    const cell = {
      value: '2024-03-27T15:21:30.117Z',
      content: null,
    } as unknown as PivotTreeNode;
    const jaqlPanelItem = {
      jaql: {
        datatype: 'datetime',
      },
      field: {
        index: 0,
      },
    } as JaqlPanel;
    const formatter = createHeaderCellValueFormatter(dataOptions, dateFormatterMock);

    formatter(cell, jaqlPanelItem, jaqlMock);

    expect(cell.content).toBe('formatted date');

    const [dateValue, format] = dateFormatterMock.mock.calls[0];
    expect(dateValue.toISOString()).toBe(cell.value);
    expect(format).toBe((dataOptions.rows?.[0] as StyledColumn).dateFormat);
  });

  it("shouldn't format measures header cell value", () => {
    const dataOptions = {
      rows: [{ type: 'numeric' }],
    } as PivotTableDataOptions;
    const cell = {
      value: 123.456,
      content: null,
    } as unknown as PivotTreeNode;
    const jaqlPanelItem = {
      jaql: {
        datatype: 'numeric',
      },
      field: {
        index: 0,
      },
      panel: 'measures', // indicates that cell is measures header
    } as JaqlPanel;
    const formatter = createHeaderCellValueFormatter(dataOptions, dateFormatterMock);

    formatter(cell, jaqlPanelItem, jaqlMock);

    expect(cell.content).toBe(cell.value);
  });

  it("shouldn't format corner header cell value", () => {
    const dataOptions = {
      rows: [{ type: 'numeric' }],
    } as PivotTableDataOptions;
    const cell = {
      value: 123.456,
      content: null,
      userType: UserType.CORNER, // indicates that cell is "corner" type
    } as unknown as PivotTreeNode;
    const jaqlPanelItem = {
      jaql: {
        datatype: 'numeric',
      },
      field: {
        index: 0,
      },
    } as JaqlPanel;
    const formatter = createHeaderCellValueFormatter(dataOptions, dateFormatterMock);

    formatter(cell, jaqlPanelItem, jaqlMock);

    expect(cell.content).toBe(cell.value);
  });

  it('should format empty header cell value as N\\A', () => {
    const dataOptions = {
      rows: [{ type: 'text' }],
    } as PivotTableDataOptions;
    const cell = {
      value: '',
      content: null,
    } as unknown as PivotTreeNode;
    const jaqlPanelItem = {
      jaql: {
        datatype: 'text',
      },
      field: {
        index: 0,
      },
    } as JaqlPanel;
    const formatter = createHeaderCellValueFormatter(dataOptions, dateFormatterMock);

    formatter(cell, jaqlPanelItem, jaqlMock);

    expect(cell.content).toBe('N\\A');
  });

  it('should format datetime cell with invalid date as original value', () => {
    const dataOptions = {
      rows: [
        {
          dateFormat: 'YYYY',
          column: {
            type: 'datetime',
          },
        },
      ],
    } as PivotTableDataOptions;
    const cell = {
      value: 'Some non-date string',
      content: null,
    } as unknown as PivotTreeNode;
    const jaqlPanelItem = {
      jaql: {
        datatype: 'datetime',
      },
      field: {
        index: 0,
      },
    } as JaqlPanel;
    const formatter = createHeaderCellValueFormatter(dataOptions, dateFormatterMock);

    formatter(cell, jaqlPanelItem, jaqlMock);

    expect(cell.content).toBe('Some non-date string');
  });
});
