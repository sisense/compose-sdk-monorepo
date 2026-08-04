/** @vitest-environment jsdom */
import type {
  DashboardHeaderItemComponent as DashboardHeaderItemComponentPreact,
  DashboardResolvedHeaderItem as DashboardResolvedHeaderItemPreact,
} from '@sisense/sdk-ui-preact';
import { describe, expect, it } from 'vitest';
import { defineComponent, ref } from 'vue';

import type { DashboardConfig } from '../components/dashboard/dashboard';
import type { DashboardHeaderItemComponent } from '../components/dashboard/dashboard-header-config';
import { createComponentTranslator } from './component-translator';
import {
  toDashboardByIdProps,
  toDashboardProps,
  toPreactDashboardByIdProps,
  toPreactDashboardProps,
} from './dashboard-props-preact-translator';
import type { VueComponentAdapterContexts } from './vue-component-adapter';

// context refs are only consumed lazily when a wrapped item mounts, which these tests never do
const contexts = {
  sisenseContext: ref({}),
  themeContext: ref({}),
  customWidgetsContext: ref({}),
} as unknown as VueComponentAdapterContexts;

const createTranslator = () => createComponentTranslator(contexts);

// Minimal stand-in header item components. A real item declares the `size` prop (e.g. via
// `defineProps<DashboardHeaderItemComponentProps>()`); these stubs are only registered and
// converted, never mounted, so they are cast to the public component type to keep the test
// focused on the conversion logic.
const headerItemComponent = defineComponent({
  name: 'TestHeaderItem',
  setup: () => () => null,
}) as unknown as DashboardHeaderItemComponent;

const injectedItemComponent = defineComponent({
  name: 'InjectedHeaderItem',
  setup: () => () => null,
}) as unknown as DashboardHeaderItemComponent;

const builtInComponent: DashboardHeaderItemComponentPreact = () => null;
const builtInItem: DashboardResolvedHeaderItemPreact = {
  id: 'built-in',
  component: builtInComponent,
};

describe('dashboard-props-preact-translator', () => {
  describe('toPreactDashboardProps', () => {
    it('preserves props and sibling config sections', () => {
      const result = toPreactDashboardProps({
        title: 'My dashboard',
        widgets: [],
        config: { toolbar: { visible: true }, header: { visible: true } },
      });

      expect(result.title).toBe('My dashboard');
      expect(result.config?.toolbar).toEqual({ visible: true });
      expect(result.config?.header?.visible).toBe(true);
    });

    it('omits props without a config entirely', () => {
      const result = toPreactDashboardProps({ widgets: [] });

      expect('config' in result).toBe(false);
    });
  });

  describe('config.header', () => {
    describe('without a component translator', () => {
      it('carries header item components through untouched', () => {
        const result = toPreactDashboardProps({
          widgets: [],
          config: { header: { items: [{ id: 'my-item', component: headerItemComponent }] } },
        });

        expect(result.config?.header?.items?.[0].component).toBe(headerItemComponent);
      });

      it('carries them back untouched in the opposite direction', () => {
        const result = toDashboardProps({
          widgets: [],
          config: { header: { items: [{ id: 'built-in', component: builtInComponent }] } },
        });

        expect(result.config?.header?.items?.[0].component).toBe(builtInComponent);
      });
    });

    describe('with a component translator', () => {
      it('converts Vue item components into preact components', () => {
        const result = toPreactDashboardProps(
          {
            widgets: [],
            config: { header: { items: [{ id: 'my-item', component: headerItemComponent }] } },
          },
          createTranslator(),
        );

        const items = result.config?.header?.items;
        expect(items).toHaveLength(1);
        expect(items?.[0].id).toBe('my-item');
        expect(typeof items?.[0].component).toBe('function');
        expect(items?.[0].component).not.toBe(headerItemComponent);
      });

      it('keeps a stable converted component identity across conversions', () => {
        const componentTranslator = createTranslator();
        const props = {
          widgets: [],
          config: { header: { items: [{ id: 'my-item', component: headerItemComponent }] } },
        };

        const first = toPreactDashboardProps(props, componentTranslator);
        const second = toPreactDashboardProps(props, componentTranslator);

        expect(first.config?.header?.items?.[0].component).toBe(
          second.config?.header?.items?.[0].component,
        );
      });

      it('round-trips the header items back to the Vue component', () => {
        const componentTranslator = createTranslator();

        const preactProps = toPreactDashboardProps(
          {
            widgets: [],
            config: { header: { items: [{ id: 'my-item', component: headerItemComponent }] } },
          },
          componentTranslator,
        );
        const result = toDashboardProps(preactProps, componentTranslator);

        expect(result.config?.header?.items?.[0].component).toBe(headerItemComponent);
      });

      it('omits onBeforeRender when the consumer provided no transform', () => {
        const result = toPreactDashboardProps(
          {
            widgets: [],
            config: { header: { items: [{ id: 'my-item', component: headerItemComponent }] } },
          },
          createTranslator(),
        );

        expect(result.config?.header?.onBeforeRender).toBeUndefined();
        expect('onBeforeRender' in (result.config?.header ?? {})).toBe(false);
      });

      it('hands onBeforeRender the consumer own Vue component', () => {
        let receivedComponent: unknown;
        const componentTranslator = createTranslator();
        const result = toPreactDashboardProps(
          {
            widgets: [],
            config: {
              header: {
                items: [{ id: 'my-item', component: headerItemComponent }],
                onBeforeRender: (items) => {
                  receivedComponent = items.find((item) => item.id === 'my-item')?.component;
                  return [...items];
                },
              },
            },
          },
          componentTranslator,
        );
        const converted = result.config?.header?.items?.[0]
          .component as DashboardHeaderItemComponentPreact;

        result.config?.header?.onBeforeRender?.([{ id: 'my-item', component: converted }]);

        expect(receivedComponent).toBe(headerItemComponent);
      });

      it('exposes a built-in item as a Vue component and unwraps it on the way back', () => {
        let receivedComponent: unknown;
        const result = toPreactDashboardProps(
          {
            widgets: [],
            config: {
              header: {
                onBeforeRender: (items) => {
                  receivedComponent = items[0].component;
                  return [...items];
                },
              },
            },
          },
          createTranslator(),
        );

        const transformed = result.config?.header?.onBeforeRender?.([builtInItem]);

        // the consumer gets a real Vue component wrapping the built-in renderer
        expect(receivedComponent).toBeTruthy();
        expect(receivedComponent).not.toBe(builtInComponent);
        // and it is unwrapped, not wrapped a second time, on the way back to the renderer
        expect(transformed?.[0].component).toBe(builtInComponent);
      });

      it('converts Vue components newly injected by onBeforeRender', () => {
        const result = toPreactDashboardProps(
          {
            widgets: [],
            config: {
              header: {
                onBeforeRender: (items) => [
                  ...items,
                  { id: 'injected', component: injectedItemComponent },
                ],
              },
            },
          },
          createTranslator(),
        );

        const transformed = result.config?.header?.onBeforeRender?.([builtInItem]);

        expect(transformed).toHaveLength(2);
        expect(transformed?.[0].component).toBe(builtInComponent);
        expect(typeof transformed?.[1].component).toBe('function');
        expect(transformed?.[1].component).not.toBe(injectedItemComponent);
      });

      it('reuses the converted component across renders', () => {
        const result = toPreactDashboardProps(
          {
            widgets: [],
            config: {
              header: {
                onBeforeRender: (items) => [
                  ...items,
                  { id: 'injected', component: injectedItemComponent },
                ],
              },
            },
          },
          createTranslator(),
        );

        const firstRun = result.config?.header?.onBeforeRender?.([builtInItem]);
        const secondRun = result.config?.header?.onBeforeRender?.([builtInItem]);

        expect(firstRun?.[1].component).toBe(secondRun?.[1].component);
      });

      it('supports removing built-in items', () => {
        const result = toPreactDashboardProps(
          {
            widgets: [],
            config: {
              header: {
                onBeforeRender: (items) => items.filter((item) => item.id !== 'built-in'),
              },
            },
          },
          createTranslator(),
        );

        const transformed = result.config?.header?.onBeforeRender?.([builtInItem]);

        expect(transformed).toEqual([]);
      });

      it('passes a config without header through unchanged', () => {
        const config: DashboardConfig = { toolbar: { visible: false } };

        const result = toPreactDashboardProps({ widgets: [], config }, createTranslator());

        expect(result.config).toEqual({ toolbar: { visible: false } });
        expect(result.config?.header).toBeUndefined();
      });
    });
  });

  describe('DashboardById props', () => {
    it('converts header item components when a translator is provided', () => {
      const result = toPreactDashboardByIdProps(
        {
          dashboardOid: 'oid-1',
          config: { header: { items: [{ id: 'my-item', component: headerItemComponent }] } },
        },
        createTranslator(),
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
      const result = toPreactDashboardByIdProps({ dashboardOid: 'oid-1' });

      expect('config' in result).toBe(false);
    });

    it('round-trips the header items back to the Vue component', () => {
      const componentTranslator = createTranslator();

      const preactProps = toPreactDashboardByIdProps(
        {
          dashboardOid: 'oid-1',
          config: { header: { items: [{ id: 'my-item', component: headerItemComponent }] } },
        },
        componentTranslator,
      );
      const result = toDashboardByIdProps(preactProps, componentTranslator);

      expect(result.config?.header?.items?.[0].component).toBe(headerItemComponent);
    });
  });
});
