import { act, renderHook } from '@testing-library/react';

import { TabberButtonsWidgetProps, WidgetProps } from '@/props';

import { isTabberButtonsWidget, modifyLayout, useTabber } from './use-tabber';

describe('isTabberButtonsWidget', () => {
  it('should return true for widget with customWidgetType "tabber-buttons"', () => {
    const widget: WidgetProps = {
      id: 'w1',
      widgetType: 'custom',
      customWidgetType: 'tabber-buttons',
      dataOptions: {},
    };
    expect(isTabberButtonsWidget(widget)).toBe(true);
  });

  it('should return false for widget with any other customWidgetType', () => {
    const widget: WidgetProps = {
      id: 'w2',
      widgetType: 'custom',
      customWidgetType: 'OtherWidget',
      dataOptions: {},
    };
    expect(isTabberButtonsWidget(widget)).toBe(false);
  });
});

describe('modifyLayout', () => {
  const dashboardTabberConfig = {
    tabber1: {
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

  it('should mark cells as hidden based on the active tab instead of removing them', () => {
    const modifiedLayout = modifyLayout(dashboardTabberConfig, selectedTabs)(layout);
    // All cells should remain in the layout, but some should be marked as hidden.
    expect(modifiedLayout.columns[0].rows[0].cells).toHaveLength(3);

    // Find cells by widgetId and check their hidden property
    const w1Cell = modifiedLayout.columns[0].rows[0].cells.find((cell) => cell.widgetId === 'w1');
    const w2Cell = modifiedLayout.columns[0].rows[0].cells.find((cell) => cell.widgetId === 'w2');
    const w3Cell = modifiedLayout.columns[0].rows[0].cells.find((cell) => cell.widgetId === 'w3');

    // w1 and w2 should be visible (not hidden)
    expect(w1Cell?.hidden).toBe(false);
    expect(w2Cell?.hidden).toBe(false);

    // w3 should be hidden since it's not in the active tab
    expect(w3Cell?.hidden).toBe(true);

    // Original widths should be preserved
    expect(w1Cell?.widthPercentage).toBe(30);
    expect(w2Cell?.widthPercentage).toBe(40);
    expect(w3Cell?.widthPercentage).toBe(30);
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

    const modifiedLayout = modifyLayout({}, selectedTabs)(layoutUnaffected);
    // Expect the row to remain intact with no hidden properties added.
    expect(modifiedLayout.columns[0].rows[0].cells).toHaveLength(2);

    // Cells should not have hidden property since they're not affected by tabber config
    const wXCell = modifiedLayout.columns[0].rows[0].cells.find((cell) => cell.widgetId === 'wX');
    const wYCell = modifiedLayout.columns[0].rows[0].cells.find((cell) => cell.widgetId === 'wY');

    expect(wXCell).not.toHaveProperty('hidden');
    expect(wYCell).not.toHaveProperty('hidden');
    expect(wXCell?.widthPercentage).toBe(50);
    expect(wYCell?.widthPercentage).toBe(50);
  });
});

describe('useTabber hook', () => {
  const dashboardTabberConfig = {
    tabber1: {
      tabs: [
        { displayWidgetIds: ['w1', 'w2'], title: 'Tab 0' },
        { displayWidgetIds: ['w3'], title: 'Tab 1' },
      ],
    },
  };

  const widgets: WidgetProps[] = [
    {
      id: 'tabber1',
      widgetType: 'custom',
      customWidgetType: 'tabber-buttons',
      dataOptions: {},
      customOptions: {
        tabNames: ['Tab 0', 'Tab 1'],
        activeTab: 0,
      },
      styleOptions: {
        showTitle: false,
        showSeparators: true,
        showDescription: false,
        useSelectedBkg: false,
        useUnselectedBkg: false,
        selectedColor: '#FFCB05',
        unselectedColor: '#9EA2AB',
        descriptionColor: '#9EA2AB',
        selectedBackgroundColor: '#FFFFFF',
        unselectedBackgroundColor: '#FFFFFF',
        tabsSize: 'medium',
        tabsInterval: 'medium',
        tabsAlignment: 'center',
        tabCornerRadius: 'none',
      },
      title: 'Tabber Widget',
    },
    {
      id: 'wX',
      widgetType: 'custom',
      customWidgetType: 'OtherWidget',
      dataOptions: {},
      title: 'Regular Widget',
    },
  ];

  it('should augment tabber widgets with onTabSelected callback and activeTab property', () => {
    const { result } = renderHook(() => useTabber({ widgets, config: dashboardTabberConfig }));

    const returnedWidgets = result.current.widgets;
    // Find the tabber widget.
    const tabberWidget: TabberButtonsWidgetProps = returnedWidgets.find(
      (w) => w.id === 'tabber1',
    )! as unknown as TabberButtonsWidgetProps;
    expect(tabberWidget).toBeDefined();
    // Should include a callback and activeTab in customOptions.
    expect(tabberWidget.customOptions.onTabSelected).toBeInstanceOf(Function);
    expect(tabberWidget.customOptions.activeTab).toBe(0);

    // The non-tabber widget should remain unchanged.
    const nonTabberButtonsWidget = returnedWidgets.find((w) => w.id === 'wX');
    expect(nonTabberButtonsWidget).not.toHaveProperty('customOptions.onTabSelected');
  });

  it('should update the activeTab state when onTabSelected is called', () => {
    const { result } = renderHook(() => useTabber({ widgets, config: dashboardTabberConfig }));

    // Get the tabber widget and call its onTabSelected to change active tab to 1.
    let tabberWidget = result.current.widgets.find((w) => w.id === 'tabber1') as any;
    act(() => {
      tabberWidget.customOptions.onTabSelected(1);
    });
    // Re-read the hook's result.
    tabberWidget = result.current.widgets.find((w) => w.id === 'tabber1') as any;
    expect(tabberWidget.customOptions.activeTab).toBe(1);
  });

  it('should mark cells as hidden using the current tab selection state', () => {
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

    // When activeTab is 0, expected: cells "w1", "w2" and "wX" are visible, "w3" is hidden.
    const layoutManager0 = result.current.layoutManager;
    const filteredLayout0 = layoutManager0.manageLayout(sampleLayout);

    // All cells should remain in the layout
    expect(filteredLayout0.columns[0].rows[0].cells).toHaveLength(5);

    // Check hidden properties for each cell
    const w1Cell = filteredLayout0.columns[0].rows[0].cells.find((c: any) => c.widgetId === 'w1');
    const w2Cell = filteredLayout0.columns[0].rows[0].cells.find((c: any) => c.widgetId === 'w2');
    const w3Cell = filteredLayout0.columns[0].rows[0].cells.find((c: any) => c.widgetId === 'w3');
    const wXCell = filteredLayout0.columns[0].rows[0].cells.find((c: any) => c.widgetId === 'wX');

    expect(w1Cell?.hidden).toBe(false);
    expect(w2Cell?.hidden).toBe(false);
    expect(w3Cell?.hidden).toBe(true); // w3 is not in activeTab 0

    // Original widths should be preserved
    expect(w1Cell?.widthPercentage).toBe(15);
    expect(w2Cell?.widthPercentage).toBe(15);
    expect(w3Cell?.widthPercentage).toBe(20);
    expect(wXCell?.widthPercentage).toBe(20);

    // Now update the tab selection for "tabber1" to 1.
    const tabberWidget = result.current.widgets.find((w) => w.id === 'tabber1') as any;
    act(() => {
      tabberWidget.customOptions.onTabSelected(1);
    });
    // Rerender to update the hook state.
    rerender({ widgets, config: dashboardTabberConfig });

    // Now activeTab for "tabber1" is 1: expected: only "w3" is visible, "w1" and "w2" are hidden.
    const layoutManager1 = result.current.layoutManager;
    const filteredLayout1 = layoutManager1.manageLayout(sampleLayout);

    // All cells should still remain in the layout
    expect(filteredLayout1.columns[0].rows[0].cells).toHaveLength(5);

    // Check hidden properties after tab change
    const w1CellAfter = filteredLayout1.columns[0].rows[0].cells.find(
      (c: any) => c.widgetId === 'w1',
    );
    const w2CellAfter = filteredLayout1.columns[0].rows[0].cells.find(
      (c: any) => c.widgetId === 'w2',
    );
    const w3CellAfter = filteredLayout1.columns[0].rows[0].cells.find(
      (c: any) => c.widgetId === 'w3',
    );
    const wXCellAfter = filteredLayout1.columns[0].rows[0].cells.find(
      (c: any) => c.widgetId === 'wX',
    );

    expect(w1CellAfter?.hidden).toBe(true); // w1 is not in activeTab 1
    expect(w2CellAfter?.hidden).toBe(true); // w2 is not in activeTab 1
    expect(w3CellAfter?.hidden).toBe(false); // w3 is in activeTab 1

    // Original widths should still be preserved
    expect(w1CellAfter?.widthPercentage).toBe(15);
    expect(w2CellAfter?.widthPercentage).toBe(15);
    expect(w3CellAfter?.widthPercentage).toBe(20);
    expect(wXCellAfter?.widthPercentage).toBe(20);
  });

  it('should mark cells as hidden correctly when two tabber widgets', () => {
    // Sample layout: one column with three rows.
    // Row 1: Three cells where tabber1 will affect widgets "w1" and "w2" (wX is not mentioned in any tabber config).
    // Row 2: Two cells where tabber2 will affect widgets "w3" and "w4".
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
        tabs: [
          { displayWidgetIds: ['w1'], hideWidgetIds: [], title: 'Tab 0 for tabber1' },
          { displayWidgetIds: ['w2'], hideWidgetIds: [], title: 'Tab 1 for tabber1' },
        ],
      },
      tabber2: {
        tabs: [
          { displayWidgetIds: ['w3'], hideWidgetIds: [], title: 'Tab 0 for tabber2' },
          { displayWidgetIds: ['w4'], hideWidgetIds: [], title: 'Tab 1 for tabber2' },
        ],
      },
    };

    const widgetsWithTwoTabbers: WidgetProps[] = [
      {
        id: 'tabber1',
        widgetType: 'custom',
        customWidgetType: 'tabber-buttons',
        dataOptions: {},
        customOptions: {
          tabNames: ['Tab 0 for tabber1', 'Tab 1 for tabber1'],
          activeTab: 0,
        },
        styleOptions: {
          showTitle: false,
          showSeparators: true,
          showDescription: false,
          useSelectedBkg: false,
          useUnselectedBkg: false,
          selectedColor: '#FFCB05',
          unselectedColor: '#9EA2AB',
          descriptionColor: '#9EA2AB',
          selectedBackgroundColor: '#FFFFFF',
          unselectedBackgroundColor: '#FFFFFF',
          tabsSize: 'medium',
          tabsInterval: 'medium',
          tabsAlignment: 'center',
          tabCornerRadius: 'none',
        },
        title: 'Tabber 1',
      },
      {
        id: 'tabber2',
        widgetType: 'custom',
        customWidgetType: 'tabber-buttons',
        dataOptions: {},
        customOptions: {
          tabNames: ['Tab 0 for tabber2', 'Tab 1 for tabber2'],
          activeTab: 0,
        },
        styleOptions: {
          showTitle: false,
          showSeparators: true,
          showDescription: false,
          useSelectedBkg: false,
          useUnselectedBkg: false,
          selectedColor: '#FFCB05',
          unselectedColor: '#9EA2AB',
          descriptionColor: '#9EA2AB',
          selectedBackgroundColor: '#FFFFFF',
          unselectedBackgroundColor: '#FFFFFF',
          tabsSize: 'medium',
          tabsInterval: 'medium',
          tabsAlignment: 'center',
          tabCornerRadius: 'none',
        },
        title: 'Tabber 2',
      },
      {
        id: 'wX',
        widgetType: 'custom',
        customWidgetType: 'OtherWidget',
        dataOptions: {},
        title: 'Regular Widget',
      },
    ];

    const { result, rerender } = renderHook(
      ({ widgets, config }) => useTabber({ widgets, config }),
      { initialProps: { widgets: widgetsWithTwoTabbers, config: dashboardTabberConfig } },
    );

    // --- Initial State ---
    // With activeTab 0 for both tabber1 and tabber2:
    // Row 1:
    //   - "w1" should be visible (belongs to tabber1, tab0).
    //   - "w2" should be hidden (belongs to tabber1 but not in tab0).
    //   - "wX" remains visible because it's not mentioned in any config.
    // Row 2:
    //   - "w3" should be visible (belongs to tabber2, tab0).
    //   - "w4" should be hidden.
    // Row 3: remains unchanged.
    const layoutManagerInitial = result.current.layoutManager;
    const filteredLayoutInitial = layoutManagerInitial.manageLayout(sampleLayout);

    // All cells should remain in the layout
    expect(filteredLayoutInitial.columns[0].rows[0].cells).toHaveLength(4);
    expect(filteredLayoutInitial.columns[0].rows[1].cells).toHaveLength(3);
    expect(filteredLayoutInitial.columns[0].rows[2].cells).toHaveLength(2);

    // Check Row 1 hidden properties
    const row1CellsInitial = filteredLayoutInitial.columns[0].rows[0].cells;
    const w1CellInitial = row1CellsInitial.find((c: any) => c.widgetId === 'w1');
    const w2CellInitial = row1CellsInitial.find((c: any) => c.widgetId === 'w2');

    expect(w1CellInitial?.hidden).toBe(false);
    expect(w2CellInitial?.hidden).toBe(true);

    // Check Row 2 hidden properties
    const row2CellsInitial = filteredLayoutInitial.columns[0].rows[1].cells;
    const w3CellInitial = row2CellsInitial.find((c: any) => c.widgetId === 'w3');
    const w4CellInitial = row2CellsInitial.find((c: any) => c.widgetId === 'w4');

    expect(w3CellInitial?.hidden).toBe(false);
    expect(w4CellInitial?.hidden).toBe(true);

    // --- Update Tab Selection ---
    // Change tabber1 to tab 1 (which shows "w2") and tabber2 to tab 1 (which shows "w4").
    const tabberWidget1 = result.current.widgets.find((w) => w.id === 'tabber1') as any;
    const tabberWidget2 = result.current.widgets.find((w) => w.id === 'tabber2') as any;
    act(() => {
      tabberWidget1.customOptions.onTabSelected(1);
      tabberWidget2.customOptions.onTabSelected(1);
    });
    // Rerender to update state.
    rerender({ widgets: widgetsWithTwoTabbers, config: dashboardTabberConfig });

    const layoutManagerUpdated = result.current.layoutManager;
    const filteredLayoutUpdated = layoutManagerUpdated.manageLayout(sampleLayout);

    // All cells should still remain in the layout
    expect(filteredLayoutUpdated.columns[0].rows[0].cells).toHaveLength(4);
    expect(filteredLayoutUpdated.columns[0].rows[1].cells).toHaveLength(3);
    expect(filteredLayoutUpdated.columns[0].rows[2].cells).toHaveLength(2);

    // After updating:
    // Row 1:
    //   - "w2" should now be visible (from tabber1 active tab 1).
    //   - "w1" should be hidden.
    //   - "wX" remains visible.
    const row1CellsUpdated = filteredLayoutUpdated.columns[0].rows[0].cells;
    const w1CellUpdated = row1CellsUpdated.find((c: any) => c.widgetId === 'w1');
    const w2CellUpdated = row1CellsUpdated.find((c: any) => c.widgetId === 'w2');

    expect(w1CellUpdated?.hidden).toBe(true);
    expect(w2CellUpdated?.hidden).toBe(false);

    // Row 2:
    //   - "w4" should be visible (from tabber2 active tab 1).
    //   - "w3" should be hidden.
    const row2CellsUpdated = filteredLayoutUpdated.columns[0].rows[1].cells;
    const w3CellUpdated = row2CellsUpdated.find((c: any) => c.widgetId === 'w3');
    const w4CellUpdated = row2CellsUpdated.find((c: any) => c.widgetId === 'w4');

    expect(w3CellUpdated?.hidden).toBe(true);
    expect(w4CellUpdated?.hidden).toBe(false);
  });

  it('should initialize selectedTabs based on initial tabbersConfigs', () => {
    const initialConfig = {
      tabber1: {
        tabs: [
          { displayWidgetIds: ['w1', 'w2'], title: 'Tab 0' },
          { displayWidgetIds: ['w3'], title: 'Tab 1' },
        ],
      },
    };
    const { result } = renderHook(() => useTabber({ widgets: widgets, config: initialConfig }));

    const tabberWidget = result.current.widgets.find((w) => w.id === 'tabber1') as any;
    expect(tabberWidget.customOptions.activeTab).toBe(0);
  });

  it('should update selectedTabs when tabbersConfigs is updated', async () => {
    const initialProps: { config: Record<string, any>; widgets: WidgetProps[] } = {
      config: {
        tabber1: {
          tabs: [
            { displayWidgetIds: ['w1', 'w2'], title: 'Tab 0' },
            { displayWidgetIds: ['w3'], title: 'Tab 1' },
          ],
        },
      },
      widgets: [
        {
          id: 'tabber1',
          widgetType: 'custom',
          customWidgetType: 'tabber-buttons',
          dataOptions: {},
          customOptions: {
            tabNames: ['Tab 0', 'Tab 1'],
            activeTab: 0,
          },
          styleOptions: {
            showTitle: false,
            showSeparators: true,
            showDescription: false,
            useSelectedBkg: false,
            useUnselectedBkg: false,
            selectedColor: '#FFCB05',
            unselectedColor: '#9EA2AB',
            descriptionColor: '#9EA2AB',
            selectedBackgroundColor: '#FFFFFF',
            unselectedBackgroundColor: '#FFFFFF',
            tabsSize: 'MEDIUM',
            tabsInterval: 'MEDIUM',
            tabsAlignment: 'CENTER',
            tabCornerRadius: 'NONE',
          },
          title: 'Tabber Widget',
        },
        {
          id: 'wX',
          widgetType: 'custom',
          customWidgetType: 'OtherWidget',
          dataOptions: {},
          title: 'Regular Widget',
        },
      ],
    };

    const { result, rerender } = renderHook(
      ({ config, widgets }) => useTabber({ config, widgets }),
      { initialProps },
    );

    let tabberWidget = result.current.widgets.find((w) => w.id === 'tabber1') as any;
    expect(tabberWidget.customOptions.activeTab).toBe(0);

    const updatedProps: { config: Record<string, any>; widgets: WidgetProps[] } = {
      config: {
        tabber2: {
          tabs: [
            { displayWidgetIds: ['w1', 'w2'], title: 'Tab 0' },
            { displayWidgetIds: ['w3'], title: 'Tab 1' },
          ],
        },
      },
      widgets: [
        {
          id: 'tabber2',
          widgetType: 'custom',
          customWidgetType: 'tabber-buttons',
          dataOptions: {},
          customOptions: {
            tabNames: ['Tab 0', 'Tab 1'],
            activeTab: 1,
          },
          styleOptions: {
            showTitle: false,
            showSeparators: true,
            showDescription: false,
            useSelectedBkg: false,
            useUnselectedBkg: false,
            selectedColor: '#FFCB05',
            unselectedColor: '#9EA2AB',
            descriptionColor: '#9EA2AB',
            selectedBackgroundColor: '#FFFFFF',
            unselectedBackgroundColor: '#FFFFFF',
            tabsSize: 'MEDIUM',
            tabsInterval: 'MEDIUM',
            tabsAlignment: 'CENTER',
            tabCornerRadius: 'NONE',
          },
          title: 'Tabber Widget',
        },
        {
          id: 'wX',
          widgetType: 'custom',
          customWidgetType: 'OtherWidget',
          dataOptions: {},
          title: 'Regular Widget',
        },
      ],
    };

    rerender(updatedProps);

    tabberWidget = result.current.widgets.find((w) => w.id === 'tabber2') as any;
    expect(tabberWidget.customOptions.activeTab).toBe(1);
  });

  describe('tabber deletion handling', () => {
    const dashboardTabberConfig = {
      tabber1: {
        tabs: [
          { displayWidgetIds: ['w1', 'w2'], title: 'Tab 0' },
          { displayWidgetIds: ['w3'], title: 'Tab 1' },
        ],
      },
      tabber2: {
        tabs: [
          { displayWidgetIds: ['w4'], title: 'Tab 0' },
          { displayWidgetIds: ['w5'], title: 'Tab 1' },
        ],
      },
    };

    const widgets: WidgetProps[] = [
      {
        id: 'tabber1',
        widgetType: 'custom',
        customWidgetType: 'tabber-buttons',
        dataOptions: {},
        customOptions: {
          tabNames: ['Tab 0', 'Tab 1'],
          activeTab: 0,
        },
        styleOptions: {
          showTitle: false,
          showSeparators: true,
          showDescription: false,
          useSelectedBkg: false,
          useUnselectedBkg: false,
          selectedColor: '#FFCB05',
          unselectedColor: '#9EA2AB',
          descriptionColor: '#9EA2AB',
          selectedBackgroundColor: '#FFFFFF',
          unselectedBackgroundColor: '#FFFFFF',
          tabsSize: 'medium',
          tabsInterval: 'medium',
          tabsAlignment: 'center',
          tabCornerRadius: 'none',
        },
        title: 'Tabber 1',
      },
      {
        id: 'tabber2',
        widgetType: 'custom',
        customWidgetType: 'tabber-buttons',
        dataOptions: {},
        customOptions: {
          tabNames: ['Tab 0', 'Tab 1'],
          activeTab: 0,
        },
        styleOptions: {
          showTitle: false,
          showSeparators: true,
          showDescription: false,
          useSelectedBkg: false,
          useUnselectedBkg: false,
          selectedColor: '#FFCB05',
          unselectedColor: '#9EA2AB',
          descriptionColor: '#9EA2AB',
          selectedBackgroundColor: '#FFFFFF',
          unselectedBackgroundColor: '#FFFFFF',
          tabsSize: 'medium',
          tabsInterval: 'medium',
          tabsAlignment: 'center',
          tabCornerRadius: 'none',
        },
        title: 'Tabber 2',
      },
    ];

    it('should unhide widgets controlled by a deleted tabber', () => {
      // Layout after tabber1 is deleted
      const layoutWithoutTabber = {
        columns: [
          {
            widthPercentage: 100,
            rows: [
              {
                cells: [
                  { widgetId: 'w1', widthPercentage: 25, height: '100px', hidden: true },
                  { widgetId: 'w2', widthPercentage: 25, height: '100px', hidden: true },
                  { widgetId: 'w3', widthPercentage: 25, height: '100px', hidden: true },
                ],
              },
            ],
          },
        ],
      };

      const { result } = renderHook(() => useTabber({ widgets, config: dashboardTabberConfig }));

      const layoutManager = result.current.layoutManager;
      const filteredLayout = layoutManager.manageLayout(layoutWithoutTabber);

      // All widgets controlled by deleted tabber1 should be visible
      const w1Cell = filteredLayout.columns[0].rows[0].cells.find((c: any) => c.widgetId === 'w1');
      const w2Cell = filteredLayout.columns[0].rows[0].cells.find((c: any) => c.widgetId === 'w2');
      const w3Cell = filteredLayout.columns[0].rows[0].cells.find((c: any) => c.widgetId === 'w3');

      expect(w1Cell?.hidden).toBe(false);
      expect(w2Cell?.hidden).toBe(false);
      expect(w3Cell?.hidden).toBe(false);
    });

    it('should only unhide widgets controlled by the deleted tabber, not others', () => {
      // Layout after tabber1 is deleted (but tabber2 remains)
      const layoutWithOnlyTabber2 = {
        columns: [
          {
            widthPercentage: 100,
            rows: [
              {
                cells: [
                  { widgetId: 'w1', widthPercentage: 20, height: '100px', hidden: true },
                  { widgetId: 'w2', widthPercentage: 20, height: '100px', hidden: true },
                ],
              },
              {
                cells: [
                  { widgetId: 'tabber2', widthPercentage: 20, height: '100px' },
                  { widgetId: 'w4', widthPercentage: 20, height: '100px', hidden: false },
                  { widgetId: 'w5', widthPercentage: 20, height: '100px', hidden: true },
                ],
              },
            ],
          },
        ],
      };

      const { result } = renderHook(() => useTabber({ widgets, config: dashboardTabberConfig }));

      const layoutManager = result.current.layoutManager;
      const filteredLayout = layoutManager.manageLayout(layoutWithOnlyTabber2);

      // Widgets controlled by deleted tabber1 should be visible
      const w1Cell = filteredLayout.columns[0].rows[0].cells.find((c: any) => c.widgetId === 'w1');
      const w2Cell = filteredLayout.columns[0].rows[0].cells.find((c: any) => c.widgetId === 'w2');

      expect(w1Cell?.hidden).toBe(false);
      expect(w2Cell?.hidden).toBe(false);

      // Widgets controlled by remaining tabber2 should still respect tabber2's visibility
      const w4Cell = filteredLayout.columns[0].rows[1].cells.find((c: any) => c.widgetId === 'w4');
      const w5Cell = filteredLayout.columns[0].rows[1].cells.find((c: any) => c.widgetId === 'w5');

      // w4 is in tabber2's active tab (tab 0), so it should be visible
      expect(w4Cell?.hidden).toBe(false);
      // w5 is not in tabber2's active tab (tab 0), so it should be hidden
      expect(w5Cell?.hidden).toBe(true);
    });

    it('should handle deletion of multiple tabbers', () => {
      // Layout after both tabbers are deleted
      const layoutWithoutTabbers = {
        columns: [
          {
            widthPercentage: 100,
            rows: [
              {
                cells: [
                  { widgetId: 'w1', widthPercentage: 20, height: '100px', hidden: true },
                  { widgetId: 'w2', widthPercentage: 20, height: '100px', hidden: true },
                ],
              },
              {
                cells: [
                  { widgetId: 'w4', widthPercentage: 20, height: '100px', hidden: true },
                  { widgetId: 'w5', widthPercentage: 20, height: '100px', hidden: true },
                ],
              },
            ],
          },
        ],
      };

      const { result } = renderHook(() => useTabber({ widgets, config: dashboardTabberConfig }));

      const layoutManager = result.current.layoutManager;
      const filteredLayout = layoutManager.manageLayout(layoutWithoutTabbers);

      // All widgets controlled by deleted tabbers should be visible
      const w1Cell = filteredLayout.columns[0].rows[0].cells.find((c: any) => c.widgetId === 'w1');
      const w2Cell = filteredLayout.columns[0].rows[0].cells.find((c: any) => c.widgetId === 'w2');
      const w4Cell = filteredLayout.columns[0].rows[1].cells.find((c: any) => c.widgetId === 'w4');
      const w5Cell = filteredLayout.columns[0].rows[1].cells.find((c: any) => c.widgetId === 'w5');

      expect(w1Cell?.hidden).toBe(false);
      expect(w2Cell?.hidden).toBe(false);
      expect(w4Cell?.hidden).toBe(false);
      expect(w5Cell?.hidden).toBe(false);
    });

    it('should return layout unchanged when no tabbers config exists', () => {
      const layoutWithHiddenWidgets = {
        columns: [
          {
            widthPercentage: 100,
            rows: [
              {
                cells: [
                  { widgetId: 'w1', widthPercentage: 33, height: '100px', hidden: true },
                  { widgetId: 'w2', widthPercentage: 33, height: '100px', hidden: true },
                  { widgetId: 'w3', widthPercentage: 34, height: '100px', hidden: true },
                ],
              },
            ],
          },
        ],
      };

      const { result } = renderHook(() => useTabber({ widgets, config: {} }));

      const layoutManager = result.current.layoutManager;
      const filteredLayout = layoutManager.manageLayout(layoutWithHiddenWidgets);

      // When no tabber config exists, layout should be returned unchanged
      expect(filteredLayout).toEqual(layoutWithHiddenWidgets);

      const w1Cell = filteredLayout.columns[0].rows[0].cells.find((c: any) => c.widgetId === 'w1');
      const w2Cell = filteredLayout.columns[0].rows[0].cells.find((c: any) => c.widgetId === 'w2');
      const w3Cell = filteredLayout.columns[0].rows[0].cells.find((c: any) => c.widgetId === 'w3');

      // Layout should remain unchanged
      expect(w1Cell?.hidden).toBe(true);
      expect(w2Cell?.hidden).toBe(true);
      expect(w3Cell?.hidden).toBe(true);
    });

    it('should preserve other cell properties when unhiding widgets', () => {
      const layoutWithoutTabber = {
        columns: [
          {
            widthPercentage: 100,
            rows: [
              {
                cells: [
                  {
                    widgetId: 'w1',
                    widthPercentage: 20,
                    height: '100px',
                    hidden: true,
                    minWidth: 100,
                    maxWidth: 500,
                    minHeight: 50,
                    maxHeight: 300,
                  },
                ],
              },
            ],
          },
        ],
      };

      const { result } = renderHook(() => useTabber({ widgets, config: dashboardTabberConfig }));

      const layoutManager = result.current.layoutManager;
      const filteredLayout = layoutManager.manageLayout(layoutWithoutTabber);

      const w1Cell = filteredLayout.columns[0].rows[0].cells.find((c: any) => c.widgetId === 'w1');

      expect(w1Cell?.hidden).toBe(false);
      expect(w1Cell?.widthPercentage).toBe(20);
      expect(w1Cell?.height).toBe('100px');
      expect(w1Cell?.minWidth).toBe(100);
      expect(w1Cell?.maxWidth).toBe(500);
      expect(w1Cell?.minHeight).toBe(50);
      expect(w1Cell?.maxHeight).toBe(300);
    });

    it('should handle complex layout with widgets controlled by multiple tabs of deleted tabber', () => {
      // Layout after tabber1 is deleted
      // tabber1 had two tabs: tab 0 with [w1, w2] and tab 1 with [w3]
      const layoutWithoutTabber = {
        columns: [
          {
            widthPercentage: 100,
            rows: [
              {
                cells: [
                  { widgetId: 'w1', widthPercentage: 25, height: '100px', hidden: true },
                  { widgetId: 'w2', widthPercentage: 25, height: '100px', hidden: true },
                  { widgetId: 'w3', widthPercentage: 25, height: '100px', hidden: true },
                ],
              },
            ],
          },
        ],
      };

      const { result } = renderHook(() => useTabber({ widgets, config: dashboardTabberConfig }));

      const layoutManager = result.current.layoutManager;
      const filteredLayout = layoutManager.manageLayout(layoutWithoutTabber);

      // All widgets from all tabs of deleted tabber1 should be visible
      const w1Cell = filteredLayout.columns[0].rows[0].cells.find((c: any) => c.widgetId === 'w1');
      const w2Cell = filteredLayout.columns[0].rows[0].cells.find((c: any) => c.widgetId === 'w2');
      const w3Cell = filteredLayout.columns[0].rows[0].cells.find((c: any) => c.widgetId === 'w3');

      expect(w1Cell?.hidden).toBe(false);
      expect(w2Cell?.hidden).toBe(false);
      expect(w3Cell?.hidden).toBe(false);
    });

    it('should handle empty layout gracefully', () => {
      const emptyLayout = {
        columns: [],
      };

      const { result } = renderHook(() => useTabber({ widgets, config: dashboardTabberConfig }));

      const layoutManager = result.current.layoutManager;
      const filteredLayout = layoutManager.manageLayout(emptyLayout);

      expect(filteredLayout.columns).toEqual([]);
    });

    it('should handle tabber config with tabber not in widgets array', () => {
      // Config references a tabber that doesn't exist in widgets
      const configWithNonExistentTabber = {
        nonExistentTabber: {
          tabs: [{ displayWidgetIds: ['w1'], title: 'Tab 0' }],
        },
      };

      const layout = {
        columns: [
          {
            widthPercentage: 100,
            rows: [
              {
                cells: [{ widgetId: 'w1', widthPercentage: 100, height: '100px', hidden: true }],
              },
            ],
          },
        ],
      };

      const { result } = renderHook(() =>
        useTabber({ widgets, config: configWithNonExistentTabber }),
      );

      const layoutManager = result.current.layoutManager;
      const filteredLayout = layoutManager.manageLayout(layout);

      // Since the tabber doesn't exist in the layout, its config should be ignored
      // and widgets should be visible
      const w1Cell = filteredLayout.columns[0].rows[0].cells.find((c: any) => c.widgetId === 'w1');

      expect(w1Cell?.hidden).toBe(false);
    });
  });
});
