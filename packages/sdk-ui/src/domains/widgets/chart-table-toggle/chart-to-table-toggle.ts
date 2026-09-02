import {
  AREAMAP_CHART_TYPES,
  KPI_CHART_TYPES,
  SCATTERMAP_CHART_TYPES,
  TABLE_TYPES,
} from '@/domains/visualizations/core/chart-options-processor/translations/types';

const CHART_TYPES_WITHOUT_TABLE_TOGGLE = new Set<string>([
  ...TABLE_TYPES,
  'indicator',
  ...KPI_CHART_TYPES,
  'image',
  ...AREAMAP_CHART_TYPES,
  ...SCATTERMAP_CHART_TYPES,
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

/** Flattens chart axes into Table `columns`, deduping by column object reference. @internal */
export function toTableDataOptions(dataOptions: Record<string, unknown> | undefined): {
  columns: unknown[];
} {
  if (dataOptions == null) {
    return { columns: [] };
  }

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

  return { columns };
}

/** @internal */
export function hasFlattenedTableColumns(dataOptions: unknown): boolean {
  return isPlainObject(dataOptions) && toTableDataOptions(dataOptions).columns.length > 0;
}

/** True when a value-axis item has trend or forecast config. @internal */
export function hasTrendOrForecast(dataOptions: unknown): boolean {
  if (!isPlainObject(dataOptions)) {
    return false;
  }
  for (const value of Object.values(dataOptions)) {
    for (const item of axisItems(value)) {
      if (isPlainObject(item) && (item.trend != null || item.forecast != null)) {
        return true;
      }
    }
  }
  return false;
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
