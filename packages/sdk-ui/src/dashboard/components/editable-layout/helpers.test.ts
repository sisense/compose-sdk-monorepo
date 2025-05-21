import { DropType, EditableLayoutDropData } from './types';
import { updateLayoutAfterDragAndDrop, updateRowHeight, updateLayoutWidths } from './helpers';
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
