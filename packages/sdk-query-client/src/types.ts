import {
  Filter,
  Measure,
  Attribute,
  Cell,
  QueryResultData,
  DataSource,
  PivotAttribute,
  PivotMeasure,
  PivotQueryResultData,
  PivotGrandTotals,
  FilterRelationsJaql,
  JaqlDataSource,
} from '@sisense/sdk-data';
import { AnyObject } from './helpers/utility-types.js';

/**
 * All the properties that fully describe a query you want to send.
 */
export type QueryDescription = {
  dataSource: DataSource;
  attributes: Attribute[];
  measures: Measure[];
  filters: Filter[];
  highlights: Filter[];
  filterRelations?: FilterRelationsJaql;
  count?: number;
  offset?: number;
  ungroup?: boolean;
};

/**
 * All the properties that fully describe a pivot query you want to send.
 */
export type PivotQueryDescription = {
  dataSource: DataSource;
  rowsAttributes: (Attribute | PivotAttribute)[];
  columnsAttributes: (Attribute | PivotAttribute)[];
  measures: (Measure | PivotMeasure)[];
  grandTotals: PivotGrandTotals;
  filters: Filter[];
  highlights: Filter[];
  filterRelations?: FilterRelationsJaql;
  count?: number;
  offset?: number;
};

/**
 * Additional configuration for query execution.
 */
export type QueryExecutionConfig = {
  /**
   * Sync or async callback that allows to modify the JAQL payload before it is sent to the server.
   */
  onBeforeQuery?: (jaql: JaqlQueryPayload) => JaqlQueryPayload | Promise<JaqlQueryPayload>;
};

export type QueryExecutionConfigInternal = QueryExecutionConfig & {
  shouldSkipHighlightsWithoutAttributes: boolean;
};

export type QueryOptions = {
  // notice datasource (in lower case) is expected by JAQL API
  datasource: JaqlDataSource;
  by: string;
  queryGuid: string;
  count?: number;
  offset?: number;
  // ungroup may be needed for queries with no aggregation
  ungroup?: boolean;

  /* PIVOT OPTIONS START */
  dashboard?: string;
  widget?: string;
  format?: string;
  grandTotals?: {
    title?: string;
    columns?: boolean;
    rows?: boolean;
  };
  /* PIVOT OPTIONS END */
};

export type ExecutingQueryResult = {
  resultPromise: Promise<QueryResultData>;
  cancel: (reason?: string) => Promise<void>;
};

export type ExecutingCsvQueryResult = {
  resultPromise: Promise<Blob>;
  cancel: (reason?: string) => Promise<void>;
};

export type ExecutingPivotQueryResult = {
  resultPromise: Promise<PivotQueryResultData>;
  cancel: (reason?: string) => Promise<void>;
};

interface DecimalAbbreviations {
  k: boolean;
  m: boolean;
  b: boolean;
  t: boolean;
}

export enum CurrencyPosition {
  PRE = 'pre',
  POST = 'post',
}

export type NumericMask = {
  isdefault?: boolean;
  abbreviations?: DecimalAbbreviations;
  decimals?: 'auto' | number | string;
  currency?: { symbol: string; position: CurrencyPosition };
  percent?: boolean;
  number?: { separated: boolean };
  separated?: boolean;
  type?: string;
};

export type DatetimeMask = {
  isdefault?: boolean;
  years: string;
  quarters: string;
  months: string;
  weeks: string;
  minutes: string;
  days: string;
  type: string;
  dateAndTime?: string;
};

export type MetadataItem = {
  instanceid?: string;
  measure?: MetadataItemJaql;
  jaql: MetadataItemJaql;
  panel?: string;
  isScope?: boolean;
  format?: {
    mask?: Partial<DatetimeMask> | Partial<NumericMask>;
    number?: string;
    /* PIVOT OPTIONS START */
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
  field?: {
    id?: string;
    index?: number;
  };
  /* PIVOT OPTIONS END */
  filter?: MetadataItem;
  exclude?: MetadataItem;
  by?: MetadataItemJaql;
  level?: string;
  anchor?: string;

  from?: string;
  to?: string;
};

export type MetadataItemJaql = {
  dim?: string;
  agg?: string;
  datatype?: string;
  table?: string;
  column?: string;
  level?: string;
  dateTimeLevel?: string;
  bucket?: string;
  sort?: string;
  in?: {
    selected: {
      jaql: MetadataItemJaql;
    };
  };
  title?: string;
  type?: string;
  formula?: string;
  context?: {
    [itemId: string]: MetadataItemJaql;
  };
  filter?: MetadataItem;
  sortDetails?: {
    dir: string;
    field?: number;
    measurePath?: Record<number, string | number>;
    sortingLastDimension?: boolean;
    initialized?: boolean;
  };
};

export type JaqlQueryPayload = QueryOptions & {
  filterRelations?: FilterRelationsJaql;
  metadata: MetadataItem[];
};

export type DataSourceField = {
  column: string;
  dimtype: string;
  id: string;
  indexed: boolean;
  merged: boolean;
  table: string;
  title: string;
  type: string;
};

export type JaqlResponse = {
  metadata?: MetadataItem[];
  headers?: string[];
  values?: Cell[][] | Cell[];
  error?: boolean;
  details?: string;
  extraDetails?: string;
  type?: string;
  errorSource?: string;
  httpStatusCode?: number;
  database?: string;
};

export type DataSourceSchema = {
  title: string;
  type: 'extract' | 'live';
} & AnyObject;

export type DataSourceMetadata = {
  title: string;
  fullname: string;
  live: boolean;
};

export type AbortRequestFunction = (reason?: string) => void;

export type QueryGuid = string;
