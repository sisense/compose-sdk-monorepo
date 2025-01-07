import { mergeFilters } from '@/widget-by-id/utils';
import {
  Filter,
  FilterRelations,
  FilterRelationsModel,
  FilterRelationsModelBracketNode,
  FilterRelationsModelCascadeNode,
  FilterRelationsModelIdNode,
  FilterRelationsModelNode,
  FilterRelationsNode,
  isCascadingFilter,
  isFilterRelations,
} from '@sisense/sdk-data';
import isArray from 'lodash-es/isArray';

/**
 * Rules of filter relations - logical operators of how filters are related to each other.
 */
export type FilterRelationsRules = FilterRelationsRule | FilterRelationsRuleNode | null;

type FilterRelationsRule = {
  left: FilterRelationsRuleNode;
  right: FilterRelationsRuleNode;
  operator: 'AND' | 'OR';
};

type FilterRelationsRuleIdNode = { instanceid: string };

type FilterRelationsRuleNode = FilterRelationsRule | FilterRelationsRuleIdNode;

/** Filter action types */
type FilterAction = { type: 'add'; payload: Filter } | { type: 'remove'; payload: Filter };

/**
 * Merges source filters with target filters and recalculates relations.
 *
 * @param sourceFilters - The source filters or filter relations to merge.
 * @param targetFilters - The target filters or filter relations to merge with.
 * @returns Updated source filters merged with target filters. If the source filters are FilterRelations, the relations are recalculated.
 */
export function mergeFiltersOrFilterRelations(
  sourceFilters: Filter[] | FilterRelations | undefined,
  targetFilters: Filter[] | FilterRelations | undefined,
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
      return {
        left: traverse(node.left),
        right: traverse(node.right),
        operator: node.operator,
      };
    }
    throw new UnknownRelationsNodeError();
  }
}

/** Type guard for checking if a node is a single relations node (trivial case when relations are needless). */
export function isTrivialSingleNodeRelations(
  relations: FilterRelationsRules,
): relations is FilterRelationsRuleIdNode {
  return !!relations && 'instanceid' in relations;
}

/**
 * Calculates new relations based on the changes in filters.
 */
export function calculateNewRelations(
  prevFilters: Filter[],
  prevRelations: FilterRelationsRules,
  newFilters: Filter[],
): FilterRelationsRules {
  const performedActions = diffFilters(prevFilters, newFilters);
  if (performedActions.length === 0) {
    return prevRelations;
  }
  return performedActions.reduce((relations, action) => {
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

function isRelationsRuleIdNode(node: FilterRelationsRuleNode): node is FilterRelationsRuleIdNode {
  return 'instanceid' in node;
}
function isRelationsRule(node: FilterRelationsRuleNode): node is FilterRelationsRule {
  return 'operator' in node;
}

function isFilterNode(node: FilterRelationsNode): node is Filter {
  return 'config' in node && 'guid' in node.config;
}

/**
 * Converts internal CSDK filter relations rules to filter relations model for Fusion.
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
 * Textual representation of filter relations for debugging purposes.
 * Returns string like "(([Gender] AND [Country]) OR [Condition])".
 *
 * @internal
 */
export function getRelationsAsText(relations: FilterRelationsRules, filters: Filter[]): string {
  if (!relations) return '';
  if ('instanceid' in relations)
    return relations.instanceid
      ? findFilterByGuid(filters, relations.instanceid)?.attribute.name ?? ''
      : '';
  const left =
    'instanceid' in relations.left
      ? `[${findFilterByGuid(filters, relations.left.instanceid)?.attribute.name}]`
      : getRelationsAsText(relations.left, filters);
  const right =
    'instanceid' in relations.right
      ? `[${findFilterByGuid(filters, relations.right.instanceid)?.attribute.name}]`
      : getRelationsAsText(relations.right, filters);
  return `(${left} ${relations.operator} ${right})`;
}

function findFilterByGuid(filters: Filter[], guid: string): Filter | undefined {
  return filters.find((filter) => filter.config.guid === guid);
}

export function getFilterRelationsDescription(
  relations: FilterRelationsRules,
  filters: Filter[],
): FilterRelationsDescription {
  if (!relations) {
    return [];
  }

  return traverse(relations);

  function traverse(node: FilterRelationsRuleNode): FilterRelationsDescription {
    if (isRelationsRuleIdNode(node)) {
      return [
        {
          nodeType: 'attribute',
          attribute: findFilterByGuid(filters, node.instanceid)?.attribute?.name || node.instanceid,
        },
      ];
    }
    if (isRelationsRule(node)) {
      return [
        { nodeType: 'openBracket' },
        ...traverse(node.left),
        { nodeType: 'operator', operator: node.operator },
        ...traverse(node.right),
        { nodeType: 'closeBracket' },
      ];
    }
    throw new UnknownRelationsNodeError();
  }
}

/**
 * Error thrown when an unknown node type is encountered in filter relations.
 */
class UnknownRelationsNodeError extends Error {
  constructor() {
    super('Broken filter relations. Unknown node type.');
  }
}

export type FilterRelationsDescription = FilterRelationsDescriptionNode[];

type FilterRelationsDescriptionNode =
  | OpenBracketDescriptionNode
  | CloseBracketDescriptionNode
  | AttributeDescriptionNode
  | OperatorDescriptionNode;

type OpenBracketDescriptionNode = {
  nodeType: 'openBracket';
};

export function isOpenBracketDescriptionNode(
  node: FilterRelationsDescriptionNode,
): node is OpenBracketDescriptionNode {
  return node.nodeType === 'openBracket';
}

type CloseBracketDescriptionNode = {
  nodeType: 'closeBracket';
};

export function isCloseBracketDescriptionNode(
  node: FilterRelationsDescriptionNode,
): node is CloseBracketDescriptionNode {
  return node.nodeType === 'closeBracket';
}

type AttributeDescriptionNode = {
  nodeType: 'attribute';
  attribute: string;
};

export function isAttributeDescriptionNode(
  node: FilterRelationsDescriptionNode,
): node is AttributeDescriptionNode {
  return node.nodeType === 'attribute';
}

type OperatorDescriptionNode = {
  nodeType: 'operator';
  operator: 'AND' | 'OR';
};

export function isOperatorDescriptionNode(
  node: FilterRelationsDescriptionNode,
): node is OperatorDescriptionNode {
  return node.nodeType === 'operator';
}
