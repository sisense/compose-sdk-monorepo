import { type PivotTableDataOptionsInternal } from '@/chart-data-options/types';

import {
  AbstractDataTreeNode,
  ColumnDataNode,
  PivotTableCellPayload,
  RowDataNode,
  ValueDataNode,
} from '../types';

export const createMockDataOptions = (): PivotTableDataOptionsInternal =>
  ({
    rows: [{ column: { name: 'Category' } }, { column: { name: 'SubCategory' } }],
    columns: [{ column: { name: 'Year' } }, { column: { name: 'Quarter' } }],
    values: [{ column: { name: 'Sales' } }, { column: { name: 'Profit' } }],
  } as PivotTableDataOptionsInternal);

export const createMockTreeNode = <T extends AbstractDataTreeNode = AbstractDataTreeNode>(
  value: string,
  content: string,
  level: number,
  metadataType: string,
  userType: string,
  index?: number,
  parent?: T,
): T =>
  ({
    value,
    content,
    level,
    metadataType,
    userType,
    parent,
    ...(index !== undefined && { index }),
  } as T);

export const createMockCellPayload = (
  eventType: 'click' | 'contextmenu' = 'click',
): PivotTableCellPayload => {
  const rowParent = createMockTreeNode<RowDataNode>(
    'Electronics',
    'Electronics',
    0,
    'rows',
    'data',
  );
  const rowTreeNode = createMockTreeNode<RowDataNode>(
    'Laptops',
    'Laptops',
    1,
    'rows',
    'data',
    1,
    rowParent,
  );

  const columnParent = createMockTreeNode<ColumnDataNode>('2023', '2023', 0, 'columns', 'data');
  const columnTreeNode = createMockTreeNode<ColumnDataNode>(
    'Q1',
    'Q1',
    1,
    'columns',
    'data',
    1,
    columnParent,
  );

  const measureTreeNode = createMockTreeNode<ValueDataNode>(
    'Sales',
    '$50,000',
    0,
    'measures',
    'measureBottom',
    0,
  );

  const dataNode = createMockTreeNode<ValueDataNode>('50000', '$50,000', 0, 'values', 'data', 0);

  return {
    dataNode,
    rowTreeNode,
    columnTreeNode,
    measureTreeNode,
    isDataCell: true,
    event: new MouseEvent(eventType),
  };
};
