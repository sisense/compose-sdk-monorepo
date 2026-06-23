/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { filterFactory, measureFactory } from '@sisense/sdk-data';
import type { QueryExecutionConfig } from '@sisense/sdk-query-client';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { translation } from '@/infra/translation/resources/en';

import { type ClientApplication } from '../../../index.js';
import {
  clearRowCountQueryCache,
  createExecuteQueryCacheKey,
  createRowCountQueryCacheKey,
  executeCsvQuery,
  executePivotQuery,
  executeQuery,
  executeQueryWithRowCount,
  executeRowCountQuery,
} from './execute-query.js';

const app = {
  queryClient: {
    executeQuery: vi.fn(),
    executeCountRowsQuery: vi.fn(),
    executeCsvQuery: vi.fn(),
    executePivotQuery: vi.fn(),
  },
};

describe('executeQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  describe(`executeQuery`, () => {
    it('should throw "seconds level supported for live datasource only" error', async () => {
      app.queryClient.executeQuery.mockReturnValue({
        resultPromise: Promise.reject({ message: 'SecondsLevelIsNotSupportedException' }),
      });

      await expect(async () => {
        await executeQuery(
          {
            dataSource: DM.DataSource,
            dimensions: [DM.Commerce.Date.Seconds],
            measures: [],
            filters: [filterFactory.members(DM.Commerce.Gender, ['Female'])],
            highlights: [filterFactory.members(DM.Commerce.AgeRange, ['18-24'])],
          },
          app as unknown as ClientApplication,
        );
      }).rejects.toThrow(translation.errors.secondsDateTimeLevelIsNotSupported);
    });
    it('should call executeQuery from queryClient', async () => {
      app.queryClient.executeQuery.mockReturnValue({
        resultPromise: Promise.resolve({}),
      });

      const result = await executeQuery(
        {
          dataSource: DM.DataSource,
          dimensions: [DM.Commerce.Condition],
          measures: [measureFactory.sum(DM.Commerce.Cost)],
          filters: [filterFactory.members(DM.Commerce.AgeRange, ['18-24'], { guid: 'test-id' })],
          highlights: [filterFactory.members(DM.Commerce.Gender, ['Male'], { guid: 'test-id' })],
        },
        app as unknown as ClientApplication,
      );

      expect(result).toEqual({});
      expect(app.queryClient.executeQuery).toHaveBeenCalledOnce();
      expect(app.queryClient.executeQuery.mock.calls[0]).toMatchSnapshot();
    });
    it('should throw error in dataSource and defaultDataSource are not provided', async () => {
      await expect(async () => {
        await executeQuery(
          {
            dataSource: undefined,
            dimensions: [],
            measures: [],
            filters: [],
            highlights: [],
          },
          app as unknown as ClientApplication,
        );
      }).rejects.toThrow('No dataSource provided to execute query');
    });
  });
  describe('executeCsvQuery', () => {
    it('should call executeCsvQuery from queryClient and return Blob', async () => {
      app.queryClient.executeCsvQuery.mockReturnValue({
        resultPromise: Promise.resolve(new Blob()),
      });

      const result = await executeCsvQuery(
        {
          dataSource: DM.DataSource,
          dimensions: [DM.Commerce.Condition],
          measures: [measureFactory.sum(DM.Commerce.Cost)],
          filters: [filterFactory.members(DM.Commerce.AgeRange, ['18-24'])],
          highlights: [filterFactory.members(DM.Commerce.Gender, ['Male'])],
        },
        app as unknown as ClientApplication,
      );

      expect(result).toBeInstanceOf(Blob);
    });
  });
  describe('executePivotQuery', () => {
    it('should call executePivotQuery from queryClient with correct args', async () => {
      app.queryClient.executePivotQuery.mockReturnValue({
        resultPromise: Promise.resolve({}),
      });

      const result = await executePivotQuery(
        {
          dataSource: DM.DataSource,
          rows: [DM.Commerce.Condition],
          columns: [DM.Commerce.AgeRange],
          values: [measureFactory.sum(DM.Commerce.Cost)],
          grandTotals: {},
          filters: [filterFactory.members(DM.Commerce.Gender, ['Female'], { guid: 'test-id' })],
          highlights: [filterFactory.members(DM.Commerce.AgeRange, ['18-24'], { guid: 'test-id' })],
        },
        app as unknown as ClientApplication,
      );

      expect(result).toEqual({});
      expect(app.queryClient.executePivotQuery).toHaveBeenCalledOnce();
      expect(app.queryClient.executePivotQuery.mock.calls[0]).toMatchSnapshot();
    });

    it('should throw error in dataSource and defaultDataSource are not provided', async () => {
      await expect(async () => {
        await executePivotQuery(
          {
            dataSource: undefined,
            rows: [],
            columns: [],
            values: [],
            grandTotals: {},
            filters: [],
            highlights: [],
          },
          app as unknown as ClientApplication,
        );
      }).rejects.toThrow('No dataSource provided to execute query');
    });
  });
  describe('createExecuteQueryCacheKey', () => {
    it('should return cache key', () => {
      const cacheKey = createExecuteQueryCacheKey(
        {
          dataSource: DM.DataSource,
          dimensions: [DM.Commerce.Condition],
          measures: [measureFactory.sum(DM.Commerce.Cost)],
          filters: [filterFactory.members(DM.Commerce.AgeRange, ['18-24'], { guid: 'test-id' })],
          highlights: [filterFactory.members(DM.Commerce.Gender, ['Male'], { guid: 'test-id' })],
        },
        app as unknown as ClientApplication,
      );

      expect(cacheKey).toMatchSnapshot();
    });
  });

  describe('executeRowCountQuery', () => {
    it('should call executeCountRowsQuery from queryClient and resolve with the count', async () => {
      app.queryClient.executeCountRowsQuery.mockReturnValue({
        resultPromise: Promise.resolve(1234),
      });

      const result = await executeRowCountQuery(
        {
          dataSource: DM.DataSource,
          dimensions: [DM.Commerce.Condition],
          measures: [measureFactory.sum(DM.Commerce.Cost)],
          filters: [],
          highlights: [],
        },
        app as unknown as ClientApplication,
      );

      expect(result).toBe(1234);
      expect(app.queryClient.executeCountRowsQuery).toHaveBeenCalledOnce();
    });
  });

  describe('createRowCountQueryCacheKey', () => {
    const baseQueryDescription = {
      dataSource: DM.DataSource,
      dimensions: [DM.Commerce.Condition],
      measures: [measureFactory.sum(DM.Commerce.Cost)],
      filters: [],
      highlights: [],
    };

    it('should return the same key regardless of count and offset', () => {
      const key1 = createRowCountQueryCacheKey(
        { ...baseQueryDescription, count: 10, offset: 0 },
        app as unknown as ClientApplication,
      );
      const key2 = createRowCountQueryCacheKey(
        { ...baseQueryDescription, count: 10, offset: 10 },
        app as unknown as ClientApplication,
      );
      const key3 = createRowCountQueryCacheKey(
        { ...baseQueryDescription, count: 25, offset: 100 },
        app as unknown as ClientApplication,
      );

      expect(key1).toBe(key2);
      expect(key2).toBe(key3);
    });

    it('should return different keys for different queries', () => {
      const key1 = createRowCountQueryCacheKey(
        baseQueryDescription,
        app as unknown as ClientApplication,
      );
      const key2 = createRowCountQueryCacheKey(
        { ...baseQueryDescription, dimensions: [DM.Commerce.AgeRange] },
        app as unknown as ClientApplication,
      );

      expect(key1).not.toBe(key2);
    });

    it('should return different keys for different onBeforeQuery mutators', () => {
      const key1 = createRowCountQueryCacheKey(
        baseQueryDescription,
        app as unknown as ClientApplication,
        { onBeforeQuery: (jaql) => jaql },
      );
      const key2 = createRowCountQueryCacheKey(
        baseQueryDescription,
        app as unknown as ClientApplication,
        { onBeforeQuery: (jaql) => jaql },
      );
      const key3 = createRowCountQueryCacheKey(
        baseQueryDescription,
        app as unknown as ClientApplication,
      );

      expect(key1).not.toBe(key2);
      expect(key1).not.toBe(key3);
    });

    it('should return the same key for the same onBeforeQuery mutator regardless of paging', () => {
      const onBeforeQuery: NonNullable<QueryExecutionConfig['onBeforeQuery']> = (jaql) => jaql;

      const key1 = createRowCountQueryCacheKey(
        { ...baseQueryDescription, count: 10, offset: 0 },
        app as unknown as ClientApplication,
        { onBeforeQuery },
      );
      const key2 = createRowCountQueryCacheKey(
        { ...baseQueryDescription, count: 10, offset: 10 },
        app as unknown as ClientApplication,
        { onBeforeQuery },
      );

      expect(key1).toBe(key2);
    });
  });

  describe('executeQueryWithRowCount', () => {
    const queryDescription = {
      dataSource: DM.DataSource,
      dimensions: [DM.Commerce.Condition],
      measures: [measureFactory.sum(DM.Commerce.Cost)],
      filters: [],
      highlights: [],
      count: 10,
      offset: 0,
    };

    beforeEach(() => {
      clearRowCountQueryCache();
      app.queryClient.executeQuery.mockReturnValue({
        resultPromise: Promise.resolve({ columns: [], rows: [] }),
      });
    });

    it('should return the data and the total row count', async () => {
      app.queryClient.executeCountRowsQuery.mockReturnValue({
        resultPromise: Promise.resolve(1234),
      });

      const result = await executeQueryWithRowCount(
        queryDescription,
        app as unknown as ClientApplication,
      );

      expect(result).toEqual({ data: { columns: [], rows: [] }, rowCount: 1234 });
    });

    it('should reuse the cached row count across pages of the same query', async () => {
      app.queryClient.executeCountRowsQuery.mockReturnValue({
        resultPromise: Promise.resolve(1234),
      });

      const firstPage = await executeQueryWithRowCount(
        queryDescription,
        app as unknown as ClientApplication,
      );
      const secondPage = await executeQueryWithRowCount(
        { ...queryDescription, offset: 10 },
        app as unknown as ClientApplication,
      );

      expect(firstPage.rowCount).toBe(1234);
      expect(secondPage.rowCount).toBe(1234);
      expect(app.queryClient.executeQuery).toHaveBeenCalledTimes(2);
      expect(app.queryClient.executeCountRowsQuery).toHaveBeenCalledOnce();
    });

    it('should not reuse the cached row count across different onBeforeQuery mutators', async () => {
      app.queryClient.executeCountRowsQuery.mockReturnValue({
        resultPromise: Promise.resolve(1234),
      });

      await executeQueryWithRowCount(queryDescription, app as unknown as ClientApplication, {
        onBeforeQuery: (jaql) => jaql,
      });
      await executeQueryWithRowCount(queryDescription, app as unknown as ClientApplication, {
        onBeforeQuery: (jaql) => jaql,
      });

      expect(app.queryClient.executeCountRowsQuery).toHaveBeenCalledTimes(2);
    });

    it('should resolve with undefined rowCount when the row count query fails', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      app.queryClient.executeCountRowsQuery.mockImplementation(() => ({
        resultPromise: Promise.reject(new Error('Row count API is not supported')),
      }));

      const result = await executeQueryWithRowCount(
        queryDescription,
        app as unknown as ClientApplication,
      );

      expect(result.data).toEqual({ columns: [], rows: [] });
      expect(result.rowCount).toBeUndefined();
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it('should warn only once for repeated identical row count failures', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      app.queryClient.executeCountRowsQuery.mockImplementation(() => ({
        resultPromise: Promise.reject(new Error('Row count API is not supported')),
      }));

      await executeQueryWithRowCount(queryDescription, app as unknown as ClientApplication);
      await executeQueryWithRowCount(
        { ...queryDescription, offset: 10 },
        app as unknown as ClientApplication,
      );

      expect(app.queryClient.executeCountRowsQuery).toHaveBeenCalledTimes(2);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      consoleWarnSpy.mockRestore();
    });

    it('should re-arm the warning only for the exactly cleared cache key', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      app.queryClient.executeCountRowsQuery.mockImplementation(() => ({
        resultPromise: Promise.reject(new Error('Row count API is not supported')),
      }));
      const onBeforeQuery: NonNullable<QueryExecutionConfig['onBeforeQuery']> = (jaql) => jaql;

      await executeQueryWithRowCount(queryDescription, app as unknown as ClientApplication, {
        onBeforeQuery,
      });
      // The mutator-less key of the same query is a string prefix of the mutator
      // variant key; clearing it must not re-arm the mutator variant warning.
      clearRowCountQueryCache(
        createRowCountQueryCacheKey(queryDescription, app as unknown as ClientApplication),
      );
      await executeQueryWithRowCount(queryDescription, app as unknown as ClientApplication, {
        onBeforeQuery,
      });
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);

      // Clearing the exact key re-arms the warning.
      clearRowCountQueryCache(
        createRowCountQueryCacheKey(queryDescription, app as unknown as ClientApplication, {
          onBeforeQuery,
        }),
      );
      await executeQueryWithRowCount(queryDescription, app as unknown as ClientApplication, {
        onBeforeQuery,
      });
      expect(consoleWarnSpy).toHaveBeenCalledTimes(2);

      consoleWarnSpy.mockRestore();
    });

    it('should not cache a failed row count request', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      app.queryClient.executeCountRowsQuery
        .mockImplementationOnce(() => ({
          resultPromise: Promise.reject(new Error('Transient error')),
        }))
        .mockImplementationOnce(() => ({
          resultPromise: Promise.resolve(1234),
        }));

      const firstResult = await executeQueryWithRowCount(
        queryDescription,
        app as unknown as ClientApplication,
      );
      const secondResult = await executeQueryWithRowCount(
        queryDescription,
        app as unknown as ClientApplication,
      );

      expect(firstResult.rowCount).toBeUndefined();
      expect(secondResult.rowCount).toBe(1234);
      expect(app.queryClient.executeCountRowsQuery).toHaveBeenCalledTimes(2);
      consoleWarnSpy.mockRestore();
    });

    it('should use the provided base execute query function', async () => {
      const baseExecuteQuery = vi.fn().mockResolvedValue({ columns: [], rows: [] });
      app.queryClient.executeCountRowsQuery.mockReturnValue({
        resultPromise: Promise.resolve(1),
      });

      const result = await executeQueryWithRowCount(
        queryDescription,
        app as unknown as ClientApplication,
        undefined,
        baseExecuteQuery,
      );

      expect(baseExecuteQuery).toHaveBeenCalledOnce();
      expect(app.queryClient.executeQuery).not.toHaveBeenCalled();
      expect(result).toEqual({ data: { columns: [], rows: [] }, rowCount: 1 });
    });
  });
});
