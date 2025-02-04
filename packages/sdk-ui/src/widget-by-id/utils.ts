import { ChartSubtype } from '../chart-options-processor/subtype-to-design-options.js';
import { ChartType } from '../types.js';
import {
  Panel,
  PanelItem,
  TextWidgetDtoStyle,
  WidgetStyle,
  WidgetSubtype,
  WidgetType,
} from './types.js';
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
export {
  mergeFilters,
  getFilterRelationsFromJaql,
  convertFilterRelationsModelToJaql,
  getFilterCompareId,
} from '@sisense/sdk-data';

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
