import type { JaqlPanel, PivotDataNode, PivotTreeNode } from '@sisense/sdk-pivot-client';

import { type PivotTableDataOptions } from '@/chart-data-options/types.js';
import { applyFormatPlainText } from '@/chart-options-processor/translations/number-format-config.js';

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

    cell.content = isEmptyCell ? '' : applyFormatPlainText(numberFormatConfig, cell.value);
  };
};
