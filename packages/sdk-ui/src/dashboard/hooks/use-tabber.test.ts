import { renderHook, act } from '@testing-library/react';
import { useTabber, isTabberWidget, modifyLayout } from './use-tabber';
import { TabberWidgetExtraProps, WidgetProps } from '@/props';

describe('isTabberWidget', () => {
  it('should return true for widget with pluginType "WidgetsTabber"', () => {
    const widget: WidgetProps = { id: 'w1', pluginType: 'WidgetsTabber' } as WidgetProps;
    expect(isTabberWidget(widget)).toBe(true);
  });

  it('should return false for widget with any other pluginType', () => {
    const widget: WidgetProps = { id: 'w2', pluginType: 'OtherWidget' } as WidgetProps;
    expect(isTabberWidget(widget)).toBe(false);
  });
});

describe('modifyLayout', () => {
  const dashboardTabberConfig = {
    tabber1: {
      activeTab: 0,
      tabs: [
        { displayWidgetIds: ['w1', 'w2'], hideWidgetIds: [], title: 'Tab 0' },
        { displayWidgetIds: ['w3'], hideWidgetIds: [], title: 'Tab 1' },
      ],
    },
  };
  // initial tabber state matches the config (activeTab 0)
  const selectedTabs = { tabber1: 0 };

  // Layout with one column, one row, and 3 cells:
  // • "w1" and "w2" should be visible in activeTab 0.
  // • "w3" is affected by the config but is not in activeTab 0, so it will be filtered out.
  const layout = {
    columns: [
      {
        widthPercentage: 100,
        rows: [
          {
            cells: [
              { widgetId: 'w1', widthPercentage: 30, height: '100px' },
              { widgetId: 'w2', widthPercentage: 40, height: '100px' },
              { widgetId: 'w3', widthPercentage: 30, height: '100px' },
            ],
          },
        ],
      },
    ],
  };

  it('should filter out cells that are hidden based on the active tab', () => {
    const modifiedLayout = modifyLayout(dashboardTabberConfig, selectedTabs)(layout);
    // In the only row, cell "w3" should be removed.
    expect(modifiedLayout.columns[0].rows[0].cells).toHaveLength(2);
    // Also, the widths should be adjusted proportionally.
    // The adjustment factor is original cell count / new cell count = 3/2.
    // const factor = 3 / 2;
    expect(modifiedLayout.columns[0].rows[0].cells[0].widgetId).toBe('w1');
    expect(modifiedLayout.columns[0].rows[0].cells[0].widthPercentage).toBeCloseTo(50);
    expect(modifiedLayout.columns[0].rows[0].cells[1].widgetId).toBe('w2');
    expect(modifiedLayout.columns[0].rows[0].cells[1].widthPercentage).toBeCloseTo(50);
  });

  it('should leave cells unchanged if they are not affected by any tabber config', () => {
    // Create a layout row where none of the cells are mentioned in the tabber config.
    const layoutUnaffected = {
      columns: [
        {
          widthPercentage: 100,
          rows: [
            {
              cells: [
                { widgetId: 'wX', widthPercentage: 50, height: '100px' },
                { widgetId: 'wY', widthPercentage: 50, height: '100px' },
              ],
            },
          ],
        },
      ],
    };

    const modifiedLayout = modifyLayout(dashboardTabberConfig, selectedTabs)(layoutUnaffected);
    // Expect the row to remain intact.
    expect(modifiedLayout.columns[0].rows[0].cells).toHaveLength(2);
    expect(modifiedLayout).toEqual(layoutUnaffected);
  });
});

describe('useTabber hook', () => {
  const dashboardTabberConfig = {
    tabber1: {
      activeTab: 0,
      tabs: [
        { displayWidgetIds: ['w1', 'w2'], title: 'Tab 0' },
        { displayWidgetIds: ['w3'], title: 'Tab 1' },
      ],
    },
  };

  const widgets: WidgetProps[] = [
    { id: 'tabber1', pluginType: 'WidgetsTabber', name: 'Tabber Widget' } as unknown as WidgetProps,
    { id: 'wX', pluginType: 'OtherWidget', name: 'Regular Widget' } as unknown as WidgetProps,
  ];

  it('should augment tabber widgets with onTabSelected callback and selectedTab property', () => {
    const { result } = renderHook(() => useTabber({ widgets, config: dashboardTabberConfig }));

    const returnedWidgets = result.current.widgets;
    // Find the tabber widget.
    const tabberWidget = returnedWidgets.find((w) => w.id === 'tabber1');
    expect(tabberWidget).toBeDefined();
    // Should include a callback and a selectedTab property.
    expect((tabberWidget as unknown as TabberWidgetExtraProps).onTabSelected).toBeInstanceOf(
      Function,
    );
    expect((tabberWidget as unknown as TabberWidgetExtraProps)?.selectedTab).toBe(0);

    // The non-tabber widget should remain unchanged.
    const nonTabberWidget = returnedWidgets.find((w) => w.id === 'wX');
    expect(nonTabberWidget).not.toHaveProperty('onTabSelected');
    expect(nonTabberWidget).not.toHaveProperty('selectedTab');
  });

  it('should update the selectedTab state when onTabSelected is called', () => {
    const { result } = renderHook(() => useTabber({ widgets, config: dashboardTabberConfig }));

    // Get the tabber widget and call its onTabSelected to change active tab to 1.
    let tabberWidget = result.current.widgets.find((w) => w.id === 'tabber1') as any;
    act(() => {
      tabberWidget.onTabSelected(1);
    });
    // Re-read the hook's result.
    tabberWidget = result.current.widgets.find((w) => w.id === 'tabber1') as any;
    expect(tabberWidget.selectedTab).toBe(1);
  });

  it('should filter layout using the current tab selection state', () => {
    const sampleLayout = {
      columns: [
        {
          widthPercentage: 100,
          rows: [
            {
              cells: [
                { widgetId: 'tabber1', widthPercentage: 30, height: '100px' },
                { widgetId: 'w1', widthPercentage: 15, height: '100px' },
                { widgetId: 'w2', widthPercentage: 15, height: '100px' },
                { widgetId: 'w3', widthPercentage: 20, height: '100px' },
                { widgetId: 'wX', widthPercentage: 20, height: '100px' },
              ],
            },
          ],
        },
      ],
    };

    const { result, rerender } = renderHook(
      ({ widgets, config }) => useTabber({ widgets, config }),
      { initialProps: { widgets, config: dashboardTabberConfig } },
    );

    // When activeTab is 0, expected: cells "w1", "w2" and "wX" remain.
    const layoutManager0 = result.current.layoutManager;
    const filteredLayout0 = layoutManager0.manageLayout(sampleLayout);

    // when we delete some widget from a layout, we need to increase length of other widgets
    // const factor1 = 100 / (30 + 15 + 15 + 20);
    expect(filteredLayout0.columns[0].rows[0].cells).toHaveLength(4);
    expect(
      filteredLayout0.columns[0].rows[0].cells.find((c: any) => c.widgetId === 'w1')
        ?.widthPercentage,
    ).toBeCloseTo(25);
    expect(
      filteredLayout0.columns[0].rows[0].cells.find((c: any) => c.widgetId === 'w2')
        ?.widthPercentage,
    ).toBeCloseTo(25);
    // "wX" remains because it is not affected by tabber config.
    expect(
      filteredLayout0.columns[0].rows[0].cells.find((c: any) => c.widgetId === 'wX'),
    ).toBeDefined();
    // "w3" should be filtered out.
    expect(
      filteredLayout0.columns[0].rows[0].cells.find((c: any) => c.widgetId === 'w3'),
    ).toBeUndefined();

    // Now update the tab selection for "tabber1" to 1.
    // Because the tabber widget has id "tabber1" and matches the config key,
    // calling its onTabSelected should update the active tab used by filterLayout.
    const tabberWidget = result.current.widgets.find((w) => w.id === 'tabber1') as any;
    act(() => {
      tabberWidget.onTabSelected(1);
    });
    // Rerender to update the hook state.
    rerender({ widgets, config: dashboardTabberConfig });
    // Now activeTab for "tabber1" is 1: expected: only "w3" from the config is visible,
    // while "w1" and "w2" should be filtered out. "wX" still remains.
    const layoutManager1 = result.current.layoutManager;
    const filteredLayout1 = layoutManager1.manageLayout(sampleLayout);
    // when we delete some widget from a layout, we need to increase length of other widgets
    // const factor2 = 100 / (30 + 20 + 20);
    expect(filteredLayout1.columns[0].rows[0].cells).toHaveLength(3);
    // "w3" remains and its width is adjusted.
    expect(
      filteredLayout1.columns[0].rows[0].cells.find((c: any) => c.widgetId === 'w3')
        ?.widthPercentage,
    ).toBeCloseTo(33.333);
    // "wX" remains unchanged aside from width adjustment.
    expect(
      filteredLayout1.columns[0].rows[0].cells.find((c: any) => c.widgetId === 'wX')
        ?.widthPercentage,
    ).toBeCloseTo(33.333);
    // "w1" and "w2" should be filtered out.
    expect(
      filteredLayout1.columns[0].rows[0].cells.find((c: any) => c.widgetId === 'w1'),
    ).toBeUndefined();
    expect(
      filteredLayout1.columns[0].rows[0].cells.find((c: any) => c.widgetId === 'w2'),
    ).toBeUndefined();
  });

  it('should filter layout correctly when two tabber widgets affect separate rows and leave unaffected rows unchanged', () => {
    // Sample layout: one column with three rows.
    // Row 1: Three cells where tabber1 will affect widgets "w1" and "w2" (wX is not mentioned in any tabber config).
    // Row 2: Two cells where tabber2 will affect widgets "w3" and "w4".
    // Row 3: Two cells with widgets "w5" and "w6" that are not affected by any tabber.
    const sampleLayout = {
      columns: [
        {
          widthPercentage: 100,
          rows: [
            {
              cells: [
                { widgetId: 'tabber1', widthPercentage: 25, height: '100px' },
                { widgetId: 'w1', widthPercentage: 25, height: '100px' },
                { widgetId: 'w2', widthPercentage: 25, height: '100px' },
                { widgetId: 'wX', widthPercentage: 25, height: '100px' },
              ],
            },
            {
              cells: [
                { widgetId: 'tabber2', widthPercentage: 30, height: '100px' },
                { widgetId: 'w3', widthPercentage: 40, height: '100px' },
                { widgetId: 'w4', widthPercentage: 20, height: '100px' },
              ],
            },
            {
              cells: [
                { widgetId: 'w5', widthPercentage: 50, height: '100px' },
                { widgetId: 'w6', widthPercentage: 50, height: '100px' },
              ],
            },
          ],
        },
      ],
    };

    // Dashboard tabber configuration with two tabbers.
    // For tabber1:
    //   - Tab 0 shows widget "w1"
    //   - Tab 1 shows widget "w2"
    // For tabber2:
    //   - Tab 0 shows widget "w3"
    //   - Tab 1 shows widget "w4"
    const dashboardTabberConfig = {
      tabber1: {
        activeTab: 0,
        tabs: [
          { displayWidgetIds: ['w1'], hideWidgetIds: [], title: 'Tab 0 for tabber1' },
          { displayWidgetIds: ['w2'], hideWidgetIds: [], title: 'Tab 1 for tabber1' },
        ],
      },
      tabber2: {
        activeTab: 0,
        tabs: [
          { displayWidgetIds: ['w3'], hideWidgetIds: [], title: 'Tab 0 for tabber2' },
          { displayWidgetIds: ['w4'], hideWidgetIds: [], title: 'Tab 1 for tabber2' },
        ],
      },
    };

    const widgetsWithTwoTabbers: WidgetProps[] = [
      { id: 'tabber1', pluginType: 'WidgetsTabber', name: 'Tabber 1' } as unknown as WidgetProps,
      { id: 'tabber2', pluginType: 'WidgetsTabber', name: 'Tabber 2' } as unknown as WidgetProps,
      { id: 'wX', pluginType: 'OtherWidget', name: 'Regular Widget' } as unknown as WidgetProps,
    ];

    const { result, rerender } = renderHook(
      ({ widgets, config }) => useTabber({ widgets, config }),
      { initialProps: { widgets: widgetsWithTwoTabbers, config: dashboardTabberConfig } },
    );

    // --- Initial State ---
    // With activeTab 0 for both tabber1 and tabber2:
    // Row 1:
    //   - "w1" should be visible (belongs to tabber1, tab0).
    //   - "w2" should be filtered out (belongs to tabber1 but not in tab0).
    //   - "wX" remains because it's not mentioned in any config.
    // Row 2:
    //   - "w3" should be visible (belongs to tabber2, tab0).
    //   - "w4" should be filtered out.
    // Row 3: remains unchanged.
    const layoutManagerInitial = result.current.layoutManager;
    const filteredLayoutInitial = layoutManagerInitial.manageLayout(sampleLayout);

    // Row 1: originally 3 cells, filtered count should be 2 (w1 and wX), so adjustment factor is 3/2.
    expect(filteredLayoutInitial.columns[0].rows[0].cells).toHaveLength(3);
    const row1CellsInitial = filteredLayoutInitial.columns[0].rows[0].cells;
    expect(row1CellsInitial.find((c: any) => c.widgetId === 'w1')).toBeDefined();
    expect(row1CellsInitial.find((c: any) => c.widgetId === 'w2')).toBeUndefined();
    expect(row1CellsInitial.find((c: any) => c.widgetId === 'wX')).toBeDefined();

    // Row 2: originally 2 cells, filtered count should be 1 (w3), adjustment factor is 2.
    expect(filteredLayoutInitial.columns[0].rows[1].cells).toHaveLength(2);
    const row2CellsInitial = filteredLayoutInitial.columns[0].rows[1].cells;
    expect(row2CellsInitial.find((c: any) => c.widgetId === 'w3')).toBeDefined();
    expect(row2CellsInitial.find((c: any) => c.widgetId === 'w4')).toBeUndefined();

    // Row 3: Should remain unchanged.
    expect(filteredLayoutInitial.columns[0].rows[2].cells).toHaveLength(2);
    //
    // --- Update Tab Selection ---
    // Change tabber1 to tab 1 (which shows "w2") and tabber2 to tab 1 (which shows "w4").
    const tabberWidget1 = result.current.widgets.find((w) => w.id === 'tabber1') as any;
    const tabberWidget2 = result.current.widgets.find((w) => w.id === 'tabber2') as any;
    act(() => {
      tabberWidget1.onTabSelected(1);
      tabberWidget2.onTabSelected(1);
    });
    // Rerender to update state.
    rerender({ widgets: widgetsWithTwoTabbers, config: dashboardTabberConfig });

    const layoutManagerUpdated = result.current.layoutManager;
    const filteredLayoutUpdated = layoutManagerUpdated.manageLayout(sampleLayout);

    // After updating:
    // Row 1:
    //   - "w2" should now be visible (from tabber1 active tab 1).
    //   - "w1" should be filtered out.
    //   - "wX" remains.
    // Row 2:
    //   - "w4" should be visible (from tabber2 active tab 1).
    //   - "w3" should be filtered out.
    // Row 3: remains unchanged.
    expect(filteredLayoutUpdated.columns[0].rows[0].cells).toHaveLength(3);
    const row1CellsUpdated = filteredLayoutUpdated.columns[0].rows[0].cells;
    expect(row1CellsUpdated.find((c: any) => c.widgetId === 'w2')).toBeDefined();
    expect(row1CellsUpdated.find((c: any) => c.widgetId === 'w1')).toBeUndefined();
    expect(row1CellsUpdated.find((c: any) => c.widgetId === 'wX')).toBeDefined();

    expect(filteredLayoutUpdated.columns[0].rows[1].cells).toHaveLength(2);
    const row2CellsUpdated = filteredLayoutUpdated.columns[0].rows[1].cells;
    expect(row2CellsUpdated.find((c: any) => c.widgetId === 'w4')).toBeDefined();
    expect(row2CellsUpdated.find((c: any) => c.widgetId === 'w3')).toBeUndefined();

    // Row 3 should be unaffected.
    expect(filteredLayoutUpdated.columns[0].rows[2].cells).toHaveLength(2);
  });

  it('should initialize selectedTabs based on initial tabbersConfigs', () => {
    const initialConfig = {
      tabber1: {
        activeTab: 0,
        tabs: [
          { displayWidgetIds: ['w1', 'w2'], title: 'Tab 0' },
          { displayWidgetIds: ['w3'], title: 'Tab 1' },
        ],
      },
    };
    const { result } = renderHook(() => useTabber({ widgets: widgets, config: initialConfig }));

    const tabberWidget = result.current.widgets.find((w) => w.id === 'tabber1') as any;
    expect(tabberWidget.selectedTab).toBe(0);
  });

  it('should update selectedTabs when tabbersConfigs is updated', async () => {
    const initialProps: { config: Record<string, any>; widgets: WidgetProps[] } = {
      config: {
        tabber1: {
          activeTab: 0,
          tabs: [
            { displayWidgetIds: ['w1', 'w2'], title: 'Tab 0' },
            { displayWidgetIds: ['w3'], title: 'Tab 1' },
          ],
        },
      },
      widgets: [
        {
          id: 'tabber1',
          pluginType: 'WidgetsTabber',
          name: 'Tabber Widget',
        } as unknown as WidgetProps,
        { id: 'wX', pluginType: 'OtherWidget', name: 'Regular Widget' } as unknown as WidgetProps,
      ],
    };

    const { result, rerender } = renderHook(
      ({ config, widgets }) => useTabber({ config, widgets }),
      { initialProps },
    );

    let tabberWidget = result.current.widgets.find((w) => w.id === 'tabber1') as any;
    expect(tabberWidget.selectedTab).toBe(0);

    const updatedProps: { config: Record<string, any>; widgets: WidgetProps[] } = {
      config: {
        tabber2: {
          activeTab: 1,
          tabs: [
            { displayWidgetIds: ['w1', 'w2'], title: 'Tab 0' },
            { displayWidgetIds: ['w3'], title: 'Tab 1' },
          ],
        },
      },
      widgets: [
        {
          id: 'tabber2',
          pluginType: 'WidgetsTabber',
          name: 'Tabber Widget',
        } as unknown as WidgetProps,
        { id: 'wX', pluginType: 'OtherWidget', name: 'Regular Widget' } as unknown as WidgetProps,
      ],
    };

    rerender(updatedProps);

    tabberWidget = result.current.widgets.find((w) => w.id === 'tabber2') as any;
    expect(tabberWidget.selectedTab).toBe(1);
  });
});
