/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PlotOptions } from '../chart_options_service';
import { CategoricalChartDataOptionsInternal, Value } from '../../chart-data-options/types';
import {
  getFunnelPlotOptions,
  DefaultFunnelType,
  DefaultFunnelSize,
  DefaultFunnelDirection,
  DefaultFunnelLabels,
} from './funnel_plot_options';
import { defaultConfig } from './number_format_config';
import { createAttribute } from '@sisense/sdk-data';
import {
  funnelNeckHeight,
  funnelNeckWidth,
  funnelWidthPercentage,
  isFunnelReversed,
  MAX_FUNNEL_WIDTH,
} from './funnel_plot_options';
import { FunnelChartDesignOptions } from './design_options';
import { BaseDesignOptions } from './base_design_options';

describe('getFunnelPlotOptions', () => {
  it('should return the plotOptions with a formatter', () => {
    const chartDesignOptions: FunnelChartDesignOptions = {
      ...BaseDesignOptions,
      funnelType: DefaultFunnelType,
      funnelSize: DefaultFunnelSize,
      funnelDirection: DefaultFunnelDirection,
      funnelLabels: DefaultFunnelLabels,
    };

    const measure: Value = {
      name: 'column',
      aggregation: 'sum',
      title: 'column',
      sortType: 'sortNone',
      showOnRightAxis: false,
      numberFormatConfig: defaultConfig,
      enabled: true,
    };
    const category = createAttribute({ name: 'series' });

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
            color: '#5b6372',
            fontFamily: 'Open Sans',
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
      series: {
        dataLabels: {
          enabled: true,
        },
      },
    });
  });
});

/**
 * The following tests were adapted from
 * https://gitlab.sisense.com/SisenseTeam/Product/FE/node-modules/sisense-charter/-/tree/master/__tests__/charts/funnel
 */

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
