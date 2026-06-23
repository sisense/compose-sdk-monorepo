/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createAttribute } from '@sisense/sdk-data';

import {
  CategoricalChartDataOptionsInternal,
  StyledMeasureColumn,
} from '../../chart-data-options/types';
import { PlotOptions } from '../chart-options-service.js';
import { BaseDesignOptions } from './base-design-options.js';
import { FunnelChartDesignOptions } from './design-options.js';
import {
  DefaultFunnelDirection,
  DefaultFunnelSeriesLabels,
  DefaultFunnelSize,
  DefaultFunnelType,
  getFunnelPlotOptions,
} from './funnel-plot-options.js';
import {
  funnelNeckHeight,
  funnelNeckWidth,
  funnelWidthPercentage,
  isFunnelReversed,
  MAX_FUNNEL_WIDTH,
} from './funnel-plot-options.js';

describe('getFunnelPlotOptions', () => {
  it('should return the plotOptions with a formatter', () => {
    const chartDesignOptions: FunnelChartDesignOptions = {
      ...BaseDesignOptions,
      funnelType: DefaultFunnelType,
      funnelSize: DefaultFunnelSize,
      funnelDirection: DefaultFunnelDirection,
      seriesLabels: DefaultFunnelSeriesLabels,
    };

    const measure = {
      column: {
        name: 'column',
        aggregation: 'sum',
        title: 'column',
      },
      sortType: 'sortNone',
      showOnRightAxis: false,
      enabled: true,
    } as StyledMeasureColumn;
    const category = { column: createAttribute({ name: 'series' }) };

    const chartDataOptions: CategoricalChartDataOptionsInternal = {
      y: [measure],
      breakBy: [category],
    };

    const funnelPlotOptions: PlotOptions = getFunnelPlotOptions(
      chartDesignOptions,
      chartDataOptions,
    );
    expect(funnelPlotOptions).toEqual({
      funnel: {
        allowPointSelect: false,
        cursor: 'pointer',
        dataLabels: {
          align: 'center',
          enabled: true,
          formatter: expect.any(Function),
          funnelMinimumFontSizeToTextLabel: 8,
          style: {
            fontSize: '13px',
            fontWeight: 'normal',
            pointerEvents: 'none',
            textOutline: 'none',
          },
        },
        neckHeight: '0%',
        neckWidth: '20%',
        reversed: false,
        showInLegend: true,
        width: '66.6%',
      },
      series: {},
    });
  });

  describe('formatter behavior with defaultNumberFormattingEnabled', () => {
    const measureWithoutConfig = {
      column: { name: 'revenue', aggregation: 'sum', title: 'Revenue' },
      sortType: 'sortNone',
      showOnRightAxis: false,
      enabled: true,
    } as StyledMeasureColumn;

    const designWithValueOnly: FunnelChartDesignOptions = {
      ...BaseDesignOptions,
      funnelType: DefaultFunnelType,
      funnelSize: DefaultFunnelSize,
      funnelDirection: DefaultFunnelDirection,
      seriesLabels: { ...DefaultFunnelSeriesLabels, showCategory: false, showPercentage: false },
    };

    it('should render raw value when defaultNumberFormattingEnabled is false and no explicit config', () => {
      const options = getFunnelPlotOptions(
        designWithValueOnly,
        { y: [measureWithoutConfig], breakBy: [] },
        false,
      );
      const formatter = (
        options.funnel as any
      ) /* PlotOptions.funnel.dataLabels.formatter is not typed */.dataLabels.formatter;
      const result = formatter.call({ y: 54321, point: { name: '' }, series: { name: 'Revenue' } });
      expect(result).toContain('54321');
      expect(result).not.toContain('54.32K');
    });

    it('should format value with explicit config when defaultNumberFormattingEnabled is false', () => {
      const measureWithConfig = {
        ...measureWithoutConfig,
        numberFormatConfig: { name: 'Percent', decimalScale: 0 },
      } as StyledMeasureColumn;
      const options = getFunnelPlotOptions(
        designWithValueOnly,
        { y: [measureWithConfig], breakBy: [] },
        false,
      );
      const formatter = (
        options.funnel as any
      ) /* PlotOptions.funnel.dataLabels.formatter is not typed */.dataLabels.formatter;
      // 42 * 100 = 4,200% — confirms formatting was applied, not raw String(42)
      const result = formatter.call({ y: 42, point: { name: '' }, series: { name: 'Revenue' } });
      expect(result).toContain('4,200%');
    });
  });
});

describe('Funnel width and height calculation', () => {
  describe('funnel chart width', () => {
    it('Defaults to max width when no renderTo', () => {
      expect(funnelWidthPercentage(null)).toStrictEqual(MAX_FUNNEL_WIDTH);
    });

    it('Defaults to max width when renderTo has no width', () => {
      expect(funnelWidthPercentage({ clientWidth: 0, clientHeight: 0 })).toStrictEqual(
        MAX_FUNNEL_WIDTH,
      );
    });

    it('Defaults to max width when funnel width is bigger then chart width', () => {
      const renderTo = { clientWidth: 1000, clientHeight: 2500 };

      expect(funnelWidthPercentage(renderTo)).toStrictEqual(MAX_FUNNEL_WIDTH);
    });

    it('Calculates proportionally from height', () => {
      const renderTo = { clientWidth: 1000, clientHeight: 400 };

      expect(funnelWidthPercentage(renderTo)).toBe(60);
    });
  });

  describe('funnel neck width', () => {
    it('wide neck', () => {
      expect(funnelNeckWidth(60, 'wide')).toBe(36);
    });

    it('regular neck', () => {
      expect(funnelNeckWidth(60, 'regular')).toBe(18);
    });

    it('narrow neck', () => {
      expect(funnelNeckWidth(60, 'narrow')).toBe(9);
    });
  });

  describe('funnel neck height', () => {
    it('regular neck height', () => {
      expect(funnelNeckHeight('regular')).toBe(0);
    });

    it('pinched neck height', () => {
      expect(funnelNeckHeight('pinched')).toBe(30);
    });
  });

  describe('is funnel reversed', () => {
    it("'regular' is not reversed", () => {
      expect(isFunnelReversed('regular')).toBe(false);
    });

    it("'inverted' is reversed", () => {
      expect(isFunnelReversed('inverted')).toBe(true);
    });
  });
});
