import {
  getWidgetCellLocation,
  withNewCellInsertedToTheSameRow,
  withReplacedWidgetId,
} from './duplicate-widget-utils.js';

describe('duplicate-widget-utils', () => {
  const layout = {
    columns: [
      {
        widthPercentage: 100,
        rows: [
          {
            cells: [
              { widthPercentage: 50, widgetId: 'widget-1' },
              { widthPercentage: 50, widgetId: 'widget-2' },
            ],
          },
          {
            cells: [{ widthPercentage: 100, widgetId: 'widget-3' }],
          },
        ],
      },
    ],
  };

  describe('getWidgetCellLocation', () => {
    it('should find widget in first column, first row', () => {
      expect(getWidgetCellLocation(layout, 'widget-1')).toEqual({
        columnIndex: 0,
        rowIndex: 0,
        cellIndex: 0,
      });
    });

    it('should find widget in first column, second row', () => {
      expect(getWidgetCellLocation(layout, 'widget-3')).toEqual({
        columnIndex: 0,
        rowIndex: 1,
        cellIndex: 0,
      });
    });

    it('should return undefined for non-existent widget', () => {
      expect(getWidgetCellLocation(layout, 'non-existent')).toBeUndefined();
    });
  });

  describe('withNewCellInsertedToTheSameRow', () => {
    it('should insert new cell and split width in half', () => {
      const location = { columnIndex: 0, rowIndex: 0, cellIndex: 0 };
      const result = withNewCellInsertedToTheSameRow(location, 'widget-1-copy')(layout);

      expect(result.columns[0].rows[0].cells).toHaveLength(3);
      expect(result.columns[0].rows[0].cells[0]).toEqual({
        widthPercentage: 25,
        widgetId: 'widget-1',
      });
      expect(result.columns[0].rows[0].cells[1]).toEqual({
        widthPercentage: 25,
        widgetId: 'widget-1-copy',
      });
      expect(result.columns[0].rows[0].cells[2]).toEqual({
        widthPercentage: 50,
        widgetId: 'widget-2',
      });
    });

    it('should not mutate the input layout', () => {
      const location = { columnIndex: 0, rowIndex: 0, cellIndex: 1 };
      const inputLayout = { ...layout };
      withNewCellInsertedToTheSameRow(location, 'new-widget')(inputLayout);

      expect(inputLayout.columns[0].rows[0].cells).toHaveLength(2);
    });
  });

  describe('withReplacedWidgetId', () => {
    it('should replace widget ID in all matching cells', () => {
      const result = withReplacedWidgetId('widget-2', 'widget-2-server-oid')(layout);

      expect(result.columns[0].rows[0].cells[0].widgetId).toBe('widget-1');
      expect(result.columns[0].rows[0].cells[1].widgetId).toBe('widget-2-server-oid');
      expect(result.columns[0].rows[1].cells[0].widgetId).toBe('widget-3');
    });

    it('should not mutate the input layout', () => {
      const inputLayout = { ...layout };
      withReplacedWidgetId('widget-1', 'new-id')(inputLayout);

      expect(inputLayout.columns[0].rows[0].cells[0].widgetId).toBe('widget-1');
    });

    it('should return layout unchanged when oldWidgetId is not found', () => {
      const result = withReplacedWidgetId('non-existent', 'new-id')(layout);

      expect(result.columns[0].rows[0].cells[0].widgetId).toBe('widget-1');
      expect(result.columns[0].rows[0].cells[1].widgetId).toBe('widget-2');
    });
  });
});
