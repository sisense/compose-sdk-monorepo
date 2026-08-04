/** @vitest-environment jsdom */
import type {
  DashboardConfig as DashboardConfigPreact,
  DashboardHeaderItemComponent as DashboardHeaderItemComponentPreact,
  DashboardLayoutOptions,
  DashboardProps as DashboardPropsPreact,
  DashboardResolvedHeaderItem as DashboardResolvedHeaderItemPreact,
  WidgetsOptions,
} from '@sisense/sdk-ui-preact';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DashboardHeaderItemComponent } from '../components/dashboard/dashboard-header-config';
import type {
  DashboardConfig,
  DashboardProps as DashboardPropsAngular,
} from '../components/dashboard/dashboard.component';
import type { WidgetProps } from '../components/widgets';
import { ComponentTranslator } from '../services/component-translator.service';
import type { DynamicRenderer } from '../services/dynamic-renderer.service';
import {
  toDashboardByIdProps,
  toDashboardProps,
  toPreactDashboardByIdProps,
  toPreactDashboardProps,
} from './dashboard-props-preact-translator';
import { toPreactWidgetProps, toWidgetProps } from './widget-props-preact-translator';

vi.mock('./widget-props-preact-translator', () => ({
  toPreactWidgetProps: vi.fn((props) => ({ ...props, translated: true })),
  toWidgetProps: vi.fn((props) => ({ ...props, translated: true })),
}));

// the renderer is only consumed lazily when a wrapped item mounts, which these tests never do
const createComponentTranslator = () => new ComponentTranslator({} as DynamicRenderer);

const toPreactWidgetPropsMock = vi.mocked(toPreactWidgetProps);
const toWidgetPropsMock = vi.mocked(toWidgetProps);

describe('dashboard-props-preact-translator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('toPreactDashboardProps', () => {
    it('should convert Angular DashboardProps to Preact DashboardProps', () => {
      const angularProps: DashboardPropsAngular = {
        title: 'Test Dashboard',
        widgets: [
          {
            id: 'widget-1',
            widgetType: 'chart',
            chartType: 'column',
            dataSource: 'Sample ECommerce',
            dataOptions: {
              category: [],
              value: [],
            },
          },
          {
            id: 'widget-2',
            widgetType: 'pivot',
            dataSource: 'Sample ECommerce',
            dataOptions: {
              rows: [],
              columns: [],
              values: [],
            },
          },
        ] as WidgetProps[],
        layoutOptions: {} as DashboardLayoutOptions,
      };

      const result = toPreactDashboardProps(angularProps);

      expect(result).toEqual({
        title: 'Test Dashboard',
        widgets: [
          { ...angularProps.widgets[0], translated: true },
          { ...angularProps.widgets[1], translated: true },
        ],
        layoutOptions: {} as DashboardLayoutOptions,
      });
      expect(toPreactWidgetPropsMock).toHaveBeenCalledTimes(2);
      expect(toPreactWidgetPropsMock).toHaveBeenNthCalledWith(
        1,
        angularProps.widgets[0],
        expect.any(Number),
        expect.any(Array),
      );
      expect(toPreactWidgetPropsMock).toHaveBeenNthCalledWith(
        2,
        angularProps.widgets[1],
        expect.any(Number),
        expect.any(Array),
      );
    });

    it('should preserve all non-widget props', () => {
      const angularProps: DashboardPropsAngular = {
        title: 'My Dashboard',
        widgets: [],
        filters: [],
        defaultDataSource: 'Sample ECommerce',
        config: {} as DashboardConfig,
        layoutOptions: {} as DashboardLayoutOptions,
        widgetsOptions: {} as WidgetsOptions,
        styleOptions: { backgroundColor: 'white' },
      };

      const result = toPreactDashboardProps(angularProps);

      expect(result.title).toBe('My Dashboard');
      expect(result.filters).toEqual([]);
      expect(result.defaultDataSource).toBe('Sample ECommerce');
      expect(result.config).toEqual({});
      expect(result.layoutOptions).toEqual({});
      expect(result.widgetsOptions).toEqual({});
      expect(result.styleOptions).toEqual({ backgroundColor: 'white' });
    });

    it('should handle empty widgets array', () => {
      const angularProps: DashboardPropsAngular = {
        title: 'Empty Dashboard',
        widgets: [],
      };

      const result = toPreactDashboardProps(angularProps);

      expect(result).toEqual({
        title: 'Empty Dashboard',
        widgets: [],
      });
      expect(toPreactWidgetPropsMock).not.toHaveBeenCalled();
    });

    it('should handle single widget', () => {
      const angularProps: DashboardPropsAngular = {
        title: 'Single Widget Dashboard',
        widgets: [
          {
            id: 'widget-1',
            widgetType: 'chart',
            chartType: 'bar',
            dataSource: 'Sample ECommerce',
            dataOptions: {
              category: [],
              value: [],
            },
          },
        ] as WidgetProps[],
      };

      const result = toPreactDashboardProps(angularProps);

      expect(result.widgets).toHaveLength(1);
      expect(toPreactWidgetPropsMock).toHaveBeenCalledTimes(1);
      expect(toPreactWidgetPropsMock).toHaveBeenCalledWith(
        angularProps.widgets[0],
        expect.any(Number),
        expect.any(Array),
      );
    });
  });

  describe('toDashboardProps', () => {
    it('should convert Preact DashboardProps to Angular DashboardProps', () => {
      const preactProps: DashboardPropsPreact = {
        title: 'Test Dashboard',
        widgets: [
          {
            id: 'widget-1',
            widgetType: 'chart',
            chartType: 'column',
          },
          {
            id: 'widget-2',
            widgetType: 'text',
          },
        ] as any,
        layoutOptions: {} as DashboardLayoutOptions,
      };

      const result = toDashboardProps(preactProps);

      expect(result).toEqual({
        title: 'Test Dashboard',
        widgets: [
          { ...preactProps.widgets[0], translated: true },
          { ...preactProps.widgets[1], translated: true },
        ],
        layoutOptions: {} as DashboardLayoutOptions,
      });
      expect(toWidgetPropsMock).toHaveBeenCalledTimes(2);
      expect(toWidgetPropsMock).toHaveBeenNthCalledWith(
        1,
        preactProps.widgets[0],
        expect.any(Number),
        expect.any(Array),
      );
      expect(toWidgetPropsMock).toHaveBeenNthCalledWith(
        2,
        preactProps.widgets[1],
        expect.any(Number),
        expect.any(Array),
      );
    });

    it('should preserve all non-widget props', () => {
      const preactProps: DashboardPropsPreact = {
        title: 'My Dashboard',
        widgets: [],
        filters: [],
        defaultDataSource: 'Sample Healthcare',
        config: {} as DashboardConfigPreact,
        layoutOptions: {} as DashboardLayoutOptions,
        widgetsOptions: {} as WidgetsOptions,
        styleOptions: { backgroundColor: 'black' },
      };

      const result = toDashboardProps(preactProps);

      expect(result.title).toBe('My Dashboard');
      expect(result.filters).toEqual([]);
      expect(result.defaultDataSource).toBe('Sample Healthcare');
      expect(result.config).toEqual({});
      expect(result.layoutOptions).toEqual({});
      expect(result.widgetsOptions).toEqual({});
      expect(result.styleOptions).toEqual({ backgroundColor: 'black' });
    });

    it('should handle empty widgets array', () => {
      const preactProps: DashboardPropsPreact = {
        title: 'Empty Dashboard',
        widgets: [],
      };

      const result = toDashboardProps(preactProps);

      expect(result).toEqual({
        title: 'Empty Dashboard',
        widgets: [],
      });
      expect(toWidgetPropsMock).not.toHaveBeenCalled();
    });

    it('should handle multiple widgets', () => {
      const preactProps: DashboardPropsPreact = {
        title: 'Multi Widget Dashboard',
        widgets: [
          {
            id: 'widget-1',
            widgetType: 'chart',
          },
          {
            id: 'widget-2',
            widgetType: 'pivot',
          },
          {
            id: 'widget-3',
            widgetType: 'text',
          },
        ] as any,
      };

      const result = toDashboardProps(preactProps);

      expect(result.widgets).toHaveLength(3);
      expect(toWidgetPropsMock).toHaveBeenCalledTimes(3);
      preactProps.widgets.forEach((widget, index) => {
        expect(toWidgetPropsMock).toHaveBeenNthCalledWith(
          index + 1,
          widget,
          expect.any(Number),
          expect.any(Array),
        );
      });
    });
  });

  describe('config.header', () => {
    class TestHeaderItemComponent {
      size = { width: 0, height: 0 };
    }

    class InjectedHeaderItemComponent {
      size = { width: 0, height: 0 };
    }

    const headerItemComponent = TestHeaderItemComponent as DashboardHeaderItemComponent;
    const injectedItemComponent = InjectedHeaderItemComponent as DashboardHeaderItemComponent;

    const builtInComponent: DashboardHeaderItemComponentPreact = () => null;
    const builtInItem: DashboardResolvedHeaderItemPreact = {
      id: 'built-in',
      component: builtInComponent,
    };

    describe('without a component translator (structure only)', () => {
      it('carries item components through unchanged', () => {
        const result = toPreactDashboardProps({
          widgets: [],
          config: { header: { items: [{ id: 'my-item', component: headerItemComponent }] } },
        });

        expect(result.config?.header?.items?.[0].component).toBe(headerItemComponent);
      });

      it('renames beforeRender to onBeforeRender and passes items through unchanged', () => {
        let receivedComponent: unknown;
        const result = toPreactDashboardProps({
          widgets: [],
          config: {
            header: {
              beforeRender: (items) => {
                receivedComponent = items[0].component;
                return [...items];
              },
            },
          },
        });

        const transformed = result.config?.header?.onBeforeRender?.([builtInItem]);

        expect(result.config?.header).not.toHaveProperty('beforeRender');
        expect(receivedComponent).toBe(builtInComponent);
        expect(transformed?.[0].component).toBe(builtInComponent);
      });

      it('renames onBeforeRender to beforeRender in the reverse direction', () => {
        const onBeforeRender = vi.fn((items: ReadonlyArray<DashboardResolvedHeaderItemPreact>) => [
          ...items,
        ]);

        const result = toDashboardProps({
          widgets: [],
          config: { header: { onBeforeRender } } as DashboardConfigPreact,
        });

        expect(result.config?.header).not.toHaveProperty('onBeforeRender');
        expect(result.config?.header?.beforeRender).toBeInstanceOf(Function);
        result.config?.header?.beforeRender?.([]);
        expect(onBeforeRender).toHaveBeenCalledTimes(1);
      });
    });

    describe('with a component translator', () => {
      it('wraps item components in preact components', () => {
        const result = toPreactDashboardProps(
          {
            widgets: [],
            config: { header: { items: [{ id: 'my-item', component: headerItemComponent }] } },
          },
          createComponentTranslator(),
        );

        const component = result.config?.header?.items?.[0].component;
        expect(typeof component).toBe('function');
        expect(component).not.toBe(headerItemComponent);
      });

      it('keeps a stable wrapped component identity across conversions', () => {
        const componentTranslator = createComponentTranslator();
        const angularProps = {
          widgets: [],
          config: { header: { items: [{ id: 'my-item', component: headerItemComponent }] } },
        };

        const first = toPreactDashboardProps(angularProps, componentTranslator);
        const second = toPreactDashboardProps(angularProps, componentTranslator);

        expect(first.config?.header?.items?.[0].component).toBe(
          second.config?.header?.items?.[0].component,
        );
      });

      it('resolves wrapped components back to the Angular class', () => {
        const componentTranslator = createComponentTranslator();
        const preactProps = toPreactDashboardProps(
          {
            widgets: [],
            config: { header: { items: [{ id: 'my-item', component: headerItemComponent }] } },
          },
          componentTranslator,
        );

        const angularProps = toDashboardProps(preactProps, componentTranslator);

        expect(angularProps.config?.header?.items?.[0].component).toBe(headerItemComponent);
      });

      it('hands beforeRender the consumer own Angular component class', () => {
        const componentTranslator = createComponentTranslator();
        let receivedComponent: unknown;
        const result = toPreactDashboardProps(
          {
            widgets: [],
            config: {
              header: {
                items: [{ id: 'my-item', component: headerItemComponent }],
                beforeRender: (items) => {
                  receivedComponent = items.find((item) => item.id === 'my-item')?.component;
                  return [...items];
                },
              },
            },
          },
          componentTranslator,
        );
        const wrappedComponent = result.config?.header?.items?.[0]
          .component as DashboardHeaderItemComponentPreact;

        result.config?.header?.onBeforeRender?.([
          builtInItem,
          { id: 'my-item', component: wrappedComponent },
        ]);

        expect(receivedComponent).toBe(headerItemComponent);
      });

      it('exposes a built-in item as an Angular component and unwraps it on the way back', () => {
        let receivedComponent: unknown;
        let receivedIds: string[] = [];
        const result = toPreactDashboardProps(
          {
            widgets: [],
            config: {
              header: {
                beforeRender: (items) => {
                  receivedComponent = items[0].component;
                  receivedIds = items.map((item) => item.id);
                  return [...items];
                },
              },
            },
          },
          createComponentTranslator(),
        );

        const transformed = result.config?.header?.onBeforeRender?.([builtInItem]);

        // the consumer gets a real Angular component class wrapping the built-in renderer
        expect(typeof receivedComponent).toBe('function');
        expect(receivedComponent).not.toBe(builtInComponent);
        expect(receivedIds).toEqual(['built-in']);
        // and it is unwrapped, not wrapped a second time, on the way back to the renderer
        expect(transformed?.[0].component).toBe(builtInComponent);
      });

      it('wraps Angular components newly injected by beforeRender', () => {
        const result = toPreactDashboardProps(
          {
            widgets: [],
            config: {
              header: {
                beforeRender: (items) => [
                  ...items,
                  { id: 'injected', component: injectedItemComponent },
                ],
              },
            },
          },
          createComponentTranslator(),
        );

        const transformed = result.config?.header?.onBeforeRender?.([builtInItem]);

        expect(transformed).toHaveLength(2);
        expect(transformed?.[0].component).toBe(builtInComponent);
        expect(typeof transformed?.[1].component).toBe('function');
        expect(transformed?.[1].component).not.toBe(injectedItemComponent);
      });

      it('supports removing built-in items', () => {
        const result = toPreactDashboardProps(
          {
            widgets: [],
            config: {
              header: { beforeRender: (items) => items.filter((item) => item.id !== 'built-in') },
            },
          },
          createComponentTranslator(),
        );

        expect(result.config?.header?.onBeforeRender?.([builtInItem])).toEqual([]);
      });

      it('omits onBeforeRender when the consumer provided no transform', () => {
        const result = toPreactDashboardProps(
          {
            widgets: [],
            config: { header: { items: [{ id: 'my-item', component: headerItemComponent }] } },
          },
          createComponentTranslator(),
        );

        expect(result.config?.header).not.toHaveProperty('onBeforeRender');
      });
    });
  });

  describe('DashboardById props', () => {
    class ByIdHeaderItemComponent {
      size = { width: 0, height: 0 };
    }

    const headerItemComponent = ByIdHeaderItemComponent as DashboardHeaderItemComponent;

    it('wraps header item components when a translator is provided', () => {
      const result = toPreactDashboardByIdProps(
        {
          dashboardOid: 'oid-1',
          config: { header: { items: [{ id: 'my-item', component: headerItemComponent }] } },
        },
        createComponentTranslator(),
      );

      expect(result.dashboardOid).toBe('oid-1');
      expect(typeof result.config?.header?.items?.[0].component).toBe('function');
      expect(result.config?.header?.items?.[0].component).not.toBe(headerItemComponent);
    });

    it('carries header item components through without a translator', () => {
      const result = toPreactDashboardByIdProps({
        dashboardOid: 'oid-1',
        config: { header: { items: [{ id: 'my-item', component: headerItemComponent }] } },
      });

      expect(result.config?.header?.items?.[0].component).toBe(headerItemComponent);
    });

    it('omits a missing config', () => {
      expect('config' in toPreactDashboardByIdProps({ dashboardOid: 'oid-1' })).toBe(false);
      expect('config' in toDashboardByIdProps({ dashboardOid: 'oid-1' })).toBe(false);
    });

    it('round-trips the header items back to the Angular class', () => {
      const componentTranslator = createComponentTranslator();
      const preactProps = toPreactDashboardByIdProps(
        {
          dashboardOid: 'oid-1',
          config: { header: { items: [{ id: 'my-item', component: headerItemComponent }] } },
        },
        componentTranslator,
      );

      const angularProps = toDashboardByIdProps(preactProps, componentTranslator);

      expect(angularProps.config?.header?.items?.[0].component).toBe(headerItemComponent);
    });
  });
});
