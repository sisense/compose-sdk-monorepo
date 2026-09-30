import { type JaqlPanel, type JaqlRequest, UserType } from '@sisense/sdk-pivot-query-client';
import { type PivotTreeNode } from '@sisense/sdk-pivot-ui';

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

  it('should not highlight a measure header cell that matches a highlighted row item', () => {
    // a date measure now sends the same dim, datatype and level as the row it aggregates, so the
    // panel is the only thing left that separates a measure title from a member
    const dateMeasureHeaderItem = {
      jaql: {
        dim: '[Commerce.Date (Calendar)]',
        datatype: 'datetime',
        level: 'days',
      },
      panel: 'measures',
    } as JaqlPanel;
    const jaqlWithExcludeHighlight = {
      metadata: [
        {
          panel: 'rows',
          jaql: {
            dim: '[Commerce.Date (Calendar)]',
            datatype: 'datetime',
            level: 'days',
            in: {
              selected: {
                jaql: {
                  datatype: 'datetime',
                  filter: {
                    exclude: { members: ['2013-01-01T00:00:00'] },
                  },
                },
              },
            },
          },
        },
      ],
    } as JaqlRequest;
    const cell = {
      value: 'Max Date',
      state: {},
      userType: 'user',
    } as PivotTreeNode;

    const formatter = createHeaderCellHighlightFormatter();
    formatter(cell, dateMeasureHeaderItem, jaqlWithExcludeHighlight);

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
