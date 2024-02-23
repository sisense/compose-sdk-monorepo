/* eslint-disable import/prefer-default-export */
import { PivotTreeNode } from '../../data-handling';
import { PanelType, SortingDirection } from '../../data-handling/constants.js';

/**
 * Helper for getting tree node default sort direction
 *
 * @param {PivotTreeNode} treeNode - tree node
 * @returns {SortingDirection} - tree node default sort direction
 */
export const getDefaultSortDirection = (treeNode: PivotTreeNode) => {
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (treeNode.metadataType) {
    case PanelType.MEASURES:
      return SortingDirection.ASC;
    default:
      return SortingDirection.DESC;
  }
};
