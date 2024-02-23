import { Defer, Styles, InputStyles } from '../../../utils/types.js';

export type DimensionTarget = {
  index?: Array<number | any>;
  dim?: string; // '[Customer.Country]' would be copied to name
  name?: string; // '[Customer.Country]'
  member?: Array<string | any>; // ['USA', 'Canada']
  members?: Array<string | any>; // ['USA', 'Canada'] would be copied to member
  title?: Array<string | any>; // panel title ['Country', 'Category']
};

export type ValueTarget = {
  index?: Array<number | any>;
  dim?: string; // '[Customer.Country]'
  name?: string; // '[Customer.Country]'
  agg?: string; // 'sum'
  title?: Array<string | any>; // panel title 'Total Sales'
};

export type Target = {
  type?: Array<string>;
  rows?: Array<DimensionTarget>;
  columns?: Array<DimensionTarget>;
  values?: Array<ValueTarget>;
  index?: Array<number>;
};

export type DimensionMetadata = {
  title: string;
  name: string;
  member: string;
  index: number;
};

export type MeasureMetadata = {
  title?: string;
  dim?: string;
  agg?: string;
  formula?: string;
  context?: string;
  index?: number;
};

export type Metadata = {
  type: Array<string>;
  rows?: Array<DimensionMetadata>;
  columns?: Array<DimensionMetadata>;
  measure?: MeasureMetadata;
  index?: number; // jaql index for item
  colIndex: number;
  rowIndex: number;
  cellData?: {
    value: any;
    content: any;
  };
};

export type DimensionOptions = {
  fields: Array<string>;
};
export type MeasureOptions = {
  fields: Array<string>;
};

export type CellItem = {
  value: string | undefined;
  content: string;
  contentType: string;
  style: InputStyles | undefined;
  store?: { domReadyDefer?: Defer; [key: string]: any };
  // state of cell
  state?: {
    isSelected?: boolean;
    isDrilled?: boolean;
  };
};

export type GlobalStyles = Styles;

export type PluginConfig = {
  target: Target;
  handler: (metadata: Metadata, cellItem: CellItem) => void;
};
