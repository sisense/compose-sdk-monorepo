import { AbstractTaskManager, Task, Step } from '@sisense/task-manager';
import { AbortRequestFunction, JaqlQueryPayload, JaqlResponse } from '../types.js';
import { PivotQueryTaskPassport, QueryTaskPassport } from './query-task-passport.js';
import { QueryResultData, Element, PivotQueryResultData } from '@sisense/sdk-data';
import { QueryApiDispatcher } from '../query-api-dispatcher/query-api-dispatcher.js';
import { getJaqlQueryPayload, getPivotJaqlQueryPayload } from '../jaql/get-jaql-query-payload.js';
import { getDataFromQueryResult } from '../query-result/index.js';
import { JaqlRequest, PivotClient } from '@sisense/sdk-pivot-client';

import { QUERY_DEFAULT_LIMIT } from '../query-client.js';
import { EmptyObject } from '../helpers/utility-types.js';
import { TranslatableError } from '../translation/translatable-error.js';

type QueryTask = Task<QueryTaskPassport>;
type PivotQueryTask = Task<PivotQueryTaskPassport>;

export class QueryTaskManager extends AbstractTaskManager {
  /** Map of aborters by task id to be able to cancel sent requests */
  private sentRequestsAbortersMap = new Map<string, AbortRequestFunction>();

  private queryApi: QueryApiDispatcher;

  /**
   * Client for handling pivot data
   */
  private pivotClient: PivotClient;

  constructor(queryApi: QueryApiDispatcher, pivotClient: PivotClient) {
    super();
    this.queryApi = queryApi;
    this.pivotClient = pivotClient;
  }

  private async prepareJaqlPayload(task: QueryTask): Promise<JaqlQueryPayload> {
    const { queryDescription, executionConfig } = task.passport;
    const jaqlPayload: JaqlQueryPayload = getJaqlQueryPayload(
      queryDescription,
      executionConfig.shouldSkipHighlightsWithoutAttributes,
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

    // extra columns are assumed to have been added by advanced analytics functions
    const extraColumns = (jaqlResponse.headers || [])
      .slice(metadata.length)
      .map((c) => ({ name: c, type: 'number' })) as Element[];

    return getDataFromQueryResult(jaqlResponse, [...metadata, ...extraColumns]);
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
   * Prepares the JAQL payload for the pivot query
   *
   * @param task
   * @returns JAQL payload
   */
  private async preparePivotJaqlPayload(task: PivotQueryTask): Promise<JaqlQueryPayload> {
    const { pivotQueryDescription, executionConfig } = task.passport;
    const jaqlPayload: JaqlQueryPayload = getPivotJaqlQueryPayload(
      pivotQueryDescription,
      executionConfig.shouldSkipHighlightsWithoutAttributes,
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
    return this.pivotClient.queryData(
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
    throw new Error(
      `${jaqlResponse.details} ${jaqlResponse.database ?? ''} ${
        jaqlResponse.extraDetails ? JSON.stringify(jaqlResponse.extraDetails) : ''
      }`,
    );
  }
}
