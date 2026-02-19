import {
  getCartesianAttributes,
  getCartesianMeasures,
  isCartesianChartDataOptions,
  isCartesianChartDataOptionsInternal,
  translateCartesianChartDataOptions,
} from '../../helpers/data-options.js';
import { dataOptionsTranslators } from './index.js';

// Mock the helper functions
vi.mock('../../helpers/data-options', () => ({
  getCartesianAttributes: vi.fn(),
  getCartesianMeasures: vi.fn(),
  isCartesianChartDataOptions: vi.fn(),
  isCartesianChartDataOptionsInternal: vi.fn(),
  translateCartesianChartDataOptions: vi.fn(),
}));

describe('polar-chart data-options', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('dataOptionsTranslators', () => {
    it('should export the correct translator functions', () => {
      expect(dataOptionsTranslators).toEqual({
        translateDataOptionsToInternal: translateCartesianChartDataOptions,
        getAttributes: getCartesianAttributes,
        getMeasures: getCartesianMeasures,
        isCorrectDataOptions: isCartesianChartDataOptions,
        isCorrectDataOptionsInternal: isCartesianChartDataOptionsInternal,
      });
    });

    it('should use cartesian data options translators for polar charts', () => {
      // Verify that polar charts reuse cartesian chart logic
      expect(dataOptionsTranslators.translateDataOptionsToInternal).toBe(
        translateCartesianChartDataOptions,
      );
      expect(dataOptionsTranslators.getAttributes).toBe(getCartesianAttributes);
      expect(dataOptionsTranslators.getMeasures).toBe(getCartesianMeasures);
      expect(dataOptionsTranslators.isCorrectDataOptions).toBe(isCartesianChartDataOptions);
      expect(dataOptionsTranslators.isCorrectDataOptionsInternal).toBe(
        isCartesianChartDataOptionsInternal,
      );
    });

    it('should delegate calls to cartesian helpers', () => {
      const mockDataOptions = { x: [], y: [], breakBy: [] };
      const mockInternalDataOptions = { x: [], y: [], breakBy: [] };

      // Test translateDataOptionsToInternal delegation
      dataOptionsTranslators.translateDataOptionsToInternal(mockDataOptions as any);
      expect(translateCartesianChartDataOptions).toHaveBeenCalledWith(mockDataOptions);

      // Test getAttributes delegation
      dataOptionsTranslators.getAttributes(mockInternalDataOptions as any);
      expect(getCartesianAttributes).toHaveBeenCalledWith(mockInternalDataOptions);

      // Test getMeasures delegation
      dataOptionsTranslators.getMeasures(mockInternalDataOptions as any);
      expect(getCartesianMeasures).toHaveBeenCalledWith(mockInternalDataOptions);

      // Test isCorrectDataOptions delegation
      dataOptionsTranslators.isCorrectDataOptions(mockDataOptions as any);
      expect(isCartesianChartDataOptions).toHaveBeenCalledWith(mockDataOptions);

      // Test isCorrectDataOptionsInternal delegation
      dataOptionsTranslators.isCorrectDataOptionsInternal(mockInternalDataOptions as any);
      expect(isCartesianChartDataOptionsInternal).toHaveBeenCalledWith(mockInternalDataOptions);
    });
  });
});
