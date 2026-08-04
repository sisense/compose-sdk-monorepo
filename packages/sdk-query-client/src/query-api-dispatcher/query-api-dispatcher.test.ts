/* eslint-disable @typescript-eslint/unbound-method */
import { HttpClient } from '@sisense/sdk-rest-client';
import { Mocked } from 'vitest';

import { JaqlQueryPayload } from '../types.js';
import { QueryApiDispatcher } from './query-api-dispatcher.js';

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
    it('should resolve fullname from the list and preserve slash encoding', async () => {
      const dataSource = 'einat perspectives';
      const fullname = 'LocalHost/einat perspectives';
      httpClient.get.mockResolvedValueOnce([{ title: dataSource, fullname, live: false }]);
      httpClient.post.mockResolvedValue([{ name: 'field1' }]);

      const result = await queryApi.getDataSourceFields(dataSource, { count: 10, offset: 0 });

      expect(httpClient.get).toHaveBeenCalledWith('api/datasources/?sharedWith=r,w');
      expect(httpClient.post).toHaveBeenCalledWith(
        'api/datasources/LocalHost/einat%20perspectives/fields/search',
        { offset: 0, count: 10 },
      );
      expect(result).toEqual([{ name: 'field1' }]);
    });

    it('should use provided fullname without a list lookup', async () => {
      httpClient.post.mockResolvedValue([]);

      await queryApi.getDataSourceFields(
        {
          title: 'SnowflakeLive',
          type: 'live',
          fullname: 'live:SnowflakeLive',
        },
        { live: true },
      );

      expect(httpClient.get).not.toHaveBeenCalled();
      expect(httpClient.post).toHaveBeenCalledWith(
        'api/datasources/live%3ASnowflakeLive/fields/search',
        { offset: 0, count: 9999 },
      );
    });

    it('should call searchByDisplayName with title (not fullname) when displayName API is enabled', async () => {
      httpClient.post.mockResolvedValue([]);

      await queryApi.getDataSourceFields(
        {
          title: 'Sales Live',
          type: 'live',
          fullname: 'live:Sales Live',
        },
        {
          displayNameConfig: { enabled: true, useNewSearchByDisplayNameApi: true },
          live: true,
        },
      );

      expect(httpClient.get).not.toHaveBeenCalled();
      expect(httpClient.post).toHaveBeenCalledWith(
        'api/datasources/Sales%20Live/fields/searchByDisplayName?isLive=true',
        { offset: 0, count: 9999 },
      );
    });

    it('should resolve live from list but still use title for searchByDisplayName', async () => {
      const dataSource = 'Sample ECommerce';
      httpClient.get.mockResolvedValueOnce([
        { title: dataSource, fullname: `localhost/${dataSource}`, live: false },
      ]);
      httpClient.post.mockResolvedValueOnce([]);

      await queryApi.getDataSourceFields(dataSource, {
        displayNameConfig: { enabled: true, useNewSearchByDisplayNameApi: true },
      });

      expect(httpClient.get).toHaveBeenCalledWith('api/datasources/?sharedWith=r,w');
      expect(httpClient.post).toHaveBeenCalledWith(
        'api/datasources/Sample%20ECommerce/fields/searchByDisplayName?isLive=false',
        { offset: 0, count: 9999 },
      );
    });

    it('should use DataSourceInfo.type for isLive when list lookup misses', async () => {
      httpClient.get.mockResolvedValueOnce([]);
      httpClient.post.mockResolvedValueOnce([]);

      await queryApi.getDataSourceFields(
        {
          title: 'Sales Live',
          type: 'live',
          fullname: 'live:Sales Live',
        },
        {
          displayNameConfig: { enabled: true, useNewSearchByDisplayNameApi: true },
        },
      );

      expect(httpClient.get).toHaveBeenCalledWith('api/datasources/?sharedWith=r,w');
      expect(httpClient.post).toHaveBeenCalledWith(
        'api/datasources/Sales%20Live/fields/searchByDisplayName?isLive=true',
        { offset: 0, count: 9999 },
      );
    });

    it('should not use searchByDisplayName when only displayName.enabled is true', async () => {
      const dataSource = 'exampleDataSource';
      httpClient.get.mockResolvedValueOnce([
        { title: dataSource, fullname: `localhost/${dataSource}`, live: false },
      ]);
      httpClient.post.mockResolvedValue([]);

      await queryApi.getDataSourceFields(dataSource, {
        displayNameConfig: { enabled: true, useNewSearchByDisplayNameApi: false },
      });

      expect(httpClient.post).toHaveBeenCalledWith(
        'api/datasources/localhost/exampleDataSource/fields/search',
        { offset: 0, count: 9999 },
      );
    });

    it('should pass term in the POST body when provided', async () => {
      const dataSource = 'exampleDataSource';
      httpClient.get.mockResolvedValueOnce([
        { title: dataSource, fullname: `localhost/${dataSource}`, live: false },
      ]);
      httpClient.post.mockResolvedValue([]);

      await queryApi.getDataSourceFields(dataSource, { term: 'revenue', count: 5, offset: 1 });

      expect(httpClient.post).toHaveBeenCalledWith(
        'api/datasources/localhost/exampleDataSource/fields/search',
        { offset: 1, count: 5, term: 'revenue' },
      );
    });

    it('should fall back to title when list lookup finds nothing', async () => {
      httpClient.get.mockResolvedValueOnce([]);
      httpClient.post.mockResolvedValue([]);

      await queryApi.getDataSourceFields('Missing DS');

      expect(httpClient.post).toHaveBeenCalledWith('api/datasources/Missing%20DS/fields/search', {
        offset: 0,
        count: 9999,
      });
    });

    it('should throw an error on unsuccessful fetch', async () => {
      // Arrange
      const dataSource = 'exampleDataSource';
      httpClient.get.mockResolvedValueOnce([]);
      httpClient.post.mockRejectedValueOnce({ status: 400 });

      // Act
      const result = queryApi.getDataSourceFields(dataSource);

      // Assert
      await expect(result).rejects.toThrow(
        `Failed to get fields for data source "${dataSource}". Please make sure the data source exists and is accessible.`,
      );
    });
  });

  describe('getDataSourceByTitle', () => {
    it('should resolve from the viewer-safe list endpoint and never GET by title', async () => {
      const list = [
        { title: 'A', fullname: 'localhost/A', live: false },
        { title: 'B', fullname: 'localhost/B', live: true },
      ];
      httpClient.get.mockResolvedValueOnce(list);

      const result = await queryApi.getDataSourceByTitle('B');

      expect(httpClient.get).toHaveBeenCalledWith('api/datasources/?sharedWith=r,w');
      expect(httpClient.get).not.toHaveBeenCalledWith('api/datasources/B');
      expect(result).toEqual(list[1]);
    });

    it('should return null when the title is not in the list', async () => {
      httpClient.get.mockResolvedValueOnce([{ title: 'A', fullname: 'localhost/A', live: false }]);

      await expect(queryApi.getDataSourceByTitle('Missing')).resolves.toBeNull();
    });
  });

  describe('sendJaqlRequest', () => {
    it('should call httpClient.post with the correct URL, payload, and abort signal', async () => {
      // Arrange
      const dataSource = 'exampleDataSource';
      const jaqlPayload: JaqlQueryPayload = {
        metadata: [],
        datasource: { title: dataSource, live: false },
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
        datasource: { title: dataSource, live: false },
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

  describe('sendCountRowsRequest', () => {
    it('should call httpClient.post with the correct URL, payload, and abort signal', async () => {
      // Arrange
      const dataSource = 'exampleDataSource';
      const jaqlPayload: JaqlQueryPayload = {
        metadata: [],
        datasource: { title: dataSource, live: false },
        by: 'ComposeSDK',
        queryGuid: '12312',
      };
      const expectedUrl = 'api/datasources/exampleDataSource/jaql/countrows';
      const expectedResponse = { countRows: 1234 };
      httpClient.post.mockResolvedValue(expectedResponse);

      // Act
      const result = queryApi.sendCountRowsRequest(dataSource, jaqlPayload);

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

  describe('sendDownloadCsvRequest', () => {
    it('should call httpClient.post with the correct URL, payload, and abort signal', async () => {
      // Arrange
      const dataSource = 'exampleDataSource';
      const jaqlPayload: JaqlQueryPayload = {
        metadata: [],
        datasource: { title: dataSource, live: false },
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

  describe('parseCalculatedDimension', () => {
    const dataSource = 'Sample ECommerce';
    const formula = 'right([ageRange], 1)';
    // Context entries carry each INPUT column's datatype, added automatically when the referenced
    // data-model attribute is serialized to JAQL — it is not user-supplied and is unrelated to the
    // formula's result type (which is what the endpoint resolves and returns).
    const context = { '[ageRange]': { dim: '[Commerce.Age Range]', datatype: 'text' } };
    const expectedUrl = `api/datasources/${encodeURIComponent(
      dataSource,
    )}/calculated-dimension/parse`;
    const expectedPayload = { formula, context, isMaskedResponse: false };

    it('should call httpClient.post with the correct URL and payload', async () => {
      // Arrange
      const expectedResponse = { dataType: 'text' };
      httpClient.post.mockResolvedValueOnce(expectedResponse);

      // Act
      const result = await queryApi.parseCalculatedDimension(dataSource, formula, context);

      // Assert
      expect(httpClient.post).toHaveBeenCalledWith(expectedUrl, expectedPayload);
      expect(result).toEqual(expectedResponse);
    });

    it('should pass through a formula-validation error response', async () => {
      // Arrange
      const errorResponse = { error: true, message: 'Invalid formula' };
      httpClient.post.mockResolvedValueOnce(errorResponse);

      // Act
      const result = await queryApi.parseCalculatedDimension(dataSource, formula, context);

      // Assert
      expect(result).toEqual(errorResponse);
    });

    it('should throw a capability error when the endpoint is unavailable (404)', async () => {
      // Arrange
      httpClient.post.mockRejectedValueOnce({ status: '404' });

      // Act
      const result = queryApi.parseCalculatedDimension(dataSource, formula, context);

      // Assert
      await expect(result).rejects.toThrow(
        'The connected data source does not support resolving calculated dimension formulas.',
      );
    });

    it('should rethrow non-404 errors unchanged', async () => {
      // Arrange
      const error = { status: '500' };
      httpClient.post.mockRejectedValueOnce(error);

      // Act
      const result = queryApi.parseCalculatedDimension(dataSource, formula, context);

      // Assert
      await expect(result).rejects.toEqual(error);
    });
  });
});
