/* eslint-disable @typescript-eslint/ban-types */
import { type BaseJaql } from '@sisense/sdk-data';

export type MeasurePath = {
  [key: string]: string;
};

export type SortDetails = {
  field?: number;
  initialized?: boolean;
  sortingLastDimension?: boolean;
  measurePath?: MeasurePath | null;
  dir: string | null;
  isLastApplied?: boolean;
};

export type Jaql = Omit<BaseJaql, 'sort'> & {
  sortDetails?: SortDetails;
  type?: string;
  sort?: BaseJaql['sort'] | null;
};

export type JaqlPanel = {
  jaql: Jaql;
  panel: string;
  field?: {
    id?: string;
    index?: number;
  };
  disabled?: boolean;
  hierarchies?: Array<string>;
  format?: {
    subtotal?: boolean;
    width?: number;
    databars?: boolean;
    color?: {
      type: string;
      color?: string;
      conditions?: Array<{
        color: string;
        operator: string;
        expression: string | Record<string, any>;
      }>;
    };
  };
};

export type JaqlDatasource = {
  id: string;
  title: string;
  address: string;
  database: string;
  fullname: string;
  lastBuildTime: string;
};

export type JaqlRequest = {
  datasource?: JaqlDatasource;
  metadata: Array<JaqlPanel>;
  queryGuid?: string;
  grandTotals?: null | {
    title: string;
    columns?: boolean;
    rows?: boolean;
  };
};

export interface DataLoadServiceI {
  clone(): DataLoadServiceI;
  load(jaql: JaqlRequest): Promise<any>;
  getJaql(): JaqlRequest | undefined;
  isSingleRowTree(): boolean;
  getTotalItemsCount(): number;
  clear(): void;
  on(eventName: string, callback: (payload: any) => void): void;
  off(eventName: string, callback: (payload: any) => void): void;
  offAll(eventName: string): void;
  listenerCount(eventName: string): number;
  emit(eventName: string, ...rest: Array<any>): void;
  isFormattingChanges(jaql?: JaqlRequest, isLimited?: boolean): boolean;
  hasData(): boolean;
  hasError(): boolean;
  destroy(): void;
  cancelQuery(): Promise<void>;
}

export interface SocketI {
  isReady(): boolean;
  on(event: string, cb: Function): void;
  off(event: string, cb: Function): void;
  onMessage(
    type: string | undefined,
    subType: string | undefined,
    callback: (type: string, data: any) => void,
  ): () => void;
  send(event: string, ...args: any[]): void;
  trigger(event: string, data: any): any;
}

export interface SocketQueryOptions {
  token?: string;
  authorization?: string;
  initialiser?: string;
}
