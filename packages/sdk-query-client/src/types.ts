import { Filter, Measure, Attribute, Cell, QueryResultData, DataSource } from '@sisense/sdk-data';

/**
 * All the properties that fully describe a query you want to send.
 */
export type QueryDescription = {
  dataSource: DataSource;
  attributes: Attribute[];
  measures: Measure[];
  filters: Filter[];
  highlights: Filter[];
  count?: number;
  offset?: number;
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

export type MetadataItem = {
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
