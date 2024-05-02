/* eslint-disable @typescript-eslint/unbound-method */
import { QueryApiDispatcher } from './query-api-dispatcher.js';
import { JaqlQueryPayload } from '../types.js';
import { HttpClient } from '@sisense/sdk-rest-client';
import { Mocked } from 'vitest';

describe('QueryApiDispatcher', () => {
  let httpClient: Mocked<HttpClient>;
  let queryApi: QueryApiDispatcher;

  beforeEach(() => {
    // Initialize the httpClient and queryApi for each test
    httpClient = {
      post: vi.fn(),
      get: vi.fn(),
    } as unknown as Mocked<HttpClient>;
    queryApi = new QueryApiDispatcher(httpClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
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

    it('should throw an error on unsuccessful fetch', async () => {
      // Arrange
      const dataSource = 'exampleDataSource';
      httpClient.post.mockRejectedValueOnce({ status: 400 });

      // Act
      const result = queryApi.getDataSourceFields(dataSource);

      // Assert
      await expect(result).rejects.toThrow(
        `Failed to get fields for data source "${dataSource}". Please make sure the data source exists and is accessible.`,
      );
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

    it('should return empty result in case of empty array jaql endpoint response', async () => {
      // Arrange
      const dataSource = 'exampleDataSource';
      const jaqlPayload: JaqlQueryPayload = {
        metadata: [],
        datasource: dataSource,
        by: 'ComposeSDK',
        queryGuid: '12312',
      };
      httpClient.post.mockResolvedValue([]);

      // Act
      const result = queryApi.sendJaqlRequest(dataSource, jaqlPayload);

      // Assert
      const response = await result.responsePromise;
      expect(response).toEqual({
        metadata: [],
        values: [],
      });
    });
  });

  describe('sendDownloadCsvRequest', () => {
    it('should call httpClient.post with the correct URL, payload, and abort signal', async () => {
      // Arrange
      const dataSource = 'exampleDataSource';
      const jaqlPayload: JaqlQueryPayload = {
        metadata: [],
        datasource: dataSource,
        by: 'ComposeSDK',
        queryGuid: '12312',
      };
      const expectedUrl = 'api/datasources/exampleDataSource/jaql/csv';
      const expectedResponse = new Blob(['result'], { type: 'text/csv' });
      const expectedHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
      const expectedConfig = { nonJSONBody: true, returnBlob: true };
      httpClient.post.mockResolvedValue(expectedResponse);

      // Act
      const result = queryApi.sendDownloadCsvRequest(dataSource, jaqlPayload);

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(
        expectedUrl,
        expect.any(URLSearchParams),
        { headers: expectedHeaders },
        expect.any(AbortSignal),
        expectedConfig,
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
        `api/datasources/localhost/${encodeURIComponent(dataSource)}/cancel_queries`,
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
      const expectedUrl = `api/datasources/localhost/${encodeURIComponent(
        dataSource,
      )}/cancel_queries`;
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

      httpClient.post.mockRejectedValueOnce({ status: '404' });
      httpClient.post.mockResolvedValue(undefined);

      // Act
      const result = await queryApi.sendCancelMultipleJaqlQueriesRequest(guids, dataSource);

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(expectedUrl, expectedPayload);
      expect(result).toBeUndefined();
    });

    it('should throw an error on unsuccessful fetch (not 404)', async () => {
      // Arrange
      const dataSource = 'exampleDataSource';
      const guids = ['12345', '67890'];

      httpClient.post.mockRejectedValueOnce({ status: 400, message: 'Bad Request' });

      // Act
      const result = queryApi.sendCancelMultipleJaqlQueriesRequest(guids, dataSource);

      // Assert
      await expect(result).rejects.toThrow('Bad Request');
    });
  });

  describe('getDataSourceSchema', () => {
    it('should call httpClient.get with the correct URL', async () => {
      // Arrange
      const dataSource = 'exampleDataSource';
      const expectedUrl = 'api/v2/datamodels/schema?title=exampleDataSource';
      const expectedResponse = { title: 'exampleDataSource', type: 'live' };
      httpClient.get.mockResolvedValueOnce(expectedResponse);

      // Act
      const result = await queryApi.getDataSourceSchema(dataSource);

      // Assert
      expect(httpClient.get).toHaveBeenCalledWith(expectedUrl);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getDataSourceList', () => {
    it('should call httpClient.get with the correct URL', async () => {
      // Arrange
      const expectedUrl = 'api/datasources/?sharedWith=r,w';
      const expectedResponse = [
        {
          fullname: 'localhost/Sample ECommerce',
          id: 'localhost_aSampleIAAaECommerce',
          address: 'LocalHost',
          database: 'aSampleIAAaECommerce',
          live: false,
          title: 'Sample ECommerce',
        },
        {
          fullname: 'localhost/Sample Healthcare',
          id: 'localhost_aSampleIAAaHealthcare',
          address: 'LocalHost',
          database: 'aSampleIAAaHealthcare',
          live: false,
          title: 'Sample Healthcare',
        },
      ];
      httpClient.get.mockResolvedValueOnce(expectedResponse);

      // Act
      const result = await queryApi.getDataSourceList();

      // Assert
      expect(httpClient.get).toHaveBeenCalledWith(expectedUrl);
      expect(result).toEqual(expectedResponse);
    });
  });
});
