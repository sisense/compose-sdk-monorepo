import { describe, expect, it, vi } from 'vitest';

import { HighchartsDataPointContext } from '@/domains/visualizations/core/chart-options-processor/tooltip.js';

import { BuildContext } from '../../../types.js';
import { CalendarHeatmapChartData } from '../../data.js';
import { getPlotOptions } from './plot-options.js';

describe('Calendar Heatmap Plot Options', () => {
  const mockDateFormatter = vi.fn((date: Date) => date.toISOString().split('T')[0]);

  const createMockContext = (overrides: any = {}): BuildContext<'calendar-heatmap'> => ({
    chartData: {
      type: 'calendar-heatmap',
      values: [],
      data: [],
      metaData: {
        columns: [],
      },
    } as CalendarHeatmapChartData,
    designOptions: {
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
      cellSize: 20,
      width: 140,
      height: 140,
      ...overrides.designOptions,
    },
    extraConfig: {
      dateFormatter: mockDateFormatter,
      ...overrides.extraConfig,
    },
    ...overrides,
  });

  describe('getPlotOptions', () => {
    it('should create plot options with cellLabels enabled', () => {
      const ctx = createMockContext();
      const result = getPlotOptions(ctx);

      expect(result?.heatmap?.dataLabels).toMatchObject({
        enabled: true,
        style: {
          color: '#333',
          fontSize: '12px',
          fontWeight: 'normal',
        },
      });
    });

    it('should create plot options with cellLabels disabled', () => {
      const ctx = createMockContext({
        designOptions: {
          cellLabels: {
            enabled: false,
          },
        },
      });
      const result = getPlotOptions(ctx);

      expect(result?.heatmap?.dataLabels?.enabled).toBe(false);
    });

    it('should disable dataLabels when cell size is too small', () => {
      const ctx = createMockContext({
        designOptions: {
          cellLabels: {
            enabled: true,
          },
          cellSize: 5, // Very small cell size
        },
      });
      const result = getPlotOptions(ctx);

      expect(result?.heatmap?.dataLabels?.enabled).toBe(false);
    });

    it('should apply custom cellLabels style properties', () => {
      const customStyle = {
        color: '#ff0000',
        fontSize: '14px',
        fontWeight: 'bold',
        fontFamily: 'Arial',
        fontStyle: 'italic',
        textOutline: '1px black',
        pointerEvents: 'none',
        textOverflow: 'ellipsis',
      };

      const ctx = createMockContext({
        designOptions: {
          cellLabels: {
            enabled: true,
            style: customStyle,
          },
        },
      });
      const result = getPlotOptions(ctx);

      expect(result?.heatmap?.dataLabels?.style).toMatchObject({
        color: '#ff0000',
        fontSize: '14px',
        fontWeight: 'bold',
        fontStyle: 'italic',
        textOutline: '1px black',
        pointerEvents: 'none',
        textOverflow: 'ellipsis',
      });
    });

    it('should use default theme color when cellLabels style is undefined', () => {
      const ctx = createMockContext({
        designOptions: {
          cellLabels: {
            enabled: true,
            style: undefined,
          },
        },
        extraConfig: {
          themeSettings: {
            chart: {
              textColor: '#333',
            },
            typography: {
              fontFamily: 'Arial',
            },
          },
        },
      });
      const result = getPlotOptions(ctx);

      expect(result?.heatmap?.dataLabels?.style?.color).toBe('#333');
    });

    it('should calculate font size based on cell size', () => {
      const ctx = createMockContext({
        designOptions: {
          cellLabels: {
            enabled: true,
            style: {
              // Don't specify fontSize to test calculation
              color: '#333',
            },
          },
          cellSize: 30,
        },
      });
      const result = getPlotOptions(ctx);

      // Font size should be calculated based on cell size
      expect(result?.heatmap?.dataLabels?.style?.fontSize).toMatch(/^\d+px$/);
    });

    it('should have correct data label formatter', () => {
      const ctx = createMockContext();
      const result = getPlotOptions(ctx);

      const formatter = result?.heatmap?.dataLabels?.formatter;
      expect(typeof formatter).toBe('function');

      // Test the formatter with mock context
      const mockThis = {
        point: {
          custom: { monthDay: 15 },
        },
      } as HighchartsDataPointContext;
      const formattedValue = formatter?.call(mockThis);
      expect(formattedValue).toBe('15');
    });

    it('should handle missing custom data in formatter', () => {
      const ctx = createMockContext();
      const result = getPlotOptions(ctx);

      const formatter = result?.heatmap?.dataLabels?.formatter;

      // Test with missing custom data
      const mockThis = {
        point: {},
      } as HighchartsDataPointContext;
      const formattedValue = formatter?.call(mockThis);
      expect(formattedValue).toBe('');
    });

    it('should have basic plot options structure', () => {
      const ctx = createMockContext();
      const result = getPlotOptions(ctx);

      expect(result).toHaveProperty('series');
      expect(result).toHaveProperty('heatmap');
      expect(result?.heatmap).toHaveProperty('dataLabels');
    });
  });
});
