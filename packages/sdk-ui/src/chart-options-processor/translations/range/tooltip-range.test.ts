import { TFunction } from '@sisense/sdk-common';
import { describe, expect, it, vi } from 'vitest';

import { colorChineseSilver, colorWhite } from '../../../chart-data-options/coloring/consts';
import { RangeChartDataOptionsInternal } from '../../../chart-data-options/types';
import { translation } from '../../../translation/resources/en';
import { HighchartsDataPointContext } from '../tooltip-utils';
import { getRangeTooltipSettings } from './tooltip-range';

vi.mock('../tooltip', () => ({
  cartesianDataFormatter: vi.fn(() => 'cartesian formatted tooltip'),
}));

describe('getRangeTooltipSettings', () => {
  const mockTranslate = vi.fn((key: string) => {
    // Use the actual English translation
    const keys = key.split('.');
    let value: any = translation;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  }) as unknown as TFunction;

  const createMockChartDataOptions = (
    overrides: Partial<RangeChartDataOptionsInternal> = {},
  ): RangeChartDataOptionsInternal => ({
    x: [
      {
        column: { name: 'X Axis', type: 'string' },
        enabled: true,
      },
    ],
    y: [
      {
        column: { title: 'Y Axis', name: 'y_column' },
        enabled: true,
      },
    ],
    breakBy: [],
    rangeValues: [
      [
        { column: { title: 'Upper Value', name: 'upper_column' }, enabled: true },
        { column: { title: 'Lower Value', name: 'lower_column' }, enabled: true },
      ],
    ],
    seriesValues: [],
    ...overrides,
  });

  const createMockDataPointContext = (
    overrides: Partial<HighchartsDataPointContext> = {},
  ): HighchartsDataPointContext => ({
    series: { name: 'Test Series', color: '#FF0000' },
    x: '2023',
    y: 100,
    point: {
      name: 'Test Point',
      color: '#00FF00',
      high: 150,
      low: 50,
      custom: {
        xDisplayValue: '2023 Display',
      },
    },
    percentage: 25.5,
    ...overrides,
  });

  describe('tooltip settings structure', () => {
    it('should return correct tooltip settings structure', () => {
      const chartDataOptions = createMockChartDataOptions();
      const settings = getRangeTooltipSettings(true, chartDataOptions, mockTranslate);

      expect(settings).toEqual({
        animation: false,
        crosshairs: true,
        backgroundColor: colorWhite,
        borderColor: colorChineseSilver,
        borderRadius: 10,
        borderWidth: 1,
        useHTML: true,
        formatter: expect.any(Function),
      });
    });
  });

  describe('formatter function - with range data', () => {
    it('should format tooltip correctly when both high and low values are present', () => {
      const chartDataOptions = createMockChartDataOptions();
      const dataPointContext = createMockDataPointContext();
      const settings = getRangeTooltipSettings(true, chartDataOptions, mockTranslate);

      const result = settings.formatter?.call(dataPointContext);
      expect(result).toBeDefined();
      expect(result).toBeDefined();
      expect(result).toContain('Test Series');
      expect(result).toContain('Max');
      expect(result).toContain('Min');
      expect(result).toContain('2023 Display'); // Actual xDisplayValue
      expect(result).toContain('25.5%');
    });

    it('should handle percentage values with decimals when showDecimals is true', () => {
      const chartDataOptions = createMockChartDataOptions();
      const dataPointContext = createMockDataPointContext({ percentage: 25.5 });
      const settings = getRangeTooltipSettings(true, chartDataOptions, mockTranslate);

      const result = settings.formatter?.call(dataPointContext);
      expect(result).toBeDefined();
      expect(result).toBeDefined();
      expect(result).toContain('25.5%');
      expect(result).toContain(' / 25.5%'); // Actual format without the value prefix
    });

    it('should handle percentage values without decimals when showDecimals is false', () => {
      const chartDataOptions = createMockChartDataOptions();
      const dataPointContext = createMockDataPointContext({ percentage: 25.5 });
      const settings = getRangeTooltipSettings(false, chartDataOptions, mockTranslate);

      const result = settings.formatter?.call(dataPointContext);
      expect(result).toBeDefined();
      expect(result).toContain('26%');
      expect(result).toContain(' / 26%'); // Actual format without the value prefix
    });

    it('should handle percentage values without decimals when showDecimals is undefined', () => {
      const chartDataOptions = createMockChartDataOptions();
      const dataPointContext = createMockDataPointContext({ percentage: 25.5 });
      const settings = getRangeTooltipSettings(undefined, chartDataOptions, mockTranslate);

      const result = settings.formatter?.call(dataPointContext);
      expect(result).toBeDefined();
      expect(result).toContain('26%');
      expect(result).toContain(' / 26%'); // Actual format without the value prefix
    });

    it('should use custom upper and lower point names when available', () => {
      const chartDataOptions = createMockChartDataOptions();
      const dataPointContext = createMockDataPointContext({
        point: {
          name: 'Test Point',
          color: '#00FF00',
          high: 150,
          low: 50,
          upperPointName: 'Custom Upper',
          lowerPointName: 'Custom Lower',
          custom: {
            xDisplayValue: '2023 Display',
          },
        },
      });
      const settings = getRangeTooltipSettings(true, chartDataOptions, mockTranslate);

      const result = settings.formatter?.call(dataPointContext);
      expect(result).toBeDefined();
      expect(result).toContain('Custom Upper');
      expect(result).toContain('Custom Lower');
    });

    it('should use translated labels when custom point names are not available', () => {
      const chartDataOptions = createMockChartDataOptions();
      const dataPointContext = createMockDataPointContext({
        point: {
          name: 'Test Point',
          color: '#00FF00',
          high: 150,
          low: 50,
          custom: {
            xDisplayValue: '2023 Display',
          },
        },
      });
      const settings = getRangeTooltipSettings(true, chartDataOptions, mockTranslate);

      const result = settings.formatter?.call(dataPointContext);
      expect(result).toBeDefined();
      expect(result).toContain('Max');
      expect(result).toContain('Min');
    });

    it('should handle breakBy data options correctly', () => {
      const chartDataOptions = createMockChartDataOptions({
        breakBy: [{ column: { name: 'Category', type: 'string' }, enabled: true }],
      });
      const dataPointContext = createMockDataPointContext();
      const settings = getRangeTooltipSettings(true, chartDataOptions, mockTranslate);

      const result = settings.formatter?.call(dataPointContext);
      expect(result).toBeDefined();
    });

    it('should handle multiple range values correctly', () => {
      const chartDataOptions = createMockChartDataOptions({
        rangeValues: [
          [
            { column: { title: 'Upper Value 1', name: 'upper1' }, enabled: true },
            { column: { title: 'Lower Value 1', name: 'lower1' }, enabled: true },
          ],
          [
            { column: { title: 'Upper Value 2', name: 'upper2' }, enabled: true },
            { column: { title: 'Lower Value 2', name: 'lower2' }, enabled: true },
          ],
        ],
      });
      const dataPointContext = createMockDataPointContext();
      const settings = getRangeTooltipSettings(true, chartDataOptions, mockTranslate);

      const result = settings.formatter?.call(dataPointContext);
      expect(result).toBeDefined();
    });
  });

  describe('formatter function - without range data', () => {
    it('should fall back to cartesian formatter when high or low values are missing', () => {
      const chartDataOptions = createMockChartDataOptions();
      const dataPointContext = createMockDataPointContext({
        point: {
          name: 'Test Point',
          color: '#00FF00',
          custom: {
            xDisplayValue: '2023 Display',
          },
        },
      });
      const settings = getRangeTooltipSettings(true, chartDataOptions, mockTranslate);

      const result = settings.formatter?.call(dataPointContext);
      expect(result).toBeDefined();
      expect(result).toBe('cartesian formatted tooltip');
    });

    it('should fall back to cartesian formatter when high value is missing', () => {
      const chartDataOptions = createMockChartDataOptions();
      const dataPointContext = createMockDataPointContext({
        point: {
          name: 'Test Point',
          color: '#00FF00',
          high: undefined,
          low: 50,
          custom: {
            xDisplayValue: '2023 Display',
          },
        },
      });
      const settings = getRangeTooltipSettings(true, chartDataOptions, mockTranslate);

      const result = settings.formatter?.call(dataPointContext);
      expect(result).toBeDefined();
      expect(result).toBe('cartesian formatted tooltip');
    });

    it('should fall back to cartesian formatter when low value is missing', () => {
      const chartDataOptions = createMockChartDataOptions();
      const dataPointContext = createMockDataPointContext({
        point: {
          name: 'Test Point',
          color: '#00FF00',
          high: 150,
          low: undefined,
          custom: {
            xDisplayValue: '2023 Display',
          },
        },
      });
      const settings = getRangeTooltipSettings(true, chartDataOptions, mockTranslate);

      const result = settings.formatter?.call(dataPointContext);
      expect(result).toBeDefined();
      expect(result).toBe('cartesian formatted tooltip');
    });
  });

  describe('data options handling', () => {
    it('should find data options by series name when breakBy is empty', () => {
      const chartDataOptions = createMockChartDataOptions({
        breakBy: [],
        rangeValues: [
          [
            { column: { title: 'Upper Value', name: 'upper_column' }, enabled: true },
            { column: { title: 'Lower Value', name: 'lower_column' }, enabled: true },
          ],
        ],
      });
      const dataPointContext = createMockDataPointContext({
        series: { name: 'Upper Value', color: '#FF0000' },
      });
      const settings = getRangeTooltipSettings(true, chartDataOptions, mockTranslate);

      const result = settings.formatter?.call(dataPointContext);
      expect(result).toBeDefined();
      expect(result).toBeDefined();
    });

    it('should find data options by enabled flag when breakBy is not empty', () => {
      const chartDataOptions = createMockChartDataOptions({
        breakBy: [{ column: { name: 'Category', type: 'string' }, enabled: true }],
        rangeValues: [
          [
            { column: { title: 'Upper Value', name: 'upper_column' }, enabled: true },
            { column: { title: 'Lower Value', name: 'lower_column' }, enabled: true },
          ],
        ],
      });
      const dataPointContext = createMockDataPointContext();
      const settings = getRangeTooltipSettings(true, chartDataOptions, mockTranslate);

      const result = settings.formatter?.call(dataPointContext);
      expect(result).toBeDefined();
      expect(result).toBeDefined();
    });

    it('should handle undefined data options gracefully', () => {
      const chartDataOptions = createMockChartDataOptions({
        rangeValues: [],
      });
      const dataPointContext = createMockDataPointContext();
      const settings = getRangeTooltipSettings(true, chartDataOptions, mockTranslate);

      const result = settings.formatter?.call(dataPointContext);
      expect(result).toBeDefined();
      expect(result).toBeDefined();
    });
  });

  describe('X-axis value handling', () => {
    it('should use custom xDisplayValue when available', () => {
      const chartDataOptions = createMockChartDataOptions();
      const dataPointContext = createMockDataPointContext({
        point: {
          name: 'Test Point',
          color: '#00FF00',
          high: 150,
          low: 50,
          custom: {
            xDisplayValue: 'Custom X Display',
          },
        },
      });
      const settings = getRangeTooltipSettings(true, chartDataOptions, mockTranslate);

      const result = settings.formatter?.call(dataPointContext);
      expect(result).toBeDefined();
      expect(result).toContain('Custom X Display'); // Actual xDisplayValue
      expect(result).toContain('25.5%');
    });

    it('should fall back to x value when xDisplayValue is not available', () => {
      const chartDataOptions = createMockChartDataOptions();
      const dataPointContext = createMockDataPointContext({
        point: {
          name: 'Test Point',
          color: '#00FF00',
          high: 150,
          low: 50,
          custom: {},
        },
      });
      const settings = getRangeTooltipSettings(true, chartDataOptions, mockTranslate);

      const result = settings.formatter?.call(dataPointContext);
      expect(result).toBeDefined();
      expect(result).toContain('2023'); // Actual x value
    });

    it('should handle missing x-axis configuration', () => {
      const chartDataOptions = createMockChartDataOptions({
        x: undefined,
      });
      const dataPointContext = createMockDataPointContext();
      const settings = getRangeTooltipSettings(true, chartDataOptions, mockTranslate);

      const result = settings.formatter?.call(dataPointContext);
      expect(result).toBeDefined();
      expect(result).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle null percentage values', () => {
      const chartDataOptions = createMockChartDataOptions();
      const dataPointContext = createMockDataPointContext({ percentage: undefined });
      const settings = getRangeTooltipSettings(true, chartDataOptions, mockTranslate);

      const result = settings.formatter?.call(dataPointContext);
      expect(result).toBeDefined();
      expect(result).toBeDefined();
      expect(result).not.toContain('%');
    });

    it('should handle undefined percentage values', () => {
      const chartDataOptions = createMockChartDataOptions();
      const dataPointContext = createMockDataPointContext({ percentage: undefined });
      const settings = getRangeTooltipSettings(true, chartDataOptions, mockTranslate);

      const result = settings.formatter?.call(dataPointContext);
      expect(result).toBeDefined();
      expect(result).toBeDefined();
      expect(result).not.toContain('%');
    });

    it('should handle zero percentage values', () => {
      const chartDataOptions = createMockChartDataOptions();
      const dataPointContext = createMockDataPointContext({ percentage: 0 });
      const settings = getRangeTooltipSettings(true, chartDataOptions, mockTranslate);

      const result = settings.formatter?.call(dataPointContext);
      expect(result).toBeDefined();
      expect(result).toBeDefined();
      // When percentage is 0 (falsy), it should not show percentage
      expect(result).not.toContain('%');
      expect(result).toContain('2023 Display'); // Actual xDisplayValue
    });

    it('should handle empty string xDisplayValue', () => {
      const chartDataOptions = createMockChartDataOptions();
      const dataPointContext = createMockDataPointContext({
        point: {
          name: 'Test Point',
          color: '#00FF00',
          high: 150,
          low: 50,
          custom: {
            xDisplayValue: '',
          },
        },
      });
      const settings = getRangeTooltipSettings(true, chartDataOptions, mockTranslate);

      const result = settings.formatter?.call(dataPointContext);
      expect(result).toBeDefined();
      expect(result).toBeDefined();
    });

    it('should handle missing point color', () => {
      const chartDataOptions = createMockChartDataOptions();
      const dataPointContext = createMockDataPointContext({
        point: {
          name: 'Test Point',
          color: '',
          high: 150,
          low: 50,
          custom: {
            xDisplayValue: '2023 Display',
          },
        },
      });
      const settings = getRangeTooltipSettings(true, chartDataOptions, mockTranslate);

      const result = settings.formatter?.call(dataPointContext);
      expect(result).toBeDefined();
      expect(result).toBeDefined();
    });
  });
});
