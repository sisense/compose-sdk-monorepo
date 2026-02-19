import { describe, expect, test } from 'vitest';

import { getCartesianChartOptions } from './cartesian-chart-options.js';

describe('getCartesianChartOptions', () => {
  describe('API shape', () => {
    test('should be a function', () => {
      expect(typeof getCartesianChartOptions).toBe('function');
    });
  });
});
