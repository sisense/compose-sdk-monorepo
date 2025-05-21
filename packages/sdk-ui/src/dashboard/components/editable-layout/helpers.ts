import {
  WidgetsPanelCell,
  WidgetsPanelColumn,
  WidgetsPanelColumnLayout,
  WidgetsPanelLayout,
  WidgetsPanelRow,
} from '@/models';
import isUndefined from 'lodash-es/isUndefined';
import { EditableLayoutDropData, EditableLayoutDragData, DropType } from './types';

/**
 * Updates the height of all cells in a specific row within a column layout.
 *
 * @param layout - The current layout to modify
 * @param height - The new height to set for the cells
 * @param columnIndex - The index of the column containing the row to update
 * @param rowIndex - The index of the row to update
 *
 * @returns A new layout with updated cell heights
 *
 * @internal
 */
export function updateRowHeight(
  layout: WidgetsPanelColumnLayout,
  height: number,
  columnIndex: number,
  rowIndex: number,
) {
  return {
    ...layout,
    columns: layout.columns.map((column, index) => {
      if (index === columnIndex) {
        return {
          ...column,
          rows: column.rows.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...row,
                cells: row.cells.map((subcell) => {
                  return {
                    ...subcell,
                    height: height,
                  };
                }),
              };
            }
            return row;
          }),
        };
      }
      return column;
    }),
  };
}

/**
 * Updates the width percentages of columns or cells within a layout.
 *
 * @param layout - The current layout to modify
 * @param widths - Array of width percentages to apply
 * @param parentColumnIndex - Optional index of the parent column when updating cell widths
 * @param parentRowIndex - Optional index of the parent row when updating cell widths
 *
 * @returns A new layout with updated width percentages
 *
 * @internal
 */
export function updateLayoutWidths(
  layout: WidgetsPanelLayout,
  widths: number[],
  parentColumnIndex?: number,
  parentRowIndex?: number,
) {
  if (!isUndefined(parentColumnIndex) && !isUndefined(parentRowIndex)) {
    if (layout.columns[parentColumnIndex].rows[parentRowIndex].cells.length !== widths.length) {
      return layout;
    }

    return {
      ...layout,
      columns: layout.columns.map((column, index) => {
        if (index === parentColumnIndex) {
          return {
            ...column,
            rows: column.rows.map((row, index) => {
              if (index === parentRowIndex) {
                return {
                  ...row,
                  cells: row.cells.map((cell, index) => {
                    return {
                      ...cell,
                      widthPercentage: widths[index],
                    };
                  }),
                };
              }
              return row;
            }),
          };
        }
        return column;
      }),
    };
  } else {
    if (layout.columns.length !== widths.length) {
      return layout;
    }
    return {
      ...layout,
      columns: layout.columns.map((column, index) => {
        return {
          ...column,
          widthPercentage: widths[index],
        };
      }),
    };
  }
}

/**
 * Swaps the positions of two widgets in the layout.
 *
 * @param layout - The current layout to modify
 * @param widgetAId - ID of the first widget to swap
 * @param widgetBId - ID of the second widget to swap
 *
 * @returns A new layout with swapped widget positions, or the original layout if swap failed
 *
 * @internal
 */
function swapWidgetsInLayout(layout: WidgetsPanelLayout, widgetAId: string, widgetBId: string) {
  let isWidgetASwapped = false;
  let isWidgetBSwapped = false;

  const newLayout = {
    ...layout,
    columns: layout.columns.map((column) => {
      return {
        ...column,
        rows: column.rows.map((row) => {
          return {
            ...row,
            cells: row.cells.map((subcell) => {
              if (subcell.widgetId === widgetAId) {
                isWidgetASwapped = true;
                return {
                  ...subcell,
                  widgetId: widgetBId,
                };
              }
              if (subcell.widgetId === widgetBId) {
                isWidgetBSwapped = true;
                return {
                  ...subcell,
                  widgetId: widgetAId,
                };
              }
              return subcell;
            }),
          };
        }),
      };
    }),
  };

  return isWidgetASwapped && isWidgetBSwapped ? newLayout : layout;
}

/**
 * Adds a new row with a cell to a column, either at the end or at a specific row index.
 *
 * @param cell - The cell to add
 * @param column - The column to add the cell to
 * @param destinationRowIndex - Optional index where to insert the new row
 *
 * @returns A new column with the added cell
 *
 * @internal
 */
function addCellInNewColumnRow(
  cell: WidgetsPanelCell,
  column: WidgetsPanelColumn,
  destinationRowIndex?: number,
) {
  const newRow = {
    cells: [
      {
        ...cell,
        widthPercentage: 100,
      },
    ],
  };

  return {
    ...column,
    rows: isUndefined(destinationRowIndex)
      ? [...column.rows, newRow]
      : column.rows.reduce((acc, row, rowIndex) => {
          if (rowIndex === destinationRowIndex) {
            acc.push(newRow);
          }
          acc.push(row);
          return acc;
        }, [] as WidgetsPanelRow[]),
  };
}

/**
 * Removes a widget from a specific row in a column.
 *
 * @param column - The column containing the widget
 * @param widgetId - ID of the widget to remove
 * @param rowIndex - Index of the row containing the widget
 *
 * @returns A new column with the widget removed
 *
 * @internal
 */
function removeWidgetFromLayoutColumn(
  column: WidgetsPanelColumn,
  widgetId: string,
  rowIndex: number,
) {
  return {
    ...column,
    rows: column.rows.map((row, index) => {
      if (index === rowIndex) {
        return removeWidgetFromLayoutRow(row, widgetId);
      }
      return row;
    }),
  };
}

/**
 * Moves a widget to a new row in a different column.
 *
 * @param layout - The current layout to modify
 * @param widgetId - ID of the widget to move
 * @param fromColumnIndex - Source column index
 * @param fromRowIndex - Source row index
 * @param toColumnIndex - Destination column index
 * @param toRowIndex - Optional destination row index
 *
 * @returns A new layout with the widget moved
 *
 * @internal
 */
function moveWidgetInNewRow(
  layout: WidgetsPanelLayout,
  widgetId: string,
  fromColumnIndex: number,
  fromRowIndex: number,
  toColumnIndex: number,
  toRowIndex?: number,
) {
  const cellToMove = layout.columns[fromColumnIndex].rows[fromRowIndex].cells.find(
    (cell) => cell.widgetId === widgetId,
  );
  if (!cellToMove) {
    return layout;
  }

  return {
    ...layout,
    columns: layout.columns.map((column, columnIndex) => {
      let newColumn = column;

      if (columnIndex === fromColumnIndex) {
        newColumn = removeWidgetFromLayoutColumn(column, widgetId, fromRowIndex);
      }

      if (columnIndex === toColumnIndex) {
        newColumn = addCellInNewColumnRow(cellToMove, newColumn, toRowIndex);
      }

      if (columnIndex === fromColumnIndex) {
        newColumn = clearColumnFromEmptyRows(newColumn);
      }

      return newColumn;
    }),
  };
}

/**
 * Removes a widget from a row and redistributes its width to remaining cells.
 *
 * @param row - The row containing the widget
 * @param widgetId - ID of the widget to remove
 *
 * @returns A new row with the widget removed and widths adjusted
 *
 * @internal
 */
function removeWidgetFromLayoutRow(row: WidgetsPanelRow, widgetId: string) {
  const removalWidgetWidth =
    row.cells.find((subcell) => subcell.widgetId === widgetId)?.widthPercentage || 0;
  const cellsCountAfterRemove = row.cells.length - 1;
  return {
    ...row,
    cells: row.cells
      .filter((cell) => cell.widgetId !== widgetId)
      .map((cell) => ({
        ...cell,
        widthPercentage: cell.widthPercentage + removalWidgetWidth / cellsCountAfterRemove,
      })),
  };
}

/**
 * Removes empty rows from a column.
 *
 * @param column - The column to clean
 *
 * @returns A new column with empty rows removed
 *
 * @internal
 */
function clearColumnFromEmptyRows(column: WidgetsPanelColumn) {
  return {
    ...column,
    rows: column.rows.filter((row) => row.cells.length > 0),
  };
}

/**
 * Moves a widget to be positioned next to another widget.
 *
 * @param layout - The current layout to modify
 * @param side - Whether to place the widget to the 'left' or 'right' of the target
 * @param widgetId - ID of the widget to move
 * @param fromColumnIndex - Source column index
 * @param fromRowIndex - Source row index
 * @param toWidgetId - ID of the target widget
 * @param toColumnIndex - Destination column index
 * @param toRowIndex - Destination row index
 *
 * @returns A new layout with the widget moved
 *
 * @internal
 */
function moveWidgetAsideAnother(
  layout: WidgetsPanelLayout,
  side: 'left' | 'right',
  widgetId: string,
  fromColumnIndex: number,
  fromRowIndex: number,
  toWidgetId: string,
  toColumnIndex: number,
  toRowIndex: number,
) {
  const cellToMove = layout.columns[fromColumnIndex].rows[fromRowIndex].cells.find(
    (cell) => cell.widgetId === widgetId,
  );
  if (!cellToMove) {
    return layout;
  }

  return {
    ...layout,
    columns: layout.columns.map((column, columnIndex) => {
      let newColumn = column;

      if (columnIndex === fromColumnIndex) {
        newColumn = removeWidgetFromLayoutColumn(column, widgetId, fromRowIndex);
      }

      if (columnIndex === toColumnIndex) {
        newColumn = {
          ...newColumn,
          rows: newColumn.rows.map((row, rowIndex) => {
            if (rowIndex === toRowIndex) {
              return {
                ...row,
                cells: row.cells.reduce((acc: WidgetsPanelCell[], cell) => {
                  if (cell.widgetId === toWidgetId) {
                    const newCell = {
                      ...cellToMove,
                      widthPercentage: cell.widthPercentage / 2,
                      height: cell.height,
                    };
                    if (side === 'left') {
                      acc.push(newCell);
                    }
                    acc.push({
                      ...cell,
                      widthPercentage: cell.widthPercentage / 2,
                    });
                    if (side === 'right') {
                      acc.push(newCell);
                    }
                  } else {
                    acc.push(cell);
                  }
                  return acc;
                }, []),
              };
            }
            return row;
          }),
        };
      }

      if (columnIndex === fromColumnIndex) {
        newColumn = clearColumnFromEmptyRows(newColumn);
      }

      return newColumn;
    }),
  };
}

/**
 * Updates the layout based on drag and drop operations.
 *
 * @param layout - The current layout to modify
 * @param dragData - Data about the dragged widget
 * @param dropData - Data about the drop target and operation type
 *
 * @returns A new layout reflecting the drag and drop operation
 *
 * @internal
 */
export function updateLayoutAfterDragAndDrop(
  layout: WidgetsPanelLayout,
  dragData: EditableLayoutDragData,
  dropData: EditableLayoutDropData,
) {
  switch (dropData.type) {
    case DropType.SWAP:
      return swapWidgetsInLayout(layout, dragData.widgetId, dropData.widgetId);
    case DropType.NEW_ROW:
      return moveWidgetInNewRow(
        layout,
        dragData.widgetId,
        dragData.columnIndex,
        dragData.rowIndex,
        dropData.columnIndex,
        dropData.rowIndex,
      );
    case DropType.PLACE_LEFT:
    case DropType.PLACE_RIGHT:
      return moveWidgetAsideAnother(
        layout,
        dropData.type === DropType.PLACE_LEFT ? 'left' : 'right',
        dragData.widgetId,
        dragData.columnIndex,
        dragData.rowIndex,
        dropData.widgetId,
        dropData.columnIndex,
        dropData.rowIndex,
      );
    default:
      return layout;
  }
}
