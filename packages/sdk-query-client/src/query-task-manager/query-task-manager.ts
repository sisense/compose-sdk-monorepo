import { AbstractTaskManager, Task, Step } from '@sisense/task-manager';
import { AbortRequestFunction, EmptyObject, JaqlQueryPayload, JaqlResponse } from '../types.js';
import { QueryTaskPassport } from './query-task-passport.js';
import { QueryResultData, Element } from '@sisense/sdk-data';
import { QueryApiDispatcher } from '../query-api-dispatcher/query-api-dispatcher.js';
import { getJaqlQueryPayload } from '../jaql/get-jaql-query-payload.js';
import { getDataFromQueryResult } from '../query-result/index.js';

type QueryTask = Task<QueryTaskPassport>;

export class QueryTaskManager extends AbstractTaskManager {
  /** Map of aborters by task id to be able to cancel sent requests */
  private sentRequestsAbortersMap = new Map<string, AbortRequestFunction>();

  private queryApi: QueryApiDispatcher;

  constructor(queryApi: QueryApiDispatcher) {
    super();
    this.queryApi = queryApi;
  }

  private async sendJaqlQuery(task: QueryTask): Promise<QueryResultData> {
    const { queryDescription, shouldSkipHighlightsWithoutAttributes } = task.passport;
    const jaqlPayload: JaqlQueryPayload = getJaqlQueryPayload(
      queryDescription,
      shouldSkipHighlightsWithoutAttributes,
    );
    const { responsePromise, abortHttpRequest } = this.queryApi.sendJaqlRequest(
      task.passport.queryDescription.dataSource,
      jaqlPayload,
    );
    const taskId = task.passport.taskId;
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

  private cancelJaqlQuery(task: QueryTask) {
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

  public executeQuerySending = super.createFlow<QueryTaskPassport, EmptyObject, QueryResultData>([
    new Step('SEND_JAQL_QUERY', this.sendJaqlQuery.bind(this), this.cancelJaqlQuery.bind(this)),
  ]);
}

export function validateJaqlResponse(jaqlResponse: JaqlResponse): boolean {
  if (jaqlResponse.error) {
    throw new Error(`${jaqlResponse.details} ${jaqlResponse.database ?? ''}`);
  }
  return true;
}
