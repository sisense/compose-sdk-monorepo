import { describe, expect, test } from 'vitest';

import { barHighchartsOptionsBuilder } from './highcharts-options-builder';

describe('barHighchartsOptionsBuilder', () => {
  describe('builder API shape', () => {
    test('exposes expected methods', () => {
      expect(typeof barHighchartsOptionsBuilder.getChart).toBe('function');
      expect(typeof barHighchartsOptionsBuilder.getSeries).toBe('function');
      expect(typeof barHighchartsOptionsBuilder.getAxes).toBe('function');
      expect(typeof barHighchartsOptionsBuilder.getLegend).toBe('function');
      expect(typeof barHighchartsOptionsBuilder.getPlotOptions).toBe('function');
      expect(typeof barHighchartsOptionsBuilder.getTooltip).toBe('function');
      expect(typeof barHighchartsOptionsBuilder.getExtras).toBe('function');
    });
  });
});
