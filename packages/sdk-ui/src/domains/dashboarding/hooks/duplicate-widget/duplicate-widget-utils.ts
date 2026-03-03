import type {
  WidgetsPanelCell,
  WidgetsPanelLayout,
} from '@/domains/dashboarding/dashboard-model/types.js';

/**
 * Location of a widget cell within the layout structure.
 */
export type WidgetCellLocation = {
  columnIndex: number;
  rowIndex: number;
  cellIndex: number;
};

/**
 * Finds the location of a widget cell in the layout.
 *
 * @param layout - The widgets panel layout.
 * @param widgetId - The ID of the widget to find.
 * @returns The cell location, or undefined if not found.
 */
export const getWidgetCellLocation = (
  layout: Readonly<WidgetsPanelLayout>,
  widgetId: string,
): WidgetCellLocation | undefined =>
  layout.columns
    .map((column, columnIndex) =>
      column.rows
        .map((row, rowIndex) => {
          const cellIndex = row.cells.findIndex((cell) => cell.widgetId === widgetId);
          return cellIndex >= 0 ? { columnIndex, rowIndex, cellIndex } : undefined;
        })
        .find((loc): loc is WidgetCellLocation => loc !== undefined),
    )
    .find((loc): loc is WidgetCellLocation => loc !== undefined);

/**
 * Transformer: Inserts a new cell into the same row as the original cell.
 * Splits the original cell's widthPercentage in half: original and new cell each get 50%.
 *
 * @param originalCellLocation - The location of the original cell.
 * @param newWidgetId - The ID of the new widget.
 * @returns A pure transformer that produces the updated layout.
 */
export const withNewCellInsertedToTheSameRow =
  (originalCellLocation: WidgetCellLocation, newWidgetId: string) =>
  (layout: Readonly<WidgetsPanelLayout>): WidgetsPanelLayout => {
    const { columnIndex, rowIndex, cellIndex } = originalCellLocation;
    const column = layout.columns[columnIndex];
    const row = column.rows[rowIndex];
    const cell = row.cells[cellIndex];
    const halfWidth = cell.widthPercentage / 2;

    const updatedOriginalCell: WidgetsPanelCell = {
      ...cell,
      widthPercentage: halfWidth,
    };
    const newCell: WidgetsPanelCell = {
      ...cell,
      widgetId: newWidgetId,
      widthPercentage: halfWidth,
    };
    const newCells = [
      ...row.cells.slice(0, cellIndex),
      updatedOriginalCell,
      newCell,
      ...row.cells.slice(cellIndex + 1),
    ];

    return {
      ...layout,
      columns: layout.columns.map((col, ci) =>
        ci !== columnIndex
          ? col
          : {
              ...col,
              rows: col.rows.map((r, ri) => (ri !== rowIndex ? r : { ...r, cells: newCells })),
            },
      ),
    };
  };

/**
 * Transformer: Replaces a widget ID with another in all cells of the layout.
 *
 * @param oldWidgetId - The widget ID to replace.
 * @param newWidgetId - The new widget ID.
 * @returns A pure transformer that produces the updated layout (immutable).
 */
export const withReplacedWidgetId =
  (oldWidgetId: string, newWidgetId: string) =>
  (layout: Readonly<WidgetsPanelLayout>): WidgetsPanelLayout => ({
    ...layout,
    columns: layout.columns.map((col) => ({
      ...col,
      rows: col.rows.map((row) => ({
        ...row,
        cells: row.cells.map((cell) =>
          cell.widgetId === oldWidgetId ? { ...cell, widgetId: newWidgetId } : cell,
        ),
      })),
    })),
  });
