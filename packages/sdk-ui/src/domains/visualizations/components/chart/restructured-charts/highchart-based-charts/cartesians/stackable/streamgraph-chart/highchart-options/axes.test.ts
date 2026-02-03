import { TFunction } from '@sisense/sdk-common';
import { describe, expect, test, vi } from 'vitest';

import { CartesianChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types.js';
import { AxisSettings } from '@/domains/visualizations/core/chart-options-processor/translations/axis-section.js';
import { CompleteThemeSettings } from '@/types';

import { BuildContext } from '../../../../types.js';
import { getCartesianXAxis } from '../../../helpers/highchart-options/axis.js';
import { getBasicYAxisSettings } from '../../../helpers/highchart-options/y-axis.js';
import { StreamgraphChartDesignOptions } from '../types.js';
import { getAxes } from './axes.js';

// Mock the dependencies
vi.mock('../../../helpers/highchart-options/axis', () => ({
  getCartesianXAxis: vi.fn(),
}));

vi.mock('../../../helpers/highchart-options/y-axis', () => ({
  getBasicYAxisSettings: vi.fn(),
}));

describe('axes', () => {
  describe('getAxes', () => {
    const createMockBuildContext = (
      xAxisEnabled = true,
      xAxisGridLine = false,
      xAxisLabels: boolean | undefined = true,
      yAxisEnabled = false,
      yAxisGridLine = false,
      yAxisLabels = false,
    ): BuildContext<'streamgraph'> => ({
      chartData: {
        type: 'cartesian',
        series: [],
        xAxisCount: 1,
        xValues: [],
      } as any,
      dataOptions: {
        x: [{ column: { name: 'Year', type: 'string' }, sortType: 'sortNone' }],
        y: [
          {
            column: { name: 'Value', aggregation: 'sum' },
            showOnRightAxis: false,
          },
        ],
        breakBy: [{ column: { name: 'Category', type: 'string' } }],
      } as CartesianChartDataOptionsInternal,
      designOptions: {
        xAxis: {
          type: 'linear',
          enabled: xAxisEnabled,
          titleEnabled: true,
          title: 'X Axis',
          gridLine: xAxisGridLine,
          labels: xAxisLabels,
          min: null,
          max: null,
          tickInterval: null,
        },
        yAxis: {
          type: 'linear',
          enabled: yAxisEnabled,
          titleEnabled: true,
          title: 'Y Axis',
          gridLine: yAxisGridLine,
          labels: yAxisLabels,
          min: null,
          max: null,
          tickInterval: null,
        },
        legend: {
          enabled: true,
          position: 'bottom',
        },
        seriesLabels: {},
        lineType: 'smooth',
        lineWidth: 1,
        marker: { enabled: false, size: 'small', fill: 'full' },
        autoZoom: { enabled: false },
        dataLimits: {
          seriesCapacity: 50,
          categoriesCapacity: 50000,
        },
        designPerSeries: {},
      } as StreamgraphChartDesignOptions,
      extraConfig: {
        translate: vi.fn((key: string) => key) as unknown as TFunction,
        themeSettings: {
          typography: {
            primaryTextColor: '#000000',
          },
        } as CompleteThemeSettings,
        dateFormatter: vi.fn(() => 'formatted-date'),
        accessibilityEnabled: false,
      },
    });

    const createMockXAxisSettings = (): AxisSettings[] => [
      {
        type: 'linear',
        categories: ['2020', '2021', '2022'],
        title: {
          text: 'X Axis',
          enabled: true,
        },
        labels: {
          enabled: true,
          style: { fontSize: '12px' },
        },
        gridLineWidth: 1,
      },
    ];

    const createMockYAxisSettings = (): AxisSettings[] => [
      {
        type: 'linear',
        title: {
          text: 'Y Axis',
          enabled: true,
        },
        labels: {
          enabled: true,
          style: { fontSize: '12px' },
        },
        gridLineWidth: 1,
        min: 0,
        max: 100,
      },
    ];

    beforeEach(() => {
      vi.clearAllMocks();

      // Setup default mock behaviors
      (getCartesianXAxis as any).mockReturnValue(createMockXAxisSettings());
      (getBasicYAxisSettings as any).mockReturnValue(createMockYAxisSettings());
    });

    describe('basic functionality', () => {
      test('should return xAxis and yAxis settings', () => {
        const ctx = createMockBuildContext();
        const result = getAxes(ctx);

        expect(result).toHaveProperty('xAxis');
        expect(result).toHaveProperty('yAxis');
        expect(Array.isArray(result.xAxis)).toBe(true);
        expect(Array.isArray(result.yAxis)).toBe(true);
      });

      test('should call getCartesianXAxis with correct parameters', () => {
        const ctx = createMockBuildContext();
        getAxes(ctx);

        expect(getCartesianXAxis).toHaveBeenCalledWith(ctx, 'horizontal');
        expect(getCartesianXAxis).toHaveBeenCalledTimes(1);
      });

      test('should call getBasicYAxisSettings with area chart type', () => {
        const ctx = createMockBuildContext();
        getAxes(ctx);

        expect(getBasicYAxisSettings).toHaveBeenCalledWith(ctx, 'area');
        expect(getBasicYAxisSettings).toHaveBeenCalledTimes(1);
      });
    });

    describe('X-axis configuration', () => {
      test('should set gridLineWidth to 1 when gridLine is enabled', () => {
        const ctx = createMockBuildContext(true, true);
        const result = getAxes(ctx);

        expect(result.xAxis[0].gridLineWidth).toBe(1);
      });

      test('should set gridLineWidth to 0 when gridLine is disabled', () => {
        const ctx = createMockBuildContext(true, false);
        const result = getAxes(ctx);

        expect(result.xAxis[0].gridLineWidth).toBe(0);
      });

      test('should enable labels when designOptions.xAxis.labels is true', () => {
        const ctx = createMockBuildContext(true, false, true);
        const result = getAxes(ctx);

        expect(result.xAxis[0].labels?.enabled).toBe(true);
      });

      test('should enable labels when designOptions.xAxis.labels is undefined (default)', () => {
        const ctx = createMockBuildContext(true, false, undefined);
        const result = getAxes(ctx);

        expect(result.xAxis[0].labels?.enabled).toBe(true);
      });

      test('should disable labels when designOptions.xAxis.labels is false', () => {
        const ctx = createMockBuildContext(true, false, false);
        const result = getAxes(ctx);

        expect(result.xAxis[0].labels?.enabled).toBe(false);
      });

      test('should preserve other X-axis properties from base axis', () => {
        const mockXAxis = [
          {
            type: 'category',
            categories: ['A', 'B', 'C'],
            title: { text: 'Custom Title', enabled: true },
            labels: { enabled: true, style: { fontSize: '14px' } },
            gridLineWidth: 2,
            customProperty: 'preserved',
          },
        ];
        (getCartesianXAxis as any).mockReturnValue(mockXAxis);

        const ctx = createMockBuildContext();
        const result = getAxes(ctx);

        expect(result.xAxis[0].type).toBe('category');
        expect(result.xAxis[0].categories).toEqual(['A', 'B', 'C']);
        expect(result.xAxis[0].title?.text).toBe('Custom Title');
        expect(result.xAxis[0].labels?.style?.fontSize).toBe('14px');
        expect((result.xAxis[0] as any).customProperty).toBe('preserved');
      });
    });

    describe('Y-axis configuration', () => {
      test('should set visible to false when yAxis.enabled is false', () => {
        const ctx = createMockBuildContext(true, false, true, false);
        const result = getAxes(ctx);

        expect(result.yAxis[0].visible).toBe(false);
      });

      test('should set visible to true when yAxis.enabled is true', () => {
        const ctx = createMockBuildContext(true, false, true, true);
        const result = getAxes(ctx);

        expect(result.yAxis[0].visible).toBe(true);
      });

      test('should set gridLineWidth to 1 when yAxis.gridLine is true', () => {
        const ctx = createMockBuildContext(true, false, true, true, true);
        const result = getAxes(ctx);

        expect(result.yAxis[0].gridLineWidth).toBe(1);
      });

      test('should set gridLineWidth to 0 when yAxis.gridLine is false', () => {
        const ctx = createMockBuildContext(true, false, true, true, false);
        const result = getAxes(ctx);

        expect(result.yAxis[0].gridLineWidth).toBe(0);
      });

      test('should set labels.enabled based on designOptions.yAxis.labels', () => {
        const ctx = createMockBuildContext(true, false, true, true, false, true);
        const result = getAxes(ctx);

        expect(result.yAxis[0].labels?.enabled).toBe(true);
      });

      test('should disable labels when yAxis.labels is false', () => {
        const ctx = createMockBuildContext(true, false, true, true, false, false);
        const result = getAxes(ctx);

        expect(result.yAxis[0].labels?.enabled).toBe(false);
      });

      test('should set startOnTick to false', () => {
        const ctx = createMockBuildContext();
        const result = getAxes(ctx);

        expect(result.yAxis[0].startOnTick).toBe(false);
      });

      test('should set endOnTick to false', () => {
        const ctx = createMockBuildContext();
        const result = getAxes(ctx);

        expect(result.yAxis[0].endOnTick).toBe(false);
      });

      test('should set minPadding to 0.1', () => {
        const ctx = createMockBuildContext();
        const result = getAxes(ctx);

        expect(result.yAxis[0].minPadding).toBe(0.1);
      });

      test('should set maxPadding to 0.15', () => {
        const ctx = createMockBuildContext();
        const result = getAxes(ctx);

        expect(result.yAxis[0].maxPadding).toBe(0.15);
      });

      test('should set min to undefined (drop area chart limits)', () => {
        const ctx = createMockBuildContext();
        const result = getAxes(ctx);

        expect(result.yAxis[0].min).toBeUndefined();
      });

      test('should set max to undefined (drop area chart limits)', () => {
        const ctx = createMockBuildContext();
        const result = getAxes(ctx);

        expect(result.yAxis[0].max).toBeUndefined();
      });

      test('should preserve other Y-axis properties from base axis', () => {
        const mockYAxis = [
          {
            type: 'linear',
            title: { text: 'Custom Y Title', enabled: true },
            labels: { enabled: true, style: { fontSize: '16px' } },
            gridLineWidth: 2,
            min: 10,
            max: 200,
            customProperty: 'preserved',
          },
        ];
        (getBasicYAxisSettings as any).mockReturnValue(mockYAxis);

        const ctx = createMockBuildContext();
        const result = getAxes(ctx);

        expect(result.yAxis[0].type).toBe('linear');
        expect(result.yAxis[0].title?.text).toBe('Custom Y Title');
        expect(result.yAxis[0].labels?.style?.fontSize).toBe('16px');
        expect((result.yAxis[0] as any).customProperty).toBe('preserved');
        // But min/max should be overridden
        expect(result.yAxis[0].min).toBeUndefined();
        expect(result.yAxis[0].max).toBeUndefined();
      });
    });

    describe('multiple axes handling', () => {
      test('should handle multiple X-axis configurations', () => {
        const mockXAxis = [
          { type: 'category' as any, title: { text: 'X1' }, labels: { enabled: true } },
          { type: 'category' as any, title: { text: 'X2' }, labels: { enabled: true } },
        ];
        (getCartesianXAxis as any).mockReturnValue(mockXAxis);

        const ctx = createMockBuildContext(true, true, true);
        const result = getAxes(ctx);

        expect(result.xAxis).toHaveLength(2);
        expect(result.xAxis[0].gridLineWidth).toBe(1);
        expect(result.xAxis[1].gridLineWidth).toBe(1);
      });

      test('should handle multiple Y-axis configurations', () => {
        const mockYAxis = [
          { type: 'linear', title: { text: 'Y1' }, labels: { enabled: true } },
          { type: 'linear', title: { text: 'Y2' }, labels: { enabled: true } },
        ];
        (getBasicYAxisSettings as any).mockReturnValue(mockYAxis);

        const ctx = createMockBuildContext(true, false, true, true, false, true);
        const result = getAxes(ctx);

        expect(result.yAxis).toHaveLength(2);
        expect(result.yAxis[0].visible).toBe(true);
        expect(result.yAxis[1].visible).toBe(true);
        expect(result.yAxis[0].minPadding).toBe(0.1);
        expect(result.yAxis[1].minPadding).toBe(0.1);
        expect(result.yAxis[0].min).toBeUndefined();
        expect(result.yAxis[1].min).toBeUndefined();
      });
    });

    describe('streamgraph-specific defaults', () => {
      test('should always set Y-axis padding for centered offset', () => {
        const testCases = [
          { yAxisEnabled: false, yAxisGridLine: false, yAxisLabels: false },
          { yAxisEnabled: true, yAxisGridLine: true, yAxisLabels: true },
        ];

        testCases.forEach(({ yAxisEnabled, yAxisGridLine, yAxisLabels }) => {
          const ctx = createMockBuildContext(
            true,
            false,
            true,
            yAxisEnabled,
            yAxisGridLine,
            yAxisLabels,
          );
          const result = getAxes(ctx);

          expect(result.yAxis[0].minPadding).toBe(0.1);
          expect(result.yAxis[0].maxPadding).toBe(0.15);
        });
      });

      test('should always drop Y-axis min/max limits', () => {
        const mockYAxis = [
          {
            type: 'linear',
            min: -50,
            max: 500,
            title: { text: 'Y' },
            labels: { enabled: true },
          },
        ];
        (getBasicYAxisSettings as any).mockReturnValue(mockYAxis);

        const ctx = createMockBuildContext();
        const result = getAxes(ctx);

        expect(result.yAxis[0].min).toBeUndefined();
        expect(result.yAxis[0].max).toBeUndefined();
      });

      test('should always disable startOnTick and endOnTick', () => {
        const mockYAxis = [
          {
            type: 'linear',
            startOnTick: true,
            endOnTick: true,
            title: { text: 'Y' },
            labels: { enabled: true },
          },
        ];
        (getBasicYAxisSettings as any).mockReturnValue(mockYAxis);

        const ctx = createMockBuildContext();
        const result = getAxes(ctx);

        expect(result.yAxis[0].startOnTick).toBe(false);
        expect(result.yAxis[0].endOnTick).toBe(false);
      });
    });

    describe('immutability', () => {
      test('should not mutate the original build context', () => {
        const ctx = createMockBuildContext();
        const originalDesignOptions = JSON.parse(JSON.stringify(ctx.designOptions));

        getAxes(ctx);

        expect(ctx.designOptions).toEqual(originalDesignOptions);
      });

      test('should not mutate the base axis settings', () => {
        const mockXAxis = createMockXAxisSettings();
        const mockYAxis = createMockYAxisSettings();
        (getCartesianXAxis as any).mockReturnValue(mockXAxis);
        (getBasicYAxisSettings as any).mockReturnValue(mockYAxis);

        const ctx = createMockBuildContext();
        getAxes(ctx);

        // Verify original mock arrays weren't mutated
        expect(mockXAxis[0].gridLineWidth).toBe(1);
        expect(mockYAxis[0].min).toBe(0);
        expect(mockYAxis[0].max).toBe(100);
      });

      test('should return new objects, not same references', () => {
        const mockXAxis = createMockXAxisSettings();
        const mockYAxis = createMockYAxisSettings();
        (getCartesianXAxis as any).mockReturnValue(mockXAxis);
        (getBasicYAxisSettings as any).mockReturnValue(mockYAxis);

        const ctx = createMockBuildContext();
        const result = getAxes(ctx);

        expect(result.xAxis).not.toBe(mockXAxis);
        expect(result.yAxis).not.toBe(mockYAxis);
        expect(result.xAxis[0]).not.toBe(mockXAxis[0]);
        expect(result.yAxis[0]).not.toBe(mockYAxis[0]);
      });
    });

    describe('edge cases', () => {
      test('should handle empty axis arrays', () => {
        (getCartesianXAxis as any).mockReturnValue([]);
        (getBasicYAxisSettings as any).mockReturnValue([]);

        const ctx = createMockBuildContext();
        const result = getAxes(ctx);

        expect(result.xAxis).toEqual([]);
        expect(result.yAxis).toEqual([]);
      });

      test('should handle axis settings without labels property', () => {
        const mockXAxis = [
          {
            type: 'category' as any,
            title: { text: 'X' },
            // No labels property
          },
        ];
        (getCartesianXAxis as any).mockReturnValue(mockXAxis);

        const ctx = createMockBuildContext(true, false, true);
        const result = getAxes(ctx);

        expect(result.xAxis[0].labels?.enabled).toBe(true);
      });

      test('should handle axis settings with null labels', () => {
        const mockXAxis = [
          {
            type: 'category' as any,
            title: { text: 'X' },
            labels: null,
          },
        ];
        (getCartesianXAxis as any).mockReturnValue(mockXAxis);

        const ctx = createMockBuildContext(true, false, true);
        const result = getAxes(ctx);

        expect(result.xAxis[0].labels?.enabled).toBe(true);
      });
    });

    describe('integration with helper functions', () => {
      test('should properly integrate with getCartesianXAxis', () => {
        const customXAxis = [
          {
            type: 'datetime' as any,
            title: { text: 'Time' },
            labels: { enabled: true, rotation: 45 },
            gridLineWidth: 2,
          },
        ];
        (getCartesianXAxis as any).mockReturnValue(customXAxis);

        const ctx = createMockBuildContext(true, true, true);
        const result = getAxes(ctx);

        expect(result.xAxis[0].type).toBe('datetime');
        expect(result.xAxis[0].title?.text).toBe('Time');
        expect(result.xAxis[0].labels?.rotation).toBe(45);
        expect(result.xAxis[0].gridLineWidth).toBe(1); // Overridden by streamgraph config
      });

      test('should properly integrate with getBasicYAxisSettings', () => {
        const customYAxis = [
          {
            type: 'logarithmic',
            title: { text: 'Log Scale' },
            labels: { enabled: true },
            gridLineWidth: 3,
            min: 1,
            max: 1000,
          },
        ];
        (getBasicYAxisSettings as any).mockReturnValue(customYAxis);

        const ctx = createMockBuildContext(true, false, true, true, true, true);
        const result = getAxes(ctx);

        expect(result.yAxis[0].type).toBe('logarithmic');
        expect(result.yAxis[0].title?.text).toBe('Log Scale');
        expect(result.yAxis[0].gridLineWidth).toBe(1); // Overridden by streamgraph config
        expect(result.yAxis[0].min).toBeUndefined(); // Dropped by streamgraph config
        expect(result.yAxis[0].max).toBeUndefined(); // Dropped by streamgraph config
      });
    });
  });
});
