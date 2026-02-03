import { type Column } from '@sisense/sdk-data';
import { type JaqlPanel, UserType } from '@sisense/sdk-pivot-query-client';
import { type PivotTreeNode } from '@sisense/sdk-pivot-ui';

import type {
  PivotTableDataOptions,
  StyledColumn,
} from '@/domains/visualizations/core/chart-data-options/types.js';
import { applyFormatPlainText } from '@/domains/visualizations/core/chart-options-processor/translations/number-format-config.js';
import { NOT_AVAILABLE_DATA_VALUE } from '@/shared/const.js';
import { DateFormatter } from '@/shared/formatters/create-date-formatter.js';
import { parseISOWithTimezoneCheck } from '@/shared/utils/parseISOWithTimezoneCheck';

import type { HeaderCellFormatter } from '../types.js';
import {
  getDateFormatConfig,
  getNumberFormatConfig,
  getPivotDataOptionByJaqlIndex,
} from '../utils.js';

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

    // Only dimensions (Column/StyledColumn) can have date formatting, not measures
    const isDimension =
      'type' in dataOption || ('column' in dataOption && 'type' in dataOption.column);
    const dateFormat = isDimension
      ? getDateFormatConfig(dataOption as Column | StyledColumn)
      : undefined;

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

    if (dataOption && 'isHtml' in dataOption && dataOption.isHtml) {
      cell.contentType = 'html';
    }

    if (cell.content === '') {
      cell.content = NOT_AVAILABLE_DATA_VALUE;
    }
  };
};

/**
 * Formats the date time string or Date object.
 * If the date is invalid, it returns the original value.
 */
export function formatDatetimeString(
  value: string | Date,
  dateFormatter: DateFormatter,
  dateFormat?: string,
): string {
  if (value === NOT_AVAILABLE_DATA_VALUE) {
    return value;
  }

  if (!dateFormat) {
    return typeof value === 'string' ? value : value.toISOString();
  }

  const date = typeof value === 'string' ? parseISOWithTimezoneCheck(value) : value;

  if (isInvalidDate(date)) {
    return typeof value === 'string' ? value : value.toISOString();
  }
  return dateFormatter(date, dateFormat);
}

/**
 * Checks if the date is invalid.
 */
function isInvalidDate(date: Date): boolean {
  return date.toString() === 'Invalid Date';
}
