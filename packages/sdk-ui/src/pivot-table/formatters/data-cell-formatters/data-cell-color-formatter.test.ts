import { type JaqlPanel, UserType } from '@sisense/sdk-pivot-query-client';
import { PivotDataNode, PivotTreeNode } from '@sisense/sdk-pivot-ui';
import { beforeEach } from 'vitest';

import { PivotTableDataOptions, type StyledMeasureColumn } from '@/chart-data-options/types';
import { createDataCellColorFormatter } from '@/pivot-table/formatters/data-cell-formatters/data-cell-color-formatter';
import { CompleteThemeSettings } from '@/types';

describe('createDataCellColorFormatter', () => {
  let cell: PivotDataNode;
  let dataOptions: PivotTableDataOptions;
  let valueCol: StyledMeasureColumn;
  let columnItem: PivotTreeNode;
  let rowItem: PivotTreeNode;
  const themeSettings = {
    palette: {
      variantColors: ['#e0e0e0'],
    },
  } as CompleteThemeSettings;
  const jaqlPanelItem: JaqlPanel = {
    field: {
      index: 0,
    },
  } as JaqlPanel;

  beforeEach(() => {
    valueCol = { column: { name: 'Test' } };
    dataOptions = {
      values: [valueCol],
    };
    columnItem = {};
    rowItem = {};
    cell = { value: 1 };
  });

  it('should apply style for cell with static coloring', () => {
    valueCol.color = {
      type: 'uniform',
      color: 'red',
    };

    const formatter = createDataCellColorFormatter(dataOptions, themeSettings);
    formatter(cell, rowItem, columnItem, jaqlPanelItem);

    expect(cell.style?.backgroundColor).toBe('red');
  });

  it('should apply style for cell with range coloring', () => {
    valueCol.color = {
      type: 'range',
      steps: 0,
      minColor: 'red',
      maxColor: 'blue',
    };

    const formatter = createDataCellColorFormatter(dataOptions, themeSettings);
    formatter(cell, rowItem, columnItem, jaqlPanelItem);

    expect(cell.store?.compileRange).toBeTruthy();
    expect(cell.store?.compileRangeContext).toBeTruthy();
    expect(cell.store?.compileRangeArgs).toEqual({
      max: 'blue',
      maxDef: '#b3b3b3',
      maxGray: '#b3b3b3',
      min: 'red',
      minDef: '#f7ffff',
      minGray: '#fbfbfb',
      steps: 0,
    });
  });

  it('should apply style for cell with conditional coloring', () => {
    valueCol.color = {
      type: 'conditional',
      conditions: [
        {
          operator: '>',
          expression: '5',
          color: 'green',
        },
      ],
    };

    const formatter = createDataCellColorFormatter(dataOptions, themeSettings);

    // true case
    cell.value = 10;
    formatter(cell, rowItem, columnItem, jaqlPanelItem);
    expect(cell.style?.backgroundColor).toBe('green');

    // false case
    cell.style = {};
    cell.value = 1;
    formatter(cell, rowItem, columnItem, jaqlPanelItem);
    expect(cell.style?.backgroundColor).toBeUndefined();
  });

  it('should apply style for cell with databars static coloring', () => {
    valueCol.dataBarsColor = {
      type: 'uniform',
      color: 'red',
    };

    const formatter = createDataCellColorFormatter(dataOptions, themeSettings);
    formatter(cell, rowItem, columnItem, jaqlPanelItem);

    expect(cell.style?.databarColor).toBe('red');
  });

  it('should apply style for cell with databars conditional coloring', () => {
    valueCol.dataBarsColor = {
      type: 'conditional',
      conditions: [
        {
          operator: '=',
          expression: '5',
          color: 'yellow',
        },
      ],
    };

    const formatter = createDataCellColorFormatter(dataOptions, themeSettings);

    // true case
    cell.value = 5;
    formatter(cell, rowItem, columnItem, jaqlPanelItem);
    expect(cell.style?.databarColor).toBe('yellow');

    // false case
    cell.style = {};
    cell.value = 1;
    formatter(cell, rowItem, columnItem, jaqlPanelItem);
    expect(cell.style?.databarColor).toBeUndefined();
  });

  it('should not apply style for subtotal cell with static coloring', () => {
    valueCol.color = {
      type: 'uniform',
      color: 'red',
    };
    rowItem.userType = UserType.SUB_TOTAL;

    const formatter = createDataCellColorFormatter(dataOptions, themeSettings);
    formatter(cell, rowItem, columnItem, jaqlPanelItem);

    expect(cell.style?.backgroundColor).toBeUndefined();
  });

  it('should not apply style for grand total cell with static coloring', () => {
    valueCol.color = {
      type: 'uniform',
      color: 'red',
    };
    rowItem.userType = UserType.GRAND_TOTAL;

    const formatter = createDataCellColorFormatter(dataOptions, themeSettings);
    formatter(cell, rowItem, columnItem, jaqlPanelItem);

    expect(cell.style?.backgroundColor).toBeUndefined();
  });

  it('should not apply style for cell in subtotal column with static coloring', () => {
    valueCol.color = {
      type: 'uniform',
      color: 'red',
    };
    columnItem.userType = UserType.SUB_TOTAL;

    const formatter = createDataCellColorFormatter(dataOptions, themeSettings);
    formatter(cell, rowItem, columnItem, jaqlPanelItem);

    expect(cell.style?.backgroundColor).toBeUndefined();
  });

  it('should not apply style for cell in grand total column with static coloring', () => {
    valueCol.color = {
      type: 'uniform',
      color: 'red',
    };
    columnItem.userType = UserType.GRAND_TOTAL;

    const formatter = createDataCellColorFormatter(dataOptions, themeSettings);
    formatter(cell, rowItem, columnItem, jaqlPanelItem);

    expect(cell.style?.backgroundColor).toBeUndefined();
  });

  it('should not apply style for cell in subtotal column parent with static coloring', () => {
    valueCol.color = {
      type: 'uniform',
      color: 'red',
    };
    columnItem.parent = {
      userType: UserType.SUB_TOTAL,
    };

    const formatter = createDataCellColorFormatter(dataOptions, themeSettings);
    formatter(cell, rowItem, columnItem, jaqlPanelItem);

    expect(cell.style?.backgroundColor).toBeUndefined();
  });

  it('should not apply style for cell in grand total column parent with static coloring', () => {
    valueCol.color = {
      type: 'uniform',
      color: 'red',
    };
    columnItem.parent = {
      userType: UserType.GRAND_TOTAL,
    };

    const formatter = createDataCellColorFormatter(dataOptions, themeSettings);
    formatter(cell, rowItem, columnItem, jaqlPanelItem);

    expect(cell.style?.backgroundColor).toBeUndefined();
  });
});
