import { debug } from '../utils/index.js';
import { CloneFn, LoggerI } from '../utils/types.js';
import { TreeNode, TreeNodeMetadata, TreeServiceI } from './types.js';

export class HeaderTreeService implements TreeServiceI {
  logger: LoggerI;

  hasGrandTotals = false;

  /**
   * columns TreeService
   *
   *
   * @private
   */
  columnsTreeService?: TreeServiceI;

  /**
   * corner TreeService
   *
   *
   * @private
   */
  cornerTreeService?: TreeServiceI;

  /**
   * Final 2D array
   *
   *
   * @private
   */
  grid?: Array<Array<any>>;

  /**
   * columns grid offset base on corner size
   *
   *
   * @private
   */
  cornerOffset = 0;

  constructor(cornerTreeService?: TreeServiceI, columnsTreeService?: TreeServiceI) {
    this.logger = debug.create('PivotHeaderTreeService');

    this.cornerTreeService = cornerTreeService;
    this.columnsTreeService = columnsTreeService;

    this.cornerOffset = this.cornerTreeService ? this.cornerTreeService.getTreeChildLength() : 0;
  }

  /**
   * Returns grid (2d list) of tree structure
   *
   * @returns {Array<Array<TreeNode | string>>} - 2d list
   */
  getGrid(): Array<Array<TreeNode | string>> {
    if (this.grid) {
      return this.grid;
    }
    const cornerGrid = this.cornerTreeService ? this.cornerTreeService.getGrid() : [];
    const columnsGrid = this.columnsTreeService ? this.columnsTreeService.getGrid() : [];

    this.grid = cornerGrid.map((cornerRow = [], index) => {
      const columnsRow = columnsGrid[index] || [];
      return cornerRow.concat(columnsRow);
    });

    return this.grid;
  }

  /**
   * Returns TreeNode item if exist for appropriate coordinates (rowIndex, columnIndex)
   *
   * @param {number} rowIndex - row index
   * @param {number} columnIndex - column index
   * @returns {TreeNode|undefined} - TreeNode item
   */
  getTreeNode(rowIndex: number, columnIndex: number): TreeNode | undefined {
    if (columnIndex >= this.cornerOffset && this.columnsTreeService) {
      return this.columnsTreeService.getTreeNode(rowIndex, columnIndex - this.cornerOffset);
    }
    return this.cornerTreeService
      ? this.cornerTreeService.getTreeNode(rowIndex, columnIndex)
      : undefined;
  }

  /**
   * Defines if cell with (rowIndex, columnIndex) coordinate is children cell or main one
   *
   * @param {number} rowIndex - row index of the cell
   * @param {number} columnIndex - column index of the cell
   * @returns {boolean} - true - if children, false if main one
   */
  isChildren(rowIndex: number, columnIndex: number): boolean {
    if (columnIndex >= this.cornerOffset && this.columnsTreeService) {
      return this.columnsTreeService.isChildren(rowIndex, columnIndex - this.cornerOffset);
    }
    return this.cornerTreeService
      ? this.cornerTreeService.isChildren(rowIndex, columnIndex)
      : false;
  }

  /**
   * Defines if cell with (rowIndex, columnIndex) coordinate has children column/row cells or not
   *
   * @param {number} rowIndex - row index of the cell
   * @param {number} columnIndex - column index of the cell
   * @returns {boolean} - true - has children column/row cells, false - does not have
   */
  hasChildren(rowIndex: number, columnIndex: number): boolean {
    if (columnIndex >= this.cornerOffset && this.columnsTreeService) {
      return this.columnsTreeService.hasChildren(rowIndex, columnIndex - this.cornerOffset);
    }
    return this.cornerTreeService
      ? this.cornerTreeService.hasChildren(rowIndex, columnIndex)
      : false;
  }

  getMainCellWidth(
    rowIndex: number,
    columnIndex: number,
    columnWidth: Function,
    borderWidth: number,
    options: {
      offsetTop?: number;
      columnsOffset?: number;
    } = { offsetTop: -1, columnsOffset: 0 },
  ): number {
    const columnsOffset = options.columnsOffset || this.cornerOffset;
    if (columnIndex >= columnsOffset && this.columnsTreeService) {
      return this.columnsTreeService.getMainCellWidth(
        rowIndex,
        columnIndex - columnsOffset,
        columnWidth,
        borderWidth,
        {
          ...options,
          columnsOffset,
        },
      );
    }
    return this.cornerTreeService
      ? this.cornerTreeService.getMainCellWidth(
          rowIndex,
          columnIndex,
          columnWidth,
          borderWidth,
          options,
        )
      : Number.NaN;
  }

  /**
   * Updates merge object for the cell if it has children cells
   *
   * @param {number} rowIndex - cell row index
   * @param {number} columnIndex - cell column index
   * @returns {object} - new merge object
   */
  getMainCellSpans(rowIndex: number, columnIndex: number): { colSpan?: number; rowSpan?: number } {
    if (columnIndex >= this.cornerOffset && this.columnsTreeService) {
      return this.columnsTreeService.getMainCellSpans(rowIndex, columnIndex - this.cornerOffset);
    }
    return this.cornerTreeService
      ? this.cornerTreeService.getMainCellSpans(rowIndex, columnIndex)
      : {};
  }

  /**
   * Align start index in case of long merged cell
   *
   * @param {number} startIndex - initial start index
   * @param {boolean} isVertical - defines if it is vertical grid or not
   * @returns {number} - new start index
   */
  alignStartIndex(startIndex: number, isVertical?: boolean): number {
    if (startIndex >= this.cornerOffset && this.columnsTreeService) {
      return (
        this.cornerOffset +
        this.columnsTreeService.alignStartIndex(startIndex - this.cornerOffset, isVertical)
      );
    }
    return this.cornerTreeService
      ? this.cornerTreeService.alignStartIndex(startIndex, isVertical)
      : startIndex;
  }

  /**
   * Align stop index in case of long merged cell
   *
   * @param {number} stopIndex - initial stop index
   * @param {boolean} isVertical - defines if it is vertical grid or not
   * @returns {number} - new stop index
   */
  alignStopIndex(stopIndex: number, isVertical?: boolean): number {
    if (stopIndex >= this.cornerOffset && this.columnsTreeService) {
      return (
        this.cornerOffset +
        this.columnsTreeService.alignStopIndex(stopIndex - this.cornerOffset, isVertical)
      );
    }
    return this.cornerTreeService
      ? this.cornerTreeService.alignStopIndex(stopIndex, isVertical)
      : stopIndex;
  }

  /**
   * Returns number of last children for the tree
   *
   * @param {Array<TreeNode> | TreeNode} item - tree node or list of nodes
   * @returns {number} - count of last children
   */
  getTreeChildLength(item?: Array<TreeNode> | TreeNode): number {
    if (item) {
      if (this.columnsTreeService) {
        return this.columnsTreeService.getTreeChildLength(item);
      }
      return this.cornerTreeService ? this.cornerTreeService.getTreeChildLength(item) : 0;
    }
    const cornerLength = this.cornerTreeService ? this.cornerTreeService.getTreeChildLength() : 0;
    const columnsLength = this.columnsTreeService
      ? this.columnsTreeService.getTreeChildLength()
      : 0;
    return cornerLength + columnsLength;
  }

  /**
   * Returns deep level of the tree
   *
   * @param {Array<TreeNode> | TreeNode} item - tree node or list of nodes
   * @returns {number} - count of last children
   */
  getTreeDeepsLength(item?: Array<TreeNode> | TreeNode): number {
    if (this.columnsTreeService) {
      return this.columnsTreeService.getTreeDeepsLength(item);
    }
    return this.cornerTreeService ? this.cornerTreeService.getTreeDeepsLength(item) : 0;
  }

  /**
   * Sets value node when it's single
   *
   * @param {TreeNode} valueNode - values measure node
   * @returns {void}
   */
  setValueNode(valueNode: TreeNode): void {
    if (this.columnsTreeService) {
      this.columnsTreeService.setValueNode(valueNode);
    }
  }

  /**
   * Returns cell meta information
   *
   * @param {number} rowIndex - cell row index
   * @param {number} columnIndex - cell column index
   * @param {{ to: number }} [options] - additional configuration options
   * @returns {{levels: Array<string>, siblings: Array<string>}} - meta information
   */
  getMetadata(
    rowIndex: number,
    columnIndex: number,
    options?: { from: number; to: number },
  ): TreeNodeMetadata | undefined {
    if (columnIndex >= this.cornerOffset && this.columnsTreeService) {
      return this.columnsTreeService.getMetadata(
        rowIndex,
        columnIndex - this.cornerOffset,
        options,
      );
      // eslint-disable-next-line max-lines
    }
    return this.cornerTreeService
      ? this.cornerTreeService.getMetadata(rowIndex, columnIndex, options)
      : undefined;
  }

  destroy(): void {
    if (this.cornerTreeService) {
      this.cornerTreeService.destroy();
    }
    if (this.columnsTreeService) {
      this.columnsTreeService.destroy();
    }
    this.cornerTreeService = undefined;
    this.columnsTreeService = undefined;
  }

  /**
   * Returns array of last tree nodes
   * Should not be called for header
   *
   * @returns {Array<TreeNode>} - list of tree nodes
   * @deprecated
   */
  getLastLevelNodes(): Array<TreeNode> {
    throw new Error(`"${this.constructor.name}.getLastLevelNodes" should not be called`);
    // TODO review this
    return this as unknown as Array<TreeNode>; // eslint-disable-line no-unreachable
  }

  /**
   * Extract 2D array of data base on columnsTreeService
   * Should not be called for header
   *
   * @param {TreeServiceI} columnsTreeService - tree service according to which align the data
   * @returns {Array<Array<any>>} - 2D array of data
   * @deprecated
   */
  extractData(columnsTreeService?: TreeServiceI): Array<Array<any>> {
    throw new Error(`"${this.constructor.name}.extractData" should not be called`);
    // TODO review this
    return (this as unknown as Array<Array<any>>) || columnsTreeService; // eslint-disable-line no-unreachable
  }

  /**
   * Adds additional tree node to current state
   * Should not be called for header
   *
   * @param {TreeNode} tree - new treeNode
   * @returns {void}
   * @deprecated
   */
  extend(tree?: TreeNode): void {
    throw new Error(`"${this.constructor.name}.extend" should not be called`);
    // TODO review this
    // return (this as unknown as void) || (tree as unknown as void); // eslint-disable-line no-unreachable
  }

  /**
   * Returns part of current tree with possible cut nodes according to "from" - "to" position
   * Should not be called for header
   *
   * @param {number} from - start rows index for partial grid
   * @param {number} [to] - stop rows index for partial grid
   * @param {object} [options] - additional options
   * @param {Function} [options.cloneFn] - replace default clone function with specific one
   * @returns {Array<TreeNode>} - partial tree
   * @deprecated
   */
  getPartialTree(from: number, to?: number, options?: { cloneFn?: CloneFn }): Array<TreeNode> {
    throw new Error(`"${this.constructor.name}.getPartialTree" should not be called`);
    // TODO review this
    return (
      (this as unknown as Array<TreeNode>) ||
      (from as unknown as Array<TreeNode>) ||
      (to as unknown as Array<TreeNode>) ||
      (options as unknown as Array<TreeNode>)
    ); // eslint-disable-line no-unreachable
  }

  /**
   * Returns part of current grid according to "from" - "to" position
   * Should not be called for header
   *
   * @param {number} from - start rows index for partial grid
   * @param {number} to - stop rows index for partial grid
   * @returns {Array<Array<TreeNode | string>>} - partial grid
   * @deprecated
   */
  getPartialGrid(from: number, to: number): Array<Array<TreeNode | string>> {
    throw new Error(`"${this.constructor.name}.getPartialGrid" should not be called`);
    // TODO review this
    return (
      (this as unknown as Array<Array<TreeNode | string>>) ||
      (from as unknown as Array<Array<TreeNode | string>>) ||
      (to as unknown as Array<Array<TreeNode | string>>)
    ); // eslint-disable-line no-unreachable
  }
}

export default HeaderTreeService;
