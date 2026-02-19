/* eslint-disable @typescript-eslint/ban-types */
import * as React from 'react';

import {
  Metadata,
  PivotDataNode as PivotDataNodeBase,
  PivotTreeNode as PivotTreeNodeBase,
} from '@sisense/sdk-pivot-query-client';

import { Defer, InputStyles } from '../utils/types.js';

export type EmbedComponentProps = {
  width?: number | string;
  domReadyDefer?: Defer;
  [key: string]: any;
};

export type PivotTreeNode = PivotTreeNodeBase<typeof React.Component>;

export type PivotDataNode = PivotDataNodeBase<typeof React.Component, InputStyles>;

export type PivotCellEvent = {
  event: any;
  isDataCell: boolean;
  dataNode?: PivotTreeNode | PivotDataNode;
  rowTreeNode?: PivotTreeNode;
  columnTreeNode?: PivotTreeNode;
  measureTreeNode?: PivotTreeNode;
  pivotCell?: Record<string, any>;
  cellMetadata?: Metadata;
  cell: any;
};
