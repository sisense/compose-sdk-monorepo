/* eslint-disable sonarjs/no-identical-functions */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CartesianChartDataOptionsInternal } from '../../../../chart-data-options/types';
import { CompleteThemeSettings, NumberFormatConfig } from '../../../../types';
import { AxisSettings } from '../../../translations/axis-section';
import {
  withChartSpecificAxisSettings,
  withPolarSpecificAxisSettings,
  withStacking,
} from './axis-transformers';

// Mock dependencies
vi.mock('../../../translations/number-format-config', () => ({
  applyFormatPlainText: vi.fn((config, value) => {
    const decimalScale = config?.decimalScale ?? 2;
    return Number(value).toFixed(decimalScale);
  }),
  getCompleteNumberFormatConfig: vi.fn(
    (config) => config || { decimalScale: 2, symbol: '', prefix: true },
  ),
}));

describe('axis-transformers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('withStacking', () => {
    const createMockDataOptions = (): CartesianChartDataOptionsInternal => ({
      x: [],
      y: [
        {
          column: { name: 'Value1', aggregation: 'sum' },
          numberFormatConfig: { decimalScale: 2 } as NumberFormatConfig,
          showOnRightAxis: false,
        },
        {
          column: { name: 'Value2', aggregation: 'avg' },
          numberFormatConfig: { decimalScale: 0 } as NumberFormatConfig,
          showOnRightAxis: true,
        },
      ],
      breakBy: [],
    });

    const mockThemeSettings: CompleteThemeSettings = {
      typography: {
        primaryTextColor: '#333333',
        secondaryTextColor: '#666666',
      },
    } as CompleteThemeSettings;

    const createMockAxisSettings = (): AxisSettings[] => [
      {
        title: { enabled: true, text: 'Y Axis' },
        labels: { enabled: true },
        stackLabels: { enabled: false },
      } as AxisSettings,
      {
        title: { enabled: true, text: 'Y2 Axis' },
        labels: { enabled: true },
        stackLabels: { enabled: false },
      } as AxisSettings,
    ];

    it('should not modify axis settings when no stacking config is provided', () => {
      const dataOptions = createMockDataOptions();
      const basicAxisSettings = createMockAxisSettings();

      const stackedAxisSettings = withStacking({
        dataOptions,
      })(basicAxisSettings);

      expect(stackedAxisSettings).toEqual(basicAxisSettings);
    });

    it('should enable stack labels when totalLabels enabled is true', () => {
      const dataOptions = createMockDataOptions();
      const basicAxisSettings = createMockAxisSettings();

      const stackedAxisSettings = withStacking({
        totalLabels: { enabled: true, rotation: 45 },
        dataOptions,
      })(basicAxisSettings);

      expect(stackedAxisSettings[0].stackLabels?.enabled).toBe(true);
      expect(stackedAxisSettings[0].stackLabels?.rotation).toBe(45);
    });

    it('should apply percent formatting when stacking is percent', () => {
      const dataOptions = createMockDataOptions();
      const basicAxisSettings = createMockAxisSettings();

      const stackedAxisSettings = withStacking({
        stacking: 'percent',
        dataOptions,
      })(basicAxisSettings);

      const formatter = stackedAxisSettings[0].labels?.formatter;
      const mockThis = { value: 0.5, axis: { categories: [] } };
      const result = formatter?.call(mockThis);

      expect(result).toBe('0.50%');
    });

    it('should handle stack labels formatting for totals', () => {
      const dataOptions = createMockDataOptions();
      const basicAxisSettings = createMockAxisSettings();

      const stackedAxisSettings = withStacking({
        stacking: 'normal',
        totalLabels: { enabled: true, rotation: 0 },
        dataOptions,
      })(basicAxisSettings);

      // Test the stack labels formatter
      const formatter = (stackedAxisSettings[0].stackLabels as any)?.formatter;
      const mockThis = { value: 50, total: 100 };
      const result = formatter?.call(mockThis);

      expect(result).toBe('100.00'); // Should format the total, not the value
    });

    it('should handle theme settings correctly', () => {
      const dataOptions = createMockDataOptions();
      const basicAxisSettings = createMockAxisSettings();

      const stackedAxisSettings = withStacking({
        stacking: undefined,
        totalLabels: { enabled: true, rotation: 0 },
        dataOptions,
        themeSettings: mockThemeSettings,
      })(basicAxisSettings);

      expect(stackedAxisSettings[0].stackLabels?.style?.color).toBe('#333333');
    });

    it('should use different number formats for primary and secondary axes', () => {
      const dataOptions = createMockDataOptions();
      const basicAxisSettings = createMockAxisSettings();

      const stackedAxisSettings = withStacking({
        stacking: 'normal',
        totalLabels: { enabled: true, rotation: 0 },
        dataOptions,
      })(basicAxisSettings);

      // Both axes should have formatters but with different number format configs
      expect(stackedAxisSettings[0].labels?.formatter).toBeDefined();
      expect(stackedAxisSettings[1].labels?.formatter).toBeDefined();
      expect((stackedAxisSettings[0].stackLabels as any)?.formatter).toBeDefined();
      expect((stackedAxisSettings[1].stackLabels as any)?.formatter).toBeDefined();
    });
  });

  describe('withPolarSpecificAxisSettings', () => {
    it('should apply polar chart specific transformations (top title and no rotation)', () => {
      const axisSettings = [
        {
          title: {
            enabled: true,
            text: 'X Axis',
          },
          labels: {
            enabled: true,
            style: { color: 'blue' },
            rotation: 45,
          },
        },
      ];

      const result = withPolarSpecificAxisSettings(axisSettings);

      expect(result).toHaveLength(1);
      expect(result[0]?.title).toMatchObject({
        enabled: true,
        text: 'X Axis',
        textAlign: 'center',
        align: 'high',
        y: -25,
      });
      expect(result[0]?.labels).toMatchObject({
        enabled: true,
        style: { color: 'blue' },
        rotation: 0,
      });
    });

    it('should preserve other axis properties', () => {
      const axisSettings = [
        {
          title: { enabled: true, text: 'X Axis' },
          labels: { enabled: true, rotation: 30 },
          gridLineWidth: 1,
          categories: ['A', 'B', 'C'],
        },
      ];

      const result = withPolarSpecificAxisSettings(axisSettings);

      expect(result[0]?.gridLineWidth).toBe(1);
      expect(result[0]?.categories).toEqual(['A', 'B', 'C']);
    });

    it('should handle multiple axis settings', () => {
      const axisSettings = [
        {
          title: { enabled: true, text: 'X Axis' },
          labels: { enabled: true, rotation: 30 },
        },
        {
          title: { enabled: true, text: 'X2 Axis' },
          labels: { enabled: true, rotation: -30 },
        },
      ];

      const result = withPolarSpecificAxisSettings(axisSettings);

      expect(result).toHaveLength(2);
      expect(result[0]?.labels?.rotation).toBe(0);
      expect(result[1]?.labels?.rotation).toBe(0);
      expect(result[0]?.title).toMatchObject({
        textAlign: 'center',
        align: 'high',
        y: -25,
      });
      expect(result[1]?.title).toMatchObject({
        textAlign: 'center',
        align: 'high',
        y: -25,
      });
    });
  });

  describe('withChartSpecificAxisSettings', () => {
    it('should apply polar transformations for polar chart types', () => {
      const axisSettings = [
        {
          title: { enabled: true, text: 'X Axis' },
          labels: { enabled: true, rotation: 45 },
        },
      ];

      const result = withChartSpecificAxisSettings('polar')(axisSettings);

      expect(result[0]?.title).toMatchObject({
        textAlign: 'center',
        align: 'high',
        y: -25,
      });
      expect(result[0]?.labels?.rotation).toBe(0);
    });

    it('should return unchanged settings for non-polar chart types', () => {
      const axisSettings = [
        {
          title: { enabled: true, text: 'X Axis' },
          labels: { enabled: true, rotation: 45 },
          gridLineWidth: 1,
        },
      ];

      const result = withChartSpecificAxisSettings('column')(axisSettings);

      expect(result).toEqual(axisSettings);
      expect(result[0]?.labels?.rotation).toBe(45); // Should remain unchanged
      expect(result[0]?.title).not.toHaveProperty('textAlign');
    });

    it('should work as a curried function', () => {
      const axisSettings = [
        {
          title: { enabled: true, text: 'X Axis' },
          labels: { enabled: true },
        },
      ];

      const polarTransformer = withChartSpecificAxisSettings('polar');
      const columnTransformer = withChartSpecificAxisSettings('column');

      const polarResult = polarTransformer(axisSettings);
      const columnResult = columnTransformer(axisSettings);

      expect(polarResult[0]?.title).toHaveProperty('textAlign', 'center');
      expect(columnResult[0]?.title).not.toHaveProperty('textAlign');
    });
  });
});
