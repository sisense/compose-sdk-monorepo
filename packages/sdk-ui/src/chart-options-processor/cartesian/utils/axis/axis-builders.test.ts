import { CartesianChartDataOptionsInternal } from '../../../../chart-data-options/types';
import { PolarChartDesignOptions } from '../../../translations/design-options';
import {
  getXAxisOrientation,
  hasSecondaryYAxis,
  isContinuousDatetimeXAxis,
  withYAxisNormalizationForPolar,
} from './axis-builders';

describe('axis-builders', () => {
  describe('isContinuousDatetimeXAxis', () => {
    it('should return true for single continuous datetime column', () => {
      const xDataOptions = [
        {
          column: { type: 'datetime', name: 'Date' },
          continuous: true,
        },
      ] as CartesianChartDataOptionsInternal['x'];

      expect(isContinuousDatetimeXAxis(xDataOptions)).toBe(true);
    });

    it('should return false for non-continuous column', () => {
      const xDataOptions = [
        {
          column: { type: 'datetime', name: 'Date' },
          continuous: false,
        },
      ] as CartesianChartDataOptionsInternal['x'];

      expect(isContinuousDatetimeXAxis(xDataOptions)).toBe(false);
    });

    it('should return false for non-datetime column', () => {
      const xDataOptions = [
        {
          column: { type: 'text', name: 'Category' },
          continuous: true,
        },
      ] as CartesianChartDataOptionsInternal['x'];

      expect(isContinuousDatetimeXAxis(xDataOptions)).toBe(false);
    });

    it('should return false for multiple columns', () => {
      const xDataOptions = [
        {
          column: { type: 'datetime', name: 'Date1' },
          continuous: true,
        },
        {
          column: { type: 'datetime', name: 'Date2' },
          continuous: true,
        },
      ] as CartesianChartDataOptionsInternal['x'];

      expect(isContinuousDatetimeXAxis(xDataOptions)).toBe(false);
    });

    it('should return false for empty array', () => {
      const xDataOptions = [] as CartesianChartDataOptionsInternal['x'];

      expect(isContinuousDatetimeXAxis(xDataOptions)).toBe(false);
    });
  });

  describe('getXAxisOrientation', () => {
    it('should return vertical for bar chart type', () => {
      const result = getXAxisOrientation('bar', ['line']);
      expect(result).toBe('vertical');
    });

    it('should return vertical when Y-axis has bar type', () => {
      const result = getXAxisOrientation('line', ['bar', 'line']);
      expect(result).toBe('vertical');
    });

    it('should return horizontal for non-bar chart types', () => {
      const result = getXAxisOrientation('line', ['line', 'area']);
      expect(result).toBe('horizontal');
    });

    it('should return horizontal for column chart', () => {
      const result = getXAxisOrientation('column', ['line']);
      expect(result).toBe('horizontal');
    });
  });

  describe('withYAxisNormalizationForPolar', () => {
    it('should disable title for polar charts', () => {
      const designOptions = {
        yAxis: {
          title: 'Y Axis',
          titleEnabled: true,
          enabled: true,
        },
        polarType: 'area',
        designPerSeries: {},
      } as PolarChartDesignOptions;

      const result = withYAxisNormalizationForPolar(designOptions);

      expect(result).toEqual({
        yAxis: {
          title: null,
          titleEnabled: false,
          enabled: true,
        },
        polarType: 'area',
        designPerSeries: {},
      });
    });

    it('should normalize Y-axis for polar charts', () => {
      const designOptions = {
        yAxis: {
          title: 'Y Axis',
          titleEnabled: true,
          enabled: true,
        },
        polarType: 'column',
        designPerSeries: {},
      } as PolarChartDesignOptions;

      const result = withYAxisNormalizationForPolar(designOptions);

      expect(result).toEqual({
        yAxis: {
          title: null,
          titleEnabled: false,
          enabled: true,
        },
        polarType: 'column',
        designPerSeries: {},
      });
    });

    it('should work as a contextless transformer that can be reused', () => {
      const polarDesignOptions1 = {
        yAxis: { title: 'Y1', titleEnabled: true },
        polarType: 'area',
        designPerSeries: {},
      } as PolarChartDesignOptions;

      const polarDesignOptions2 = {
        yAxis: { title: 'Y2', titleEnabled: true },
        polarType: 'line',
        designPerSeries: {},
      } as PolarChartDesignOptions;

      const result1 = withYAxisNormalizationForPolar(polarDesignOptions1);
      const result2 = withYAxisNormalizationForPolar(polarDesignOptions2);

      expect(result1.yAxis.titleEnabled).toBe(false);
      expect(result1.yAxis.title).toBeNull();
      expect(result2.yAxis.titleEnabled).toBe(false);
      expect(result2.yAxis.title).toBeNull();
    });
  });

  describe('hasSecondaryYAxis', () => {
    it('should return true when there are series on right axis', () => {
      const yAxisSide = [0, 1, 0, 1];
      expect(hasSecondaryYAxis(yAxisSide)).toBe(true);
    });

    it('should return false when all series are on left axis', () => {
      const yAxisSide = [0, 0, 0];
      expect(hasSecondaryYAxis(yAxisSide)).toBe(false);
    });

    it('should return false for empty array', () => {
      const yAxisSide: number[] = [];
      expect(hasSecondaryYAxis(yAxisSide)).toBe(false);
    });
  });

  // Note: Other functions like buildYAxisMeta, buildCategoriesMeta, buildStackingMeta,
  // buildXAxisSettings, buildYAxisMinMax, and buildYAxisSettings are thin wrappers
  // around existing functions and are better tested through integration tests
  // to avoid complex mocking scenarios.
});
