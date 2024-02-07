/* eslint-disable complexity */
/* eslint-disable sonarjs/cognitive-complexity */
import {
  Filter,
  FilterRelations,
  FilterRelationsNode,
  FilterRelationsJaql,
  FilterRelationsJaqlIdNode,
  FilterRelationsJaqlNode,
} from '@sisense/sdk-data';
import { isEqual, isEqualWith } from 'lodash';

/**
 * Checks if the filters have changed by deep comparison.
 *
 * @param prevFilters - Previous filters
 * @param newFilters - New filters
 * @returns Whether the filters have changed
 * @remarks
 * The function ignores randomly generated names of the filters.
 */
export function isFiltersChanged(
  prevFilters: Filter[] | undefined,
  newFilters: Filter[] | undefined,
): boolean {
  // if both filters are undefined, nothing has changed
  if (prevFilters === undefined && newFilters === undefined) {
    return false;
  }
  // if one of the filters is undefined, and other not - changed
  if ([prevFilters, newFilters].some((filters) => filters === undefined)) {
    return true;
  }
  // if the length of the filters is different - changed
  if (prevFilters!.length !== newFilters!.length) {
    return true;
  }
  // if both filters are empty - nothing has changed

  if (prevFilters!.length === 0 && newFilters!.length === 0) {
    return false;
  }
  // compare filters with ignoring randomly generated names
  // if filters at some index in the two arrays do not equal,
  // return true (filters have changed)
  return prevFilters!.some(
    (prevFilter, i) =>
      !isEqualWith(
        prevFilter,
        newFilters![i]!,
        (prevFilterWithRandomName: Filter, newFilterWithRandomName: Filter) => {
          const prevFilterWithoutRandomName = isRealCSDKFilter(prevFilterWithRandomName)
            ? {
                ...(prevFilterWithRandomName.toJSON() as Record<string, unknown>),
                name: undefined,
              }
            : prevFilterWithRandomName;
          const newFilterWithoutRandomName = isRealCSDKFilter(newFilterWithRandomName)
            ? {
                ...(newFilterWithRandomName.toJSON() as Record<string, unknown>),
                name: undefined,
              }
            : newFilterWithRandomName;
          return isEqual(prevFilterWithoutRandomName, newFilterWithoutRandomName);
        },
      ),
  );
}

/**
 * Validates if the filter is a real Compose SDK Filter with all props and methods or a partially converted filter from widget DTO
 *
 * @returns
 */
function isRealCSDKFilter(filter: Filter): filter is Filter {
  return 'toJSON' in filter && typeof filter.toJSON === 'function';
}

/**
 * Checks if filter relations have changed by deep comparison.
 *
 * @param prevFilters - Previous filters
 * @param newFilters - New filters
 * @param prevRelations - Previous relations
 * @param newRelations - New relations
 * @returns Whether filter relations have changed
 * @remarks
 * The function ignores node swaps since this does not affect logical result.
 */
export function isRelationsChanged(
  prevFilters: Filter[] | undefined,
  newFilters: Filter[] | undefined,
  prevRelations: FilterRelations | FilterRelationsJaql | undefined,
  newRelations: FilterRelations | FilterRelationsJaql | undefined,
): boolean {
  // if both relations are undefined, nothing has changed
  if (prevRelations === undefined && newRelations === undefined) {
    return false;
  }
  // if one of the relations is undefined, and other not - changed
  if ([prevRelations, newRelations].some((relations) => relations === undefined)) {
    return true;
  }

  // check if trees are equal
  function areRelationsEqual(
    prevTreeNode: FilterRelationsNode | FilterRelationsJaqlNode | undefined,
    newTreeNode: FilterRelationsNode | FilterRelationsJaqlNode | undefined,
  ): boolean {
    const prevRelationNode = prevTreeNode as FilterRelations;
    const prevFilterNode = prevTreeNode as FilterRelationsJaqlIdNode;
    const newRelationNode = newTreeNode as FilterRelations;
    const newFilterNode = newTreeNode as FilterRelationsJaqlIdNode;

    // if both nodes are undefined - equal
    if (prevTreeNode === undefined && newTreeNode === undefined) {
      return true;
    }

    // if only one of the nodes is undefined - not equal
    if ([prevTreeNode, newTreeNode].some((node) => node === undefined)) {
      return false;
    }

    // if nodes have differrent operators or one node is a filter and another is a relation - not equal
    if (prevRelationNode.operator !== newRelationNode.operator) {
      return false;
    }

    // if both nodes are filters - compare them, if they are not equal - trees are not equal
    // since node has just filter uuid that will be different on every generation, actual filter comparison is done
    if (prevFilterNode.instanceid && newFilterNode.instanceid) {
      return !isFiltersChanged(
        prevFilters?.filter((filter) => filter.guid === prevFilterNode.instanceid),
        newFilters?.filter((filter) => filter.guid === newFilterNode.instanceid),
      );
    }

    // if both nodes are relations - recursively compare subtrees
    // if nodes are swapped (left -> right), logic does not change
    return (
      (areRelationsEqual(prevRelationNode.left, newRelationNode.left) &&
        areRelationsEqual(prevRelationNode.right, newRelationNode.right)) ||
      (areRelationsEqual(prevRelationNode.left, newRelationNode.right) &&
        areRelationsEqual(prevRelationNode.right, newRelationNode.left))
    );
  }

  // if trees are not equal - relations changed
  return !areRelationsEqual(prevRelations, newRelations);
}
