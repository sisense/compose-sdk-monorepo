import {
  Cell,
  Column,
  Data,
  isDatetime,
  isNumber,
  isText,
  QueryResultData,
} from '@sisense/sdk-data';

import {
  AnyColumn,
  CommonDataOptions,
} from '@/domains/visualizations/core/chart-data-options/types';
import { splitColumn } from '@/domains/visualizations/core/chart-data-options/utils';
import { isCell } from '@/domains/visualizations/core/chart-data-processor/table-creators';
import { NOT_AVAILABLE_DATA_VALUE } from '@/shared/const';
import type { NumberFormatConfig } from '@/types';

import { formatDate, FormatDateOptions } from './format-date';
import { formatNumber } from './format-number';

/**
 * Options for {@link formatDataSet}.
 */
export type FormatDataSetOptions = FormatDateOptions;

/** Formatting-relevant style fields shared by category and value columns. */
type ColumnFormatStyle = { numberFormatConfig?: NumberFormatConfig; dateFormat?: string };

type ColumnFormatter =
  | { kind: 'number'; config: NumberFormatConfig }
  | { kind: 'date'; format: string }
  | { kind: 'text' };

/** Type guard distinguishing a column from non-column dataOptions values (color maps, flags, etc.). */
function isAnyColumn(value: unknown): value is AnyColumn {
  if (typeof value !== 'object' || value === null) return false;
  // Styled wrappers carry `.column`; raw attributes carry `type`; raw measures carry `aggregation`/`formula`.
  return 'column' in value || 'type' in value || 'aggregation' in value || 'formula' in value;
}

/** Collects every column referenced by a dataOptions object, from both single-column and array properties. */
function collectColumns(dataOptions: CommonDataOptions): AnyColumn[] {
  return Object.values(dataOptions as Record<string, unknown>).flatMap((value) =>
    (Array.isArray(value) ? value : [value]).filter(isAnyColumn),
  );
}

/**
 * Builds a per-column-index formatter aligned with `data.columns`. The formatter is chosen by
 * the column's type: datetime uses `dateFormat`, numeric uses `numberFormatConfig`, text is
 * always rendered as `String(data)`. Columns absent from `dataOptions` get no formatter.
 */
function buildColumnFormatters(
  columns: Column[],
  dataOptions: CommonDataOptions,
): (ColumnFormatter | null)[] {
  const formatOptionsByColumnName = new Map<string, ColumnFormatStyle>();

  collectColumns(dataOptions).forEach((anyColumn) => {
    const { column, style } = splitColumn(anyColumn);
    if (column.name) {
      formatOptionsByColumnName.set(column.name, style);
    }
  });

  return columns.map((col) => {
    const style = formatOptionsByColumnName.get(col.name);
    if (style === undefined) return null;

    if (isDatetime(col.type)) {
      return typeof style.dateFormat === 'string'
        ? { kind: 'date', format: style.dateFormat }
        : null;
    }
    if (isText(col.type)) {
      return { kind: 'text' };
    }
    if (isNumber(col.type)) {
      return style.numberFormatConfig ? { kind: 'number', config: style.numberFormatConfig } : null;
    }
    return null;
  });
}

function applyFormatterToCell(
  cell: string | number | Cell,
  formatter: ColumnFormatter,
  dateOptions: FormatDateOptions,
): string | number | Cell {
  const rawValue = isCell(cell) ? cell.data : cell;
  if (rawValue === NOT_AVAILABLE_DATA_VALUE || rawValue === null) return cell;

  const withText = (text: string) => (isCell(cell) ? { ...cell, text } : { data: rawValue, text });

  if (formatter.kind === 'date') {
    const dateValue = rawValue instanceof Date ? rawValue : String(rawValue);
    return withText(formatDate(dateValue, formatter.format, dateOptions));
  }

  if (formatter.kind === 'number') {
    const numValue = typeof rawValue === 'number' ? rawValue : Number(rawValue);
    return isFinite(numValue) ? withText(formatNumber(numValue, formatter.config)) : cell;
  }

  // formatter.kind === 'text'
  return withText(String(rawValue));
}

/**
 * Formats a data set by applying the number and date formatting declared in `dataOptions` to a data set.
 * Writes the formatted result into each affected cell's `text` property.
 *
 * @example
 * const formattedData = formatDataSet(data, dataOptions);
 *
 * @param data - Query result or user-provided data set.
 * @param dataOptions - Any chart, pivot, or custom-widget data options.
 * @param options - Formatting options.
 * @returns A new data set with formatted `text` values on affected cells.
 * @group Formatting
 */
export function formatDataSet<DataSet extends QueryResultData | Data>(
  data: DataSet,
  dataOptions: CommonDataOptions,
  options: FormatDataSetOptions = {},
): DataSet {
  const columnFormatters = buildColumnFormatters(data.columns, dataOptions);
  if (columnFormatters.every((formatter) => formatter === null)) {
    return data;
  }

  const rows = data.rows.map((row) =>
    row.map((cell, colIdx) => {
      const formatter = columnFormatters[colIdx];
      return formatter ? applyFormatterToCell(cell, formatter, options) : cell;
    }),
  );

  return { ...data, rows };
}
