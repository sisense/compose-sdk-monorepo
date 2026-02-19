/* eslint-disable @typescript-eslint/default-param-last */
import cloneDeep from 'lodash-es/cloneDeep.js';
import isArray from 'lodash-es/isArray.js';

import { TranslatableError } from '../../translation/translatable-error.js';
import { DimensionalLevelAttribute } from '../attributes.js';
import {
  Filter,
  FilterRelations,
  FilterRelationsJaql,
  FilterRelationsJaqlNode,
  FilterRelationsModel,
  FilterRelationsModelBracketNode,
  FilterRelationsModelCascadeNode,
  FilterRelationsModelIdNode,
  FilterRelationsModelNode,
  FilterRelationsNode,
} from '../interfaces.js';
import * as filterFactory from './factory.js';
import { isCascadingFilter } from './filters.js';

/**
 * Type guard for checking if the provided filters are FilterRelations.
 *
 * @param filters - The filters to check.
 * @returns `true` if the filters are FilterRelations, `false` otherwise.
 * @group Filter Utilities
 */
export function isFilterRelations(
  filters: Filter[] | FilterRelations | undefined,
): filters is FilterRelations {
  return (
    !!filters &&
    'operator' in filters &&
    (filters.operator === 'AND' || filters.operator === 'OR') &&
    !!filters.right &&
    !!filters.left
  );
}

/**
 * Rules of filter relations - logical operators of how filters are related to each other.
 *
 * @internal
 */
export type FilterRelationsRules = FilterRelationsRule | FilterRelationsRuleNode | null;

/** @internal */
export type FilterRelationsRule = {
  left: FilterRelationsRuleNode;
  right: FilterRelationsRuleNode;
  operator: 'AND' | 'OR';
};

/** @internal */
export type FilterRelationsRuleIdNode = { instanceid: string };

/** @internal */
export type FilterRelationsRuleNode = FilterRelationsRule | FilterRelationsRuleIdNode;

/**
 * Filter action types
 *
 * @internal
 */
export type FilterAction = { type: 'add'; payload: Filter } | { type: 'remove'; payload: Filter };

/**
 * Merges source filters with target filters and recalculates relations.
 *
 * @param sourceFilters - The source filters or filter relations to merge.
 * @param targetFilters - The target filters or filter relations to merge with.
 * @returns Updated source filters merged with target filters. If the source filters are FilterRelations, the relations are recalculated.
 * @internal
 */
export function mergeFiltersOrFilterRelations(
  sourceFilters: Filter[] | FilterRelations = [],
  targetFilters: Filter[] | FilterRelations = [],
): Filter[] | FilterRelations {
  if (!isFilterRelations(sourceFilters) && !isFilterRelations(targetFilters)) {
    return mergeFilters(sourceFilters, targetFilters);
  }

  const { filters: pureSourceFilters, relations: sourceRelations } =
    splitFiltersAndRelations(sourceFilters);
  const pureTargetFilters = getFiltersArray(targetFilters);
  const mergedFilters = mergeFilters(pureSourceFilters, pureTargetFilters);

  const mergedRelations = calculateNewRelations(pureSourceFilters, sourceRelations, mergedFilters);

  return combineFiltersAndRelations(mergedFilters, mergedRelations);
}

/**
 * Splits filters or filter relations into filters and relations rules.
 *
 * @internal
 */
export function splitFiltersAndRelations(
  filtersOrFilterRelations: Filter[] | FilterRelations | undefined,
): {
  filters: Filter[];
  relations: FilterRelationsRules;
} {
  if (!filtersOrFilterRelations) {
    return { filters: [], relations: null };
  }
  if (isArray(filtersOrFilterRelations)) {
    return { filters: filtersOrFilterRelations, relations: null };
  }
  const filtersSet = new Set<Filter>();
  function traverse(node: FilterRelationsNode): FilterRelationsRuleNode {
    if (isFilterNode(node)) {
      filtersSet.add(node);
      return { instanceid: node.config.guid };
    }
    if (isFilterRelations(node)) {
      const left = traverse(node.left);
      const right = traverse(node.right);
      return { left, right, operator: node.operator };
    }
    throw new UnknownRelationsNodeError();
  }

  const relations = traverse(filtersOrFilterRelations);

  return {
    filters: Array.from(filtersSet),
    relations,
  };
}

/**
 * Returns pure filters array from the given filters or filter relations.
 *
 * @internal
 */
export function getFiltersArray(
  filtersOrFilterRelations: Filter[] | FilterRelations | undefined,
): Filter[] {
  if (!filtersOrFilterRelations) {
    return [];
  }
  return splitFiltersAndRelations(filtersOrFilterRelations).filters;
}

/**
 * Combines filters and relations into a single FilterRelations object.
 * If the relations are empty or relations are trivial (single node), the filters are returned as is.
 *
 * @internal
 */
export function combineFiltersAndRelations(
  filters: Filter[],
  relations: FilterRelationsRules,
): Filter[] | FilterRelations {
  if (!relations || isTrivialSingleNodeRelations(relations)) {
    return filters;
  }

  const resultRelations = traverse(relations);

  return isFilterNode(resultRelations) ? [resultRelations] : resultRelations;

  function traverse(node: FilterRelationsRuleNode): Filter | FilterRelations {
    if (isRelationsRuleIdNode(node)) {
      return filters.find((filter) => filter.config.guid === node.instanceid)!;
    }
    if (isRelationsRule(node)) {
      const func = node.operator === 'AND' ? filterFactory.logic.and : filterFactory.logic.or;
      return func(traverse(node.left), traverse(node.right));
    }
    throw new UnknownRelationsNodeError();
  }
}

/**
 * Type guard for checking if a node is a single relations node (trivial case when relations are needless).
 *
 * @internal
 */
export function isTrivialSingleNodeRelations(
  relations: FilterRelationsRules,
): relations is FilterRelationsRuleIdNode {
  return !!relations && 'instanceid' in relations;
}

/**
 * Calculates new relations based on the changes in filters.
 *
 * @internal
 */
export function calculateNewRelations(
  prevFilters: Filter[],
  prevRelations: FilterRelationsRules,
  newFilters: Filter[],
): FilterRelationsRules {
  // If there are no previous relations - no need to recalculate them
  if (prevRelations === null) {
    return null;
  }
  const performedActions = diffFilters(prevFilters, newFilters);
  if (performedActions.length === 0) {
    return prevRelations;
  }
  return performedActions.reduce<FilterRelationsRules>((relations, action) => {
    switch (action.type) {
      case 'add':
        return addFilterToRelations(action.payload, relations);
      case 'remove':
        return removeFilterFromRelations(action.payload, relations);
    }
  }, prevRelations);
}

/**
 * Compares two filters and determines if they are equal in terms of relations.
 */
function areFiltersEqualForRelations(filter1: Filter, filter2: Filter): boolean {
  return filter1.config.guid === filter2.config.guid;
}

/**
 * Replaces a filter in the relations tree with a new filter.
 *
 * @internal
 */
export function getRelationsWithReplacedFilter(
  relations: FilterRelationsRules,
  filterToReplace: Filter,
  newFilter: Filter,
): FilterRelationsRules {
  if (!relations) {
    return null;
  }

  const replacedRelations = traverse(relations);
  return replacedRelations;

  function traverse(node: FilterRelationsRuleNode): FilterRelationsRuleNode {
    if (isRelationsRuleIdNode(node)) {
      return node.instanceid === filterToReplace.config.guid
        ? { instanceid: newFilter.config.guid }
        : node;
    }
    if (isRelationsRule(node)) {
      return {
        left: traverse(node.left),
        right: traverse(node.right),
        operator: node.operator,
      };
    }
    throw new UnknownRelationsNodeError();
  }
}

/**
 * Compares two arrays of Filter objects and determines the actions needed
 * to transform prevFilters into newFilters.
 *
 * @param prevFilters - The original array of filters.
 * @param newFilters - The updated array of filters.
 * @param isEqualFilters - A function to determine if two filters are equal.
 * @returns An array of FilterAction objects representing the changes.
 */
function diffFilters(prevFilters: Filter[], newFilters: Filter[]): FilterAction[] {
  const actions: FilterAction[] = [];

  // Clone the arrays to avoid mutating the original data
  const prevFiltersCopy = [...prevFilters];
  const newFiltersCopy = [...newFilters];

  // Determine removals
  prevFiltersCopy.forEach((prevFilter) => {
    const existsInNew = newFiltersCopy.some((newFilter) =>
      areFiltersEqualForRelations(prevFilter, newFilter),
    );
    if (!existsInNew) {
      actions.push({ type: 'remove', payload: prevFilter });
    }
  });

  // Determine additions
  newFiltersCopy.forEach((newFilter) => {
    const existsInPrev = prevFiltersCopy.some((prevFilter) =>
      areFiltersEqualForRelations(newFilter, prevFilter),
    );
    if (!existsInPrev) {
      actions.push({ type: 'add', payload: newFilter });
    }
  });

  return actions;
}

/**
 * Adds a filter to root of relations tree as a new node connected with AND operator.
 * If the relations tree is empty, the filter is added as the root node.
 */
function addFilterToRelations(
  filter: Filter,
  relations: FilterRelationsRules,
): FilterRelationsRules {
  if (!relations) {
    return { instanceid: filter.config.guid };
  }

  return {
    left: relations,
    right: { instanceid: filter.config.guid },
    operator: 'AND',
  };
}

/**
 * Removes a filter from the relations tree.
 * If the filter is not found, the relations tree is returned as is.
 */
function removeFilterFromRelations(
  filter: Filter,
  relations: FilterRelationsRules,
): FilterRelationsRules {
  if (!relations) {
    return null;
  }

  if (isTrivialSingleNodeRelations(relations)) {
    return relations.instanceid === filter.config.guid ? null : relations;
  }

  const leftAfterRemoval = removeFilterFromRelations(filter, relations.left);
  const rightAfterRemoval = removeFilterFromRelations(filter, relations.right);

  if (leftAfterRemoval === null && !!rightAfterRemoval) {
    return rightAfterRemoval;
  }

  if (rightAfterRemoval === null && !!leftAfterRemoval) {
    return leftAfterRemoval;
  }

  if (leftAfterRemoval === null && rightAfterRemoval === null) {
    return null;
  }

  return {
    left: leftAfterRemoval!,
    right: rightAfterRemoval!,
    operator: relations.operator,
  };
}

/**
 * Converts filter relations model from Fusion to internal CSDK filter relations rules.
 *
 * @internal
 */
export function convertFilterRelationsModelToRelationRules(
  filterRelationsModel: FilterRelationsModel | FilterRelationsModelNode | undefined,
  filters: Filter[],
): FilterRelationsRules {
  if (!filterRelationsModel) {
    return null;
  }

  function traverse(
    node: FilterRelationsModel | FilterRelationsModelNode,
  ): FilterRelationsRuleNode {
    if (isModelIdNode(node)) {
      return { instanceid: node.instanceId };
    }
    if (isModelBracketNode(node)) {
      return traverse(node.value);
    }
    if (isModelRelationNode(node)) {
      const newNode: FilterRelationsRule = {
        operator: node.operator,
        left: traverse(node.left),
        right: traverse(node.right),
      };
      return newNode;
    }
    if (isModelCascadeNode(node)) {
      // CSDK filter relations model work with cascading filters as with a single node.
      const cascadingFilterForThisCascade = filters.find((filter) => {
        if (!isCascadingFilter(filter)) {
          return false;
        }
        const levelIds = filter.filters.map((f) => f.config.guid);
        return node.levels.every((levelFilter) => levelIds.includes(levelFilter.instanceId));
      });
      if (cascadingFilterForThisCascade) {
        return { instanceid: cascadingFilterForThisCascade.config.guid };
      }
      throw new Error('Broken filter relations model. Cascading filter not found.');
    }
    throw new Error('Broken filter relations model. Unknown node type.');
  }

  return traverse(filterRelationsModel);
}

function isModelIdNode(
  node: FilterRelationsModel | FilterRelationsModelNode,
): node is FilterRelationsModelIdNode {
  return 'instanceId' in node;
}
function isModelBracketNode(
  node: FilterRelationsModel | FilterRelationsModelNode,
): node is FilterRelationsModelBracketNode {
  return 'value' in node;
}
function isModelRelationNode(
  node: FilterRelationsModel | FilterRelationsModelNode,
): node is FilterRelationsModel {
  return 'operator' in node;
}
function isModelCascadeNode(
  node: FilterRelationsModel | FilterRelationsModelNode,
): node is FilterRelationsModelCascadeNode {
  return 'levels' in node && isArray(node.levels);
}

/**
 * @internal
 */
export function isRelationsRuleIdNode(
  node: FilterRelationsRuleNode,
): node is FilterRelationsRuleIdNode {
  return 'instanceid' in node;
}
/**
 * @internal
 */
export function isRelationsRule(node: FilterRelationsRuleNode): node is FilterRelationsRule {
  return 'operator' in node;
}

function isFilterNode(node: FilterRelationsNode): node is Filter {
  return 'config' in node && 'guid' in node.config;
}

/**
 * Converts internal CSDK filter relations rules to filter relations model for Fusion.
 *
 * @internal
 */
export function filterRelationRulesToFilterRelationsModel(
  filterRelationRules: FilterRelationsRules,
  filters: Filter[],
): FilterRelationsModel | FilterRelationsModelNode | undefined {
  if (!filterRelationRules) {
    return undefined;
  }

  function traverse(node: FilterRelationsRuleNode): FilterRelationsModelNode {
    if (isRelationsRuleIdNode(node)) {
      // Check if this instanceid corresponds to a cascading filter
      const filter = filters.find((f) => f.config.guid === node.instanceid);
      if (filter && isCascadingFilter(filter)) {
        // Build a CascadingIdentifier node
        const levels = filter.filters.map((levelFilter) => ({
          type: 'Identifier' as const,
          instanceId: levelFilter.config.guid,
        }));
        return {
          type: 'CascadingIdentifier',
          levels,
        };
      } else {
        // Build an Identifier node
        return {
          type: 'Identifier',
          instanceId: node.instanceid,
        };
      }
    } else if (isRelationsRule(node)) {
      // Build a LogicalExpression node
      return {
        type: 'LogicalExpression',
        operator: node.operator,
        left: traverse(node.left),
        right: traverse(node.right),
      };
    } else {
      throw new Error('Unknown node type in filter relations rules.');
    }
  }

  return traverse(filterRelationRules);
}

/**
 * @internal
 */
export function findFilterByGuid(filters: Filter[], guid: string): Filter | undefined {
  return filters.find((filter) => filter.config.guid === guid);
}

/**
 * Error thrown when an unknown node type is encountered in filter relations.
 *
 * @internal
 */
export class UnknownRelationsNodeError extends Error {
  constructor() {
    super('Broken filter relations. Unknown node type.');
  }
}

/** @internal */
export type FilterRelationsDescription = FilterRelationsDescriptionNode[];

/** @internal */
export type FilterRelationsDescriptionNode =
  | OpenBracketDescriptionNode
  | CloseBracketDescriptionNode
  | AttributeDescriptionNode
  | OperatorDescriptionNode;

/** @internal */
export type OpenBracketDescriptionNode = {
  nodeType: 'openBracket';
};

/**
 * @internal
 */
export function isOpenBracketDescriptionNode(
  node: FilterRelationsDescriptionNode,
): node is OpenBracketDescriptionNode {
  return node.nodeType === 'openBracket';
}

/** @internal */
export type CloseBracketDescriptionNode = {
  nodeType: 'closeBracket';
};

/**
 * @internal
 */
export function isCloseBracketDescriptionNode(
  node: FilterRelationsDescriptionNode,
): node is CloseBracketDescriptionNode {
  return node.nodeType === 'closeBracket';
}

/** @internal */
export type AttributeDescriptionNode = {
  nodeType: 'attribute';
  attribute: string;
};

/**
 * @internal
 */
export function isAttributeDescriptionNode(
  node: FilterRelationsDescriptionNode,
): node is AttributeDescriptionNode {
  return node.nodeType === 'attribute';
}

/** @internal */
export type OperatorDescriptionNode = {
  nodeType: 'operator';
  operator: 'AND' | 'OR';
};
/**
 * @internal
 */
export function isOperatorDescriptionNode(
  node: FilterRelationsDescriptionNode,
): node is OperatorDescriptionNode {
  return node.nodeType === 'operator';
}

/**
 * Gets a unique identifier for a filter, combining its attribute expression and granularity if available.
 *
 * @param {Filter} filter - The filter object to generate the unique identifier for.
 * @returns {string} - The unique identifier for the filter.
 * @internal
 */
export function getFilterCompareId(filter: Filter): string {
  if (isCascadingFilter(filter)) {
    return filter.filters.map(getFilterCompareId).join('-');
  }
  // TODO: remove fallback on 'filter.jaql()' after removing temporal 'jaql()' workaround from filter translation layer
  const { attribute: filterAttribute } = filter;
  const filterJaql = filter.jaql().jaql;
  const expression = filterAttribute.expression || filterJaql.dim;
  const granularity =
    (filterAttribute as DimensionalLevelAttribute).granularity ||
    (filterJaql?.datatype === 'datetime'
      ? DimensionalLevelAttribute.translateJaqlToGranularity(filterJaql)
      : '');

  return `${expression}${granularity}`;
}

/**
 * Merges two arrays of filter objects, prioritizing 'targetFilters' over 'sourceFilters',
 * and removes duplicates based on filter compare id.
 *
 * Saves the 'sourceFilters' filters order, while adds new filters to the end of the array.
 *
 * @param {Filter[]} [sourceFilters=[]] - The source array of filter objects.
 * @param {Filter[]} [targetFilters=[]] - The target array of filter objects.
 * @returns {Filter[]} - The merged array of filter objects.
 * @internal
 */
export function mergeFilters(sourceFilters: Filter[] = [], targetFilters: Filter[] = []) {
  const filters = [...sourceFilters];

  targetFilters.forEach((filter) => {
    // filters will always have findIndex as sourceFilters fall back to an empty array
    const existingFilterIndex = filters.findIndex(
      (existingFilter) => getFilterCompareId(filter) === getFilterCompareId(existingFilter),
    );
    const isFilterAlreadyExist = existingFilterIndex !== -1;

    if (isFilterAlreadyExist) {
      filters[existingFilterIndex] = filter;
    } else {
      filters.push(filter);
    }
  });

  return filters;
}

/**
 * Replaces nodes of filter reations tree with fetched filters by instance id.
 *
 * @param filters - The filters.
 * @param highlights - The highlights
 * @param filterRelations - Fetched filter relations.
 * @returns Filter relations with filters in nodes.
 * @internal
 */
/* eslint-disable-next-line sonarjs/cognitive-complexity */
export function getFilterRelationsFromJaql(
  filters: Filter[],
  highlights: Filter[],
  filterRelations: FilterRelationsJaql | undefined,
): FilterRelations | Filter[] {
  if (!filterRelations) {
    return filters;
  }

  // If highlights are present, nodes in filter relations reference both filters and highlights
  // and thus cannot be replaced with filters. Return filters in this case.
  if (highlights.length) {
    return filters;
  }

  const mergedFilterRelations = cloneDeep(filterRelations);

  function traverse(
    node: FilterRelationsJaqlNode | FilterRelationsNode,
  ): FilterRelationsJaqlNode | FilterRelationsNode {
    if ('instanceid' in node) {
      const filter = filters.find((filter) => filter.config.guid === node.instanceid);
      if (!filter) {
        throw new TranslatableError('errors.unknownFilterInFilterRelations', {
          filterGuid: node.instanceid,
        });
      }
      return filter;
    }
    if ('operator' in node) {
      const newNode = { operator: node.operator } as FilterRelations | FilterRelationsJaql;
      if ('left' in node) {
        newNode.left = traverse(node.left);
      }
      if ('right' in node) {
        newNode.right = traverse(node.right);
      }
      return newNode;
    }
    return node;
  }

  return traverse(mergedFilterRelations) as FilterRelations;
}

/**
 * Converts filter relations model to filter relations jaql.
 *
 * @param filterRelations - Filter relations model.
 * @returns Filter relations jaql.
 * @internal
 */
export function convertFilterRelationsModelToJaql(
  filterRelations: FilterRelationsModel | FilterRelationsModelNode | undefined,
): FilterRelationsJaql | undefined {
  if (!filterRelations) {
    return filterRelations;
  }

  const convertedFilterRelations = cloneDeep(filterRelations);

  function traverse(
    node: FilterRelationsModelNode | FilterRelationsJaqlNode,
  ): FilterRelationsModelNode | FilterRelationsJaqlNode {
    if ('instanceId' in node) {
      return { instanceid: node.instanceId };
    }
    if ('value' in node) {
      return traverse(node.value);
    }
    if ('operator' in node) {
      const newNode = { operator: node.operator } as FilterRelationsModel | FilterRelationsJaql;
      if ('left' in node) {
        newNode.left = traverse(node.left);
      }
      if ('right' in node) {
        newNode.right = traverse(node.right);
      }
      return newNode;
    }
    return node;
  }

  return traverse(convertedFilterRelations) as FilterRelationsJaql;
}
