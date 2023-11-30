import {
  DimensionalLevelAttribute,
  type Filter,
  SortDirection as JaqlSortDirection,
} from '@sisense/sdk-data';
import { ChartSubtype } from '../chart-options-processor/subtype-to-design-options';
import { ChartType, SortDirection } from '../types';
import {
  FiltersMergeStrategy,
  FiltersMergeStrategyEnum,
  Panel,
  PanelItem,
  WidgetSubtype,
  WidgetType,
} from './types';

export function getChartType(widgetType: WidgetType) {
  const widgetTypeToChartType = <Record<WidgetType, ChartType>>{
    [WidgetType.LineChart]: 'line',
    [WidgetType.AreaChart]: 'area',
    [WidgetType.BarChart]: 'bar',
    [WidgetType.ColumnChart]: 'column',
    [WidgetType.PolarChart]: 'polar',
    [WidgetType.PieChart]: 'pie',
    [WidgetType.FunnelChart]: 'funnel',
    [WidgetType.TreemapChart]: 'treemap',
    [WidgetType.SunburstChart]: 'sunburst',
    [WidgetType.ScatterChart]: 'scatter',
    [WidgetType.IndicatorChart]: 'indicator',
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
  };
  return widgetSubtypeToChartSubtype[widgetSubtype];
}

type WidgetTypeOrString = string | WidgetType;

export function isSupportedWidgetType(widgetType: WidgetTypeOrString): widgetType is WidgetType {
  const supportedWidgetTypes = [
    WidgetType.LineChart,
    WidgetType.AreaChart,
    WidgetType.BarChart,
    WidgetType.ColumnChart,
    WidgetType.PolarChart,
    WidgetType.PieChart,
    WidgetType.FunnelChart,
    WidgetType.TreemapChart,
    WidgetType.SunburstChart,
    WidgetType.ScatterChart,
    WidgetType.IndicatorChart,
    WidgetType.Table,
    WidgetType.TableWithAggregation,
  ];
  return supportedWidgetTypes.includes(widgetType as WidgetType);
}

export function isTableWidget(widgetType: WidgetTypeOrString) {
  return widgetType === WidgetType.Table || widgetType === WidgetType.TableWithAggregation;
}

export function getEnabledPanelItems(panels: Panel[], panelName: string) {
  const panel = panels.find((p) => p.name === panelName);
  const panelItems = panel?.items ?? [];
  return panelItems.filter((item) => !item.disabled);
}

export function getRootPanelItem(item: PanelItem): PanelItem {
  return item.parent ? getRootPanelItem(item.parent) : item;
}

export function getSortType(jaqlSort: JaqlSortDirection | undefined): SortDirection {
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
 */
function getFilterCompareId(filter: Filter): string {
  // TODO: remove fallback on 'filter.jaql()' after removing temporal 'jaql()' workaround from filter translation layer
  const { attribute: filterAttribute } = filter;
  const filterJaql = filter.jaql().jaql;
  const expression = filterAttribute.expression || filterJaql.dim;
  const granularity =
    (filterAttribute as DimensionalLevelAttribute).granularity ||
    (filterJaql.datatype === 'datetime'
      ? DimensionalLevelAttribute.translateJaqlToGranularity(filterJaql)
      : '');

  return `${expression}${granularity}`;
}

/**
 * Merges two arrays of filter objects, prioritizing 'targetFilters' over 'sourceFilters',
 * and removes duplicates based on filter compare id
 *
 * @param {Filter[]} [sourceFilters=[]] - The source array of filter objects.
 * @param {Filter[]} [targetFilters=[]] - The target array of filter objects.
 * @returns {Filter[]} - The merged array of filter objects.
 */
export function mergeFilters(sourceFilters: Filter[] = [], targetFilters: Filter[] = []) {
  const filters = [...targetFilters];

  sourceFilters.forEach((filter) => {
    const isFilterAlreadyExist = targetFilters.some(
      (existingFilter) => getFilterCompareId(filter) === getFilterCompareId(existingFilter),
    );

    if (!isFilterAlreadyExist) {
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
