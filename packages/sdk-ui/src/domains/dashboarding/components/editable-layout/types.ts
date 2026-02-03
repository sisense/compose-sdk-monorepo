/**
 * The type of drop operation
 *
 * @internal
 */
export enum DropType {
  /**
   * Place the cell aside another cell to the left
   */
  PLACE_LEFT = 'PLACE_LEFT',
  /**
   * Place the cell aside another cell to the right
   */
  PLACE_RIGHT = 'PLACE_RIGHT',
  /**
   * Swap the position of two cells
   */
  SWAP = 'SWAP',
  /**
   * Move the cell to a new row
   */
  NEW_ROW = 'NEW_ROW',
}

/**
 * Data about the dragged cell
 *
 * @internal
 */
export type EditableLayoutDragData = {
  /**
   * The unique identifier of the widget
   */
  widgetId: string;
  /**
   * The column index
   */
  columnIndex: number;
  /**
   * The row index
   */
  rowIndex: number;
};

/**
 * Data about the drop target
 *
 * @internal
 */
export type EditableLayoutDropData =
  | {
      /**
       * The type of drop operation
       */
      type: DropType.PLACE_LEFT | DropType.PLACE_RIGHT | DropType.SWAP;
      /**
       * The unique identifier of the widget
       */
      widgetId: string;
      /**
       * The column index
       */
      columnIndex: number;
      /**
       * The row index
       */
      rowIndex: number;
    }
  | {
      /**
       * The type of drop operation
       */
      type: DropType.NEW_ROW;
      /**
       * The column index
       */
      columnIndex: number;
      /**
       * The row index
       */
      rowIndex?: number;
    };
