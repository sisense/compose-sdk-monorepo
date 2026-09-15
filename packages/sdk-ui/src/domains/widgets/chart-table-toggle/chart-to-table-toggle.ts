import {
  KPI_CHART_TYPES,
  TABLE_TYPES,
} from '@/domains/visualizations/core/chart-options-processor/translations/types';

const CHART_TYPES_WITHOUT_TABLE_TOGGLE = new Set<string>([
  ...TABLE_TYPES,
  'indicator',
  ...KPI_CHART_TYPES,
  'image',
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** @internal */
export function supportsChartToTableToggle(chartType: string | undefined): boolean {
  return chartType != null && chartType !== '' && !CHART_TYPES_WITHOUT_TABLE_TOGGLE.has(chartType);
}

function axisItems(value: unknown): unknown[] {
  return Array.isArray(value) ? value : value != null ? [value] : [];
}

function isTableColumnItem(item: unknown): item is Record<string, unknown> {
  if (!isPlainObject(item)) {
    return false;
  }
  if ('column' in item) {
    return item.column != null;
  }
  return typeof item.name === 'string';
}

function columnIdentity(item: Record<string, unknown>): unknown {
  return 'column' in item ? item.column : item;
}

/**
 * Flattens chart axes into columns, deduping by column object reference.
 *
 * @param dataOptions - A chart's `dataOptions`, keyed by axis (`category`, `value`, `breakBy`, etc.).
 * @returns The axis items flattened into a single array, in axis-key iteration order.
 */
function flattenAxisColumns(dataOptions: Record<string, unknown>): unknown[] {
  const columns: unknown[] = [];
  const seen = new Set<unknown>();

  for (const value of Object.values(dataOptions)) {
    for (const item of axisItems(value)) {
      if (!isTableColumnItem(item)) continue;

      const columnRef = columnIdentity(item);
      if (columnRef != null && seen.has(columnRef)) continue;
      if (columnRef != null) seen.add(columnRef);
      columns.push(item);
    }
  }

  return columns;
}

/**
 * Minimal shape of `TableDataOptions` produced by flattening a chart's axes.
 *
 * @example
 * ```ts
 * const tableDataOptions: TableDataOptionsLike = { columns: [{ column: { name: 'Revenue' } }] };
 * ```
 * @internal
 */
type TableDataOptionsLike = { columns: unknown[] };

const EMPTY_TABLE_DATA_OPTIONS: TableDataOptionsLike = Object.freeze({ columns: [] });

/**
 * Keeps a `{columns}` result referentially stable per source `dataOptions` object, so
 * `Table`/`TableComponent` do not re-derive — and reset pagination — on every parent re-render.
 *
 * Assumes `dataOptions` is treated as immutable, as it is throughout this codebase.
 */
const tableDataOptionsCache = new WeakMap<object, TableDataOptionsLike>();

/**
 * Flattens chart axes into Table `columns`, deduping by column object reference.
 *
 * @param dataOptions - A chart's `dataOptions`, or `undefined`.
 * @returns Table-shaped `{ columns }`, cached per `dataOptions` object for referential stability.
 * @internal
 */
export function toTableDataOptions(
  dataOptions: Record<string, unknown> | undefined,
): TableDataOptionsLike {
  if (dataOptions == null) {
    return EMPTY_TABLE_DATA_OPTIONS;
  }

  const cached = tableDataOptionsCache.get(dataOptions);
  if (cached) {
    return cached;
  }

  const result: TableDataOptionsLike = { columns: flattenAxisColumns(dataOptions) };
  tableDataOptionsCache.set(dataOptions, result);
  return result;
}

/**
 * Checks whether a chart's `dataOptions` flattens into at least one table column.
 *
 * @param dataOptions - A chart's `dataOptions`, of unknown shape.
 * @returns `true` if flattening `dataOptions` yields at least one column.
 * @internal
 */
export function hasFlattenedTableColumns(dataOptions: unknown): boolean {
  return isPlainObject(dataOptions) && flattenAxisColumns(dataOptions).length > 0;
}

/** @internal */
export function shouldShowChartTableToggle(
  chartType: string | undefined,
  dataOptions: unknown,
): boolean {
  return supportsChartToTableToggle(chartType) && hasFlattenedTableColumns(dataOptions);
}

type ChartPropsLike = {
  chartType?: string;
  dataOptions?: unknown;
};

/**
 * Overlays `chartType: 'table'` and flattened columns when `isTableView` is true.
 * Typed as `T` so callers can spread back into `ChartWidget`.
 *
 * @internal
 */
export function applyChartTableOverride<T extends ChartPropsLike>(
  props: T,
  isTableView: boolean,
): T {
  if (!isTableView) {
    return props;
  }

  return {
    ...props,
    chartType: 'table',
    dataOptions: isPlainObject(props.dataOptions)
      ? toTableDataOptions(props.dataOptions)
      : { columns: [] },
  } as T;
}

/**
 * Normalizes a value to a primitive reset identity.
 *
 * @param value - Candidate reset key
 * @returns The value when it is a string, number, boolean, or null; otherwise `undefined`
 * @internal
 */
export function toResetIdentity(value: unknown): string | number | boolean | null | undefined {
  if (value == null || typeof value === 'string' || typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value;
  }
  return undefined;
}
