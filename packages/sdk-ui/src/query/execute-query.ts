import { Attribute, QueryResultData } from '@sisense/sdk-data';
import type {
  QueryDescription as InternalQueryDescription,
  QueryExecutionConfig,
} from '@sisense/sdk-query-client';
import { ClientApplication } from '../app/client-application';
import { TranslatableError } from '../translation/translatable-error';

/**
 * All the properties that fully describe a query you want to send.
 *
 * We use "dimensions" it public interface because the term is closer to the query and charting
 * as used in the industry (Sisense included).
 * internally, "dimensions" are represented by attributes as the latter is closer to the data model.
 */
export type QueryDescription = Partial<Omit<InternalQueryDescription, 'attributes'>> & {
  dimensions?: Attribute[];
};

/** @internal */
export const QUERY_DEFAULT_LIMIT = 20000;
/** @internal */
export const QUERY_DEFAULT_OFFSET = 0;

/** @internal */
const prepareQueryParams = (
  queryDescription: QueryDescription,
  defaultDataSource: string,
): InternalQueryDescription => {
  const {
    dataSource,
    dimensions = [],
    measures = [],
    filters = [],
    highlights = [],
    count = QUERY_DEFAULT_LIMIT,
    offset = QUERY_DEFAULT_OFFSET,
  } = queryDescription;

  if (filters) {
    filters.forEach((f) => (f.isScope = true));
  }
  if (highlights) {
    highlights.forEach((f) => (f.isScope = true));
  }

  // if data source is not explicitly specified, use the default data source
  // specified in the Sisense context provider
  const dataSourceToQuery = dataSource || defaultDataSource;
  if (!dataSourceToQuery) {
    throw new TranslatableError('errors.executeQueryNoDataSource');
  }

  return {
    dataSource: dataSourceToQuery,
    attributes: dimensions, // internally, dimensions are represented by attributes
    measures,
    filters,
    highlights,
    count,
    offset,
  };
};

/** @internal */
export const executeQuery = (
  queryDescription: QueryDescription,
  app: ClientApplication,
  executionConfig?: QueryExecutionConfig,
): Promise<QueryResultData> => {
  const queryParams = prepareQueryParams(queryDescription, app?.defaultDataSource);

  return app.queryClient.executeQuery(queryParams, executionConfig).resultPromise;
};

/** @internal */
export const executeCsvQuery = (
  queryDescription: QueryDescription,
  app: ClientApplication,
  executionConfig?: QueryExecutionConfig,
): Promise<Blob> => {
  const queryParams = prepareQueryParams(queryDescription, app?.defaultDataSource);

  return app.queryClient.executeCsvQuery(queryParams, executionConfig).resultPromise;
};
