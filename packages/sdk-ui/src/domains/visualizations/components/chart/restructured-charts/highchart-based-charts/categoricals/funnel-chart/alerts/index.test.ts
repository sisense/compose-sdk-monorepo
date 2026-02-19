import { measureFactory } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { FunnelChartDesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/design-options.js';
import { seriesSliceWarning } from '@/shared/utils/data-limit-warning';

import { BuildContext } from '../../../types.js';
import { FunnelChartData, FunnelChartDataOptionsInternal } from '../types.js';
import { getFunnelChartAlerts } from './index.js';

// Test helper to create mock BuildContext for funnel charts
const createMockBuildContext = (
  chartData: Partial<FunnelChartData>,
  designOptions: Partial<FunnelChartDesignOptions> = {},
): BuildContext<'funnel'> => {
  return {
    chartData: {
      type: 'categorical',
      xAxisCount: 0,
      xValues: [],
      series: [],
      ...chartData,
    } as FunnelChartData,
    dataOptions: {
      y: [
        {
          column: measureFactory.sum(DM.Commerce.Revenue),
        },
      ],
      breakBy: [],
    } as FunnelChartDataOptionsInternal,
    designOptions: {
      legend: { enabled: true },
      valueLabel: { enabled: true },
      lineType: 'linear',
      lineWidth: 1,
      marker: { enabled: false, size: 'small' },
      xAxis: { enabled: true },
      yAxis: { enabled: true },
      autoZoom: { enabled: false },
      dataLimits: {
        seriesCapacity: 50,
        categoriesCapacity: 50,
      },
      ...designOptions,
    } as FunnelChartDesignOptions,
    extraConfig: {
      translate: ((key: string) => key) as any,
      themeSettings: {
        chart: {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          secondaryTextColor: '#666666',
          animation: {
            init: { duration: 500 },
            redraw: { duration: 500 },
          },
        },
        typography: {
          fontFamily: 'Arial',
          secondaryTextColor: '#666666',
          primaryTextColor: '#000000',
          hyperlinkColor: '#0066cc',
        },
        palette: {
          variantColors: ['#1f77b4', '#ff7f0e', '#2ca02c'],
        },
        general: {},
        widget: {},
        dashboard: {},
        filter: {},
        aiChat: {},
      } as any,
      dateFormatter: (date: Date) => date.toISOString(),
      accessibilityEnabled: false,
    },
  };
};

// Test helper to create mock series data
const createMockSeries = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    name: `Series ${index + 1}`,
    title: `Series ${index + 1}`,
    data: [
      {
        value: 100 - index * 10,
        blur: false,
      },
    ],
  }));
};

// Test helper to create mock xValues data
const createMockXValues = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    key: `key-${index}`,
    xValues: [`Category ${index + 1}`],
    rawValues: [`Category ${index + 1}`],
  }));
};

describe('getFunnelChartAlerts', () => {
  describe('when chart data has no x-axis categories (xAxisCount === 0)', () => {
    it('should return empty alerts array when series count is within limits', () => {
      const chartData = {
        xAxisCount: 0,
        xValues: [],
        series: createMockSeries(25), // Within limit of 50
      };

      const ctx = createMockBuildContext(chartData);
      const alerts = getFunnelChartAlerts(ctx);

      expect(alerts).toEqual([]);
    });

    it('should return alert when series count exceeds capacity', () => {
      const seriesCapacity = 10;
      const actualSeriesCount = 15;

      const chartData = {
        xAxisCount: 0,
        xValues: [],
        series: createMockSeries(actualSeriesCount),
      };

      const ctx = createMockBuildContext(chartData, {
        dataLimits: {
          seriesCapacity,
          categoriesCapacity: 50,
        },
      });

      const alerts = getFunnelChartAlerts(ctx);

      expect(alerts).toHaveLength(1);
      expect(alerts[0]).toBe(seriesSliceWarning(actualSeriesCount, seriesCapacity));
    });

    it('should return empty alerts array when series count exactly matches capacity', () => {
      const seriesCapacity = 20;
      const chartData = {
        xAxisCount: 0,
        xValues: [],
        series: createMockSeries(seriesCapacity), // Exactly at limit
      };

      const ctx = createMockBuildContext(chartData, {
        dataLimits: {
          seriesCapacity,
          categoriesCapacity: 50,
        },
      });

      const alerts = getFunnelChartAlerts(ctx);

      expect(alerts).toEqual([]);
    });

    it('should handle empty series array', () => {
      const chartData = {
        xAxisCount: 0,
        xValues: [],
        series: [],
      };

      const ctx = createMockBuildContext(chartData);
      const alerts = getFunnelChartAlerts(ctx);

      expect(alerts).toEqual([]);
    });
  });

  describe('when chart data has x-axis categories (xAxisCount > 0)', () => {
    it('should return empty alerts array when xValues count is within limits', () => {
      const chartData = {
        xAxisCount: 1,
        xValues: createMockXValues(25), // Within limit of 50
        series: createMockSeries(5),
      };

      const ctx = createMockBuildContext(chartData);
      const alerts = getFunnelChartAlerts(ctx);

      expect(alerts).toEqual([]);
    });

    it('should return alert when xValues count exceeds capacity', () => {
      const seriesCapacity = 10;
      const actualXValuesCount = 15;

      const chartData = {
        xAxisCount: 1,
        xValues: createMockXValues(actualXValuesCount),
        series: createMockSeries(5),
      };

      const ctx = createMockBuildContext(chartData, {
        dataLimits: {
          seriesCapacity,
          categoriesCapacity: 50,
        },
      });

      const alerts = getFunnelChartAlerts(ctx);

      expect(alerts).toHaveLength(1);
      expect(alerts[0]).toBe(seriesSliceWarning(actualXValuesCount, seriesCapacity));
    });

    it('should return empty alerts array when xValues count exactly matches capacity', () => {
      const seriesCapacity = 20;
      const chartData = {
        xAxisCount: 1,
        xValues: createMockXValues(seriesCapacity), // Exactly at limit
        series: createMockSeries(5),
      };

      const ctx = createMockBuildContext(chartData, {
        dataLimits: {
          seriesCapacity,
          categoriesCapacity: 50,
        },
      });

      const alerts = getFunnelChartAlerts(ctx);

      expect(alerts).toEqual([]);
    });

    it('should handle empty xValues array', () => {
      const chartData = {
        xAxisCount: 1,
        xValues: [],
        series: createMockSeries(5),
      };

      const ctx = createMockBuildContext(chartData);
      const alerts = getFunnelChartAlerts(ctx);

      expect(alerts).toEqual([]);
    });
  });

  describe('edge cases and data validation', () => {
    it('should handle chart data with both series and xValues exceeding limits separately', () => {
      // Test that only the relevant warning is shown based on xAxisCount
      const seriesCapacity = 5;

      // Test with xAxisCount = 0 (should check series)
      const chartDataSeries = {
        xAxisCount: 0,
        xValues: createMockXValues(10), // This should be ignored
        series: createMockSeries(8), // This should trigger alert
      };

      const ctxSeries = createMockBuildContext(chartDataSeries, {
        dataLimits: {
          seriesCapacity,
          categoriesCapacity: 50,
        },
      });

      const alertsSeries = getFunnelChartAlerts(ctxSeries);
      expect(alertsSeries).toHaveLength(1);
      expect(alertsSeries[0]).toBe(seriesSliceWarning(8, seriesCapacity));

      // Test with xAxisCount = 1 (should check xValues)
      const chartDataXValues = {
        xAxisCount: 1,
        xValues: createMockXValues(8), // This should trigger alert
        series: createMockSeries(10), // This should be ignored
      };

      const ctxXValues = createMockBuildContext(chartDataXValues, {
        dataLimits: {
          seriesCapacity,
          categoriesCapacity: 50,
        },
      });

      const alertsXValues = getFunnelChartAlerts(ctxXValues);
      expect(alertsXValues).toHaveLength(1);
      expect(alertsXValues[0]).toBe(seriesSliceWarning(8, seriesCapacity));
    });

    it('should work with different series capacity values', () => {
      // Test cases that should NOT alert
      const noAlertCases = [
        { capacity: 5, seriesCount: 5 },
        { capacity: 100, seriesCount: 50 },
      ];

      noAlertCases.forEach(({ capacity, seriesCount }) => {
        const chartData = {
          xAxisCount: 0,
          xValues: [],
          series: createMockSeries(seriesCount),
        };

        const ctx = createMockBuildContext(chartData, {
          dataLimits: {
            seriesCapacity: capacity,
            categoriesCapacity: 50,
          },
        });

        const alerts = getFunnelChartAlerts(ctx);
        expect(alerts).toHaveLength(0);
      });

      // Test cases that SHOULD alert
      const alertCases = [
        { capacity: 1, seriesCount: 2 },
        { capacity: 3, seriesCount: 10 },
      ];

      alertCases.forEach(({ capacity, seriesCount }) => {
        const chartData = {
          xAxisCount: 0,
          xValues: [],
          series: createMockSeries(seriesCount),
        };

        const ctx = createMockBuildContext(chartData, {
          dataLimits: {
            seriesCapacity: capacity,
            categoriesCapacity: 50,
          },
        });

        const alerts = getFunnelChartAlerts(ctx);
        expect(alerts).toHaveLength(1);
        expect(alerts[0]).toBe(seriesSliceWarning(seriesCount, capacity));
      });
    });

    it('should properly handle real-world data structure', () => {
      // Create a realistic chart data structure with actual series data
      const realisticSeries = [
        {
          name: 'New',
          title: 'New Items',
          data: [{ value: 1500, blur: false }],
        },
        {
          name: 'Used',
          title: 'Used Items',
          data: [{ value: 1200, blur: false }],
        },
        {
          name: 'Refurbished',
          title: 'Refurbished Items',
          data: [{ value: 800, blur: false }],
        },
      ];

      const chartData = {
        xAxisCount: 0,
        xValues: [],
        series: realisticSeries,
      };

      const ctx = createMockBuildContext(chartData);
      const alerts = getFunnelChartAlerts(ctx);

      expect(alerts).toEqual([]);
    });
  });

  describe('integration with getAlerts function', () => {
    it('should properly integrate with the underlying getAlerts function flow', () => {
      // This tests the complete flow from BuildContext to the getAlerts function
      const chartData = {
        xAxisCount: 0,
        xValues: [],
        series: createMockSeries(60), // Exceeds default capacity
      };

      const ctx = createMockBuildContext(chartData);
      const alerts = getFunnelChartAlerts(ctx);

      expect(alerts).toHaveLength(1);
      expect(typeof alerts[0]).toBe('string');
      expect(alerts[0]).toContain('Maximum number of series');
      expect(alerts[0]).toContain('exceeded');
    });
  });
});
