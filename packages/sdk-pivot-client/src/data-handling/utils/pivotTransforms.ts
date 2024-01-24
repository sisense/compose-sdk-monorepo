/* eslint-disable @typescript-eslint/ban-types */
import { treeNode } from '../../tree-structure/utils/index.js';
import { createPivotTreeNode, jaqlProcessor } from './index.js';
import { PanelType, UserType, ColorFormatType } from '../constants.js';
import { TreeNode } from '../../tree-structure/types.js';
import { JaqlRequest, JaqlPanel } from '../../data-load/types.js';
import { PivotTreeNode, PivotDataNode } from '../types.js';

/**
 * Helper for checking if tree has only one branch on all it's depth levels
 *
 * @param {TreeNode} root - tree root node
 * @param {string} type - tree node type, rows | columns
 * @returns {boolean} - boolean response
 */
function hasTreeMultipleBranches(root?: TreeNode, type?: string): boolean {
  if (!treeNode.hasChildren(root)) {
    return false;
  }
  let forceTotals = false;
  if (type === PanelType.COLUMNS && root && root.isPart) {
    forceTotals = true;
  }

  const children = treeNode.getChildren(root);
  if (children.length > 1 || forceTotals) {
    return true;
  }

  const [singleChild] = children;
  return hasTreeMultipleBranches(singleChild);
}

/**
 * Helper for checking if node value is empty
 *
 * @param {*} value - node value
 * @returns {boolean} - is empty flag
 */
function isEmptyValue(value: any): boolean {
  return value === null || value === undefined;
}

export const insertSubTotals = (
  items: PivotTreeNode[],
  originalData: TreeNode | undefined,
  type: string,
  jaql: JaqlRequest | undefined, // eslint-disable-line no-unused-vars
  subtotalsForSingleRow: boolean | undefined,
): Array<PivotTreeNode> => {
  const result: Array<PivotTreeNode> = [];
  // eslint-disable-next-line sonarjs/cognitive-complexity
  items.forEach((item: PivotTreeNode) => {
    // keep original item
    result.push(item);

    if (treeNode.hasChildren(item)) {
      const newChildrenNodes = treeNode.getChildren(item);
      const newChildren = insertSubTotals(
        newChildrenNodes,
        originalData,
        type,
        jaql,
        subtotalsForSingleRow,
      );
      treeNode.setChildren(item, newChildren);

      // check if item has subtotal
      let hasSubTotals = false;
      if (subtotalsForSingleRow || hasTreeMultipleBranches(item, type)) {
        if (type === PanelType.COLUMNS) {
          if (typeof item.index !== 'undefined' && item.index > -1) {
            hasSubTotals = true;
          }
        } else if (type === PanelType.ROWS) {
          if (typeof item.data !== 'undefined') {
            hasSubTotals = true;
          }
        }
      }

      if (hasSubTotals) {
        const { value, index, data, jaqlIndex, measurePath } = item;
        let roughSubTotalItem;
        if (type === PanelType.COLUMNS) {
          roughSubTotalItem = treeNode.create(value, undefined, undefined, index);
        } else if (type === PanelType.ROWS) {
          roughSubTotalItem = treeNode.create(value, undefined, data);
        }
        if (roughSubTotalItem) {
          const subTotalItem = createPivotTreeNode(roughSubTotalItem, type);
          subTotalItem.userType = UserType.SUB_TOTAL;
          subTotalItem.jaqlIndex = jaqlIndex;
          subTotalItem.measurePath = measurePath;
          subTotalItem.master = item;
          result.push(subTotalItem);
        }
      }
    }
  });

  return result;
};

// eslint-disable-next-line no-unused-vars
export const postProcessSubTotal = (item: PivotTreeNode, jaql?: JaqlRequest): void => {
  if (item.userType === UserType.SUB_TOTAL) {
    if (item.master) {
      item.measurePath = item.master.measurePath;
    }
  }
};

export const insertGrandTotals = (
  items: PivotTreeNode[],
  originalData: TreeNode | undefined,
  type: string,
  jaql?: JaqlRequest,
): Array<PivotTreeNode> => {
  const result = items;
  if (type === PanelType.COLUMNS && originalData) {
    const rootItem = createPivotTreeNode(originalData);
    const hasGrandTotals = typeof rootItem.index === 'number';
    if (hasGrandTotals) {
      const valuesTree = jaqlProcessor.getMetadataTree(jaql, PanelType.MEASURES);
      treeNode.getChildren(valuesTree).forEach((valueNode, i) => {
        const roughGrandTotalItem = {
          ...valueNode,
          index: (rootItem.index || 0) + i,
        };
        const grandTotalItem = createPivotTreeNode(roughGrandTotalItem, type);
        grandTotalItem.userType = UserType.GRAND_TOTAL;
        // set measure jaqlIndex
        grandTotalItem.measureJaqlIndex = grandTotalItem.jaqlIndex;
        result.push(grandTotalItem);
      });
    }
  }
  return result;
};

// eslint-disable-next-line no-unused-vars
export const postProcessGrandTotal = (item: PivotTreeNode, jaql?: JaqlRequest): void => {
  if (item.userType === UserType.GRAND_TOTAL) {
    item.measurePath = undefined;

    if (item.metadataType === PanelType.ROWS) {
      item.parent = undefined;
      item.jaqlIndex = 0;
    }
  }
};

export const insertMeasureNodes = (
  items: PivotTreeNode[],
  originalData: TreeNode | undefined,
  type: string,
  jaql?: JaqlRequest,
): Array<PivotTreeNode> => {
  let result = items;
  if (type === PanelType.COLUMNS) {
    const valuesTree = jaqlProcessor.getMetadataTree(jaql, PanelType.MEASURES);
    const count = treeNode.getChildLength(valuesTree);

    const columnsOptions = { maxLevel: 0 };
    const columnsLastLevel = treeNode.getLastLevelNodes(result, [], 0, columnsOptions);

    if (count > 1) {
      // add values nodes at the last level
      columnsLastLevel.forEach((lastNode: PivotTreeNode) => {
        if (lastNode.userType === UserType.GRAND_TOTAL) {
          return;
        }
        const lastChildren = treeNode.getChildren(valuesTree);
        const lastFinalChildren = [];
        for (let i = 0; i < lastChildren.length; i += 1) {
          if (typeof lastNode.maxChilds === 'number' && i >= lastNode.maxChilds) {
            // eslint-disable-next-line no-continue
            continue;
          }
          const roughMeasureItem = {
            ...lastChildren[i],
            index: (lastNode.index || 0) + i,
            measurePath: lastNode.measurePath,
          };
          const measureItem = createPivotTreeNode(roughMeasureItem, PanelType.MEASURES);
          measureItem.userType = UserType.MEASURE_BOTTOM;
          // set measure jaqlIndex
          measureItem.measureJaqlIndex = measureItem.jaqlIndex;
          lastFinalChildren.push(measureItem);
        }
        lastNode.minLevel = columnsOptions.maxLevel;
        treeNode.setChildren(lastNode, lastFinalChildren);
      });
    } else if (count === 1) {
      // add value node at the first level
      const valueNode: PivotTreeNode = treeNode.getChildren(valuesTree)[0];
      if (valueNode) {
        const roughMeasureItem = { ...valueNode };
        const measureItem = createPivotTreeNode(roughMeasureItem, PanelType.MEASURES);
        measureItem.userType = UserType.MEASURE_TOP;
        treeNode.setChildren(measureItem, result);
        result = [measureItem];
        // set measure jaqlIndex
        columnsLastLevel.forEach((lastNode: PivotTreeNode) => {
          lastNode.measureJaqlIndex = valueNode.jaqlIndex;
        });
      }
    }
  }
  return result;
};

export const postProcessMeasureNode = (item: PivotTreeNode, jaql?: JaqlRequest): void => {
  if (!treeNode.hasChildren(item) && typeof item.measureJaqlIndex !== 'undefined') {
    jaqlProcessor.markSortedNode(jaql, item);
  }
};

export const applyColorFormatting = (
  item: PivotDataNode,
  rowItem: PivotTreeNode,
  columnItem: PivotTreeNode,
  measurePanel?: JaqlPanel,
): void => {
  let style: { [key: string]: any } | undefined = {};

  if (
    rowItem.userType === UserType.SUB_TOTAL ||
    rowItem.userType === UserType.GRAND_TOTAL ||
    columnItem.userType === UserType.SUB_TOTAL ||
    columnItem.userType === UserType.GRAND_TOTAL ||
    (columnItem.parent && columnItem.parent.userType === UserType.SUB_TOTAL) ||
    (columnItem.parent && columnItem.parent.userType === UserType.GRAND_TOTAL)
  ) {
    // ignore SUB_TOTAL & GRAND_TOTAL
    return;
  }

  const colorFormat = (measurePanel && measurePanel.format && measurePanel.format.color) || null;
  if (!colorFormat) {
    return;
  }

  const { value, cf = -1 } = item;

  if (colorFormat.type === ColorFormatType.COLOR) {
    if (colorFormat.color && colorFormat.color !== 'transparent') {
      style.backgroundColor = colorFormat.color;
    }
  }
  if (colorFormat.type === ColorFormatType.CONDITION) {
    if (colorFormat.conditions && colorFormat.conditions.length) {
      for (let i = 0, c = colorFormat.conditions.length; i < c; i += 1) {
        // handle empty value case
        if (isEmptyValue(value)) {
          break;
        }

        // handle condition case
        const conditions = colorFormat.conditions || [];
        const { color } = conditions[i] || {};
        if (color && cf === i) {
          style.backgroundColor = color;
          break;
        }
      }
    }
  }

  // if (Object.keys(style).length > 0) {
  //   item.style = item.style || {};
  //   Object.assign(item.style, style);
  // }

  style = undefined;
};

/**
 * Pre-process initial tree structure
 *
 * @param {Array<TreeNode>} items - items to normalize
 * @param {string} type - items types to normalize
 * @param {JaqlRequest} jaql - jaql request
 * @param {object} options - additional options
 * @param {number} [options.level=0] - tree level, for internal use only
 * @param {object} [options.measurePath={}] - items types to normalize
 * @returns {Array<PivotTreeNode>} - normalized list of items
 */
export const preProcessTree = (
  items: TreeNode | Array<TreeNode>,
  type: string,
  jaql: JaqlRequest,
  options?: {
    level?: number;
    measurePath?: { [key: string]: string };
  },
): Array<PivotTreeNode> => {
  const result: Array<PivotTreeNode> = [];
  const { level = 0, measurePath = {} } = options || {};
  let finalItems;
  if (Array.isArray(items)) {
    finalItems = items;
  } else {
    finalItems = treeNode.getChildren(items);
  }
  const panels = jaqlProcessor.getMetadataPanels(jaql, type);
  const panel = panels[level];
  const jaqlIndex = panel ? (panel.field || { index: Infinity }).index : undefined;

  finalItems.forEach((item: TreeNode) => {
    const pivotItem = createPivotTreeNode(item, type);
    pivotItem.jaqlIndex = jaqlIndex;

    if (typeof jaqlIndex !== 'undefined') {
      pivotItem.measurePath = {
        ...measurePath,
        [jaqlIndex]: pivotItem.value,
      };
    }

    // keep original item
    result.push(pivotItem);

    // check if item has children
    if (treeNode.hasChildren(pivotItem)) {
      const newChildrenNodes = treeNode.getChildren(pivotItem);
      const childOptions = {
        level: level + 1,
        measurePath: pivotItem.measurePath,
      };
      const newChildren = preProcessTree(newChildrenNodes, type, jaql, childOptions);
      treeNode.setChildren(pivotItem, newChildren);
    }
  });
  return result;
};

/**
 * Post-process final tree structure with formatting event
 *
 * @param {PivotTreeNode} items - list of PivotTreeNode items
 * @param {JaqlRequest} jaql - jaql request
 * @param {object} [options] - additional options
 * @param {boolean} [options.skipFormatEvent] - process tree but skip format event trigger
 * @param {boolean} [options.onlyFormatEvents] - process tree with format event trigger only
 * @param {Function} [options.iterateFn] - iterate function to call for each tree node
 * @param {Function} [options.emitFn] - transform event emit function to call for each tree node
 * @returns {void}
 */
export const postProcessTree = (
  items: Array<PivotTreeNode>,
  jaql: JaqlRequest,
  options?: {
    skipFormatEvent?: boolean;
    onlyFormatEvents?: boolean;
    iterateFn?: Function;
    emitFn?: (item: PivotTreeNode, panel: JaqlPanel | undefined, jaql: JaqlRequest) => void;
  },
): void => {
  const { skipFormatEvent = false, onlyFormatEvents = false, iterateFn, emitFn } = options || {};

  items.forEach((item) => {
    if (iterateFn) {
      iterateFn(item);
    }

    if (skipFormatEvent || !onlyFormatEvents) {
      postProcessSubTotal(item, jaql);
      postProcessGrandTotal(item, jaql);
      postProcessMeasureNode(item, jaql);
    }

    if (emitFn && (onlyFormatEvents || !skipFormatEvent)) {
      const panel = jaqlProcessor.getMetadataPanelByIndex(
        jaql,
        item.jaqlIndex,
        item.metadataType || '',
      );
      emitFn(item, panel, jaql);
    }

    if (treeNode.hasChildren(item)) {
      const itemChilds = treeNode.getChildren(item);
      postProcessTree(itemChilds, jaql, options);
    }
  });
};

/**
 * Modify tree structure for subtotals and grand totals and some customization
 *
 * @param {Array<PivotTreeNode>} items - base items to modify
 * @param {string} type - items types to normalize
 * @param {JaqlRequest} jaql - initial data object
 * @param {object} [options] - modify options
 * @param {TreeNode} [options.originalData] - initial data object
 * @param {Function} [options.applyIndexDivergence] - helper for applying index divergence
 * @returns {PivotTreeNode | Array<PivotTreeNode>} - normalized list of items
 */
const modifyTree = (
  items: Array<PivotTreeNode>,
  type: string,
  jaql: JaqlRequest,
  options?: {
    originalData?: TreeNode;
    applyIndexDivergence?: (items: Array<PivotTreeNode>) => void;
    subtotalsForSingleRow?: boolean;
  },
): Array<PivotTreeNode> => {
  const { originalData, applyIndexDivergence, subtotalsForSingleRow } = options || {};

  // items odd|even apply
  if (applyIndexDivergence) {
    applyIndexDivergence(items);
  }

  // insert subTotal
  let modifiedItems = insertSubTotals(items, originalData, type, jaql, subtotalsForSingleRow);

  // insert grandTotal
  modifiedItems = insertGrandTotals(modifiedItems, originalData, type, jaql);

  // measure nodes
  modifiedItems = insertMeasureNodes(modifiedItems, originalData, type, jaql);

  treeNode.iterateThroughTree(modifiedItems, (item: PivotTreeNode, parent) => {
    item.parent = parent;
  });

  return modifiedItems;
};

export default {
  insertSubTotals,
  postProcessSubTotal,
  insertGrandTotals,
  postProcessGrandTotal,
  insertMeasureNodes,
  postProcessMeasureNode,
  applyColorFormatting,
  preProcessTree,
  modifyTree,
  postProcessTree,
};
