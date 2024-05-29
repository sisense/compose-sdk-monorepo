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
        text = applyDateFormat(parseISO(newCell.data), dateFormatForThisColumn, locale, dateConfig);
      } catch (e: unknown) {
        console.error(e);
      }
      newCell.text = text;
      return newCell;
    });
  });

  return data;
}
