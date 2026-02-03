import { describe, expect, it, vi } from 'vitest';

import { BuildContext } from '../../../../types.js';
import { CalendarHeatmapChartData } from '../../../data.js';
import { getSplitSeriesOptions } from './series-options.js';

// Mock the calendar data generator
vi.mock('../series-options/calendar-data-generator.js', () => ({
  generateSplitCalendarChartData: vi.fn(() => [
    {
      x: 0,
      y: 0,
      value: 100,
      custom: { displayText: '1', dateString: '2024-01-01' },
    },
    {
      x: 1,
      y: 0,
      value: 200,
      custom: { displayText: '2', dateString: '2024-01-02' },
    },
  ]),
  generateContinuousCalendarChartData: vi.fn(() => [
    {
      x: 0,
      y: 0,
      value: 100,
      custom: { displayText: '1', dateString: '2024-01-01' },
    },
    {
      x: 1,
      y: 0,
      value: 200,
      custom: { displayText: '2', dateString: '2024-01-02' },
    },
  ]),
}));

describe('Calendar Heatmap Series Options', () => {
  const mockDateFormatter = vi.fn((date: Date) => date.toISOString().split('T')[0]);

  const createMockContext = (overrides: any = {}): BuildContext<'calendar-heatmap'> => {
    const baseDesignOptions = {
      cellLabels: {
        enabled: true,
        style: {
          color: '#333',
          fontSize: '12px',
          fontWeight: 'normal',
        },
      },
      dayLabels: {
        enabled: true,
        style: {
          color: '#666',
          fontSize: '11px',
        },
      },
      monthLabels: {
        enabled: true,
        style: {
          color: '#000',
          fontWeight: 'bold',
        },
      },
      weekends: {
        days: ['saturday', 'sunday'],
        cellColor: '#f0f0f0',
        hideValues: false,
      },
      startOfWeek: 'sunday' as const,
      viewType: 'month' as const,
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
        // Ensure nested objects are properly merged
        ...(overrides.designOptions?.cellLabels && {
          cellLabels: {
            ...baseDesignOptions.cellLabels,
            ...overrides.designOptions.cellLabels,
          },
        }),
        ...(overrides.designOptions?.weekends && {
          weekends: {
            ...baseDesignOptions.weekends,
            ...overrides.designOptions.weekends,
          },
        }),
      },
      extraConfig: {
        dateFormatter: mockDateFormatter,
        ...overrides.extraConfig,
      },
      ...overrides,
    };
  };

  describe('getSplitSeriesOptions', () => {
    it('should create basic heatmap series configuration', () => {
      const ctx = createMockContext();
      const result = getSplitSeriesOptions(ctx);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        name: 'Calendar Heatmap',
        type: 'heatmap',
        keys: ['x', 'y', 'value', 'date', 'color', 'custom'],
        nullColor: '#f5f5f5',
        borderWidth: 0,
        borderColor: 'transparent',
        colsize: 1,
        rowsize: 1,
      });
    });

    it('should include generated calendar data', () => {
      const ctx = createMockContext();
      const result = getSplitSeriesOptions(ctx);

      expect(result[0].data).toEqual([
        {
          x: 0,
          y: 0,
          value: 100,
          custom: { displayText: '1', dateString: '2024-01-01' },
        },
        {
          x: 1,
          y: 0,
          value: 200,
          custom: { displayText: '2', dateString: '2024-01-02' },
        },
      ]);
    });

    it('should call generateSplitCalendarChartData with correct parameters', async () => {
      const { generateSplitCalendarChartData } = vi.mocked(
        await import('./calendar-data-generator.js'),
      );

      const ctx = createMockContext();
      getSplitSeriesOptions(ctx);

      expect(generateSplitCalendarChartData).toHaveBeenCalledWith(
        ctx.chartData,
        ctx.extraConfig.dateFormatter,
        'sunday',
        ctx.designOptions.weekends,
      );
    });
  });
});
