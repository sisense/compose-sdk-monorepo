import {
  DimensionalLevelAttribute,
  type Filter,
  JaqlSortDirection,
  FilterRelations,
  FilterRelationsNode,
  FilterRelationsModelNode,
  FilterRelationsModel,
  FilterRelationsJaql,
  FilterRelationsJaqlNode,
} from '@sisense/sdk-data';
import { ChartSubtype } from '../chart-options-processor/subtype-to-design-options';
import { ChartType, type SortDirection } from '../types';
import {
  FiltersMergeStrategy,
  FiltersMergeStrategyEnum,
  Panel,
  PanelItem,
  WidgetSubtype,
  WidgetType,
} from './types';
import cloneDeep from 'lodash/cloneDeep';
import { TranslatableError } from '../translation/translatable-error';
import { isCascadingFilter } from '@/utils/filters';

export function getChartType(widgetType: WidgetType) {
  const widgetTypeToChartType = <Record<WidgetType, ChartType>>{
    'chart/line': 'line',
    'chart/area': 'area',
    'chart/bar': 'bar',
    'chart/column': 'column',
    'chart/polar': 'polar',
    'chart/pie': 'pie',
    'chart/funnel': 'funnel',
    treemap: 'treemap',
    sunburst: 'sunburst',
    'chart/scatter': 'scatter',
    indicator: 'indicator',
    'chart/boxplot': 'boxplot',
    'map/scatter': 'scattermap',
    'map/area': 'areamap',
    tablewidget: 'table',
    tablewidgetagg: 'table',
  };

  return widgetTypeToChartType[widgetType];
}

export function getChartSubtype(widgetSubtype: WidgetSubtype): ChartSubtype | undefined {
  const widgetSubtypeToChartSubtype = <Record<WidgetSubtype, ChartSubtype>>{
    'area/basic': 'area/basic',
    'area/stacked': 'area/stacked',
    'area/stacked100': 'area/stacked100',
    'area/spline': 'area/spline',
    'area/stackedspline': 'area/stackedspline',
    'area/stackedspline100': 'area/stackedspline100',
    'bar/classic': 'bar/classic',
    'bar/stacked': 'bar/stacked',
    'bar/stacked100': 'bar/stacked100',
    'column/classic': 'column/classic',
    'column/stackedcolumn': 'column/stackedcolumn',
    'column/stackedcolumn100': 'column/stackedcolumn100',
    'line/basic': 'line/basic',
    'line/spline': 'line/spline',
    'pie/classic': 'pie/classic',
    'pie/donut': 'pie/donut',
    'pie/ring': 'pie/ring',
    'column/polar': 'polar/column',
    'area/polar': 'polar/area',
    'line/polar': 'polar/line',
    'indicator/numeric': 'indicator/numeric',
    'indicator/gauge': 'indicator/gauge',
    treemap: 'treemap',
    sunburst: 'sunburst',
    'boxplot/full': 'boxplot/full',
    'boxplot/hollow': 'boxplot/hollow',
    'map/scatter': 'scattermap',
  };
  return widgetSubtypeToChartSubtype[widgetSubtype];
}

type WidgetTypeOrString = string | WidgetType;

export function isSupportedWidgetType(widgetType: WidgetTypeOrString): widgetType is WidgetType {
  const supportedWidgetTypes: WidgetType[] = [
    'chart/line',
    'chart/area',
    'chart/bar',
    'chart/column',
    'chart/polar',
    'chart/pie',
    'chart/funnel',
    'treemap',
    'sunburst',
    'chart/scatter',
    'indicator',
    'tablewidget',
    'tablewidgetagg',
    'pivot',
    'pivot2',
    'chart/boxplot',
    'map/scatter',
    'map/area',
  ];
  return supportedWidgetTypes.includes(widgetType as WidgetType);
}

export function isTableWidget(widgetType: WidgetTypeOrString) {
  return widgetType === 'tablewidget' || widgetType === 'tablewidgetagg';
}

export function isPivotWidget(widgetType: WidgetTypeOrString) {
  return widgetType === 'pivot' || widgetType === 'pivot2';
}

export function isChartWidget(widgetType: WidgetTypeOrString) {
  return !isPivotWidget(widgetType);
}

export function getEnabledPanelItems(panels: Panel[], panelName: string) {
  const panel = panels.find((p) => p.name === panelName);
  const panelItems = panel?.items ?? [];
  return panelItems.filter((item) => !item.disabled);
}

export function getRootPanelItem(item: PanelItem): PanelItem {
  return item.parent ? getRootPanelItem(item.parent) : item;
}

/**
 * Gets the sort type based on the jaql sort direction.
 *
 * @param jaqlSort - The jaql sort direction.
 * @returns  The sort direction.
 * @internal
 */
export function getSortType(jaqlSort: `${JaqlSortDirection}` | undefined): SortDirection {
  switch (jaqlSort) {
    case JaqlSortDirection.ASC:
      return 'sortAsc';
    case JaqlSortDirection.DESC:
      return 'sortDesc';
    default:
      return 'sortNone';
  }
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
 */
export function mergeFilters(sourceFilters: Filter[] = [], targetFilters: Filter[] = []) {
  const filters = [...sourceFilters];

  targetFilters.forEach((filter) => {
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
 * Merge two arrays of filters using the specified merge strategy.
 *
 * @param {Filter[]} widgetFilters - The filters from the widget.
 * @param {Filter[]} codeFilters - The filters from the code.
 * @param {FiltersMergeStrategy} [mergeStrategy] - The strategy to use for merging filters.
 * @returns {Filter[]} The merged filters based on the selected strategy.
 */
export function mergeFiltersByStrategy(
  widgetFilters: Filter[] = [],
  codeFilters: Filter[] = [],
  mergeStrategy?: FiltersMergeStrategy,
) {
  switch (mergeStrategy) {
    case FiltersMergeStrategyEnum.WIDGET_FIRST:
      return mergeFilters(codeFilters, widgetFilters);
    case FiltersMergeStrategyEnum.CODE_FIRST:
      return mergeFilters(widgetFilters, codeFilters);
    case FiltersMergeStrategyEnum.CODE_ONLY:
      return codeFilters;
    default:
      // apply 'codeFirst' filters merge strategy by default
      return mergeFilters(widgetFilters, codeFilters);
  }
}

/**
 * Replaces nodes of filter reations tree with fetched filters by instance id.
 *
 * @param filters - The filters from the dashboard.
 * @param filterRelations - Fetched filter relations.
 * @returns {FilterRelations} Filter relations with filters in nodes.
 */
/* eslint-disable-next-line sonarjs/cognitive-complexity */
export function getFilterRelationsFromJaql(
  filters: Filter[],
  filterRelations: FilterRelationsJaql | undefined,
): FilterRelations | Filter[] {
  if (!filterRelations) {
    return filters;
  }

  const mergedFilterRelations = cloneDeep(filterRelations);

  function traverse(
    node: FilterRelationsJaqlNode | FilterRelationsNode,
  ): FilterRelationsJaqlNode | FilterRelationsNode {
    if ('instanceid' in node) {
      const filter = filters.find((filter) => filter.guid === node.instanceid);
      if (!filter) {
        throw new TranslatableError('errors.unknownFilterInFilterRelations');
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
 * @returns {FilterRelationsJaql} Filter relations jaql.
 */
export function convertFilterRelationsModelToJaql(
  filterRelations: FilterRelationsModel | undefined,
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

/**
 * Replaces filters for same dimensions in filter relations jaql.
 * Widget filters have higher priority than dashboard filters.
 *
 * @param widgetFilters - The filters from the widget.
 * @param dashboardFilters -  The filters from the dashboard.
 * @param relations - The filter relations before replacement.
 * @returns {FilterRelationsJaql} The filter relations after replacement.
 */
export function applyWidgetFiltersToRelations(
  widgetFilters: Filter[],
  dashboardFilters: Filter[],
  relations: FilterRelationsJaql | undefined,
) {
  if (!relations || !widgetFilters || !widgetFilters.length) {
    return relations;
  }

  const newRelations = cloneDeep(relations);

  const replacementsMap = {};
  widgetFilters.forEach((widgetFilter) => {
    if (widgetFilter.guid) {
      const correspondingFilter = dashboardFilters.find(
        (dashboardFilter) =>
          getFilterCompareId(dashboardFilter) === getFilterCompareId(widgetFilter),
      );
      if (correspondingFilter && correspondingFilter.guid) {
        replacementsMap[correspondingFilter.guid] = widgetFilter.guid;
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
