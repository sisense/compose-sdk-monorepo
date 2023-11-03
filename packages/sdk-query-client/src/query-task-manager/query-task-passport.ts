import { TaskPassport } from '@sisense/task-manager';
import { QueryDescription, QueryExecutionConfigInternal } from '../types.js';

type TaskType = 'SEND_JAQL_QUERY';

export class QueryTaskPassport extends TaskPassport {
  public queryDescription: QueryDescription;

  public executionConfig: QueryExecutionConfigInternal;

  public type: TaskType;

  constructor(
    type: TaskType,
    queryDescription: QueryDescription,
    executionConfig: QueryExecutionConfigInternal,
  ) {
    super();
    this.queryDescription = queryDescription;
    this.type = type;
    this.executionConfig = executionConfig;
  }
}
