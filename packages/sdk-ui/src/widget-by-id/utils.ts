import { ChartSubtype } from '@/chart-options-processor/subtype-to-design-options.js';
import {
  ChartStyleOptions,
  ChartType,
  RenderToolbarHandler,
  WidgetContainerStyleOptions,
} from '@/types.js';
import {
  Panel,
  PanelItem,
  TextWidgetDtoStyle,
  WidgetStyle,
  WidgetSubtype,
  FusionWidgetType,
} from './types.js';
import {
  ChartProps,
  ChartWidgetProps,
  PivotTableWidgetProps,
  PluginWidgetProps,
  TextWidgetProps,
  CommonWidgetProps,
  WithCommonWidgetProps,
  WidgetProps,
  WidgetType,
} from '@/props';
import { combineHandlers } from '@/utils/combine-handlers';
import { WidgetTypeInternal } from '@/models/widget/types';
import { WidgetModel } from '@/models';
import { TranslatableError } from '@/translation/translatable-error.js';
export {
  mergeFilters,
  getFilterRelationsFromJaql,
  convertFilterRelationsModelToJaql,
  getFilterCompareId,
} from '@sisense/sdk-data';

const fusionWidgetTypeToChartType = <Record<FusionWidgetType, ChartType>>{
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

const chartTypeToFusionWidgetType: Record<ChartType, FusionWidgetType> = Object.entries(
  fusionWidgetTypeToChartType,
).reduce<Record<ChartType, FusionWidgetType>>((acc, [key, value]) => {
  acc[value] = key as FusionWidgetType;
  return acc;
}, {} as Record<ChartType, FusionWidgetType>);

/**
 * Returns the corresponding chart type for a given widget type
 *
 * @internal
 */
export function getChartType(fusionWidgetType: FusionWidgetType) {
  return fusionWidgetTypeToChartType[fusionWidgetType];
}
export function getFusionWidgetTypeFromChartType(chartType: ChartType): FusionWidgetType {
  return chartTypeToFusionWidgetType[chartType];
}

export function getFusionWidgetType(
  widgetType: WidgetType,
  chartType?: ChartType,
): FusionWidgetType {
  if (widgetType === 'chart') {
    if (!chartType) {
      throw new Error('chartType is required for chart widget type');
    }
    return getFusionWidgetTypeFromChartType(chartType);
  }
  if (widgetType === 'pivot') {
    return 'pivot2';
  }
  if (widgetType === 'plugin') {
    return 'plugin';
  }
  if (widgetType === 'text') {
    return 'richtexteditor';
  }
  throw new TranslatableError('errors.widgetModel.unsupportedWidgetType', {
    widgetType,
  });
}

export function getWidgetType(fusionWidgetType: FusionWidgetType): WidgetType {
  if (isPivotTableFusionWidget(fusionWidgetType)) {
    return 'pivot';
  } else if (isPluginFusionWidget(fusionWidgetType)) {
    return 'plugin';
  } else if (isTextFusionWidget(fusionWidgetType)) {
    return 'text';
  } else if (isChartFusionWidget(fusionWidgetType)) {
    return 'chart';
  }
  throw new TranslatableError('errors.widgetModel.unsupportedFusionWidgetType', {
    fusionWidgetType,
  });
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

export function isSupportedWidgetType(
  fusionWidgetType: FusionWidgetType,
): fusionWidgetType is FusionWidgetType {
  const supportedWidgetTypes: FusionWidgetType[] = [
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
  return supportedWidgetTypes.includes(fusionWidgetType);
}

export function isTableFusionWidget(fusionWidgetType: FusionWidgetType) {
  return fusionWidgetType === 'tablewidget' || fusionWidgetType === 'tablewidgetagg';
}
export function isTableWidgetModel(widgetModel: WidgetModel): boolean {
  return isChartWidget(widgetModel.widgetType) && widgetModel.chartType === 'table';
}

export function isPivotTableFusionWidget(fusionWidgetType: FusionWidgetType) {
  return fusionWidgetType === 'pivot' || fusionWidgetType === 'pivot2';
}
export function isPivotWidget(widgetType: WidgetType) {
  return widgetType === 'pivot';
}

export function isTextFusionWidget(fusionWidgetType: FusionWidgetType) {
  return fusionWidgetType === 'richtexteditor';
}
export function isTextWidget(widgetType: WidgetType) {
  return widgetType === 'text';
}

export function isTextWidgetDtoStyle(widgetStyle: WidgetStyle): widgetStyle is TextWidgetDtoStyle {
  return 'content' in widgetStyle && 'html' in widgetStyle.content;
}

export function isPluginFusionWidget(fusionWidgetType: FusionWidgetType) {
  return fusionWidgetType === 'plugin';
}
export function isPluginWidget(widgetType: WidgetType) {
  return widgetType === 'plugin';
}

export function isChartFusionWidget(fusionWidgetType: FusionWidgetType) {
  return !isPivotTableFusionWidget(fusionWidgetType) && !isTextFusionWidget(fusionWidgetType);
}
export function isChartWidget(widgetType: WidgetType) {
  return widgetType === 'chart';
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
): widgetProps is WithCommonWidgetProps<TextWidgetProps, 'text'> {
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
): widgetProps is WithCommonWidgetProps<PivotTableWidgetProps, 'pivot'> {
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
): widgetProps is WithCommonWidgetProps<PluginWidgetProps, 'plugin'> {
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
): widgetProps is WithCommonWidgetProps<ChartWidgetProps, 'chart'> {
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

  return (widgetProps as WithCommonWidgetProps<ChartWidgetProps, 'chart'>).chartType;
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
