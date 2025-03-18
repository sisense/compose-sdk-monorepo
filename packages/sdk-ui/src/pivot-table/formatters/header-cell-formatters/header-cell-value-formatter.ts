import { type JaqlPanel, type PivotTreeNode, UserType } from '@sisense/sdk-pivot-client';
import { type Column } from '@sisense/sdk-data';
import type { StyledColumn, PivotTableDataOptions } from '@/chart-data-options/types.js';
import type { DateFormatter, HeaderCellFormatter } from '../types.js';
import { applyFormatPlainText } from '@/chart-options-processor/translations/number-format-config.js';
import {
  getDateFormatConfig,
  getNumberFormatConfig,
  getPivotDataOptionByJaqlIndex,
} from '../utils.js';
import parseISO from 'date-fns/parseISO';

const PIVOT_TABLE_NULL_VALUE = 'N\\A';

export const createHeaderCellValueFormatter = (
  dataOptions: PivotTableDataOptions,
  dateFormatter: DateFormatter,
): HeaderCellFormatter => {
  return (cell: PivotTreeNode, jaqlPanelItem: JaqlPanel | undefined) => {
    const isMeasureHeader = jaqlPanelItem?.panel === 'measures';
    const isCorner = cell.userType === UserType.CORNER;
    const dataOption = getPivotDataOptionByJaqlIndex(dataOptions, jaqlPanelItem?.field?.index);

    if (isMeasureHeader || isCorner || !dataOption) {
      cell.content = cell.value;
      return;
    }

    const dateFormat = getDateFormatConfig(dataOption as Column | StyledColumn);

    switch (jaqlPanelItem?.jaql?.datatype) {
      case 'numeric':
        cell.content = applyFormatPlainText(
          getNumberFormatConfig(dataOption),
          parseFloat(`${cell.value}`),
        );
        break;
      case 'datetime':
        cell.content = formatDatetimeString(cell.value!, dateFormatter, dateFormat);
        break;
      default:
        cell.content = cell.value;
    }

    if (cell.content === '') {
      cell.content = PIVOT_TABLE_NULL_VALUE;
    }
  };
};

/**
 * Formats the date time string.
 * If the date is invalid, it returns the original value.
 */
export function formatDatetimeString(
  value: string,
  dateFormatter: DateFormatter,
  dateFormat?: string,
): string {
  if (!dateFormat) {
    return value;
  }
  const date = parseISO(value);
  if (isInvalidDate(date)) {
    return value;
  }
  return dateFormatter(date, dateFormat);
}

/**
 * Checks if the date is invalid.
 */
function isInvalidDate(date: Date): boolean {
  return date.toString() === 'Invalid Date';
}
