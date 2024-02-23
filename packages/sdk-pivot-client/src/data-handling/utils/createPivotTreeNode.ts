/* eslint-disable import/prefer-default-export */
import { PivotTreeNode } from '../types.js';
import { TreeNode } from '../../tree-structure';

/**
 * Converts TreeNode to PivotTreeNode
 *
 * @param {TreeNode} node - tree node
 * @param {string} [type] - type of node to create, columns/rows
 * @returns {PivotTreeNode} - converted node
 *
 * @private
 */
export const createPivotTreeNode = (node: TreeNode, type?: string): PivotTreeNode => {
  const pivotNode: PivotTreeNode = node;
  if (type) {
    pivotNode.metadataType = type;
  }
  return pivotNode;
};

export default createPivotTreeNode;
