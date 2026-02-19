import { TranslatableError } from '@/infra/translation/translatable-error';

export type CacheKey = string;

/**
 * Function to create cache key from params of the async function you want to cache
 */
export type CreateCacheKeyFn<AsyncFnToCache extends AsyncFn> = (
  ...params: Parameters<AsyncFnToCache>
) => CacheKey;

type AsyncFn = (...params: any[]) => Promise<any>;

export type CreateCacheFn = <AsyncFnToCache extends AsyncFn>(
  createCacheKey: CreateCacheKeyFn<AsyncFnToCache>,
  options?: CacheOptions,
) => {
  withCache: (fn: AsyncFnToCache) => AsyncFnToCache;
  clearCache: (specificKey?: CacheKey) => void;
};

type CacheMeta = {
  createdAt: Date;
};

type ReadyCacheValue<Value> = { value: Value } & CacheMeta;
type PromisedCacheValue<Value> = { valuePromise: Promise<Value> } & CacheMeta;
type CacheValue<Value> = (ReadyCacheValue<Value> | PromisedCacheValue<Value>) & CacheMeta;

function isReadyCacheValue<Value>(
  cacheValue: CacheValue<Value>,
): cacheValue is ReadyCacheValue<Value> {
  return 'value' in cacheValue;
}
function isPromisedCacheValue<Value>(
  cacheValue: CacheValue<Value>,
): cacheValue is PromisedCacheValue<Value> {
  return 'valuePromise' in cacheValue;
}

type CacheMap<Value> = Map<string, CacheValue<Value>>;
type ResolveType<AsyncFnToCache extends AsyncFn> = Awaited<ReturnType<AsyncFnToCache>>;

type CacheOptions = {
  cacheMaxSize?: number;
};

/**
 * Universal cache creator for any async function
 *
 * @param createCacheKey - function to create cache key from params of the async function you want to cache
 * @param options - optional object with cache options
 * @returns - object with two methods: withCache and clearCache.
 * "withCache" is a function that wraps the async function you want to cache.
 * "clearCache" is a function to clear the cache.
 * @example
 * const myAsyncFn = async (a: number, b: number) => a + b;
 *
 * // define here how to create cache-key for your function
 * const createExecuteQueryCacheKey: CreateCacheKeyFn<typeof myAsyncFn> = (a, b) => `${a}+${b}`;
 *
 * const { withCache, clearCache } = createCache(createExecuteQueryCacheKey);
 * const executeQueryWithCache = withCache(executeQuery);
 */
export const createCache: CreateCacheFn = <AsyncFnToCache extends AsyncFn>(
  createCacheKey: CreateCacheKeyFn<AsyncFnToCache>,
  options?: CacheOptions,
) => {
  const cache: CacheMap<ResolveType<AsyncFnToCache>> = new Map();

  const withCache = (fn: AsyncFnToCache) => {
    return (async (...params: Parameters<AsyncFnToCache>) => {
      const key = createCacheKey(...params);
      if (!cache.has(key)) {
        const resultPromise = fn(...params) as Promise<ResolveType<AsyncFnToCache>>;
        cache.set(key, { valuePromise: resultPromise, createdAt: new Date() });
        return resultPromise.then((result) => {
          cache.set(key, { value: result, createdAt: new Date() });
          if (options?.cacheMaxSize && cache.size > options.cacheMaxSize) {
            clearOldestCacheValue(cache);
          }
          return result;
        });
      } else {
        const cacheValue = cache.get(key)!;
        if (isReadyCacheValue(cacheValue)) {
          return cacheValue.value;
        } else if (isPromisedCacheValue(cacheValue)) {
          return cacheValue.valuePromise;
        }
        throw new TranslatableError('errors.unexpectedCacheValue');
      }
    }) as AsyncFnToCache;
  };

  const clearCache = (specificKey?: CacheKey) => {
    if (specificKey) {
      cache.delete(specificKey);
      return;
    }
    cache.clear();
  };

  return { withCache, clearCache };
};

/**
 * Function to clear the oldest cache value
 *
 * @param cache - cache map
 */
function clearOldestCacheValue(cache: CacheMap<any>) {
  const cacheKeys = Array.from(cache.keys());
  const oldestKey = cacheKeys.reduce((oldestKey, key) => {
    const cacheValue = cache.get(key)!;
    const oldestCacheValue = cache.get(oldestKey)!;
    return cacheValue.createdAt < oldestCacheValue.createdAt ? key : oldestKey;
  }, cacheKeys[0]);
  cache.delete(oldestKey);
}
