import {
  Filter,
  Measure,
  Attribute,
  Cell,
  QueryResultData,
  DataSource,
  FilterRelation,
} from '@sisense/sdk-data';

/**
 * All the properties that fully describe a query you want to send.
 */
export type QueryDescription = {
  dataSource: DataSource;
  attributes: Attribute[];
  measures: Measure[];
  filters: Filter[];
  highlights: Filter[];
  filterRelations?: FilterRelation;
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
  datasource: string;
  by: string;
  queryGuid: string;
};

export type ExecutingQueryResult = {
  resultPromise: Promise<QueryResultData>;
  cancel: (reason?: string) => Promise<void>;
};

export type ExecutingCsvQueryResult = {
  resultPromise: Promise<Blob>;
  cancel: (reason?: string) => Promise<void>;
};

export type MetadataItem = {
  instanceid?: string;
  measure?: MetadataItemJaql;
  jaql: MetadataItemJaql;
  panel?: string;
  isScope?: boolean;
  format?: {
    mask?: {
      [level: string]: string | undefined;
    };
    number?: string;
  };
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
  formula?: string;
  context?: {
    [itemId: string]: MetadataItemJaql;
  };
  filter?: MetadataItem;
};

export type JaqlQueryPayload = QueryOptions & {
  filterRelations?: FilterRelation;
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
  type?: string;
  errorSource?: string;
  httpStatusCode?: number;
  database?: string;
};

export type AbortRequestFunction = (reason?: string) => void;

export type QueryGuid = string;

export type EmptyObject = Record<string, never>;
