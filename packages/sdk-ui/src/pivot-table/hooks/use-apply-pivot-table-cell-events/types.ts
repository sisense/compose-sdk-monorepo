type AbstractDataTreeNode = {
  value: string;
  content: string;
  level: number;
  metadataType: string;
  userType: string;
  parent: AbstractDataTreeNode | undefined;
};

export type ValueDataNode = AbstractDataTreeNode & {
  index: number;
  metadataType: 'measures';
  userType: 'measureBottom' | 'measureTop';
};

export type RowDataNode = AbstractDataTreeNode & {
  index: number;
  metadataType: 'rows';
  userType: 'corner' | 'subTotal' | 'grandTotal';
};

export type ColumnDataNode = AbstractDataTreeNode & {
  index: number;
  metadataType: 'columns';
  userType: 'subTotal' | 'grandTotal';
};

export type PivotTableCellPayload = {
  dataNode: ValueDataNode | RowDataNode | ColumnDataNode;
  rowTreeNode?: RowDataNode;
  columnTreeNode?: ColumnDataNode;
  measureTreeNode?: ValueDataNode;
  isDataCell: boolean;
  event: MouseEvent;
};

export type { AbstractDataTreeNode };
