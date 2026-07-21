import {
  DataSource,
  DataSourceField,
  DataSourceMetadata,
  DataSourceSchema,
  getDataSourceName,
} from '@sisense/sdk-data';
import { HttpClient } from '@sisense/sdk-rest-client';

import { TranslatableError } from '../translation/translatable-error.js';
import {
  CalculatedDimensionParseResponse,
  CountRowsResponse,
  JaqlQueryPayload,
  JaqlResponse,
  QueryGuid,
} from '../types.js';
import { DisplayNameConfig, GetDataSourceFieldsOptions } from './types.js';

const API_DATASOURCES_BASE_PATH = 'api/datasources';
const API_DATAMODELS_BASE_PATH = 'api/v2/datamodels';

/**
 * Thin HttpClient-backed datasource/query REST dispatcher.
 *
 * @sisenseInternal
 */
export class QueryApiDispatcher {
  constructor(private httpClient: HttpClient) {}

  /**
   * Returns fields for a data source.
   *
   * Endpoint choice depends on system display-name settings (see options.displayNameConfig):
   * - When display names are enabled *and* `useNewSearchByDisplayNameApi` is true,
   *   uses `POST …/fields/searchByDisplayName?isLive=` so search matches display titles
   *   and the BE routes live vs ElastiCube correctly via `isLive`.
   * - Otherwise uses `POST …/fields/search` (viewer-safe field listing used by data browser).
   *
   * @param dataSource - Datasource title or info object
   * @param options - Paging, search term, live flag, and displayNameConfig
   */
  public async getDataSourceFields(
    dataSource: DataSource,
    options: GetDataSourceFieldsOptions = {},
  ): Promise<DataSourceField[] | undefined> {
    const { count = 9999, offset = 0, term, displayNameConfig } = options;
    const dataSourceName = getDataSourceName(dataSource);
    const useDisplayNameSearch = shouldUseSearchByDisplayName(displayNameConfig);

    let url: string;
    if (useDisplayNameSearch) {
      // `isLive` is required by the BE on this path to pick live vs EC field handlers.
      // Prefer an explicit option; otherwise resolve from the viewer-safe list endpoint
      // (do not GET api/datasources/{title} — that requires manage/viewschema and fails for viewers).
      const live = options.live ?? (await this.getDataSourceByTitle(dataSourceName))?.live === true;
      url = `${API_DATASOURCES_BASE_PATH}/${encodeURIComponent(
        dataSourceName,
      )}/fields/searchByDisplayName?isLive=${live}`;
    } else {
      url = `${API_DATASOURCES_BASE_PATH}/${encodeURIComponent(dataSourceName)}/fields/search`;
    }

    const body: { offset: number; count: number; term?: string } = { offset, count };
    if (term !== undefined) {
      body.term = term;
    }

    // when error is encountered, API returns only status code 400 without informative error message
    // to remedy, catch error and throw a more informative error message
    return this.httpClient.post<DataSourceField[]>(url, body).catch(() => {
      throw new TranslatableError('errors.dataSourceNotFound', {
        dataSource: typeof dataSource === 'string' ? dataSource : dataSource.title,
      });
    });
  }

  /**
   * Returns a list of data sources the current user can query.
   *
   * Uses `sharedWith=r,w` so viewers (read share) and editors (write share) both
   * appear. Do not confuse this with manage/schema permissions — see
   * {@link getDataSourceByTitle}.
   */
  public getDataSourceList() {
    // sharedWith=r,w = datasources the user may query (viewer role or above), not only manage.
    const url = `${API_DATASOURCES_BASE_PATH}/?sharedWith=r,w`;
    return this.httpClient.get<DataSourceMetadata[]>(url);
  }

  /**
   * Resolves the result data type of a calculated-dimension formula (and validates it) via the
   * server's formula parse endpoint.
   *
   * @param dataSource - The data source the formula is evaluated against.
   * @param formula - The calculated-dimension formula string.
   * @param context - The formula context (map of placeholders to their JAQL definitions).
   * @returns The parse response — `dataType` on success, `error`/`message` for an invalid formula,
   * or `undefined` when the server returns no body.
   * @throws A translatable error when the parse endpoint is unavailable (e.g. on Sisense versions
   * that predate calculated-dimension support).
   */
  public parseCalculatedDimension(
    dataSource: DataSource,
    formula: string,
    context: object,
  ): Promise<CalculatedDimensionParseResponse | undefined> {
    const dataSourcePath = encodeURIComponent(getDataSourceName(dataSource));
    const url = `${API_DATASOURCES_BASE_PATH}/${dataSourcePath}/calculated-dimension/parse`;
    return this.httpClient
      .post<CalculatedDimensionParseResponse>(url, { formula, context, isMaskedResponse: false })
      .catch((error: unknown) => {
        if (error && typeof error === 'object' && 'status' in error && error.status === '404') {
          throw new TranslatableError('errors.calculatedDimensionParseNotSupported');
        }
        throw error;
      });
  }

  /**
   * Resolves a single datasource by title in a viewer-safe way.
   *
   * Prefer this over `GET api/datasources/{title}`: that endpoint requires
   * `manage/elasticubes/viewschema` and returns forbidden for viewers who can
   * still query the cube. Listing with `sharedWith=r,w` and filtering locally
   * works for those users and already includes the `live` flag needed for field search.
   *
   * @param title - Datasource title
   * @returns Matching metadata, or null if not in the user's queryable list
   */
  public async getDataSourceByTitle(title: string): Promise<DataSourceMetadata | null> {
    const list = (await this.getDataSourceList()) ?? [];
    return list.find((ds) => ds.title === title) ?? null;
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

  /**
   * Sends a request that returns only the total row count of a JAQL query,
   * ignoring any `count`/`offset` paging in the payload.
   *
   * Supported by Sisense instances that expose the `jaql/countrows` endpoint;
   * on older versions the request fails with a 404 error.
   *
   * @param dataSource - The data source of the query.
   * @param jaqlPayload - The JAQL payload of the query to count rows for.
   */
  public sendCountRowsRequest(dataSource: DataSource, jaqlPayload: JaqlQueryPayload) {
    const url = getCountRowsUrl(dataSource);
    const abortController = new AbortController();
    return {
      responsePromise: this.httpClient.post<CountRowsResponse>(
        url,
        jaqlPayload,
        undefined,
        abortController.signal,
      ),
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
 * Determines whether to use the display-name field search endpoint.
 * Both flags must be true — matching system settings defaults
 * (`displayNameConfig.enabled` can be true while `useNewSearchByDisplayNameApi` is still false).
 *
 * @internal
 */
function shouldUseSearchByDisplayName(displayNameConfig?: DisplayNameConfig): boolean {
  return Boolean(displayNameConfig?.enabled && displayNameConfig?.useNewSearchByDisplayNameApi);
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

/**
 * Returns the URL for sending a count rows request.
 *
 * @param dataSource - The data source of the query.
 */
function getCountRowsUrl(dataSource: DataSource): string {
  return `${getJaqlUrl(dataSource)}/countrows`;
}
