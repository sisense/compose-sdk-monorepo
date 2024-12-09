import {
  DimensionalLevelAttribute,
  type Filter,
  FilterRelations,
  FilterRelationsNode,
  FilterRelationsModelNode,
  FilterRelationsModel,
  FilterRelationsJaql,
  FilterRelationsJaqlNode,
  isCascadingFilter,
} from '@sisense/sdk-data';
import { ChartSubtype } from '../chart-options-processor/subtype-to-design-options.js';
import { ChartType } from '../types.js';
import {
  FiltersMergeStrategy,
  FiltersMergeStrategyEnum,
  Panel,
  PanelItem,
  TextWidgetDtoStyle,
  WidgetStyle,
  WidgetSubtype,
  WidgetType,
} from './types.js';
import cloneDeep from 'lodash-es/cloneDeep';
import { TranslatableError } from '../translation/translatable-error.js';
import {
  ChartProps,
  ChartStyleOptions,
  ChartWidgetProps,
  PivotTableWidgetProps,
  PluginWidgetProps,
  RenderToolbarHandler,
  TextWidgetProps,
  WidgetContainerStyleOptions,
  CommonWidgetProps,
  WithWidgetType,
  WidgetProps,
} from '../index.js';
import { combineHandlers } from '@/utils/combine-handlers';
import { WidgetTypeInternal } from '@/models/widget/types';
import { mergeFiltersOrFilterRelations } from '@/utils/filter-relations.js';

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
/**
 * Returns the corresponding chart type for a given widget type
 *
 * @internal
 */
export function getChartType(widgetType: WidgetType) {
  return widgetTypeToChartType[widgetType];
}
export function getWidgetTypeFromChartType(chartType: ChartType): WidgetType {
  const reversedWidgetTypeToChartType = Object.entries(widgetTypeToChartType).reduce(
    (acc, [key, value]) => {
      acc[value] = key as WidgetType;
      return acc;
    },
    {} as Record<ChartType, WidgetType>,
  );
  return reversedWidgetTypeToChartType[chartType];
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
    'richtexteditor',
  ];
  return supportedWidgetTypes.includes(widgetType as WidgetType);
}

export function isTableWidget(widgetType: WidgetTypeOrString) {
  return widgetType === 'tablewidget' || widgetType === 'tablewidgetagg';
}

export function isPivotTableWidget(widgetType: WidgetTypeOrString) {
  return widgetType === 'pivot' || widgetType === 'pivot2';
}

export function isTextWidget(widgetType: WidgetTypeOrString) {
  return widgetType === 'richtexteditor';
}

export function isTextWidgetDtoStyle(widgetStyle: WidgetStyle): widgetStyle is TextWidgetDtoStyle {
  return 'content' in widgetStyle && 'html' in widgetStyle.content;
}

export function isPluginWidget(widgetType: WidgetTypeOrString) {
  return widgetType === 'plugin';
}

export function isChartWidget(widgetType: WidgetTypeOrString) {
  return !isPivotTableWidget(widgetType) && !isTextWidget(widgetType);
}

/**
 * Type guard for checking if the widget props is for a text widget.
 *
 * @param widgetProps - The widget props to check.
 * @returns whether the widget props is for a text widget
 * @internal
 */
export function isTextWidgetProps(
  widgetProps: CommonWidgetProps,
): widgetProps is WithWidgetType<TextWidgetProps, 'text'> {
  return widgetProps.widgetType === 'text';
}

/**
 * Type guard for checking if the widget props is for a pivot table widget.
 *
 * @param widgetProps - The widget props to check.
 * @returns whether the widget props is for a pivot table widget
 * @internal
 */
export function isPivotTableWidgetProps(
  widgetProps: CommonWidgetProps,
): widgetProps is WithWidgetType<PivotTableWidgetProps, 'pivot'> {
  return widgetProps.widgetType === 'pivot';
}

/**
 * Type guard for checking if the widget props is for a plugin widget
 *
 * @param widgetProps - The widget props to check.
 * @returns whether the widget props is for a plugin widget
 * @internal
 */
export function isPluginWidgetProps(
  widgetProps: CommonWidgetProps,
): widgetProps is WithWidgetType<PluginWidgetProps, 'plugin'> {
  return widgetProps.widgetType === 'plugin';
}

/**
 * Type guard for checking if the widget props is for a chart widget
 *
 * @param widgetProps - The widget props to check.
 * @returns whether the widget props is for a chart widget
 * @internal
 */
export function isChartWidgetProps(
  widgetProps: CommonWidgetProps,
): widgetProps is WithWidgetType<ChartWidgetProps, 'chart'> {
  return widgetProps.widgetType === 'chart';
}

export function getInternalWidgetType(widgetProps: CommonWidgetProps): WidgetTypeInternal {
  if (isPivotTableWidgetProps(widgetProps)) {
    return 'pivot';
  } else if (isPluginWidgetProps(widgetProps)) {
    return 'plugin';
  } else if (isTextWidgetProps(widgetProps)) {
    return 'text';
  }

  return widgetProps.chartType;
}

/**
 * Registers new "onDataPointClick" handler for the Widget component
 *
 * @internal
 */
export function registerDataPointClickHandler(
  widgetProps: WidgetProps,
  handler: NonNullable<ChartProps['onDataPointClick']>,
): void {
  if (!isChartWidgetProps(widgetProps)) return;

  widgetProps.onDataPointClick = combineHandlers([widgetProps.onDataPointClick, handler]);
}

/**
 * Registers new "onDataPointContextMenu" handler for the Widget component
 *
 * @internal
 */
export function registerDataPointContextMenuHandler(
  widgetProps: WidgetProps,
  handler: NonNullable<ChartProps['onDataPointContextMenu']>,
): void {
  if (!isChartWidgetProps(widgetProps)) return;

  widgetProps.onDataPointContextMenu = combineHandlers([
    widgetProps.onDataPointContextMenu,
    handler,
  ]);
}

/**
 * Registers new "onDataPointsSelected" handler for the Widget component
 *
 * @internal
 */
export function registerDataPointsSelectedHandler(
  widgetProps: WidgetProps,
  handler: NonNullable<ChartProps['onDataPointsSelected']>,
): void {
  if (!isChartWidgetProps(widgetProps)) return;

  widgetProps.onDataPointsSelected = combineHandlers([widgetProps.onDataPointsSelected, handler]);
}

/**
 * Registers new "renderToolbar" handler for the constructed component
 *
 * @internal
 */
export function registerRenderToolbarHandler(
  widgetProps: WidgetProps,
  handler: RenderToolbarHandler,
): void {
  const widgetStyleOptions = widgetProps.styleOptions as WidgetContainerStyleOptions;

  widgetProps.styleOptions = {
    ...widgetStyleOptions,
    header: {
      ...widgetStyleOptions?.header,
      renderToolbar: combineHandlers([widgetStyleOptions?.header?.renderToolbar, handler]),
    },
  } as ChartStyleOptions;
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
 * Replaces nodes of filter reations tree with fetched filters by instance id.
 *
 * @param filters - The filters from the dashboard.
 * @param highlights - The highlights from the dashboard
 * @param filterRelations - Fetched filter relations.
 * @returns {FilterRelations} Filter relations with filters in nodes.
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
