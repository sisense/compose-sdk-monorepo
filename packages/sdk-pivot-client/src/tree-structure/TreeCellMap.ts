import { TreeCellMapI, TreeNode } from './types.js';

/**
 * TreeCellMap keep mapping between grid cells and tree nodes
 */
export class TreeCellMap implements TreeCellMapI {
  rowIndex: number;

  colIndex: number;

  node?: TreeNode;

  parent?: string;

  /**
    @private */
  childColCells: Array<TreeCellMapI> = [];

  /**
    @private */
  childRowCells: Array<TreeCellMapI> = [];

  /**
    @private */
  indexInParent = -1;

  /**
    @private */
  siblingCount = 0;

  constructor(rowIndex: number, colIndex: number, node?: TreeNode, parent?: string) {
    this.rowIndex = rowIndex;
    this.colIndex = colIndex;
    this.node = node;
    this.parent = parent;
  }

  /**
   * Defines if grid cell is child or main one
   *
   * @returns {boolean} - true - is children, false - main one
   */
  isChild(): boolean {
    return !this.node;
  }

  /**
   * Defines if node has child row or column nodes or not
   *
   * @returns {boolean} - true - has children, false - does not have
   */
  hasChildren(): boolean {
    return !!(this.childColCells.length || this.childRowCells.length);
  }

  /**
   * Defines if node has child column nodes or not
   *
   * @returns {boolean} - true - has column children, false - does not have
   */
  hasColCell(): boolean {
    return this.childColCells.length > 0;
  }

  /**
   * Adds column children cell
   *
   * @param {TreeCellMapI} cell - column children
   * @returns {void}
   */
  addColCell(cell: TreeCellMapI) {
    this.childColCells.push(cell);
  }

  /**
   * Returns list of column children
   *
   * @returns {Array<TreeCellMapI>} - list of column children
   */
  getColCell(): Array<TreeCellMapI> {
    return this.childColCells || [];
  }

  /**
   * Defines if node has child row nodes or not
   *
   * @returns {boolean} - true - has row children, false - does not have
   */
  hasRowCell(): boolean {
    return this.childRowCells.length > 0;
  }

  /**
   * Adds row children cell
   *
   * @param {TreeCellMapI} cell - row children
   * @returns {void}
   */
  addRowCell(cell: TreeCellMapI) {
    this.childRowCells.push(cell);
  }

  /**
   * Returns list of row children
   *
   * @returns {Array<TreeCellMapI>} - list of row children
   */
  getRowCell(): Array<TreeCellMapI> {
    return this.childRowCells || [];
  }

  /**
   * Returns row index of last merged cell
   *
   * @returns {number} - row index
   */
  getStopRowIndex(): number {
    if (!this.hasRowCell()) {
      return this.rowIndex;
    }
    return this.rowIndex + this.getRowCell().length;
  }

  /**
   * Returns column index of last merged cell
   *
   * @returns {number} - column index
   */
  getStopColIndex(): number {
    if (!this.hasColCell()) {
      return this.colIndex;
    }
    return this.colIndex + this.getColCell().length;
  }

  /**
   * Save index of node in parent child and total parent child count
   *
   * @param {number} indexInParent - index
   * @param {number} siblingCount - child count
   * @returns {void}
   */
  setIndexInParent(indexInParent: number, siblingCount: number): void {
    this.indexInParent = indexInParent;
    this.siblingCount = siblingCount;
  }

  /**
   * Returns node index in parent and total parent child count
   *
   * @returns {{ indexInParent: number, siblingCount: number }} - index & count
   */
  getIndexInParent(): { indexInParent: number; siblingCount: number } {
    return {
      indexInParent: this.indexInParent,
      siblingCount: this.siblingCount,
    };
  }

  getParenPosition(): Array<number> | undefined {
    if (!this.parent) {
      return undefined;
    }
    const res = (this.parent || '').match(/\d+/g) || [];
    return [Number(res[0]), Number(res[1])];
  }
}

export default TreeCellMap;
