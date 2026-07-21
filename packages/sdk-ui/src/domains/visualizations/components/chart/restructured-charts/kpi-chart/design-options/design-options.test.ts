import { measureFactory } from '@sisense/sdk-data';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { DataColorOptions } from '@/domains/visualizations/core/chart-data/data-coloring';
import { ChartStyleOptions } from '@/types';

import { translateKpiChartDataOptions } from '../data-options/data-options.js';
import {
  getDefaultKpiStyleOptions,
  isKpiStyleOptions,
  translateKpiStyleOptionsToDesignOptions,
} from './design-options.js';

const revenue = measureFactory.sum(DM.Commerce.Revenue);

const withTrend = translateKpiChartDataOptions({
  value: revenue,
  trend: DM.Commerce.Date.Months,
});
const withoutTrend = translateKpiChartDataOptions({ value: revenue });

describe('kpi - design options', () => {
  describe('translateKpiStyleOptionsToDesignOptions', () => {
    describe('layout', () => {
      it('defaults to standard', () => {
        const result = translateKpiStyleOptionsToDesignOptions({}, withoutTrend);
        expect(result.layout).toBe('standard');
      });

      it('honors an explicit layout override', () => {
        const result = translateKpiStyleOptionsToDesignOptions(
          { layout: 'big-comparison' },
          withoutTrend,
        );
        expect(result.layout).toBe('big-comparison');
      });
    });

    describe('title', () => {
      it('defaults to enabled with no text', () => {
        const result = translateKpiStyleOptionsToDesignOptions({}, withoutTrend);
        expect(result.title).toEqual({ enabled: true, text: undefined });
      });

      it('honors overrides', () => {
        const result = translateKpiStyleOptionsToDesignOptions(
          { title: { enabled: false, text: 'Custom title' } },
          withoutTrend,
        );
        expect(result.title).toEqual({ enabled: false, text: 'Custom title' });
      });
    });

    describe('value', () => {
      it('defaults textSize to auto with no noDataText/conditionalIcons', () => {
        const result = translateKpiStyleOptionsToDesignOptions({}, withoutTrend);
        expect(result.value).toEqual({
          textSize: 'auto',
          noDataText: undefined,
          conditionalIcons: undefined,
        });
      });

      it('honors a numeric px textSize and passes noDataText/conditionalIcons through untouched', () => {
        const conditionalIcons = [{ icon: '⚠', expression: '0', operator: '<' as const }];
        const result = translateKpiStyleOptionsToDesignOptions(
          {
            value: {
              textSize: 48,
              noDataText: 'No data',
              conditionalIcons,
            },
          },
          withoutTrend,
        );
        expect(result.value).toEqual({
          textSize: 48,
          noDataText: 'No data',
          conditionalIcons,
        });
      });
    });

    describe('comparison', () => {
      it('defaults display to percent, showIcon to true, with no color/label/conditionalIcons', () => {
        const result = translateKpiStyleOptionsToDesignOptions({}, withoutTrend);
        expect(result.comparison).toEqual({
          display: 'percent',
          label: undefined,
          color: undefined,
          showIcon: true,
          conditionalIcons: undefined,
        });
      });

      it('honors display and showIcon overrides', () => {
        const result = translateKpiStyleOptionsToDesignOptions(
          { comparison: { display: 'both', showIcon: false } },
          withoutTrend,
        );
        expect(result.comparison.display).toBe('both');
        expect(result.comparison.showIcon).toBe(false);
      });

      it('passes a string color through untouched with no default injected', () => {
        const result = translateKpiStyleOptionsToDesignOptions(
          { comparison: { color: '#00ff00' } },
          withoutTrend,
        );
        expect(result.comparison.color).toBe('#00ff00');
      });

      it('passes a conditional color object through untouched with no default injected', () => {
        const color: DataColorOptions = {
          type: 'conditional',
          conditions: [
            { color: '#2ecc71', expression: '0', operator: '<' },
            { color: '#e74c3c', expression: '0', operator: '>' },
          ],
        };
        const result = translateKpiStyleOptionsToDesignOptions(
          { comparison: { color } },
          withoutTrend,
        );
        expect(result.comparison.color).toBe(color);
      });

      it('leaves color undefined when none is provided (sign-based default applied later in the renderer)', () => {
        const result = translateKpiStyleOptionsToDesignOptions({}, withTrend);
        expect(result.comparison.color).toBeUndefined();
      });

      it('passes label and conditionalIcons through untouched', () => {
        const conditionalIcons = [{ icon: '▲', expression: '0', operator: '>' as const }];
        const result = translateKpiStyleOptionsToDesignOptions(
          { comparison: { label: 'vs last year', conditionalIcons } },
          withoutTrend,
        );
        expect(result.comparison.label).toBe('vs last year');
        expect(result.comparison.conditionalIcons).toBe(conditionalIcons);
      });

      it('never carries the deleted direction/positiveColor/negativeColor/neutralColor/neutralThreshold concepts', () => {
        const result = translateKpiStyleOptionsToDesignOptions({}, withoutTrend);
        expect(result.comparison).not.toHaveProperty('direction');
        expect(result.comparison).not.toHaveProperty('positiveColor');
        expect(result.comparison).not.toHaveProperty('negativeColor');
        expect(result.comparison).not.toHaveProperty('neutralColor');
        expect(result.comparison).not.toHaveProperty('neutralThreshold');
      });
    });

    describe('sparkline', () => {
      it('enables the sparkline by default when a trend dimension is set', () => {
        const result = translateKpiStyleOptionsToDesignOptions({}, withTrend);
        expect(result.sparkline).toEqual({ enabled: true, chartType: 'area' });
      });

      it('disables the sparkline by default when no trend dimension is set', () => {
        const result = translateKpiStyleOptionsToDesignOptions({}, withoutTrend);
        expect(result.sparkline.enabled).toBe(false);
      });

      it('honors an explicit sparkline opt-out even when a trend dimension is set', () => {
        const result = translateKpiStyleOptionsToDesignOptions(
          { sparkline: { enabled: false } },
          withTrend,
        );
        expect(result.sparkline.enabled).toBe(false);
      });

      it('cannot be forced on when no trend dimension is set', () => {
        const result = translateKpiStyleOptionsToDesignOptions(
          { sparkline: { enabled: true } },
          withoutTrend,
        );
        expect(result.sparkline.enabled).toBe(false);
      });

      it('defaults chart type to area', () => {
        const result = translateKpiStyleOptionsToDesignOptions({}, withTrend);
        expect(result.sparkline.chartType).toBe('area');
      });

      it('honors a chart type override', () => {
        const result = translateKpiStyleOptionsToDesignOptions(
          { sparkline: { chartType: 'line' } },
          withTrend,
        );
        expect(result.sparkline.chartType).toBe('line');
      });
    });

    describe('card', () => {
      it('resolves defaults', () => {
        const result = translateKpiStyleOptionsToDesignOptions({}, withoutTrend);
        expect(result.card).toEqual({
          backgroundColor: undefined,
          textAlign: 'left',
          showBorder: false,
          cornerRadius: 8,
        });
      });

      it('honors overrides', () => {
        const result = translateKpiStyleOptionsToDesignOptions(
          {
            card: {
              backgroundColor: '#123456',
              textAlign: 'center',
              showBorder: true,
              cornerRadius: 0,
            },
          },
          withoutTrend,
        );
        expect(result.card).toEqual({
          backgroundColor: '#123456',
          textAlign: 'center',
          showBorder: true,
          cornerRadius: 0,
        });
      });

      it("passes through a 'right' textAlign override", () => {
        const result = translateKpiStyleOptionsToDesignOptions(
          { card: { textAlign: 'right' } },
          withoutTrend,
        );
        expect(result.card.textAlign).toBe('right');
      });
    });

    describe('width/height', () => {
      it('passes width and height through', () => {
        const result = translateKpiStyleOptionsToDesignOptions(
          { width: 300, height: 200 },
          withTrend,
        );
        expect(result.width).toBe(300);
        expect(result.height).toBe(200);
      });
    });
  });

  describe('getDefaultKpiStyleOptions', () => {
    it('round-trips through translateKpiStyleOptionsToDesignOptions identically to {} when no trend is set', () => {
      const fromDefaults = translateKpiStyleOptionsToDesignOptions(
        getDefaultKpiStyleOptions(),
        withoutTrend,
      );
      const fromEmpty = translateKpiStyleOptionsToDesignOptions({}, withoutTrend);
      expect(fromDefaults).toEqual(fromEmpty);
    });

    it('round-trips through translateKpiStyleOptionsToDesignOptions identically to {} when a trend is set', () => {
      const fromDefaults = translateKpiStyleOptionsToDesignOptions(
        getDefaultKpiStyleOptions(),
        withTrend,
      );
      const fromEmpty = translateKpiStyleOptionsToDesignOptions({}, withTrend);
      expect(fromDefaults).toEqual(fromEmpty);
    });
  });

  describe('isKpiStyleOptions', () => {
    it('rejects subtype-carrying style options', () => {
      expect(
        isKpiStyleOptions({ subtype: 'indicator/gauge', skin: 1 } as unknown as ChartStyleOptions),
      ).toBe(false);
    });

    it('accepts plain KPI style options, including an empty object', () => {
      expect(
        isKpiStyleOptions({ card: { backgroundColor: '#fff' } } as unknown as ChartStyleOptions),
      ).toBe(true);
      expect(isKpiStyleOptions({} as ChartStyleOptions)).toBe(true);
    });
  });
});
