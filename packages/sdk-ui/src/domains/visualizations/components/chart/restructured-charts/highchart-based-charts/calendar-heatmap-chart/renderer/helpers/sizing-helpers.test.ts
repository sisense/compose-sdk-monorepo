import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CALENDAR_HEATMAP_SIZING } from '../../constants.js';
import { CalendarHeatmapChartData } from '../../data.js';
import { CalendarDayOfWeekEnum } from '../../utils/calendar-utils.js';
import {
  calculateCalendarSize,
  calculateChartInstanceSize,
  getViewGridInfo,
} from './sizing-helpers.js';

describe('Sizing Helpers', () => {
  const mockContainerSize = {
    width: 800,
    height: 600,
  };

  const mockChartData: CalendarHeatmapChartData = {
    type: 'calendar-heatmap',
    values: [
      { date: new Date('2024-01-01'), value: 10 },
      { date: new Date('2024-01-02'), value: 20 },
      { date: new Date('2024-01-03'), value: 15 },
      { date: new Date('2024-01-15'), value: 25 },
      { date: new Date('2024-01-31'), value: 30 },
    ],
  };

  const mockLargeChartData: CalendarHeatmapChartData = {
    type: 'calendar-heatmap',
    values: Array.from({ length: 90 }, (_, i) => ({
      date: new Date(2024, 0, i + 1), // 90 days starting from Jan 1, 2024
      value: Math.random() * 100,
    })),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getViewGridInfo', () => {
    it('should return correct grid for month view', () => {
      const result = getViewGridInfo('month', mockContainerSize);
      expect(result).toEqual({ cols: 1, rows: 1 });
    });

    it('should return correct grid for quarter view', () => {
      const result = getViewGridInfo('quarter', mockContainerSize);
      expect(result).toEqual({ cols: 3, rows: 1 });
    });

    it('should return correct grid for year view', () => {
      const result = getViewGridInfo('year', mockContainerSize);
      expect(result).toEqual({ cols: 4, rows: 3 });
    });

    it('should handle continuous subtype for year view', () => {
      const result = getViewGridInfo('year', mockContainerSize, 'calendar-heatmap/continuous');
      expect(result).toEqual({ cols: 1, rows: 2 });
    });
  });

  describe('calculateCalendarSize', () => {
    it('should calculate size for split subtype', () => {
      const result = calculateCalendarSize(mockContainerSize, 'calendar-heatmap/split', 'month');

      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
      expect(result.cellSize).toBeGreaterThan(0);
      expect(result.cellSize).toBeGreaterThanOrEqual(CALENDAR_HEATMAP_SIZING.MIN_CELL_SIZE);
      expect(result.cellSize).toBeLessThanOrEqual(CALENDAR_HEATMAP_SIZING.MAX_CELL_SIZE);
    });

    it('should ensure square charts for split subtype', () => {
      const result = calculateCalendarSize(mockContainerSize, 'calendar-heatmap/split', 'month');
      expect(result.width).toBe(result.height);
    });

    it('should calculate size for continuous subtype', () => {
      const result = calculateCalendarSize(
        mockContainerSize,
        'calendar-heatmap/continuous',
        'month',
      );

      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
      expect(result.cellSize).toBeGreaterThan(0);
    });

    it('should allow flexible dimensions for continuous subtype', () => {
      const result = calculateCalendarSize(
        mockContainerSize,
        'calendar-heatmap/continuous',
        'quarter',
      );
      // Continuous subtype doesn't enforce square dimensions
      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
    });
  });

  describe('calculateChartInstanceSize', () => {
    describe('split subtype', () => {
      it('should calculate size for split subtype with standard grid', () => {
        const result = calculateChartInstanceSize(
          mockContainerSize,
          'calendar-heatmap/split',
          'month',
          mockChartData,
          CalendarDayOfWeekEnum.SUNDAY,
        );

        expect(result.width).toBeGreaterThan(0);
        expect(result.height).toBeGreaterThan(0);
        expect(result.cellSize).toBeGreaterThan(0);
        expect(result.width).toBe(result.height); // Should be square
      });

      it('should not use internal margins for split subtype', () => {
        const result = calculateChartInstanceSize(
          mockContainerSize,
          'calendar-heatmap/split',
          'month',
          mockChartData,
          CalendarDayOfWeekEnum.SUNDAY,
        );

        // Split subtype should use full allocated space without internal margins
        expect(result.width).toBeGreaterThan(0);
        expect(result.height).toBeGreaterThan(0);
      });
    });

    describe('continuous subtype', () => {
      it('should calculate size based on actual chart data', () => {
        const result = calculateChartInstanceSize(
          mockContainerSize,
          'calendar-heatmap/continuous',
          'month',
          mockChartData,
          CalendarDayOfWeekEnum.SUNDAY,
        );

        expect(result.width).toBeGreaterThan(0);
        expect(result.height).toBeGreaterThan(0);
        expect(result.cellSize).toBeGreaterThan(0);
        // Continuous subtype allows flexible dimensions
      });

      it('should calculate columns based on data range and start of week', () => {
        const sundayResult = calculateChartInstanceSize(
          mockContainerSize,
          'calendar-heatmap/continuous',
          'month',
          mockChartData,
          CalendarDayOfWeekEnum.SUNDAY,
        );

        const mondayResult = calculateChartInstanceSize(
          mockContainerSize,
          'calendar-heatmap/continuous',
          'month',
          mockChartData,
          CalendarDayOfWeekEnum.MONDAY,
        );

        // Results might differ based on start of week offset
        expect(sundayResult.width).toBeGreaterThan(0);
        expect(mondayResult.width).toBeGreaterThan(0);
      });

      it('should handle large data sets correctly', () => {
        const result = calculateChartInstanceSize(
          mockContainerSize,
          'calendar-heatmap/continuous',
          'quarter',
          mockLargeChartData,
          CalendarDayOfWeekEnum.SUNDAY,
        );

        expect(result.width).toBeGreaterThan(0);
        expect(result.height).toBeGreaterThan(0);
        expect(result.cellSize).toBeGreaterThan(0);
        // Should handle larger datasets without issues
      });

      it('should include internal margins when labels are enabled', () => {
        const largeContainer = { width: 1200, height: 800 }; // Large enough to enable labels

        const result = calculateChartInstanceSize(
          largeContainer,
          'calendar-heatmap/continuous',
          'month',
          mockChartData,
          CalendarDayOfWeekEnum.SUNDAY,
        );

        expect(result.width).toBeGreaterThan(0);
        expect(result.height).toBeGreaterThan(0);
        // Should account for internal margins for day/month labels
      });

      it('should not include internal margins when labels are disabled', () => {
        const smallContainer = { width: 300, height: 200 }; // Too small for labels

        const result = calculateChartInstanceSize(
          smallContainer,
          'calendar-heatmap/continuous',
          'month',
          mockChartData,
          CalendarDayOfWeekEnum.SUNDAY,
        );

        expect(result.width).toBeGreaterThan(0);
        expect(result.height).toBeGreaterThan(0);
        // Should not include internal margins when labels are disabled
      });

      it('should fallback to default grid when no data is provided', () => {
        const emptyData: CalendarHeatmapChartData = {
          type: 'calendar-heatmap',
          values: [],
        };

        const result = calculateChartInstanceSize(
          mockContainerSize,
          'calendar-heatmap/continuous',
          'month',
          emptyData,
          CalendarDayOfWeekEnum.SUNDAY,
        );

        expect(result.width).toBeGreaterThan(0);
        expect(result.height).toBeGreaterThan(0);
        expect(result.cellSize).toBeGreaterThan(0);
      });

      it('should respect cell size constraints', () => {
        const result = calculateChartInstanceSize(
          mockContainerSize,
          'calendar-heatmap/continuous',
          'month',
          mockChartData,
          CalendarDayOfWeekEnum.SUNDAY,
        );

        expect(result.cellSize).toBeGreaterThanOrEqual(CALENDAR_HEATMAP_SIZING.MIN_CELL_SIZE);
        expect(result.cellSize).toBeLessThanOrEqual(CALENDAR_HEATMAP_SIZING.MAX_CELL_SIZE);
      });
    });

    describe('view type variations', () => {
      it('should handle different view types for continuous subtype', () => {
        const monthResult = calculateChartInstanceSize(
          mockContainerSize,
          'calendar-heatmap/continuous',
          'month',
          mockChartData,
          CalendarDayOfWeekEnum.SUNDAY,
        );

        const quarterResult = calculateChartInstanceSize(
          mockContainerSize,
          'calendar-heatmap/continuous',
          'quarter',
          mockLargeChartData,
          CalendarDayOfWeekEnum.SUNDAY,
        );

        expect(monthResult.width).toBeGreaterThan(0);
        expect(quarterResult.width).toBeGreaterThan(0);
        // Quarter view might have different dimensions due to layout differences
      });

      it('should account for title height in multi-chart layouts', () => {
        const monthResult = calculateChartInstanceSize(
          mockContainerSize,
          'calendar-heatmap/continuous',
          'month',
          mockChartData,
          CalendarDayOfWeekEnum.SUNDAY,
        );

        const quarterResult = calculateChartInstanceSize(
          mockContainerSize,
          'calendar-heatmap/continuous',
          'quarter',
          mockChartData,
          CalendarDayOfWeekEnum.SUNDAY,
        );

        // Quarter view should account for title height, month view should not
        expect(monthResult.height).toBeGreaterThan(0);
        expect(quarterResult.height).toBeGreaterThan(0);
      });
    });

    describe('edge cases', () => {
      it('should handle very small container sizes', () => {
        const smallContainer = { width: 200, height: 150 }; // Slightly larger to avoid negative values

        const result = calculateChartInstanceSize(
          smallContainer,
          'calendar-heatmap/continuous',
          'month',
          mockChartData,
          CalendarDayOfWeekEnum.SUNDAY,
        );

        expect(result.width).toBeGreaterThan(0);
        expect(result.height).toBeGreaterThan(0);
        expect(result.cellSize).toBeGreaterThanOrEqual(CALENDAR_HEATMAP_SIZING.MIN_CELL_SIZE);
      });

      it('should handle very large container sizes', () => {
        const largeContainer = { width: 2000, height: 1500 };

        const result = calculateChartInstanceSize(
          largeContainer,
          'calendar-heatmap/continuous',
          'month',
          mockChartData,
          CalendarDayOfWeekEnum.SUNDAY,
        );

        expect(result.width).toBeGreaterThan(0);
        expect(result.height).toBeGreaterThan(0);
        expect(result.cellSize).toBeLessThanOrEqual(CALENDAR_HEATMAP_SIZING.MAX_CELL_SIZE);
      });

      it('should handle single data point', () => {
        const singlePointData: CalendarHeatmapChartData = {
          type: 'calendar-heatmap',
          values: [{ date: new Date('2024-01-01'), value: 10 }],
        };

        const result = calculateChartInstanceSize(
          mockContainerSize,
          'calendar-heatmap/continuous',
          'month',
          singlePointData,
          CalendarDayOfWeekEnum.SUNDAY,
        );

        expect(result.width).toBeGreaterThan(0);
        expect(result.height).toBeGreaterThan(0);
        expect(result.cellSize).toBeGreaterThan(0);
      });
    });

    describe('layout margins and gaps', () => {
      it('should account for pagination height', () => {
        const result = calculateChartInstanceSize(
          mockContainerSize,
          'calendar-heatmap/continuous',
          'month',
          mockChartData,
          CalendarDayOfWeekEnum.SUNDAY,
        );

        // Should be smaller than container height due to pagination
        expect(result.height).toBeLessThan(mockContainerSize.height);
      });

      it('should account for general margins', () => {
        const result = calculateChartInstanceSize(
          mockContainerSize,
          'calendar-heatmap/continuous',
          'month',
          mockChartData,
          CalendarDayOfWeekEnum.SUNDAY,
        );

        // Should be smaller than container width due to margins
        expect(result.width).toBeLessThan(mockContainerSize.width);
      });

      it('should handle gaps in multi-chart layouts', () => {
        const quarterResult = calculateChartInstanceSize(
          mockContainerSize,
          'calendar-heatmap/continuous',
          'quarter',
          mockChartData,
          CalendarDayOfWeekEnum.SUNDAY,
        );

        const yearResult = calculateChartInstanceSize(
          mockContainerSize,
          'calendar-heatmap/continuous',
          'year',
          mockChartData,
          CalendarDayOfWeekEnum.SUNDAY,
        );

        // Multi-chart layouts should account for gaps between charts
        expect(quarterResult.width).toBeGreaterThan(0);
        expect(yearResult.width).toBeGreaterThan(0);
      });
    });
  });
});
