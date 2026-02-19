/** @vitest-environment jsdom */
import type {
  DashboardConfig,
  DashboardLayoutOptions,
  DashboardProps as DashboardPropsPreact,
  WidgetsOptions,
} from '@sisense/sdk-ui-preact';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DashboardProps as DashboardPropsAngular } from '../components/dashboard';
import type { WidgetProps } from '../components/widgets';
import { toDashboardProps, toPreactDashboardProps } from './dashboard-props-preact-translator';
import { toPreactWidgetProps, toWidgetProps } from './widget-props-preact-translator';

vi.mock('./widget-props-preact-translator', () => ({
  toPreactWidgetProps: vi.fn((props) => ({ ...props, translated: true })),
  toWidgetProps: vi.fn((props) => ({ ...props, translated: true })),
}));

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
        config: {} as DashboardConfig,
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
});
