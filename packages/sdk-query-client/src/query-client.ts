/* eslint-disable complexity */
/* eslint-disable sonarjs/cognitive-complexity */
import { DataSourceField, ExecutingQueryResult, QueryDescription } from './types.js';
import { QueryClient } from './interfaces.js';
import { QueryTaskManager } from './query-task-manager/query-task-manager.js';
import { QueryTaskPassport } from './query-task-manager/query-task-passport.js';
import { ExecutionResultStatus } from '@sisense/task-manager';
import { QueryApiDispatcher } from './query-api-dispatcher/query-api-dispatcher.js';
import { DataSource, MetadataTypes } from '@sisense/sdk-data';
import { HttpClient } from '@sisense/sdk-rest-client';

/** @internal */
export const QUERY_DEFAULT_LIMIT = 20000;

export class DimensionalQueryClient implements QueryClient {
  private taskManager: QueryTaskManager;

  private queryApi: QueryApiDispatcher;

  private shouldSkipHighlightsWithoutAttributes: boolean;

  constructor(httpClient: HttpClient, shouldSkipHighlightsWithoutAttributes?: boolean) {
    validateHttpClient(httpClient);

    this.queryApi = new QueryApiDispatcher(httpClient);
    this.taskManager = new QueryTaskManager(this.queryApi);
    this.shouldSkipHighlightsWithoutAttributes = shouldSkipHighlightsWithoutAttributes ?? false;
  }

  /**
   * Executes query
   *
   * @param queryDescription - all options that describe query
   * @returns promise that resolves to query result data and cancel function that can be used to cancel sent query
   * @throws Error if query description is invalid
   */
  public executeQuery(queryDescription: QueryDescription): ExecutingQueryResult {
    validateQueryDescription(queryDescription);

    const taskPassport = new QueryTaskPassport(
      'SEND_JAQL_QUERY',
      queryDescription,
      this.shouldSkipHighlightsWithoutAttributes,
    );
    return {
      resultPromise: new Promise((resolve, reject) => {
        void this.taskManager.executeQuerySending(taskPassport).then((executionResult) => {
          if (executionResult.status === ExecutionResultStatus.SUCCESS) {
            resolve(executionResult.result!);
          } else {
            reject(executionResult.error);
          }
        });
      }),
      cancel: (reason?: string) =>
        this.taskManager.cancel(taskPassport.taskId, reason || 'Unspecified reason'),
    };
  }

  public async getDataSourceFields(
    dataSource: DataSource,
    count = 9999,
    offset = 0,
  ): Promise<DataSourceField[]> {
    return this.queryApi.getDataSourceFields(dataSource, count, offset);
  }
}

/**
 * Validates query description
 *
 * @param queryDescription - query description to validate
 * @throws Error if query description is invalid
 */
function validateQueryDescription(queryDescription: QueryDescription): void {
  const { attributes, measures, filters, highlights, count, offset } = queryDescription;

  if (count && count < 0) {
    throw new Error(`Invalid count "${count}". Count should be non-negative.`);
  }

  if (count && count > QUERY_DEFAULT_LIMIT) {
    throw new Error(`Invalid count "${count}". Count should not exceed ${QUERY_DEFAULT_LIMIT}.`);
  }

  if (offset && offset < 0) {
    throw new Error(`Invalid offset "${offset}". Offset should be non-negative.`);
  }

  if (attributes.length + measures.length === 0) {
    throw new Error(
      'Neither dimensions nor measures found. Query should have at least one dimension or measure.',
    );
  }

  attributes.forEach((attribute) => {
    if (!attribute.skipValidation && !MetadataTypes.isAttribute(attribute)) {
      throw new Error(
        `Invalid attribute "${attribute.name}". Hint: attributes for query should be extracted from the data model generated by the CLI tool.`,
      );
    }
  });

  measures.forEach((measure) => {
    if (!measure.skipValidation && !MetadataTypes.isMeasure(measure)) {
      throw new Error(
        `Invalid measure "${measure.name}". Hint: measures for query can be constructed using the "measures" functions.`,
      );
    }
  });

  filters.forEach((filter) => {
    if (!filter.skipValidation && !MetadataTypes.isFilter(filter)) {
      throw new Error(
        `Invalid filter "${filter.name}". Hint: filters for query can be constructed using the "filters" functions.`,
      );
    }
  });

  highlights.forEach((highlight) => {
    if (!highlight.skipValidation && !MetadataTypes.isFilter(highlight)) {
      throw new Error(
        `Invalid highlight "${highlight.name}". Hint: highlights for query can be constructed using the "filters" functions.`,
      );
    }
  });
}

/**
 * Validates http client
 *
 * @param httpClient - http client to validate
 * @throws Error if http client is invalid
 */
function validateHttpClient(httpClient: HttpClient): void {
  if (!httpClient) throw new Error('Query requires httpClient to work properly');
  if (!httpClient.post) throw new Error('httpClient must provide "post" method');
}
