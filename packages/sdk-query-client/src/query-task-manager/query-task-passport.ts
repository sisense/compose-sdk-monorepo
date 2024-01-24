import { TaskPassport } from '@sisense/task-manager';
import { PivotQueryDescription, QueryDescription, QueryExecutionConfigInternal } from '../types.js';

type TaskType = 'SEND_JAQL_QUERY' | 'SEND_DOWNLOAD_CSV_QUERY';

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

export class PivotQueryTaskPassport extends TaskPassport {
  public pivotQueryDescription: PivotQueryDescription;

  public executionConfig: QueryExecutionConfigInternal;

  public type: TaskType;

  constructor(
    type: TaskType,
    pivotQueryDescription: PivotQueryDescription,
    executionConfig: QueryExecutionConfigInternal,
  ) {
    super();
    this.pivotQueryDescription = pivotQueryDescription;
    this.type = type;
    this.executionConfig = executionConfig;
  }
}
