import { vi } from 'vitest';

import type { WidgetProps } from '@/domains/widgets/components/widget/types';
import { WidgetHeaderTargets } from '@/domains/widgets/shared/widget-header/widget-header-targets';
import {
  BUILT_IN_WIDGET_DESCRIPTORS,
  type BuiltInWidgetKey,
  fusionTypesOfKey,
} from '@/domains/widgets/widget-identity/index.js';
import type { BeforeRenderHandler, HighchartsOptions } from '@/props';

import { applyJtdToWidget } from '../use-jtd.js';
import {
  isJtdApplicableWidget,
  JTD_APPLICABLE_WIDGET_KEYS,
  JTD_SUPPORTED_WIDGET_KEYS,
  widgetTypeSupportsJtd,
} from './jtd-supported-widget-keys.js';
import type { JtdConfig, TriggerMethod } from './jtd-types.js';

const ALL_BUILT_IN_KEYS = Object.keys(BUILT_IN_WIDGET_DESCRIPTORS) as BuiltInWidgetKey[];

/** Minimal widget props for a built-in widget key. */
const widgetPropsOfKey = (key: BuiltInWidgetKey): WidgetProps => {
  const { widgetType, chartType } = BUILT_IN_WIDGET_DESCRIPTORS[key] as {
    widgetType: WidgetProps['widgetType'];
    chartType?: string;
  };
  return (
    chartType === undefined
      ? { id: `widget-${key}`, widgetType, dataOptions: {}, styleOptions: {} }
      : { id: `widget-${key}`, widgetType, chartType, dataOptions: {} }
  ) as WidgetProps;
};

const customWidgetProps = {
  id: 'widget-custom',
  widgetType: 'custom',
  customWidgetType: 'my-widget',
  dataOptions: {},
} as unknown as WidgetProps;

const jtdConfigOf = (navigateType: TriggerMethod): JtdConfig => ({
  enabled: true,
  navigateType,
  jumpTargets: [{ id: 'target-dashboard', caption: 'Target' }],
  includeDashFilterDims: [],
  includeWidgetFilterDims: [],
  showJtdIcon: true,
});

const applyJtd = (widgetProps: WidgetProps, navigateType: TriggerMethod) =>
  applyJtdToWidget(widgetProps, {
    normalizedJtdConfig: jtdConfigOf(navigateType),
    dashboardFilters: [],
    originalWidgetFilters: [],
    actions: { openModal: vi.fn(), openMenu: vi.fn(), translate: vi.fn() },
  }) as WidgetProps & {
    onDataPointClick?: unknown;
    onDataPointContextMenu?: unknown;
    onBeforeRender?: BeforeRenderHandler;
  };

const hasJtdIcon = (widgetProps: WidgetProps) =>
  (widgetProps.config?.header?.items ?? []).some((item) => item.id === WidgetHeaderTargets.JtdIcon);

describe('JTD widget type lists decide every JTD surface', () => {
  it('applies at run time to every built-in chart type plus pivot and text', () => {
    const chartKeys = ALL_BUILT_IN_KEYS.filter(
      (key) => BUILT_IN_WIDGET_DESCRIPTORS[key].widgetType === 'chart',
    );
    expect([...JTD_APPLICABLE_WIDGET_KEYS].sort()).toEqual([...chartKeys, 'pivot', 'text'].sort());
  });

  it('loads only types that also apply at run time', () => {
    JTD_SUPPORTED_WIDGET_KEYS.forEach((key) => {
      expect(JTD_APPLICABLE_WIDGET_KEYS).toContain(key);
    });
  });

  describe.each(ALL_BUILT_IN_KEYS)('built-in widget %s', (key) => {
    const loadable = JTD_SUPPORTED_WIDGET_KEYS.includes(key);
    const applicable = JTD_APPLICABLE_WIDGET_KEYS.includes(key);
    const widgetProps = widgetPropsOfKey(key);

    it('restores a saved JTD config exactly when it is in the loading list', () => {
      fusionTypesOfKey(key).forEach((fusionType) => {
        expect(widgetTypeSupportsJtd(fusionType)).toBe(loadable);
      });
    });

    it('is applicable at run time exactly when it is in the run-time list', () => {
      expect(isJtdApplicableWidget(widgetProps)).toBe(applicable);
    });

    it('gets click navigation exactly when it is in the run-time list', () => {
      expect(applyJtd(widgetProps, 'click').onDataPointClick !== undefined).toBe(applicable);
    });

    it('gets right-click navigation exactly when it is in the run-time list (text has no right-click trigger)', () => {
      expect(applyJtd(widgetProps, 'rightclick').onDataPointContextMenu !== undefined).toBe(
        applicable && key !== 'text',
      );
    });

    it('gets the pointer cursor exactly when it is a chart in the run-time list', () => {
      const isChart = BUILT_IN_WIDGET_DESCRIPTORS[key].widgetType === 'chart';
      expect(
        applyJtd(widgetProps, 'click').onBeforeRender?.({} as HighchartsOptions)?.plotOptions
          ?.series?.cursor === 'pointer',
      ).toBe(applicable && isChart);
    });

    it.each<TriggerMethod>(['click', 'rightclick'])(
      'gets the JTD icon with %s navigation exactly when it is in the run-time list',
      (navigateType) => {
        expect(hasJtdIcon(applyJtd(widgetProps, navigateType))).toBe(applicable);
      },
    );
  });

  it('never applies JTD to custom widgets', () => {
    expect(isJtdApplicableWidget(customWidgetProps)).toBe(false);
    expect(applyJtd(customWidgetProps, 'click')).toBe(customWidgetProps);
    expect(applyJtd(customWidgetProps, 'rightclick')).toBe(customWidgetProps);
  });
});
