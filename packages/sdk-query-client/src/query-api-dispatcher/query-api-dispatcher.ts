import { DataSource, getDataSourceName } from '@sisense/sdk-data';
import { HttpClient } from '@sisense/sdk-rest-client';
import {
  DataSourceField,
  JaqlResponse,
  JaqlQueryPayload,
  QueryGuid,
  DataSourceSchema,
  DataSourceMetadata,
} from '../types.js';
import { TranslatableError } from '../translation/translatable-error.js';

const API_DATASOURCES_BASE_PATH = 'api/datasources';
const API_DATAMODELS_BASE_PATH = 'api/v2/datamodels';

export class QueryApiDispatcher {
  constructor(private httpClient: HttpClient) {}

  public getDataSourceFields(dataSource: DataSource, count = 9999, offset = 0) {
    const dataSourceName = getDataSourceName(dataSource);
    const url = `${API_DATASOURCES_BASE_PATH}/${encodeURI(dataSourceName)}/fields/search`;
    // when error is encountered, API returns only status code 400 without informative error message
    // to remedy, catch error and throw a more informative error message
    return this.httpClient.post<DataSourceField[]>(url, { offset, count }).catch(() => {
      throw new Error(
        `Failed to get fields for data source "${dataSource}". Please make sure the data source exists and is accessible.`,
      );
    });
  }

  /**
   * Returns a list of data sources.
   * This method works with user of viewer role or above.
   */
  public getDataSourceList() {
    const url = `${API_DATASOURCES_BASE_PATH}/?sharedWith=r,w`;
    return this.httpClient.get<DataSourceMetadata[]>(url);
  }

  /**
   * Returns the schema of a data source by its name.
   */
  public getDataSourceSchema(dataSourceName: string) {
    const url = `${API_DATAMODELS_BASE_PATH}/schema?title=${encodeURIComponent(dataSourceName)}`;
    return this.httpClient.get<DataSourceSchema>(url);
  }

  public sendJaqlRequest(dataSource: DataSource, jaqlPayload: JaqlQueryPayload) {
    const url = getJaqlUrl(dataSource);
    const abortController = new AbortController();
    return {
      responsePromise: this.httpClient
        .post<JaqlResponse>(url, jaqlPayload, undefined, abortController.signal)
        .then((response) => {
          if (Array.isArray(response)) {
            return {
              values: [],
              metadata: [],
            };
          }
          return response;
        }),
      abortHttpRequest: (reason?: string) => abortController.abort(reason),
    };
  }

  public sendDownloadCsvRequest(dataSource: DataSource, jaqlPayload: JaqlQueryPayload) {
    const url = getDownloadCsvUrl(dataSource);
    const abortController = new AbortController();
    const params = new URLSearchParams();
    params.append('data', encodeURIComponent(JSON.stringify(jaqlPayload)));
    return {
      responsePromise: this.httpClient.post<ReadableStream>(
        url,
        params,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
        abortController.signal,
        { nonJSONBody: true, returnBlob: true },
      ),
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
      if ((error as TranslatableError).status === '404') {
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
 * @param dataSource - The data source of the query.
 */
function getRegularCancelQueryUrl(dataSource: DataSource): string {
  const datasourcePath = encodeURIComponent(getDataSourceName(dataSource));
  return `${API_DATASOURCES_BASE_PATH}/localhost/${datasourcePath}/cancel_queries`;
}

/**
 * Returns the URL for canceling queries for a live datasource.
 * Live datasources require a different URL for canceling queries.
 *
 * @param dataSource - The data source of the query.
 */
function getLiveCancelQueryUrl(dataSource: DataSource): string {
  const datasourcePath = encodeURIComponent(getDataSourceName(dataSource));
  return `${API_DATASOURCES_BASE_PATH}/live/${datasourcePath}/cancel_queries`;
}

/**
 * Returns the URL for sending a JAQL request.
 *
 * @param dataSource - The data source of the query.
 */
function getJaqlUrl(dataSource: DataSource): string {
  const dataSourcePath = encodeURIComponent(getDataSourceName(dataSource));
  return `${API_DATASOURCES_BASE_PATH}/${dataSourcePath}/jaql`;
}

/**
 * Returns the URL for sending a Download CSV request.
 *
 * @param dataSource - The data source of the query.
 */
function getDownloadCsvUrl(dataSource: DataSource): string {
  return `${getJaqlUrl(dataSource)}/csv`;
}
