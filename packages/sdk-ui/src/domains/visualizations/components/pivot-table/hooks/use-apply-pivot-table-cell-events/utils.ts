import { AbstractDataTreeNode } from './types';

export function getTreeNodeByLevel(node: AbstractDataTreeNode, level: number) {
  let currentNode = node;
  while (currentNode.level !== level && currentNode.parent !== undefined) {
    currentNode = currentNode.parent;
  }
  return currentNode;
}

export function isSubTotalTreeNode(node: AbstractDataTreeNode, type: 'rows' | 'columns') {
  return node?.metadataType === type && node?.userType === 'subTotal';
}

export function isGrandTotalTreeNode(node: AbstractDataTreeNode, type: 'rows' | 'columns') {
  return node?.metadataType === type && node?.userType === 'grandTotal';
}

/**
 * Safely performs modulo operation, returning 0 if divisor is null/undefined or 0
 * @param dividend - The dividend number (defaults to 0 if not provided)
 * @param divisor - The divisor number (optional)
 * @returns The result of dividend % divisor, or 0 if divisor is invalid
 */
export function safeModulo(dividend = 0, divisor?: number): number {
  if (!divisor || divisor === 0) {
    return 0;
  }
  return dividend % divisor;
}
