import { expectTypeOf } from 'vitest';

import { TranslatableError } from '@/infra/translation/translatable-error';
import type { ChartType } from '@/types';

import type {
  CsdkPluginWidgetType,
  FusionPluginWidgetType,
} from '../components/widget-by-id/types';
import {
  csdkPluginWidgetTypeToFusion,
  fusionPluginWidgetTypeToCsdk,
  getChartType,
  getFusionWidgetType,
  getFusionWidgetTypeFromChartType,
  getWidgetType,
  isChartTypeFusionWidget,
  isIndicatorFusionWidget,
  isNarrativeFusionWidget,
  isPieChartFusionWidget,
  isPivotTableFusionWidget,
  isSupportedPluginCsdkWidget,
  isSupportedPluginFusionWidget,
  isSupportedWidgetType,
  isTableFusionWidget,
  isTextFusionWidget,
} from '../components/widget-by-id/utils';
import type { WidgetTypeInternal } from '../widget-model/types';
import {
  BUILT_IN_WIDGET_DESCRIPTORS,
  descriptorByChartType,
  descriptorByFusionType,
  fusionTypesOfKey,
  OFFICIAL_PLUGIN_WIDGETS,
  officialPluginByCsdkType,
  officialPluginByFusionType,
  SUPPORTED_FUSION_WIDGET_TYPES,
} from './descriptors';
import type { BuiltInWidgetDescriptor, BuiltInWidgetKey } from './types';

// Exhaustive and excess-free list of chart types, checked by `satisfies` against `ChartType`.
const CHART_TYPE_SET = {
  line: true,
  area: true,
  bar: true,
  column: true,
  polar: true,
  streamgraph: true,
  pie: true,
  funnel: true,
  treemap: true,
  sunburst: true,
  sankey: true,
  scatter: true,
  indicator: true,
  kpi: true,
  boxplot: true,
  scattermap: true,
  areamap: true,
  'calendar-heatmap': true,
  arearange: true,
  table: true,
} as const satisfies Record<ChartType, true>;
const isChartTypeKey = (key: string): key is ChartType => key in CHART_TYPE_SET;
const ALL_CHART_TYPES: readonly ChartType[] = Object.keys(CHART_TYPE_SET).filter(isChartTypeKey);

const ALL_DESCRIPTORS: readonly BuiltInWidgetDescriptor[] = Object.values(
  BUILT_IN_WIDGET_DESCRIPTORS,
);

const allFusionTypesOf = (descriptor: BuiltInWidgetDescriptor): readonly string[] => [
  ...(descriptor.fusionType === undefined ? [] : [descriptor.fusionType]),
  ...(descriptor.fusionTypeAliases ?? []),
];

describe('BUILT_IN_WIDGET_DESCRIPTORS', () => {
  it('has exactly one record per BuiltInWidgetKey, keyed by its own key', () => {
    expectTypeOf<keyof typeof BUILT_IN_WIDGET_DESCRIPTORS>().toEqualTypeOf<BuiltInWidgetKey>();
    // BuiltInWidgetKey is WidgetTypeInternal without 'custom', plus 'filter'; they must not drift apart.
    expectTypeOf<BuiltInWidgetKey>().toEqualTypeOf<
      Exclude<WidgetTypeInternal, 'custom'> | 'filter'
    >();
    Object.entries(BUILT_IN_WIDGET_DESCRIPTORS).forEach(([key, descriptor]) => {
      expect(descriptor.key).toBe(key);
    });
  });

  it('sets chartType equal to key on chart records', () => {
    ALL_DESCRIPTORS.filter(({ widgetType }) => widgetType === 'chart').forEach((descriptor) => {
      expect(descriptor.chartType).toBe(descriptor.key);
    });
  });

  it('omits chartType on non-chart records', () => {
    ALL_DESCRIPTORS.filter(({ widgetType }) => widgetType !== 'chart').forEach((descriptor) => {
      expect(descriptor.chartType).toBeUndefined();
    });
  });

  it('has a chart record for every ChartType', () => {
    ALL_CHART_TYPES.forEach((chartType) => {
      expect(descriptorByChartType.get(chartType)?.key).toBe(chartType);
    });
    expect(descriptorByChartType.size).toBe(ALL_CHART_TYPES.length);
  });

  it('does not use any Fusion type or alias in more than one record', () => {
    const allFusionTypes = ALL_DESCRIPTORS.flatMap(allFusionTypesOf);
    expect(new Set(allFusionTypes).size).toBe(allFusionTypes.length);
    expect(SUPPORTED_FUSION_WIDGET_TYPES).toHaveLength(allFusionTypes.length);
  });

  it('records the chart types that have no Fusion DTO type', () => {
    expect(BUILT_IN_WIDGET_DESCRIPTORS.streamgraph.fusionType).toBeUndefined();
    expect(BUILT_IN_WIDGET_DESCRIPTORS.arearange.fusionType).toBeUndefined();
  });
});

describe('fusionTypesOfKey', () => {
  it('returns the canonical type followed by aliases', () => {
    expect(fusionTypesOfKey('pivot')).toEqual(['pivot2', 'pivot']);
    expect(fusionTypesOfKey('table')).toEqual(['tablewidget', 'tablewidgetagg']);
    expect(fusionTypesOfKey('line')).toEqual(['chart/line']);
  });

  it('returns an empty list for types without a Fusion DTO type', () => {
    expect(fusionTypesOfKey('streamgraph')).toEqual([]);
    expect(fusionTypesOfKey('arearange')).toEqual([]);
  });
});

describe('OFFICIAL_PLUGIN_WIDGETS', () => {
  it('has no duplicate csdkType or fusionType', () => {
    const csdkTypes = OFFICIAL_PLUGIN_WIDGETS.map((plugin) => plugin.csdkType);
    const fusionTypes = OFFICIAL_PLUGIN_WIDGETS.map((plugin) => plugin.fusionType);
    expect(new Set(csdkTypes).size).toBe(csdkTypes.length);
    expect(new Set(fusionTypes).size).toBe(fusionTypes.length);
  });

  it('indexes every plugin by both types', () => {
    OFFICIAL_PLUGIN_WIDGETS.forEach((plugin) => {
      expect(officialPluginByCsdkType.get(plugin.csdkType)).toBe(plugin);
      expect(officialPluginByFusionType.get(plugin.fusionType)).toBe(plugin);
    });
    expect(officialPluginByCsdkType.size).toBe(OFFICIAL_PLUGIN_WIDGETS.length);
    expect(officialPluginByFusionType.size).toBe(OFFICIAL_PLUGIN_WIDGETS.length);
  });
});

// The widget-by-id utils are projections of the descriptor table; these tests pin the
// lookups they rely on and the cases the table deliberately leaves out.
describe('widget-by-id utils agree with the descriptor table', () => {
  it('isSupportedWidgetType accepts exactly the table Fusion types', () => {
    SUPPORTED_FUSION_WIDGET_TYPES.forEach((fusionType) => {
      expect(isSupportedWidgetType(fusionType)).toBe(true);
    });
  });

  it('isSupportedWidgetType rejects types that are not in the table', () => {
    const unsupported = ['custom', 'WidgetsTabber', 'chart/streamgraph', 'arearange', '', 'Pivot2'];
    unsupported.forEach((fusionType) => {
      expect(isSupportedWidgetType(fusionType)).toBe(false);
      expect(descriptorByFusionType.has(fusionType)).toBe(false);
    });
  });

  it('descriptorByChartType fusionType equals getFusionWidgetTypeFromChartType', () => {
    ALL_CHART_TYPES.forEach((chartType) => {
      expect(descriptorByChartType.get(chartType)?.fusionType).toBe(
        getFusionWidgetTypeFromChartType(chartType),
      );
    });
  });

  it('table writes its canonical tablewidget type and reads tablewidgetagg as an alias', () => {
    expect(getFusionWidgetTypeFromChartType('table')).toBe('tablewidget');
    expect(descriptorByChartType.get('table')?.fusionTypeAliases).toEqual(['tablewidgetagg']);
  });

  it('descriptorByFusionType matches getChartType and getWidgetType for every supported type', () => {
    SUPPORTED_FUSION_WIDGET_TYPES.forEach((fusionType) => {
      const descriptor = descriptorByFusionType.get(fusionType);
      expect(descriptor?.chartType).toBe(getChartType(fusionType));
      expect(descriptor?.widgetType).toBe(getWidgetType(fusionType));
    });
  });

  it('official plugin lookups match the tabber mapping functions', () => {
    OFFICIAL_PLUGIN_WIDGETS.forEach(({ csdkType, fusionType }) => {
      expect(fusionPluginWidgetTypeToCsdk(fusionType)).toBe(csdkType);
      expect(csdkPluginWidgetTypeToFusion(csdkType)).toBe(fusionType);
      expect(isSupportedPluginFusionWidget(fusionType)).toBe(true);
      expect(isSupportedPluginCsdkWidget(csdkType)).toBe(true);
    });
    ['tabber', 'custom', 'WidgetsTabber2'].forEach((type) => {
      expect(isSupportedPluginFusionWidget(type)).toBe(officialPluginByFusionType.has(type));
      expect(isSupportedPluginCsdkWidget(type)).toBe(officialPluginByCsdkType.has(type));
    });
  });
});

describe('widget-by-id utils as projections of the descriptor table', () => {
  it('round-trips every chart type that has a Fusion DTO type', () => {
    ALL_CHART_TYPES.filter((chartType) => fusionTypesOfKey(chartType).length > 0).forEach(
      (chartType) => {
        expect(getChartType(getFusionWidgetTypeFromChartType(chartType))).toBe(chartType);
      },
    );
  });

  it('returns undefined for chart types without a Fusion DTO type', () => {
    expect(getFusionWidgetTypeFromChartType('streamgraph')).toBeUndefined();
    expect(getFusionWidgetTypeFromChartType('arearange')).toBeUndefined();
    expect(getFusionWidgetTypeFromChartType('unknown' as ChartType)).toBeUndefined();
  });

  it('reads chart type aliases as the same chart type', () => {
    expect(getChartType('tablewidgetagg')).toBe('table');
    expect(getChartType('pivot2')).toBeUndefined();
    expect(getChartType('unknown')).toBeUndefined();
  });

  it('round-trips the widget type of every built-in with a Fusion DTO type', () => {
    ALL_DESCRIPTORS.filter(({ fusionType }) => fusionType !== undefined).forEach(
      ({ widgetType, chartType }) => {
        expect(getWidgetType(getFusionWidgetType(widgetType, chartType))).toBe(widgetType);
      },
    );
  });

  it('matches each key predicate to every Fusion type of that key and nothing else', () => {
    const predicates = [
      ['pivot', isPivotTableFusionWidget],
      ['text', isTextFusionWidget],
      ['narrative', isNarrativeFusionWidget],
      ['table', isTableFusionWidget],
      ['pie', isPieChartFusionWidget],
      ['indicator', isIndicatorFusionWidget],
    ] as const;
    predicates.forEach(([key, predicate]) => {
      SUPPORTED_FUSION_WIDGET_TYPES.forEach((fusionType) => {
        expect(predicate(fusionType)).toBe(descriptorByFusionType.get(fusionType)?.key === key);
      });
      expect(predicate('unknown')).toBe(false);
    });
  });

  it('isChartTypeFusionWidget matches known chart/* types only', () => {
    expect(SUPPORTED_FUSION_WIDGET_TYPES.filter(isChartTypeFusionWidget).sort()).toEqual(
      [
        'chart/area',
        'chart/bar',
        'chart/boxplot',
        'chart/column',
        'chart/funnel',
        'chart/line',
        'chart/pie',
        'chart/polar',
        'chart/scatter',
      ].sort(),
    );
    expect(isChartTypeFusionWidget('chart/unknown')).toBe(false);
  });

  it('throws for plugin widget types that are not official', () => {
    expect(() => fusionPluginWidgetTypeToCsdk('MyPlugin' as FusionPluginWidgetType)).toThrow(
      TranslatableError,
    );
    expect(() => csdkPluginWidgetTypeToFusion('my-plugin' as CsdkPluginWidgetType)).toThrow(
      TranslatableError,
    );
  });
});
