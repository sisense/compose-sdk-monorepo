import { type DataSource, getDataSourceName } from '@sisense/sdk-data';
import hash from 'hash-it';

import type {
  AnyColumn,
  ChartDataOptions,
  PivotTableDataOptions,
} from '@/domains/visualizations/core/chart-data-options/types';
import { isStyledColumn } from '@/domains/visualizations/core/chart-data-options/utils';
import type { GenericDataOptions } from '@/types';

import type { WidgetType } from '../components/widget/types';

/** Union of every widget's `dataOptions` shape (chart, pivot, custom). */
type WidgetDataOptions = ChartDataOptions | PivotTableDataOptions | GenericDataOptions;

/** Returns the underlying column name for either a bare or a styled column. */
const getColumnName = (column: AnyColumn): string =>
  isStyledColumn(column) ? column.column.name : column.name;

/**
 * Narrows a data-options object to a column reference. A column is either styled (carries a
 * `column` field) or bare (carries a `name` field); other data-options objects (styles, totals,
 * callbacks) have neither. Non-object values are filtered out by the caller before this runs.
 */
const isAnyColumn = (value: object): value is AnyColumn => 'column' in value || 'name' in value;

/**
 * Collects every column name referenced by a widget's `dataOptions`, regardless of widget type.
 * Each data-options property is either a single column, an array of columns, or non-column
 * configuration (styles, totals, callbacks); only the column references contribute a name.
 */
const collectColumnNames = (dataOptions: WidgetDataOptions): string[] => {
  const names: string[] = [];
  for (const value of Object.values(dataOptions)) {
    const candidates = Array.isArray(value) ? value : [value];
    for (const candidate of candidates) {
      if (typeof candidate === 'object' && candidate !== null && isAnyColumn(candidate)) {
        names.push(getColumnName(candidate));
      }
    }
  }
  return names;
};

/**
 * Resolves a stable, unique `entityId` for a widget tracking event.
 *
 * Prefers the widget's own `id` (the Fusion widget OID when loaded via `WidgetById` /
 * `DashboardById`, or the user-supplied id when composed). When no id is available — e.g. a
 * standalone `<ChartWidget>` — it falls back to a deterministic hash of the widget's identity:
 * its type, name, title, the column names of its `dataOptions`, and its data source. Two
 * structurally identical standalone widgets therefore resolve to the same id, which is the
 * desired behavior for adoption tracking. The fallback is prefixed with `hash:` so downstream
 * consumers can tell a generated identifier apart from a real widget id/OID.
 *
 * Typed with a generic + intersection so callers pass their concrete widget prop type while the
 * optional `id` / `dataOptions` / `dataSource` are read uniformly (e.g. `TextWidgetProps` declares
 * none of them).
 *
 * @internal
 */
export const getWidgetEntityId = <P extends object>(
  props: P & {
    id?: string;
    title?: string;
    dataOptions?: WidgetDataOptions;
    dataSource?: DataSource;
  },
  widgetType: WidgetType,
  widgetName: string,
): string => {
  if (props.id) return props.id;

  const widgetTitle = props.title ?? null;
  const columnNames = props.dataOptions ? collectColumnNames(props.dataOptions) : [];
  const dataSourceName = props.dataSource ? getDataSourceName(props.dataSource) : null;

  return `hash:${hash({ widgetType, widgetName, widgetTitle, columnNames, dataSourceName })}`;
};
