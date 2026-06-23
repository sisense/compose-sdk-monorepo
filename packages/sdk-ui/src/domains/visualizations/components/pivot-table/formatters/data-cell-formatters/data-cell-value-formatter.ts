import { type JaqlPanel } from '@sisense/sdk-pivot-query-client';
import type { PivotDataNode, PivotTreeNode } from '@sisense/sdk-pivot-ui';

import { type PivotTableDataOptions } from '@/domains/visualizations/core/chart-data-options/types.js';
import {
  applyFormatPlainText,
  formatNumberWithFallback,
} from '@/domains/visualizations/core/chart-options-processor/translations/number-format-config.js';

import { type DataCellFormatter } from '../types.js';
import { getPivotDataOptionByJaqlIndex } from '../utils.js';

export const createDataCellValueFormatter = (
  dataOptions: PivotTableDataOptions,
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

    cell.content = isEmptyCell
      ? ''
      : formatNumberWithFallback(
          cell.value as number,
          rawConfig,
          defaultNumberFormattingEnabled,
          applyFormatPlainText,
        );
  };
};
