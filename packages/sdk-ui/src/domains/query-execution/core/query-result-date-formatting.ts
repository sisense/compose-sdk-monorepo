/* eslint-disable max-params */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Data, isDatetime } from '@sisense/sdk-data';
import type { Cell, Column, QueryResultData } from '@sisense/sdk-data';

import { isMeasureColumn } from '@/domains/visualizations/core/chart-data-options/utils';
import { NOT_AVAILABLE_DATA_VALUE } from '@/shared/const';

import { StyledColumn } from '../../visualizations/core/chart-data-options/types.js';
import { getBaseDateFnsLocale } from '../../visualizations/core/chart-data-processor/data-table-date-period.js';
import { createCompareValue } from '../../visualizations/core/chart-data-processor/row-comparator.js';
import { isCell } from '../../visualizations/core/chart-data-processor/table-creators.js';
import { formatDateValue } from './date-formats/apply-date-format.js';
import { defaultDateConfig } from './date-formats/index.js';
import type { DateConfig, DateFormat } from './date-formats/index.js';

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
  ].forEach(function collectDateFormatsFromCategoriesOptions(cat: StyledColumn): void {
    if (isMeasureColumn(cat) || !cat.dateFormat || !data?.columns) {
      return;
    }

    const columnIndex = data.columns.findIndex(function isDatetimeColumnWithSameNameSameType(
      column: Column,
    ): boolean {
      return (
        column.name === cat.column.name && isDatetime(cat.column.type) && isDatetime(column.type)
      );
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
      if (!dateFormatForThisColumn || oldCell === NOT_AVAILABLE_DATA_VALUE) {
        return oldCell;
      }

      let newCell;
      let date;
      if (isCell(oldCell)) {
        if (oldCell.data === NOT_AVAILABLE_DATA_VALUE) {
          return oldCell;
        }
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
        text = formatDateValue(newCell.data, dateFormatForThisColumn, locale, dateConfig);
      } catch (e: unknown) {
        console.error(e);
      }
      newCell.text = text;
      return newCell;
    });
  });

  return data;
}
