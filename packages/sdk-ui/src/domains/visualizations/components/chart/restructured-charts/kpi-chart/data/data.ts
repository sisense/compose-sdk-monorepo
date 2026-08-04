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

import { KpiChartData, KpiComparisonData } from '../types.js';
import { calcDeltaComparison, calcTargetComparison, inferPeriodLabelKey } from './comparison.js';
import { KPI_ROW_TYPE_COLUMN } from './load-data.js';
import { resolveValueColor } from './value-colors.js';

/** Reads a cell as a finite number, or `undefined` for a null/blank/NaN/Infinity cell. */
function readMeasureValue(row: Row, column: Column): number | undefined {
  const raw = getValue(row, column);
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : undefined;
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
        labelKey: inferPeriodLabelKey(
          dataOptions.category ? getDataOptionGranularity(dataOptions.category) : undefined,
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
        label: measureLabel(comparison.value),
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
        label: measureLabel(comparison.value),
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
  let sparklinePoints: { x: number; y: number | null }[] | undefined;
  let lastBucketValue: number | undefined;
  let priorBucketValue: number | undefined;
  let currentRow: Row | undefined;

  if (dataOptions.category) {
    sparklinePoints = bucketRows.map((row, index) => {
      const rawX = categoryColumn ? getValue(row, categoryColumn) : undefined;
      const x = typeof rawX === 'number' && Number.isFinite(rawX) ? rawX : index;
      return { x, y: readMeasureValue(row, valueColumn) ?? null };
    });

    const lastBucketRow = bucketRows.length > 0 ? bucketRows[bucketRows.length - 1] : undefined;
    const priorBucketRow = bucketRows.length > 1 ? bucketRows[bucketRows.length - 2] : undefined;
    lastBucketValue = lastBucketRow ? readMeasureValue(lastBucketRow, valueColumn) : undefined;
    priorBucketValue = priorBucketRow ? readMeasureValue(priorBucketRow, valueColumn) : undefined;

    if (dataOptions.valueMode === 'total') {
      // The headline is the whole-period aggregate -- it isn't tied to a single bucket,
      // so there's no "current period" epoch to caption the header with.
      currentRow = totalRow;
      value = totalRow ? readMeasureValue(totalRow, valueColumn) : undefined;
    } else {
      currentRow = lastBucketRow;
      value = lastBucketValue;
      if (lastBucketRow && categoryColumn) {
        const rawPeriod = getValue(lastBucketRow, categoryColumn);
        valuePeriodMs =
          typeof rawPeriod === 'number' && Number.isFinite(rawPeriod) ? rawPeriod : undefined;
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
    valueColor: resolveValueColor(dataOptions.value, value),
    valuePeriodMs,
    sparklinePoints,
    comparison,
  };
}
