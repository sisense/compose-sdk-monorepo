import { describe, expect, it, vi } from 'vitest';

import { CalendarHeatmapChartData } from '../../data.js';
import { getDataPerChartInstance } from './data-per-chart-instance.js';
import { MonthInfo } from './view-helpers.js';

// Mock the prepareChartDataForMonth function
vi.mock('./data-helpers.js', () => ({
  prepareChartDataForMonth: vi.fn((chartData: CalendarHeatmapChartData, month: MonthInfo) => ({
    ...chartData,
    values: chartData.values.filter(
      (v) => v.date.getFullYear() === month.year && v.date.getMonth() === month.month,
    ),
  })),
}));

describe('getDataPerChartInstance', () => {
  const createMockMonthInfo = (year: number, month: number): MonthInfo => ({
    year,
    month,
    monthName: new Date(year, month).toLocaleString('en-US', { month: 'long' }),
    shortMonthName: new Date(year, month).toLocaleString('en-US', { month: 'short' }),
  });

  const createMockChartData = (
    values: Array<{ year: number; month: number; day: number; value?: number }>,
  ): CalendarHeatmapChartData => ({
    type: 'calendar-heatmap',
    values: values.map((v) => ({
      date: new Date(v.year, v.month, v.day),
      value: v.value,
    })),
  });

  describe('split subtype', () => {
    it('should create separate chart data for each month', () => {
      const monthsToDisplay: MonthInfo[] = [
        createMockMonthInfo(2024, 0), // January
        createMockMonthInfo(2024, 1), // February
        createMockMonthInfo(2024, 2), // March
      ];

      const chartData = createMockChartData([
        { year: 2024, month: 0, day: 1, value: 10 },
        { year: 2024, month: 0, day: 15, value: 20 },
        { year: 2024, month: 1, day: 1, value: 30 },
        { year: 2024, month: 2, day: 1, value: 40 },
      ]);

      const result = getDataPerChartInstance(
        'calendar-heatmap/split',
        'month',
        monthsToDisplay,
        chartData,
      );

      expect(result).toHaveLength(3);
      expect(result[0].values).toHaveLength(2); // January data
      expect(result[1].values).toHaveLength(1); // February data
      expect(result[2].values).toHaveLength(1); // March data
    });

    it('should handle empty months array', () => {
      const result = getDataPerChartInstance(
        'calendar-heatmap/split',
        'month',
        [],
        createMockChartData([]),
      );

      expect(result).toHaveLength(0);
    });

    it('should handle months with no data', () => {
      const monthsToDisplay: MonthInfo[] = [
        createMockMonthInfo(2024, 0),
        createMockMonthInfo(2024, 1),
      ];

      const chartData = createMockChartData([
        { year: 2024, month: 0, day: 1, value: 10 },
        // No data for February
      ]);

      const result = getDataPerChartInstance(
        'calendar-heatmap/split',
        'month',
        monthsToDisplay,
        chartData,
      );

      expect(result).toHaveLength(2);
      expect(result[0].values).toHaveLength(1); // January has data
      expect(result[1].values).toHaveLength(0); // February has no data
    });
  });

  describe('continuous subtype', () => {
    describe('month viewType', () => {
      it('should create 1 chart instance with 1 month', () => {
        const monthsToDisplay: MonthInfo[] = [
          createMockMonthInfo(2024, 0),
          createMockMonthInfo(2024, 1),
          createMockMonthInfo(2024, 2),
        ];

        const chartData = createMockChartData([
          { year: 2024, month: 0, day: 1, value: 10 },
          { year: 2024, month: 0, day: 15, value: 20 },
        ]);

        const result = getDataPerChartInstance(
          'calendar-heatmap/continuous',
          'month',
          monthsToDisplay,
          chartData,
        );

        expect(result).toHaveLength(1);
        expect(result[0].values).toHaveLength(2); // Only January data
      });
    });

    describe('quarter viewType', () => {
      it('should create 1 chart instance with 3 months', () => {
        const monthsToDisplay: MonthInfo[] = [
          createMockMonthInfo(2024, 0), // January
          createMockMonthInfo(2024, 1), // February
          createMockMonthInfo(2024, 2), // March
          createMockMonthInfo(2024, 3), // April
        ];

        const chartData = createMockChartData([
          { year: 2024, month: 0, day: 1, value: 10 },
          { year: 2024, month: 1, day: 1, value: 20 },
          { year: 2024, month: 2, day: 1, value: 30 },
          { year: 2024, month: 3, day: 1, value: 40 },
        ]);

        const result = getDataPerChartInstance(
          'calendar-heatmap/continuous',
          'quarter',
          monthsToDisplay,
          chartData,
        );

        expect(result).toHaveLength(1);
        expect(result[0].values).toHaveLength(3); // Jan, Feb, Mar combined
      });

      it('should handle less than 3 months', () => {
        const monthsToDisplay: MonthInfo[] = [
          createMockMonthInfo(2024, 0),
          createMockMonthInfo(2024, 1),
        ];

        const chartData = createMockChartData([
          { year: 2024, month: 0, day: 1, value: 10 },
          { year: 2024, month: 1, day: 1, value: 20 },
        ]);

        const result = getDataPerChartInstance(
          'calendar-heatmap/continuous',
          'quarter',
          monthsToDisplay,
          chartData,
        );

        expect(result).toHaveLength(1);
        expect(result[0].values).toHaveLength(2); // Only 2 months available
      });
    });

    describe('half-year viewType', () => {
      it('should create 1 chart instance with 6 months', () => {
        const monthsToDisplay: MonthInfo[] = [
          createMockMonthInfo(2024, 0),
          createMockMonthInfo(2024, 1),
          createMockMonthInfo(2024, 2),
          createMockMonthInfo(2024, 3),
          createMockMonthInfo(2024, 4),
          createMockMonthInfo(2024, 5),
          createMockMonthInfo(2024, 6),
        ];

        const chartData = createMockChartData(
          Array.from({ length: 7 }, (_, i) => ({
            year: 2024,
            month: i,
            day: 1,
            value: (i + 1) * 10,
          })),
        );

        const result = getDataPerChartInstance(
          'calendar-heatmap/continuous',
          'half-year',
          monthsToDisplay,
          chartData,
        );

        expect(result).toHaveLength(1);
        expect(result[0].values).toHaveLength(6); // First 6 months combined
      });

      it('should handle less than 6 months', () => {
        const monthsToDisplay: MonthInfo[] = [
          createMockMonthInfo(2024, 0),
          createMockMonthInfo(2024, 1),
          createMockMonthInfo(2024, 2),
        ];

        const chartData = createMockChartData([
          { year: 2024, month: 0, day: 1, value: 10 },
          { year: 2024, month: 1, day: 1, value: 20 },
          { year: 2024, month: 2, day: 1, value: 30 },
        ]);

        const result = getDataPerChartInstance(
          'calendar-heatmap/continuous',
          'half-year',
          monthsToDisplay,
          chartData,
        );

        expect(result).toHaveLength(1);
        expect(result[0].values).toHaveLength(3); // Only 3 months available
      });
    });

    describe('year viewType', () => {
      it('should create 2 chart instances with 6 months each', () => {
        const monthsToDisplay: MonthInfo[] = Array.from({ length: 12 }, (_, i) =>
          createMockMonthInfo(2024, i),
        );

        const chartData = createMockChartData(
          Array.from({ length: 12 }, (_, i) => ({
            year: 2024,
            month: i,
            day: 1,
            value: (i + 1) * 10,
          })),
        );

        const result = getDataPerChartInstance(
          'calendar-heatmap/continuous',
          'year',
          monthsToDisplay,
          chartData,
        );

        expect(result).toHaveLength(2);
        expect(result[0].values).toHaveLength(6); // First 6 months (Jan-Jun)
        expect(result[1].values).toHaveLength(6); // Last 6 months (Jul-Dec)
      });

      it('should handle exactly 6 months (only first instance)', () => {
        const monthsToDisplay: MonthInfo[] = Array.from({ length: 6 }, (_, i) =>
          createMockMonthInfo(2024, i),
        );

        const chartData = createMockChartData(
          Array.from({ length: 6 }, (_, i) => ({
            year: 2024,
            month: i,
            day: 1,
            value: (i + 1) * 10,
          })),
        );

        const result = getDataPerChartInstance(
          'calendar-heatmap/continuous',
          'year',
          monthsToDisplay,
          chartData,
        );

        expect(result).toHaveLength(1);
        expect(result[0].values).toHaveLength(6);
      });

      it('should filter out empty groups', () => {
        const monthsToDisplay: MonthInfo[] = Array.from({ length: 8 }, (_, i) =>
          createMockMonthInfo(2024, i),
        );

        const chartData = createMockChartData(
          Array.from({ length: 8 }, (_, i) => ({
            year: 2024,
            month: i,
            day: 1,
            value: (i + 1) * 10,
          })),
        );

        const result = getDataPerChartInstance(
          'calendar-heatmap/continuous',
          'year',
          monthsToDisplay,
          chartData,
        );

        expect(result).toHaveLength(2);
        expect(result[0].values).toHaveLength(6); // First 6 months
        expect(result[1].values).toHaveLength(2); // Last 2 months (Jul-Aug)
      });
    });

    describe('default viewType', () => {
      it('should create 1 chart instance with all months', () => {
        const monthsToDisplay: MonthInfo[] = [
          createMockMonthInfo(2024, 0),
          createMockMonthInfo(2024, 1),
          createMockMonthInfo(2024, 2),
        ];

        const chartData = createMockChartData([
          { year: 2024, month: 0, day: 1, value: 10 },
          { year: 2024, month: 1, day: 1, value: 20 },
          { year: 2024, month: 2, day: 1, value: 30 },
        ]);

        const result = getDataPerChartInstance(
          'calendar-heatmap/continuous',
          'unknown' as any,
          monthsToDisplay,
          chartData,
        );

        expect(result).toHaveLength(1);
        expect(result[0].values).toHaveLength(3); // All months combined
      });
    });

    describe('edge cases', () => {
      it('should handle empty chart data', () => {
        const monthsToDisplay: MonthInfo[] = [createMockMonthInfo(2024, 0)];

        const chartData: CalendarHeatmapChartData = {
          type: 'calendar-heatmap',
          values: [],
        };

        const result = getDataPerChartInstance(
          'calendar-heatmap/continuous',
          'month',
          monthsToDisplay,
          chartData,
        );

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('calendar-heatmap');
        expect(result[0].values).toHaveLength(0);
      });

      it('should combine values from multiple months correctly', () => {
        const monthsToDisplay: MonthInfo[] = [
          createMockMonthInfo(2024, 0),
          createMockMonthInfo(2024, 1),
        ];

        const chartData = createMockChartData([
          { year: 2024, month: 0, day: 1, value: 10 },
          { year: 2024, month: 0, day: 15, value: 20 },
          { year: 2024, month: 1, day: 1, value: 30 },
          { year: 2024, month: 1, day: 20, value: 40 },
        ]);

        const result = getDataPerChartInstance(
          'calendar-heatmap/continuous',
          'quarter',
          monthsToDisplay,
          chartData,
        );

        expect(result).toHaveLength(1);
        expect(result[0].values).toHaveLength(4); // All values from both months
        expect(result[0].values.map((v) => v.value)).toEqual([10, 20, 30, 40]);
      });

      it('should preserve chart data structure', () => {
        const monthsToDisplay: MonthInfo[] = [createMockMonthInfo(2024, 0)];

        const chartData = createMockChartData([{ year: 2024, month: 0, day: 1, value: 10 }]);

        const result = getDataPerChartInstance(
          'calendar-heatmap/continuous',
          'month',
          monthsToDisplay,
          chartData,
        );

        expect(result[0].type).toBe('calendar-heatmap');
        expect(result[0].values).toBeDefined();
        expect(Array.isArray(result[0].values)).toBe(true);
      });
    });
  });
});
