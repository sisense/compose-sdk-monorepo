import { measureFactory } from '@sisense/sdk-data';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import {
  CartesianChartDataOptions,
  IndicatorChartDataOptions,
  KpiChartDataOptionsInternal,
} from '@/domains/visualizations/core/chart-data-options/types.js';

import {
  getKpiAttributes,
  getKpiMeasures,
  isKpiChartDataOptions,
  isKpiChartDataOptionsInternal,
  translateKpiChartDataOptions,
} from './data-options.js';

const revenue = measureFactory.sum(DM.Commerce.Revenue);
const cost = measureFactory.sum(DM.Commerce.Cost);

describe('kpi - data options translators', () => {
  describe('translateKpiChartDataOptions', () => {
    it('normalizes value to StyledMeasureColumn and defaults valueMode to last', () => {
      const result = translateKpiChartDataOptions({ value: revenue });

      expect(result.value.column).toEqual(expect.objectContaining({ title: revenue.title }));
      expect(result.valueMode).toBe('last');
      expect(result.trend).toBeUndefined();
      expect(result.comparison).toBeUndefined();
    });

    it('keeps an explicitly requested valueMode', () => {
      const result = translateKpiChartDataOptions({ value: revenue, valueMode: 'total' });

      expect(result.valueMode).toBe('total');
    });

    it('normalizes trend to a StyledColumn when provided', () => {
      const result = translateKpiChartDataOptions({
        value: revenue,
        trend: DM.Commerce.Date.Months,
      });

      expect(result.trend).toBeDefined();
      expect(result.trend!.column).toBe(DM.Commerce.Date.Months);
    });

    it('passes through comparison { type: previous-period }', () => {
      const result = translateKpiChartDataOptions({
        value: revenue,
        trend: DM.Commerce.Date.Months,
        comparison: { type: 'previous-period' },
      });

      expect(result.comparison).toEqual({ type: 'previous-period' });
    });

    it('normalizes comparison.value for the delta type to StyledMeasureColumn', () => {
      const result = translateKpiChartDataOptions({
        value: revenue,
        comparison: { type: 'delta', value: cost },
      });

      expect(result.comparison?.type).toBe('delta');
      expect((result.comparison as { value: { column: unknown } }).value.column).toEqual(
        expect.objectContaining({ title: cost.title }),
      );
    });

    it('normalizes comparison.value for the value type to StyledMeasureColumn', () => {
      const result = translateKpiChartDataOptions({
        value: revenue,
        comparison: { type: 'value', value: cost },
      });

      expect(result.comparison?.type).toBe('value');
      expect((result.comparison as { value: { column: unknown } }).value.column).toEqual(
        expect.objectContaining({ title: cost.title }),
      );
    });

    it('keeps a numeric comparison.target as a plain number', () => {
      const result = translateKpiChartDataOptions({
        value: revenue,
        comparison: { type: 'target', target: 100000 },
      });

      expect(result.comparison).toEqual({ type: 'target', target: 100000 });
    });

    it('normalizes a measure comparison.target to StyledMeasureColumn', () => {
      const result = translateKpiChartDataOptions({
        value: revenue,
        comparison: { type: 'target', target: cost },
      });

      expect(result.comparison?.type).toBe('target');
      const target = (result.comparison as { target: unknown }).target;
      expect(typeof target).toBe('object');
      expect((target as { column: unknown }).column).toEqual(
        expect.objectContaining({ title: cost.title }),
      );
    });
  });

  describe('getKpiAttributes', () => {
    it('returns the trend attribute when trend is set', () => {
      const internal = translateKpiChartDataOptions({
        value: revenue,
        trend: DM.Commerce.Date.Months,
      });

      expect(getKpiAttributes(internal)).toEqual([DM.Commerce.Date.Months]);
    });

    it('returns an empty array when trend is not set', () => {
      const internal = translateKpiChartDataOptions({ value: revenue });

      expect(getKpiAttributes(internal)).toEqual([]);
    });
  });

  describe('getKpiMeasures', () => {
    it('returns [value] when there is no comparison', () => {
      const internal = translateKpiChartDataOptions({ value: revenue });

      expect(getKpiMeasures(internal).map((measure) => measure.title)).toEqual([revenue.title]);
    });

    it('returns [value, comparison measure] for a delta comparison', () => {
      const internal = translateKpiChartDataOptions({
        value: revenue,
        comparison: { type: 'delta', value: cost },
      });

      expect(getKpiMeasures(internal).map((measure) => measure.title)).toEqual([
        revenue.title,
        cost.title,
      ]);
    });

    it('returns [value, comparison measure] for a value comparison', () => {
      const internal = translateKpiChartDataOptions({
        value: revenue,
        comparison: { type: 'value', value: cost },
      });

      expect(getKpiMeasures(internal).map((measure) => measure.title)).toEqual([
        revenue.title,
        cost.title,
      ]);
    });

    it('returns [value, comparison target] for a measure target comparison', () => {
      const internal = translateKpiChartDataOptions({
        value: revenue,
        comparison: { type: 'target', target: cost },
      });

      expect(getKpiMeasures(internal).map((measure) => measure.title)).toEqual([
        revenue.title,
        cost.title,
      ]);
    });

    it('returns [value] only for a numeric target comparison', () => {
      const internal = translateKpiChartDataOptions({
        value: revenue,
        comparison: { type: 'target', target: 100000 },
      });

      expect(getKpiMeasures(internal).map((measure) => measure.title)).toEqual([revenue.title]);
    });

    it('returns [value] only for a previous-period comparison', () => {
      const internal = translateKpiChartDataOptions({
        value: revenue,
        trend: DM.Commerce.Date.Months,
        comparison: { type: 'previous-period' },
      });

      expect(getKpiMeasures(internal).map((measure) => measure.title)).toEqual([revenue.title]);
    });
  });

  describe('type guards', () => {
    describe('isKpiChartDataOptions', () => {
      it('accepts KPI data options', () => {
        expect(isKpiChartDataOptions({ value: revenue, trend: DM.Commerce.Date.Months })).toBe(
          true,
        );
      });

      it('rejects cartesian data options', () => {
        const dataOptions: CartesianChartDataOptions = {
          category: [DM.Commerce.Date.Months],
          value: [revenue],
          breakBy: [],
        };

        expect(isKpiChartDataOptions(dataOptions)).toBe(false);
      });

      it('rejects indicator data options (array value)', () => {
        const dataOptions: IndicatorChartDataOptions = { value: [revenue], min: [], max: [] };

        expect(isKpiChartDataOptions(dataOptions)).toBe(false);
      });
    });

    describe('isKpiChartDataOptionsInternal', () => {
      it('accepts translated internal data options', () => {
        const internal = translateKpiChartDataOptions({ value: revenue });

        expect(isKpiChartDataOptionsInternal(internal)).toBe(true);
      });

      it('discriminates on the valueMode+value shape, rejecting other internal shapes', () => {
        const notKpi = {
          x: [{ column: DM.Commerce.Date.Months }],
          y: [{ column: revenue }],
          breakBy: [],
        };

        expect(
          isKpiChartDataOptionsInternal(notKpi as unknown as KpiChartDataOptionsInternal),
        ).toBe(false);
      });

      it('rejects indicator-shaped internal data options (array value, no valueMode)', () => {
        expect(
          isKpiChartDataOptionsInternal({
            value: [{ column: revenue }],
          } as unknown as KpiChartDataOptionsInternal),
        ).toBe(false);
      });
    });
  });
});
