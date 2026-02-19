/** @vitest-environment jsdom */
import type {
  ChartWidgetProps as ChartWidgetPropsPreact,
  PivotTableWidgetProps as PivotTableWidgetPropsPreact,
  TextWidgetProps as TextWidgetPropsPreact,
  WidgetProps as WidgetPropsPreact,
  WithCommonWidgetProps,
} from '@sisense/sdk-ui-preact';
import { describe, expect, it, vi } from 'vitest';

import type { WidgetProps as WidgetPropsAngular } from '../components/widgets';
import {
  toChartWidgetProps,
  toPivotTableWidgetProps,
  toPreactWidgetProps,
  toTextWidgetProps,
  toWidgetProps,
} from './widget-props-preact-translator';

describe('widget-props-preact-translator', () => {
  describe('toPreactWidgetProps', () => {
    it('should convert Angular WidgetProps to Preact WidgetProps', () => {
      const angularProps: WidgetPropsAngular = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'column',
        dataSource: 'Sample ECommerce',
        dataOptions: {
          category: [],
          value: [],
        },
        beforeRender: vi.fn(),
        dataReady: vi.fn(),
        beforeMenuOpen: vi.fn(),
      };

      const result = toPreactWidgetProps(angularProps) as WithCommonWidgetProps<
        ChartWidgetPropsPreact,
        'chart'
      >;

      expect(result).toEqual({
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'column',
        dataSource: 'Sample ECommerce',
        dataOptions: {
          category: [],
          value: [],
        },
        onBeforeRender: angularProps.beforeRender,
        onDataReady: angularProps.dataReady,
        onBeforeMenuOpen: angularProps.beforeMenuOpen,
        onDataPointClick: undefined,
        onDataPointContextMenu: undefined,
        onDataPointsSelected: undefined,
      });
      expect(result.onBeforeRender).toBe(angularProps.beforeRender);
      expect(result.onDataReady).toBe(angularProps.dataReady);
      expect(result.onBeforeMenuOpen).toBe(angularProps.beforeMenuOpen);
    });

    it('should transform dataPointClick handler from Angular to Preact format', () => {
      const mockDataPointClick = vi.fn();
      const angularProps: WidgetPropsAngular = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'bar',
        dataSource: 'Sample ECommerce',
        dataOptions: {
          category: [],
          value: [],
        },
        dataPointClick: mockDataPointClick,
      } as WidgetPropsAngular;

      const result = toPreactWidgetProps(angularProps);
      const resultPreact = result as unknown as WidgetPropsPreact;

      expect(resultPreact.onDataPointClick).toBeDefined();
      expect(typeof resultPreact.onDataPointClick).toBe('function');

      const mockPoint = { category: 'Test', value: 100 } as any;
      const mockNativeEvent = new MouseEvent('click') as any;

      resultPreact.onDataPointClick?.(mockPoint, mockNativeEvent);

      expect(mockDataPointClick).toHaveBeenCalledWith({
        point: mockPoint,
        nativeEvent: mockNativeEvent,
      });
    });

    it('should transform dataPointContextMenu handler from Angular to Preact format', () => {
      const mockDataPointContextMenu = vi.fn();
      const angularProps: WidgetPropsAngular = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'line',
        dataSource: 'Sample ECommerce',
        dataOptions: {
          category: [],
          value: [],
        },
        dataPointContextMenu: mockDataPointContextMenu,
      } as WidgetPropsAngular;

      const result = toPreactWidgetProps(angularProps) as WithCommonWidgetProps<
        ChartWidgetPropsPreact,
        'chart'
      >;

      expect(result.onDataPointContextMenu).toBeDefined();
      expect(typeof result.onDataPointContextMenu).toBe('function');

      const mockPoint = { category: 'Test', value: 200 } as any;
      const mockNativeEvent = new MouseEvent('contextmenu') as any;

      result.onDataPointContextMenu?.(mockPoint, mockNativeEvent);

      expect(mockDataPointContextMenu).toHaveBeenCalledWith({
        point: mockPoint,
        nativeEvent: mockNativeEvent,
      });
    });

    it('should transform dataPointsSelect handler from Angular to Preact format', () => {
      const mockDataPointsSelect = vi.fn();
      const angularProps: WidgetPropsAngular = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'pie',
        dataSource: 'Sample ECommerce',
        dataOptions: {
          category: [],
          value: [],
        },
        dataPointsSelect: mockDataPointsSelect,
      };

      const result = toPreactWidgetProps(angularProps) as WithCommonWidgetProps<
        ChartWidgetPropsPreact,
        'chart'
      >;
      expect(result.onDataPointsSelected).toBeDefined();
      expect(typeof result.onDataPointsSelected).toBe('function');

      const mockPoints = [
        { category: 'Test1', value: 100 },
        { category: 'Test2', value: 200 },
      ] as any;
      const mockNativeEvent = new MouseEvent('click') as any;

      result.onDataPointsSelected?.(mockPoints, mockNativeEvent);

      expect(mockDataPointsSelect).toHaveBeenCalledWith({
        points: mockPoints,
        nativeEvent: mockNativeEvent,
      });
    });

    it('should handle props without event handlers', () => {
      const angularProps: WidgetPropsAngular = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'column',
        dataSource: 'Sample ECommerce',
        dataOptions: {
          category: [],
          value: [],
        },
      } as WidgetPropsAngular;

      const result = toPreactWidgetProps(angularProps) as WithCommonWidgetProps<
        ChartWidgetPropsPreact,
        'chart'
      >;

      expect(result.onDataPointClick).toBeUndefined();
      expect(result.onDataPointContextMenu).toBeUndefined();
      expect(result.onDataPointsSelected).toBeUndefined();
    });

    it('should preserve all other props', () => {
      const angularProps: WidgetPropsAngular = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'bar',
        title: 'Test Widget',
        description: 'Test Description',
        dataSource: 'Sample ECommerce',
        dataOptions: {
          category: [],
          value: [],
        },
        filters: [],
        highlights: [],
      };

      const result = toPreactWidgetProps(angularProps) as WithCommonWidgetProps<
        ChartWidgetPropsPreact,
        'chart'
      >;

      expect(result.id).toBe('widget-1');
      expect(result.widgetType).toBe('chart');
      expect(result.chartType).toBe('bar');
      expect(result.title).toBe('Test Widget');
      expect(result.description).toBe('Test Description');
      expect(result.dataSource).toBe('Sample ECommerce');
      expect(result.filters).toEqual([]);
      expect(result.highlights).toEqual([]);
    });
  });

  describe('toWidgetProps', () => {
    it('should convert Preact WidgetProps to Angular WidgetProps', () => {
      const preactProps: WidgetPropsPreact = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'column',
        dataSource: 'Sample ECommerce',
        dataOptions: {
          category: [],
          value: [],
        },
        onBeforeRender: vi.fn(),
        onDataReady: vi.fn(),
        onBeforeMenuOpen: vi.fn(),
      };

      const result = toWidgetProps(preactProps);

      expect(result).toEqual({
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'column',
        dataSource: 'Sample ECommerce',
        dataOptions: {
          category: [],
          value: [],
        },
        beforeRender: preactProps.onBeforeRender,
        dataReady: preactProps.onDataReady,
        beforeMenuOpen: preactProps.onBeforeMenuOpen,
        dataPointClick: undefined,
        dataPointContextMenu: undefined,
        dataPointsSelect: undefined,
      });
      expect(result.beforeRender).toBe(preactProps.onBeforeRender);
      expect(result.dataReady).toBe(preactProps.onDataReady);
      expect(result.beforeMenuOpen).toBe(preactProps.onBeforeMenuOpen);
    });

    it('should transform onDataPointClick handler from Preact to Angular format', () => {
      const mockOnDataPointClick = vi.fn();
      const preactProps: WidgetPropsPreact = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'bar',
        dataOptions: { category: [], value: [] },
        onDataPointClick: mockOnDataPointClick,
      };

      const result = toWidgetProps(preactProps);

      expect(result.dataPointClick).toBeDefined();
      expect(typeof result.dataPointClick).toBe('function');

      const mockPoint = { category: 'Test', value: 100 };
      const mockNativeEvent = new MouseEvent('click');

      result.dataPointClick?.({ point: mockPoint as any, nativeEvent: mockNativeEvent });

      expect(mockOnDataPointClick).toHaveBeenCalledWith(mockPoint, mockNativeEvent);
    });

    it('should transform onDataPointContextMenu handler from Preact to Angular format', () => {
      const mockOnDataPointContextMenu = vi.fn();
      const preactProps: WidgetPropsPreact = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'line',
        dataOptions: {
          category: [],
          value: [],
        },
        onDataPointContextMenu: mockOnDataPointContextMenu,
      };

      const result = toWidgetProps(preactProps);

      expect(result.dataPointContextMenu).toBeDefined();
      expect(typeof result.dataPointContextMenu).toBe('function');

      const mockPoint = { category: 'Test', value: 200 } as any;
      const mockNativeEvent = new MouseEvent('contextmenu');

      result.dataPointContextMenu?.({ point: mockPoint, nativeEvent: mockNativeEvent });

      expect(mockOnDataPointContextMenu).toHaveBeenCalledWith(mockPoint, mockNativeEvent);
    });

    it('should transform onDataPointsSelected handler from Preact to Angular format', () => {
      const mockOnDataPointsSelected = vi.fn();
      const preactProps: WidgetPropsPreact = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'pie',
        dataOptions: {
          category: [],
          value: [],
        },
        onDataPointsSelected: mockOnDataPointsSelected,
      };

      const result = toWidgetProps(preactProps);

      expect(result.dataPointsSelect).toBeDefined();
      expect(typeof result.dataPointsSelect).toBe('function');

      const mockPoints = [
        { category: 'Test1', value: 100 },
        { category: 'Test2', value: 200 },
      ];
      const mockNativeEvent = new MouseEvent('click');

      result.dataPointsSelect?.({ points: mockPoints, nativeEvent: mockNativeEvent });

      expect(mockOnDataPointsSelected).toHaveBeenCalledWith(mockPoints, mockNativeEvent);
    });

    it('should handle props without event handlers', () => {
      const preactProps: WidgetPropsPreact = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'column',
        dataOptions: {
          category: [],
          value: [],
        },
      };

      const result = toWidgetProps(preactProps);

      expect(result.dataPointClick).toBeUndefined();
      expect(result.dataPointContextMenu).toBeUndefined();
      expect(result.dataPointsSelect).toBeUndefined();
    });

    it('should preserve all other props', () => {
      const preactProps: WidgetPropsPreact = {
        id: 'widget-1',
        widgetType: 'chart',
        chartType: 'bar',
        title: 'Test Widget',
        description: 'Test Description',
        dataSource: 'Sample ECommerce',
        dataOptions: {
          category: [],
          value: [],
        },
        filters: [],
        highlights: [],
      };

      const result = toWidgetProps(preactProps);

      expect(result.id).toBe('widget-1');
      expect(result.widgetType).toBe('chart');
      expect(result.chartType).toBe('bar');
      expect(result.title).toBe('Test Widget');
      expect(result.description).toBe('Test Description');
      expect(result.dataSource).toBe('Sample ECommerce');
      expect(result.filters).toEqual([]);
      expect(result.highlights).toEqual([]);
    });
  });

  describe('toChartWidgetProps', () => {
    it('should convert Preact ChartWidgetProps to Angular ChartWidgetProps', () => {
      const preactProps: ChartWidgetPropsPreact = {
        chartType: 'column',
        dataSource: 'Sample ECommerce',
        dataOptions: { category: [], value: [] },
        onBeforeRender: vi.fn(),
        onDataReady: vi.fn(),
        title: 'Test Chart',
      };

      const result = toChartWidgetProps(preactProps);

      expect(result).toEqual({
        chartType: 'column',
        dataSource: 'Sample ECommerce',
        dataOptions: {
          category: [],
          value: [],
        },
        beforeRender: preactProps.onBeforeRender,
        dataReady: preactProps.onDataReady,
        title: 'Test Chart',
      });
      expect(result.beforeRender).toBe(preactProps.onBeforeRender);
      expect(result.dataReady).toBe(preactProps.onDataReady);
    });

    it('should handle props without event handlers', () => {
      const preactProps: ChartWidgetPropsPreact = {
        chartType: 'bar',
        dataSource: 'Sample Healthcare',
        dataOptions: { category: [], value: [] },
      };

      const result = toChartWidgetProps(preactProps);

      expect(result).toEqual({
        dataOptions: { category: [], value: [] },
        chartType: 'bar',
        dataSource: 'Sample Healthcare',
        beforeRender: undefined,
        dataReady: undefined,
      });
    });

    it('should preserve all other props', () => {
      const preactProps: ChartWidgetPropsPreact = {
        chartType: 'line',
        dataSource: 'Sample ECommerce',
        filters: [],
        dataOptions: { category: [], value: [] },
        styleOptions: { width: 800 },
        onBeforeRender: vi.fn(),
        onDataReady: vi.fn(),
      };

      const result = toChartWidgetProps(preactProps);

      expect(result.filters).toEqual([]);
      expect(result.styleOptions).toEqual({ width: 800 });
    });
  });

  describe('toPivotTableWidgetProps', () => {
    it('should convert Preact PivotTableWidgetProps to Angular PivotTableWidgetProps', () => {
      const preactProps: PivotTableWidgetPropsPreact = {
        dataSource: 'Sample ECommerce',
        dataOptions: {
          rows: [],
          columns: [],
          values: [],
        },
        title: 'Test Pivot Table',
      };

      const result = toPivotTableWidgetProps(preactProps);

      expect(result).toEqual({
        dataSource: 'Sample ECommerce',
        dataOptions: {
          rows: [],
          columns: [],
          values: [],
        },
        title: 'Test Pivot Table',
      });
    });

    it('should preserve all props without transformation', () => {
      const preactProps: PivotTableWidgetPropsPreact = {
        dataSource: 'Sample Healthcare',
        dataOptions: { rows: [], columns: [], values: [] },
        filters: [],
        styleOptions: { width: 1000 },
      };

      const result = toPivotTableWidgetProps(preactProps);

      expect(result).toEqual(preactProps);
    });

    it('should handle empty props object', () => {
      const preactProps: PivotTableWidgetPropsPreact = {} as PivotTableWidgetPropsPreact;

      const result = toPivotTableWidgetProps(preactProps);

      expect(result).toEqual({});
    });
  });

  describe('toTextWidgetProps', () => {
    it('should convert Preact TextWidgetProps to Angular TextWidgetProps', () => {
      const preactProps: TextWidgetPropsPreact = {
        styleOptions: { bgColor: 'white', html: 'Test Content', vAlign: 'valign-middle' },
      };

      const result = toTextWidgetProps(preactProps);

      expect(result).toEqual({
        styleOptions: { bgColor: 'white', html: 'Test Content', vAlign: 'valign-middle' },
      });
    });

    it('should preserve all props without transformation', () => {
      const preactProps: TextWidgetPropsPreact = {
        styleOptions: { bgColor: 'white', html: 'My Content', vAlign: 'valign-middle' },
      };

      const result = toTextWidgetProps(preactProps);

      expect(result).toEqual(preactProps);
    });

    it('should handle empty props object', () => {
      const preactProps: TextWidgetPropsPreact = {} as TextWidgetPropsPreact;

      const result = toTextWidgetProps(preactProps);

      expect(result).toEqual({});
    });
  });
});
