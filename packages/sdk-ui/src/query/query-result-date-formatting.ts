/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import parseISO from 'date-fns/parseISO';
import { Data, isDatetime } from '@sisense/sdk-data';
import { getBaseDateFnsLocale } from '../chart-data-processor/data-table-date-period';
import { applyDateFormat, defaultDateConfig } from './date-formats';
import type { DateFormat, DateConfig } from './date-formats';
import { Category, isCategory } from '../chart-data-options/types';
import type { Column, Cell, QueryResultData } from '@sisense/sdk-data';
import { isCell } from '../chart-data-processor/table-creators';
import { createCompareValue } from '../chart-data-processor/row-comparator';

export function parseISOWithDefaultUTCOffset(dateString: string): Date {
  if (dateString.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(dateString)) {
    // String already contains timezone offset
    return parseISO(dateString);
  } else if (dateString.startsWith('1111-11-11')) {
    // Do not append 'Z' if the dateString starts with '1111-11-11'
    // because this prefix is for time levels (instead of date levels) and
    // timezone conversion is inaccurate for date pre 1582
    return parseISO(dateString);
  } else {
    // Otherwise, append 'Z' to treat as UTC
    // This is needed because parseISO treats date strings without timezone offset as local time
    // set by the browser
    return parseISO(`${dateString}Z`);
  }
}

//TODO: refactor this function
// eslint-disable-next-line max-lines-per-function, sonarjs/cognitive-complexity
export function applyDateFormats(
  data: QueryResultData | Data,
  chartDataOptions: any,
  locale: Locale = getBaseDateFnsLocale(),
  dateConfig: DateConfig = defaultDateConfig,
): QueryResultData | Data {
  type ColumnIndex = number;
  const dateFormats = new Map<ColumnIndex, DateFormat>();
  [
    ...(chartDataOptions.breakBy ? chartDataOptions.breakBy : []),
    ...(chartDataOptions.x
      ? Array.isArray(chartDataOptions.x)
        ? chartDataOptions.x
        : [chartDataOptions.x]
      : []),
    ...(chartDataOptions.columns ? chartDataOptions.columns : []),
  ].forEach(function collectDateFormatsFromCategoriesOptions(cat: Category): void {
    if (!isCategory(cat) || !cat.dateFormat) {
      return;
    }

    const columnIndex = data.columns.findIndex(function isDatetimeColumnWithSameNameSameType(
      column: Column,
    ): boolean {
      return column.name === cat.name && isDatetime(cat.type) && isDatetime(column.type);
    });

    if (columnIndex === -1) {
      return;
    }

    dateFormats.set(columnIndex, cat.dateFormat);
  });

  if (dateFormats.size === 0) {
    return data;
  }

  data.rows = data.rows.map(function makeNewRow(
    oldRow: (string | number | Cell)[],
  ): (string | number | Cell)[] {
    return oldRow.map(function maybeMakeNewCellWithDateFormattedText(
      oldCell: string | number | Cell,
      columnIndex: number,
    ): string | number | Cell {
      const dateFormatForThisColumn = dateFormats.get(columnIndex);
      if (!dateFormatForThisColumn) {
        return oldCell;
      }

      let newCell;
      let date;
      if (isCell(oldCell)) {
        newCell = { ...oldCell };
      } else {
        // oldCell is a date string, emulate how JAQL results treats dates
        const compareValue = createCompareValue(`${oldCell}`, 'datetime');
        date = new Date(compareValue.value);
        newCell = { data: date.toISOString(), text: `${oldCell}` };
      }
      if (!newCell.data) {
        return oldCell;
      }

      let text = newCell.text;
      try {
        text = applyDateFormat(
          parseISOWithDefaultUTCOffset(newCell.data),
          dateFormatForThisColumn,
          locale,
          dateConfig,
        );
      } catch (e: unknown) {
        console.error(e);
      }
      newCell.text = text;
      return newCell;
    });
  });

  return data;
}
