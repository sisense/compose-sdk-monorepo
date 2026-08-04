import { DataSource, PivotQueryResultData, QueryResultData } from '@sisense/sdk-data';
import { JaqlRequest, PivotQueryClient } from '@sisense/sdk-pivot-query-client';
import { AbstractTaskManager, Step, Task } from '@sisense/task-manager';

import { EmptyObject } from '../helpers/utility-types.js';
import { withCalculatedDimensionParseCache } from '../jaql/calculated-dimension-datatype-cache.js';
import {
  enrichCalculatedDimensionDatatypes,
  ParseCalculatedDimensionFn,
} from '../jaql/enrich-calculated-dimension-datatypes.js';
import { getJaqlQueryPayload, getPivotJaqlQueryPayload } from '../jaql/get-jaql-query-payload.js';
import { QueryApiDispatcher } from '../query-api-dispatcher/query-api-dispatcher.js';
import { QUERY_DEFAULT_LIMIT } from '../query-client.js';
import {
  getDataFromQueryResult,
  ResultColumnMetadata,
} from '../query-result/get-data-from-query-result.js';
import { TranslatableError } from '../translation/translatable-error.js';
import {
  AbortRequestFunction,
  CountRowsResponse,
  JaqlQueryPayload,
  JaqlResponse,
} from '../types.js';
import { PivotQueryTaskPassport, QueryTaskPassport } from './query-task-passport.js';

type QueryTask = Task<QueryTaskPassport>;
type PivotQueryTask = Task<PivotQueryTaskPassport>;

export class QueryTaskManager extends AbstractTaskManager {
  /** Map of aborters by task id to be able to cancel sent requests */
  private sentRequestsAbortersMap = new Map<string, AbortRequestFunction>();

  private queryApi: QueryApiDispatcher;

  /**
   * Client for handling pivot data
   */
  private pivotQueryClient: PivotQueryClient;

  /**
   * Cached calculated-dimension formula parser. Instance-scoped so a data source + formula +
   * context is resolved once and shared across every widget/query of this client (and across
   * re-renders), rather than parsed once per widget.
   */
  private parseCalculatedDimension: ParseCalculatedDimensionFn;

  constructor(queryApi: QueryApiDispatcher, pivotQueryClient: PivotQueryClient) {
    super();
    this.queryApi = queryApi;
    this.pivotQueryClient = pivotQueryClient;
    this.parseCalculatedDimension = withCalculatedDimensionParseCache(
      this.queryApi.parseCalculatedDimension.bind(this.queryApi),
    );
  }

  /**
   * Resolves and stamps the result data type on calculated-dimension filters in the payload before
   * it is sent. See {@link enrichCalculatedDimensionDatatypes}. No-op when the payload has no
   * unresolved calculated-dimension filters, so regular queries are unaffected.
   *
   * @param jaqlPayload - The JAQL payload to enrich in place.
   * @param dataSource - The data source the query runs against.
   * @returns The same payload, with calculated-dimension filter datatypes resolved.
   */
  private async enrichJaqlPayload(
    jaqlPayload: JaqlQueryPayload,
    dataSource: DataSource,
  ): Promise<JaqlQueryPayload> {
    await enrichCalculatedDimensionDatatypes(
      jaqlPayload,
      dataSource,
      this.parseCalculatedDimension,
    );
    return jaqlPayload;
  }

  /**
   * Builds the JAQL payload for a data query, resolving calculated-dimension filter datatypes and
   * applying the optional `onBeforeQuery` hook.
   *
   * @param task - The query task carrying the query description and execution config.
   * @returns The JAQL payload ready to send.
   */
  private async prepareJaqlPayload(task: QueryTask): Promise<JaqlQueryPayload> {
    const { queryDescription, executionConfig } = task.passport;
    const jaqlPayload: JaqlQueryPayload = await this.enrichJaqlPayload(
      getJaqlQueryPayload(queryDescription, executionConfig.shouldSkipHighlightsWithoutAttributes),
      queryDescription.dataSource,
    );
    const onBeforeQuery = task.passport.executionConfig.onBeforeQuery;
    if (onBeforeQuery) {
      return onBeforeQuery(jaqlPayload);
    }
    return jaqlPayload;
  }

  private async sendJaqlQuery(task: QueryTask, jaqlPayload: JaqlQueryPayload) {
    const { queryDescription, taskId } = task.passport;
    const { responsePromise, abortHttpRequest } = this.queryApi.sendJaqlRequest(
      task.passport.queryDescription.dataSource,
      jaqlPayload,
    );
    this.sentRequestsAbortersMap.set(taskId, abortHttpRequest);
    const jaqlResponse = await responsePromise.finally(() => {
      this.sentRequestsAbortersMap.delete(taskId);
    });

    validateJaqlResponse(jaqlResponse);

    const metadata = [...queryDescription.attributes, ...queryDescription.measures];

    // extra columns are assumed to have been added by advanced analytics functions.
    // They have no model element behind them, so the response header doubles as both
    // identity and display label.
    const extraColumns: ResultColumnMetadata[] = (jaqlResponse.headers || [])
      .slice(metadata.length)
      .map((c) => ({ name: c, title: c, type: 'number' }));

    return getDataFromQueryResult(jaqlResponse, [...metadata, ...extraColumns]);
  }

  /**
   * Builds the JAQL payload for a count-rows query. Paging (`count`/`offset`) is stripped so the
   * payload is page-independent, then calculated-dimension filter datatypes are resolved and the
   * optional `onBeforeQuery` hook is applied.
   *
   * @param task - The query task carrying the query description and execution config.
   * @returns The page-independent JAQL payload ready to send.
   */
  private async prepareCountRowsJaqlPayload(task: QueryTask): Promise<JaqlQueryPayload> {
    const { queryDescription, executionConfig } = task.passport;
    // The total row count is page-independent: the server ignores paging when counting,
    // and omitting count/offset keeps the payload identical across pages of the same query.
    const pageIndependentQueryDescription = {
      ...queryDescription,
      count: undefined,
      offset: undefined,
    };
    const jaqlPayload: JaqlQueryPayload = await this.enrichJaqlPayload(
      getJaqlQueryPayload(
        pageIndependentQueryDescription,
        executionConfig.shouldSkipHighlightsWithoutAttributes,
      ),
      queryDescription.dataSource,
    );
    const onBeforeQuery = executionConfig.onBeforeQuery;
    if (onBeforeQuery) {
      return onBeforeQuery(jaqlPayload);
    }
    return jaqlPayload;
  }

  private async sendCountRowsQuery(task: QueryTask, jaqlPayload: JaqlQueryPayload) {
    const { taskId } = task.passport;
    const { responsePromise, abortHttpRequest } = this.queryApi.sendCountRowsRequest(
      task.passport.queryDescription.dataSource,
      jaqlPayload,
    );
    this.sentRequestsAbortersMap.set(taskId, abortHttpRequest);
    const countRowsResponse = await responsePromise.finally(() => {
      this.sentRequestsAbortersMap.delete(taskId);
    });

    validateCountRowsResponse(countRowsResponse);

    return countRowsResponse.countRows;
  }

  private async sendCsvQuery(
    task: QueryTask,
    jaqlPayload: JaqlQueryPayload,
  ): Promise<ReadableStream | void> {
    const { taskId } = task.passport;
    const { responsePromise, abortHttpRequest } = this.queryApi.sendDownloadCsvRequest(
      task.passport.queryDescription.dataSource,
      jaqlPayload,
    );
    this.sentRequestsAbortersMap.set(taskId, abortHttpRequest);
    return responsePromise.finally(() => {
      this.sentRequestsAbortersMap.delete(taskId);
    });
  }

  private cancelDataRetrievalQuery(task: QueryTask) {
    const taskId = task.passport.taskId;
    const abortInitialRequest = this.sentRequestsAbortersMap.get(taskId);
    if (abortInitialRequest) {
      abortInitialRequest();
      this.sentRequestsAbortersMap.delete(taskId);
    }
    return this.queryApi.sendCancelJaqlQueryRequest(
      taskId,
      task.passport.queryDescription.dataSource,
    );
  }

  /**
   * Builds the JAQL payload for a pivot query, resolving calculated-dimension filter datatypes and
   * applying the optional `onBeforeQuery` hook.
   *
   * @param task - The pivot query task carrying the pivot query description and execution config.
   * @returns The JAQL payload ready to send.
   */
  private async preparePivotJaqlPayload(task: PivotQueryTask): Promise<JaqlQueryPayload> {
    const { pivotQueryDescription, executionConfig } = task.passport;
    const jaqlPayload: JaqlQueryPayload = await this.enrichJaqlPayload(
      getPivotJaqlQueryPayload(
        pivotQueryDescription,
        executionConfig.shouldSkipHighlightsWithoutAttributes,
      ),
      pivotQueryDescription.dataSource,
    );
    const onBeforeQuery = task.passport.executionConfig.onBeforeQuery;
    if (onBeforeQuery) {
      return onBeforeQuery(jaqlPayload);
    }
    return jaqlPayload;
  }

  /**
   * Executes the pivot query and returns the result
   *
   * @param task
   * @param jaqlPayload
   */
  private sendPivotJaqlQuery(
    task: PivotQueryTask,
    jaqlPayload: JaqlQueryPayload,
  ): Promise<PivotQueryResultData> {
    const { pivotQueryDescription } = task.passport;
    return this.pivotQueryClient.queryData(
      jaqlPayload as unknown as JaqlRequest,
      true,
      pivotQueryDescription.count ?? QUERY_DEFAULT_LIMIT,
      false,
    );
  }

  private cancelPivotJaqlQuery(task: PivotQueryTask) {
    const taskId = task.passport.taskId;
    const abortInitialRequest = this.sentRequestsAbortersMap.get(taskId);
    if (abortInitialRequest) {
      abortInitialRequest();
      this.sentRequestsAbortersMap.delete(taskId);
    }
    return this.queryApi.sendCancelJaqlQueryRequest(
      taskId,
      task.passport.pivotQueryDescription.dataSource,
    );
  }

  public executeQuerySending = super.createFlow<QueryTaskPassport, EmptyObject, QueryResultData>([
    new Step('PREPARE_JAQL_PAYLOAD', this.prepareJaqlPayload.bind(this), async () => {}),
    new Step(
      'SEND_JAQL_QUERY',
      this.sendJaqlQuery.bind(this),
      this.cancelDataRetrievalQuery.bind(this),
    ),
  ]);

  public executeCountRowsSending = super.createFlow<QueryTaskPassport, EmptyObject, number>([
    new Step('PREPARE_JAQL_PAYLOAD', this.prepareCountRowsJaqlPayload.bind(this), async () => {}),
    new Step(
      'SEND_COUNT_ROWS_QUERY',
      this.sendCountRowsQuery.bind(this),
      this.cancelDataRetrievalQuery.bind(this),
    ),
  ]);

  public executeDownloadCsvSending = super.createFlow<QueryTaskPassport, EmptyObject, Blob>([
    new Step('PREPARE_JAQL_PAYLOAD', this.prepareJaqlPayload.bind(this), async () => {}),
    new Step(
      'SEND_DOWNLOAD_CSV_QUERY',
      this.sendCsvQuery.bind(this),
      this.cancelDataRetrievalQuery.bind(this),
    ),
  ]);

  public executePivotQuerySending = super.createFlow<
    PivotQueryTaskPassport,
    EmptyObject,
    PivotQueryResultData
  >([
    new Step('PREPARE_JAQL_PAYLOAD', this.preparePivotJaqlPayload.bind(this), async () => {}),
    new Step(
      'SEND_JAQL_QUERY',
      this.sendPivotJaqlQuery.bind(this),
      this.cancelPivotJaqlQuery.bind(this),
    ),
  ]);
}

export function validateJaqlResponse(
  jaqlResponse: JaqlResponse | undefined,
): asserts jaqlResponse is JaqlResponse {
  if (!jaqlResponse) {
    throw new TranslatableError('errors.noJaqlResponse');
  }
  if (jaqlResponse.error) {
    // Build the message from the human-readable server fields only. `extraDetails`
    // is a structured object and must not be serialized into user-facing error text
    // (it would append raw JSON like {"baseTranslationException":...} to the message).
    const message = [jaqlResponse.details, jaqlResponse.database].filter(Boolean).join(' ');
    throw new Error(message);
  }
}

export function validateCountRowsResponse(
  countRowsResponse: CountRowsResponse | undefined,
): asserts countRowsResponse is CountRowsResponse {
  if (!countRowsResponse || typeof countRowsResponse.countRows !== 'number') {
    throw new TranslatableError('errors.invalidCountRowsResponse');
  }
}
