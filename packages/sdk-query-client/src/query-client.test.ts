/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/unbound-method */
import {
  Attribute,
  createAttribute,
  DimensionalAttribute,
  EMPTY_PIVOT_QUERY_RESULT_DATA,
  Filter,
  Measure,
  QueryResultData,
} from '@ethings-os/sdk-data';
import { PivotClient } from '@ethings-os/sdk-pivot-client';
import { HttpClient } from '@ethings-os/sdk-rest-client';
import type { Mocked } from 'vitest';

import {
  ExecuteJaqlTestDataset,
  getExecuteJaqlTestDataset,
} from './__test-helpers__/execute-jaql-test-dataset-loader.js';
import {
  ExecutePivotJaqlTestDataset,
  getExecutePivotJaqlTestDataset,
} from './__test-helpers__/execute-pivot-jaql-test-dataset-loader.js';
import {
  DatasourceFieldsTestDataset,
  getDatasourceFieldsTestDataset,
} from './__test-helpers__/get-datasource-fields-test-dataset-loader.js';
import {
  DimensionalQueryClient,
  QUERY_DEFAULT_LIMIT,
  validateQueryDescription,
} from './query-client.js';
import { JaqlQueryPayload, PivotQueryDescription, QueryDescription } from './types.js';

describe('DimensionalQueryClient', () => {
  let httpClientMock: Mocked<HttpClient>;
  let pivotClientMock: Mocked<PivotClient>;
  let queryClient: DimensionalQueryClient;

  beforeEach(() => {
    httpClientMock = {
      post: vi.fn().mockResolvedValue({}),
      get: vi.fn().mockResolvedValue({}),
    } as unknown as Mocked<HttpClient>;
    pivotClientMock = {
      queryData: vi.fn().mockResolvedValue(EMPTY_PIVOT_QUERY_RESULT_DATA),
    } as unknown as Mocked<PivotClient>;
    queryClient = new DimensionalQueryClient(httpClientMock, pivotClientMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('executeQuery', () => {
    let testDataset: ExecuteJaqlTestDataset;

    beforeAll(() => {
      testDataset = getExecuteJaqlTestDataset();
    });

    describe('for all test samples', () => {
      // all tests must be added synchronously and can't be added in runtime,
      // so we need to have single 'it' for testing all data-samples
      it('should execute the query and resolve with the result', async () => {
        for await (const testSample of testDataset) {
          const queryDescription = testSample.queryInput;
          const expectedJaqlRequestBody: JaqlQueryPayload = {
            ...testSample.testJaqlData?.requestBody,
            queryGuid: expect.any(String) as string,
            datasource: { title: queryDescription.dataSource, live: false },
            by: 'ComposeSDK',
          } as JaqlQueryPayload;
          const expectedQueryResultData: QueryResultData =
            testSample.testJaqlData.expectedQueryResultData;
          httpClientMock.post.mockResolvedValue(testSample.testJaqlData?.expectedResponse);
          const queryResultData = await queryClient.executeQuery(queryDescription).resultPromise;
          expect(queryResultData).toStrictEqual(expectedQueryResultData);
          expect(httpClientMock.post).toHaveBeenCalledWith(
            expect.any(String),
            expectedJaqlRequestBody,
            undefined,
            expect.any(AbortSignal),
          );
        }
      });
    });
    it("should call 'onBeforeQuery' callback if it passed in config", async () => {
      const onBeforeQuery = vi.fn();
      const queryDescription: QueryDescription = {
        dataSource: 'test',
        attributes: [new DimensionalAttribute('AgeRange', '[Commerce.Age Range]', 'attribute')],
        measures: [],
        filters: [],
        highlights: [],
      };
      const executionResult = queryClient.executeQuery(queryDescription, { onBeforeQuery });
      expect(executionResult.resultPromise).toBeInstanceOf(Promise);
      await executionResult.resultPromise;
      expect(onBeforeQuery).toHaveBeenCalledOnce();
    });

    it('should cancel the query execution', async () => {
      const queryDescription: QueryDescription = testDataset[0].queryInput;
      const executionResult = queryClient.executeQuery(queryDescription);
      expect(executionResult.resultPromise).toBeInstanceOf(Promise);
      const cancelingReason = 'BECAUSE I CAN!';
      executionResult.cancel(cancelingReason);
      await expect(executionResult.resultPromise).rejects.toThrow(new RegExp(cancelingReason));
    });
  });

  describe('executeCsvQuery', () => {
    let testDataset: ExecuteJaqlTestDataset;

    beforeAll(() => {
      testDataset = getExecuteJaqlTestDataset();
    });

    describe('for all test samples', () => {
      // all tests must be added synchronously and can't be added in runtime,
      // so we need to have single 'it' for testing all data-samples
      it('should execute the query and resolve with the result', async () => {
        for await (const testSample of testDataset) {
          const queryDescription = testSample.queryInput;
          const expectedCsvQueryResultData = testSample.testJaqlData.expectedCsvQueryResultData;
          const expectedHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
          const expectedConfig = { nonJSONBody: true, returnBlob: true };
          const mockData = new Blob([expectedCsvQueryResultData], { type: 'text/csv' });
          httpClientMock.post.mockResolvedValue(mockData);
          const queryResultData = await queryClient.executeCsvQuery(queryDescription).resultPromise;
          expect(queryResultData).toStrictEqual(mockData);
          expect(httpClientMock.post).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(URLSearchParams),
            { headers: expectedHeaders },
            expect.any(AbortSignal),
            expectedConfig,
          );
        }
      });
    });
    it("should call 'onBeforeQuery' callback if it passed in config", async () => {
      const onBeforeQuery = vi.fn();
      const queryDescription: QueryDescription = {
        dataSource: 'test',
        attributes: [new DimensionalAttribute('AgeRange', '[Commerce.Age Range]', 'attribute')],
        measures: [],
        filters: [],
        highlights: [],
      };
      const executionResult = queryClient.executeCsvQuery(queryDescription, { onBeforeQuery });
      expect(executionResult.resultPromise).toBeInstanceOf(Promise);
      await executionResult.resultPromise;
      expect(onBeforeQuery).toHaveBeenCalledOnce();
    });

    it('should cancel the query execution', async () => {
      const queryDescription: QueryDescription = testDataset[0].queryInput;
      const executionResult = queryClient.executeCsvQuery(queryDescription);
      expect(executionResult.resultPromise).toBeInstanceOf(Promise);
      const cancelingReason = 'BECAUSE I CAN!';
      executionResult.cancel(cancelingReason);
      await expect(executionResult.resultPromise).rejects.toThrow(new RegExp(cancelingReason));
    });
  });

  describe('executePivotQuery', () => {
    let testDataset: ExecutePivotJaqlTestDataset;

    beforeAll(() => {
      testDataset = getExecutePivotJaqlTestDataset();
    });

    describe('for all test samples', () => {
      // all tests must be added synchronously and can't be added in runtime,
      // so we need to have single 'it' for testing all data-samples
      it('should execute the pivot query and resolve with the result', async () => {
        for await (const testSample of testDataset) {
          const queryDescription = testSample.queryInput;
          const expectedJaqlRequestBody: JaqlQueryPayload = {
            ...testSample.testPivotJaqlData?.requestBody,
            queryGuid: expect.any(String) as string,
            datasource: { title: queryDescription.dataSource, live: false },
            by: 'ComposeSDK',
          } as JaqlQueryPayload;
          const queryResultData = await queryClient.executePivotQuery(queryDescription)
            .resultPromise;
          expect(queryResultData).toStrictEqual(EMPTY_PIVOT_QUERY_RESULT_DATA);
          expect(pivotClientMock.queryData).toHaveBeenCalledWith(
            expectedJaqlRequestBody,
            true,
            QUERY_DEFAULT_LIMIT,
            false,
          );
        }
      });
    });
    it("should call 'onBeforeQuery' callback if it passed in config", async () => {
      const onBeforeQuery = vi.fn();
      const queryDescription: PivotQueryDescription = {
        dataSource: 'test',
        rowsAttributes: [new DimensionalAttribute('AgeRange', '[Commerce.Age Range]', 'attribute')],
        columnsAttributes: [],
        measures: [],
        grandTotals: {},
        filters: [],
        highlights: [],
      };
      const executionResult = queryClient.executePivotQuery(queryDescription, { onBeforeQuery });
      expect(executionResult.resultPromise).toBeInstanceOf(Promise);
      await executionResult.resultPromise;
      expect(onBeforeQuery).toHaveBeenCalledOnce();
    });

    it('should cancel the query execution', async () => {
      const queryDescription: PivotQueryDescription = testDataset[0].queryInput;
      const executionResult = queryClient.executePivotQuery(queryDescription);
      expect(executionResult.resultPromise).toBeInstanceOf(Promise);
      const cancelingReason = 'BECAUSE I CAN!';
      await executionResult.cancel(cancelingReason);
      await expect(executionResult.resultPromise).rejects.toThrow(new RegExp(cancelingReason));
    });
  });

  describe('getDataSourceFields', () => {
    let testDataset: DatasourceFieldsTestDataset;

    beforeAll(() => {
      testDataset = getDatasourceFieldsTestDataset();
    });

    it('should resolve the data source fields', async () => {
      for await (const testSample of testDataset) {
        httpClientMock.post.mockResolvedValue(testSample.fields);
        const gotDataSourceFields = await queryClient.getDataSourceFields(testSample.datasource);
        expect(gotDataSourceFields).toEqual(testSample.fields);
      }
    });

    it('should handle empty response', async () => {
      httpClientMock.post.mockResolvedValue(undefined);
      const gotDataSourceFields = await queryClient.getDataSourceFields(testDataset[0].datasource);
      expect(gotDataSourceFields.length).toBe(0);
    });
  });

  describe('getDataSourceSchema', () => {
    it('should resolve the data source schema', async () => {
      const testValue = {};
      httpClientMock.get.mockResolvedValueOnce(testValue);
      const gotDataSourceSchema = await queryClient.getDataSourceSchema('test');
      expect(gotDataSourceSchema).toBe(testValue);
    });

    it('should handle empty response', async () => {
      httpClientMock.get.mockResolvedValue(undefined);
      const gotDataSourceSchema = await queryClient.getDataSourceSchema('test');
      expect(gotDataSourceSchema).toBeUndefined();
    });
  });

  describe('getDataSourceList', () => {
    it('should resolve the data source list', async () => {
      const testValue = {};
      httpClientMock.get.mockResolvedValueOnce(testValue);
      const gotDataSourceSchema = await queryClient.getDataSourceList();
      expect(gotDataSourceSchema).toBe(testValue);
    });

    it('should handle empty response', async () => {
      httpClientMock.get.mockResolvedValue(undefined);
      const gotDataSourceFields = await queryClient.getDataSourceList();
      expect(gotDataSourceFields.length).toBe(0);
    });
  });

  describe('validateQueryDescription', () => {
    const baseQueryDescription: QueryDescription = {
      dataSource: 'test',
      attributes: [],
      measures: [],
      filters: [],
      highlights: [],
    };

    it('should throw when no attribute and measure', async () => {
      await expect(queryClient.executeQuery(baseQueryDescription).resultPromise).rejects.toThrow();
    });

    it('should throw when invalid attributes', async () => {
      const queryDescription: QueryDescription = {
        ...baseQueryDescription,
        attributes: [
          {
            name: 'Years',
            type: 'date',
          } as Attribute,
        ],
      };
      await expect(queryClient.executeQuery(queryDescription).resultPromise).rejects.toThrow();
    });

    it('should throw when invalid measures', async () => {
      const queryDescription: QueryDescription = {
        ...baseQueryDescription,
        measures: [
          {
            name: 'Quantity',
            aggregation: 'sum',
            title: 'Total Quantity',
            enabled: true,
          } as unknown as Measure,
        ],
      };
      await expect(queryClient.executeQuery(queryDescription).resultPromise).rejects.toThrow();
    });

    it('should throw when invalid count', async () => {
      const queryDescription: QueryDescription = {
        ...baseQueryDescription,
        attributes: [
          createAttribute({
            name: 'BrandID',
            type: 'numeric-attribute',
            expression: '[Commerce.Brand ID]',
          }),
        ],
        count: -100,
      };
      await expect(queryClient.executeQuery(queryDescription).resultPromise).rejects.toThrow();
    });

    it('should throw when invalid offset', async () => {
      const queryDescription: QueryDescription = {
        ...baseQueryDescription,
        attributes: [
          createAttribute({
            name: 'BrandID',
            type: 'numeric-attribute',
            expression: '[Commerce.Brand ID]',
          }),
        ],
        offset: -100,
      };
      await expect(queryClient.executeQuery(queryDescription).resultPromise).rejects.toThrow();
    });

    describe('skipping validation', () => {
      const queryDescriptionWithOneAttribute: QueryDescription = {
        ...baseQueryDescription,
        attributes: [{ skipValidation: true } as Attribute],
      };

      it('should not throw errors for attributes that have skipValidation set to true', () => {
        const queryDescription: QueryDescription = {
          ...queryDescriptionWithOneAttribute,
        };

        expect(() => validateQueryDescription(queryDescription)).not.toThrow();
      });

      it('should not throw errors for measures that have skipValidation set to true', () => {
        const queryDescription: QueryDescription = {
          ...queryDescriptionWithOneAttribute,
          measures: [{ skipValidation: true } as Measure],
        };

        expect(() => validateQueryDescription(queryDescription)).not.toThrow();
      });

      it('should not throw errors for filters that have skipValidation set to true', () => {
        const queryDescription: QueryDescription = {
          ...queryDescriptionWithOneAttribute,
          filters: [{ skipValidation: true } as Filter],
        };

        expect(() => validateQueryDescription(queryDescription)).not.toThrow();
      });

      it('should not throw errors for highlights that have skipValidation set to true', () => {
        const queryDescription: QueryDescription = {
          ...queryDescriptionWithOneAttribute,
          highlights: [{ skipValidation: true } as Filter],
        };

        expect(() => validateQueryDescription(queryDescription)).not.toThrow();
      });

      it('should not throw when count is above query limit for CSV downloads', () => {
        const queryDescription: QueryDescription = {
          ...baseQueryDescription,
          attributes: [
            createAttribute({
              name: 'BrandID',
              type: 'numeric-attribute',
              expression: '[Commerce.Brand ID]',
            }),
          ],
          count: QUERY_DEFAULT_LIMIT + 1,
        };
        expect(() => queryClient.executeCsvQuery(queryDescription)).not.toThrow();
      });
    });
  });
});
