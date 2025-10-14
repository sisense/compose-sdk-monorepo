import { describe, expect, test } from 'vitest';

import { columnHighchartsOptionsBuilder } from './highcharts-options-builder';

describe('columnHighchartsOptionsBuilder', () => {
  describe('builder API shape', () => {
    test('exposes expected methods', () => {
      expect(typeof columnHighchartsOptionsBuilder.getChart).toBe('function');
      expect(typeof columnHighchartsOptionsBuilder.getSeries).toBe('function');
      expect(typeof columnHighchartsOptionsBuilder.getAxes).toBe('function');
      expect(typeof columnHighchartsOptionsBuilder.getLegend).toBe('function');
      expect(typeof columnHighchartsOptionsBuilder.getPlotOptions).toBe('function');
      expect(typeof columnHighchartsOptionsBuilder.getTooltip).toBe('function');
      expect(typeof columnHighchartsOptionsBuilder.getExtras).toBe('function');
    });
  });
});
