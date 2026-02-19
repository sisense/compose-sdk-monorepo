import { CloneFn } from '../utils/types.js';
import { Position } from './constants.js';
import { TreeCellMap } from './TreeCellMap.js';
import { TreeCellMapI, TreeNode, TreeNodeMetadata, TreeServiceI } from './types.js';
import { treeNode } from './utils/index.js';

type TreeCellMapCache = {
  [key: string]: TreeCellMapI;
};

type TreeNodeMetadataCache = {
  [key: string]: TreeNodeMetadata;
};

type FillMapState = {
  parentRowIndex: number;
  parentColIndex: number;
  prevChildren: number;
  parentKey: string;
};

const keyCreator = (rowIndex: number, columnIndex: number): string => `${rowIndex}-${columnIndex}`;

/**
 * AbstractTreeService required as parent class to solve circular dependencies
 * TreeService converts tree structure into grid structure, also it keeps inner grid structure
 * to update cache system (via setCellCache) and receive merged cells (via updateMainCellMargins)
 */
export class AbstractTreeService implements TreeServiceI {
  tree?: TreeNode;

  hasGrandTotals = false;

  /**
   * Defines if tree will be converted to vertical or horizontal grid
   *
   *
   * @private
   */
  isVertical = false;

  deep?: number;

  /**
   * Cache tree nodes by deep levels
   *
   *
   * @private
   */
  columns: Array<Array<TreeNode>> = [];

  /**
   * Cache last levels tree nodes
   *
   *
   * @private
   */
  lastLevel: Array<any> = [];

  /**
   * Mapping object between tree<>grid
   *
   *
   * @private
   */
  map: TreeCellMapCache = {};

  /**
   * Metadata cache object
   *
   *
   * @private
   */
  metadataCache: TreeNodeMetadataCache = {};

  /**
   * Keep value node if it only one
   *
   *
   * @private
   */
  valueNode?: TreeNode;

  /**
   * Final 2D array
   *
   *
   * @private
   */
  grid?: Array<Array<any>>;

  constructor(tree?: TreeNode, isVertical = false, deep?: number) {
    this.isVertical = isVertical;
    this.deep = deep;
    if (tree) {
      this.tree = tree;
      this.columns = this.cacheLevels(treeNode.getChildren(this.tree));
    }
  }

  destroy() {
    this.tree = undefined;
    this.columns = [];
    this.lastLevel = [];
    this.map = {};
    this.metadataCache = {};
    this.valueNode = undefined;
    this.grid = undefined;
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
    const { columnsOffset = 0 } = options;
    const item: TreeCellMapI | undefined = this.getItem(rowIndex, columnIndex);

    const isMergedColumn = item && item.hasChildren() && item.hasColCell();

    let width = Number.NaN;
    let hasAllWidth = true;
    if (item && isMergedColumn) {
      const childColCells = item.getColCell();
      const parentItemWidth = columnWidth({ index: columnIndex + columnsOffset });

      width = childColCells.reduce((prev, curr) => {
        const currentWidth = columnWidth({ index: curr.colIndex + columnsOffset });
        if (!currentWidth) {
          hasAllWidth = false;
        }
        return prev + currentWidth;
      }, parentItemWidth);
      width -= borderWidth;
      width = Math.ceil(width);
    }
    return hasAllWidth ? width : Number.NaN;
  }

  /**
   * Adds additional tree node to current state
   *
   * @param {TreeNode} tree - new treeNode
   * @returns {void}
   */
  extend(tree?: TreeNode) {
    if (tree) {
      this.grid = undefined;
      this.tree = treeNode.merge(this.tree, tree);
      this.columns = this.cacheLevels(treeNode.getChildren(tree), this.columns);
    }
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
    let rows = this.getTreeDeepsLength();
    let cols = this.getTreeChildLength();
    if (this.isVertical) {
      [rows, cols] = [cols, rows];
      this.map = this.fillMapVertical(treeNode.getChildren(this.tree), cols, this.map);
    } else {
      this.map = this.fillMap(treeNode.getChildren(this.tree), rows, this.map);
    }

    this.grid = Array.from(Array(rows)).map((rO, rowIndex) =>
      Array.from(Array(cols)).map((cO, colIndex) => {
        const key = keyCreator(rowIndex, colIndex);
        const mapItem = this.map[key];
        if (!mapItem) {
          throw new Error(`Key "${key}" does not found in TreeService`);
        }
        return mapItem.node ? mapItem.node : mapItem.parent;
      }),
    );

    return this.grid;
  }

  /**
   * Returns part of current grid according to "from" - "to" position
   *
   * @param {number} from - start rows index for partial grid
   * @param {number} to - stop rows index for partial grid
   * @returns {Array<Array<TreeNode | string>>} - partial grid
   */
  getPartialGrid(from: number, to: number): Array<Array<TreeNode | string>> {
    if (!this.isVertical) {
      throw new Error('"getPartialGrid" can only be used for "vertical" tree');
    }

    const cols = this.getTreeDeepsLength();

    const treeChild = treeNode.getChildren(this.tree);
    const { nodes, start, stop } = treeNode.getNodesByChildCount(treeChild, from, to);

    this.fillMapVertical(nodes, cols, this.map, {
      parentRowIndex: start,
      parentColIndex: 0,
      prevChildren: 0,
      parentKey: '',
    });

    const finalFrom = Math.max(start, from);
    const finalTo = Math.min(stop, to);
    const finalCount = Math.max(0, finalTo - from);

    return Array.from(Array(finalCount)).map((rO, rowIndex) =>
      Array.from(Array(cols)).map((cO, colIndex) => {
        const index = finalFrom + rowIndex;
        const key = keyCreator(index, colIndex);
        const mapItem = this.map[key];
        if (!mapItem) {
          throw new Error(`Key "${key}" does not found in TreeService`);
        }
        return mapItem.node ? mapItem.node : mapItem.parent || '';
      }),
    );
  }

  /**
   * Returns part of current tree with possible cut nodes according to "from" - "to" position
   *
   * @param {number} from - start rows index for partial grid
   * @param {number} [to] - stop rows index for partial grid
   * @param {object} [options] - additional options
   * @param {Function} [options.cloneFn] - replace default clone function with specific one
   * @returns {Array<TreeNode>} - partial tree
   */
  getPartialTree(from: number, to?: number, options?: { cloneFn?: CloneFn }): Array<TreeNode> {
    const treeChild = treeNode.getChildren(this.tree);
    return treeNode.getCutNodesByChildCount(treeChild, from, to, options);
  }

  /**
   * Returns TreeNode item if exist for appropriate coordinates (rowIndex, columnIndex)
   *
   * @param {number} rowIndex - row index
   * @param {number} columnIndex - column index
   * @returns {TreeNode|undefined} - TreeNode item
   */
  getTreeNode(rowIndex: number, columnIndex: number): TreeNode | undefined {
    const mapItem = this.getItem(rowIndex, columnIndex);
    if (mapItem && mapItem.node) {
      return mapItem.node;
    }
    return undefined;
  }

  /**
   * Defines if cell with (rowIndex, columnIndex) coordinate is children cell or main one
   *
   * @param {number} rowIndex - row index of the cell
   * @param {number} columnIndex - column index of the cell
   * @returns {boolean} - true - if children, false if main one
   */
  isChildren(rowIndex: number, columnIndex: number): boolean {
    const item: TreeCellMapI | undefined = this.getItem(rowIndex, columnIndex);
    if (item) {
      return item.isChild();
      // eslint-disable-next-line max-lines
    }
    if (typeof this.deep === 'number') {
      if ((this.isVertical ? columnIndex : rowIndex) < this.deep) {
        return true;
      }
    }
    throw new Error(`Item "${rowIndex}-${columnIndex}" does not found in TreeService`);
  }

  /**
   * Defines if cell with (rowIndex, columnIndex) coordinate has children column/row cells or not
   *
   * @param {number} rowIndex - row index of the cell
   * @param {number} columnIndex - column index of the cell
   * @returns {boolean} - true - has children column/row cells, false - does not have
   */
  hasChildren(rowIndex: number, columnIndex: number): boolean {
    const item: TreeCellMapI | undefined = this.getItem(rowIndex, columnIndex);
    if (item) {
      return item.hasChildren();
    }
    throw new Error(`Item "${rowIndex}-${columnIndex}" does not found in TreeService`);
  }

  /**
   * Updates merge object for the cell if it has children cells
   *
   * @param {number} rowIndex - cell row index
   * @param {number} columnIndex - cell column index
   * @returns {object} - new merge object
   */
  getMainCellSpans(rowIndex: number, columnIndex: number): { colSpan?: number; rowSpan?: number } {
    const spans: { colSpan?: number; rowSpan?: number } = {};
    const mainItem: TreeCellMapI | undefined = this.getItem(rowIndex, columnIndex);

    if (mainItem && mainItem.hasColCell()) {
      spans.colSpan = mainItem.getColCell().length + 1;
    }

    if (mainItem && mainItem.hasRowCell()) {
      spans.rowSpan = mainItem.getRowCell().length + 1;
    }

    return spans;
  }

  /**
   * Align start index in case of long merged cell
   *
   * @param {number} startIndex - initial start index
   * @param {boolean} isVertical - defines if it is vertical grid or not
   * @returns {number} - new start index
   */
  alignStartIndex(startIndex: number, isVertical = false): number {
    let row = 0;
    let col = startIndex;
    if (isVertical) {
      row = startIndex;
      col = 0;
    }
    if (this.isVertical === isVertical) {
      let curItem: TreeCellMapI | undefined = this.getItem(row, col);
      if (curItem && curItem.isChild()) {
        curItem = this.getItemByKey(curItem.parent || '');
      }
      if (curItem) {
        return isVertical ? curItem.rowIndex : curItem.colIndex;
      }
    }
    return startIndex;
  }

  /**
   * Align stop index in case of long merged cell
   *
   * @param {number} stopIndex - initial stop index
   * @param {boolean} isVertical - defines if it is vertical grid or not
   * @returns {number} - new stop index
   */
  alignStopIndex(stopIndex: number, isVertical = false): number {
    let row = 0;
    let col = stopIndex;
    if (isVertical) {
      row = stopIndex;
      col = 0;
    }
    if (this.isVertical === isVertical) {
      let curItem: TreeCellMapI | undefined = this.getItem(row, col);
      if (curItem && curItem.isChild()) {
        curItem = this.getItemByKey(curItem.parent || '');
      }
      if (curItem) {
        return isVertical ? curItem.getStopRowIndex() : curItem.getStopColIndex();
      }
    }
    return stopIndex;
  }

  /**
   * Returns number of last children for the tree
   *
   * @param {Array<TreeNode> | TreeNode} item - tree node or list of nodes
   * @param {{ callCount: number, clearCache: boolean }} options - options for state
   * @returns {number} - count of last children
   */
  getTreeChildLength(
    item: TreeNode[] | TreeNode | undefined = treeNode.getChildren(this.tree),
    options?: { callCount?: number; clearCache?: boolean },
  ): number {
    return treeNode.getChildLength(item, options);
  }

  /**
   * Returns deep level of the tree
   *
   * @param {Array<TreeNode> | TreeNode} item - tree node or list of nodes
   * @param {{ callCount: number, clearCache: boolean }} options - options for inner state
   * @returns {number} - count of last children
   */
  getTreeDeepsLength(
    item: TreeNode[] | TreeNode | undefined = treeNode.getChildren(this.tree),
    options?: { callCount?: number; clearCache?: boolean },
  ): number {
    if (typeof this.deep !== 'undefined' && this.deep !== undefined) {
      return this.deep;
    }
    return treeNode.getDeepLength(item, options);
  }

  /**
   * Returns array of last tree nodes
   *
   * @returns {Array<TreeNode>} - list of tree nodes
   */
  getLastLevelNodes(): Array<TreeNode> {
    return this.lastLevel;
  }

  /**
   * Extract 2D array of data base on columnsTreeService
   *
   * @param {TreeServiceI} columnsTreeService - tree service according to which align the data
   * @returns {Array<Array<any>>} - 2D array of data
   */
  extractData(columnsTreeService?: TreeServiceI): Array<Array<any>> {
    if (!columnsTreeService) {
      return [];
    }
    const columsLastNodes = columnsTreeService.getLastLevelNodes();
    const sortIndexes = columsLastNodes.map((node) => node.index);

    return this.getLastLevelNodes().map((node) => {
      if (typeof node.data === 'undefined') {
        return [node.data];
      }
      if (sortIndexes) {
        return sortIndexes.map((index) => {
          let data;
          if (typeof index !== 'undefined' && node.data) {
            data = node.data[index];
          }
          return data;
        });
      }
      return node.data;
    });
  }

  /**
   * Returns cell meta information
   *
   * @param {number} rowIndex - cell row index
   * @param {number} columnIndex - cell column index
   * @param {{ to: number }} [options] - additional configuration options
   * @returns {{levels: Array<string>, siblings: Array<string>}} - meta information
   */
  // eslint-disable-next-line max-lines-per-function,sonarjs/cognitive-complexity
  getMetadata(
    rowIndex: number,
    columnIndex: number,
    options?: { from: number; to: number },
  ): TreeNodeMetadata | undefined {
    const levelCount = this.getTreeDeepsLength();
    if (rowIndex === Infinity) {
      // eslint-disable-next-line no-param-reassign
      rowIndex = levelCount ? levelCount - 1 : levelCount;
    }
    if (columnIndex === Infinity) {
      // eslint-disable-next-line no-param-reassign
      columnIndex = levelCount ? levelCount - 1 : levelCount;
    }
    const key = `${rowIndex}-${columnIndex}`;
    if (this.metadataCache[key]) {
      return this.metadataCache[key];
    }
    let mapItem = this.getItemByKey(key);
    if (!mapItem) {
      throw new Error(`Can not find metadata info for ${key} cell`);
    }
    let nodeItem: TreeNode | undefined = mapItem ? mapItem.node : undefined;
    // looking for parent
    if (!nodeItem) {
      mapItem = this.getItemByKey(mapItem.parent || '');
    }
    if (!mapItem) {
      throw new Error(`Can not find metadata info for parent ${key} cell`);
    }
    nodeItem = mapItem ? mapItem.node : undefined;
    const nextMapItem = this.getItemByKey(`${rowIndex + 1}-${columnIndex}`);
    const nextNodeItem = nextMapItem ? nextMapItem.node : undefined;

    // levels info
    const level = (nodeItem && nodeItem.level) || 0;
    const lastLevel = this.isVertical ? mapItem.getStopColIndex() : mapItem.getStopRowIndex();
    // siblings info
    let { indexInParent, siblingCount } = mapItem.getIndexInParent();
    let lastIndexInParent = indexInParent;

    // fix sibling for partial tree top/first level
    if (level === 0) {
      siblingCount = this.getTreeChildLength();
      indexInParent = this.isVertical ? mapItem.rowIndex : mapItem.colIndex;
      lastIndexInParent =
        indexInParent +
        (this.isVertical ? mapItem.getRowCell().length : mapItem.getColCell().length);
    }

    if (options) {
      // pagination
      const maxCount = options.to - options.from;
      if (siblingCount <= maxCount && lastIndexInParent > maxCount - 1) {
        lastIndexInParent = maxCount - 1;
      }
    }

    const data: TreeNodeMetadata = {
      levels: [],
      siblings: [],
      root: undefined,
      parent: undefined,
      valueNode: this.valueNode,
      nextNode: nextNodeItem,
    };
    const { indexDivergence } = nodeItem || {};
    if (typeof indexDivergence === 'number') {
      const siblingsStatus = indexDivergence === 0 ? Position.EVEN : Position.ODD;
      data.siblings.push(siblingsStatus);
    }

    if (level === 0) {
      data.levels.push(Position.FIRST);
    }
    if (lastLevel === levelCount - 1) {
      data.levels.push(Position.LAST);
    }
    if (indexInParent === 0) {
      data.siblings.push(Position.FIRST);
    }
    if (lastIndexInParent === siblingCount - 1) {
      data.siblings.push(Position.LAST);
    }

    // get root node
    if (nodeItem && level !== 0) {
      const rootRowIndex = this.isVertical ? rowIndex : 0;
      const rootColumnIndex = this.isVertical ? 0 : columnIndex;
      data.root = this.getMetadata(rootRowIndex, rootColumnIndex, options);
    }

    const parentMapItem = this.getItemByKey(mapItem.parent || '');

    // get parent node
    if (parentMapItem && level !== 0) {
      data.parent = this.getMetadata(parentMapItem.rowIndex, parentMapItem.colIndex, options);
    }

    if (options) {
      // pagination
      const startIndex = this.isVertical ? mapItem.rowIndex : mapItem.colIndex;
      const stopIndex = this.isVertical ? mapItem.getStopRowIndex() : mapItem.getStopColIndex();
      let parentStopIndex;
      if (parentMapItem) {
        parentStopIndex = this.isVertical
          ? parentMapItem.getStopRowIndex()
          : parentMapItem.getStopColIndex();
      }

      if (parentStopIndex !== undefined && parentStopIndex >= options.to - options.from) {
        // item is cut
        if (stopIndex >= options.to - options.from - 1 && !data.siblings.includes(Position.LAST)) {
          data.siblings.push(Position.LAST);
        }
      }

      if (startIndex === 0 && !data.siblings.includes(Position.FIRST)) {
        // in paginated case we always has min cell
        data.siblings.push(Position.FIRST);
      }
    }

    this.metadataCache[key] = data;

    return data;
  }

  /**
   * Sets value node when it's single
   *
   * @param {TreeNode} valueNode - values measure node
   * @returns {void}
   */
  setValueNode(valueNode: TreeNode): void {
    if (typeof valueNode === 'object') {
      this.valueNode = valueNode;
    }
  }

  /**
   * Fills cache object with nodes by appropriate deep level
   *
   * @param {Array<TreeNode>} list - list of nodes to cache
   * @param {Array<Array<TreeNode>>} cache - cache object
   * @param {{level: number }} options - internal recursive state
   * @returns {Array<Array<TreeNode>>} - cache object
   *
   * @private
   */
  cacheLevels(
    list: Array<TreeNode>,
    cache: Array<Array<TreeNode>> = [],
    options: { level: number } = { level: 0 },
  ) {
    const { level } = options;
    list.forEach((item) => {
      if (!cache[level]) {
        // eslint-disable-next-line no-param-reassign
        cache[level] = [];
      }
      treeNode.setLevel(item, level);
      cache[level].push(item);
      if (treeNode.hasChildren(item)) {
        const childLevel = level + 1;
        this.cacheLevels(treeNode.getChildren(item), cache, { level: childLevel });
      } else {
        this.lastLevel.push(item);
      }
    });
    return cache;
  }

  /**
   * Fill horizontal grid map according to tree structure
   *
   * @param {Array<TreeNode>} children - list of tree nodes
   * @param {number} rows - deep level rows
   * @param {object} map - map object to fill
   * @param {{parentColIndex: number, prevChildren: number}} initState - state object for
   * recursive calls
   * @returns {object} - map object
   *
   * @private
   */
  fillMap(
    children: Array<TreeNode>,
    rows: number,
    map: TreeCellMapCache = {},
    initState?: FillMapState,
  ) {
    const state = initState || {
      parentRowIndex: 0,
      parentColIndex: 0,
      prevChildren: 0,
      parentKey: '',
    };
    const childCount = children.length;
    children.forEach((item: TreeNode, colIndex: number) => {
      const { parentRowIndex, parentColIndex, prevChildren, parentKey } = state;
      const rowIndex = treeNode.getLevel(item);
      const rowStart = rowIndex + parentRowIndex;
      const colStart = colIndex + parentColIndex + prevChildren;
      const mainKey = keyCreator(rowStart, colStart);
      const mapMainItem = this.createTreeCellMap({
        rowIndex: rowStart,
        colIndex: colStart,
        node: item,
        parent: parentKey,
      });
      mapMainItem.setIndexInParent(colIndex, childCount);
      map[mainKey] = mapMainItem;
      let col = 0;
      let row = 0;
      if (treeNode.hasChildren(item)) {
        col = this.getTreeChildLength(item);
        if (typeof item.minLevel === 'number') {
          // min level in case values offset
          row = item.minLevel + 1 - rowStart || 0;
        }
      } else {
        row = (rows || 0) - (rowStart || 0);
      }
      if (col > 1 || row > 1) {
        // if has merged cells
        this.fillChildMap(map, mainKey, rowStart, colStart, row, col);
      }
      if (treeNode.hasChildren(item)) {
        const childState = {
          ...state,
          parentRowIndex: row > 1 ? row - 1 : 0,
          parentColIndex: colIndex + parentColIndex,
          parentKey: mainKey,
        };
        this.fillMap(treeNode.getChildren(item), rows, map, childState);
        if (col > 1) {
          state.prevChildren += col - 1;
        }
      }
    });
    return map;
  }

  /**
   * Fill vertical grid map according to tree structure
   *
   * @param {Array<TreeNode>} children - list of tree nodes
   * @param {number} cols - deep level columns
   * @param {TreeCellMapCache} map - map object to fill
   * @param {FillMapState} initState - state object for
   * recursive calls
   * @returns {object} - map object
   *
   * @private
   */
  fillMapVertical(
    children: Array<TreeNode>,
    cols: number,
    map: TreeCellMapCache = {},
    initState?: FillMapState,
  ) {
    const state = initState || {
      parentRowIndex: 0,
      parentColIndex: 0,
      prevChildren: 0,
      parentKey: '',
    };
    const childCount = children.length;
    children.forEach((item: TreeNode, rowIndex: number) => {
      if (item.isMapped) {
        state.parentRowIndex += treeNode.getChildLength(item) - 1;
        return;
      }
      item.isMapped = true;
      const { parentRowIndex, prevChildren, parentKey } = state;
      const colIndex = treeNode.getLevel(item);
      const rowStart = rowIndex + parentRowIndex + prevChildren;
      const mainKey = keyCreator(rowStart, colIndex);
      const mapMainItem = this.createTreeCellMap({
        rowIndex: rowStart,
        colIndex,
        node: item,
        parent: parentKey,
      });
      mapMainItem.setIndexInParent(rowIndex, childCount);
      map[mainKey] = mapMainItem;
      let col = 0;
      let row = 0;
      if (treeNode.hasChildren(item)) {
        row = this.getTreeChildLength(item);
      } else {
        col = (cols || 0) - (colIndex || 0);
      }
      if (col > 1 || row > 1) {
        // if has merged cells
        this.fillChildMap(map, mainKey, rowStart, colIndex, row, col);
      }
      if (treeNode.hasChildren(item)) {
        const childState = {
          ...state,
          parentRowIndex: rowIndex + parentRowIndex,
          parentKey: mainKey,
        };
        this.fillMapVertical(treeNode.getChildren(item), cols, map, childState);
        if (row > 1) {
          state.prevChildren += row - 1;
        }
      }
    });

    return map;
  }

  /**
   * Fill child items in map according to main cell merged row and col
   *
   * @param {object} map - map object to fill
   * @param {string} mainKey - main cell key in map
   * @param {number} rowStart - main cell row index
   * @param {number} colStart - main cell column index
   * @param {number} row - merged rows count
   * @param {number} col - merged columns count
   * @returns {void}
   *
   * @private
   */
  fillChildMap(
    map: TreeCellMapCache,
    mainKey: string,
    rowStart: number,
    colStart: number,
    row: number,
    col: number,
  ) {
    const mapMainItem = map[mainKey];
    const rowsCount = Math.max(1, row);
    const colsCount = Math.max(1, col);
    Array.from(Array(rowsCount)).forEach((r, rowAddIndex) => {
      Array.from(Array(colsCount)).forEach((c, colAddIndex) => {
        if (rowAddIndex === 0 && colAddIndex === 0) {
          // skip main item
          return;
        }
        const childRowIndex = rowStart + rowAddIndex;
        const childColIndex = colStart + colAddIndex;
        const childKey = keyCreator(childRowIndex, childColIndex);
        const childColItem = this.createTreeCellMap({
          rowIndex: childRowIndex,
          colIndex: childColIndex,
          parent: mainKey,
        });
        map[childKey] = childColItem;

        if (rowAddIndex !== 0 && colAddIndex !== 0) {
          // skip middle items
          return;
        }

        if (colAddIndex === 0) {
          mapMainItem.addRowCell(childColItem);
        }
        if (rowAddIndex === 0) {
          mapMainItem.addColCell(childColItem);
        }
      });
    });
  }

  /**
   * Creates TreeCellMap instance
   *
   * @param {object} options - instance options
   * @param {number} options.rowIndex - row index of cell map instance
   * @param {number} options.colIndex - row index of cell map instance
   * @param {TreeNode} [options.node] - TreeNode for main cell
   * @param {string} [options.parent] - parent key for child item
   * @returns {TreeCellMap} - TreeCellMap instance
   *
   * @private
   */
  // eslint-disable-next-line class-methods-use-this
  createTreeCellMap({
    rowIndex,
    colIndex,
    node,
    parent,
  }: {
    rowIndex: number;
    colIndex: number;
    node?: TreeNode;
    parent?: string;
  }): TreeCellMapI {
    return new TreeCellMap(rowIndex, colIndex, node, parent);
  }

  /**
   * Returns TreeCellMapI item by key string
   *
   * @param {string} key - map key string
   * @returns {TreeCellMapI|undefined} - TreeCellMapI instance or undefined
   *
   * @private
   */
  getItemByKey(key: string): TreeCellMapI | undefined {
    return this.map[key];
  }

  /**
   * Returns TreeCellMapI item by (row, col) coordinate
   *
   * @param {number} row - cell row index
   * @param {number} col - cell column index
   * @returns {TreeCellMapI|undefined} - TreeCellMapI instance or undefined
   *
   * @private
   */
  getItem(row: number, col: number): TreeCellMapI | undefined {
    const key = keyCreator(row, col);
    return this.getItemByKey(key);
  }
}

export default AbstractTreeService;
