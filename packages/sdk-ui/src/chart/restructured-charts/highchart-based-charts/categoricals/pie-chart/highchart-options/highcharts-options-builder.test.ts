import { TFunction } from 'i18next';
import { describe, expect, it, vi } from 'vitest';

import { CompleteThemeSettings } from '@/types';

import { BuildContext } from '../../../types';
import { PieChartDesignOptions } from '../types';
import { pieHighchartsOptionsBuilder } from './highcharts-options-builder';

describe('Pie Highcharts Options Builder', () => {
  const createMockContext = (
    designOptions: Partial<PieChartDesignOptions> = {},
  ): BuildContext<'pie'> => ({
    chartData: {
      type: 'categorical',
      xAxisCount: 1,
      xValues: [['A', 'B', 'C']],
      series: [
        {
          name: 'Series 1',
          data: [10, 20, 30],
          type: 'pie',
        },
      ],
    } as any,
    dataOptions: {
      y: [{ name: 'Values', aggregation: 'sum' }],
      breakBy: [],
    } as any,
    designOptions: {
      pieType: 'classic',
      seriesLabels: {
        enabled: true,
        showCategory: true,
        showValue: false,
        percentageLabels: {
          enabled: true,
          showDecimals: false,
        },
      },
      legend: {
        enabled: true,
        position: 'bottom',
      },
      convolution: { enabled: false },
      dataLimits: {
        seriesCapacity: 50000,
        categoriesCapacity: 50000,
      },
      ...designOptions,
    } as PieChartDesignOptions,
    extraConfig: {
      translate: vi.fn((key: string) => key) as unknown as TFunction,
      themeSettings: {
        chart: {
          textColor: '#000000',
        },
        typography: {
          fontFamily: 'Arial',
          primaryTextColor: '#000000',
        },
      } as CompleteThemeSettings,
      dateFormatter: vi.fn(() => 'formatted-date'),
      accessibilityEnabled: false,
    },
  });

  describe('getPlotOptions', () => {
    it('should return basic plot options without semicircle', () => {
      const ctx = createMockContext();

      const plotOptions = pieHighchartsOptionsBuilder.getPlotOptions(ctx);
      const pieOptions = plotOptions!.pie!;

      expect(pieOptions).toBeDefined();
      expect(pieOptions.startAngle).toBeUndefined();
      expect(pieOptions.endAngle).toBeUndefined();
    });

    it('should add startAngle, endAngle, and center positioning when semiCircle is true', () => {
      const ctx = createMockContext({ semiCircle: true });

      const plotOptions = pieHighchartsOptionsBuilder.getPlotOptions(ctx);
      const pieOptions = plotOptions!.pie!;

      expect(pieOptions).toBeDefined();
      expect(pieOptions.startAngle).toBe(-90);
      expect(pieOptions.endAngle).toBe(90);
      expect(pieOptions.center).toEqual(['50%', '75%']);
    });

    it('should not add startAngle, endAngle, or center when semiCircle is false', () => {
      const ctx = createMockContext({ semiCircle: false });

      const plotOptions = pieHighchartsOptionsBuilder.getPlotOptions(ctx);
      const pieOptions = plotOptions!.pie!;

      expect(pieOptions).toBeDefined();
      expect(pieOptions.startAngle).toBeUndefined();
      expect(pieOptions.endAngle).toBeUndefined();
      expect(pieOptions.center).toBeUndefined();
    });

    it('should preserve other pie options when adding semicircle', () => {
      const ctx = createMockContext({
        semiCircle: true,
        pieType: 'donut',
      });

      const plotOptions = pieHighchartsOptionsBuilder.getPlotOptions(ctx);
      const pieOptions = plotOptions!.pie!;

      expect(pieOptions).toBeDefined();
      expect(pieOptions.startAngle).toBe(-90);
      expect(pieOptions.endAngle).toBe(90);
      expect(pieOptions.center).toEqual(['50%', '75%']);
      expect(pieOptions.innerSize).toBe('40%'); // donut has 40% inner size
      expect(pieOptions.showInLegend).toBe(true);
    });
  });
});
