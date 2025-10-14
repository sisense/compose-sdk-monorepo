/* eslint-disable sonarjs/no-identical-functions */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CartesianChartDataOptionsInternal } from '../../../../chart-data-options/types';
import { NumberFormatConfig } from '../../../../types';
import { Axis, AxisMinMax, PlotBand } from '../../../translations/axis-section';
import { getXAxisSettings, getYAxisSettings, getYClippings } from './axis-settings';

// Mock dependencies
vi.mock('../../../translations/number-format-config', () => ({
  applyFormatPlainText: vi.fn((config, value) => value.toString()),
  getCompleteNumberFormatConfig: vi.fn(
    (config) => config || { decimalScale: 2, symbol: '', prefix: true },
  ),
}));

describe('axis-settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getXAxisSettings', () => {
    const createMockAxis = (overrides?: Partial<Axis>): Axis => ({
      enabled: true,
      titleEnabled: true,
      title: 'X Axis',
      labels: true,
      gridLine: true,
      min: undefined,
      max: undefined,
      tickInterval: undefined,
      ...overrides,
    });

    const createMockDataOptions = (): CartesianChartDataOptionsInternal => ({
      x: [
        {
          column: { name: 'Category', type: 'string' },
          numberFormatConfig: { decimalScale: 0 } as NumberFormatConfig,
        },
      ],
      y: [],
      breakBy: [],
    });

    const mockPlotBands: PlotBand[] = [
      { from: 1, to: 3, text: 'Band 1' },
      { from: 5, to: 7, text: 'Band 2' },
    ];

    it('should create basic categorical X-axis settings', () => {
      const axis = createMockAxis();
      const categories = ['A', 'B', 'C'];
      const dataOptions = createMockDataOptions();

      const result = getXAxisSettings(axis, undefined, categories, [], 'horizontal', dataOptions);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        title: {
          enabled: true,
          text: 'X Axis',
        },
        categories,
        gridLineWidth: 1,
        labels: { enabled: true },
      });
      expect(result[0]?.type).toBeUndefined(); // axis.type is undefined by default
    });

    it('should create X-axis settings with secondary axis', () => {
      const axis = createMockAxis();
      const axis2 = createMockAxis({ title: 'X2 Axis' });
      const categories = ['A', 'B', 'C'];
      const dataOptions = createMockDataOptions();

      const result = getXAxisSettings(axis, axis2, categories, [], 'horizontal', dataOptions);

      expect(result).toHaveLength(2);
      expect(result[1]).toMatchObject({
        title: {
          enabled: true,
          text: 'X2 Axis',
        },
        opposite: true,
        gridLineWidth: 0,
        lineWidth: 0,
      });
    });

    it('should handle plot bands correctly', () => {
      const axis = createMockAxis();
      const categories = ['A', 'B', 'C'];
      const dataOptions = createMockDataOptions();

      const result = getXAxisSettings(
        axis,
        undefined,
        categories,
        mockPlotBands,
        'horizontal',
        dataOptions,
      );

      expect(result[0]?.plotBands).toHaveLength(2);
      expect(result[0]?.plotBands?.[0]).toMatchObject({
        isPlotBand: true,
        from: 1,
        to: 3,
        label: { text: 'Band 1' },
      });
    });

    it('should handle plot lines correctly', () => {
      const axis = createMockAxis();
      const categories = ['A', 'B', 'C'];
      const dataOptions = createMockDataOptions();
      const plotBandsWithLines: PlotBand[] = [
        { from: 1, to: 3, text: 'Band 1' },
        { from: 0, to: 2, text: 'Band 2' }, // from: 0 should not create plot line
      ];

      const result = getXAxisSettings(
        axis,
        undefined,
        categories,
        plotBandsWithLines,
        'horizontal',
        dataOptions,
      );

      expect(result[0]?.plotLines).toHaveLength(1);
      expect(result[0]?.plotLines?.[0]).toMatchObject({
        color: '#C0D0E0',
        dashStyle: 'shortDot',
        width: 1,
        value: 1,
      });
    });

    it('should handle vertical orientation for plot bands', () => {
      const axis = createMockAxis();
      const categories = ['A', 'B', 'C'];
      const dataOptions = createMockDataOptions();

      const result = getXAxisSettings(
        axis,
        undefined,
        categories,
        mockPlotBands,
        'vertical',
        dataOptions,
      );

      expect(result[0]?.plotBands?.[0]?.label).toMatchObject({
        align: 'right',
        x: 5,
        textAlign: 'left',
        y: 0,
      });
    });

    it('should create basic axis settings without chart-specific styling', () => {
      const axis = createMockAxis();
      const categories = ['A', 'B', 'C'];
      const dataOptions = createMockDataOptions();

      const result = getXAxisSettings(axis, undefined, categories, [], 'horizontal', dataOptions);

      // Verify that no chart-specific styling is applied
      expect(result[0]?.title).toMatchObject({
        enabled: true,
        text: 'X Axis',
      });
      expect(result[0]?.title).not.toHaveProperty('textAlign');
      expect(result[0]?.title).not.toHaveProperty('align');
      expect(result[0]?.title).not.toHaveProperty('y');
      expect(result[0]?.labels).not.toHaveProperty('rotation');
    });

    it('should handle disabled axis elements', () => {
      const axis = createMockAxis({
        enabled: false,
        titleEnabled: false,
        labels: false,
        gridLine: false,
      });
      const categories = ['A', 'B', 'C'];
      const dataOptions = createMockDataOptions();

      const result = getXAxisSettings(axis, undefined, categories, [], 'horizontal', dataOptions);

      expect(result[0]).toMatchObject({
        title: { enabled: false },
        gridLineWidth: 0,
        labels: { enabled: false },
      });
    });

    it('should apply axis min, max, and tickInterval', () => {
      const axis = createMockAxis({
        min: 0,
        max: 10,
        tickInterval: 2,
      });
      const categories = ['A', 'B', 'C'];
      const dataOptions = createMockDataOptions();

      const result = getXAxisSettings(axis, undefined, categories, [], 'horizontal', dataOptions);

      expect(result[0]).toMatchObject({
        min: 0,
        max: 10,
        tickInterval: 2,
      });
    });
  });

  describe('getYAxisSettings', () => {
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
    const mockAxis2MinMax: AxisMinMax = { min: -50, max: 50 };

    it('should create basic Y-axis settings with single axis', () => {
      const axis = createMockAxis();
      const dataOptions = createMockDataOptions();

      const axisSettings = getYAxisSettings(
        axis,
        undefined,
        mockAxisMinMax,
        undefined,
        dataOptions,
      );

      expect(axisSettings).toHaveLength(1);
      expect(axisSettings[0]).toMatchObject({
        type: 'linear',
        title: {
          enabled: true,
          text: 'Y Axis',
        },
        min: 0,
        max: 100,
        gridLineWidth: 1,
        labels: { enabled: true },
        startOnTick: true,
      });
    });

    it('should create Y-axis settings with secondary axis', () => {
      const axis = createMockAxis();
      const axis2 = createMockAxis({ title: 'Y2 Axis' });
      const dataOptions = createMockDataOptions();

      const axisSettings = getYAxisSettings(
        axis,
        axis2,
        mockAxisMinMax,
        mockAxis2MinMax,
        dataOptions,
      );

      expect(axisSettings).toHaveLength(2);
      expect(axisSettings[1]).toMatchObject({
        opposite: true,
        gridLineWidth: 0,
        title: {
          enabled: true,
          text: 'Y2 Axis',
        },
        min: -50,
        max: 50,
      });
    });

    it('should handle manual min/max values', () => {
      const axis = createMockAxis({ min: 10, max: 90 });
      const dataOptions = createMockDataOptions();

      const axisSettings = getYAxisSettings(
        axis,
        undefined,
        mockAxisMinMax,
        undefined,
        dataOptions,
      );

      expect(axisSettings[0]).toMatchObject({
        min: 10,
        max: 90,
        startOnTick: false,
        minPadding: 0,
        maxPadding: 0,
      });
    });

    it('should handle disabled axis elements', () => {
      const axis = createMockAxis({
        enabled: false,
        titleEnabled: false,
        labels: false,
        gridLine: false,
      });
      const dataOptions = createMockDataOptions();

      const axisSettings = getYAxisSettings(
        axis,
        undefined,
        mockAxisMinMax,
        undefined,
        dataOptions,
      );

      expect(axisSettings[0]).toMatchObject({
        title: { enabled: false },
        gridLineWidth: 0,
        labels: { enabled: false },
        min: null,
        max: null,
        tickInterval: null,
      });
    });

    it('should handle disabled secondary axis', () => {
      const axis = createMockAxis();
      const axis2 = createMockAxis({ enabled: false });
      const dataOptions = createMockDataOptions();

      const axisSettings = getYAxisSettings(
        axis,
        axis2,
        mockAxisMinMax,
        mockAxis2MinMax,
        dataOptions,
      );

      expect(axisSettings[1]).toMatchObject({
        visible: false,
      });
    });

    it('should apply tick intervals correctly', () => {
      const axis = createMockAxis({ tickInterval: 10 });
      const axis2 = createMockAxis({ tickInterval: 5 });
      const dataOptions = createMockDataOptions();

      const axisSettings = getYAxisSettings(
        axis,
        axis2,
        mockAxisMinMax,
        mockAxis2MinMax,
        dataOptions,
      );

      expect(axisSettings[0].tickInterval).toBe(10);
      expect(axisSettings[1].tickInterval).toBe(5);
    });

    it('should handle missing secondary axis min/max', () => {
      const axis = createMockAxis();
      const dataOptions = createMockDataOptions();

      const axisSettings = getYAxisSettings(
        axis,
        undefined,
        mockAxisMinMax,
        undefined,
        dataOptions,
      );

      expect(axisSettings).toHaveLength(1);
    });
  });

  describe('getYClippings', () => {
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

    const mockAxis2MinMax: AxisMinMax = { min: -50, max: 50 };

    it('should create basic Y-axis clipping information with single axis', () => {
      const axis = createMockAxis();

      const axisClipped = getYClippings(axis, undefined, undefined);

      expect(axisClipped).toHaveLength(1);
      expect(axisClipped[0]).toEqual({
        minClipped: false,
        maxClipped: false,
      });
    });

    it('should create Y-axis clipping information with secondary axis', () => {
      const axis = createMockAxis();
      const axis2 = createMockAxis({ title: 'Y2 Axis' });

      const axisClipped = getYClippings(axis, axis2, mockAxis2MinMax);

      expect(axisClipped).toHaveLength(2);
      expect(axisClipped[0]).toEqual({
        minClipped: false,
        maxClipped: false,
      });
      expect(axisClipped[1]).toEqual({
        minClipped: false,
        maxClipped: false,
      });
    });

    it('should handle manual min/max clipping for primary axis', () => {
      const axis = createMockAxis({ min: 10, max: 90 });

      const axisClipped = getYClippings(axis, undefined, undefined);

      expect(axisClipped[0]).toEqual({
        minClipped: true,
        maxClipped: true,
      });
    });

    it('should handle manual min/max clipping for secondary axis', () => {
      const axis = createMockAxis();
      const axis2 = createMockAxis({ min: 5, max: 95 });

      const axisClipped = getYClippings(axis, axis2, mockAxis2MinMax);

      expect(axisClipped).toHaveLength(2);
      expect(axisClipped[0]).toEqual({
        minClipped: false,
        maxClipped: false,
      });
      expect(axisClipped[1]).toEqual({
        minClipped: true,
        maxClipped: true,
      });
    });

    it('should handle disabled axes correctly', () => {
      const axis = createMockAxis({ enabled: false, min: 10, max: 90 });
      const axis2 = createMockAxis({ enabled: false, min: 5, max: 95 });

      const axisClipped = getYClippings(axis, axis2, mockAxis2MinMax);

      expect(axisClipped).toHaveLength(2);
      expect(axisClipped[0]).toEqual({
        minClipped: false,
        maxClipped: false,
      });
      expect(axisClipped[1]).toEqual({
        minClipped: false,
        maxClipped: false,
      });
    });

    it('should handle missing secondary axis min/max', () => {
      const axis = createMockAxis();

      const axisClipped = getYClippings(axis, undefined, undefined);

      expect(axisClipped).toHaveLength(1);
    });

    it('should handle partial clipping (only min or max)', () => {
      const axis = createMockAxis({ min: 10 });
      const axis2 = createMockAxis({ max: 95 });

      const axisClipped = getYClippings(axis, axis2, mockAxis2MinMax);

      expect(axisClipped[0]).toEqual({
        minClipped: true,
        maxClipped: false,
      });
      expect(axisClipped[1]).toEqual({
        minClipped: false,
        maxClipped: true,
      });
    });
  });
});
