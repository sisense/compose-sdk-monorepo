import { type JaqlPanel } from '@sisense/sdk-pivot-query-client';
import type { PivotDataNode, PivotTreeNode } from '@sisense/sdk-pivot-ui';

import { type PivotTableDataOptions } from '@/domains/visualizations/core/chart-data-options/types.js';
import { applyFormatPlainText } from '@/domains/visualizations/core/chart-options-processor/translations/number-format-config.js';

import { type DataCellFormatter } from '../types.js';
import { getNumberFormatConfig, getPivotDataOptionByJaqlIndex } from '../utils.js';

export const createDataCellValueFormatter = (
  dataOptions: PivotTableDataOptions,
): DataCellFormatter => {
  return (
    cell: PivotDataNode,
    rowItem: PivotTreeNode,
    columnItem: PivotTreeNode,
    jaqlPanelItem: JaqlPanel | undefined,
  ) => {
    const dataOption = getPivotDataOptionByJaqlIndex(dataOptions, jaqlPanelItem?.field?.index);
    const numberFormatConfig = getNumberFormatConfig(dataOption);
    const isEmptyCell = cell.value === null || typeof cell.value === 'undefined';

    if (dataOption && 'isHtml' in dataOption && dataOption.isHtml) {
      cell.contentType = 'html';
    }

    cell.content = isEmptyCell ? '' : applyFormatPlainText(numberFormatConfig, cell.value);
  };
};
