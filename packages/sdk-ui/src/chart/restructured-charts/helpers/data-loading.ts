import { ClientApplication } from '@/app/client-application';
import { QueryDescription } from '@/query/execute-query';
import { QueryResultData } from '@ethings-os/sdk-data';
import { QueryExecutionConfig } from '@ethings-os/sdk-query-client';
import {
  executeQueryWithCache,
  executeQuery as executeQueryWithoutCache,
} from '@/query/execute-query.js';

/**
 * Load data by a regular single query execution.
 */
export function loadDataBySingleQuery(options: {
  app: ClientApplication;
  queryDescription: QueryDescription;
  executionConfig?: QueryExecutionConfig | undefined;
}): Promise<QueryResultData> {
  const { app, queryDescription, executionConfig } = options;
  const isCacheEnabled = app?.settings.queryCacheConfig?.enabled ?? false;
  const executeQuery = isCacheEnabled ? executeQueryWithCache : executeQueryWithoutCache;
  return executeQuery(queryDescription, app, executionConfig);
}
