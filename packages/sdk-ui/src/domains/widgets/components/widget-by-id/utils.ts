/**
 * Fusion widget identity helpers. The DTO type ↔ widget type ↔ chart type mappings are projections
 * of the descriptor table in `domains/widgets/widget-identity`; add or change a built-in widget type there.
 */
import type { ChartSubtype } from '@/domains/visualizations/core/chart-options-processor/subtype-to-design-options.js';
import {
  BUILT_IN_WIDGET_DESCRIPTORS,
  type BuiltInWidgetDescriptor,
  type BuiltInWidgetKey,
  descriptorByChartType,
  descriptorByFusionType,
  officialPluginByCsdkType,
  officialPluginByFusionType,
} from '@/domains/widgets/widget-identity/index.js';
import type { WidgetModel } from '@/domains/widgets/widget-model';
import type { WidgetTypeInternal } from '@/domains/widgets/widget-model/types.js';
import { TranslatableError } from '@/infra/translation/translatable-error.js';
import type { ChartProps, PivotTableProps } from '@/props';
import { combineHandlers } from '@/shared/utils/combine-handlers';
import type { ChartType, CustomWidgetEventProps } from '@/types.js';

import type { ChartWidgetProps } from '../chart-widget/types';
import type { CommonWidgetProps } from '../common-widget/types';
import type { CustomWidgetProps } from '../custom-widget/types';
import type { FilterWidgetProps } from '../filter-widget/types';
import type { NarrativeWidgetProps } from '../narrative-widget/types';
import type { PivotTableWidgetProps } from '../pivot-table-widget/types';
import type { TextWidgetProps } from '../text-widget/types';
import type { WidgetProps, WidgetType, WithCommonWidgetProps } from '../widget/types';
import type {
  CsdkPluginWidgetType,
  FusionPluginWidgetType,
  FusionWidgetType,
  Panel,
  PanelItem,
  TextWidgetDtoStyle,
  WidgetStyle,
  WidgetSubtype,
} from './types.js';

export {
  mergeFilters,
  getFilterRelationsFromJaql,
  convertFilterRelationsModelToJaql,
  getFilterCompareId,
} from '@sisense/sdk-data';

/**
 * Returns `true` when a panel item's jaql represents a measure — either a base-measure
 * aggregation (`jaql.agg`) or a calculated measure (`jaql.formula`). Mirrors Fusion's
 * `isMeasure` dimension helper so CSDK code can evaluate the same "is measure?" checks
 * Fusion's widget manifests rely on.
 *
 * @param item - The panel item.
 * @returns `true` when the panel item is a measure.
 * @internal
 */
export function isMeasurePanelItem(item: PanelItem): boolean {
  const jaql = item.jaql;
  return ('agg' in jaql && !!jaql.agg) || ('formula' in jaql && !!jaql.formula);
}

/**
 * Returns the chart type of a Fusion widget DTO type, read from the built-in widget descriptor table.
 *
 * @param fusionWidgetType - The Fusion widget DTO type.
 * @returns The chart type, or `undefined` for non-chart and unknown Fusion types.
 * @internal
 */
export function getChartType(fusionWidgetType: FusionWidgetType): ChartType | undefined {
  return descriptorByFusionType.get(fusionWidgetType)?.chartType;
}

/**
 * Returns the canonical Fusion widget DTO type of a chart type, read from the built-in widget
 * descriptor table.
 *
 * Chart types without a Fusion DTO type (`streamgraph`, `arearange`) yield `undefined`.
 *
 * @param chartType - The chart type.
 * @returns The canonical Fusion widget DTO type.
 * @internal
 */
export function getFusionWidgetTypeFromChartType(chartType: ChartType): FusionWidgetType {
  // The declared return type predates the descriptor table; `undefined` is kept for chart types
  // without a Fusion DTO type rather than throwing.
  return descriptorByChartType.get(chartType)?.fusionType as FusionWidgetType;
}

/**
 * Returns the Fusion widget DTO type of a widget, read from the built-in widget descriptor table.
 *
 * @param widgetType - The widget type.
 * @param chartType - The chart type, required when `widgetType` is `'chart'`.
 * @param customWidgetType - The custom widget type, used when `widgetType` is `'custom'`.
 * @returns The Fusion widget DTO type.
 * @internal
 */
export function getFusionWidgetType(
  widgetType: WidgetType,
  chartType?: ChartType,
  customWidgetType?: string,
): FusionWidgetType {
  if (widgetType === 'chart') {
    if (!chartType) {
      throw new Error('chartType is required for chart widget type');
    }
    return getFusionWidgetTypeFromChartType(chartType);
  }
  if (widgetType === 'custom') {
    // Officially-supported plugin widgets (e.g. Tabber) map to their Fusion DTO type
    // (`'tabber-buttons'` → `'WidgetsTabber'`); other custom widgets pass through as-is.
    const officialPlugin =
      customWidgetType === undefined ? undefined : officialPluginByCsdkType.get(customWidgetType);
    return officialPlugin?.fusionType ?? customWidgetType ?? 'custom';
  }
  const descriptor: BuiltInWidgetDescriptor | undefined = BUILT_IN_WIDGET_DESCRIPTORS[widgetType];
  if (descriptor?.fusionType) {
    return descriptor.fusionType;
  }
  throw new TranslatableError('errors.widgetModel.unsupportedWidgetType', {
    widgetType,
  });
}

/**
 * Returns the widget type of a Fusion widget DTO type, read from the built-in widget descriptor table.
 *
 * Fusion types the table does not know are read as `'chart'`.
 *
 * @param fusionWidgetType - The Fusion widget DTO type.
 * @returns The widget type.
 * @internal
 */
export function getWidgetType(fusionWidgetType: FusionWidgetType): WidgetType {
  if (isCustomWidgetFusionWidget(fusionWidgetType)) {
    return 'custom';
  }
  const descriptor = descriptorByFusionType.get(fusionWidgetType);
  if (descriptor) {
    return descriptor.widgetType;
  }
  if (isChartFusionWidget(fusionWidgetType)) {
    return 'chart';
  }
  throw new TranslatableError('errors.widgetModel.unsupportedFusionWidgetType', {
    fusionWidgetType,
  });
}

/**
 * Returns the chart subtype of a Fusion widget subtype.
 *
 * @param widgetSubtype - The Fusion widget subtype.
 * @returns The chart subtype, or `undefined` when the subtype has no chart equivalent.
 * @internal
 */
export function getChartSubtype(widgetSubtype: WidgetSubtype): ChartSubtype | undefined {
  const widgetSubtypeToChartSubtype: Partial<Record<WidgetSubtype, ChartSubtype>> = {
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

/**
 * Checks whether a Fusion widget DTO type maps to a built-in widget type (canonical types and aliases).
 *
 * @param fusionWidgetType - The Fusion widget DTO type.
 * @returns `true` when the descriptor table knows the type.
 * @internal
 */
export function isSupportedWidgetType(
  fusionWidgetType: string,
): fusionWidgetType is FusionWidgetType {
  return descriptorByFusionType.has(fusionWidgetType);
}

/**
 * Check if the given fusion widget type is a supported plugin widget (in DTO format).
 *
 * @param fusionWidgetType - The fusion widget type from DTO.
 * @returns True if it's a supported plugin widget.
 * @internal
 */
export function isSupportedPluginFusionWidget(fusionWidgetType: string): boolean {
  return officialPluginByFusionType.has(fusionWidgetType);
}

/**
 * Check if the given CSDK widget type is a supported plugin widget (in CSDK format).
 *
 * @param csdkWidgetType - The CSDK custom widget type.
 * @returns True if it's a supported plugin widget.
 * @internal
 */
export function isSupportedPluginCsdkWidget(csdkWidgetType: string): boolean {
  return officialPluginByCsdkType.has(csdkWidgetType);
}

/**
 * Map a Fusion plugin widget type (DTO) to CSDK plugin widget type.
 *
 * @param fusionType - The Fusion plugin widget type from DTO.
 * @returns The corresponding CSDK plugin widget type.
 * @internal
 */
export function fusionPluginWidgetTypeToCsdk(
  fusionType: FusionPluginWidgetType,
): CsdkPluginWidgetType {
  const officialPlugin = officialPluginByFusionType.get(fusionType);
  if (!officialPlugin) {
    throw new TranslatableError('errors.unsupportedPluginWidgetType', { widgetType: fusionType });
  }
  return officialPlugin.csdkType;
}

/**
 * Map a CSDK plugin widget type to Fusion plugin widget type (DTO).
 *
 * @param csdkType - The CSDK plugin widget type.
 * @returns The corresponding Fusion plugin widget type for DTO.
 * @internal
 */
export function csdkPluginWidgetTypeToFusion(
  csdkType: CsdkPluginWidgetType,
): FusionPluginWidgetType {
  const officialPlugin = officialPluginByCsdkType.get(csdkType);
  if (!officialPlugin) {
    throw new TranslatableError('errors.unsupportedPluginWidgetType', { widgetType: csdkType });
  }
  return officialPlugin.fusionType;
}

/**
 * Returns the built-in widget key of a Fusion widget DTO type.
 *
 * @param fusionWidgetType - The Fusion widget DTO type.
 * @returns The built-in widget key, or `undefined` for unknown types.
 */
const keyOfFusionType = (fusionWidgetType: FusionWidgetType): BuiltInWidgetKey | undefined =>
  descriptorByFusionType.get(fusionWidgetType)?.key;

/**
 * Checks whether a Fusion widget DTO type is a table widget (`tablewidget` or `tablewidgetagg`).
 *
 * @param fusionWidgetType - The Fusion widget DTO type.
 * @returns `true` for table widget types.
 * @internal
 */
export function isTableFusionWidget(fusionWidgetType: FusionWidgetType): boolean {
  return keyOfFusionType(fusionWidgetType) === 'table';
}

/**
 * Checks whether a widget model is a table chart widget.
 *
 * @param widgetModel - The widget model.
 * @returns `true` for chart widgets with the `table` chart type.
 * @internal
 */
export function isTableWidgetModel(widgetModel: WidgetModel): boolean {
  return isChartWidget(widgetModel.widgetType) && widgetModel.chartType === 'table';
}

/**
 * Checks whether a Fusion widget DTO type is a pivot table widget (`pivot2` or `pivot`).
 *
 * @param fusionWidgetType - The Fusion widget DTO type.
 * @returns `true` for pivot table widget types.
 * @internal
 */
export function isPivotTableFusionWidget(fusionWidgetType: FusionWidgetType): boolean {
  return keyOfFusionType(fusionWidgetType) === 'pivot';
}

/**
 * Checks whether a widget type is the pivot table widget.
 *
 * @param widgetType - The widget type.
 * @returns `true` for `pivot`.
 * @internal
 */
export function isPivotWidget(widgetType: WidgetType) {
  return widgetType === 'pivot';
}

/**
 * Checks whether a Fusion widget DTO type is the text widget.
 *
 * @param fusionWidgetType - The Fusion widget DTO type.
 * @returns `true` for `richtexteditor`.
 * @internal
 */
export function isTextFusionWidget(fusionWidgetType: FusionWidgetType): boolean {
  return keyOfFusionType(fusionWidgetType) === 'text';
}

/**
 * Checks whether a widget type is the text widget.
 *
 * @param widgetType - The widget type.
 * @returns `true` for `text`.
 * @internal
 */
export function isTextWidget(widgetType: WidgetType) {
  return widgetType === 'text';
}

/**
 * Checks whether a Fusion widget type is the dashboard narrative widget.
 * @param fusionWidgetType - The Fusion widget type.
 * @returns `true` for `dashboardnarrative`.
 * @internal
 */
export function isNarrativeFusionWidget(fusionWidgetType: FusionWidgetType): boolean {
  return keyOfFusionType(fusionWidgetType) === 'narrative';
}

/**
 * Checks whether a widget type is the dashboard narrative widget.
 * @param widgetType - The widget type.
 * @returns `true` for `narrative`.
 * @internal
 */
export function isNarrativeWidget(widgetType: WidgetType) {
  return widgetType === 'narrative';
}

/**
 * Checks whether a widget type is the filter widget.
 * @param widgetType - The widget type.
 * @returns `true` for `filter`.
 * @internal
 */
export function isFilterWidget(widgetType: WidgetType) {
  return widgetType === 'filter';
}

/**
 * Type guard for the style of a text widget DTO.
 *
 * @param widgetStyle - The widget DTO style.
 * @returns Whether the style carries text widget HTML content.
 * @internal
 */
export function isTextWidgetDtoStyle(widgetStyle: WidgetStyle): widgetStyle is TextWidgetDtoStyle {
  return 'content' in widgetStyle && 'html' in widgetStyle.content;
}

/**
 * Checks whether a Fusion widget DTO type is the generic custom widget type.
 *
 * @param fusionWidgetType - The Fusion widget DTO type.
 * @returns `true` for `custom`.
 * @internal
 */
export function isCustomWidgetFusionWidget(fusionWidgetType: FusionWidgetType) {
  return fusionWidgetType === 'custom';
}

/**
 * Checks whether a widget type is the custom widget.
 *
 * @param widgetType - The widget type.
 * @returns `true` for `custom`.
 * @internal
 */
export function isCustomWidget(widgetType: WidgetType) {
  return widgetType === 'custom';
}

/**
 * Checks whether a Fusion widget DTO type is read as a chart: any type that is not filter, pivot,
 * text or narrative, including unknown types.
 *
 * @param fusionWidgetType - The Fusion widget DTO type.
 * @returns `true` for chart and unknown widget types.
 * @internal
 */
export function isChartFusionWidget(fusionWidgetType: FusionWidgetType) {
  return (
    fusionWidgetType !== 'filter' &&
    !isPivotTableFusionWidget(fusionWidgetType) &&
    !isTextFusionWidget(fusionWidgetType) &&
    !isNarrativeFusionWidget(fusionWidgetType)
  );
}

/**
 * Checks whether a Fusion widget DTO type is a known chart in the Fusion `chart/*` family
 * (for example `chart/line` or `chart/pie`).
 *
 * @param fusionWidgetType - The Fusion widget DTO type.
 * @returns `true` for known `chart/*` widget types.
 * @internal
 */
export function isChartTypeFusionWidget(fusionWidgetType: FusionWidgetType): boolean {
  return (
    descriptorByFusionType.get(fusionWidgetType)?.widgetType === 'chart' &&
    fusionWidgetType.startsWith('chart/')
  );
}

/**
 * Checks whether a Fusion widget DTO type is the pie chart.
 *
 * @param fusionWidgetType - The Fusion widget DTO type.
 * @returns `true` for `chart/pie`.
 * @internal
 */
export function isPieChartFusionWidget(fusionWidgetType: FusionWidgetType): boolean {
  return keyOfFusionType(fusionWidgetType) === 'pie';
}

/**
 * Checks whether a Fusion widget DTO type is the indicator chart.
 *
 * @param fusionWidgetType - The Fusion widget DTO type.
 * @returns `true` for `indicator`.
 * @internal
 */
export function isIndicatorFusionWidget(fusionWidgetType: FusionWidgetType): boolean {
  return keyOfFusionType(fusionWidgetType) === 'indicator';
}

/**
 * Checks whether a widget type is the chart widget.
 *
 * @param widgetType - The widget type.
 * @returns `true` for `chart`.
 * @internal
 */
export function isChartWidget(widgetType: WidgetType) {
  return widgetType === 'chart';
}

/**
 * Type guard for checking if the widget props is for a text widget.
 *
 * @param widgetProps - The widget props to check.
 * @returns Whether the widget props is for a text widget.
 * @internal
 */
export function isTextWidgetProps(
  widgetProps: CommonWidgetProps,
): widgetProps is WithCommonWidgetProps<TextWidgetProps, 'text'> {
  return widgetProps.widgetType === 'text';
}

/**
 * Type guard for checking if the widget props is for the dashboard narrative widget.
 * @param widgetProps - The widget props to check.
 * @returns Whether the widget props is for the dashboard narrative widget.
 * @internal
 */
export function isNarrativeWidgetProps(
  widgetProps: CommonWidgetProps,
): widgetProps is WithCommonWidgetProps<NarrativeWidgetProps, 'narrative'> {
  return widgetProps.widgetType === 'narrative';
}

/**
 * Type guard for checking if the widget props is for a pivot table widget.
 *
 * @param widgetProps - The widget props to check.
 * @returns Whether the widget props is for a pivot table widget.
 *
 * @sisenseInternal
 */
export function isPivotTableWidgetProps(
  widgetProps: CommonWidgetProps,
): widgetProps is WithCommonWidgetProps<PivotTableWidgetProps, 'pivot'> {
  return widgetProps.widgetType === 'pivot';
}

/**
 * Type guard for checking if the widget props is for a custom widget.
 *
 * @param widgetProps - The widget props to check.
 * @returns Whether the widget props is for a custom widget.
 * @internal
 * @sisenseInternal
 */
export function isCustomWidgetProps(
  widgetProps: CommonWidgetProps,
): widgetProps is WithCommonWidgetProps<CustomWidgetProps, 'custom'> {
  return widgetProps.widgetType === 'custom';
}

/**
 * Checks whether the widget props belong to a filter widget.
 *
 * @param widgetProps - The widget props to check.
 * @returns Whether the widget props belong to a filter widget.
 * @internal
 */
export function isFilterWidgetProps(
  widgetProps: CommonWidgetProps,
): widgetProps is WithCommonWidgetProps<FilterWidgetProps, 'filter'> {
  return widgetProps.widgetType === 'filter';
}

/**
 * Type guard for checking if the widget props is for a chart widget.
 *
 * @param widgetProps - The widget props to check.
 * @returns Whether the widget props is for a chart widget.
 * @sisenseInternal
 */
export function isChartWidgetProps(
  widgetProps: CommonWidgetProps,
): widgetProps is WithCommonWidgetProps<ChartWidgetProps, 'chart'> {
  return widgetProps.widgetType === 'chart';
}

/**
 * Returns the internal widget type of widget props: the chart type for chart widgets, the widget
 * type otherwise.
 *
 * @param widgetProps - The widget props.
 * @returns The internal widget type.
 * @internal
 */
export function getInternalWidgetType(widgetProps: CommonWidgetProps): WidgetTypeInternal {
  if (isPivotTableWidgetProps(widgetProps)) {
    return 'pivot';
  } else if (isCustomWidgetProps(widgetProps)) {
    return 'custom';
  } else if (isTextWidgetProps(widgetProps)) {
    return 'text';
  } else if (isNarrativeWidgetProps(widgetProps)) {
    return 'narrative';
  }

  return (widgetProps as WithCommonWidgetProps<ChartWidgetProps, 'chart'>).chartType;
}

/**
 * Registers new "onDataPointClick" handler for the Widget component.
 *
 * @param widgetProps - The widget props to extend in place.
 * @param handler - The handler combined with the existing one.
 * @internal
 */
export function registerDataPointClickHandler(
  widgetProps: WidgetProps,
  handler: NonNullable<
    | ChartProps['onDataPointClick']
    | PivotTableProps['onDataPointClick']
    | CustomWidgetEventProps['onDataPointClick']
  >,
): void {
  if (
    isChartWidgetProps(widgetProps) ||
    isPivotTableWidgetProps(widgetProps) ||
    isCustomWidgetProps(widgetProps)
  ) {
    widgetProps.onDataPointClick = combineHandlers([widgetProps.onDataPointClick, handler]);
  }
}

/**
 * Registers new "onDataPointContextMenu" handler for the Widget component.
 *
 * @param widgetProps - The widget props to extend in place.
 * @param handler - The handler combined with the existing one.
 * @internal
 */
export function registerDataPointContextMenuHandler(
  widgetProps: WidgetProps,
  handler: NonNullable<
    | ChartProps['onDataPointContextMenu']
    | PivotTableProps['onDataPointContextMenu']
    | CustomWidgetProps['onDataPointContextMenu']
  >,
): void {
  if (
    isChartWidgetProps(widgetProps) ||
    isPivotTableWidgetProps(widgetProps) ||
    isCustomWidgetProps(widgetProps)
  ) {
    widgetProps.onDataPointContextMenu = combineHandlers([
      widgetProps.onDataPointContextMenu,
      handler,
    ]);
  }
}

/**
 * Registers new "onDataPointsSelected" handler for the Widget component.
 *
 * @param widgetProps - The widget props to extend in place.
 * @param handler - The handler combined with the existing one.
 * @internal
 */
export function registerDataPointsSelectedHandler(
  widgetProps: WidgetProps,
  handler: NonNullable<
    ChartProps['onDataPointsSelected'] | CustomWidgetProps['onDataPointsSelected']
  >,
): void {
  if (isChartWidgetProps(widgetProps) || isCustomWidgetProps(widgetProps)) {
    widgetProps.onDataPointsSelected = combineHandlers([widgetProps.onDataPointsSelected, handler]);
  }
}

/**
 * Returns the enabled items of a widget DTO panel.
 *
 * @param panels - The widget DTO panels.
 * @param panelName - The name of the panel to read.
 * @returns The panel items that are not disabled; empty when the panel is missing.
 * @internal
 */
export function getEnabledPanelItems(panels: Panel[], panelName: string) {
  const panel = panels.find((p) => p.name === panelName);
  const panelItems = panel?.items ?? [];
  return panelItems.filter((item) => !item.disabled);
}

/**
 * Returns the root of a panel item chain, following `parent` links.
 *
 * @param item - The panel item.
 * @returns The root panel item.
 * @internal
 */
export function getRootPanelItem(item: PanelItem): PanelItem {
  return item.parent ? getRootPanelItem(item.parent) : item;
}
