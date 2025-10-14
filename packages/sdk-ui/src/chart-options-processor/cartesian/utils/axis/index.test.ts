/* eslint-disable sonarjs/no-identical-functions */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CartesianChartDataOptionsInternal } from '../../../../chart-data-options/types.js';
import { CompleteThemeSettings, NumberFormatConfig } from '../../../../types.js';
import { Axis, AxisMinMax } from '../../../translations/axis-section.js';
import {
  getDateFormatter,
  getXAxisDatetimeSettings,
  getXAxisSettings,
  getYAxisSettings,
  getYClippings,
  withChartSpecificAxisSettings,
  withPolarSpecificAxisSettings,
  withStacking,
} from './';

// Mock dependencies
vi.mock('../../../translations/number-format-config', () => ({
  applyFormatPlainText: vi.fn((config, value) => value.toString()),
  getCompleteNumberFormatConfig: vi.fn(
    (config) => config || { decimalScale: 2, symbol: '', prefix: true },
  ),
}));

vi.mock('@/chart-data-options/utils', () => ({
  getDataOptionGranularity: vi.fn(),
}));

vi.mock('../../../translations/axis-section', async () => {
  const actual = await vi.importActual('../../../translations/axis-section');
  return {
    ...actual,
    getDefaultDateFormat: vi.fn(() => 'MM/dd/yyyy'),
  };
});

describe('axis utils integration tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Integration: Combined axis settings and transformers', () => {
    const createMockAxis = (overrides?: Partial<Axis>): Axis => ({
      enabled: true,
      titleEnabled: true,
      title: 'Y Axis',
      labels: true,
      gridLine: true,
      type: 'linear',
      min: undefined,
      max: undefined,
      tickInterval: undefined,
      ...overrides,
    });

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

    const mockAxisMinMax: AxisMinMax = { min: 0, max: 100 };

    const mockThemeSettings: CompleteThemeSettings = {
      typography: {
        primaryTextColor: '#333333',
        secondaryTextColor: '#666666',
      },
    } as CompleteThemeSettings;

    it('should handle full Y-axis configuration with stacking', () => {
      const axis = createMockAxis();
      const dataOptions = createMockDataOptions();

      const basicAxisSettings = getYAxisSettings(
        axis,
        undefined,
        mockAxisMinMax,
        undefined,
        dataOptions,
        mockThemeSettings,
      );

      const axisSettings = withStacking({
        stacking: 'normal',
        totalLabels: { enabled: true, rotation: 45 },
        dataOptions,
        themeSettings: mockThemeSettings,
      })(basicAxisSettings);

      expect(axisSettings[0].stackLabels).toMatchObject({
        enabled: true,
        rotation: 45,
        style: {
          color: '#333333',
        },
      });
    });

    it('should handle polar chart transformations properly', () => {
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

    it('should preserve non-polar chart settings unchanged', () => {
      const axisSettings = [
        {
          title: { enabled: true, text: 'X Axis' },
          labels: { enabled: true, rotation: 45 },
          gridLineWidth: 1,
        },
      ];

      const result = withChartSpecificAxisSettings('column')(axisSettings);

      expect(result).toEqual(axisSettings);
      expect(result[0]?.labels?.rotation).toBe(45);
      expect(result[0]?.title).not.toHaveProperty('textAlign');
    });
  });

  describe('Integration: All functions are accessible through main export', () => {
    it('should export all date utility functions', () => {
      expect(getDateFormatter).toBeDefined();
      expect(getXAxisDatetimeSettings).toBeDefined();
    });

    it('should export all axis settings functions', () => {
      expect(getXAxisSettings).toBeDefined();
      expect(getYAxisSettings).toBeDefined();
      expect(getYClippings).toBeDefined();
    });

    it('should export all transformer functions', () => {
      expect(withStacking).toBeDefined();
      expect(withPolarSpecificAxisSettings).toBeDefined();
      expect(withChartSpecificAxisSettings).toBeDefined();
    });
  });
});
