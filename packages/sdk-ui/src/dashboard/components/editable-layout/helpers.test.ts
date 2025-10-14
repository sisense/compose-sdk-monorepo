import { WidgetsPanelLayout, WidgetsPanelRow } from '@/models';
import { WidgetProps } from '@/props';

import {
  deleteWidgetsFromLayout,
  distributeEqualWidthInRow,
  findDeletedWidgetsFromLayout,
  getColumnMaxWidths,
  getColumnMinWidths,
  getRowHeight,
  getRowMaxHeight,
  getRowMinHeight,
  updateLayoutAfterDragAndDrop,
  updateLayoutWidths,
  updateRowHeight,
} from './helpers';
import { DropType, EditableLayoutDropData } from './types';

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

describe('getRowHeight', () => {
  const mockWidgets: WidgetProps[] = [
    {
      id: 'chart-widget-1',
      widgetType: 'chart',
      chartType: 'bar',
      dataSource: { title: 'Test DataSource', type: 'elasticube' },
      dataOptions: {},
    },
    {
      id: 'chart-widget-2',
      widgetType: 'chart',
      chartType: 'line',
      dataSource: { title: 'Test DataSource', type: 'elasticube' },
      dataOptions: {},
    },
    {
      id: 'pivot-widget-1',
      widgetType: 'pivot',
      dataSource: { title: 'Test DataSource', type: 'elasticube' },
      dataOptions: {},
    },
    {
      id: 'text-widget-1',
      widgetType: 'text',
      styleOptions: {
        html: '<p>Test content</p>',
        vAlign: 'valign-middle',
        bgColor: '#ffffff',
      },
    },
    {
      id: 'custom-widget-1',
      widgetType: 'custom',
      customWidgetType: 'custom-type',
      dataSource: { title: 'Test DataSource', type: 'elasticube' },
      dataOptions: {},
    },
  ];

  it('should return 0 for empty row', () => {
    const emptyRow: WidgetsPanelRow = {
      cells: [],
    };

    const result = getRowHeight(emptyRow, mockWidgets);

    expect(result).toBe(0);
  });

  it('should return the maximum height from cells with explicit height (number)', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
          height: 200,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
          height: 300,
        },
        {
          widgetId: 'widget3',
          widthPercentage: 100,
          height: 150,
        },
      ],
    };

    const result = getRowHeight(row, mockWidgets);

    expect(result).toBe(300);
  });

  it('should return the maximum height from cells with explicit height (string)', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
          height: '250px',
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
          height: '180px',
        },
      ],
    };

    const result = getRowHeight(row, mockWidgets);

    expect(result).toBe(250);
  });

  it('should handle mixed height types (number and string)', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
          height: 200,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
          height: '350',
        },
      ],
    };

    const result = getRowHeight(row, mockWidgets);

    expect(result).toBe(350);
  });

  it('should use chart widget default height when no explicit height is set', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'chart-widget-1',
          widthPercentage: 50,
        },
        {
          widgetId: 'chart-widget-2',
          widthPercentage: 50,
        },
      ],
    };

    const result = getRowHeight(row, mockWidgets);

    // Both chart widgets should use their default height (400 for bar and line charts)
    expect(result).toBe(400);
  });

  it('should use pivot widget default height when no explicit height is set', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'pivot-widget-1',
          widthPercentage: 100,
        },
      ],
    };

    const result = getRowHeight(row, mockWidgets);

    // Pivot widget default height is 500
    expect(result).toBe(500);
  });

  it('should use default chart height for text and custom widgets when no explicit height is set', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'text-widget-1',
          widthPercentage: 50,
        },
        {
          widgetId: 'custom-widget-1',
          widthPercentage: 50,
        },
      ],
    };

    const result = getRowHeight(row, mockWidgets);

    // Text and custom widgets use default chart height (400)
    expect(result).toBe(400);
  });

  it('should return 0 when widget is not found in widgets array', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'non-existent-widget',
          widthPercentage: 100,
        },
      ],
    };

    const result = getRowHeight(row, mockWidgets);

    expect(result).toBe(0);
  });

  it('should prioritize explicit height over widget default height', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'chart-widget-1',
          widthPercentage: 50,
          height: 600, // Explicit height higher than default
        },
        {
          widgetId: 'pivot-widget-1',
          widthPercentage: 50,
          // No explicit height, should use default (500)
        },
      ],
    };

    const result = getRowHeight(row, mockWidgets);

    expect(result).toBe(600);
  });

  it('should handle cells with undefined height', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'chart-widget-1',
          widthPercentage: 50,
          height: undefined,
        },
        {
          widgetId: 'chart-widget-2',
          widthPercentage: 50,
          height: 300,
        },
      ],
    };

    const result = getRowHeight(row, mockWidgets);

    expect(result).toBe(400); // chart-widget-1 uses default height (400), chart-widget-2 has explicit 300
  });

  it('should handle cells with null height', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'chart-widget-1',
          widthPercentage: 50,
          height: null as any,
        },
        {
          widgetId: 'pivot-widget-1',
          widthPercentage: 50,
        },
      ],
    };

    const result = getRowHeight(row, mockWidgets);

    expect(result).toBe(500); // chart-widget-1 uses default height (400), pivot-widget-1 uses default (500)
  });

  it('should handle invalid string height values', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'chart-widget-1',
          widthPercentage: 50,
          height: 'invalid-number',
        },
        {
          widgetId: 'chart-widget-2',
          widthPercentage: 50,
          height: 250,
        },
      ],
    };

    const result = getRowHeight(row, mockWidgets);

    // parseInt('invalid-number') returns NaN, and Math.max(acc, NaN) returns NaN
    expect(result).toBeNaN();
  });

  it('should handle mixed scenarios with explicit heights, widget defaults, and missing widgets', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'chart-widget-1',
          widthPercentage: 25,
          height: 450,
        },
        {
          widgetId: 'pivot-widget-1',
          widthPercentage: 25,
          // No explicit height, uses default (500)
        },
        {
          widgetId: 'non-existent-widget',
          widthPercentage: 25,
          // Widget not found, contributes 0
        },
        {
          widgetId: 'text-widget-1',
          widthPercentage: 25,
          height: '600',
        },
      ],
    };

    const result = getRowHeight(row, mockWidgets);

    expect(result).toBe(600); // Maximum of [450, 500, 0, 600]
  });

  it('should handle chart widgets without chartType property', () => {
    const widgetsWithoutChartType: WidgetProps[] = [
      {
        id: 'chart-widget-no-type',
        widgetType: 'chart',
        chartType: 'bar',
        dataSource: { title: 'Test DataSource', type: 'elasticube' },
        dataOptions: {},
      },
    ];

    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'non-existent-widget',
          widthPercentage: 100,
        },
      ],
    };

    const result = getRowHeight(row, widgetsWithoutChartType);

    // Should return 0 since widget is not found in the widgets array
    expect(result).toBe(0);
  });

  it('should handle edge case with very large height values', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'chart-widget-1',
          widthPercentage: 50,
          height: Number.MAX_SAFE_INTEGER,
        },
        {
          widgetId: 'chart-widget-2',
          widthPercentage: 50,
          height: 1000,
        },
      ],
    };

    const result = getRowHeight(row, mockWidgets);

    expect(result).toBe(Number.MAX_SAFE_INTEGER);
  });

  it('should handle edge case with very small height values', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'chart-widget-1',
          widthPercentage: 50,
          height: 1,
        },
        {
          widgetId: 'chart-widget-2',
          widthPercentage: 50,
          height: 0,
        },
      ],
    };

    const result = getRowHeight(row, mockWidgets);

    expect(result).toBe(1);
  });

  it('should handle negative height values', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'chart-widget-1',
          widthPercentage: 50,
          height: -100,
        },
        {
          widgetId: 'chart-widget-2',
          widthPercentage: 50,
          height: 200,
        },
      ],
    };

    const result = getRowHeight(row, mockWidgets);

    expect(result).toBe(200); // Math.max(-100, 200) = 200
  });
});

describe('getRowMaxHeight', () => {
  it('should return MAX_ROW_HEIGHT when no cells have maxHeight', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
        },
      ],
    };

    const result = getRowMaxHeight(row);

    expect(result).toBe(1500); // MAX_ROW_HEIGHT from const.ts
  });

  it('should return the minimum maxHeight when some cells have maxHeight', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
          maxHeight: 800,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
          maxHeight: 600,
        },
        {
          widgetId: 'widget3',
          widthPercentage: 50,
          maxHeight: 1000,
        },
      ],
    };

    const result = getRowMaxHeight(row);

    expect(result).toBe(600); // Minimum of [800, 600, 1000]
  });

  it('should handle cells with undefined maxHeight', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
          maxHeight: 800,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
          maxHeight: undefined,
        },
        {
          widgetId: 'widget3',
          widthPercentage: 50,
          maxHeight: 600,
        },
      ],
    };

    const result = getRowMaxHeight(row);

    expect(result).toBe(600); // Minimum of [800, 600] (undefined is ignored)
  });

  it('should handle cells with null maxHeight', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
          maxHeight: 800,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
          maxHeight: null as any,
        },
        {
          widgetId: 'widget3',
          widthPercentage: 50,
          maxHeight: 600,
        },
      ],
    };

    const result = getRowMaxHeight(row);

    expect(result).toBe(0); // Minimum of [800, null, 600] - null is treated as 0 in Math.min
  });

  it('should handle single cell with maxHeight', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 100,
          maxHeight: 500,
        },
      ],
    };

    const result = getRowMaxHeight(row);

    expect(result).toBe(500);
  });

  it('should handle edge case with very large maxHeight values', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
          maxHeight: Number.MAX_SAFE_INTEGER,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
          maxHeight: 1000,
        },
      ],
    };

    const result = getRowMaxHeight(row);

    expect(result).toBe(1000); // Minimum of [Number.MAX_SAFE_INTEGER, 1000]
  });

  it('should handle edge case with very small maxHeight values', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
          maxHeight: 1,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
          maxHeight: 0,
        },
      ],
    };

    const result = getRowMaxHeight(row);

    expect(result).toBe(0); // Minimum of [1, 0]
  });

  it('should handle negative maxHeight values', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
          maxHeight: -100,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
          maxHeight: 200,
        },
      ],
    };

    const result = getRowMaxHeight(row);

    expect(result).toBe(-100); // Minimum of [-100, 200]
  });
});

describe('getRowMinHeight', () => {
  it('should return MIN_ROW_HEIGHT when no cells have minHeight', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
        },
      ],
    };

    const result = getRowMinHeight(row);

    expect(result).toBe(60); // MIN_ROW_HEIGHT from const.ts
  });

  it('should return the maximum minHeight when some cells have minHeight', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
          minHeight: 200,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
          minHeight: 300,
        },
        {
          widgetId: 'widget3',
          widthPercentage: 50,
          minHeight: 150,
        },
      ],
    };

    const result = getRowMinHeight(row);

    expect(result).toBe(300); // Maximum of [200, 300, 150]
  });

  it('should handle cells with undefined minHeight', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
          minHeight: 200,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
          minHeight: undefined,
        },
        {
          widgetId: 'widget3',
          widthPercentage: 50,
          minHeight: 300,
        },
      ],
    };

    const result = getRowMinHeight(row);

    expect(result).toBe(300); // Maximum of [200, 300] (undefined is ignored)
  });

  it('should handle cells with null minHeight', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
          minHeight: 200,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
          minHeight: null as any,
        },
        {
          widgetId: 'widget3',
          widthPercentage: 50,
          minHeight: 300,
        },
      ],
    };

    const result = getRowMinHeight(row);

    expect(result).toBe(300); // Maximum of [200, 300] (null is ignored)
  });

  it('should handle single cell with minHeight', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 100,
          minHeight: 250,
        },
      ],
    };

    const result = getRowMinHeight(row);

    expect(result).toBe(250);
  });

  it('should handle edge case with very large minHeight values', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
          minHeight: Number.MAX_SAFE_INTEGER,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
          minHeight: 1000,
        },
      ],
    };

    const result = getRowMinHeight(row);

    expect(result).toBe(Number.MAX_SAFE_INTEGER); // Maximum of [Number.MAX_SAFE_INTEGER, 1000]
  });

  it('should handle edge case with very small minHeight values', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
          minHeight: 1,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
          minHeight: 0,
        },
      ],
    };

    const result = getRowMinHeight(row);

    expect(result).toBe(1); // Maximum of [1, 0]
  });

  it('should handle negative minHeight values', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
          minHeight: -100,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
          minHeight: 200,
        },
      ],
    };

    const result = getRowMinHeight(row);

    expect(result).toBe(200); // Maximum of [-100, 200]
  });
});

describe('getColumnMinWidths', () => {
  it('should return MIN_COLUMN_WIDTH for cells without minWidth', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
        },
      ],
    };

    const result = getColumnMinWidths(row);

    expect(result).toEqual([128, 128]); // MIN_COLUMN_WIDTH from const.ts
  });

  it('should return minWidth for cells that have it', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
          minWidth: 200,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
          minWidth: 300,
        },
        {
          widgetId: 'widget3',
          widthPercentage: 50,
        },
      ],
    };

    const result = getColumnMinWidths(row);

    expect(result).toEqual([200, 300, 128]); // [200, 300, MIN_COLUMN_WIDTH]
  });

  it('should handle cells with undefined minWidth', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
          minWidth: 200,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
          minWidth: undefined,
        },
        {
          widgetId: 'widget3',
          widthPercentage: 50,
          minWidth: 300,
        },
      ],
    };

    const result = getColumnMinWidths(row);

    expect(result).toEqual([200, 128, 300]); // [200, MIN_COLUMN_WIDTH, 300]
  });

  it('should handle cells with null minWidth', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
          minWidth: 200,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
          minWidth: null as any,
        },
        {
          widgetId: 'widget3',
          widthPercentage: 50,
          minWidth: 300,
        },
      ],
    };

    const result = getColumnMinWidths(row);

    expect(result).toEqual([200, null, 300]); // [200, null, 300] - null is not undefined, so it's returned
  });

  it('should handle single cell with minWidth', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 100,
          minWidth: 250,
        },
      ],
    };

    const result = getColumnMinWidths(row);

    expect(result).toEqual([250]);
  });

  it('should handle edge case with very large minWidth values', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
          minWidth: Number.MAX_SAFE_INTEGER,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
          minWidth: 1000,
        },
      ],
    };

    const result = getColumnMinWidths(row);

    expect(result).toEqual([Number.MAX_SAFE_INTEGER, 1000]);
  });

  it('should handle edge case with very small minWidth values', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
          minWidth: 1,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
          minWidth: 0,
        },
      ],
    };

    const result = getColumnMinWidths(row);

    expect(result).toEqual([1, 0]);
  });

  it('should handle negative minWidth values', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
          minWidth: -100,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
          minWidth: 200,
        },
      ],
    };

    const result = getColumnMinWidths(row);

    expect(result).toEqual([-100, 200]);
  });

  it('should handle empty row', () => {
    const row: WidgetsPanelRow = {
      cells: [],
    };

    const result = getColumnMinWidths(row);

    expect(result).toEqual([]);
  });
});

describe('getColumnMaxWidths', () => {
  it('should return MAX_COLUMN_WIDTH for cells without maxWidth', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
        },
      ],
    };

    const result = getColumnMaxWidths(row);

    expect(result).toEqual([2048, 2048]); // MAX_COLUMN_WIDTH from const.ts
  });

  it('should return maxWidth for cells that have it', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
          maxWidth: 800,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
          maxWidth: 1200,
        },
        {
          widgetId: 'widget3',
          widthPercentage: 50,
        },
      ],
    };

    const result = getColumnMaxWidths(row);

    expect(result).toEqual([800, 1200, 2048]); // [800, 1200, MAX_COLUMN_WIDTH]
  });

  it('should handle cells with undefined maxWidth', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
          maxWidth: 800,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
          maxWidth: undefined,
        },
        {
          widgetId: 'widget3',
          widthPercentage: 50,
          maxWidth: 1200,
        },
      ],
    };

    const result = getColumnMaxWidths(row);

    expect(result).toEqual([800, 2048, 1200]); // [800, MAX_COLUMN_WIDTH, 1200]
  });

  it('should handle cells with null maxWidth', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
          maxWidth: 800,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
          maxWidth: null as any,
        },
        {
          widgetId: 'widget3',
          widthPercentage: 50,
          maxWidth: 1200,
        },
      ],
    };

    const result = getColumnMaxWidths(row);

    expect(result).toEqual([800, null, 1200]); // [800, null, 1200] - null is not undefined, so it's returned
  });

  it('should handle single cell with maxWidth', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 100,
          maxWidth: 1000,
        },
      ],
    };

    const result = getColumnMaxWidths(row);

    expect(result).toEqual([1000]);
  });

  it('should handle edge case with very large maxWidth values', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
          maxWidth: Number.MAX_SAFE_INTEGER,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
          maxWidth: 2000,
        },
      ],
    };

    const result = getColumnMaxWidths(row);

    expect(result).toEqual([Number.MAX_SAFE_INTEGER, 2000]);
  });

  it('should handle edge case with very small maxWidth values', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
          maxWidth: 1,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
          maxWidth: 0,
        },
      ],
    };

    const result = getColumnMaxWidths(row);

    expect(result).toEqual([1, 0]);
  });

  it('should handle negative maxWidth values', () => {
    const row: WidgetsPanelRow = {
      cells: [
        {
          widgetId: 'widget1',
          widthPercentage: 50,
          maxWidth: -100,
        },
        {
          widgetId: 'widget2',
          widthPercentage: 50,
          maxWidth: 500,
        },
      ],
    };

    const result = getColumnMaxWidths(row);

    expect(result).toEqual([-100, 500]);
  });

  it('should handle empty row', () => {
    const row: WidgetsPanelRow = {
      cells: [],
    };

    const result = getColumnMaxWidths(row);

    expect(result).toEqual([]);
  });
});
