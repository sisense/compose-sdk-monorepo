import { describe, it, expect, vi } from 'vitest';
import {
  translateCalendarHeatmapChartDataOptions,
  getCalendarHeatmapAttributes,
  getCalendarHeatmapMeasures,
  isCalendarHeatmapChartDataOptions,
  isCalendarHeatmapChartDataOptionsInternal,
} from './data-options.js';
import {
  CalendarHeatmapChartDataOptions,
  CalendarHeatmapChartDataOptionsInternal,
} from '@/chart-data-options/types';
import { DateLevels, DimensionalLevelAttribute } from '@sisense/sdk-data';

vi.mock('@/chart-options-processor/translations/axis-section', () => ({
  getDefaultDateFormat: vi.fn(() => 'MM/dd/yyyy'),
}));

// Only mock the functions for validation tests, not for all tests
const mockNormalizeColumn = vi.fn();
const mockIsDimensionalLevelAttribute = vi.fn();
const mockCreateLevelAttribute = vi.fn();

vi.mock('@/chart-data-options/utils', async () => {
  const actual = (await vi.importActual('@/chart-data-options/utils')) as any;
  return {
    ...actual,
    normalizeColumn: (...args: any[]) => {
      // Use the mock only if it has been configured, otherwise use actual
      return mockNormalizeColumn.getMockImplementation()
        ? mockNormalizeColumn(...args)
        : actual.normalizeColumn(...args);
    },
  };
});

vi.mock('@sisense/sdk-data', async () => {
  const actual = (await vi.importActual('@sisense/sdk-data')) as any;
  return {
    ...actual,
    isDimensionalLevelAttribute: (...args: any[]) => {
      return mockIsDimensionalLevelAttribute.getMockImplementation()
        ? mockIsDimensionalLevelAttribute(...args)
        : actual.isDimensionalLevelAttribute(...args);
    },
  };
});

vi.mock('@/utils/create-level-attribute.js', async () => {
  const actual = (await vi.importActual('@/utils/create-level-attribute.js')) as any;
  return {
    ...actual,
    createLevelAttribute: (...args: any[]) => {
      return mockCreateLevelAttribute.getMockImplementation()
        ? mockCreateLevelAttribute(...args)
        : actual.createLevelAttribute(...args);
    },
  };
});

describe('Calendar Heatmap Data Options', () => {
  const mockDateColumn = { name: 'date', type: 'date' };
  const mockValueColumn = { name: 'value', aggregation: 'sum', title: 'value' };

  describe('translateCalendarHeatmapChartDataOptions', () => {
    it('should translate data options correctly', () => {
      const dataOptions: CalendarHeatmapChartDataOptions = {
        date: mockDateColumn,
        value: mockValueColumn,
      };

      const result = translateCalendarHeatmapChartDataOptions(dataOptions);

      expect(result).toHaveProperty('date');
      expect(result).toHaveProperty('value');
      expect(result.date.column.name).toBe(mockDateColumn.name);
      expect(result.value.column.name).toBe(mockValueColumn.name);
    });

    it('should keep original date column when granularity is already Days', () => {
      const mockLevelAttribute: DimensionalLevelAttribute = {
        ...mockDateColumn,
        granularity: DateLevels.Days,
      } as DimensionalLevelAttribute;

      const dataOptions: CalendarHeatmapChartDataOptions = {
        date: mockLevelAttribute,
        value: mockValueColumn,
      };

      const normalizedColumn = { column: mockLevelAttribute };
      mockNormalizeColumn.mockReturnValue(normalizedColumn);
      mockIsDimensionalLevelAttribute.mockReturnValue(true);

      const result = translateCalendarHeatmapChartDataOptions(dataOptions);

      expect(result.date.column).toBe(mockLevelAttribute);
      expect(mockNormalizeColumn).toHaveBeenCalledWith(mockLevelAttribute);
      expect(mockIsDimensionalLevelAttribute).toHaveBeenCalledWith(mockLevelAttribute);

      // Clear mocks for other tests
      mockNormalizeColumn.mockReset();
      mockIsDimensionalLevelAttribute.mockReset();
    });

    it('should convert granularity to Days and log warning when date granularity is not Days', () => {
      const mockLevelAttribute: DimensionalLevelAttribute = {
        ...mockDateColumn,
        granularity: DateLevels.Months,
      } as DimensionalLevelAttribute;

      const mockConvertedAttribute: DimensionalLevelAttribute = {
        ...mockDateColumn,
        granularity: DateLevels.Days,
      } as DimensionalLevelAttribute;

      const dataOptions: CalendarHeatmapChartDataOptions = {
        date: mockLevelAttribute,
        value: mockValueColumn,
      };

      const normalizedColumn = { column: mockLevelAttribute };
      mockNormalizeColumn.mockReturnValue(normalizedColumn);
      mockIsDimensionalLevelAttribute.mockReturnValue(true);
      mockCreateLevelAttribute.mockReturnValue(mockConvertedAttribute);

      // Mock console.warn to verify it's called
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = translateCalendarHeatmapChartDataOptions(dataOptions);

      expect(result.date.column).toBe(mockConvertedAttribute);
      expect(mockNormalizeColumn).toHaveBeenCalledWith(mockLevelAttribute);
      expect(mockIsDimensionalLevelAttribute).toHaveBeenCalledWith(mockLevelAttribute);
      expect(mockCreateLevelAttribute).toHaveBeenCalledWith(mockLevelAttribute, DateLevels.Days);
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('The calendar heatmap chart'),
      );

      // Clear mocks for other tests
      mockNormalizeColumn.mockReset();
      mockIsDimensionalLevelAttribute.mockReset();
      mockCreateLevelAttribute.mockReset();
      consoleSpy.mockRestore();
    });

    it('should handle non-dimensional level attributes', () => {
      const dataOptions: CalendarHeatmapChartDataOptions = {
        date: mockDateColumn,
        value: mockValueColumn,
      };

      const normalizedColumn = { column: mockDateColumn };
      mockNormalizeColumn.mockReturnValue(normalizedColumn);
      mockIsDimensionalLevelAttribute.mockReturnValue(false);

      const result = translateCalendarHeatmapChartDataOptions(dataOptions);

      expect(result.date.column).toBe(mockDateColumn);
      expect(mockNormalizeColumn).toHaveBeenCalledWith(mockDateColumn);
      expect(mockIsDimensionalLevelAttribute).toHaveBeenCalledWith(mockDateColumn);
      expect(mockCreateLevelAttribute).not.toHaveBeenCalled();

      // Clear mocks for other tests
      mockNormalizeColumn.mockReset();
      mockIsDimensionalLevelAttribute.mockReset();
      mockCreateLevelAttribute.mockReset();
    });
  });

  describe('getCalendarHeatmapAttributes', () => {
    it('should extract attributes from data options', () => {
      const dataOptions: CalendarHeatmapChartDataOptionsInternal = {
        date: { column: mockDateColumn },
        value: { column: mockValueColumn },
      };

      const attributes = getCalendarHeatmapAttributes(dataOptions);

      expect(attributes).toEqual([mockDateColumn]);
    });
  });

  describe('getCalendarHeatmapMeasures', () => {
    it('should extract measures from data options', () => {
      const dataOptions: CalendarHeatmapChartDataOptionsInternal = {
        date: { column: mockDateColumn },
        value: { column: mockValueColumn },
      };

      const measures = getCalendarHeatmapMeasures(dataOptions);

      expect(measures).toEqual([mockValueColumn]);
    });
  });

  describe('isCalendarHeatmapChartDataOptions', () => {
    it('should return true for valid data options', () => {
      const dataOptions = {
        date: mockDateColumn,
        value: mockValueColumn,
      };

      expect(isCalendarHeatmapChartDataOptions(dataOptions)).toBe(true);
    });

    it('should return false for invalid data options', () => {
      const dataOptions = {
        x: mockDateColumn,
        y: mockValueColumn,
      };

      expect(isCalendarHeatmapChartDataOptions(dataOptions)).toBe(false);
    });
  });

  describe('isCalendarHeatmapChartDataOptionsInternal', () => {
    it('should return true for valid internal data options', () => {
      const dataOptions = {
        date: { column: mockDateColumn },
        value: { column: mockValueColumn },
      };

      expect(isCalendarHeatmapChartDataOptionsInternal(dataOptions)).toBe(true);
    });

    it('should return false for invalid internal data options', () => {
      const dataOptions = {
        someDate: mockDateColumn, // Incorrect property
        value: 123, // Should be object
      } as unknown as CalendarHeatmapChartDataOptionsInternal;

      expect(isCalendarHeatmapChartDataOptionsInternal(dataOptions)).toBe(false);
    });
  });
});
