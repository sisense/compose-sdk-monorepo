import { QueryResultData } from '@sisense/sdk-data';
import { QueryExecutionConfig } from '@sisense/sdk-query-client';

import { QueryDescription } from '@/domains/query-execution/core/execute-query';
import {
  executeQueryWithCache,
  executeQuery as executeQueryWithoutCache,
} from '@/domains/query-execution/core/execute-query.js';
import { ClientApplication } from '@/infra/app/client-application';

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
