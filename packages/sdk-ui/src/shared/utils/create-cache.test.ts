/* eslint-disable @typescript-eslint/require-await */
import { CacheKey, createCache, CreateCacheKeyFn } from './create-cache';

describe('createCache', () => {
  // Mocked execution counter
  let executionCounter = 0;
  let withCache: (fn: (param: number) => Promise<string>) => (param: number) => Promise<string>;
  let clearCache: (specificKey?: CacheKey | undefined) => void;

  // Mock async function for testing
  const asyncFn = async (param: number) => {
    executionCounter++;
    return `execution result of ${param}`;
  };

  // Mock implementation of CreateCacheKeyFn
  const createCacheKey: CreateCacheKeyFn<typeof asyncFn> = (param: number) => `key-${param}`;

  // Mock cache keys
  const key1 = createCacheKey(1);

  beforeEach(() => {
    // Initialize cache
    const { withCache: createdWithCache, clearCache: createdClearCache } =
      createCache(createCacheKey);
    withCache = createdWithCache;
    clearCache = createdClearCache;
    executionCounter = 0;
  });

  it('should cache results properly', async () => {
    // Cache results
    const cachedFn = withCache(asyncFn);

    // Execute the function multiple times with the same parameter
    const result1 = await cachedFn(1);
    const result2 = await cachedFn(1);
    const result3 = await cachedFn(1);

    // Check if all results are the same
    expect(result1).toBe('execution result of 1');
    expect(result2).toBe('execution result of 1');
    expect(result3).toBe('execution result of 1');

    // Check if the function was called only once
    expect(executionCounter).toBe(1);
  });

  it('should clear cache properly', async () => {
    // Cache results
    const cachedFn = withCache(asyncFn);

    // Execute the function with different parameters
    const result1 = await cachedFn(1);
    const result2 = await cachedFn(2);

    // Check if results are correct
    expect(result1).toBe('execution result of 1');
    expect(result2).toBe('execution result of 2');

    // Clear cache for a specific key
    clearCache(key1);

    // Execute the function with the same parameter again
    const result3 = await cachedFn(1);
    const result4 = await cachedFn(2);

    // Check if the result is recomputed
    expect(result3).toBe('execution result of 1');
    expect(result4).toBe('execution result of 2');

    // Check if the function was called again due to cache clearance
    expect(executionCounter).toBe(3);
  });

  it('should clear entire cache properly', async () => {
    // Cache results
    const cachedFn = withCache(asyncFn);

    // Execute the function with different parameters
    const result1 = await cachedFn(1);
    const result2 = await cachedFn(2);

    // Check if results are correct
    expect(result1).toBe('execution result of 1');
    expect(result2).toBe('execution result of 2');

    // Clear entire cache
    clearCache();

    // Execute the function with the same parameters again
    const result3 = await cachedFn(1);
    const result4 = await cachedFn(2);

    // Check if results are recomputed
    expect(result3).toBe('execution result of 1');
    expect(result4).toBe('execution result of 2');

    // Check if the function was called again due to cache clearance
    expect(executionCounter).toBe(4);
  });

  it('should group simultaneous calls with the same params into a single execution', async () => {
    // Async function with external resolver
    let resolvePromiseFromOutside: (value?: string) => void;
    const asyncFnWithExternalResolver = async () => {
      return new Promise((resolve) => {
        executionCounter++;
        resolvePromiseFromOutside = resolve;
      }).then(() => 'execution result');
    };
    const cachedFn = withCache(asyncFnWithExternalResolver);

    // Execute the function twice with the same parameter simultaneously
    const resultPromise = cachedFn(1);
    const resultPromise2 = cachedFn(1);

    // Resolve the promise
    resolvePromiseFromOutside!();
    const result = await resultPromise;
    const result2 = await resultPromise2;

    // Check if the function was called only once for both promises
    expect(executionCounter).toBe(1);
    expect(result).toBe('execution result');
    expect(result2).toBe(result);
  });
});
