export const executeQuery = vi.fn();
export const executeQueryWithCache = vi.fn();
export const clearExecuteQueryCache = vi.fn();
export const createExecuteQueryCacheKey = vi.fn();
export const executeCsvQuery = vi.fn();
export const executePivotQuery = vi.fn();

export const executeQueryMock = executeQuery;
export const executeQueryWithCacheMock = executeQueryWithCache;
export const clearExecuteQueryCacheMock = clearExecuteQueryCache;
export const createExecuteQueryCacheKeyMock = createExecuteQueryCacheKey;
export const executeCsvQueryMock = executeCsvQuery;
export const executePivotQueryMock = executePivotQuery;
