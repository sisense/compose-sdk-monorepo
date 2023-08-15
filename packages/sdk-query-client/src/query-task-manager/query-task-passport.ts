import { TaskPassport } from '@sisense/task-manager';
import { QueryDescription } from '../types.js';

type TaskType = 'SEND_JAQL_QUERY';

export class QueryTaskPassport extends TaskPassport {
  public queryDescription: QueryDescription;

  public shouldSkipHighlightsWithoutAttributes: boolean;

  public type: TaskType;

  constructor(
    type: TaskType,
    queryDescription: QueryDescription,
    shouldSkipHighlightsWithoutAttributes?: boolean,
  ) {
    super();
    this.queryDescription = queryDescription;
    this.type = type;
    this.shouldSkipHighlightsWithoutAttributes = shouldSkipHighlightsWithoutAttributes ?? false;
  }
}
