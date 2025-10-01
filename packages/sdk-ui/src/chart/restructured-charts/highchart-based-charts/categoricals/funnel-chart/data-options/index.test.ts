import { describe, expect, it, vi } from 'vitest';
import { dataOptionsTranslators } from './index';
import { FunnelChartDataOptions, FunnelChartDataOptionsInternal } from '../types';
import { ChartDataOptions, ChartDataOptionsInternal } from '@/chart-data-options/types';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { measureFactory } from '@ethings-os/sdk-data';

// Mock console.warn for validation tests
const consoleSpy = vi.spyOn(console, 'warn');

beforeEach(() => {
  consoleSpy.mockClear();
});

afterAll(() => {
  consoleSpy.mockRestore();
});

// Test helper to create mock funnel chart data options
const createMockFunnelDataOptions = (categories = 1, values = 1): FunnelChartDataOptions => {
  const categoryAttributes = [
    DM.Commerce.Condition,
    DM.Commerce.AgeRange,
    DM.Commerce.Gender,
    DM.Commerce.CountryID,
  ].slice(0, categories);

  const valueAttributes = [
    measureFactory.sum(DM.Commerce.Revenue),
    measureFactory.sum(DM.Commerce.Cost),
    measureFactory.sum(DM.Commerce.Quantity),
  ].slice(0, values);

  return {
    category: categoryAttributes,
    value: valueAttributes,
  };
};

// Test helper to create mock internal data options
const createMockInternalDataOptions = (
  categories = 1,
  values = 1,
): FunnelChartDataOptionsInternal => {
  const categoryAttributes = [
    DM.Commerce.Condition,
    DM.Commerce.AgeRange,
    DM.Commerce.Gender,
    DM.Commerce.CountryID,
  ].slice(0, categories);

  const valueAttributes = [
    measureFactory.sum(DM.Commerce.Revenue),
    measureFactory.sum(DM.Commerce.Cost),
    measureFactory.sum(DM.Commerce.Quantity),
  ].slice(0, values);

  // Translate to proper internal format (y and breakBy)
  const internalOptions: FunnelChartDataOptionsInternal = {
    y: valueAttributes.map((m) => ({ column: m })),
    breakBy: categoryAttributes.map((c) => ({ column: c })),
  };

  return internalOptions;
};

describe('dataOptionsTranslators', () => {
  describe('translateDataOptionsToInternal', () => {
    it('should translate basic funnel chart data options to internal format', () => {
      const dataOptions = createMockFunnelDataOptions(2, 1);
      const result = dataOptionsTranslators.translateDataOptionsToInternal(dataOptions);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('y');
      expect(result).toHaveProperty('breakBy');
      expect(result.y).toHaveLength(1);
      expect(result.breakBy).toHaveLength(2);
    });

    it('should handle empty categories', () => {
      const dataOptions = createMockFunnelDataOptions(0, 1);
      const result = dataOptionsTranslators.translateDataOptionsToInternal(dataOptions);

      expect(result.breakBy).toHaveLength(0);
      expect(result.y).toHaveLength(1);
    });

    it('should handle empty values', () => {
      const dataOptions = createMockFunnelDataOptions(1, 0);
      const result = dataOptionsTranslators.translateDataOptionsToInternal(dataOptions);

      expect(result.breakBy).toHaveLength(1);
      expect(result.y).toHaveLength(0);
    });

    it('should handle multiple categories and values', () => {
      const dataOptions = createMockFunnelDataOptions(3, 2);
      const result = dataOptionsTranslators.translateDataOptionsToInternal(dataOptions);

      expect(result.breakBy).toHaveLength(3);
      expect(result.y).toHaveLength(2);
    });

    it('should preserve data structure and properties', () => {
      const dataOptions: FunnelChartDataOptions = {
        category: [DM.Commerce.Condition],
        value: [measureFactory.sum(DM.Commerce.Revenue)],
        seriesToColorMap: {
          'Series 1': '#ff0000',
          'Series 2': '#00ff00',
        },
      };

      const result = dataOptionsTranslators.translateDataOptionsToInternal(dataOptions);

      expect(result).toBeDefined();
      expect(result.breakBy).toHaveLength(1);
      expect(result.y).toHaveLength(1);
      expect(result.breakBy[0]).toHaveProperty('column');
      expect(result.y[0]).toHaveProperty('column');
    });
  });

  describe('getAttributes', () => {
    it('should extract attributes from internal data options', () => {
      const internalDataOptions = createMockInternalDataOptions(2, 1);
      const attributes = dataOptionsTranslators.getAttributes(internalDataOptions);

      expect(attributes).toBeInstanceOf(Array);
      expect(attributes).toHaveLength(2);
      attributes.forEach((attr) => {
        expect(attr).toHaveProperty('name');
        expect(attr).toHaveProperty('type');
      });
    });

    it('should return empty array when no categories', () => {
      const internalDataOptions = createMockInternalDataOptions(0, 1);
      const attributes = dataOptionsTranslators.getAttributes(internalDataOptions);

      expect(attributes).toEqual([]);
    });

    it('should handle multiple attributes', () => {
      const internalDataOptions = createMockInternalDataOptions(3, 1);
      const attributes = dataOptionsTranslators.getAttributes(internalDataOptions);

      expect(attributes).toHaveLength(3);
    });

    it('should return proper Attribute objects', () => {
      const internalDataOptions = createMockInternalDataOptions(1, 1);
      const attributes = dataOptionsTranslators.getAttributes(internalDataOptions);

      expect(attributes).toHaveLength(1);
      expect(attributes[0]).toHaveProperty('name');
      expect(attributes[0]).toHaveProperty('type');
      expect(typeof attributes[0].name).toBe('string');
    });
  });

  describe('getMeasures', () => {
    it('should extract measures from internal data options', () => {
      const internalDataOptions = createMockInternalDataOptions(1, 2);
      const measures = dataOptionsTranslators.getMeasures(internalDataOptions);

      expect(measures).toBeInstanceOf(Array);
      expect(measures).toHaveLength(2);
      measures.forEach((measure) => {
        expect(measure).toHaveProperty('name');
        expect(measure).toHaveProperty('aggregation');
      });
    });

    it('should return empty array when no values', () => {
      const internalDataOptions = createMockInternalDataOptions(1, 0);
      const measures = dataOptionsTranslators.getMeasures(internalDataOptions);

      expect(measures).toEqual([]);
    });

    it('should handle single measure', () => {
      const internalDataOptions = createMockInternalDataOptions(1, 1);
      const measures = dataOptionsTranslators.getMeasures(internalDataOptions);

      expect(measures).toHaveLength(1);
      expect(measures[0]).toHaveProperty('name');
      expect(measures[0]).toHaveProperty('aggregation');
    });

    it('should return proper Measure objects', () => {
      const internalDataOptions = createMockInternalDataOptions(1, 1);
      const measures = dataOptionsTranslators.getMeasures(internalDataOptions);

      expect(measures).toHaveLength(1);
      expect(measures[0]).toHaveProperty('name');
      expect(measures[0]).toHaveProperty('aggregation');
      expect(typeof measures[0].name).toBe('string');
    });
  });

  describe('validateAndCleanDataOptions', () => {
    it('should enforce category limitation (max 3)', () => {
      const dataOptions = createMockFunnelDataOptions(5, 1); // Exceeds limit
      const result = dataOptionsTranslators.validateAndCleanDataOptions(dataOptions);

      expect(result.category).toHaveLength(3); // Limited to 3
      expect(result.value).toHaveLength(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Maximum 'category' length is limited to 3"),
      );
    });

    it('should enforce value limitation (max 1) when categories are present', () => {
      const dataOptions = createMockFunnelDataOptions(2, 3); // Exceeds value limit
      const result = dataOptionsTranslators.validateAndCleanDataOptions(dataOptions);

      expect(result.category).toHaveLength(2);
      expect(result.value).toHaveLength(1); // Limited to 1
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Maximum 'value' length is limited to 1"),
      );
    });

    it('should not apply value limitation when no categories are present', () => {
      const dataOptions = createMockFunnelDataOptions(0, 3); // No categories
      const result = dataOptionsTranslators.validateAndCleanDataOptions(dataOptions);

      expect(result.category).toHaveLength(0);
      expect(result.value).toHaveLength(3); // Not limited
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should not modify data options within limits', () => {
      const dataOptions = createMockFunnelDataOptions(2, 1); // Within limits
      const result = dataOptionsTranslators.validateAndCleanDataOptions(dataOptions);

      expect(result.category).toHaveLength(2);
      expect(result.value).toHaveLength(1);
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should handle edge case with exactly the limit', () => {
      const dataOptions = createMockFunnelDataOptions(3, 1); // Exactly at limit
      const result = dataOptionsTranslators.validateAndCleanDataOptions(dataOptions);

      expect(result.category).toHaveLength(3);
      expect(result.value).toHaveLength(1);
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should apply both limitations when necessary', () => {
      const dataOptions = createMockFunnelDataOptions(5, 3); // Both exceed limits
      const result = dataOptionsTranslators.validateAndCleanDataOptions(dataOptions);

      expect(result.category).toHaveLength(3);
      expect(result.value).toHaveLength(1);
      expect(consoleSpy).toHaveBeenCalledTimes(2);
    });

    it('should preserve seriesToColorMap and other properties', () => {
      const dataOptions: FunnelChartDataOptions = {
        category: [DM.Commerce.Condition, DM.Commerce.AgeRange],
        value: [measureFactory.sum(DM.Commerce.Revenue)],
        seriesToColorMap: {
          'Series 1': '#ff0000',
        },
      };

      const result = dataOptionsTranslators.validateAndCleanDataOptions(dataOptions);

      expect(result.seriesToColorMap).toEqual(dataOptions.seriesToColorMap);
    });
  });

  describe('isCorrectDataOptions', () => {
    it('should return true for valid funnel chart data options', () => {
      const dataOptions: ChartDataOptions = createMockFunnelDataOptions(1, 1);
      const result = dataOptionsTranslators.isCorrectDataOptions(dataOptions);

      expect(result).toBe(true);
    });

    it('should return true for categorical data options', () => {
      const dataOptions: ChartDataOptions = {
        category: [DM.Commerce.Condition],
        value: [measureFactory.sum(DM.Commerce.Revenue)],
      };
      const result = dataOptionsTranslators.isCorrectDataOptions(dataOptions);

      expect(result).toBe(true);
    });

    it('should return false for non-categorical data options', () => {
      const dataOptions: ChartDataOptions = {
        x: [DM.Commerce.Condition],
        y: [measureFactory.sum(DM.Commerce.Revenue)],
        breakBy: [],
      } as any; // Cartesian data options

      const result = dataOptionsTranslators.isCorrectDataOptions(dataOptions);

      expect(result).toBe(false);
    });

    it('should handle empty data options', () => {
      const dataOptions: ChartDataOptions = {
        category: [],
        value: [],
      };
      const result = dataOptionsTranslators.isCorrectDataOptions(dataOptions);

      expect(result).toBe(true);
    });
  });

  describe('isCorrectDataOptionsInternal', () => {
    it('should return true for valid internal funnel chart data options', () => {
      const dataOptions: ChartDataOptionsInternal = createMockInternalDataOptions(1, 1);
      const result = dataOptionsTranslators.isCorrectDataOptionsInternal(dataOptions);

      expect(result).toBe(true);
    });

    it('should return true for categorical internal data options', () => {
      const dataOptions: ChartDataOptionsInternal = {
        y: [
          {
            column: measureFactory.sum(DM.Commerce.Revenue),
          },
        ],
        breakBy: [
          {
            column: DM.Commerce.Condition,
          },
        ],
      };
      const result = dataOptionsTranslators.isCorrectDataOptionsInternal(dataOptions);

      expect(result).toBe(true);
    });

    it('should return false for non-categorical internal data options', () => {
      const dataOptions: ChartDataOptionsInternal = {
        value: [{ name: 'value', type: 'measure', enabled: true }],
        secondary: [],
      } as any; // Indicator data options

      const result = dataOptionsTranslators.isCorrectDataOptionsInternal(dataOptions);

      expect(result).toBe(false);
    });

    it('should handle empty internal data options', () => {
      const dataOptions: ChartDataOptionsInternal = {
        y: [],
        breakBy: [],
      };
      const result = dataOptionsTranslators.isCorrectDataOptionsInternal(dataOptions);

      expect(result).toBe(true);
    });
  });

  describe('integration tests for complete data options flow', () => {
    it('should handle complete data options workflow', () => {
      // Start with external data options
      const externalDataOptions = createMockFunnelDataOptions(2, 1);

      // Validate and clean
      const cleanedOptions =
        dataOptionsTranslators.validateAndCleanDataOptions(externalDataOptions);
      expect(cleanedOptions.category).toHaveLength(2);
      expect(cleanedOptions.value).toHaveLength(1);

      // Check if correct format
      expect(dataOptionsTranslators.isCorrectDataOptions(cleanedOptions)).toBe(true);

      // Translate to internal
      const internalOptions = dataOptionsTranslators.translateDataOptionsToInternal(cleanedOptions);
      expect(internalOptions.breakBy).toHaveLength(2);
      expect(internalOptions.y).toHaveLength(1);

      // Check if correct internal format
      expect(dataOptionsTranslators.isCorrectDataOptionsInternal(internalOptions)).toBe(true);

      // Extract attributes and measures
      const attributes = dataOptionsTranslators.getAttributes(internalOptions);
      const measures = dataOptionsTranslators.getMeasures(internalOptions);

      expect(attributes).toHaveLength(2);
      expect(measures).toHaveLength(1);
    });

    it('should handle workflow with excessive data options', () => {
      // Start with data options that exceed limits
      const excessiveDataOptions = createMockFunnelDataOptions(5, 3);

      // Validate and clean should limit them
      const cleanedOptions =
        dataOptionsTranslators.validateAndCleanDataOptions(excessiveDataOptions);
      expect(cleanedOptions.category).toHaveLength(3); // Limited
      expect(cleanedOptions.value).toHaveLength(1); // Limited

      // Rest of the workflow should work normally
      const internalOptions = dataOptionsTranslators.translateDataOptionsToInternal(cleanedOptions);
      const attributes = dataOptionsTranslators.getAttributes(internalOptions);
      const measures = dataOptionsTranslators.getMeasures(internalOptions);

      expect(attributes).toHaveLength(3);
      expect(measures).toHaveLength(1);
    });

    it('should work with real-world data model attributes and measures', () => {
      const realWorldDataOptions: FunnelChartDataOptions = {
        category: [DM.Commerce.Condition, DM.Commerce.AgeRange],
        value: [measureFactory.sum(DM.Commerce.Revenue)],
      };

      const internalOptions =
        dataOptionsTranslators.translateDataOptionsToInternal(realWorldDataOptions);
      const attributes = dataOptionsTranslators.getAttributes(internalOptions);
      const measures = dataOptionsTranslators.getMeasures(internalOptions);

      expect(attributes).toHaveLength(2);
      expect(measures).toHaveLength(1);
      expect(attributes[0]).toHaveProperty('name');
      expect(measures[0]).toHaveProperty('name');
      expect(measures[0]).toHaveProperty('aggregation');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null and undefined in data options gracefully', () => {
      const dataOptionsWithUndefined: FunnelChartDataOptions = {
        category: [DM.Commerce.Condition],
        value: [measureFactory.sum(DM.Commerce.Revenue)],
        seriesToColorMap: undefined,
      };

      expect(() => {
        dataOptionsTranslators.validateAndCleanDataOptions(dataOptionsWithUndefined);
      }).not.toThrow();

      expect(() => {
        dataOptionsTranslators.translateDataOptionsToInternal(dataOptionsWithUndefined);
      }).not.toThrow();
    });

    it('should maintain immutability - not modify original data options', () => {
      const originalDataOptions = createMockFunnelDataOptions(5, 3);
      const originalCategoryLength = originalDataOptions.category.length;
      const originalValueLength = originalDataOptions.value.length;

      // Validation should not modify original
      const cleanedOptions =
        dataOptionsTranslators.validateAndCleanDataOptions(originalDataOptions);

      expect(originalDataOptions.category.length).toBe(originalCategoryLength);
      expect(originalDataOptions.value.length).toBe(originalValueLength);
      expect(cleanedOptions.category.length).toBe(3); // Limited copy
      expect(cleanedOptions.value.length).toBe(1); // Limited copy
    });
  });
});
