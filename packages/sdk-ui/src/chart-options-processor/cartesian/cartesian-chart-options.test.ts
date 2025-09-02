import { describe, test, expect } from 'vitest';
import { getCartesianChartOptions } from './cartesian-chart-options';

describe('getCartesianChartOptions', () => {
  describe('API shape', () => {
    test('should be a function', () => {
      expect(typeof getCartesianChartOptions).toBe('function');
    });
  });
});
