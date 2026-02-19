import { describe, expect, it, vi } from 'vitest';

import { BuildContext } from '../../../../types.js';
import { CalendarHeatmapChartData } from '../../../data.js';
import { getSplitAxesOptions } from './index.js';

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

  describe('getSplitAxesOptions', () => {
    it('should create axes options with dayLabels enabled', () => {
      const ctx = createMockContext();
      const result = getSplitAxesOptions(ctx);

      expect(result.xAxis).toHaveLength(1);
      expect(result.xAxis?.[0]).toMatchObject({
        categories: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        labels: {
          enabled: true,
          style: {
            fontSize: '11px',
            color: '#666',
            fontFamily: 'Arial',
            fontWeight: 'normal',
          },
        },
      });
    });

    it('should create axes options with dayLabels disabled', () => {
      const ctx = createMockContext({
        designOptions: {
          dayLabels: {
            enabled: false,
          },
        },
      });
      const result = getSplitAxesOptions(ctx);

      expect(result.xAxis?.[0]).toMatchObject({
        categories: [],
        labels: {
          enabled: false,
        },
      });
    });

    it('should apply custom dayLabels style properties', () => {
      const customStyle = {
        color: '#ff0000',
        fontSize: '14px',
        fontWeight: 'bold',
        fontFamily: 'Helvetica',
        fontStyle: 'italic',
        textOutline: '1px white',
        pointerEvents: 'none',
        textOverflow: 'ellipsis',
      };

      const ctx = createMockContext({
        designOptions: {
          dayLabels: {
            enabled: true,
            style: customStyle,
          },
        },
      });
      const result = getSplitAxesOptions(ctx);

      expect(result.xAxis?.[0]?.labels?.style).toMatchObject(customStyle);
    });

    it('should work with different startOfWeek values', () => {
      // Test Monday start
      const mondayCtx = createMockContext();
      mondayCtx.designOptions.startOfWeek = 'monday';
      const mondayResult = getSplitAxesOptions(mondayCtx);
      expect(mondayResult.xAxis).toHaveLength(1);
      expect(mondayResult.yAxis).toHaveLength(1);

      // Test Sunday start
      const sundayCtx = createMockContext();
      sundayCtx.designOptions.startOfWeek = 'sunday';
      const sundayResult = getSplitAxesOptions(sundayCtx);
      expect(sundayResult.xAxis).toHaveLength(1);
      expect(sundayResult.yAxis).toHaveLength(1);
    });

    it('should have correct axis configuration properties', () => {
      const ctx = createMockContext();
      const result = getSplitAxesOptions(ctx);

      expect(result.xAxis?.[0]).toMatchObject({
        opposite: true,
        lineWidth: 0,
      });

      expect(result.yAxis?.[0]).toMatchObject({
        visible: false,
        gridLineWidth: 0,
      });
    });

    it('should calculate correct label positioning based on cellSize', () => {
      const ctx = createMockContext();
      ctx.designOptions.cellSize = 40;
      const result = getSplitAxesOptions(ctx);

      // Should have calculated offset and y position
      expect(typeof result.xAxis?.[0]?.offset).toBe('number');
      expect(typeof result.xAxis?.[0]?.labels?.y).toBe('number');
    });
  });
});
