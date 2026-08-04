import { measureFactory } from '@sisense/sdk-data';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { StyledMeasureColumn } from '@/domains/visualizations/core/chart-data-options/types.js';
import { DataTable } from '@/domains/visualizations/core/chart-data-processor/table-processor.js';
import { formatNumber } from '@/infra/formatting/index.js';
import { ConditionalDataColorOptions } from '@/types';

import { translateKpiChartDataOptions } from '../data-options/data-options.js';
import { getKpiChartData } from './data.js';
import { KPI_ROW_TYPE_COLUMN } from './load-data.js';

const revenue = measureFactory.sum(DM.Commerce.Revenue);
const cost = measureFactory.sum(DM.Commerce.Cost);

const JAN = Date.UTC(2026, 0, 1);
const FEB = Date.UTC(2026, 1, 1);
const MAR = Date.UTC(2026, 2, 1);

/** Mirrors the no-`name` case of the module's label rule (`getDataOptionTitle`): `column.title || column.name`. */
function displayLabel(styled: { column: { title?: string; name: string } }): string {
  return styled.column.title || styled.column.name;
}

/**
 * Builds a `DataTable` for tests. Cells carry a pre-built `compareValue` (as the real
 * data-processing pipeline would produce), so `getValue` returns exactly the given
 * value without re-parsing a `displayValue` string. `null` simulates a missing/blank
 * cell (e.g. the merged total row's blanked-out date column) -- its `compareValue.value`
 * is `NaN`, matching what `createCompareValue` produces for an empty date/number string.
 */
function makeTable(
  columns: { name: string; type: string }[],
  rows: (number | string | null)[][],
): DataTable {
  return {
    columns: columns.map((column, index) => ({ ...column, index, direction: 0 })),
    rows: rows.map((row) =>
      row.map((value) => ({
        displayValue: value === null ? '' : String(value),
        compareValue: {
          value: value === null ? NaN : value,
          valueUndefined: value === null,
          valueIsNaN: value === null,
        },
      })),
    ),
  };
}

describe('kpi - getKpiChartData', () => {
  describe('headline', () => {
    it('reads the value from the single row when no category is set', () => {
      const dataOptions = translateKpiChartDataOptions({ value: revenue });
      const table = makeTable([{ name: revenue.name, type: 'number' }], [[1000]]);

      const result = getKpiChartData(dataOptions, table);

      expect(result.hasRows).toBe(true);
      expect(result.value).toBe(1000);
      expect(result.valueTitle).toBe(displayLabel(dataOptions.value));
      expect(result.valuePeriodMs).toBeUndefined();
      expect(result.sparklinePoints).toBeUndefined();
      expect(result.comparison).toBeUndefined();
    });

    it("derives the headline from the last bucket for valueMode 'last', with its epoch as valuePeriodMs", () => {
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        category: DM.Commerce.Date.Months,
        valueMode: 'last',
      });
      const table = makeTable(
        [
          { name: DM.Commerce.Date.Months.name, type: 'datetime' },
          { name: revenue.name, type: 'number' },
        ],
        [
          [JAN, 100],
          [FEB, 120],
          [MAR, 90],
        ],
      );

      const result = getKpiChartData(dataOptions, table);

      expect(result.value).toBe(90);
      expect(result.valuePeriodMs).toBe(MAR);
    });

    it("reads the headline from the '$kpiRowType'='total' row for valueMode 'total', excluding it from the buckets", () => {
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        category: DM.Commerce.Date.Months,
        valueMode: 'total',
      });
      const table = makeTable(
        [
          { name: DM.Commerce.Date.Months.name, type: 'datetime' },
          { name: revenue.name, type: 'number' },
          { name: KPI_ROW_TYPE_COLUMN, type: 'string' },
        ],
        [
          [JAN, 100, 'bucket'],
          [FEB, 120, 'bucket'],
          [MAR, 90, 'bucket'],
          [null, 310, 'total'],
        ],
      );

      const result = getKpiChartData(dataOptions, table);

      expect(result.value).toBe(310);
      expect(result.sparklinePoints).toEqual([
        { x: JAN, y: 100 },
        { x: FEB, y: 120 },
        { x: MAR, y: 90 },
      ]);
      // valueMode 'total' has no single "current" bucket, so no period caption
      expect(result.valuePeriodMs).toBeUndefined();
    });

    it('single-query path (no $kpiRowType column): every row is a bucket', () => {
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        category: DM.Commerce.Date.Months,
        valueMode: 'last',
      });
      const table = makeTable(
        [
          { name: DM.Commerce.Date.Months.name, type: 'datetime' },
          { name: revenue.name, type: 'number' },
        ],
        [
          [JAN, 100],
          [FEB, 120],
        ],
      );

      const result = getKpiChartData(dataOptions, table);

      expect(result.sparklinePoints).toHaveLength(2);
      expect(result.value).toBe(120);
    });

    it('treats an Infinity measure value as missing rather than a real number (finite-value contract)', () => {
      const dataOptions = translateKpiChartDataOptions({ value: revenue });
      const table = makeTable([{ name: revenue.name, type: 'number' }], [[Infinity]]);

      const result = getKpiChartData(dataOptions, table);

      expect(result.hasRows).toBe(true);
      expect(result.value).toBeUndefined();
    });

    it('renders an Infinity category value as a sparkline gap (null y), not a real data point', () => {
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        category: DM.Commerce.Date.Months,
      });
      const table = makeTable(
        [
          { name: DM.Commerce.Date.Months.name, type: 'datetime' },
          { name: revenue.name, type: 'number' },
        ],
        [
          [JAN, Infinity],
          [FEB, 120],
        ],
      );

      const result = getKpiChartData(dataOptions, table);

      expect(result.sparklinePoints).toEqual([
        { x: JAN, y: null },
        { x: FEB, y: 120 },
      ]);
    });
  });

  describe('styled wrapper name', () => {
    it("uses the styled wrapper's top-level name as the headline title", () => {
      const dataOptions = translateKpiChartDataOptions({
        value: { column: revenue, name: 'Total Revenueeeee' },
      });
      const table = makeTable([{ name: revenue.name, type: 'number' }], [[1000]]);

      const result = getKpiChartData(dataOptions, table);

      expect(result.valueTitle).toBe('Total Revenueeeee');
    });

    it("uses the styled wrapper's top-level name as a delta comparison label", () => {
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        comparison: { type: 'delta', value: { column: cost, name: 'My Cost' } },
      });
      const table = makeTable(
        [
          { name: revenue.name, type: 'number' },
          { name: cost.name, type: 'number' },
        ],
        [[1000, 800]],
      );

      const result = getKpiChartData(dataOptions, table);

      expect(result.comparison).toMatchObject({ type: 'delta', label: 'My Cost' });
    });

    it("uses the styled wrapper's top-level name as a target comparison label", () => {
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        comparison: { type: 'target', target: { column: cost, name: 'Goal 2026' } },
      });
      const table = makeTable(
        [
          { name: revenue.name, type: 'number' },
          { name: cost.name, type: 'number' },
        ],
        [[1000, 1200]],
      );

      const result = getKpiChartData(dataOptions, table);

      expect(result.comparison).toMatchObject({ type: 'target', label: 'Goal 2026' });
    });
  });

  describe('comparison', () => {
    it('previous-period: baseline from the second-to-last bucket, labelKey derived from granularity', () => {
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        category: DM.Commerce.Date.Months,
        comparison: { type: 'previous-period' },
      });
      const table = makeTable(
        [
          { name: DM.Commerce.Date.Months.name, type: 'datetime' },
          { name: revenue.name, type: 'number' },
        ],
        [
          [JAN, 100],
          [FEB, 120],
          [MAR, 90],
        ],
      );

      const result = getKpiChartData(dataOptions, table);

      expect(result.comparison).toEqual({
        type: 'previous-period',
        baseline: 120,
        deltaValue: -30,
        deltaPercent: -25,
        labelKey: 'kpi.comparison.vsPriorMonth',
      });
    });

    it('previous-period: a single bucket (no prior bucket) leaves comparison undefined (null-rule 3)', () => {
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        category: DM.Commerce.Date.Months,
        comparison: { type: 'previous-period' },
      });
      const table = makeTable(
        [
          { name: DM.Commerce.Date.Months.name, type: 'datetime' },
          { name: revenue.name, type: 'number' },
        ],
        [[JAN, 100]],
      );

      expect(getKpiChartData(dataOptions, table).comparison).toBeUndefined();
    });

    it('previous-period: a null prior bucket also leaves comparison undefined (null-rule 3)', () => {
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        category: DM.Commerce.Date.Months,
        comparison: { type: 'previous-period' },
      });
      const table = makeTable(
        [
          { name: DM.Commerce.Date.Months.name, type: 'datetime' },
          { name: revenue.name, type: 'number' },
        ],
        [
          [JAN, null],
          [FEB, 120],
        ],
      );

      expect(getKpiChartData(dataOptions, table).comparison).toBeUndefined();
    });

    it('delta: computes baseline from the comparison measure column via calcDeltaComparison', () => {
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        comparison: { type: 'delta', value: cost },
      });
      const table = makeTable(
        [
          { name: revenue.name, type: 'number' },
          { name: cost.name, type: 'number' },
        ],
        [[150, 100]],
      );

      const result = getKpiChartData(dataOptions, table);

      expect(result.comparison).toEqual({
        type: 'delta',
        baseline: 100,
        deltaValue: 50,
        deltaPercent: 50,
        label: displayLabel({ column: cost }),
      });
    });

    it('delta: omits deltaPercent when the comparison-measure baseline is zero', () => {
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        comparison: { type: 'delta', value: cost },
      });
      const table = makeTable(
        [
          { name: revenue.name, type: 'number' },
          { name: cost.name, type: 'number' },
        ],
        [[150, 0]],
      );

      const result = getKpiChartData(dataOptions, table);

      expect(result.comparison).toEqual({
        type: 'delta',
        baseline: 0,
        deltaValue: 150,
        deltaPercent: undefined,
        label: displayLabel({ column: cost }),
      });
    });

    it('target (measure): computes percentOfTarget and toGo', () => {
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        comparison: { type: 'target', target: cost },
      });
      const table = makeTable(
        [
          { name: revenue.name, type: 'number' },
          { name: cost.name, type: 'number' },
        ],
        [[82, 100]],
      );

      const result = getKpiChartData(dataOptions, table);

      expect(result.comparison).toEqual({
        type: 'target',
        target: 100,
        percentOfTarget: 82,
        toGo: 18,
        label: displayLabel({ column: cost }),
      });
    });

    it('target (fixed number): computes percentOfTarget/toGo and labels with the formatted number', () => {
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        comparison: { type: 'target', target: 1000 },
      });
      const table = makeTable([{ name: revenue.name, type: 'number' }], [[500]]);

      const result = getKpiChartData(dataOptions, table);

      expect(result.comparison).toEqual({
        type: 'target',
        target: 1000,
        percentOfTarget: 50,
        toGo: 500,
        label: formatNumber(1000),
      });
    });

    it('target: a zero target omits percentOfTarget but still reports toGo', () => {
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        comparison: { type: 'target', target: 0 },
      });
      const table = makeTable([{ name: revenue.name, type: 'number' }], [[50]]);

      const result = getKpiChartData(dataOptions, table);

      expect(result.comparison).toMatchObject({
        type: 'target',
        target: 0,
        percentOfTarget: undefined,
        toGo: -50,
      });
    });

    it('value: passes the second value through with its own numberFormatConfig and measure-driven color', () => {
      const greenAbove50: ConditionalDataColorOptions = {
        type: 'conditional',
        conditions: [{ color: '#00ff00', expression: '50', operator: '>' }],
        defaultColor: '#ff0000',
      };
      const styledCost: StyledMeasureColumn = {
        column: cost,
        color: greenAbove50,
        numberFormatConfig: { name: 'Currency' },
      };
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        comparison: { type: 'value', value: styledCost },
      });
      const table = makeTable(
        [
          { name: revenue.name, type: 'number' },
          { name: cost.name, type: 'number' },
        ],
        [[150, 100]],
      );

      const result = getKpiChartData(dataOptions, table);

      expect(result.comparison).toEqual({
        type: 'value',
        value: 100,
        label: displayLabel({ column: cost }),
        color: '#00ff00',
        numberFormatConfig: { name: 'Currency' },
      });
    });
  });

  describe('sparkline', () => {
    it('builds points from the buckets; an empty bucket is a null y, never zero', () => {
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        category: DM.Commerce.Date.Months,
      });
      const table = makeTable(
        [
          { name: DM.Commerce.Date.Months.name, type: 'datetime' },
          { name: revenue.name, type: 'number' },
        ],
        [
          [JAN, 100],
          [FEB, null],
          [MAR, 90],
        ],
      );

      const result = getKpiChartData(dataOptions, table);

      expect(result.sparklinePoints).toEqual([
        { x: JAN, y: 100 },
        { x: FEB, y: null },
        { x: MAR, y: 90 },
      ]);
    });

    it('omits sparklinePoints entirely when no category is set', () => {
      const dataOptions = translateKpiChartDataOptions({ value: revenue });
      const table = makeTable([{ name: revenue.name, type: 'number' }], [[100]]);

      expect(getKpiChartData(dataOptions, table).sparklinePoints).toBeUndefined();
    });
  });

  describe('null handling', () => {
    it('reports hasRows:false and value:undefined for an empty result (null-rule 1, renderer decides)', () => {
      const dataOptions = translateKpiChartDataOptions({ value: revenue });
      const table = makeTable([{ name: revenue.name, type: 'number' }], []);

      const result = getKpiChartData(dataOptions, table);

      expect(result.hasRows).toBe(false);
      expect(result.value).toBeUndefined();
    });

    it('reports hasRows:true for a non-empty result with a null headline value', () => {
      const dataOptions = translateKpiChartDataOptions({ value: revenue });
      const table = makeTable([{ name: revenue.name, type: 'number' }], [[null]]);

      const result = getKpiChartData(dataOptions, table);

      expect(result.hasRows).toBe(true);
      expect(result.value).toBeUndefined();
    });
  });

  describe('colors', () => {
    const greenAbove100: ConditionalDataColorOptions = {
      type: 'conditional',
      conditions: [{ color: '#00ff00', expression: '100', operator: '>' }],
      defaultColor: '#ff0000',
    };

    it('resolves the headline valueColor via resolveValueColor', () => {
      const dataOptions = translateKpiChartDataOptions({
        value: { column: revenue, color: greenAbove100 },
      });
      const table = makeTable([{ name: revenue.name, type: 'number' }], [[150]]);

      expect(getKpiChartData(dataOptions, table).valueColor).toBe('#00ff00');

      const lowTable = makeTable([{ name: revenue.name, type: 'number' }], [[50]]);
      expect(getKpiChartData(dataOptions, lowTable).valueColor).toBe('#ff0000');
    });

    it('leaves valueColor undefined without color options', () => {
      const dataOptions = translateKpiChartDataOptions({ value: revenue });
      const table = makeTable([{ name: revenue.name, type: 'number' }], [[150]]);

      expect(getKpiChartData(dataOptions, table).valueColor).toBeUndefined();
    });

    // Design note: getChartData has no styleOptions access, so the delta/target comparison
    // `color` (driven by designOptions.comparison.color) CANNOT be resolved here. It stays
    // undefined on the data layer; kpi-chart-renderer.tsx resolves it via
    // resolveComparisonColor(designOptions.comparison.color, metric) against deltaPercent /
    // percentOfTarget. Only measure-driven colors (the headline value and the 'value'
    // comparison passthrough) are resolved in this module.
    it('leaves delta comparison color unresolved -- the renderer resolves it', () => {
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        comparison: { type: 'delta', value: cost },
      });
      const table = makeTable(
        [
          { name: revenue.name, type: 'number' },
          { name: cost.name, type: 'number' },
        ],
        [[150, 100]],
      );

      expect(getKpiChartData(dataOptions, table).comparison).not.toHaveProperty('color');
    });

    it('leaves target comparison color unresolved -- the renderer resolves it', () => {
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        comparison: { type: 'target', target: cost },
      });
      const table = makeTable(
        [
          { name: revenue.name, type: 'number' },
          { name: cost.name, type: 'number' },
        ],
        [[150, 100]],
      );

      expect(getKpiChartData(dataOptions, table).comparison).not.toHaveProperty('color');
    });
  });
});
