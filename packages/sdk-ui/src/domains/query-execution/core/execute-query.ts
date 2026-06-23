import {
  Attribute,
  DataSource,
  Measure,
  PivotAttribute,
  PivotMeasure,
  PivotQueryResultData,
  QueryResultData,
} from '@sisense/sdk-data';
import type {
  PivotQueryDescription as InternalPivotQueryDescription,
  QueryDescription as InternalQueryDescription,
  QueryExecutionConfig,
} from '@sisense/sdk-query-client';
import { getJaqlQueryPayload } from '@sisense/sdk-query-client';

import { CacheKey, createCache, CreateCacheKeyFn } from '@/shared/utils/create-cache';

import { type ClientApplication } from '../../../infra/app/types.js';
import { TranslatableError } from '../../../infra/translation/translatable-error.js';

/**
 * All the properties that fully describe a query you want to send.
 *
 * We use "dimensions" in public interface because the term is closer to the query and charting
 * as used in the industry (Sisense included).
 * internally, "dimensions" are represented by attributes as the latter is closer to the data model.
 */
export type QueryDescription = Partial<Omit<InternalQueryDescription, 'attributes'>> & {
  dimensions?: Attribute[];
};

/**
 * All the properties that fully describe a pivot query you want to send.
 *
 * We use "dimensions" in public interface because the term is closer to the query and charting
 * as used in the industry (Sisense included).
 * internally, "dimensions" are represented by attributes as the latter is closer to the data model.
 *
 */
export type PivotQueryDescription = Partial<
  Omit<InternalPivotQueryDescription, 'rowsAttributes' | 'columnsAttributes' | 'measures'>
> & {
  rows?: (Attribute | PivotAttribute)[];
  columns?: (Attribute | PivotAttribute)[];
  values?: (Measure | PivotMeasure)[];
};

/** @internal */
export const prepareQueryParams = (
  queryDescription: QueryDescription,
  defaultDataSource?: DataSource,
): InternalQueryDescription => {
  const {
    dataSource,
    dimensions = [],
    measures = [],
    filters = [],
    filterRelations,
    highlights = [],
    count,
    offset,
    ungroup,
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
    filterRelations,
    highlights,
    count,
    offset,
    ungroup,
  };
};

/** @internal */
export function executeQuery(
  queryDescription: QueryDescription,
  app: ClientApplication,
  executionConfig?: QueryExecutionConfig,
): Promise<QueryResultData> {
  const queryParams = prepareQueryParams(queryDescription, app?.defaultDataSource);
  return app.queryClient
    .executeQuery(queryParams, executionConfig)
    .resultPromise.catch((error: Error) => {
      const isSecondsTimeLevelUnsuppored = error.message.includes(
        'SecondsLevelIsNotSupportedException',
      );
      if (isSecondsTimeLevelUnsuppored) {
        throw new TranslatableError('errors.secondsDateTimeLevelIsNotSupported');
      }
      throw error;
    });
}

/** @internal */
export function executeRowCountQuery(
  queryDescription: QueryDescription,
  app: ClientApplication,
  executionConfig?: QueryExecutionConfig,
): Promise<number> {
  const queryParams = prepareQueryParams(queryDescription, app?.defaultDataSource);
  return app.queryClient.executeCountRowsQuery(queryParams, executionConfig).resultPromise;
}

/** Result of a data query executed together with its total row count. */
export type QueryResultWithRowCount = {
  data: QueryResultData;
  /**
   * Total row count of the query, ignoring `count`/`offset` paging.
   * Undefined when the total could not be retrieved.
   */
  rowCount?: number;
};

/**
 * Executes a data query together with a row count query and returns both the
 * result data and the total row count.
 *
 * A row count failure does not fail the data query: `rowCount` is left
 * undefined when the total cannot be retrieved (e.g. a Sisense instance
 * without the row count API).
 *
 * @internal
 */
export async function executeQueryWithRowCount(
  queryDescription: QueryDescription,
  app: ClientApplication,
  executionConfig?: QueryExecutionConfig,
  baseExecuteQuery: typeof executeQuery = executeQuery,
): Promise<QueryResultWithRowCount> {
  const [data, rowCount] = await Promise.all([
    baseExecuteQuery(queryDescription, app, executionConfig),
    executeRowCountQuerySoft(queryDescription, app, executionConfig),
  ]);
  return { data, rowCount };
}

/** @internal */
export const executeCsvQuery = (
  queryDescription: QueryDescription,
  app: ClientApplication,
  executionConfig?: QueryExecutionConfig,
): Promise<Blob> => {
  const queryParams = prepareQueryParams(queryDescription, app?.defaultDataSource);

  return app.queryClient.executeCsvQuery(queryParams, executionConfig).resultPromise;
};

/** @internal */
export const executePivotQuery = (
  queryDescription: PivotQueryDescription,
  app: ClientApplication,
  executionConfig?: QueryExecutionConfig,
): Promise<PivotQueryResultData> => {
  const {
    dataSource,
    rows = [],
    columns = [],
    values = [],
    grandTotals = {},
    filters = [],
    filterRelations,
    highlights = [],
    count,
    offset,
  } = queryDescription;

  if (filters) {
    filters.forEach((f) => (f.isScope = true));
  }
  if (highlights) {
    highlights.forEach((f) => (f.isScope = true));
  }

  // if data source is not explicitly specified, use the default data source
  // specified in the Sisense context provider
  const dataSourceToQuery = dataSource || app?.defaultDataSource;
  if (!dataSourceToQuery) {
    throw new TranslatableError('errors.executeQueryNoDataSource');
  }

  return app.queryClient.executePivotQuery(
    {
      dataSource: dataSourceToQuery,
      // internally, for clarity, dimensions for "rows" and "columns"
      // are represented by "rowsAttributes" and "columnsAttributes"
      rowsAttributes: rows,
      columnsAttributes: columns,
      // internally, "values" is represented by "measures", which is used in JAQL
      measures: values,
      grandTotals,
      filters,
      filterRelations,
      highlights,
      count,
      offset,
    },
    executionConfig,
  ).resultPromise;
};

const stringifyQueryPayload = (params: InternalQueryDescription) => {
  return JSON.stringify({
    ...getJaqlQueryPayload(params, false),
    queryGuid: '',
  });
};

export const createExecuteQueryCacheKey: CreateCacheKeyFn<typeof executeQuery> = (
  queryDescription,
  app,
) => {
  const queryParams = prepareQueryParams(queryDescription, app?.defaultDataSource);
  return stringifyQueryPayload(queryParams);
};

const QUERY_RESULTS_CACHE_MAX_SIZE = 250;
const { withCache, clearCache } = createCache(createExecuteQueryCacheKey, {
  cacheMaxSize: QUERY_RESULTS_CACHE_MAX_SIZE,
});
export const executeQueryWithCache = withCache(executeQuery);
export const clearExecuteQueryCache = clearCache;

type OnBeforeQueryHandler = NonNullable<QueryExecutionConfig['onBeforeQuery']>;
// WeakMap so mutator functions released by the app do not leak their ids
const onBeforeQueryDiscriminators = new WeakMap<OnBeforeQueryHandler, number>();
let nextOnBeforeQueryDiscriminator = 0;

/**
 * Returns a stable cache-key discriminator for the `onBeforeQuery` mutator instance.
 *
 * The mutator can change the JAQL payload arbitrarily, so queries with different
 * mutators must not share a cached row count. Functions are discriminated by
 * reference: a memoized mutator (as the hook docs require) keeps the row count
 * reusable across pages of the same query.
 */
function getOnBeforeQueryDiscriminator(executionConfig?: QueryExecutionConfig): string {
  const onBeforeQuery = executionConfig?.onBeforeQuery;
  if (!onBeforeQuery) {
    return '';
  }
  if (!onBeforeQueryDiscriminators.has(onBeforeQuery)) {
    onBeforeQueryDiscriminators.set(onBeforeQuery, nextOnBeforeQueryDiscriminator);
    nextOnBeforeQueryDiscriminator += 1;
  }
  return `__onBeforeQuery:${onBeforeQueryDiscriminators.get(onBeforeQuery)}`;
}

/**
 * Creates a cache key for a row count query.
 *
 * The key is page-independent: `count` and `offset` are excluded so the total
 * row count is reused across pages of the same query.
 *
 * @internal
 */
export const createRowCountQueryCacheKey: CreateCacheKeyFn<typeof executeRowCountQuery> = (
  queryDescription,
  app,
  executionConfig,
) => {
  const queryParams = prepareQueryParams(
    { ...queryDescription, count: undefined, offset: undefined },
    app?.defaultDataSource,
  );
  return stringifyQueryPayload(queryParams) + getOnBeforeQueryDiscriminator(executionConfig);
};

const ROW_COUNT_RESULTS_CACHE_MAX_SIZE = 250;
// Row count results are always cached (independently of the query cache config),
// so paging through the same query does not refetch the total on every page.
// The cache is cleared via `refetch()` of the corresponding hook.
const { withCache: withRowCountCache, clearCache: clearRowCountCache } = createCache(
  createRowCountQueryCacheKey,
  { cacheMaxSize: ROW_COUNT_RESULTS_CACHE_MAX_SIZE },
);
const executeRowCountQueryWithCache = withRowCountCache(executeRowCountQuery);

// Registry of already-warned row count failures: error signatures seen per cache key.
// Failed row count requests are not cached, so without it every page of a query
// against a server without the row count API would repeat the same warning.
// Keyed by the exact cache key (one cache key can be a string prefix of another,
// e.g. with the `onBeforeQuery` discriminator appended, so prefix matching is unsafe).
const ROW_COUNT_WARNINGS_MAX_SIZE = 100;
const warnedRowCountFailures = new Map<CacheKey, Set<string>>();

/** @internal */
export const clearRowCountQueryCache = (specificKey?: CacheKey) => {
  // Re-arm the warning together with the cache eviction: a deliberate retry
  // (e.g. `refetch()`) should surface the failure again if it persists.
  if (specificKey) {
    warnedRowCountFailures.delete(specificKey);
  } else {
    warnedRowCountFailures.clear();
  }
  clearRowCountCache(specificKey);
};

function warnRowCountFailureOnce(cacheKey: CacheKey, error: unknown): void {
  const errorSignature = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  if (warnedRowCountFailures.get(cacheKey)?.has(errorSignature)) {
    return;
  }
  if (warnedRowCountFailures.size >= ROW_COUNT_WARNINGS_MAX_SIZE) {
    warnedRowCountFailures.clear();
  }
  const warnedSignatures = warnedRowCountFailures.get(cacheKey) ?? new Set<string>();
  warnedSignatures.add(errorSignature);
  warnedRowCountFailures.set(cacheKey, warnedSignatures);
  console.warn('Failed to retrieve the total row count of the query.', error);
}

/**
 * Executes a row count query with a soft failure mode: resolves to `undefined`
 * instead of rejecting when the total cannot be retrieved.
 *
 * A failed request is evicted from the cache (the cache keeps rejected
 * promises otherwise), so the next query retries the row count.
 *
 * @internal
 */
async function executeRowCountQuerySoft(
  queryDescription: QueryDescription,
  app: ClientApplication,
  executionConfig?: QueryExecutionConfig,
): Promise<number | undefined> {
  try {
    return await executeRowCountQueryWithCache(queryDescription, app, executionConfig);
  } catch (error) {
    const cacheKey = createRowCountQueryCacheKey(queryDescription, app, executionConfig);
    // Evict only the cache entry here: re-arming the warning registry is reserved
    // for external clears (e.g. `refetch()`), otherwise every retry would re-warn.
    clearRowCountCache(cacheKey);
    warnRowCountFailureOnce(cacheKey, error);
    return undefined;
  }
}
