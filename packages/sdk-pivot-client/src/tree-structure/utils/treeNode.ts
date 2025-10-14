import { cloneObject } from '../../utils/index.js';
import { CloneFn } from '../../utils/types.js';
import { TreeNode } from '../types.js';

class ChunksList<T> extends Array<T> {
  isHandled?: boolean;

  constructor(items?: Array<T>) {
    super(...(items as T[]));
    Object.setPrototypeOf(this, Object.create(ChunksList.prototype));
    this.isHandled = false;
  }
}

type ChunkState = { isFinished: boolean; hasReachedFirstCutNode: boolean };

type MyIterator = (value: TreeNode, key: number, array: ChunksList<TreeNode>) => void;

export const ROOT = '$*$root$*$';

export function create(
  value?: string,
  children?: Array<TreeNode>,
  data?: Array<any>,
  index?: number,
): TreeNode {
  const res: TreeNode = { value };
  if (children) {
    res.children = children;
  }
  if (data) {
    res.data = data;
  }
  if (typeof index !== 'undefined') {
    res.index = index;
  }
  return res;
}

/**
 * Defines if node has child nodes or not
 *
 * @param {TreeNode} node - tree node object
 * @returns {boolean} - true - has children, false - last child
 */
export function hasChildren(node?: TreeNode): boolean {
  return !!(node && node.children && node.children.length);
}

/**
 * Returns list of child nodes
 *
 * @param {TreeNode} node - tree node object
 * @returns {Array<TreeNode>|Array} - list of child nodes or empty array
 */
export function getChildren(node?: TreeNode): Array<TreeNode> {
  return (node && node.children) || [];
}

/**
 * Set new list of child nodes
 *
 * @param {TreeNode} node - tree node object
 * @param {Array<TreeNode>} list - new list of child nodes
 * @returns {void}
 */
export function setChildren(node?: TreeNode, list?: Array<TreeNode>): void {
  if (node && list && Array.isArray(list)) {
    node.children = list;
  }
}

/**
 * Set node deep level in tree hierarchy
 *
 * @param {TreeNode} node - tree node object
 * @param {number} level - hierarchy level
 * @returns {void}
 */
export function setLevel(node: TreeNode | undefined, level: number): void {
  if (node) {
    node.level = level;
  }
}

/**
 * Returns node deep level in tree hierarchy
 *
 * @param {TreeNode} node - tree node object
 * @returns {number} hierarchy level
 */
export function getLevel(node?: TreeNode): number {
  if (node && typeof node.level !== 'undefined') {
    return node.level || 0;
  }
  return -1;
}

export function wrapInRootNode(data?: TreeNode | Array<TreeNode>): TreeNode | undefined {
  if (!data) {
    return undefined;
  }
  if (data && !Array.isArray(data) && data.value === ROOT) {
    return data;
  }
  const node: TreeNode = { value: ROOT, children: [] };
  if (Array.isArray(data)) {
    node.children = data;
  } else {
    (node.children || [])[0] = data;
  }
  return node;
}

function findNode(rootNode?: TreeNode, checkCb?: Function, level = 0): TreeNode | undefined {
  let res;
  if (!rootNode || !checkCb) {
    return res;
  }
  if (checkCb(rootNode, level)) {
    res = rootNode;
  }
  if (hasChildren(rootNode)) {
    const children = getChildren(rootNode);
    const childCount = children.length;
    for (let i = 0; i < childCount; i += 1) {
      const childRes = findNode(children[i], checkCb, level + 1);
      if (childRes) {
        res = childRes;
        break;
      }
    }
  }
  return res;
}

/**
 * Merge two root trees into one
 *
 * @param {TreeNode} [firstNode] - first tree
 * @param {TreeNode} [secondNode] - second tree
 * @returns {TreeNode} - merged tree
 */
export function merge(firstNode?: TreeNode, secondNode?: TreeNode): TreeNode | undefined {
  if (!firstNode && !secondNode) {
    return undefined;
  }
  if (!firstNode && secondNode) {
    return wrapInRootNode(secondNode);
  }
  if (firstNode && !secondNode) {
    return wrapInRootNode(firstNode);
  }
  const firstRootNode = wrapInRootNode(firstNode);
  const secondRootNode = wrapInRootNode(secondNode);
  const firstChildrens = (firstRootNode && firstRootNode.children) || [];
  const secondChildrens = (secondRootNode && secondRootNode.children) || [];
  const children = firstChildrens.concat(secondChildrens);
  return wrapInRootNode(children);
}

const findLastCut = (node: TreeNode | undefined, level = 0): TreeNode | undefined => {
  if (!node || !node.isPart) {
    return undefined;
  }
  node.level = level;
  const childs = getChildren(node);
  const lastChild = childs[childs.length - 1];
  if (!lastChild) {
    return node;
  }
  const childCut = findLastCut(lastChild, level + 1);
  return childCut || node;
};

const findFirstCut = (
  node: TreeNode | undefined,
  lastCut: TreeNode | undefined,
  level = 0,
): TreeNode | undefined => {
  if (!node || !node.isPart) {
    return undefined;
  }
  node.level = level;
  if (node && lastCut && node.value === lastCut.value && node.level === lastCut.level) {
    return node;
  }
  const childs = getChildren(node);
  const firstChild = childs[0];
  if (!firstChild) {
    return node;
  }
  const childCut = findFirstCut(firstChild, lastCut, level + 1);
  return childCut || node;
};

/**
 * Merging two partial pivot trees into one (mutate first argument).
 *
 * @param {TreeNode} targetTree - main part of pivot table model (looks like 'tree' data structure)
 * @param {TreeNode} sourceTree - part of pivot table model (looks like 'tree' data structure) which
 *  we want merge in main part
 * @returns {TreeNode} - merged tree
 */
export function deepMerge(targetTree?: TreeNode, sourceTree?: TreeNode): TreeNode | undefined {
  /**
   * The node to which we plan to add children
   *
   * @type {?TreeNode}
   */
  let targetNode = findLastCut(targetTree);

  /**
   * The node from where we plan to copy the children
   *
   * @type {?TreeNode}
   */
  let sourceNode = findFirstCut(sourceTree, targetNode);

  // This long logical expression
  // needed for the flow type checker
  // to infer non nullable type
  // of a nested `.children` property
  // and I can't move it out to a function
  if (
    targetNode &&
    targetNode.children &&
    Array.isArray(targetNode.children) &&
    sourceNode &&
    sourceNode.children &&
    Array.isArray(sourceNode.children) &&
    sourceNode.children.length > 0
  ) {
    targetNode.children = targetNode.children.concat(sourceNode.children);

    sourceNode.isHandled = true;
  }

  let hasReachedFirstCutNode = false;
  targetNode = targetTree;
  sourceNode = sourceTree;

  // This long logical expression
  // needed for the flow type checker
  // to infer non nullable type
  // of a nested `.children` property
  // and I can't move it out to a function
  while (
    targetNode &&
    targetNode.children &&
    Array.isArray(targetNode.children) &&
    sourceNode &&
    sourceNode.children &&
    Array.isArray(sourceNode.children) &&
    !sourceNode.isHandled
  ) {
    const preservedTargetChildren = targetNode.children;
    targetNode = targetNode.children[targetNode.children.length - 1];

    let i = 0;
    if (sourceNode.children[0] && !hasReachedFirstCutNode) {
      hasReachedFirstCutNode = !getChildren(sourceNode.children[0]).some((obj) => obj.isPart);

      i = 1;
    }

    while (i < sourceNode.children.length) {
      preservedTargetChildren.push(sourceNode.children[i]);
      i += 1;
    }

    // eslint-disable-next-line prefer-destructuring
    sourceNode = sourceNode.children[0];
  }

  return targetTree;
}

export function iterateThroughTree(
  nodes?: Array<TreeNode>,
  callback?: (item: Record<string, any>, parent?: Record<string, any>) => void,
  parent?: Record<string, any>,
): void {
  if (!nodes || !callback) {
    return;
  }
  nodes.forEach((node) => {
    callback(node, parent);
    if (hasChildren(node)) {
      iterateThroughTree(getChildren(node), callback, node);
    }
  });
}

export function getLastLevelNodes(
  nodes: Array<TreeNode>,
  lastLevelNodes: Array<TreeNode> = [],
  level = 0,
  options: { maxLevel: number } = { maxLevel: 0 },
): Array<TreeNode> {
  nodes.forEach((item) => {
    if (options.maxLevel < level) {
      options.maxLevel = level;
    }
    if (hasChildren(item)) {
      getLastLevelNodes(getChildren(item), lastLevelNodes, level + 1, options);
    } else {
      lastLevelNodes.push(item);
    }
  });
  return lastLevelNodes;
}

/**
 * Returns number of last children for the tree
 *
 * @param {Array<TreeNode> | TreeNode} item - tree node or list of nodes
 * @param {object} options - additional options
 * @param {number} options.callCount - inner state for recursive calls count
 * @param {boolean} options.clearCache - define if use cached value or recalculate new one
 * @returns {number} - count of last children
 */
export function getChildLength(
  item?: TreeNode[] | TreeNode,
  options: { callCount?: number; clearCache?: boolean } = {},
): number {
  if (!options) {
    // eslint-disable-next-line no-param-reassign
    options = {};
  }
  if (typeof options.callCount !== 'number') {
    options.callCount = 1;
  } else {
    options.callCount += 1;
  }

  if (!item) {
    return 0;
  }

  let clearCache = options.clearCache || false;
  if (!Array.isArray(item) && item.value === ROOT) {
    // do not use cache from 'root' node
    clearCache = true;
  }

  let count = 1;
  let children: Array<TreeNode> = [];

  if (Array.isArray(item)) {
    count = 0;
    children = item;
  } else if (item.children) {
    children = getChildren(item);
  }

  if (children && children.length) {
    if (!clearCache && !Array.isArray(item) && typeof item.childCount === 'number') {
      // get cached value
      count = item.childCount;
    } else {
      count = 0;
      // recalculate new value
      children.forEach((child: Record<string, any>) => {
        count += getChildLength(child, options);
      });
      if (!Array.isArray(item)) {
        // cache value
        item.childCount = count;
      }
    }
  }
  return count;
}

/**
 * Returns deep level of the tree
 *
 * @param {Array<TreeNode> | TreeNode} item - tree node or list of nodes
 * @param {object} options - additional options
 * @param {number} options.callCount - inner state for recursive calls count
 * @param {boolean} options.clearCache - define if use cached value or recalculate new one
 * @returns {number} - count of last children
 */
export function getDeepLength(
  item?: TreeNode[] | TreeNode,
  options: { callCount?: number; clearCache?: boolean } = {},
): number {
  if (!options) {
    // eslint-disable-next-line no-param-reassign
    options = {};
  }
  if (typeof options.callCount !== 'number') {
    options.callCount = 1;
  } else {
    options.callCount += 1;
  }

  if (!item) {
    return 0;
  }

  let clearCache = options.clearCache || false;
  if (!Array.isArray(item) && item.value === ROOT) {
    // do not use cache from 'root' node
    clearCache = true;
  }

  let count = 0;
  let children: Array<Record<string, any>> = [];

  if (item && !Array.isArray(item) && typeof item.value !== 'undefined') {
    count = 1;
  }

  if (Array.isArray(item)) {
    count = 0;
    children = item;
  } else if (item.children) {
    children = getChildren(item);
  }

  if (children && children.length) {
    if (!clearCache && !Array.isArray(item) && typeof item.childDeep === 'number') {
      // get cached value
      count += item.childDeep;
    } else {
      let maxCount = 0;
      children.forEach((child: Record<string, any>) => {
        const childCount = getDeepLength(child, options);
        if (childCount > maxCount) {
          maxCount = childCount;
        }
      });
      count += maxCount;
      if (!Array.isArray(item)) {
        // cache value
        item.childDeep = maxCount;
      }
    }
  }
  return count;
}

/**
 * Returns part of tree nodes list according to children indexes "from" - "to"
 * return result is not strict, and start/stop in returns object show returned node position
 *
 * @param {Array<TreeNode>} rootNodes - list of nodes
 * @param {number} [from=0] - start index to for partial tree
 * @param {number} [to] - end index for partial tree
 * @returns {{nodes: Array<TreeNode>, start: number, stop: number}} - partial tree nodes and
 * start/stop indexes of it in scope of initial list
 */
export function getNodesByChildCount(
  rootNodes: Array<TreeNode> = [],
  from = 0,
  to?: number,
): { nodes: Array<TreeNode>; start: number; stop: number } {
  const nodes = [];
  let index = 0;
  let startIndex = -1;
  let stopIndex = -1;
  const count = rootNodes.length;
  if (typeof from === 'number' && typeof to === 'number' && from > to) {
    throw new Error('Wrong "getNodesByChildCount" diapason');
  }
  if (typeof from === 'number' && from < 0) {
    throw new Error('Wrong "from" index for "getNodesByChildCount"');
  }

  for (let i = 0; i < count; i += 1) {
    const rootNode = rootNodes[i];
    const childCount = getChildLength(rootNode);
    // start index
    if (index + childCount > from) {
      if (startIndex < 0) {
        startIndex = index;
      }
      nodes.push(rootNode);
      // stop index
      if (typeof to === 'number' && index + childCount >= to) {
        stopIndex = index + childCount;
        break;
      }
    }
    stopIndex = index + childCount;
    index += childCount;
  }
  return {
    nodes,
    start: startIndex,
    stop: stopIndex,
  };
}

/**
 * Clear tree node internal cache
 *
 * @param {TreeNode} node - node to clear
 * @returns {void}
 */
export function clearNodeCache(node: TreeNode) {
  if (node.isMapped !== undefined) {
    node.isMapped = undefined;
  }
  if (node.minLevel !== undefined) {
    node.minLevel = undefined;
  }
  if (node.childCount !== undefined) {
    node.childCount = undefined;
  }
  if (node.childDeep !== undefined) {
    node.childDeep = undefined;
  }
}

/**
 * Returns cut cloned part of tree nodes list according to children indexes "from" - "to"
 *
 * @param {Array<TreeNode>} rootNodes - list of nodes
 * @param {number} [from=0] - start index to for cut tree
 * @param {number} [to] - end index for cut tree
 * @param {object} [options] - additional options
 * @param {Array<string>} [options.cloneIncludeKeys] - clone node include keys
 * @param {Array<string>} [options.cloneExcludeKeys] - clone node exclude keys
 * @returns {Array<TreeNode>} - cut cloned list of nodes
 */
export function getCutNodesByChildCount(
  rootNodes: Array<TreeNode> = [],
  from = 0,
  to?: number,
  options?: { cloneFn?: CloneFn },
): Array<TreeNode> {
  const { cloneFn = cloneObject } = options || {};
  const result: Array<TreeNode> = [];
  const { nodes, start, stop } = getNodesByChildCount(rootNodes, from, to);
  const count = nodes.length;

  let firstItem: TreeNode;
  let lastItem: TreeNode;
  let handleLast = true;

  if (start < from) {
    const firstOriginalItem = nodes[0] || {};
    const newFrom = from - start;
    let newTo;

    if (count === 1 && typeof to === 'number') {
      newTo = to - start;
      handleLast = false;
    }
    firstItem = cloneFn(firstOriginalItem, true);

    const firstItemChilds = getCutNodesByChildCount(
      getChildren(firstOriginalItem),
      newFrom,
      newTo,
      options,
    );
    setChildren(firstItem, firstItemChilds);
  }

  if (typeof to === 'number' && stop > to && handleLast) {
    const lastOriginalItem = nodes[count - 1] || {};
    const newFrom = 0;
    const newTo = getChildLength(lastOriginalItem) - (stop - to);

    lastItem = cloneFn(lastOriginalItem, true);

    const lastItemChilds = getCutNodesByChildCount(
      getChildren(lastOriginalItem),
      newFrom,
      newTo,
      options,
    );
    setChildren(lastItem, lastItemChilds);
  }

  nodes.forEach((node, index) => {
    if (firstItem && index === 0) {
      result.push(firstItem);
    } else if (lastItem && index === count - 1) {
      result.push(lastItem);
    } else {
      const clonedNode = cloneFn(node);
      result.push(clonedNode);
    }
  });

  return result;
}

export default {
  ROOT,
  create,
  hasChildren,
  getChildren,
  setChildren,
  setLevel,
  getLevel,
  getLastLevelNodes,
  iterateThroughTree,
  wrapInRootNode,
  findNode,
  merge,
  deepMerge,
  getChildLength,
  getDeepLength,
  getNodesByChildCount,
  getCutNodesByChildCount,
  clearNodeCache,
};
