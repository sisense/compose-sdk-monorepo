/* eslint-disable @typescript-eslint/ban-types */
// import * as React from 'react';
// import { PluginConfig, GlobalStyles, Metadata } from './utils/plugins/types.js';
import { Metadata } from './utils/plugins/types.js';
// import { Defer, LoggerI, InputStyles } from '../utils/types.js';
import { Defer, LoggerI } from '../utils/types.js';
import { TreeNode, TreeServiceI } from '../tree-structure/types.js';
import { JaqlRequest, JaqlPanel } from '../data-load/types.js';

// export type EmbedComponentProps = {
//   width?: number | string;
//   domReadyDefer?: Defer;
//   [key: string]: any;
// };

export type PivotTreeNode = TreeNode & {
  // formatted value to show or React component
  // content?: null | string | typeof React.Component;
  content?: null | string;
  contentType?: string;
  // metadata type (rows | columns | measures)
  metadataType?: string;
  // predefined user type (subTotal | grandTotal)
  userType?: string;
  // table type (corner | rows | columns | data)
  tableType?: string;
  // jaql panel field index
  jaqlIndex?: number;
  // jaql measure panel field index for last level column items
  measureJaqlIndex?: number;
  // represents path from root to current node (used in sorting)
  measurePath?: { [key: string]: string };
  // reference to parent PivotTreeNode
  parent?: PivotTreeNode;
  // reference to related PivotTreeNode (for sub/grand totals for example)
  master?: PivotTreeNode;
  // sorting direction
  dir?: string | null;
  // databars feature for measure
  databars?: boolean;
  // state of cell
  state?: {
    isSelected?: boolean;
    isDrilled?: boolean;
  };
  // cell data store
  store?: { domReadyDefer?: Defer; [key: string]: any };
};

export type CompileRangeArgs = {
  minvalue?: number;
  midvalue?: number;
  maxvalue?: number;
  min?: string;
  max?: string;
  minDef?: string;
  maxDef?: string;
  minGray?: string;
  maxGray?: string;
};

export type PivotDataNode = {
  // raw data
  value: any;
  // formatted value to show or React component
  // content?: null | string | typeof React.Component;
  content?: null | string;
  contentType?: string;
  // matched index for condition formatting
  cf?: number;
  // style object
  // style?: InputStyles;
  // jaql panel field index
  jaqlIndex?: number;
  // state of cell
  state?: {
    isSelected?: boolean;
    isDrilled?: boolean;
  };
  // cell data store
  store?: {
    domReadyDefer?: Defer;
    compileRange?: (arg: CompileRangeArgs) => (value: number) => string;
    compileRangeContext?: unknown;
    compileRangeArgs?: CompileRangeArgs;
    [key: string]: any;
  };
};

// export type PivotCellEvent = {
//   event: any;
//   isDataCell: boolean;
//   dataNode?: PivotTreeNode | PivotDataNode;
//   rowTreeNode?: PivotTreeNode;
//   columnTreeNode?: PivotTreeNode;
//   measureTreeNode?: PivotTreeNode;
//   pivotCell?: Record<string, any>;
//   cellMetadata?: Metadata;
//   cell: any;
// };

export interface InitPageData {
  rowsTreeService?: TreeServiceI;
  columnsTreeService?: TreeServiceI;
  cornerTreeService?: TreeServiceI;
  isLastPage: boolean;
  cellsMetadata?: Map<string, Metadata>;
}

export type AllDataInfo = {
  loadedRowsCount: number;
  totalItemsCount: number;
  totalColumnsCount?: number;
  totalRecordsCount?: number;
  columnsCount?: number;
  limitReached?: boolean;
  dataBars?: Array<[string, string]>;
  rangeMinMax?: Array<[string, string]>;
};

export interface DataServiceI {
  logger: LoggerI;
  on(eventName: string, callback: Function): void;
  off(eventName: string, callback: Function): void;
  emit(eventName: string, ...payload: Array<any>): void;
  getSelectedPageData(selected: number, pageSize?: number): Promise<InitPageData>;
  getIndexedPageData(from: number, to: number, lastPage?: boolean): Promise<InitPageData>;
  // TODO is it just loading all data METADATA?
  loadAllData(): Promise<AllDataInfo>;
  loadData(
    jaql?: JaqlRequest,
    options?: {
      pageSize?: number;
      isPaginated?: boolean;
      metadata?: Array<JaqlPanel>;
      cacheResult?: boolean;
    },
  ): Promise<InitPageData>;
  getJaql(): JaqlRequest | undefined;
  isSingleRowTree(): boolean;
  preProcessTree(
    items: TreeNode | Array<TreeNode>,
    type: string,
    options?: {
      level?: number;
      measurePath?: { [key: string]: string };
    },
  ): Array<PivotTreeNode>;
  modifyTree(
    items: Array<PivotTreeNode>,
    type: string,
    originalData: TreeNode,
  ): Array<PivotTreeNode>;
  postProcessTree(items: Array<PivotTreeNode>): void;
  cancelLoading(): void;
  destroy(): void;
  // setPluginHandlers(plugins: Array<PluginConfig>): void;
  // setGlobalStyles(styles: GlobalStyles): void;
}
