import {
  DEFAULT_INDICATOR_SIZE,
  DEFAULT_PIVOT_TABLE_SIZE,
  DEFAULT_TABLE_SIZE,
} from '@/shared/components/dynamic-size-container/default-sizes';
import type { ChartType } from '@/types';

import type { FusionWidgetType } from '../components/widget-by-id/types';
import {
  CHART_ABILITIES,
  CLICK_ONLY_INTERACTIONS,
  DRILLABLE_CHART_ABILITIES,
  NO_QUERY_ABILITIES,
  withAbilityOverrides,
} from './ability-defaults';
import type {
  BuiltInWidgetDescriptor,
  BuiltInWidgetKey,
  OfficialPluginWidgetDescriptor,
} from './types';

/**
 * One identity record per {@link BuiltInWidgetKey}, with the widget type's declared abilities.
 * A missing key is a compile error.
 *
 * `streamgraph` and `arearange` have no Fusion DTO type, so their `fusionType` is `undefined`.
 *
 * @internal
 */
export const BUILT_IN_WIDGET_DESCRIPTORS = {
  line: {
    key: 'line',
    widgetType: 'chart',
    chartType: 'line',
    fusionType: 'chart/line',
    abilities: DRILLABLE_CHART_ABILITIES,
  },
  area: {
    key: 'area',
    widgetType: 'chart',
    chartType: 'area',
    fusionType: 'chart/area',
    abilities: DRILLABLE_CHART_ABILITIES,
  },
  bar: {
    key: 'bar',
    widgetType: 'chart',
    chartType: 'bar',
    fusionType: 'chart/bar',
    abilities: DRILLABLE_CHART_ABILITIES,
  },
  column: {
    key: 'column',
    widgetType: 'chart',
    chartType: 'column',
    fusionType: 'chart/column',
    abilities: DRILLABLE_CHART_ABILITIES,
  },
  polar: {
    key: 'polar',
    widgetType: 'chart',
    chartType: 'polar',
    fusionType: 'chart/polar',
    abilities: DRILLABLE_CHART_ABILITIES,
  },
  streamgraph: {
    key: 'streamgraph',
    widgetType: 'chart',
    chartType: 'streamgraph',
    fusionType: undefined,
    abilities: DRILLABLE_CHART_ABILITIES,
  },
  pie: {
    key: 'pie',
    widgetType: 'chart',
    chartType: 'pie',
    fusionType: 'chart/pie',
    abilities: DRILLABLE_CHART_ABILITIES,
  },
  funnel: {
    key: 'funnel',
    widgetType: 'chart',
    chartType: 'funnel',
    fusionType: 'chart/funnel',
    abilities: DRILLABLE_CHART_ABILITIES,
  },
  treemap: {
    key: 'treemap',
    widgetType: 'chart',
    chartType: 'treemap',
    fusionType: 'treemap',
    abilities: DRILLABLE_CHART_ABILITIES,
  },
  sunburst: {
    key: 'sunburst',
    widgetType: 'chart',
    chartType: 'sunburst',
    fusionType: 'sunburst',
    abilities: DRILLABLE_CHART_ABILITIES,
  },
  sankey: {
    key: 'sankey',
    widgetType: 'chart',
    chartType: 'sankey',
    fusionType: 'sankey',
    abilities: DRILLABLE_CHART_ABILITIES,
  },
  scatter: {
    key: 'scatter',
    widgetType: 'chart',
    chartType: 'scatter',
    fusionType: 'chart/scatter',
    abilities: DRILLABLE_CHART_ABILITIES,
  },
  indicator: {
    key: 'indicator',
    widgetType: 'chart',
    chartType: 'indicator',
    fusionType: 'indicator',
    abilities: withAbilityOverrides(CHART_ABILITIES, {
      interactions: CLICK_ONLY_INTERACTIONS,
      // No selectable attributes: dashboard selections always filter it.
      highlights: false,
      layout: { defaultSize: DEFAULT_INDICATOR_SIZE },
    }),
  },
  kpi: {
    key: 'kpi',
    widgetType: 'chart',
    chartType: 'kpi',
    fusionType: 'kpi',
    abilities: withAbilityOverrides(CHART_ABILITIES, {
      interactions: ['dataPointClick', 'dataPointContextMenu'],
      // No selectable attributes: dashboard selections always filter it.
      highlights: false,
    }),
  },
  boxplot: {
    key: 'boxplot',
    widgetType: 'chart',
    chartType: 'boxplot',
    fusionType: 'chart/boxplot',
    abilities: DRILLABLE_CHART_ABILITIES,
  },
  scattermap: {
    key: 'scattermap',
    widgetType: 'chart',
    chartType: 'scattermap',
    fusionType: 'map/scatter',
    abilities: withAbilityOverrides(CHART_ABILITIES, { interactions: CLICK_ONLY_INTERACTIONS }),
  },
  areamap: {
    key: 'areamap',
    widgetType: 'chart',
    chartType: 'areamap',
    fusionType: 'map/area',
    abilities: withAbilityOverrides(CHART_ABILITIES, { interactions: CLICK_ONLY_INTERACTIONS }),
  },
  'calendar-heatmap': {
    key: 'calendar-heatmap',
    widgetType: 'chart',
    chartType: 'calendar-heatmap',
    fusionType: 'heatmap',
    abilities: CHART_ABILITIES,
  },
  arearange: {
    key: 'arearange',
    widgetType: 'chart',
    chartType: 'arearange',
    fusionType: undefined,
    abilities: DRILLABLE_CHART_ABILITIES,
  },
  table: {
    key: 'table',
    widgetType: 'chart',
    chartType: 'table',
    fusionType: 'tablewidget',
    fusionTypeAliases: ['tablewidgetagg'],
    abilities: withAbilityOverrides(CHART_ABILITIES, {
      // The table renderer emits no data-point events and never renders highlights.
      interactions: [],
      highlights: false,
      layout: { autoHeight: true, defaultSize: DEFAULT_TABLE_SIZE },
    }),
  },
  pivot: {
    key: 'pivot',
    widgetType: 'pivot',
    fusionType: 'pivot2',
    fusionTypeAliases: ['pivot'],
    abilities: withAbilityOverrides(CHART_ABILITIES, {
      interactions: ['dataPointClick', 'dataPointContextMenu'],
      drilldown: true,
      layout: { autoHeight: true, defaultSize: DEFAULT_PIVOT_TABLE_SIZE },
    }),
  },
  text: {
    key: 'text',
    widgetType: 'text',
    fusionType: 'richtexteditor',
    abilities: withAbilityOverrides(NO_QUERY_ABILITIES, { interactions: ['widgetClick'] }),
  },
  narrative: {
    key: 'narrative',
    widgetType: 'narrative',
    fusionType: 'dashboardnarrative',
    abilities: withAbilityOverrides(NO_QUERY_ABILITIES, { layout: { autoHeight: true } }),
  },
  filter: {
    key: 'filter',
    widgetType: 'filter',
    fusionType: 'filter',
    abilities: withAbilityOverrides(NO_QUERY_ABILITIES, { data: 'members' }),
  },
} as const satisfies Record<BuiltInWidgetKey, BuiltInWidgetDescriptor>;

/**
 * SDK-shipped widgets that travel as Fusion plugin widget DTOs.
 *
 * @internal
 */
export const OFFICIAL_PLUGIN_WIDGETS = [
  { csdkType: 'tabber-buttons', fusionType: 'WidgetsTabber' },
] as const satisfies readonly OfficialPluginWidgetDescriptor[];

const ALL_DESCRIPTORS: readonly BuiltInWidgetDescriptor[] = Object.values(
  BUILT_IN_WIDGET_DESCRIPTORS,
);

const fusionTypesOfDescriptor = (
  descriptor: BuiltInWidgetDescriptor,
): readonly FusionWidgetType[] => [
  ...(descriptor.fusionType === undefined ? [] : [descriptor.fusionType]),
  ...(descriptor.fusionTypeAliases ?? []),
];

/**
 * Descriptor lookup by Fusion DTO `type`, covering every canonical `fusionType` and every alias.
 *
 * @internal
 */
export const descriptorByFusionType: ReadonlyMap<string, BuiltInWidgetDescriptor> = new Map(
  ALL_DESCRIPTORS.flatMap((descriptor) =>
    fusionTypesOfDescriptor(descriptor).map((fusionType) => [fusionType, descriptor] as const),
  ),
);

/**
 * Descriptor lookup by chart type, covering every built-in chart widget type.
 *
 * @internal
 */
export const descriptorByChartType: ReadonlyMap<ChartType, BuiltInWidgetDescriptor> = new Map(
  ALL_DESCRIPTORS.flatMap((descriptor) =>
    descriptor.chartType === undefined ? [] : [[descriptor.chartType, descriptor] as const],
  ),
);

/**
 * Every Fusion DTO `type` that maps to a built-in widget type (canonical types and aliases).
 *
 * @internal
 */
export const SUPPORTED_FUSION_WIDGET_TYPES: readonly FusionWidgetType[] = Object.freeze([
  ...descriptorByFusionType.keys(),
]);

/**
 * Returns the Fusion DTO types of a built-in widget type, canonical `fusionType` first, then aliases.
 * The list is empty for types without a Fusion DTO type.
 *
 * @param key - The built-in widget key.
 * @returns The Fusion DTO types read as this widget type.
 * @internal
 */
export function fusionTypesOfKey(key: BuiltInWidgetKey): readonly FusionWidgetType[] {
  const descriptor: BuiltInWidgetDescriptor | undefined = BUILT_IN_WIDGET_DESCRIPTORS[key];
  return descriptor ? fusionTypesOfDescriptor(descriptor) : [];
}

/**
 * Official plugin widget lookup by Compose SDK custom widget type.
 *
 * @internal
 */
export const officialPluginByCsdkType: ReadonlyMap<string, OfficialPluginWidgetDescriptor> =
  new Map(OFFICIAL_PLUGIN_WIDGETS.map((plugin) => [plugin.csdkType, plugin] as const));

/**
 * Official plugin widget lookup by Fusion plugin widget DTO type.
 *
 * @internal
 */
export const officialPluginByFusionType: ReadonlyMap<string, OfficialPluginWidgetDescriptor> =
  new Map(OFFICIAL_PLUGIN_WIDGETS.map((plugin) => [plugin.fusionType, plugin] as const));
