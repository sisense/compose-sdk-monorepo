import { act, renderHook } from '@testing-library/react';

import { WidgetsPanelLayout } from '@/domains/dashboarding/dashboard-model';

import { useWidgetsLayoutManagement } from './use-widgets-layout.js';

describe('useLayoutManagement layout modifications', () => {
  const initialLayout = {
    columns: [
      {
        widthPercentage: 100,
        rows: [
          {
            cells: [
              {
                widthPercentage: 24.034334763948497,
                height: '120px',
                widgetId: '67bc68ed4acd33002a6e4a00',
              },
              {
                widthPercentage: 26.609442060085836,
                height: '120px',
                widgetId: '67bc68ed4acd33002a6e4a01',
              },
              {
                widthPercentage: 25.17882689556509,
                height: '120px',
                widgetId: '67bc68ed4acd33002a6e4a02',
              },
              {
                widthPercentage: 24.17739628040058,
                height: '120px',
                widgetId: '67bc68ed4acd33002a6e49fe',
              },
            ],
          },
          {
            cells: [
              {
                widthPercentage: 100,
                height: '312px',
                widgetId: '67bc68ed4acd33002a6e4a03',
              },
            ],
          },
          {
            cells: [
              {
                widthPercentage: 33.66186504927976,
                height: '324px',
                widgetId: '67bc68ed4acd33002a6e49ff',
              },
              {
                widthPercentage: 41.23083881338118,
                height: '324px',
                widgetId: '67bc68ed4acd33002a6e4a04',
              },
              {
                widthPercentage: 25.107296137339056,
                height: '324px',
                widgetId: '67bc68fe4acd33002a6e4a14',
              },
            ],
          },
        ],
      },
    ],
  };

  // Layout manager that adds a "modified" flag to every cell.
  const addModifiedFlagManager = {
    manageLayout: (layout: any) => ({
      ...layout,
      columns: layout.columns.map((col: any) => ({
        ...col,
        rows: col.rows.map((row: any) => ({
          ...row,
          cells: row.cells.map((cell: any) => ({
            ...cell,
            modified: true,
          })),
        })),
      })),
    }),
    name: 'addModifiedFlagManager',
  };

  // Layout manager that doubles the widthPercentage for every cell.
  const doubleWidthManager = {
    manageLayout: (layout: any) => ({
      ...layout,
      columns: layout.columns.map((col: any) => ({
        ...col,
        rows: col.rows.map((row: any) => ({
          ...row,
          cells: row.cells.map((cell: any) => ({
            ...cell,
            widthPercentage: cell.widthPercentage * 2,
          })),
        })),
      })),
    }),
    name: 'doubleWidthManager',
  };

  const layoutManagers = [addModifiedFlagManager, doubleWidthManager];

  it('should correctly apply layout modifications using the provided layout managers', () => {
    const { result } = renderHook(() =>
      useWidgetsLayoutManagement({ layout: initialLayout, layoutManagers }),
    );

    // Expected layout: managers are applied in order using flow.
    const expectedLayout = doubleWidthManager.manageLayout(
      addModifiedFlagManager.manageLayout(initialLayout),
    );
    expect(result.current.layout).toEqual(expectedLayout);
  });

  it('should correctly update a specific cell after modifications', () => {
    const { result } = renderHook(() =>
      useWidgetsLayoutManagement({ layout: initialLayout, layoutManagers }),
    );

    const computedLayout = result.current.layout;
    // Verify the first cell of the first row:
    const originalCell = initialLayout.columns[0].rows[0].cells[0];
    const modifiedCell = computedLayout.columns[0].rows[0].cells[0];

    expect((modifiedCell as unknown as { modified: boolean }).modified).toBe(true);
    expect(modifiedCell.widthPercentage).toBeCloseTo(originalCell.widthPercentage * 2);
  });

  it('should return the initial layout if no layout managers are provided', () => {
    const { result } = renderHook(() =>
      useWidgetsLayoutManagement({ layout: initialLayout, layoutManagers: [] }),
    );
    expect(result.current.layout).toEqual(initialLayout);
  });

  it('should allow forced layout to override modifications', () => {
    const forcedLayout: WidgetsPanelLayout = {
      columns: [
        {
          widthPercentage: 100,
          rows: [
            {
              cells: [
                {
                  widthPercentage: 24,
                  height: '120px',
                  widgetId: '67bc68ed4acd33002a6e4a00',
                },
                {
                  widthPercentage: 26,
                  height: '120px',
                  widgetId: '67bc68ed4acd33002a6e4a01',
                },
                {
                  widthPercentage: 25,
                  height: '120px',
                  widgetId: '67bc68ed4acd33002a6e4a02',
                },
                {
                  widthPercentage: 24,
                  height: '120px',
                  widgetId: '67bc68ed4acd33002a6e49fe',
                },
              ],
            },
            {
              cells: [
                {
                  widthPercentage: 100,
                  height: '312px',
                  widgetId: '67bc68ed4acd33002a6e4a03',
                },
              ],
            },
          ],
        },
      ],
    };

    const { result } = renderHook(() =>
      useWidgetsLayoutManagement({ layout: initialLayout, layoutManagers }),
    );

    act(() => {
      result.current.setLayout(forcedLayout);
    });
    expect(result.current.layout).toEqual(forcedLayout);
  });
});
