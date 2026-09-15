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
 * A cell whose unparsed (`displayValue`) form differs from its parsed (`compareValue`) one --
 * as a real datetime cell does, holding `'2026-03-01T00:00:00'` alongside its epoch. Plain
 * values stringify their own `displayValue`, which is enough for every other column type.
 */
type CellSpec = { value: number | string | null; displayValue: string };

const isCellSpec = (cell: number | string | null | CellSpec): cell is CellSpec =>
  typeof cell === 'object' && cell !== null;

/**
 * Builds a `DataTable` for tests. Cells carry a pre-built `compareValue` (as the real
 * data-processing pipeline would produce), so `getValue` returns exactly the given
 * value without re-parsing a `displayValue` string. `null` simulates a missing/blank
 * cell (e.g. the merged total row's blanked-out date column) -- its `compareValue.value`
 * is `NaN`, matching what `createCompareValue` produces for an empty date/number string.
 */
function makeTable(
  columns: { name: string; type: string }[],
  rows: (number | string | null | CellSpec)[][],
): DataTable {
  return {
    columns: columns.map((column, index) => ({ ...column, index, direction: 0 })),
    rows: rows.map((row) =>
      row.map((cell) => {
        const value = isCellSpec(cell) ? cell.value : cell;
        return {
          displayValue: isCellSpec(cell) ? cell.displayValue : value === null ? '' : String(value),
          compareValue: {
            value: value === null ? NaN : value,
            valueUndefined: value === null,
            valueIsNaN: value === null,
          },
        };
      }),
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

    it("keeps the last bucket's unparsed category value alongside its epoch", () => {
      // `categoryValue` feeds the data point's `entries.category`, which downstream filter
      // builders parse -- so it must be the query's own date string, not the epoch.
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
          [{ value: FEB, displayValue: '2026-02-01T00:00:00' }, 120],
          [{ value: MAR, displayValue: '2026-03-01T00:00:00' }, 90],
        ],
      );

      const result = getKpiChartData(dataOptions, table);

      expect(result.categoryValue).toBe('2026-03-01T00:00:00');
      expect(result.valuePeriodMs).toBe(MAR);
    });

    it('keeps a non-datetime category value, which has no epoch to caption the header with', () => {
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        category: DM.Commerce.Gender,
        valueMode: 'last',
      });
      const table = makeTable(
        [
          { name: DM.Commerce.Gender.name, type: 'text' },
          { name: revenue.name, type: 'number' },
        ],
        [
          ['Male', 120],
          ['Female', 90],
        ],
      );

      const result = getKpiChartData(dataOptions, table);

      expect(result.categoryValue).toBe('Female');
      expect(result.valuePeriodMs).toBeUndefined();
    });

    it('sets no valuePeriodMs for a numeric category, whose values would otherwise read as epochs', () => {
      // `DM.Commerce.DateMonth` is a numeric attribute: its cells parse to finite numbers (a
      // month number), which a "is it a number?" guard alone would happily caption as January 1970.
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        category: DM.Commerce.DateMonth,
        valueMode: 'last',
      });
      const table = makeTable(
        [
          { name: DM.Commerce.DateMonth.name, type: 'number' },
          { name: revenue.name, type: 'number' },
        ],
        [
          [6, 120],
          [7, 90],
        ],
      );

      const result = getKpiChartData(dataOptions, table);

      expect(result.valuePeriodMs).toBeUndefined();
      expect(result.categoryDisplayValue).toBe('7');
    });

    it("keeps the display text of a non-date headline bucket, which captions the card in the epoch's place", () => {
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        category: DM.Commerce.Gender,
        valueMode: 'last',
      });
      const table = makeTable(
        [
          { name: DM.Commerce.Gender.name, type: 'text' },
          { name: revenue.name, type: 'number' },
        ],
        [
          ['Male', 120],
          ['Female', 90],
        ],
      );

      expect(getKpiChartData(dataOptions, table).categoryDisplayValue).toBe('Female');
    });

    it('sets no display text for a date headline bucket, which the epoch identifies on its own', () => {
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
        [[{ value: MAR, displayValue: '2026-03-01T00:00:00' }, 90]],
      );

      expect(getKpiChartData(dataOptions, table).categoryDisplayValue).toBeUndefined();
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
      // valueMode 'total' has no single "current" bucket, so no period caption -- and no
      // category value to identify the headline with either
      expect(result.valuePeriodMs).toBeUndefined();
      expect(result.categoryValue).toBeUndefined();
    });

    it("falls back to last-bucket semantics for valueMode 'total' when the '$kpiRowType' column is absent", () => {
      // Reachable without a query: an explicit `Data` dataset never runs the dual-query
      // merge, and an `onDataReady` handler that rebuilds `columns` drops the marker.
      // Either way there is no whole-period total row to read.
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        category: DM.Commerce.Date.Months,
        valueMode: 'total',
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
      expect(result.sparklinePoints).toEqual([
        { x: JAN, y: 100 },
        { x: FEB, y: 120 },
        { x: MAR, y: 90 },
      ]);
    });

    it("keeps the headline undefined for valueMode 'total' when the marker column is present but carries no total row", () => {
      // The merge ran and the ungrouped query legitimately returned nothing, so the data
      // itself says "no total" -- distinct from the marker column being missing entirely,
      // which is why the fallback keys on the column and not on the row.
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
        ],
      );

      const result = getKpiChartData(dataOptions, table);

      expect(result.hasRows).toBe(true);
      expect(result.value).toBeUndefined();
      expect(result.valuePeriodMs).toBeUndefined();
      expect(result.sparklinePoints).toEqual([
        { x: JAN, y: 100 },
        { x: FEB, y: 120 },
      ]);
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

    it("previous-period: a non-date category's label names no granularity, since it has none", () => {
      // `getDataOptionGranularity` defaults every non-level column to 'Years', which would label a
      // Gender-bucketed card "vs prior year".
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        category: DM.Commerce.Gender,
        comparison: { type: 'previous-period' },
      });
      const table = makeTable(
        [
          { name: DM.Commerce.Gender.name, type: 'text' },
          { name: revenue.name, type: 'number' },
        ],
        [
          ['Male', 120],
          ['Female', 90],
        ],
      );

      expect(getKpiChartData(dataOptions, table).comparison).toEqual({
        type: 'previous-period',
        baseline: 120,
        deltaValue: -30,
        deltaPercent: -25,
        labelKey: 'kpi.comparison.vsPriorPeriod',
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

    it('value: drops the label of a fixed-number comparison measure instead of repeating the number', () => {
      // A typed-in comparison value round-trips as a constant formula titled with the formula
      // text itself, so keeping that title would print the same number twice.
      const fixed = measureFactory.customFormula('1000000', '1000000', {});
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        comparison: { type: 'value', value: fixed },
      });
      const table = makeTable(
        [
          { name: revenue.name, type: 'number' },
          { name: fixed.name, type: 'number' },
        ],
        [[150, 1000000]],
      );

      const result = getKpiChartData(dataOptions, table);

      expect(result.comparison).toMatchObject({ type: 'value', value: 1000000, label: '' });
    });

    it("value: keeps a renamed fixed-number comparison measure's label", () => {
      const renamed = measureFactory.customFormula('Goal', '1000000', {});
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        comparison: { type: 'value', value: renamed },
      });
      const table = makeTable(
        [
          { name: revenue.name, type: 'number' },
          { name: renamed.name, type: 'number' },
        ],
        [[150, 1000000]],
      );

      const result = getKpiChartData(dataOptions, table);

      expect(result.comparison).toMatchObject({ label: 'Goal' });
    });

    it('delta: drops the label of a fixed-number comparison measure', () => {
      const fixed = measureFactory.customFormula('1,000', '1000', {});
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        comparison: { type: 'delta', value: fixed },
      });
      const table = makeTable(
        [
          { name: revenue.name, type: 'number' },
          { name: fixed.name, type: 'number' },
        ],
        [[1500, 1000]],
      );

      const result = getKpiChartData(dataOptions, table);

      expect(result.comparison).toMatchObject({ type: 'delta', baseline: 1000, label: '' });
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

    it('labels each point of a non-date category with its bucket text, numbering x by bucket order', () => {
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        category: DM.Commerce.Gender,
      });
      const table = makeTable(
        [
          { name: DM.Commerce.Gender.name, type: 'text' },
          { name: revenue.name, type: 'number' },
        ],
        [
          ['Male', 120],
          ['Female', 90],
        ],
      );

      const result = getKpiChartData(dataOptions, table);

      expect(result.sparklinePoints).toEqual([
        { x: 0, y: 120, categoryDisplayValue: 'Male' },
        { x: 1, y: 90, categoryDisplayValue: 'Female' },
      ]);
    });

    it("numbers a numeric category's buckets by order too, never spacing them by their own values", () => {
      // Left as the raw values, a numeric category would space the sparkline by magnitude on an
      // axis that is hidden anyway -- and blank cells (which fall back to the row index) would mix
      // the two scales inside one series, producing non-monotonic x.
      const dataOptions = translateKpiChartDataOptions({
        value: revenue,
        category: DM.Commerce.DateMonth,
      });
      const table = makeTable(
        [
          { name: DM.Commerce.DateMonth.name, type: 'number' },
          { name: revenue.name, type: 'number' },
        ],
        [
          [6, 120],
          [7, 90],
        ],
      );

      const result = getKpiChartData(dataOptions, table);

      expect(result.sparklinePoints).toEqual([
        { x: 0, y: 120, categoryDisplayValue: '6' },
        { x: 1, y: 90, categoryDisplayValue: '7' },
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

    describe('formula-driven color conditions', () => {
      /** Green while revenue beats cost -- a threshold read from the query, not typed in. */
      const greenAboveCost: ConditionalDataColorOptions = {
        type: 'conditional',
        conditions: [{ color: '#00ff00', expression: '', operator: '>', valueMeasure: cost }],
        defaultColor: '#ff0000',
      };
      const dataOptions = translateKpiChartDataOptions({
        value: { column: revenue, color: greenAboveCost },
      });
      const columns = [
        { name: revenue.name, type: 'number' },
        { name: cost.name, type: 'number' },
      ];

      it('resolves the threshold from the query instead of the empty expression', () => {
        expect(getKpiChartData(dataOptions, makeTable(columns, [[150, 100]])).valueColor).toBe(
          '#00ff00',
        );
        expect(getKpiChartData(dataOptions, makeTable(columns, [[150, 200]])).valueColor).toBe(
          '#ff0000',
        );
      });

      it('falls back to the default color when the threshold measure is missing from the result', () => {
        // Not `> 0`: an unresolved threshold is dropped rather than read as zero.
        const table = makeTable([{ name: revenue.name, type: 'number' }], [[150]]);

        expect(getKpiChartData(dataOptions, table).valueColor).toBe('#ff0000');
      });

      it("reads the last bucket's threshold, not the first, for a last-bucket headline", () => {
        const withCategory = translateKpiChartDataOptions({
          value: { column: revenue, color: greenAboveCost },
          category: DM.Commerce.Date.Months,
        });
        const table = makeTable(
          [{ name: DM.Commerce.Date.Months.name, type: 'datelevel' }, ...columns],
          [
            [JAN, 150, 100],
            [FEB, 150, 200],
          ],
        );

        // Headline is FEB's 150 against FEB's cost of 200 -- red. Taking JAN's cost of 100
        // would compare the last bucket's value against the first bucket's threshold.
        expect(getKpiChartData(withCategory, table).valueColor).toBe('#ff0000');
      });

      it("reads the total row's threshold for a 'total' headline", () => {
        const totalOptions = translateKpiChartDataOptions({
          value: { column: revenue, color: greenAboveCost },
          category: DM.Commerce.Date.Months,
          valueMode: 'total',
        });
        const table = makeTable(
          [
            { name: DM.Commerce.Date.Months.name, type: 'datelevel' },
            ...columns,
            { name: KPI_ROW_TYPE_COLUMN, type: 'string' },
          ],
          [
            [JAN, 150, 200, 'bucket'],
            [FEB, 150, 200, 'bucket'],
            [null, 300, 250, 'total'],
          ],
        );

        // Whole-period revenue 300 beats whole-period cost 250, even though every individual
        // bucket loses to its own cost.
        expect(getKpiChartData(totalOptions, table).valueColor).toBe('#00ff00');
      });
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
