/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/unbound-method */
import { Attribute, Measure, QueryResultData } from '@sisense/sdk-data';
import {
  DatasourceFieldsTestDataset,
  getDatasourceFieldsTestDataset,
} from './__test_helpers__/get-datasource-fields-test-dataset-loader.js';
import { DimensionalQueryClient } from './query-client.js';
import { JaqlQueryPayload, QueryDescription } from './types.js';
import {
  ExecuteJaqlTestDataset,
  getExecuteJaqlTestDataset,
} from './__test_helpers__/execute-jaql-test-dataset-loader.js';
import { HttpClient } from '@sisense/sdk-rest-client';
import type { Mocked } from 'vitest';

describe('DimensionalQueryClient', () => {
  let httpClientMock: Mocked<HttpClient>;
  let queryClient: DimensionalQueryClient;

  beforeEach(() => {
    httpClientMock = {
      post: vi.fn(),
    } as unknown as Mocked<HttpClient>;
    queryClient = new DimensionalQueryClient(httpClientMock);
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
            datasource: queryDescription.dataSource,
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
    it('should cancel the query execution', async () => {
      const queryDescription: QueryDescription = testDataset[0].queryInput;
      const executionResult = queryClient.executeQuery(queryDescription);
      expect(executionResult.resultPromise).toBeInstanceOf(Promise);
      expect(httpClientMock.post).toHaveBeenCalled();
      const cancelingReason = 'BECAUSE I CAN!';
      executionResult.cancel(cancelingReason);
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
  });

  describe('validateQueryDescription', () => {
    const baseQueryDescription: QueryDescription = {
      dataSource: 'test',
      attributes: [],
      measures: [],
      filters: [],
      highlights: [],
    };

    it('should throw when no attribute and measure', () => {
      expect(() => queryClient.executeQuery(baseQueryDescription)).toThrow();
    });

    it('should throw when invalid attributes', () => {
      const queryDescription: QueryDescription = {
        ...baseQueryDescription,
        attributes: [
          {
            name: 'Years',
            type: 'date',
          } as Attribute,
        ],
      };
      expect(() => queryClient.executeQuery(queryDescription)).toThrow();
    });

    it('should throw when invalid measures', () => {
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
      expect(() => queryClient.executeQuery(queryDescription)).toThrow();
    });
  });
});
