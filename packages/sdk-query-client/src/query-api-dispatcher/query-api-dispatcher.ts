import { DataSource } from '@sisense/sdk-data';
import { HttpClient } from '@sisense/sdk-rest-client';
import {
  AbortRequestFunction,
  DataSourceField,
  JaqlResponse,
  JaqlQueryPayload,
  QueryGuid,
} from '../types.js';

const API_DATASOURCES_BASE_PATH = 'api/datasources';

type RequestSendingResult<T> = {
  responsePromise: Promise<T>;
  abortHttpRequest: AbortRequestFunction;
};

export class QueryApiDispatcher {
  constructor(private httpClient: HttpClient) {}

  public async getDataSourceFields(
    dataSource: DataSource,
    count = 9999,
    offset = 0,
  ): Promise<DataSourceField[]> {
    const url = `${API_DATASOURCES_BASE_PATH}/${encodeURIComponent(dataSource)}/fields/search`;
    // when error is encountered, API returns only status code 400 without informative error message
    // to remedy, catch error and throw a more informative error message
    try {
      return await this.httpClient.post(url, { offset, count });
    } catch (error) {
      throw new Error(
        `Failed to get fields for data source "${dataSource}". Please make sure the data source exists and is accessible.`,
      );
    }
  }

  public sendJaqlRequest(
    dataSource: DataSource,
    jaqlPayload: JaqlQueryPayload,
  ): RequestSendingResult<JaqlResponse> {
    const url = getJaqlUrl(dataSource);
    const abortController = new AbortController();
    return {
      responsePromise: this.httpClient.post(url, jaqlPayload, undefined, abortController.signal),
      abortHttpRequest: (reason?: string) => abortController.abort(reason),
    };
  }

  /**
   * Sends a request to cancel a JAQL query.
   *
   * @param guid - The guid of the query to cancel.
   * @param dataSource - The datasource of where query sent.
   */
  public sendCancelJaqlQueryRequest(guid: QueryGuid, dataSource: DataSource): Promise<void> {
    return this.sendCancelMultipleJaqlQueriesRequest([guid], dataSource);
  }

  /**
   * Sends a request to cancel multiple JAQL queries.
   *
   * @param guids - The guids of the queries to cancel.
   * @param dataSource - The datasource of where queries sent.
   */
  public async sendCancelMultipleJaqlQueriesRequest(
    guids: QueryGuid[],
    dataSource: DataSource,
  ): Promise<void> {
    const payload = {
      queries: guids.join(';'),
    };
    const regularUrl = getRegularCancelQueryUrl(dataSource);
    try {
      await this.httpClient.post(regularUrl, payload);
    } catch (error) {
      if ((error as { status: number }).status === 404) {
        // probably this datasource is live and requires a different URL for canceling queries
        const liveUrl = getLiveCancelQueryUrl(dataSource);
        await this.httpClient.post(liveUrl, payload);
      } else {
        throw error;
      }
    }
  }
}

/**
 * Returns the URL for canceling queries for a regular (non-live) datasource.
 *
 * @param dataSource
 */
function getRegularCancelQueryUrl(dataSource: DataSource): string {
  const datasourcePath = encodeURIComponent(dataSource);
  return `${API_DATASOURCES_BASE_PATH}/${datasourcePath}/cancel_queries`;
}

/**
 * Returns the URL for canceling queries for a live datasource.
 * Live datasources require a different URL for canceling queries.
 *
 * @param dataSource
 */
function getLiveCancelQueryUrl(dataSource: DataSource): string {
  const datasourcePath = encodeURIComponent(dataSource);
  return `${API_DATASOURCES_BASE_PATH}/live/${datasourcePath}/cancel_queries`;
}

/**
 * Returns the URL for sending a JAQL request.
 *
 * @param dataSource
 */
function getJaqlUrl(dataSource: DataSource): string {
  const dataSourcePath = encodeURIComponent(dataSource);
  return `${API_DATASOURCES_BASE_PATH}/${dataSourcePath}/jaql`;
}
