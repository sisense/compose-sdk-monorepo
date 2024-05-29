import { JaqlPanel, JaqlRequest, PivotTreeNode, UserType } from '@sisense/sdk-pivot-client';
import { createHeaderCellHighlightFormatter } from './header-cell-highlight-formatter';

describe('createHeaderCellHighlightFormatter', () => {
  const jaqlPanelItem = {
    jaql: {
      dim: 'dimension',
      datatype: 'text',
    },
    panel: 'rows',
  } as JaqlPanel;

  const jaqlWithHighlight = {
    metadata: [
      {
        panel: 'rows',
        jaql: {
          dim: 'dimension',
          datatype: 'text',
          in: {
            selected: {
              jaql: {
                filter: {
                  members: ['value1', 'value2'],
                },
              },
            },
          },
        },
      },
    ],
  } as JaqlRequest;

  it('should highlight cell when it matches highlight filter', () => {
    const cell = {
      value: 'value1',
      state: {},
      userType: 'user',
    } as PivotTreeNode;

    const formatter = createHeaderCellHighlightFormatter();
    formatter(cell, jaqlPanelItem, jaqlWithHighlight);

    expect(cell.state?.isSelected).toBeTruthy();
  });

  it('should not highlight cell when it does not match highlight filter', () => {
    const cell = {
      value: 'value3',
      state: {},
      userType: 'user',
    } as PivotTreeNode;

    const formatter = createHeaderCellHighlightFormatter();
    formatter(cell, jaqlPanelItem, jaqlWithHighlight);

    expect(cell.state?.isSelected).toBeFalsy();
  });

  it('should not highlight cell when no highlight filter is found', () => {
    const cell = {
      value: 'value1',
      state: {},
      userType: 'user',
    } as PivotTreeNode;
    const jaqlWithoutHighlight = {
      metadata: [],
    };

    const formatter = createHeaderCellHighlightFormatter();
    formatter(cell, jaqlPanelItem, jaqlWithoutHighlight);

    expect(cell.state?.isSelected).toBeFalsy();
  });

  it('should not highlight corner cell', () => {
    const cell = {
      value: 'value1',
      state: {},
      userType: UserType.CORNER,
    } as PivotTreeNode;

    const formatter = createHeaderCellHighlightFormatter();
    formatter(cell, jaqlPanelItem, jaqlWithHighlight);

    expect(cell.state?.isSelected).toBeFalsy();
  });

  it('should not highlight subtotal cell', () => {
    const cell = {
      value: 'value1',
      state: {},
      userType: UserType.SUB_TOTAL,
    } as PivotTreeNode;

    const formatter = createHeaderCellHighlightFormatter();
    formatter(cell, jaqlPanelItem, jaqlWithHighlight);

    expect(cell.state?.isSelected).toBeFalsy();
  });
});
