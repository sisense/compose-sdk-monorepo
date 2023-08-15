/* eslint-disable @typescript-eslint/unbound-method */
import { QueryApiDispatcher } from './query-api-dispatcher.js';
import { JaqlQueryPayload } from '../types.js';
import { HttpClient } from '@sisense/sdk-rest-client';

describe('QueryApiDispatcher', () => {
  let httpClient: jest.Mocked<HttpClient>;
  let queryApi: QueryApiDispatcher;

  beforeEach(() => {
    // Initialize the httpClient and queryApi for each test
    httpClient = {
      post: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;
    queryApi = new QueryApiDispatcher(httpClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDataSourceFields', () => {
    it('should call httpClient.post with the correct URL and payload', async () => {
      // Arrange
      const dataSource = 'exampleDataSource';
      const count = 10;
      const offset = 0;
      const expectedUrl = `api/datasources/${encodeURIComponent(dataSource)}/fields/search`;
      const expectedPayload = { offset, count };
      const expectedFields = [{ name: 'field1' }, { name: 'field2' }];
      httpClient.post.mockResolvedValue(expectedFields);

      // Act
      const result = await queryApi.getDataSourceFields(dataSource, count, offset);

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(expectedUrl, expectedPayload);
      expect(result).toEqual(expectedFields);
    });
  });

  describe('sendJaqlRequest', () => {
    it('should call httpClient.post with the correct URL, payload, and abort signal', async () => {
      // Arrange
      const dataSource = 'exampleDataSource';
      const jaqlPayload: JaqlQueryPayload = {
        metadata: [],
        datasource: dataSource,
        by: 'ComposeSDK',
        queryGuid: '12312',
      };
      const expectedUrl = 'api/datasources/exampleDataSource/jaql';
      const expectedResponse = { data: 'result' };
      httpClient.post.mockResolvedValue(expectedResponse);

      // Act
      const result = queryApi.sendJaqlRequest(dataSource, jaqlPayload);

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(
        expectedUrl,
        jaqlPayload,
        undefined,
        expect.any(AbortSignal),
      );
      expect(result.abortHttpRequest).toBeInstanceOf(Function);
      const response = await result.responsePromise;
      expect(response).toEqual(expectedResponse);
    });
  });

  describe('sendCancelQueryRequest', () => {
    it('should call sendCancelMultipleQueriesRequest with a single guid', async () => {
      // Arrange
      const dataSource = 'exampleDataSource';
      const guid = '12345';

      // Act
      const result = await queryApi.sendCancelJaqlQueryRequest(guid, dataSource);

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(
        `api/datasources/${encodeURIComponent(dataSource)}/cancel_queries`,
        { queries: guid },
      );
      expect(result).toBeUndefined();
    });
  });

  describe('sendCancelMultipleQueriesRequest', () => {
    it('should call httpClient.post with the correct URL and payload', async () => {
      // Arrange
      const dataSource = 'exampleDataSource';
      const guids = ['12345', '67890'];
      const expectedUrl = `api/datasources/${encodeURIComponent(dataSource)}/cancel_queries`;
      const expectedPayload = { queries: '12345;67890' };

      httpClient.post.mockResolvedValue(undefined);

      // Act
      const result = await queryApi.sendCancelMultipleJaqlQueriesRequest(guids, dataSource);

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(expectedUrl, expectedPayload);
      expect(result).toBeUndefined();
    });

    it('should try to cancel queries in the live cancel query endpoint if the regular one returns 404', async () => {
      // Arrange
      const dataSource = 'exampleDataSource';
      const guids = ['12345', '67890'];
      const expectedUrl = `api/datasources/live/${encodeURIComponent(dataSource)}/cancel_queries`;
      const expectedPayload = { queries: '12345;67890' };

      httpClient.post.mockRejectedValueOnce({ status: 404 });
      httpClient.post.mockResolvedValue(undefined);

      // Act
      const result = await queryApi.sendCancelMultipleJaqlQueriesRequest(guids, dataSource);

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(expectedUrl, expectedPayload);
      expect(result).toBeUndefined();
    });
  });
});
