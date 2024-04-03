import type { JaqlPanel, PivotDataNode, PivotTreeNode } from '@sisense/sdk-pivot-client';

export type DataCellFormatter = (
  cell: PivotDataNode,
  rowItem: PivotTreeNode,
  columnItem: PivotTreeNode,
  jaqlPanelItem: JaqlPanel,
) => void;

export type HeaderCellFormatter = (cell: PivotTreeNode, jaqlPanelItem: JaqlPanel) => void;

export type DateFormatter = (date: Date, format: string) => string;
