import { DropType, EditableLayoutDropData } from './types';
import {
  updateLayoutAfterDragAndDrop,
  updateRowHeight,
  updateLayoutWidths,
  findDeletedWidgetsFromLayout,
  deleteWidgetsFromLayout,
  distributeEqualWidthInRow,
} from './helpers';
import { WidgetsPanelLayout } from '@/models';

describe('updateLayoutAfterDragAndDrop', () => {
  const mockLayout: WidgetsPanelLayout = {
    columns: [
      {
        widthPercentage: 50,
        rows: [
          {
            cells: [
              {
                widgetId: 'widget1',
                widthPercentage: 100,
                height: 200,
              },
            ],
          },
        ],
      },
      {
        widthPercentage: 50,
        rows: [
          {
            cells: [
              {
                widgetId: 'widget2',
                widthPercentage: 100,
                height: 200,
              },
            ],
          },
        ],
      },
    ],
  };

  it('should handle SWAP drop type correctly', () => {
    const dragData = {
      widgetId: 'widget1',
      columnIndex: 0,
      rowIndex: 0,
    };

    const dropData: EditableLayoutDropData = {
      type: DropType.SWAP,
      widgetId: 'widget2',
      columnIndex: 1,
      rowIndex: 0,
    };

    const result = updateLayoutAfterDragAndDrop(mockLayout, dragData, dropData);

    expect(result.columns[0].rows[0].cells[0].widgetId).toBe('widget2');
    expect(result.columns[1].rows[0].cells[0].widgetId).toBe('widget1');
  });

  it('should handle NEW_ROW drop type correctly', () => {
    const dragData = {
      widgetId: 'widget1',
      columnIndex: 0,
      rowIndex: 0,
    };

    const dropData: EditableLayoutDropData = {
      type: DropType.NEW_ROW,
      columnIndex: 1,
      rowIndex: 0,
    };

    const result = updateLayoutAfterDragAndDrop(mockLayout, dragData, dropData);

    expect(result.columns[0].rows.length).toBe(0); // Original row should be removed
    expect(result.columns[1].rows.length).toBe(2); // Should have two rows now
    expect(result.columns[1].rows[0].cells[0].widgetId).toBe('widget1');
    expect(result.columns[1].rows[1].cells[0].widgetId).toBe('widget2');
  });

  it('should handle PLACE_LEFT drop type correctly', () => {
    const dragData = {
      widgetId: 'widget1',
      columnIndex: 0,
      rowIndex: 0,
    };

    const dropData: EditableLayoutDropData = {
      type: DropType.PLACE_LEFT,
      widgetId: 'widget2',
      columnIndex: 1,
      rowIndex: 0,
    };

    const result = updateLayoutAfterDragAndDrop(mockLayout, dragData, dropData);

    expect(result.columns[0].rows.length).toBe(0); // Original row should be removed
    expect(result.columns[1].rows[0].cells.length).toBe(2); // Should have two cells
    expect(result.columns[1].rows[0].cells[0].widgetId).toBe('widget1');
    expect(result.columns[1].rows[0].cells[1].widgetId).toBe('widget2');
    expect(result.columns[1].rows[0].cells[0].widthPercentage).toBe(50);
    expect(result.columns[1].rows[0].cells[1].widthPercentage).toBe(50);
  });

  it('should handle PLACE_RIGHT drop type correctly', () => {
    const dragData = {
      widgetId: 'widget1',
      columnIndex: 0,
      rowIndex: 0,
    };

    const dropData: EditableLayoutDropData = {
      type: DropType.PLACE_RIGHT,
      widgetId: 'widget2',
      columnIndex: 1,
      rowIndex: 0,
    };

    const result = updateLayoutAfterDragAndDrop(mockLayout, dragData, dropData);

    expect(result.columns[0].rows.length).toBe(0); // Original row should be removed
    expect(result.columns[1].rows[0].cells.length).toBe(2); // Should have two cells
    expect(result.columns[1].rows[0].cells[0].widgetId).toBe('widget2');
    expect(result.columns[1].rows[0].cells[1].widgetId).toBe('widget1');
    expect(result.columns[1].rows[0].cells[0].widthPercentage).toBe(50);
    expect(result.columns[1].rows[0].cells[1].widthPercentage).toBe(50);
  });

  it('should return original layout when widget is not found', () => {
    const dragData = {
      widgetId: 'nonExistentWidget',
      columnIndex: 0,
      rowIndex: 0,
    };

    const dropData: EditableLayoutDropData = {
      type: DropType.SWAP,
      widgetId: 'widget2',
      columnIndex: 1,
      rowIndex: 0,
    };

    const result = updateLayoutAfterDragAndDrop(mockLayout, dragData, dropData);

    expect(result).toEqual(mockLayout);
  });

  it('should return original layout for unknown drop type', () => {
    const dragData = {
      widgetId: 'widget1',
      columnIndex: 0,
      rowIndex: 0,
    };

    const dropData = {
      type: 'UNKNOWN_TYPE' as DropType,
      widgetId: 'widget2',
      columnIndex: 1,
      rowIndex: 0,
    } as EditableLayoutDropData;

    const result = updateLayoutAfterDragAndDrop(mockLayout, dragData, dropData);

    expect(result).toEqual(mockLayout);
  });

  it('should handle NEW_ROW drop type with undefined rowIndex', () => {
    const dragData = {
      widgetId: 'widget1',
      columnIndex: 0,
      rowIndex: 0,
    };

    const dropData: EditableLayoutDropData = {
      type: DropType.NEW_ROW,
      columnIndex: 1,
    };

    const result = updateLayoutAfterDragAndDrop(mockLayout, dragData, dropData);

    expect(result.columns[0].rows.length).toBe(0); // Original row should be removed
    expect(result.columns[1].rows.length).toBe(2); // Should have two rows now
    expect(result.columns[1].rows[1].cells[0].widgetId).toBe('widget1'); // Should be added at the end
  });
});

describe('updateRowHeight', () => {
  const mockLayout = {
    columns: [
      {
        widthPercentage: 50,
        rows: [
          {
            cells: [
              {
                widgetId: 'widget1',
                widthPercentage: 100,
                height: 200,
              },
              {
                widgetId: 'widget2',
                widthPercentage: 100,
                height: 200,
              },
            ],
          },
        ],
      },
      {
        widthPercentage: 50,
        rows: [
          {
            cells: [
              {
                widgetId: 'widget3',
                widthPercentage: 100,
                height: 200,
              },
            ],
          },
        ],
      },
    ],
  };

  it('should update height of all cells in the specified row', () => {
    const newHeight = 300;
    const result = updateRowHeight(mockLayout, newHeight, 0, 0);

    expect(result.columns[0].rows[0].cells[0].height).toBe(newHeight);
    expect(result.columns[0].rows[0].cells[1].height).toBe(newHeight);
    // Other cells should remain unchanged
    expect(result.columns[1].rows[0].cells[0].height).toBe(200);
  });

  it('should not modify layout when column index is out of bounds', () => {
    const result = updateRowHeight(mockLayout, 300, 2, 0);
    expect(result).toEqual(mockLayout);
  });

  it('should not modify layout when row index is out of bounds', () => {
    const result = updateRowHeight(mockLayout, 300, 0, 1);
    expect(result).toEqual(mockLayout);
  });

  it('should preserve other properties of cells when updating height', () => {
    const result = updateRowHeight(mockLayout, 300, 0, 0);

    expect(result.columns[0].rows[0].cells[0].widgetId).toBe('widget1');
    expect(result.columns[0].rows[0].cells[0].widthPercentage).toBe(100);
    expect(result.columns[0].rows[0].cells[1].widgetId).toBe('widget2');
    expect(result.columns[0].rows[0].cells[1].widthPercentage).toBe(100);
  });
});

describe('updateLayoutWidths', () => {
  const mockLayout: WidgetsPanelLayout = {
    columns: [
      {
        widthPercentage: 50,
        rows: [
          {
            cells: [
              {
                widgetId: 'widget1',
                widthPercentage: 100,
                height: 200,
              },
            ],
          },
        ],
      },
      {
        widthPercentage: 50,
        rows: [
          {
            cells: [
              {
                widgetId: 'widget2',
                widthPercentage: 100,
                height: 200,
              },
            ],
          },
        ],
      },
    ],
  };

  it('should update column widths when no parent indices are provided', () => {
    const newWidths = [30, 70];
    const result = updateLayoutWidths(mockLayout, newWidths);

    expect(result.columns[0].widthPercentage).toBe(30);
    expect(result.columns[1].widthPercentage).toBe(70);
  });

  it('should update cell widths when parent indices are provided', () => {
    const newWidths = [60];
    const result = updateLayoutWidths(mockLayout, newWidths, 0, 0);

    expect(result.columns[0].rows[0].cells[0].widthPercentage).toBe(60);
    expect(result.columns[0].widthPercentage).toBe(50);
  });

  it('should preserve other properties when updating widths', () => {
    const newWidths = [30, 70];
    const result = updateLayoutWidths(mockLayout, newWidths);

    expect(result.columns[0].rows[0].cells[0].widgetId).toBe('widget1');
    expect(result.columns[0].rows[0].cells[0].height).toBe(200);
    expect(result.columns[1].rows[0].cells[0].widgetId).toBe('widget2');
    expect(result.columns[1].rows[0].cells[0].height).toBe(200);
  });

  it('should handle empty width array', () => {
    const result = updateLayoutWidths(mockLayout, []);
    expect(result).toEqual(mockLayout);
  });

  it('should handle width array longer than columns', () => {
    const newWidths = [30, 70, 20];
    const result = updateLayoutWidths(mockLayout, newWidths);
    expect(result).toEqual(mockLayout);
  });
});

describe('findDeletedWidgetsFromLayout', () => {
  const previousLayout: WidgetsPanelLayout = {
    columns: [
      {
        widthPercentage: 50,
        rows: [
          {
            cells: [
              {
                widgetId: 'widget1',
                widthPercentage: 50,
                height: 200,
              },
              {
                widgetId: 'widget2',
                widthPercentage: 50,
                height: 200,
              },
            ],
          },
          {
            cells: [
              {
                widgetId: 'widget3',
                widthPercentage: 100,
                height: 200,
              },
            ],
          },
        ],
      },
      {
        widthPercentage: 50,
        rows: [
          {
            cells: [
              {
                widgetId: 'widget4',
                widthPercentage: 100,
                height: 200,
              },
            ],
          },
        ],
      },
    ],
  };

  it('should return empty array when no widgets are deleted', () => {
    const newLayout = previousLayout;
    const result = findDeletedWidgetsFromLayout(previousLayout, newLayout);

    expect(result).toEqual([]);
  });

  it('should return deleted widget IDs when widgets are removed', () => {
    const newLayout: WidgetsPanelLayout = {
      columns: [
        {
          widthPercentage: 50,
          rows: [
            {
              cells: [
                {
                  widgetId: 'widget1',
                  widthPercentage: 100,
                  height: 200,
                },
              ],
            },
          ],
        },
        {
          widthPercentage: 50,
          rows: [
            {
              cells: [
                {
                  widgetId: 'widget4',
                  widthPercentage: 100,
                  height: 200,
                },
              ],
            },
          ],
        },
      ],
    };

    const result = findDeletedWidgetsFromLayout(previousLayout, newLayout);

    expect(result.sort()).toEqual(['widget2', 'widget3']);
  });

  it('should return all widget IDs when all widgets are deleted', () => {
    const newLayout: WidgetsPanelLayout = {
      columns: [],
    };

    const result = findDeletedWidgetsFromLayout(previousLayout, newLayout);

    expect(result.sort()).toEqual(['widget1', 'widget2', 'widget3', 'widget4']);
  });

  it('should handle empty previous layout', () => {
    const emptyLayout: WidgetsPanelLayout = {
      columns: [],
    };

    const result = findDeletedWidgetsFromLayout(emptyLayout, previousLayout);

    expect(result).toEqual([]);
  });

  it('should handle layouts with no widgets', () => {
    const emptyLayout: WidgetsPanelLayout = {
      columns: [
        {
          widthPercentage: 100,
          rows: [],
        },
      ],
    };

    const result = findDeletedWidgetsFromLayout(emptyLayout, emptyLayout);

    expect(result).toEqual([]);
  });

  it('should handle widgets being moved between columns', () => {
    const newLayout: WidgetsPanelLayout = {
      columns: [
        {
          widthPercentage: 100,
          rows: [
            {
              cells: [
                {
                  widgetId: 'widget1',
                  widthPercentage: 25,
                  height: 200,
                },
                {
                  widgetId: 'widget2',
                  widthPercentage: 25,
                  height: 200,
                },
                {
                  widgetId: 'widget3',
                  widthPercentage: 25,
                  height: 200,
                },
                {
                  widgetId: 'widget4',
                  widthPercentage: 25,
                  height: 200,
                },
              ],
            },
          ],
        },
      ],
    };

    const result = findDeletedWidgetsFromLayout(previousLayout, newLayout);

    expect(result).toEqual([]);
  });
});

describe('deleteWidgetsFromLayout', () => {
  const mockLayout: WidgetsPanelLayout = {
    columns: [
      {
        widthPercentage: 60,
        rows: [
          {
            cells: [
              {
                widgetId: 'widget1',
                widthPercentage: 30,
                height: 200,
              },
              {
                widgetId: 'widget2',
                widthPercentage: 70,
                height: 200,
              },
            ],
          },
          {
            cells: [
              {
                widgetId: 'widget3',
                widthPercentage: 100,
                height: 200,
              },
            ],
          },
        ],
      },
      {
        widthPercentage: 40,
        rows: [
          {
            cells: [
              {
                widgetId: 'widget4',
                widthPercentage: 50,
                height: 200,
              },
              {
                widgetId: 'widget5',
                widthPercentage: 50,
                height: 200,
              },
            ],
          },
        ],
      },
    ],
  };

  it('should delete single widget and redistribute widths', () => {
    const result = deleteWidgetsFromLayout(mockLayout, ['widget1']);

    expect(result.columns[0].rows[0].cells).toHaveLength(1);
    expect(result.columns[0].rows[0].cells[0].widgetId).toBe('widget2');
    expect(result.columns[0].rows[0].cells[0].widthPercentage).toBe(100);

    // Other widgets should remain unchanged
    expect(result.columns[0].rows[1].cells[0].widgetId).toBe('widget3');
    expect(result.columns[1].rows[0].cells).toHaveLength(2);
  });

  it('should delete multiple widgets from same row and redistribute widths', () => {
    const result = deleteWidgetsFromLayout(mockLayout, ['widget4', 'widget5']);

    expect(result.columns[1].rows).toHaveLength(0); // Row should be empty and removed
    expect(result.columns[0].rows).toHaveLength(2); // First column should remain unchanged
  });

  it('should delete widgets from different rows', () => {
    const result = deleteWidgetsFromLayout(mockLayout, ['widget1', 'widget3']);

    expect(result.columns[0].rows).toHaveLength(1); // Second row should be removed
    expect(result.columns[0].rows[0].cells).toHaveLength(1);
    expect(result.columns[0].rows[0].cells[0].widgetId).toBe('widget2');
    expect(result.columns[0].rows[0].cells[0].widthPercentage).toBe(100);
  });

  it('should delete all widgets from a column and remove empty rows', () => {
    const result = deleteWidgetsFromLayout(mockLayout, ['widget1', 'widget2', 'widget3']);

    expect(result.columns[0].rows).toHaveLength(0); // All rows should be removed
    expect(result.columns[1].rows).toHaveLength(1); // Second column should remain unchanged
  });

  it('should handle deleting non-existent widgets', () => {
    const result = deleteWidgetsFromLayout(mockLayout, ['nonExistentWidget']);

    expect(result).toEqual(mockLayout);
  });

  it('should handle empty widget IDs array', () => {
    const result = deleteWidgetsFromLayout(mockLayout, []);

    expect(result).toEqual(mockLayout);
  });

  it('should correctly redistribute widths when one widget is deleted from multiple widgets', () => {
    const threeWidgetLayout: WidgetsPanelLayout = {
      columns: [
        {
          widthPercentage: 100,
          rows: [
            {
              cells: [
                {
                  widgetId: 'widget1',
                  widthPercentage: 20,
                  height: 200,
                },
                {
                  widgetId: 'widget2',
                  widthPercentage: 30,
                  height: 200,
                },
                {
                  widgetId: 'widget3',
                  widthPercentage: 50,
                  height: 200,
                },
              ],
            },
          ],
        },
      ],
    };

    const result = deleteWidgetsFromLayout(threeWidgetLayout, ['widget2']);

    expect(result.columns[0].rows[0].cells).toHaveLength(2);
    // Remaining widgets should split the deleted widget's width (30%) equally (15% each)
    expect(result.columns[0].rows[0].cells[0].widgetId).toBe('widget1');
    expect(result.columns[0].rows[0].cells[0].widthPercentage).toBe(35); // 20 + 15
    expect(result.columns[0].rows[0].cells[1].widgetId).toBe('widget3');
    expect(result.columns[0].rows[0].cells[1].widthPercentage).toBe(65); // 50 + 15
  });

  it('should preserve widget properties other than width when redistributing', () => {
    const result = deleteWidgetsFromLayout(mockLayout, ['widget1']);

    const remainingWidget = result.columns[0].rows[0].cells[0];
    expect(remainingWidget.widgetId).toBe('widget2');
    expect(remainingWidget.height).toBe(200);
    expect(remainingWidget.widthPercentage).toBe(100);
  });

  it('should handle deleting all widgets from layout', () => {
    const result = deleteWidgetsFromLayout(mockLayout, [
      'widget1',
      'widget2',
      'widget3',
      'widget4',
      'widget5',
    ]);

    expect(result.columns[0].rows).toHaveLength(0);
    expect(result.columns[1].rows).toHaveLength(0);
  });

  it('should handle complex deletion scenario with mixed widget positions', () => {
    const complexLayout: WidgetsPanelLayout = {
      columns: [
        {
          widthPercentage: 50,
          rows: [
            {
              cells: [{ widgetId: 'A', widthPercentage: 100, height: 200 }],
            },
            {
              cells: [
                { widgetId: 'B', widthPercentage: 50, height: 200 },
                { widgetId: 'C', widthPercentage: 50, height: 200 },
              ],
            },
          ],
        },
        {
          widthPercentage: 50,
          rows: [
            {
              cells: [
                { widgetId: 'D', widthPercentage: 33.33, height: 200 },
                { widgetId: 'E', widthPercentage: 33.33, height: 200 },
                { widgetId: 'F', widthPercentage: 33.34, height: 200 },
              ],
            },
          ],
        },
      ],
    };

    const result = deleteWidgetsFromLayout(complexLayout, ['A', 'E']);

    // First column should have one row removed, second row remains with both widgets
    expect(result.columns[0].rows).toHaveLength(1);
    expect(result.columns[0].rows[0].cells).toHaveLength(2);
    expect(result.columns[0].rows[0].cells[0].widgetId).toBe('B');
    expect(result.columns[0].rows[0].cells[1].widgetId).toBe('C');

    // Second column should have one row with two widgets, E's width redistributed
    expect(result.columns[1].rows).toHaveLength(1);
    expect(result.columns[1].rows[0].cells).toHaveLength(2);
    expect(result.columns[1].rows[0].cells[0].widgetId).toBe('D');
    expect(result.columns[1].rows[0].cells[1].widgetId).toBe('F');
    // Each remaining widget gets half of E's width (33.33/2 = 16.665)
    expect(result.columns[1].rows[0].cells[0].widthPercentage).toBeCloseTo(49.995); // 33.33 + 16.665
    expect(result.columns[1].rows[0].cells[1].widthPercentage).toBeCloseTo(50.005); // 33.34 + 16.665
  });
});

describe('distributeEqualWidthInRow', () => {
  const mockLayout: WidgetsPanelLayout = {
    columns: [
      {
        widthPercentage: 50,
        rows: [
          {
            cells: [
              {
                widgetId: 'widget1',
                widthPercentage: 30,
                height: 200,
              },
              {
                widgetId: 'widget2',
                widthPercentage: 70,
                height: 200,
              },
            ],
          },
          {
            cells: [
              {
                widgetId: 'widget3',
                widthPercentage: 100,
                height: 200,
              },
            ],
          },
        ],
      },
      {
        widthPercentage: 50,
        rows: [
          {
            cells: [
              {
                widgetId: 'widget4',
                widthPercentage: 25,
                height: 200,
              },
              {
                widgetId: 'widget5',
                widthPercentage: 35,
                height: 200,
              },
              {
                widgetId: 'widget6',
                widthPercentage: 40,
                height: 200,
              },
            ],
          },
        ],
      },
    ],
  };

  it('should distribute equal width to cells in a row with two widgets', () => {
    const result = distributeEqualWidthInRow(mockLayout, 0, 0);

    expect(result.columns[0].rows[0].cells[0].widthPercentage).toBe(50);
    expect(result.columns[0].rows[0].cells[1].widthPercentage).toBe(50);

    // Other cells should remain unchanged
    expect(result.columns[0].rows[1].cells[0].widthPercentage).toBe(100);
    expect(result.columns[1].rows[0].cells[0].widthPercentage).toBe(25);
    expect(result.columns[1].rows[0].cells[1].widthPercentage).toBe(35);
    expect(result.columns[1].rows[0].cells[2].widthPercentage).toBe(40);
  });

  it('should distribute equal width to cells in a row with three widgets', () => {
    const result = distributeEqualWidthInRow(mockLayout, 1, 0);

    expect(result.columns[1].rows[0].cells[0].widthPercentage).toBeCloseTo(33.33, 1);
    expect(result.columns[1].rows[0].cells[1].widthPercentage).toBeCloseTo(33.33, 1);
    expect(result.columns[1].rows[0].cells[2].widthPercentage).toBeCloseTo(33.34, 1);

    // Other cells should remain unchanged
    expect(result.columns[0].rows[0].cells[0].widthPercentage).toBe(30);
    expect(result.columns[0].rows[0].cells[1].widthPercentage).toBe(70);
    expect(result.columns[0].rows[1].cells[0].widthPercentage).toBe(100);
  });

  it('should handle single cell row correctly', () => {
    const result = distributeEqualWidthInRow(mockLayout, 0, 1);

    expect(result.columns[0].rows[1].cells[0].widthPercentage).toBe(100);

    // Other cells should remain unchanged
    expect(result.columns[0].rows[0].cells[0].widthPercentage).toBe(30);
    expect(result.columns[0].rows[0].cells[1].widthPercentage).toBe(70);
    expect(result.columns[1].rows[0].cells[0].widthPercentage).toBe(25);
  });

  it('should preserve other cell properties when distributing width', () => {
    const result = distributeEqualWidthInRow(mockLayout, 0, 0);

    expect(result.columns[0].rows[0].cells[0].widgetId).toBe('widget1');
    expect(result.columns[0].rows[0].cells[0].height).toBe(200);
    expect(result.columns[0].rows[0].cells[1].widgetId).toBe('widget2');
    expect(result.columns[0].rows[0].cells[1].height).toBe(200);
  });

  it('should not modify layout when column index is out of bounds', () => {
    const result = distributeEqualWidthInRow(mockLayout, 2, 0);
    expect(result).toEqual(mockLayout);
  });

  it('should not modify layout when row index is out of bounds', () => {
    const result = distributeEqualWidthInRow(mockLayout, 0, 2);
    expect(result).toEqual(mockLayout);
  });

  it('should handle empty row gracefully', () => {
    const layoutWithEmptyRow: WidgetsPanelLayout = {
      columns: [
        {
          widthPercentage: 100,
          rows: [
            {
              cells: [],
            },
          ],
        },
      ],
    };

    const result = distributeEqualWidthInRow(layoutWithEmptyRow, 0, 0);
    expect(result).toEqual(layoutWithEmptyRow);
  });

  it('should handle layout with multiple columns and rows', () => {
    const complexLayout: WidgetsPanelLayout = {
      columns: [
        {
          widthPercentage: 40,
          rows: [
            {
              cells: [
                { widgetId: 'A1', widthPercentage: 60, height: 200 },
                { widgetId: 'A2', widthPercentage: 40, height: 200 },
              ],
            },
            {
              cells: [{ widgetId: 'A3', widthPercentage: 100, height: 200 }],
            },
          ],
        },
        {
          widthPercentage: 60,
          rows: [
            {
              cells: [
                { widgetId: 'B1', widthPercentage: 50, height: 200 },
                { widgetId: 'B2', widthPercentage: 50, height: 200 },
              ],
            },
          ],
        },
      ],
    };

    const result = distributeEqualWidthInRow(complexLayout, 1, 0);

    // Target row should have equal distribution
    expect(result.columns[1].rows[0].cells[0].widthPercentage).toBe(50);
    expect(result.columns[1].rows[0].cells[1].widthPercentage).toBe(50);

    // Other rows should remain unchanged
    expect(result.columns[0].rows[0].cells[0].widthPercentage).toBe(60);
    expect(result.columns[0].rows[0].cells[1].widthPercentage).toBe(40);
    expect(result.columns[0].rows[1].cells[0].widthPercentage).toBe(100);
  });

  it('should ensure total width percentage equals 100 for the row', () => {
    const result = distributeEqualWidthInRow(mockLayout, 1, 0);

    const totalWidth = result.columns[1].rows[0].cells.reduce(
      (sum, cell) => sum + cell.widthPercentage,
      0,
    );

    expect(totalWidth).toBeCloseTo(100, 1);
  });

  it('should handle decimal precision correctly for uneven divisions', () => {
    const layoutWithFiveWidgets: WidgetsPanelLayout = {
      columns: [
        {
          widthPercentage: 100,
          rows: [
            {
              cells: [
                { widgetId: 'W1', widthPercentage: 10, height: 200 },
                { widgetId: 'W2', widthPercentage: 20, height: 200 },
                { widgetId: 'W3', widthPercentage: 30, height: 200 },
                { widgetId: 'W4', widthPercentage: 25, height: 200 },
                { widgetId: 'W5', widthPercentage: 15, height: 200 },
              ],
            },
          ],
        },
      ],
    };

    const result = distributeEqualWidthInRow(layoutWithFiveWidgets, 0, 0);

    // Each cell should get 20% (100% / 5)
    result.columns[0].rows[0].cells.forEach((cell) => {
      expect(cell.widthPercentage).toBe(20);
    });

    // Total should equal 100
    const totalWidth = result.columns[0].rows[0].cells.reduce(
      (sum, cell) => sum + cell.widthPercentage,
      0,
    );
    expect(totalWidth).toBe(100);
  });
});
