import { CATEGORICAL_CHART_TYPES, isTable, TABLE_TYPES } from './types.js';

describe('isTable', () => {
  it('should return true for valid table chart types', () => {
    TABLE_TYPES.forEach((chartType) => {
      expect(isTable(chartType)).toBe(true);
    });
  });

  it('should return false for invalid table chart types', () => {
    CATEGORICAL_CHART_TYPES.forEach((chartType) => {
      expect(isTable(chartType)).toBe(false);
    });
  });
});
