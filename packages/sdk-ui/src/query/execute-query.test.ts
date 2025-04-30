/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { type ClientApplication } from '..';
import {
  executeQuery,
  executeCsvQuery,
  createExecuteQueryCacheKey,
  executePivotQuery,
} from './execute-query';
import { translation } from '@/translation/resources/en';
import * as DM from '@/__test-helpers__/sample-ecommerce';
import { filterFactory, measureFactory } from '@sisense/sdk-data';

const app = {
  queryClient: {
    executeQuery: vi.fn(),
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
      }).rejects.toThrow(translation.errors.secondsDateTimeLevelSupportedOnlyForLive);
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
});
