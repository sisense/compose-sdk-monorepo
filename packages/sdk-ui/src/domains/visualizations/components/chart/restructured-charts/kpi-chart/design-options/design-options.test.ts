import { measureFactory } from '@sisense/sdk-data';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { DataColorOptions } from '@/domains/visualizations/core/chart-data/data-coloring';
import { ChartStyleOptions } from '@/types';

import { translateKpiChartDataOptions } from '../data-options/data-options.js';
import {
  getDefaultKpiStyleOptions,
  isKpiStyleOptions,
  KPI_COMPARISON_TEXT_STYLE_DEFAULTS,
  KPI_TITLE_TEXT_STYLE_DEFAULTS,
  KPI_VALUE_TEXT_STYLE_DEFAULTS,
  resolveKpiTextStyle,
  translateKpiStyleOptionsToDesignOptions,
} from './design-options.js';

const revenue = measureFactory.sum(DM.Commerce.Revenue);

const withCategory = translateKpiChartDataOptions({
  value: revenue,
  category: DM.Commerce.Date.Months,
});
const withoutCategory = translateKpiChartDataOptions({ value: revenue });

describe('kpi - design options', () => {
  describe('translateKpiStyleOptionsToDesignOptions', () => {
    describe('layout', () => {
      it('defaults to standard', () => {
        const result = translateKpiStyleOptionsToDesignOptions({}, withoutCategory);
        expect(result.layout).toBe('standard');
      });

      it('honors an explicit layout override', () => {
        const result = translateKpiStyleOptionsToDesignOptions(
          { layout: 'comparison-first' },
          withoutCategory,
        );
        expect(result.layout).toBe('comparison-first');
      });
    });

    describe('title', () => {
      it('defaults to an enabled section with both parts visible and no text', () => {
        const result = translateKpiStyleOptionsToDesignOptions({}, withoutCategory);
        expect(result.title).toEqual({
          enabled: true,
          text: undefined,
          showValueTitle: true,
          showCategoryTitle: true,
          align: 'space-between',
          textStyle: KPI_TITLE_TEXT_STYLE_DEFAULTS,
        });
      });

      it('honors overrides', () => {
        const result = translateKpiStyleOptionsToDesignOptions(
          { title: { enabled: false, text: 'Custom title' } },
          withoutCategory,
        );
        expect(result.title).toEqual({
          enabled: false,
          text: 'Custom title',
          showValueTitle: true,
          showCategoryTitle: true,
          align: 'space-between',
          textStyle: KPI_TITLE_TEXT_STYLE_DEFAULTS,
        });
      });

      it('honors explicit showValueTitle/showCategoryTitle opt-outs', () => {
        const result = translateKpiStyleOptionsToDesignOptions(
          { title: { showValueTitle: false, showCategoryTitle: false } },
          withoutCategory,
        );
        expect(result.title).toEqual({
          enabled: true,
          text: undefined,
          showValueTitle: false,
          showCategoryTitle: false,
          align: 'space-between',
          textStyle: KPI_TITLE_TEXT_STYLE_DEFAULTS,
        });
      });

      it('honors an explicit align override', () => {
        const result = translateKpiStyleOptionsToDesignOptions(
          { title: { align: 'center' } },
          withoutCategory,
        );
        expect(result.title.align).toBe('center');
      });
    });

    describe('value', () => {
      it('defaults textSize to auto with no noDataText/conditionalIcons', () => {
        const result = translateKpiStyleOptionsToDesignOptions({}, withoutCategory);
        expect(result.value).toEqual({
          textSize: 'auto',
          noDataText: undefined,
          conditionalIcons: undefined,
          textStyle: KPI_VALUE_TEXT_STYLE_DEFAULTS,
        });
      });

      it('honors a numeric px textSize and passes noDataText/conditionalIcons through untouched', () => {
        const conditionalIcons = [
          { icon: { type: 'text' as const, value: '⚠' }, expression: '0', operator: '<' as const },
        ];
        const result = translateKpiStyleOptionsToDesignOptions(
          {
            value: {
              textSize: 48,
              noDataText: 'No data',
              conditionalIcons,
            },
          },
          withoutCategory,
        );
        expect(result.value).toEqual({
          textSize: 48,
          noDataText: 'No data',
          conditionalIcons,
          textStyle: KPI_VALUE_TEXT_STYLE_DEFAULTS,
        });
      });
    });

    describe('textStyle', () => {
      it('resolves every section to its defaults when nothing is set', () => {
        const result = translateKpiStyleOptionsToDesignOptions({}, withoutCategory);
        expect(result.value.textStyle).toEqual(KPI_VALUE_TEXT_STYLE_DEFAULTS);
        expect(result.title.textStyle).toEqual(KPI_TITLE_TEXT_STYLE_DEFAULTS);
        expect(result.comparison.textStyle).toEqual(KPI_COMPARISON_TEXT_STYLE_DEFAULTS);
      });

      it('keeps the shipped defaults: bold value, semibold uppercase title, semibold comparison', () => {
        expect(KPI_VALUE_TEXT_STYLE_DEFAULTS).toEqual({
          fontWeight: '700',
          fontStyle: 'normal',
          textTransform: 'none',
        });
        expect(KPI_TITLE_TEXT_STYLE_DEFAULTS).toEqual({
          fontWeight: '600',
          fontStyle: 'normal',
          textTransform: 'uppercase',
        });
        expect(KPI_COMPARISON_TEXT_STYLE_DEFAULTS).toEqual({
          fontWeight: '600',
          fontStyle: 'normal',
          textTransform: 'none',
        });
      });

      it('merges partial overrides field by field over the section defaults', () => {
        const result = translateKpiStyleOptionsToDesignOptions(
          {
            value: { textStyle: { fontWeight: '400' } },
            title: { textStyle: { textTransform: 'none', fontFamily: 'Georgia' } },
            comparison: { textStyle: { fontStyle: 'italic' } },
          },
          withoutCategory,
        );
        expect(result.value.textStyle).toEqual({
          fontWeight: '400',
          fontStyle: 'normal',
          textTransform: 'none',
        });
        expect(result.title.textStyle).toEqual({
          fontFamily: 'Georgia',
          fontWeight: '600',
          fontStyle: 'normal',
          textTransform: 'none',
        });
        expect(result.comparison.textStyle).toEqual({
          fontWeight: '600',
          fontStyle: 'italic',
          textTransform: 'none',
        });
      });

      it('does not let an explicit undefined erase a default', () => {
        expect(
          resolveKpiTextStyle({ fontWeight: undefined }, KPI_VALUE_TEXT_STYLE_DEFAULTS),
        ).toEqual(KPI_VALUE_TEXT_STYLE_DEFAULTS);
      });

      it('leaves fontFamily unset (theme fallback) unless the user provides one', () => {
        expect(resolveKpiTextStyle(undefined, KPI_TITLE_TEXT_STYLE_DEFAULTS)).not.toHaveProperty(
          'fontFamily',
        );
        expect(
          resolveKpiTextStyle({ fontFamily: 'Georgia' }, KPI_TITLE_TEXT_STYLE_DEFAULTS).fontFamily,
        ).toBe('Georgia');
      });
    });

    describe('comparison', () => {
      it('defaults display to percent, showIcon to true, with no color/label/conditionalIcons', () => {
        const result = translateKpiStyleOptionsToDesignOptions({}, withoutCategory);
        expect(result.comparison).toEqual({
          display: 'percent',
          label: undefined,
          color: undefined,
          showIcon: true,
          conditionalIcons: undefined,
          textStyle: KPI_COMPARISON_TEXT_STYLE_DEFAULTS,
        });
      });

      it('honors display and showIcon overrides', () => {
        const result = translateKpiStyleOptionsToDesignOptions(
          { comparison: { display: 'both', showIcon: false } },
          withoutCategory,
        );
        expect(result.comparison.display).toBe('both');
        expect(result.comparison.showIcon).toBe(false);
      });

      it('passes a string color through untouched with no default injected', () => {
        const result = translateKpiStyleOptionsToDesignOptions(
          { comparison: { color: '#00ff00' } },
          withoutCategory,
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
          withoutCategory,
        );
        expect(result.comparison.color).toBe(color);
      });

      it('leaves color undefined when none is provided (sign-based default applied later in the renderer)', () => {
        const result = translateKpiStyleOptionsToDesignOptions({}, withCategory);
        expect(result.comparison.color).toBeUndefined();
      });

      it('passes label and conditionalIcons through untouched', () => {
        const conditionalIcons = [
          { icon: { type: 'text' as const, value: '▲' }, expression: '0', operator: '>' as const },
        ];
        const result = translateKpiStyleOptionsToDesignOptions(
          { comparison: { label: 'vs last year', conditionalIcons } },
          withoutCategory,
        );
        expect(result.comparison.label).toBe('vs last year');
        expect(result.comparison.conditionalIcons).toBe(conditionalIcons);
      });

      it('passes the target string override templates through untouched', () => {
        const result = translateKpiStyleOptionsToDesignOptions(
          {
            comparison: {
              ofGoalText: '{{percent}} of {{goal}} target',
              toGoText: '{{value}} remaining',
            },
          },
          withoutCategory,
        );
        expect(result.comparison.ofGoalText).toBe('{{percent}} of {{goal}} target');
        expect(result.comparison.toGoText).toBe('{{value}} remaining');
      });

      it('leaves the target string overrides undefined by default (localized templates applied in the renderer)', () => {
        const result = translateKpiStyleOptionsToDesignOptions({}, withoutCategory);
        expect(result.comparison.ofGoalText).toBeUndefined();
        expect(result.comparison.toGoText).toBeUndefined();
      });

      it('never carries the deleted direction/positiveColor/negativeColor/neutralColor/neutralThreshold concepts', () => {
        const result = translateKpiStyleOptionsToDesignOptions({}, withoutCategory);
        expect(result.comparison).not.toHaveProperty('direction');
        expect(result.comparison).not.toHaveProperty('positiveColor');
        expect(result.comparison).not.toHaveProperty('negativeColor');
        expect(result.comparison).not.toHaveProperty('neutralColor');
        expect(result.comparison).not.toHaveProperty('neutralThreshold');
      });
    });

    describe('sparkline', () => {
      it('enables the sparkline by default when a category dimension is set', () => {
        const result = translateKpiStyleOptionsToDesignOptions({}, withCategory);
        expect(result.sparkline).toEqual({ enabled: true, chartType: 'area' });
      });

      it('disables the sparkline by default when no category dimension is set', () => {
        const result = translateKpiStyleOptionsToDesignOptions({}, withoutCategory);
        expect(result.sparkline.enabled).toBe(false);
      });

      it('honors an explicit sparkline opt-out even when a category dimension is set', () => {
        const result = translateKpiStyleOptionsToDesignOptions(
          { sparkline: { enabled: false } },
          withCategory,
        );
        expect(result.sparkline.enabled).toBe(false);
      });

      it('cannot be forced on when no category dimension is set', () => {
        const result = translateKpiStyleOptionsToDesignOptions(
          { sparkline: { enabled: true } },
          withoutCategory,
        );
        expect(result.sparkline.enabled).toBe(false);
      });

      it('defaults chart type to area', () => {
        const result = translateKpiStyleOptionsToDesignOptions({}, withCategory);
        expect(result.sparkline.chartType).toBe('area');
      });

      it('honors a chart type override', () => {
        const result = translateKpiStyleOptionsToDesignOptions(
          { sparkline: { chartType: 'line' } },
          withCategory,
        );
        expect(result.sparkline.chartType).toBe('line');
      });
    });

    describe('card', () => {
      it('resolves defaults', () => {
        const result = translateKpiStyleOptionsToDesignOptions({}, withoutCategory);
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
          withoutCategory,
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
          withoutCategory,
        );
        expect(result.card.textAlign).toBe('right');
      });
    });

    describe('width/height', () => {
      it('passes width and height through', () => {
        const result = translateKpiStyleOptionsToDesignOptions(
          { width: 300, height: 200 },
          withCategory,
        );
        expect(result.width).toBe(300);
        expect(result.height).toBe(200);
      });
    });
  });

  describe('getDefaultKpiStyleOptions', () => {
    it('round-trips through translateKpiStyleOptionsToDesignOptions identically to {} when no category is set', () => {
      const fromDefaults = translateKpiStyleOptionsToDesignOptions(
        getDefaultKpiStyleOptions(),
        withoutCategory,
      );
      const fromEmpty = translateKpiStyleOptionsToDesignOptions({}, withoutCategory);
      expect(fromDefaults).toEqual(fromEmpty);
    });

    it('round-trips through translateKpiStyleOptionsToDesignOptions identically to {} when a category is set', () => {
      const fromDefaults = translateKpiStyleOptionsToDesignOptions(
        getDefaultKpiStyleOptions(),
        withCategory,
      );
      const fromEmpty = translateKpiStyleOptionsToDesignOptions({}, withCategory);
      expect(fromDefaults).toEqual(fromEmpty);
    });

    it('hands out its own textStyle object copies, not references to the shared defaults', () => {
      const first = getDefaultKpiStyleOptions();
      const second = getDefaultKpiStyleOptions();

      expect(first.value?.textStyle).toEqual(KPI_VALUE_TEXT_STYLE_DEFAULTS);
      expect(first.value?.textStyle).not.toBe(KPI_VALUE_TEXT_STYLE_DEFAULTS);
      expect(second.value?.textStyle).not.toBe(first.value?.textStyle);

      expect(first.title?.textStyle).toEqual(KPI_TITLE_TEXT_STYLE_DEFAULTS);
      expect(first.title?.textStyle).not.toBe(KPI_TITLE_TEXT_STYLE_DEFAULTS);
      expect(second.title?.textStyle).not.toBe(first.title?.textStyle);

      expect(first.comparison?.textStyle).toEqual(KPI_COMPARISON_TEXT_STYLE_DEFAULTS);
      expect(first.comparison?.textStyle).not.toBe(KPI_COMPARISON_TEXT_STYLE_DEFAULTS);
      expect(second.comparison?.textStyle).not.toBe(first.comparison?.textStyle);
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
