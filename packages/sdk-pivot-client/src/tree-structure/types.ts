/* eslint-disable @typescript-eslint/ban-types */
import { CloneFn, InputStyles } from '../utils/types.js';

export type TreeNode = {
  // raw data
  value?: string;
  // raw data
  content?: string;
  // style object
  style?: InputStyles;
  // matched index for condition formatting
  cf?: number;
  // children nodes list
  children?: Array<TreeNode>;
  // data list for rows nodes
  data?: Array<any>;
  // index in data list for columns nodes
  index?: number;
  // current node's index divergence
  indexDivergence?: number;
  // initial children count in raw data from server
  size?: number;
  // defines is node is some part of real node
  isPart?: boolean;
  // max number children (measures) nodes to insert
  maxChilds?: number;
  // node deep level
  level?: number;
  // node min deep level, for columns nodes with values at the and
  minLevel?: number;
  // internal cache, to make sure that node was already mapped
  isMapped?: boolean;
  // internal cache, for children count
  childCount?: number;
  // internal cache, for children deep
  childDeep?: number;
  // internal data store
  store?: { [key: string]: any };

  // internal
  isHandled?: boolean;
};

export type ColumnsCount = {
  totalColumnsCount: number;
  columnsCount: number;
};

export type HeaderTreeNode = TreeNode & {
  totalColumnsCount?: number;
  columnsCount?: number;
};

export type TreeNodeMetadata = {
  levels: Array<string>;
  siblings: Array<string>;
  root?: TreeNodeMetadata;
  parent?: TreeNodeMetadata;
  valueNode?: TreeNode;
  nextNode?: any;
};

export interface TreeServiceI {
  hasGrandTotals: boolean;
  getGrid(): Array<Array<TreeNode | string>>;
  getTreeNode(rowIndex: number, columnIndex: number): TreeNode | undefined;
  isChildren(rowIndex: number, columnIndex: number): boolean;
  hasChildren(rowIndex: number, columnIndex: number): boolean;
  getMainCellSpans(rowIndex: number, columnIndex: number): { colSpan?: number; rowSpan?: number };
  alignStartIndex(startIndex: number, isVertical?: boolean): number;
  alignStopIndex(stopIndex: number, isVertical?: boolean): number;
  getTreeChildLength(item?: Array<TreeNode> | TreeNode): number;
  getTreeDeepsLength(item?: Array<TreeNode> | TreeNode): number;
  getLastLevelNodes(): Array<TreeNode>;
  extractData(columnsTreeService?: TreeServiceI): Array<Array<any>>;
  setValueNode(valueNode: TreeNode): void;
  getMetadata(
    rowIndex: number,
    columnIndex: number,
    options?: { from: number; to: number },
  ): TreeNodeMetadata | undefined;
  extend(tree?: TreeNode): void;
  getPartialTree(from: number, to?: number, options?: { cloneFn?: CloneFn }): Array<TreeNode>;
  getPartialGrid(from: number, to: number): Array<Array<TreeNode | string>>;
  getMainCellWidth(
    rowIndex: number,
    columnIndex: number,
    columnWidth: Function,
    borderWidth: number,
    options?: { offsetTop?: number; columnsOffset?: number },
  ): number;
  destroy(): void;
}

export interface TreeCellMapI {
  rowIndex: number;
  colIndex: number;
  node?: TreeNode;
  parent?: string;
  isChild(): boolean;
  hasChildren(): boolean;
  hasColCell(): boolean;
  addColCell(cell: TreeCellMapI): void;
  getColCell(): Array<TreeCellMapI>;
  hasRowCell(): boolean;
  addRowCell(cell: TreeCellMapI): void;
  getRowCell(): Array<TreeCellMapI>;
  getStopRowIndex(): number;
  getStopColIndex(): number;
  setIndexInParent(indexInParent: number, siblingCount: number): void;
  getIndexInParent(): { indexInParent: number; siblingCount: number };
  getParenPosition(): Array<number> | undefined;
}
