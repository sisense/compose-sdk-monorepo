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

vi.mock('@/chart-options-processor/translations/axis-section', () => ({
  getDefaultDateFormat: vi.fn(() => 'MM/dd/yyyy'),
}));

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
