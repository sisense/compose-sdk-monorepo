import {
  KpiChartDataOptionsInternal,
  StyledMeasureColumn,
} from '@/domains/visualizations/core/chart-data-options/types.js';
import {
  getDataOptionGranularity,
  getDataOptionTitle,
} from '@/domains/visualizations/core/chart-data-options/utils.js';
import {
  Column,
  DataTable,
  getColumnByName,
  getValue,
  Row,
} from '@/domains/visualizations/core/chart-data-processor/table-processor.js';
import { formatNumber } from '@/infra/formatting/index.js';

import { isDateCategory } from '../data-options/data-options.js';
import { KpiChartData, KpiComparisonData } from '../types.js';
import { calcDeltaComparison, calcTargetComparison, inferPeriodLabelKey } from './comparison.js';
import { KPI_ROW_TYPE_COLUMN } from './load-data.js';
import { resolveValueColor } from './value-colors.js';

/** Reads a cell as a finite number, or `undefined` for a null/blank/NaN/Infinity cell. */
function readMeasureValue(row: Row, column: Column): number | undefined {
  const raw = getValue(row, column);
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : undefined;
}

/**
 * Reads the resolved thresholds of the headline value's formula-driven conditional color rules
 * from the row the headline itself was read from, keyed by each measure's query column name
 * (what {@link resolveValueColor} looks them up by).
 *
 * Reading them from `currentRow` rather than the first row is what keeps a threshold aligned
 * with the number it gates: with a `category`, these measures are grouped per bucket like the
 * value, so the last-bucket headline must be compared against the last bucket's threshold, and
 * a `'total'` headline against the ungrouped total row's.
 *
 * @param row - The row the headline value was read from, or `undefined` when there is none
 * @param dataTable - Table to locate each measure's column in
 * @param colorConditionMeasures - Hidden measures backing the color rules
 * @returns The resolved values, or `undefined` when there is nothing to resolve
 */
function readColorConditionValues(
  row: Row | undefined,
  dataTable: DataTable,
  colorConditionMeasures: StyledMeasureColumn[] | undefined,
): Record<string, number> | undefined {
  if (!row || !colorConditionMeasures?.length) {
    return undefined;
  }
  const entries = colorConditionMeasures.flatMap((measure) => {
    const column = getColumnByName(dataTable, measure.column.name);
    const value = column && readMeasureValue(row, column);
    return value === undefined ? [] : [[measure.column.name, value] as const];
  });
  return entries.length ? Object.fromEntries(entries) : undefined;
}

/**
 * Reads a cell in its unparsed form (`rawValue`, falling back to `displayValue`) — the same
 * `rawValue ?? displayValue` rule the cartesian x-value pipeline uses, so a datetime category
 * yields its query string (`'2013-01-01T00:00:00'`) rather than `getValue`'s parsed epoch.
 *
 * @param row - Row holding the cell
 * @param column - Column selecting the cell within the row
 * @returns The cell's unparsed value, or `undefined` when the row has no such cell
 */
function readRawValue(row: Row, column: Column): string | number | undefined {
  const cell = row[column.index];
  return cell ? cell.rawValue ?? cell.displayValue : undefined;
}

/**
 * Reads a cell's display text -- what the query formatted the value as, which is what a card
 * caption or tooltip should show for a category that isn't a date. A blank cell yields
 * `undefined` rather than an empty string, so a missing bucket label leaves no empty caption
 * behind.
 *
 * @param row - Row holding the cell
 * @param column - Column selecting the cell within the row
 * @returns The cell's display text, or `undefined` when the cell is absent or blank
 */
function readDisplayValue(row: Row, column: Column): string | undefined {
  return row[column.index]?.displayValue || undefined;
}

/** Narrows a `'target'` comparison's baseline to its fixed-number variant, without an `as` cast. */
function isFixedTarget(target: StyledMeasureColumn | number): target is number {
  return typeof target === 'number';
}

/** Display label rule shared across the module: styled `name` → measure `title` → measure `name`. */
function measureLabel(measure: StyledMeasureColumn): string {
  return getDataOptionTitle(measure);
}

/**
 * Checks whether a label carries nothing but the number it labels.
 *
 * A comparison measure that is just a fixed number arrives as a constant formula whose default
 * title is the formula text itself (a typed-in comparison value is stored as
 * `{ formula: '1000000', title: '1000000' }`), so showing that title beside the readout prints
 * the same number twice -- `1,000,000` over `1000000`. Thousand separators and surrounding
 * whitespace are ignored, so a hand-written `'1,000,000'` reads as numeric too. A renamed item
 * (`'Goal'`) is a real label and is kept.
 *
 * @param label - Display label to test
 * @returns Whether the label is nothing but a number
 */
function isNumericLabel(label: string): boolean {
  const bare = label.replace(/[\s,]/g, '');
  // `Number('')` is 0, so the emptiness guard has to come first.
  return bare !== '' && Number.isFinite(Number(bare));
}

/**
 * Resolves the label of a comparison whose label is *displayed* as a title beside its readout
 * (`'delta'`, `'value'`): the shared label rule, emptied when the label would only repeat the
 * number already on display.
 *
 * `'target'` is deliberately not routed through here: its label is never a title of its own,
 * only the `{{goal}}` interpolation of the percent-of-goal readout, where the number is the
 * informative part (`'82% of 1000000 target'`).
 *
 * @param measure - Comparison measure supplying the label
 * @returns The display label, or an empty string when it would only repeat the number
 */
function displayedComparisonLabel(measure: StyledMeasureColumn): string {
  const label = measureLabel(measure);
  return isNumericLabel(label) ? '' : label;
}

/**
 * Reads a comparison measure's value off the given row (the same row the headline value
 * came from -- comparison measures are queried as sibling columns alongside `value`, never
 * via a separate query, so they always share the current row).
 */
function readComparisonBaseline(
  dataTable: DataTable,
  row: Row | undefined,
  measure: StyledMeasureColumn,
): number | undefined {
  if (!row) {
    return undefined;
  }
  const column = getColumnByName(dataTable, measure.column.name);
  return column ? readMeasureValue(row, column) : undefined;
}

/**
 * Builds the resolved comparison payload for the headline, or `undefined` when any input
 * it depends on is missing (null-rule 3: a missing baseline means no comparison, not a
 * comparison against a fabricated zero).
 *
 * `color` is deliberately left unset for `'delta'`/`'target'` -- it rides on
 * `designOptions.comparison.color`, which this data-layer function has no access to
 * (`getChartData` has no `styleOptions`). The renderer resolves it later via
 * `resolveComparisonColor(designOptions.comparison.color, metric)`. Only the `'value'`
 * variant's color is resolved here, because it's measure-driven (`resolveValueColor`), same
 * mechanism as the headline's own `valueColor`.
 */
function buildComparison(
  dataOptions: KpiChartDataOptionsInternal,
  dataTable: DataTable,
  currentRow: Row | undefined,
  value: number | undefined,
  lastBucketValue: number | undefined,
  priorBucketValue: number | undefined,
): KpiComparisonData | undefined {
  const comparison = dataOptions.comparison;
  if (!comparison) {
    return undefined;
  }

  switch (comparison.type) {
    case 'previous-period': {
      if (lastBucketValue === undefined || priorBucketValue === undefined) {
        return undefined;
      }
      const { deltaValue, deltaPercent } = calcDeltaComparison(lastBucketValue, priorBucketValue);
      return {
        type: 'previous-period',
        baseline: priorBucketValue,
        deltaValue,
        deltaPercent,
        // Only a date category may name a granularity: `getDataOptionGranularity` defaults every
        // non-level column to 'Years', which would label e.g. a Gender-bucketed card "vs prior
        // year". Without one, the granularity-agnostic "vs prior period" is the honest label.
        labelKey: inferPeriodLabelKey(
          isDateCategory(dataOptions.category)
            ? getDataOptionGranularity(dataOptions.category)
            : undefined,
        ),
      };
    }

    case 'delta': {
      const baseline = readComparisonBaseline(dataTable, currentRow, comparison.value);
      if (value === undefined || baseline === undefined) {
        return undefined;
      }
      const { deltaValue, deltaPercent } = calcDeltaComparison(value, baseline);
      return {
        type: 'delta',
        baseline,
        deltaValue,
        deltaPercent,
        label: displayedComparisonLabel(comparison.value),
      };
    }

    case 'target': {
      const rawTarget = comparison.target;
      const target = isFixedTarget(rawTarget)
        ? rawTarget
        : readComparisonBaseline(dataTable, currentRow, rawTarget);
      if (value === undefined || target === undefined) {
        return undefined;
      }
      const { percentOfTarget, toGo } = calcTargetComparison(value, target);
      return {
        type: 'target',
        target,
        percentOfTarget,
        toGo,
        label: isFixedTarget(rawTarget) ? formatNumber(rawTarget) : measureLabel(rawTarget),
      };
    }

    case 'value': {
      const secondaryValue = readComparisonBaseline(dataTable, currentRow, comparison.value);
      if (secondaryValue === undefined) {
        return undefined;
      }
      return {
        type: 'value',
        value: secondaryValue,
        label: displayedComparisonLabel(comparison.value),
        color: resolveValueColor(comparison.value, secondaryValue),
        numberFormatConfig: comparison.value.numberFormatConfig,
      };
    }

    default:
      return undefined;
  }
}

/**
 * Converts a data table to KPI chart data.
 *
 * Without `category`: a single-row query -- the headline is read straight from the first row.
 *
 * With `category`: one row per time bucket. When the result was produced by the dual-query
 * merge in `load-data.ts` (`valueMode: 'total'` with a `category`), rows carry a
 * {@link KPI_ROW_TYPE_COLUMN} marker; rows are split into per-bucket rows and the single
 * ungrouped total row by that marker **before** any date-based processing runs, because the
 * merged total row's date cell is a blank placeholder that parses to `NaN` -- letting it
 * anywhere near bucket iteration, sparkline building, or prior-bucket lookups would corrupt
 * them. When the marker column is absent (the single-query path), every row is a bucket.
 *
 * Because the marker column is what makes the total row readable, `valueMode: 'total'`
 * falls back to `'last'` semantics whenever that column is missing -- the result never went
 * through the merge, so there is no whole-period aggregate to read. That covers explicit
 * `Data` datasets (no query runs, so no merge) and an `onDataReady` handler that rebuilt
 * `columns` instead of spreading them. A blank headline is the worse answer in both cases:
 * the last bucket is a real number drawn from the rows actually supplied.
 */
export function getKpiChartData(
  dataOptions: KpiChartDataOptionsInternal,
  dataTable: DataTable,
): KpiChartData {
  const valueTitle = measureLabel(dataOptions.value);

  const base: KpiChartData = {
    type: 'kpi',
    hasRows: false,
    valueTitle,
    numberFormatConfig: dataOptions.value.numberFormatConfig,
  };

  const valueColumn = getColumnByName(dataTable, dataOptions.value.column.name);
  if (!valueColumn || dataTable.rows.length === 0) {
    return base;
  }

  // Split bucket rows from the (optional) merged total row via the marker column --
  // see the KPI_ROW_TYPE_COLUMN contract in load-data.ts.
  const rowTypeColumn = getColumnByName(dataTable, KPI_ROW_TYPE_COLUMN);
  const totalRow = rowTypeColumn
    ? dataTable.rows.find((row) => getValue(row, rowTypeColumn) === 'total')
    : undefined;
  const bucketRows = rowTypeColumn
    ? dataTable.rows.filter((row) => getValue(row, rowTypeColumn) !== 'total')
    : dataTable.rows;

  const categoryColumn = dataOptions.category
    ? getColumnByName(dataTable, dataOptions.category.column.name)
    : undefined;

  let value: number | undefined;
  let valuePeriodMs: number | undefined;
  let categoryValue: string | number | undefined;
  let categoryDisplayValue: string | undefined;
  let sparklinePoints: KpiChartData['sparklinePoints'];
  let lastBucketValue: number | undefined;
  let priorBucketValue: number | undefined;
  let currentRow: Row | undefined;

  if (dataOptions.category) {
    // A date category's buckets are placed by their own epoch; every other category's are placed
    // by bucket order and identified by their display text instead. Ordinal placement is what
    // keeps one series on one scale: a category whose cells parse to numbers would otherwise mix
    // real values with the row-index fallback its blank cells take, yielding non-monotonic x.
    const dateCategory = isDateCategory(dataOptions.category);
    sparklinePoints = bucketRows.map((row, index) => {
      const rawX = dateCategory && categoryColumn ? getValue(row, categoryColumn) : undefined;
      const x = typeof rawX === 'number' && Number.isFinite(rawX) ? rawX : index;
      const y = readMeasureValue(row, valueColumn) ?? null;
      const label =
        !dateCategory && categoryColumn ? readDisplayValue(row, categoryColumn) : undefined;
      return label !== undefined ? { x, y, categoryDisplayValue: label } : { x, y };
    });

    const lastBucketRow = bucketRows.length > 0 ? bucketRows[bucketRows.length - 1] : undefined;
    const priorBucketRow = bucketRows.length > 1 ? bucketRows[bucketRows.length - 2] : undefined;
    lastBucketValue = lastBucketRow ? readMeasureValue(lastBucketRow, valueColumn) : undefined;
    priorBucketValue = priorBucketRow ? readMeasureValue(priorBucketRow, valueColumn) : undefined;

    // A `'total'` headline is the ungrouped total row produced by the dual-query merge in
    // `load-data.ts`. Absent the marker column, the result never went through that merge --
    // explicit `Data` (no query runs at all), or an `onDataReady` handler that rebuilt
    // `columns` -- so no whole-period aggregate exists to read, and every row here is a
    // plain bucket. Fall back to last-bucket semantics rather than render a blank headline.
    // (Marker column present but no `'total'` row is a different case: the ungrouped query
    // legitimately returned nothing, so `undefined` is the honest answer and stands.)
    if (dataOptions.valueMode === 'total' && rowTypeColumn) {
      // The headline is the whole-period aggregate -- it isn't tied to a single bucket,
      // so there's no "current period" epoch to caption the header with.
      currentRow = totalRow;
      value = totalRow ? readMeasureValue(totalRow, valueColumn) : undefined;
    } else {
      currentRow = lastBucketRow;
      value = lastBucketValue;
      if (lastBucketRow && categoryColumn) {
        const rawPeriod = dateCategory ? getValue(lastBucketRow, categoryColumn) : undefined;
        valuePeriodMs =
          typeof rawPeriod === 'number' && Number.isFinite(rawPeriod) ? rawPeriod : undefined;
        // The caption's stand-in for the epoch: what a non-date bucket is called. Set only when
        // there is no epoch, since a date bucket is identified by `valuePeriodMs` and captioned
        // through the category's own `dateFormat`.
        categoryDisplayValue = dateCategory
          ? undefined
          : readDisplayValue(lastBucketRow, categoryColumn);
        // Unlike the epoch above, this is kept for every category type (a non-datetime category
        // has no period to caption the header with, but still identifies the bucket).
        categoryValue = readRawValue(lastBucketRow, categoryColumn);
      }
    }
  } else {
    currentRow = dataTable.rows[0];
    value = readMeasureValue(currentRow, valueColumn);
  }

  const comparison = buildComparison(
    dataOptions,
    dataTable,
    currentRow,
    value,
    lastBucketValue,
    priorBucketValue,
  );

  return {
    ...base,
    hasRows: true,
    value,
    valueColor: resolveValueColor(
      dataOptions.value,
      value,
      readColorConditionValues(currentRow, dataTable, dataOptions.colorConditionMeasures),
    ),
    valuePeriodMs,
    categoryValue,
    categoryDisplayValue,
    sparklinePoints,
    comparison,
  };
}
