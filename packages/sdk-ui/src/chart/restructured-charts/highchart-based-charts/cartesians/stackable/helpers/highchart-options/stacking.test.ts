import { TFunction } from '@sisense/sdk-common';
import { describe, expect, test, vi } from 'vitest';

import { CartesianChartDataOptionsInternal } from '@/chart-data-options/types';
import { AxisSettings } from '@/chart-options-processor/translations/axis-section';
import { StackableChartDesignOptions } from '@/chart-options-processor/translations/design-options';
import { CompleteThemeSettings, SeriesLabels } from '@/types';

import { BuildContext } from '../../../../types';
import { StackableChartTypes } from '../../types';
import { withStacking } from './stacking';

// Mock the dependencies
vi.mock('@/chart-options-processor/translations/number-format-config', () => ({
  applyFormatPlainText: vi.fn((config, value) => `formatted_${value}`),
  getCompleteNumberFormatConfig: vi.fn(
    (config) => config || { decimalScale: 2, symbol: '$', prefix: true },
  ),
}));

vi.mock('@/chart-options-processor/defaults/cartesian', () => ({
  stackTotalFontStyleDefault: {
    fontFamily: 'Arial',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#333333',
  },
}));

describe('stacking', () => {
  describe('withStacking', () => {
    const createMockBuildContext = (
      stackType: 'classic' | 'stacked' | 'stack100' = 'stacked',
      showTotal = false,
      totalLabelRotation = 0,
      seriesLabels?: SeriesLabels,
      themeSettings?: Partial<CompleteThemeSettings>,
    ): BuildContext<StackableChartTypes> => ({
      chartData: {
        type: 'cartesian',
        series: [],
        xAxisCount: 1,
        xValues: [],
      } as any,
      dataOptions: {
        x: [{ column: { name: 'Category', type: 'string' }, sortType: 'sortNone' }],
        y: [
          {
            column: { name: 'Revenue', aggregation: 'sum' },
            showOnRightAxis: false,
            numberFormatConfig: { decimalScale: 2, symbol: '$', prefix: true },
          },
          {
            column: { name: 'Profit', aggregation: 'sum' },
            showOnRightAxis: true,
            numberFormatConfig: { decimalScale: 1, symbol: '€', prefix: false },
          },
        ],
        breakBy: [],
      } as CartesianChartDataOptionsInternal,
      designOptions: {
        stackType,
        totalLabels: {
          enabled: showTotal,
          rotation: totalLabelRotation,
        },
        seriesLabels,
        legend: {
          enabled: true,
          position: 'bottom',
        },
        lineType: 'straight',
        lineWidth: 2,
        marker: { enabled: false, size: 'small', fill: 'full' },
        autoZoom: { enabled: false },
        xAxis: {
          type: 'linear',
          enabled: true,
          titleEnabled: true,
          title: 'X Axis',
          gridLine: true,
          labels: true,
          min: null,
          max: null,
          tickInterval: null,
        },
        yAxis: {
          type: 'linear',
          enabled: true,
          titleEnabled: true,
          title: 'Y Axis',
          gridLine: true,
          labels: true,
          min: null,
          max: null,
          tickInterval: null,
        },
        dataLimits: {
          seriesCapacity: 50,
          categoriesCapacity: 50000,
        },
        designPerSeries: {},
      } as StackableChartDesignOptions,
      extraConfig: {
        translate: vi.fn((key: string) => key) as unknown as TFunction,
        themeSettings: {
          typography: {
            primaryTextColor: '#000000',
            ...themeSettings?.typography,
          },
          ...themeSettings,
        } as CompleteThemeSettings,
        dateFormatter: vi.fn(() => 'formatted-date'),
        accessibilityEnabled: false,
      },
    });

    const createMockAxisSettings = (): AxisSettings[] => [
      {
        type: 'linear',
        title: {
          text: 'Primary Y Axis',
          enabled: true,
        },
        labels: {
          enabled: true,
          style: { fontSize: '12px' },
        },
        stackLabels: {
          enabled: false,
          style: { fontSize: '10px' },
          crop: false,
          allowOverlap: true,
          rotation: 0,
          labelrank: 1,
        },
        gridLineWidth: 1,
        min: null,
        max: null,
      },
      {
        type: 'linear',
        title: {
          text: 'Secondary Y Axis',
          enabled: true,
        },
        labels: {
          enabled: true,
          style: { fontSize: '12px' },
        },
        stackLabels: {
          enabled: false,
          style: { fontSize: '10px' },
          crop: false,
          allowOverlap: true,
          rotation: 0,
          labelrank: 1,
        },
        gridLineWidth: 1,
        min: null,
        max: null,
        opposite: true,
      },
    ];

    describe('when stackType is classic (no stacking)', () => {
      test('should return unchanged axis settings when no stacking and no showTotal', () => {
        const ctx = createMockBuildContext('classic', false);
        const basicAxisSettings = createMockAxisSettings();
        const result = withStacking(ctx)(basicAxisSettings);

        expect(result).toEqual(basicAxisSettings);
      });

      test('should return unchanged axis settings when classic stack type even with showTotal', () => {
        const ctx = createMockBuildContext('classic', true);
        const basicAxisSettings = createMockAxisSettings();
        const result = withStacking(ctx)(basicAxisSettings);

        expect(result).toEqual(basicAxisSettings);
      });
    });

    describe('when stackType is stacked', () => {
      test('should add stacking formatters to axis labels without showTotal', () => {
        const ctx = createMockBuildContext('stacked', false, 0, { enabled: true });
        const basicAxisSettings = createMockAxisSettings();
        const result = withStacking(ctx)(basicAxisSettings);

        expect(result).toHaveLength(2);
        expect(result[0].labels?.formatter).toBeDefined();
        expect(result[1].labels?.formatter).toBeDefined();
        expect(result[0].stackLabels?.enabled).toBe(false);
        expect(result[1].stackLabels?.enabled).toBe(false);
      });

      test('should add stack labels when showTotal is true', () => {
        const ctx = createMockBuildContext('stacked', true, 45, { enabled: true });
        const basicAxisSettings = createMockAxisSettings();
        const result = withStacking(ctx)(basicAxisSettings);

        expect(result[0].stackLabels?.enabled).toBe(true);
        expect(result[0].stackLabels?.rotation).toBe(45);
        expect(result[0].stackLabels?.crop).toBe(true);
        expect(result[0].stackLabels?.allowOverlap).toBe(false);
        expect(result[0].stackLabels?.labelrank).toBe(99999);
        expect((result[0].stackLabels as any)?.formatter).toBeDefined();

        expect(result[1].stackLabels?.enabled).toBe(true);
        expect(result[1].stackLabels?.rotation).toBe(45);
        expect((result[1].stackLabels as any)?.formatter).toBeDefined();
      });

      test('should not show total when seriesLabels is provided but showTotal is false', () => {
        const ctx = createMockBuildContext('stacked', false, 0, { enabled: true });
        const basicAxisSettings = createMockAxisSettings();
        const result = withStacking(ctx)(basicAxisSettings);

        expect(result[0].stackLabels?.enabled).toBe(false);
        expect(result[1].stackLabels?.enabled).toBe(false);
      });
    });

    describe('when stackType is stack100', () => {
      test('should add percent stacking formatters', () => {
        const ctx = createMockBuildContext('stack100', false, 0, { enabled: true });
        const basicAxisSettings = createMockAxisSettings();
        const result = withStacking(ctx)(basicAxisSettings);

        expect(result[0].labels?.formatter).toBeDefined();
        expect(result[1].labels?.formatter).toBeDefined();

        // Test that the formatter adds percent sign
        const formatter = result[0].labels?.formatter;
        expect(formatter).toBeDefined();
        const mockThis = { value: 50, axis: { categories: [] } };
        const formattedResult = formatter?.call(mockThis);
        expect(formattedResult).toBe('formatted_50%');
      });

      test('should add stack labels with percent formatting when showTotal is true', () => {
        const ctx = createMockBuildContext('stack100', true, -30, { enabled: true });
        const basicAxisSettings = createMockAxisSettings();
        const result = withStacking(ctx)(basicAxisSettings);

        expect(result[0].stackLabels?.enabled).toBe(true);
        expect(result[0].stackLabels?.rotation).toBe(-30);
        expect(result[1].stackLabels?.enabled).toBe(true);
        expect(result[1].stackLabels?.rotation).toBe(-30);

        // Test stack labels formatter
        const stackFormatter = (result[0].stackLabels as any)?.formatter;
        expect(stackFormatter).toBeDefined();
        const mockStackThis = { value: 100, total: 100 };
        const stackFormattedResult = stackFormatter?.call(mockStackThis);
        expect(stackFormattedResult).toBe('formatted_100');
      });
    });

    describe('totalLabelRotation handling', () => {
      test('should use default rotation of 0 when totalLabelRotation is undefined', () => {
        const ctx = createMockBuildContext('stacked', true, undefined as any, { enabled: true });
        const basicAxisSettings = createMockAxisSettings();
        const result = withStacking(ctx)(basicAxisSettings);

        expect(result[0].stackLabels?.rotation).toBe(0);
        expect(result[1].stackLabels?.rotation).toBe(0);
      });

      test('should handle positive rotation angles', () => {
        const ctx = createMockBuildContext('stacked', true, 90, { enabled: true });
        const basicAxisSettings = createMockAxisSettings();
        const result = withStacking(ctx)(basicAxisSettings);

        expect(result[0].stackLabels?.rotation).toBe(90);
        expect(result[1].stackLabels?.rotation).toBe(90);
      });

      test('should handle negative rotation angles', () => {
        const ctx = createMockBuildContext('stacked', true, -45, { enabled: true });
        const basicAxisSettings = createMockAxisSettings();
        const result = withStacking(ctx)(basicAxisSettings);

        expect(result[0].stackLabels?.rotation).toBe(-45);
        expect(result[1].stackLabels?.rotation).toBe(-45);
      });
    });

    describe('theme settings integration', () => {
      test('should apply theme text color to stack labels', () => {
        const themeSettings = {
          typography: {
            fontFamily: 'Arial',
            primaryTextColor: '#ff0000',
            secondaryTextColor: '#666666',
            hyperlinkColor: '#0000ff',
          },
        };
        const ctx = createMockBuildContext('stacked', true, 0, { enabled: true }, themeSettings);
        const basicAxisSettings = createMockAxisSettings();
        const result = withStacking(ctx)(basicAxisSettings);

        expect(result[0].stackLabels?.style?.color).toBe('#ff0000');
        expect(result[1].stackLabels?.style?.color).toBe('#ff0000');
      });

      test('should use default style when theme settings are not provided', () => {
        const ctx = createMockBuildContext('stacked', true, 0, { enabled: true }, undefined);
        const basicAxisSettings = createMockAxisSettings();
        const result = withStacking(ctx)(basicAxisSettings);

        // Should still have the default style from stackTotalFontStyleDefault
        expect(result[0].stackLabels?.style?.fontFamily).toBe('Arial');
        expect(result[0].stackLabels?.style?.fontSize).toBe('12px');
        expect(result[0].stackLabels?.style?.fontWeight).toBe('bold');
      });
    });

    describe('number format configuration', () => {
      test('should use different number format configs for primary and secondary axes', () => {
        const ctx = createMockBuildContext('stacked', true, 0, { enabled: true });
        const basicAxisSettings = createMockAxisSettings();
        const result = withStacking(ctx)(basicAxisSettings);

        // Both axes should have formatters, but they use different number format configs
        expect(result[0].labels?.formatter).toBeDefined();
        expect(result[1].labels?.formatter).toBeDefined();
        expect((result[0].stackLabels as any)?.formatter).toBeDefined();
        expect((result[1].stackLabels as any)?.formatter).toBeDefined();
      });

      test('should handle missing number format config gracefully', () => {
        const ctx = createMockBuildContext('stacked', true, 0, { enabled: true });
        // Remove number format configs
        ctx.dataOptions.y = [
          {
            column: { name: 'Revenue', aggregation: 'sum' },
            showOnRightAxis: false,
            // No numberFormatConfig
          },
          {
            column: { name: 'Profit', aggregation: 'sum' },
            showOnRightAxis: true,
            // No numberFormatConfig
          },
        ] as any;

        const basicAxisSettings = createMockAxisSettings();
        const result = withStacking(ctx)(basicAxisSettings);

        expect(result[0].labels?.formatter).toBeDefined();
        expect(result[1].labels?.formatter).toBeDefined();
      });
    });

    describe('formatter functions', () => {
      test('should format numeric values correctly for stacked type', () => {
        const ctx = createMockBuildContext('stacked', false, 0, { enabled: true });
        const basicAxisSettings = createMockAxisSettings();
        const result = withStacking(ctx)(basicAxisSettings);

        const formatter = result[0].labels?.formatter;
        expect(formatter).toBeDefined();
        const mockThis = { value: 1234.56, axis: { categories: [] } };
        const formattedResult = formatter?.call(mockThis);
        expect(formattedResult).toBe('formatted_1234.56');
      });

      test('should format string values correctly by parsing to number', () => {
        const ctx = createMockBuildContext('stacked', false, 0, { enabled: true });
        const basicAxisSettings = createMockAxisSettings();
        const result = withStacking(ctx)(basicAxisSettings);

        const formatter = result[0].labels?.formatter;
        expect(formatter).toBeDefined();
        const mockThis = { value: '1234.56', axis: { categories: [] } };
        const formattedResult = formatter?.call(mockThis);
        expect(formattedResult).toBe('formatted_1234.56');
      });

      test('should use total value for stack labels formatter', () => {
        const ctx = createMockBuildContext('stacked', true, 0, { enabled: true });
        const basicAxisSettings = createMockAxisSettings();
        const result = withStacking(ctx)(basicAxisSettings);

        const stackFormatter = (result[0].stackLabels as any)?.formatter;
        expect(stackFormatter).toBeDefined();
        const mockThis = { value: 500, total: 1000 };
        const formattedResult = stackFormatter?.call(mockThis);
        expect(formattedResult).toBe('formatted_1000');
      });

      test('should fallback to value when total is not available in stack labels', () => {
        const ctx = createMockBuildContext('stacked', true, 0, { enabled: true });
        const basicAxisSettings = createMockAxisSettings();
        const result = withStacking(ctx)(basicAxisSettings);

        const stackFormatter = (result[0].stackLabels as any)?.formatter;
        expect(stackFormatter).toBeDefined();
        const mockThis = { value: 500 }; // No total property
        const formattedResult = stackFormatter?.call(mockThis);
        expect(formattedResult).toBe('formatted_500');
      });

      test('should add percent sign for stack100 type', () => {
        const ctx = createMockBuildContext('stack100', false, 0, { enabled: true });
        const basicAxisSettings = createMockAxisSettings();
        const result = withStacking(ctx)(basicAxisSettings);

        const formatter = result[0].labels?.formatter;
        expect(formatter).toBeDefined();
        const mockThis = { value: 75, axis: { categories: [] } };
        const formattedResult = formatter?.call(mockThis);
        expect(formattedResult).toBe('formatted_75%');
      });

      test('should not add percent sign for normal stacking in stack labels', () => {
        const ctx = createMockBuildContext('stacked', true, 0, { enabled: true });
        const basicAxisSettings = createMockAxisSettings();
        const result = withStacking(ctx)(basicAxisSettings);

        const stackFormatter = (result[0].stackLabels as any)?.formatter;
        expect(stackFormatter).toBeDefined();
        const mockThis = { value: 100, total: 200 };
        const formattedResult = stackFormatter?.call(mockThis);
        expect(formattedResult).toBe('formatted_200');
      });
    });

    describe('axis preservation', () => {
      test('should preserve original axis properties not related to stacking', () => {
        const ctx = createMockBuildContext('stacked', true, 0, { enabled: true });
        const basicAxisSettings = createMockAxisSettings();
        const originalTitle = basicAxisSettings[0].title?.text;
        const originalGridLineWidth = basicAxisSettings[0].gridLineWidth;
        const originalMin = basicAxisSettings[0].min;

        const result = withStacking(ctx)(basicAxisSettings);

        expect(result[0].title?.text).toBe(originalTitle);
        expect(result[0].gridLineWidth).toBe(originalGridLineWidth);
        expect(result[0].min).toBe(originalMin);
      });

      test('should preserve all non-stacking axis settings', () => {
        const ctx = createMockBuildContext('stacked', false, 0, { enabled: true });
        const basicAxisSettings = createMockAxisSettings();
        basicAxisSettings[0].tickInterval = 10;
        basicAxisSettings[0].opposite = true;
        basicAxisSettings[0].visible = true;

        const result = withStacking(ctx)(basicAxisSettings);

        expect(result[0].tickInterval).toBe(10);
        expect(result[0].opposite).toBe(true);
        expect(result[0].visible).toBe(true);
      });
    });

    describe('single axis handling', () => {
      test('should work with single axis configuration', () => {
        const ctx = createMockBuildContext('stacked', true, 0, { enabled: true });
        const singleAxisSettings = [createMockAxisSettings()[0]];
        const result = withStacking(ctx)(singleAxisSettings);

        expect(result).toHaveLength(1);
        expect(result[0].stackLabels?.enabled).toBe(true);
        expect(result[0].labels?.formatter).toBeDefined();
      });
    });

    describe('edge cases', () => {
      test('should handle empty axis settings array', () => {
        const ctx = createMockBuildContext('stacked', true, 0, { enabled: true });
        const emptyAxisSettings: AxisSettings[] = [];
        const result = withStacking(ctx)(emptyAxisSettings);

        expect(result).toEqual([]);
      });

      test('should handle axis settings without labels property', () => {
        const ctx = createMockBuildContext('stacked', false, 0, { enabled: true });
        const axisSettingsWithoutLabels: AxisSettings[] = [
          {
            type: 'linear',
            title: { text: 'Test Axis' },
            // No labels property
          },
        ];

        const result = withStacking(ctx)(axisSettingsWithoutLabels);

        expect(result[0].labels?.formatter).toBeDefined();
        expect(result[0].labels?.enabled).toBeUndefined();
      });

      test('should handle axis settings without stackLabels property', () => {
        const ctx = createMockBuildContext('stacked', true, 0, { enabled: true });
        const axisSettingsWithoutStackLabels: AxisSettings[] = [
          {
            type: 'linear',
            title: { text: 'Test Axis' },
            labels: { enabled: true },
            // No stackLabels property
          },
        ];

        const result = withStacking(ctx)(axisSettingsWithoutStackLabels);

        expect(result[0].stackLabels?.enabled).toBe(true);
        expect((result[0].stackLabels as any)?.formatter).toBeDefined();
      });

      test('should handle missing y data options gracefully', () => {
        const ctx = createMockBuildContext('stacked', true, 0, { enabled: true });
        ctx.dataOptions.y = []; // Empty y options

        const basicAxisSettings = createMockAxisSettings();
        const result = withStacking(ctx)(basicAxisSettings);

        // Should still work, using default number format config
        expect(result[0].labels?.formatter).toBeDefined();
        expect((result[0].stackLabels as any)?.formatter).toBeDefined();
      });
    });

    describe('functional programming patterns', () => {
      test('should return a function that can be composed with other transformers', () => {
        const ctx = createMockBuildContext('stacked', true, 0, { enabled: true });
        const transformer = withStacking(ctx);

        expect(typeof transformer).toBe('function');

        const basicAxisSettings = createMockAxisSettings();
        const result = transformer(basicAxisSettings);

        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(basicAxisSettings.length);
      });

      test('should be pure function - not mutate original axis settings', () => {
        const ctx = createMockBuildContext('stacked', true, 0, { enabled: true });
        const basicAxisSettings = createMockAxisSettings();
        const originalSettings = JSON.parse(JSON.stringify(basicAxisSettings));

        withStacking(ctx)(basicAxisSettings);

        expect(basicAxisSettings).toEqual(originalSettings);
      });
    });
  });
});
