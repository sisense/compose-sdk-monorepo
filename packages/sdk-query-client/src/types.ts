import {
  Attribute,
  Cell,
  DataSource,
  Filter,
  FilterRelationsJaql,
  JaqlDataSource,
  Measure,
  MetadataItem,
  PivotAttribute,
  PivotGrandTotals,
  PivotMeasure,
  PivotQueryResultData,
  QueryResultData,
} from '@ethings-os/sdk-data';

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

export type JaqlQueryPayload = QueryOptions & {
  filterRelations?: FilterRelationsJaql;
  metadata: MetadataItem[];
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

export type AbortRequestFunction = (reason?: string) => void;

export type QueryGuid = string;
