import { type JaqlPanel } from '@sisense/sdk-pivot-query-client';
import type { PivotDataNode, PivotTreeNode } from '@sisense/sdk-pivot-ui';

import type { PivotTableDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types';

import type {
  CellFormattingResult,
  CustomDataCellFormatter,
  CustomHeaderCellFormatter,
} from './types.js';
import { getPivotDataOptionByJaqlIndex, getPivotDataOptionIdByJaqlIndex } from './utils';

/**
 * Applies a formatting result to a data cell, mutating the cell object
 * @param cell - The cell to apply formatting to
 * @param result - The formatting result to apply
 */
export function applyCellFormattingResult(
  cell: PivotDataNode | PivotTreeNode,
  result: CellFormattingResult,
): void {
  if (result.content !== undefined) {
    cell.content = result.content;
  }
  if (result.style) {
    cell.style = { ...cell.style, ...result.style };
  }
}

/**
 * Creates a unified formatter that handles functional formatters by applying their results
 *
 * @param formatter - A functional formatter that returns formatting information
 * @returns A function that applies the formatter result to the cell
 */
export function createUnifiedDataCellFormatter(
  formatter: CustomDataCellFormatter,
  dataOptions: PivotTableDataOptionsInternal,
): (
  cell: PivotDataNode,
  rowItem: PivotTreeNode,
  columnItem: PivotTreeNode,
  jaqlPanelItem: JaqlPanel,
) => void {
  return (
    cell: PivotDataNode,
    rowItem: PivotTreeNode,
    columnItem: PivotTreeNode,
    jaqlPanelItem: JaqlPanel,
  ) => {
    const dataOption = getPivotDataOptionByJaqlIndex(dataOptions, jaqlPanelItem?.field?.index);
    if (!dataOption) {
      return;
    }

    const id = getPivotDataOptionIdByJaqlIndex(dataOptions, jaqlPanelItem?.field?.index) || '';
    const result = formatter(cell, jaqlPanelItem, dataOption, id);

    // Apply the formatting result if one was returned
    if (result && typeof result === 'object') {
      applyCellFormattingResult(cell, result);
    }
  };
}

/**
 * Creates a unified header cell formatter that handles functional formatters by applying their results
 *
 * @param formatter - A functional header formatter that returns formatting information
 * @returns A function that applies the formatter result to the header cell
 */
export function createUnifiedHeaderCellFormatter(
  formatter: CustomHeaderCellFormatter,
  dataOptions: PivotTableDataOptionsInternal,
): (cell: PivotTreeNode, jaqlPanelItem: JaqlPanel | undefined) => void {
  return (cell: PivotTreeNode, jaqlPanelItem: JaqlPanel | undefined) => {
    const dataOption = getPivotDataOptionByJaqlIndex(dataOptions, jaqlPanelItem?.field?.index);
    const id = getPivotDataOptionIdByJaqlIndex(dataOptions, jaqlPanelItem?.field?.index);

    const result = formatter(cell, jaqlPanelItem, dataOption, id);

    if (result && typeof result === 'object') {
      applyCellFormattingResult(cell, result);
    }
  };
}
