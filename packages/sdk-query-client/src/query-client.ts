/* eslint-disable complexity */
/* eslint-disable max-lines */
/* eslint-disable sonarjs/cognitive-complexity */
import {
  DataSourceField,
  ExecutingCsvQueryResult,
  ExecutingPivotQueryResult,
  ExecutingQueryResult,
  PivotQueryDescription,
  QueryDescription,
  QueryExecutionConfig,
} from './types.js';
import { QueryClient } from './interfaces.js';
import { QueryTaskManager } from './query-task-manager/query-task-manager.js';
import {
  PivotQueryTaskPassport,
  QueryTaskPassport,
} from './query-task-manager/query-task-passport.js';
import { ExecutionResultStatus } from '@sisense/task-manager';
import { QueryApiDispatcher } from './query-api-dispatcher/query-api-dispatcher.js';
import { DataSourceInfo, DataSource, MetadataTypes } from '@sisense/sdk-data';
import { HttpClient } from '@sisense/sdk-rest-client';
import { TranslatableError } from './translation/translatable-error.js';
import { PivotClient } from '@sisense/sdk-pivot-client';

/** @internal */
export const QUERY_DEFAULT_LIMIT = 20000;
const UNSPECIFIED_REASON = 'Unspecified reason';

export class DimensionalQueryClient implements QueryClient {
  private taskManager: QueryTaskManager;

  private queryApi: QueryApiDispatcher;

  private shouldSkipHighlightsWithoutAttributes: boolean;

  constructor(
    httpClient: HttpClient,
    pivotClient: PivotClient = new PivotClient(httpClient),
    shouldSkipHighlightsWithoutAttributes?: boolean,
  ) {
    validateHttpClient(httpClient);

    this.queryApi = new QueryApiDispatcher(httpClient);

    this.taskManager = new QueryTaskManager(this.queryApi, pivotClient);
    this.shouldSkipHighlightsWithoutAttributes = shouldSkipHighlightsWithoutAttributes ?? false;
  }

  /**
   * Executes query
   *
   * @param queryDescription - all options that describe query
   * @param config - query execution configuration
   * @returns promise that resolves to query result data and cancel function that can be used to cancel sent query
   * @throws Error if query description is invalid
   */
  public executeQuery(
    queryDescription: QueryDescription,
    config?: QueryExecutionConfig,
  ): ExecutingQueryResult {
    validateQueryDescription(queryDescription);

    const taskPassport = new QueryTaskPassport('SEND_JAQL_QUERY', queryDescription, {
      ...(config ? config : {}),
      shouldSkipHighlightsWithoutAttributes: this.shouldSkipHighlightsWithoutAttributes || false,
    });
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
        this.taskManager.cancel(taskPassport.taskId, reason || UNSPECIFIED_REASON),
    };
  }

  public executeCsvQuery(
    queryDescription: QueryDescription,
    config?: QueryExecutionConfig,
  ): ExecutingCsvQueryResult {
    validateQueryDescription(queryDescription);

    const taskPassport = new QueryTaskPassport('SEND_DOWNLOAD_CSV_QUERY', queryDescription, {
      ...(config ? config : {}),
      shouldSkipHighlightsWithoutAttributes: this.shouldSkipHighlightsWithoutAttributes || false,
    });
    return {
      resultPromise: new Promise((resolve, reject) => {
        void this.taskManager.executeDownloadCsvSending(taskPassport).then((executionResult) => {
          if (executionResult.status === ExecutionResultStatus.SUCCESS) {
            resolve(executionResult.result!);
          } else {
            reject(executionResult.error);
          }
        });
      }),
      cancel: (reason?: string) =>
        this.taskManager.cancel(taskPassport.taskId, reason || UNSPECIFIED_REASON),
    };
  }

  /**
   * Executes pivot query
   *
   * @param pivotQueryDescription - all options that describe the pivot query
   * @param config - query execution configuration
   * @returns promise that resolves to pivot query result data and cancel function that can be used to cancel sent query
   * @throws Error if query description is invalid
   */
  public executePivotQuery(
    pivotQueryDescription: PivotQueryDescription,
    config?: QueryExecutionConfig,
  ): ExecutingPivotQueryResult {
    validatePivotQueryDescription(pivotQueryDescription);

    const taskPassport = new PivotQueryTaskPassport('SEND_JAQL_QUERY', pivotQueryDescription, {
      ...(config ? config : {}),
      shouldSkipHighlightsWithoutAttributes: this.shouldSkipHighlightsWithoutAttributes || false,
    });
    return {
      resultPromise: new Promise((resolve, reject) => {
        void this.taskManager.executePivotQuerySending(taskPassport).then((executionResult) => {
          if (executionResult.status === ExecutionResultStatus.SUCCESS) {
            resolve(executionResult.result!);
          } else {
            reject(executionResult.error);
          }
        });
      }),
      cancel: (reason?: string) =>
        this.taskManager.cancel(taskPassport.taskId, reason || UNSPECIFIED_REASON),
    };
  }

  public async getDataSourceFields(
    dataSource: DataSource,
    count = 9999,
    offset = 0,
  ): Promise<DataSourceField[]> {
    return this.queryApi.getDataSourceFields(dataSource, count, offset);
  }

  /**
   * Get info about data source
   */
  public async getDataSourceInfo(datasourceName: string): Promise<DataSourceInfo> {
    const completeDataSourceSchema = await this.queryApi.getDataSourceSchema(datasourceName);
    return {
      title: completeDataSourceSchema.title,
      type: completeDataSourceSchema.type === 'extract' ? 'elasticube' : 'live',
    };
  }
}

/**
 * Validates query description
 *
 * @param queryDescription - query description to validate
 * @param config - query execution configuration
 * @throws Error if query description is invalid
 */
export function validateQueryDescription(queryDescription: QueryDescription): void {
  const { attributes, measures, filters, highlights, count, offset } = queryDescription;

  if (count && count < 0) {
    throw new TranslatableError('errors.invalidCountNegative', { count: count.toString() });
  }

  if (offset && offset < 0) {
    throw new TranslatableError('errors.invalidOffset', { offset: offset.toString() });
  }

  if (attributes.length + measures.length === 0) {
    throw new TranslatableError('errors.noDimensionsOrMeasures');
  }

  attributes.forEach((attribute) => {
    if (!attribute.skipValidation && !MetadataTypes.isAttribute(attribute)) {
      throw new TranslatableError('errors.invalidAttribute', { attributeName: attribute.name });
    }
  });

  measures.forEach((measure) => {
    if (!measure.skipValidation && !MetadataTypes.isMeasure(measure)) {
      throw new TranslatableError('errors.invalidMeasure', { measureName: measure.name });
    }
  });

  filters.forEach((filter) => {
    if (!filter.skipValidation && !MetadataTypes.isFilter(filter)) {
      throw new TranslatableError('errors.invalidFilter', { filterName: filter.name });
    }
  });

  highlights.forEach((highlight) => {
    if (!highlight.skipValidation && !MetadataTypes.isFilter(highlight)) {
      throw new TranslatableError('errors.invalidHighlight', { highlightName: highlight.name });
    }
  });
}

/**
 * Validates pivot query description
 *
 * @param queryDescription - pivot query description to validate
 * @throws Error if query description is invalid
 */
export function validatePivotQueryDescription(queryDescription: PivotQueryDescription): void {
  const { rowsAttributes, columnsAttributes, measures, filters, highlights, count, offset } =
    queryDescription;

  if (count && count < 0) {
    throw new TranslatableError('errors.invalidCountNegative', { count: count.toString() });
  }

  if (offset && offset < 0) {
    throw new TranslatableError('errors.invalidOffset', { offset: offset.toString() });
  }

  if (rowsAttributes.length + columnsAttributes.length + measures.length === 0) {
    throw new TranslatableError('errors.noDimensionsOrMeasures');
  }

  filters.forEach((filter) => {
    if (!filter.skipValidation && !MetadataTypes.isFilter(filter)) {
      throw new TranslatableError('errors.invalidFilter', { filterName: filter.name });
    }
  });

  highlights.forEach((highlight) => {
    if (!highlight.skipValidation && !MetadataTypes.isFilter(highlight)) {
      throw new TranslatableError('errors.invalidHighlight', { highlightName: highlight.name });
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
  if (!httpClient) {
    throw new TranslatableError('errors.missingHttpClient');
  }
  if (!httpClient.post) {
    throw new TranslatableError('errors.missingPostMethod');
  }
}
