import { type JaqlPanel } from '@sisense/sdk-pivot-query-client';
import type { PivotDataNode, PivotTreeNode } from '@sisense/sdk-pivot-ui';

import { type PivotTableDataOptions } from '@/domains/visualizations/core/chart-data-options/types.js';
import {
  applyFormatPlainText,
  formatNumberWithFallback,
} from '@/domains/visualizations/core/chart-options-processor/translations/number-format-config.js';
import { type DateFormatter } from '@/shared/formatters/create-date-formatter.js';
import { formatDatetimeString } from '@/shared/formatters/format-datetime-string';

import { type DataCellFormatter } from '../types.js';
import { getPivotDataOptionByJaqlIndex, resolvePivotDateMeasureFormat } from '../utils.js';

export const createDataCellValueFormatter = (
  dataOptions: PivotTableDataOptions,
  dateFormatter?: DateFormatter,
  defaultNumberFormattingEnabled = true,
): DataCellFormatter => {
  return (
    cell: PivotDataNode,
    rowItem: PivotTreeNode,
    columnItem: PivotTreeNode,
    jaqlPanelItem: JaqlPanel | undefined,
  ) => {
    const dataOption = getPivotDataOptionByJaqlIndex(dataOptions, jaqlPanelItem?.field?.index);
    const isEmptyCell = cell.value === null || typeof cell.value === 'undefined';
    const rawConfig =
      dataOption && 'numberFormatConfig' in dataOption ? dataOption.numberFormatConfig : undefined;

    if (dataOption && 'isHtml' in dataOption && dataOption.isHtml) {
      cell.contentType = 'html';
    }

    if (isEmptyCell) {
      cell.content = '';
      return;
    }

    // a date measure cell arrives as a raw ISO string, so it is masked here rather than run
    // through the number formatter, which would parse the leading digits off it
    if (jaqlPanelItem?.jaql?.datatype === 'datetime' && dateFormatter) {
      cell.content = formatDatetimeString(
        cell.value as string,
        dateFormatter,
        resolvePivotDateMeasureFormat(dataOption, jaqlPanelItem),
      );
      return;
    }

    cell.content = formatNumberWithFallback(
      cell.value as number,
      rawConfig,
      defaultNumberFormattingEnabled,
      applyFormatPlainText,
    );
  };
};
