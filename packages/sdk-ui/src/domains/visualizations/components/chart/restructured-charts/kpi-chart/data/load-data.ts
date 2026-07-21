import { Cell, QueryResultData } from '@sisense/sdk-data';

import { QueryDescription } from '@/domains/query-execution/core/execute-query.js';

import { loadDataBySingleQuery } from '../../helpers/data-loading.js';
import type { TypedLoadDataFunction } from '../../types.js';

/**
 * Name of the marker column appended to a KPI query result merged by
 * {@link mergeTotalIntoResult}. Its presence in `columns` is how a consumer
 * distinguishes a dual-query merged result from a plain single-query one --
 * when the column is absent, every row is implicitly a `'bucket'` row.
 *
 * Reserved: this assumes no real dimension/measure is ever named `$kpiRowType`. A collision
 * would misclassify a bucket row as the total row (or vice versa); not hardened against here
 * (tracked separately as a follow-up).
 * @internal
 */
export const KPI_ROW_TYPE_COLUMN = '$kpiRowType';

/**
 * Marks a row of a KPI dual-query merged result as either a per-bucket data point
 * (`'bucket'`, one per grouped date value) or the single ungrouped total row
 * (`'total'`), appended under the {@link KPI_ROW_TYPE_COLUMN} column.
 * @internal
 */
export type KpiRowType = 'bucket' | 'total';

const BUCKET_ROW_TYPE: KpiRowType = 'bucket';
const TOTAL_ROW_TYPE: KpiRowType = 'total';

/**
 * Options accepted by {@link loadKpiData}, matching `TypedLoadDataFunction<'kpi'>`'s shape
 * (`restructured-charts/types.ts`) -- kept as its own named alias since this module and its
 * tests reference it directly.
 * @internal
 */
export type LoadKpiDataOptions = Parameters<TypedLoadDataFunction<'kpi'>>[0];

/**
 * Loads the data for a KPI chart.
 *
 * When `valueMode` is `'total'` and a `trend` dimension is configured, the headline
 * value must be the aggregate over the *entire* period, not a combination of the
 * per-bucket (e.g. per-month) values -- summing per-bucket averages, for instance,
 * would be mathematically wrong. Correct SQL semantics require a second, ungrouped
 * query (same measures, no dimensions) run alongside the regular grouped one; the
 * two results are then merged (see {@link mergeTotalIntoResult}).
 *
 * In every other case (`valueMode: 'last'`, or `'total'` without a `trend`), a single
 * regular query is sufficient and its result is returned untouched.
 * @internal
 */
export const loadKpiData = async (options: LoadKpiDataOptions): Promise<QueryResultData> => {
  const { app, chartDataOptionsInternal, queryDescription, executionConfig } = options;

  const needsTotalQuery =
    chartDataOptionsInternal.valueMode === 'total' && !!chartDataOptionsInternal.trend;

  if (!needsTotalQuery) {
    return loadDataBySingleQuery({ app, queryDescription, executionConfig });
  }

  // Same data source, measures, filters, etc. as the regular query -- only the
  // grouping dimensions are dropped, so the backend aggregates across the whole
  // period into a single row instead of one row per date bucket.
  const totalQueryDescription: QueryDescription = {
    ...queryDescription,
    dimensions: [],
  };

  const [bucketed, total] = await Promise.all([
    loadDataBySingleQuery({ app, queryDescription, executionConfig }),
    loadDataBySingleQuery({ app, queryDescription: totalQueryDescription, executionConfig }),
  ]);

  return mergeTotalIntoResult(bucketed, total);
};

/**
 * Merges a bucketed (grouped-by-date) KPI query result with an ungrouped total
 * query result into a single {@link QueryResultData}.
 *
 * The merge appends a `{@link KPI_ROW_TYPE_COLUMN}` column (type `'string'`) to the
 * bucketed columns. Every bucketed row is carried over unchanged with a `'bucket'`
 * marker cell appended; one extra row is appended holding the total query's measure
 * values -- prefixed with an empty cell in place of the (dropped) date bucket -- with
 * a `'total'` marker cell.
 *
 * The total query is expected to carry exactly the bucketed result's measure
 * columns (same measures, no dimensions), so its column count is used to work out
 * how many leading (dimension) columns the bucketed result has and need an empty
 * placeholder cell in the appended total row.
 *
 * An empty `total.rows` (the ungrouped query legitimately returning no row at all) has no
 * measure cells to append -- rather than emit a total row holding only the marker cell (missing
 * every measure value), the total row is omitted entirely and only the bucket rows are returned.
 * @internal
 */
export function mergeTotalIntoResult(
  bucketed: QueryResultData,
  total: QueryResultData,
): QueryResultData {
  const columns = [...bucketed.columns, { name: KPI_ROW_TYPE_COLUMN, type: 'string' }];
  const bucketRows: Cell[][] = bucketed.rows.map((row) => [...row, { data: BUCKET_ROW_TYPE }]);

  if (total.rows.length === 0) {
    return { columns, rows: bucketRows };
  }

  const leadingCellCount = Math.max(bucketed.columns.length - total.columns.length, 0);
  const leadingEmptyCells: Cell[] = Array.from({ length: leadingCellCount }, () => ({ data: '' }));
  const totalRow: Cell[] = [...leadingEmptyCells, ...total.rows[0], { data: TOTAL_ROW_TYPE }];

  return {
    columns,
    rows: [...bucketRows, totalRow],
  };
}
