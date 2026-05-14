import { TFunction } from '@sisense/sdk-common';
import { describe, expect, it, vi } from 'vitest';

import { CartesianChartDataOptionsInternal } from '../../chart-data-options/types';
import { CartesianChartData } from '../../chart-data/types';
import { BaseDesignOptions } from '../translations/base-design-options';
import { LineChartDesignOptions } from '../translations/design-options';
import { getCartesianChartOptions } from './cartesian-chart-options.js';

const minimalChartData: CartesianChartData = {
  type: 'cartesian',
  xAxisCount: 1,
  xValues: [],
  series: [],
};

const minimalDesignOptions: LineChartDesignOptions = {
  ...(BaseDesignOptions as unknown as LineChartDesignOptions),
  designPerSeries: {},
  line: { width: 2 },
};

const translate = ((key: string) => key) as unknown as TFunction;

const makeDataOptions = (types: string[]): CartesianChartDataOptionsInternal => ({
  x: types.map((type) => ({
    column: { type, name: 'Dim' },
  })) as CartesianChartDataOptionsInternal['x'],
  y: [],
  breakBy: [],
});

describe('getCartesianChartOptions', () => {
  describe('API shape', () => {
    it('should be a function', () => {
      expect(typeof getCartesianChartOptions).toBe('function');
    });
  });

  describe('navigator guard in chart.events.load', () => {
    it('skips navigator update for 2 non-datetime X-axes', () => {
      const { options } = getCartesianChartOptions(
        minimalChartData,
        'line',
        minimalDesignOptions,
        makeDataOptions(['text', 'text']),
        translate,
      );

      const mockUpdate = vi.fn();
      const loadFn = (
        options.chart as {
          events?: {
            load?: (this: {
              chartWidth: number;
              chartHeight: number;
              update: ReturnType<typeof vi.fn>;
            }) => void;
          };
        }
      ).events?.load;
      expect(loadFn).toBeDefined();
      loadFn!.call({ chartWidth: 800, chartHeight: 400, update: mockUpdate });

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('runs navigator update for 2 datetime X-axes (doubled date granularity)', () => {
      const { options } = getCartesianChartOptions(
        minimalChartData,
        'line',
        minimalDesignOptions,
        makeDataOptions(['datetime', 'datetime']),
        translate,
      );

      const mockUpdate = vi.fn();
      const loadFn = (
        options.chart as {
          events?: {
            load?: (this: {
              chartWidth: number;
              chartHeight: number;
              update: ReturnType<typeof vi.fn>;
            }) => void;
          };
        }
      ).events?.load;
      loadFn!.call({ chartWidth: 800, chartHeight: 400, update: mockUpdate });

      expect(mockUpdate).toHaveBeenCalled();
    });

    it('runs navigator update for a single X-axis', () => {
      const { options } = getCartesianChartOptions(
        minimalChartData,
        'line',
        minimalDesignOptions,
        makeDataOptions(['datetime']),
        translate,
      );

      const mockUpdate = vi.fn();
      const loadFn = (
        options.chart as {
          events?: {
            load?: (this: {
              chartWidth: number;
              chartHeight: number;
              update: ReturnType<typeof vi.fn>;
            }) => void;
          };
        }
      ).events?.load;
      loadFn!.call({ chartWidth: 800, chartHeight: 400, update: mockUpdate });

      expect(mockUpdate).toHaveBeenCalled();
    });

    it('skips navigator update for 2 mixed (datetime + text) X-axes', () => {
      const { options } = getCartesianChartOptions(
        minimalChartData,
        'line',
        minimalDesignOptions,
        makeDataOptions(['datetime', 'text']),
        translate,
      );

      const mockUpdate = vi.fn();
      const loadFn = (
        options.chart as {
          events?: {
            load?: (this: {
              chartWidth: number;
              chartHeight: number;
              update: ReturnType<typeof vi.fn>;
            }) => void;
          };
        }
      ).events?.load;
      loadFn!.call({ chartWidth: 800, chartHeight: 400, update: mockUpdate });

      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe('line chart step in plotOptions.series', () => {
    it('sets step to false when design options omit step (clears step on merged Highcharts update)', () => {
      const { options } = getCartesianChartOptions(
        minimalChartData,
        'line',
        minimalDesignOptions,
        makeDataOptions(['datetime']),
        translate,
      );

      expect(options.plotOptions?.series?.step).toBe(false);
    });

    it('sets step to the design position when step line is enabled', () => {
      const { options } = getCartesianChartOptions(
        minimalChartData,
        'line',
        { ...minimalDesignOptions, step: 'center' },
        makeDataOptions(['datetime']),
        translate,
      );

      expect(options.plotOptions?.series?.step).toBe('center');
    });
  });
});
