import {
  Filter,
  FilterRelations,
  FilterRelationsDescription,
  FilterRelationsJaql,
  FilterRelationsJaqlNode,
  FilterRelationsRuleNode,
  FilterRelationsRules,
  findFilterByGuid,
  getFilterCompareId,
  isRelationsRule,
  isRelationsRuleIdNode,
  mergeFiltersOrFilterRelations,
  UnknownRelationsNodeError,
} from '@sisense/sdk-data';
import cloneDeep from 'lodash-es/cloneDeep.js';

export {
  splitFiltersAndRelations,
  getFiltersArray,
  combineFiltersAndRelations,
  isTrivialSingleNodeRelations,
  calculateNewRelations,
  getRelationsWithReplacedFilter,
  convertFilterRelationsModelToRelationRules,
  filterRelationRulesToFilterRelationsModel,
  isOpenBracketDescriptionNode,
  isCloseBracketDescriptionNode,
  isAttributeDescriptionNode,
  isOperatorDescriptionNode,
  mergeFiltersOrFilterRelations,
  type FilterRelationsDescription,
  type FilterRelationsRules,
} from '@sisense/sdk-data';

/**
 * @internal
 */
export enum FiltersMergeStrategyEnum {
  WIDGET_FIRST = 'widgetFirst',
  CODE_FIRST = 'codeFirst',
  CODE_ONLY = 'codeOnly',
}

export type FiltersMergeStrategy = `${FiltersMergeStrategyEnum}`;

/**
 * Returns true if any node in the filter-relations tree uses an OR operator.
 * Used to decide whether to show the AND/OR Formula tile — AND-only trees are the default
 * behavior and don't warrant a visible indicator.
 *
 * @internal
 */
export function hasOrOperator(relations: FilterRelationsRules): boolean {
  if (!relations || !isRelationsRule(relations)) {
    return false;
  }
  return (
    relations.operator === 'OR' ||
    hasOrOperator(relations.left as FilterRelationsRules) ||
    hasOrOperator(relations.right as FilterRelationsRules)
  );
}

/**
 * Textual representation of filter relations for debugging purposes.
 * Returns string like "(([Gender] AND [Country]) OR [Condition])".
 *
 * @internal
 */
export function getRelationsAsText(relations: FilterRelationsRules, filters: Filter[]): string {
  if (!relations) return '';
  if (isRelationsRuleIdNode(relations)) {
    return relations.instanceid
      ? findFilterByGuid(filters, relations.instanceid)?.attribute.name ?? ''
      : '';
  }
  if (isRelationsRule(relations)) {
    const left = isRelationsRuleIdNode(relations.left)
      ? `[${findFilterByGuid(filters, relations.left.instanceid)?.attribute.name}]`
      : getRelationsAsText(relations.left, filters);
    const right = isRelationsRuleIdNode(relations.right)
      ? `[${findFilterByGuid(filters, relations.right.instanceid)?.attribute.name}]`
      : getRelationsAsText(relations.right, filters);
    return `(${left} ${relations.operator} ${right})`;
  }
  return '';
}

/**
 * Builds tooltip lines: adds `(` / `)` around each logical subtree from `splitFiltersAndRelations`.
 *
 * @internal
 */
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
 * Merge two arrays of filters using the specified merge strategy.
 *
 * @param widgetFilters - The filters from the widget.
 * @param codeFilters - The filters from the code.
 * @param mergeStrategy - The strategy to use for merging filters.
 * @returns The merged filters based on the selected strategy.
 * @internal
 */
export function mergeFiltersByStrategy(
  widgetFilters: Filter[] | FilterRelations = [],
  codeFilters: Filter[] | FilterRelations = [],
  mergeStrategy?: FiltersMergeStrategy,
) {
  switch (mergeStrategy) {
    case FiltersMergeStrategyEnum.WIDGET_FIRST:
      return mergeFiltersOrFilterRelations(codeFilters, widgetFilters);
    case FiltersMergeStrategyEnum.CODE_FIRST:
      return mergeFiltersOrFilterRelations(widgetFilters, codeFilters);
    case FiltersMergeStrategyEnum.CODE_ONLY:
      return codeFilters;
    default:
      // apply 'codeFirst' filters merge strategy by default
      return mergeFiltersOrFilterRelations(widgetFilters, codeFilters);
  }
}

/**
 * Replaces filters for same dimensions in filter relations jaql.
 * Widget filters have higher priority than dashboard filters.
 *
 * @param widgetFilters - The filters from the widget.
 * @param dashboardFilters -  The filters from the dashboard.
 * @param relations - The filter relations before replacement.
 * @returns The filter relations after replacement.
 * @internal
 */
export function applyWidgetFiltersToRelations(
  widgetFilters: Filter[],
  dashboardFilters: Filter[],
  relations: FilterRelationsJaql | undefined,
): FilterRelationsJaql | undefined {
  if (!relations || !widgetFilters || !widgetFilters.length) {
    return relations;
  }

  const newRelations = cloneDeep(relations);

  const replacementsMap: Record<string, string> = {};
  widgetFilters.forEach((widgetFilter) => {
    if (widgetFilter.config.guid) {
      const correspondingFilter = dashboardFilters.find(
        (dashboardFilter) =>
          getFilterCompareId(dashboardFilter) === getFilterCompareId(widgetFilter),
      );
      if (correspondingFilter && correspondingFilter.config.guid) {
        replacementsMap[correspondingFilter.config.guid] = widgetFilter.config.guid;
      }
    }
  });

  function findAndReplace(node: FilterRelationsJaqlNode, replacementsDone = 0) {
    if (replacementsDone >= Object.keys(replacementsMap).length) return;
    if ('instanceid' in node && node.instanceid in replacementsMap) {
      node.instanceid = replacementsMap[node.instanceid];
      replacementsDone += 1;
    }
    if ('left' in node) {
      findAndReplace(node.left, replacementsDone);
    }
    if ('right' in node) {
      findAndReplace(node.right, replacementsDone);
    }
  }

  findAndReplace(newRelations);
  return newRelations;
}
