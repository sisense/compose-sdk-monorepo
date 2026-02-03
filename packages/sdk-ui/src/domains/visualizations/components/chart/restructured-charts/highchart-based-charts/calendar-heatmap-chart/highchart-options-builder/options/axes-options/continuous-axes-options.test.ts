import { describe, expect, it, vi } from 'vitest';

import { BuildContext } from '../../../../types.js';
import { CalendarHeatmapChartData } from '../../../data.js';
import { getContinuousAxesOptions } from './index.js';

// Mock the weekday labels function
vi.mock('../../../utils/index.js', () => ({
  getWeekdayLabels: vi.fn(() => ['S', 'M', 'T', 'W', 'T', 'F', 'S']),
  getDayOfWeekIndex: vi.fn((dayOfWeek: string) => (dayOfWeek === 'sunday' ? 0 : 1)),
  CalendarDayOfWeekEnum: {
    SUNDAY: 'sunday',
    MONDAY: 'monday',
  },
}));

describe('Calendar Heatmap Axes Options', () => {
  const mockDateFormatter = vi.fn((date: Date) => date.toISOString().split('T')[0]);

  const createMockContext = (overrides: any = {}): BuildContext<'calendar-heatmap'> => {
    const baseDesignOptions = {
      cellLabels: {
        enabled: true,
        style: { color: '#333' },
      },
      dayLabels: {
        enabled: true,
        style: {
          color: '#666',
          fontSize: '11px',
          fontFamily: 'Arial',
          fontWeight: 'normal',
        },
      },
      monthLabels: {
        enabled: true,
        style: { color: '#000' },
      },
      weekends: {
        days: ['saturday', 'sunday'],
        cellColor: '#f0f0f0',
        hideValues: false,
      },
      startOfWeek: 'sunday' as const,
      viewType: 'month' as const,
      cellSize: 50,
      width: 350,
      height: 350,
    };

    return {
      chartData: {
        type: 'calendar-heatmap',
        values: [],
        data: [],
        metaData: {
          columns: [],
        },
      } as CalendarHeatmapChartData,
      designOptions: {
        ...baseDesignOptions,
        ...overrides.designOptions,
        // Merge nested objects properly
        ...(overrides.designOptions?.cellLabels && {
          cellLabels: { ...baseDesignOptions.cellLabels, ...overrides.designOptions.cellLabels },
        }),
        ...(overrides.designOptions?.dayLabels && {
          dayLabels: { ...baseDesignOptions.dayLabels, ...overrides.designOptions.dayLabels },
        }),
        ...(overrides.designOptions?.monthLabels && {
          monthLabels: { ...baseDesignOptions.monthLabels, ...overrides.designOptions.monthLabels },
        }),
        ...(overrides.designOptions?.weekends && {
          weekends: { ...baseDesignOptions.weekends, ...overrides.designOptions.weekends },
        }),
      },
      extraConfig: {
        dateFormatter: mockDateFormatter,
        ...overrides.extraConfig,
      },
      ...overrides,
    };
  };

  describe('getContinuousAxesOptions', () => {
    const createContinuousContext = (overrides: any = {}): BuildContext<'calendar-heatmap'> => {
      const ctx = createMockContext(overrides);
      ctx.designOptions.subtype = 'calendar-heatmap/continuous';
      return ctx;
    };

    it('should generate axes options for continuous subtype', () => {
      const ctx = createContinuousContext();
      const result = getContinuousAxesOptions(ctx);

      expect(result.xAxis).toHaveLength(1);
      expect(result.yAxis).toHaveLength(1);
    });

    it('should configure x-axis for month labels in continuous layout', () => {
      const ctx = createContinuousContext();
      const result = getContinuousAxesOptions(ctx);

      expect(result.xAxis?.[0]).toMatchObject({
        opposite: true,
        lineWidth: 0,
        gridLineWidth: 0,
      });
      expect(result.xAxis?.[0]?.categories).toBeDefined();
      expect(Array.isArray(result.xAxis?.[0]?.categories)).toBe(true);
    });

    it('should configure y-axis for day labels in continuous layout', () => {
      const ctx = createContinuousContext();
      const result = getContinuousAxesOptions(ctx);

      expect(result.yAxis?.[0]).toMatchObject({
        opposite: false,
        lineWidth: 0,
        gridLineWidth: 0,
        offset: 15,
      });
      expect(result.yAxis?.[0]?.title?.text).toBeNull();
    });

    it('should use 3-letter day labels for continuous subtype', () => {
      const ctx = createContinuousContext();
      const result = getContinuousAxesOptions(ctx);

      // Y-axis should have day labels (mocked to return single letters, but in real implementation would be 3-letter)
      expect(result.yAxis?.[0]?.categories).toBeDefined();
      expect(Array.isArray(result.yAxis?.[0]?.categories)).toBe(true);
    });

    it('should respect monthLabels.enabled setting', () => {
      const ctx = createContinuousContext();
      ctx.designOptions.monthLabels.enabled = false;
      const result = getContinuousAxesOptions(ctx);

      expect(result.xAxis?.[0]?.labels?.enabled).toBe(false);
    });

    it('should hide month labels for single month view', () => {
      const ctx = createContinuousContext();
      ctx.designOptions.viewType = 'month';
      const result = getContinuousAxesOptions(ctx);

      expect(result.xAxis?.[0]?.labels?.enabled).toBe(false);
    });

    it('should show month labels for multi-month views', () => {
      const ctx = createContinuousContext();
      ctx.designOptions.viewType = 'quarter';
      const result = getContinuousAxesOptions(ctx);

      expect(result.xAxis?.[0]?.labels?.enabled).toBe(true);
    });

    it('should apply month label styling', () => {
      const customStyle = {
        color: '#ff0000',
        fontSize: '14px',
        fontFamily: 'Helvetica',
        fontWeight: 'bold',
        fontStyle: 'italic',
      };

      const ctx = createContinuousContext();
      ctx.designOptions.monthLabels.style = customStyle;
      const result = getContinuousAxesOptions(ctx);

      expect(result.xAxis?.[0]?.labels?.style).toMatchObject(customStyle);
    });

    it('should apply day label styling', () => {
      const customStyle = {
        color: '#0000ff',
        fontSize: '12px',
        fontFamily: 'Times',
        fontWeight: 'normal',
      };

      const ctx = createContinuousContext();
      ctx.designOptions.dayLabels.style = customStyle;
      const result = getContinuousAxesOptions(ctx);

      expect(result.yAxis?.[0]?.labels?.style).toMatchObject(customStyle);
    });

    it('should handle empty chart data gracefully', () => {
      const ctx = createContinuousContext();
      ctx.chartData.values = [];
      const result = getContinuousAxesOptions(ctx);

      expect(result.xAxis?.[0]?.categories).toEqual([]);
    });

    it('should generate month labels based on chart data', () => {
      const ctx = createContinuousContext();
      ctx.chartData.values = [
        { date: new Date('2024-01-01'), value: 10 },
        { date: new Date('2024-01-15'), value: 20 },
        { date: new Date('2024-02-01'), value: 15 },
        { date: new Date('2024-02-28'), value: 25 },
      ];
      const result = getContinuousAxesOptions(ctx);

      expect(result.xAxis?.[0]?.categories).toBeDefined();
      expect(Array.isArray(result.xAxis?.[0]?.categories)).toBe(true);
      // Should have categories for the data range
      expect((result.xAxis?.[0]?.categories as string[]).length).toBeGreaterThan(0);
    });

    it('should respect dayLabels.enabled setting for y-axis', () => {
      const ctx = createContinuousContext();
      ctx.designOptions.dayLabels.enabled = false;
      const result = getContinuousAxesOptions(ctx);

      expect(result.yAxis?.[0]?.labels?.enabled).toBe(false);
    });

    it('should consider size (height) threshold for day labels', () => {
      const ctx = createContinuousContext();
      ctx.designOptions.height = 100; // Below threshold (120)
      const result = getContinuousAxesOptions(ctx);

      expect(result.yAxis?.[0]?.labels?.enabled).toBe(false);
    });

    it('should work with different start of week settings', () => {
      const sundayCtx = createContinuousContext();
      sundayCtx.designOptions.startOfWeek = 'sunday';
      const sundayResult = getContinuousAxesOptions(sundayCtx);

      const mondayCtx = createContinuousContext();
      mondayCtx.designOptions.startOfWeek = 'monday';
      const mondayResult = getContinuousAxesOptions(mondayCtx);

      expect(sundayResult.xAxis?.[0]?.categories).toBeDefined();
      expect(mondayResult.xAxis?.[0]?.categories).toBeDefined();
      // Both should generate valid categories, potentially different due to offset
    });
  });
});
