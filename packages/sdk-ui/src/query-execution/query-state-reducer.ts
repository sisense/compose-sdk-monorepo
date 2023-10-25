import { QueryResultData } from '@sisense/sdk-data';
import { DataLoadAction, dataLoadStateReducer } from '../common/hooks/data-load-state-reducer';

/**
 * State of a query execution.
 */
export type QueryState = QueryLoadingState | QueryErrorState | QuerySuccessState;

/**
 * State of a query execution that is loading.
 */
export type QueryLoadingState = {
  /** Whether the query is loading */
  isLoading: true;
  /** Whether the query has failed */
  isError: false;
  /** Whether the query has succeeded */
  isSuccess: false;
  /** The error if any occurred */
  error: undefined;
  /** The result data if the query has succeeded */
  data: QueryResultData | undefined;
  /** The status of the query execution */
  status: 'loading';
};

/**
 * State of a query execution that has failed.
 */
export type QueryErrorState = {
  /** Whether the query is loading */
  isLoading: false;
  /** Whether the query has failed */
  isError: true;
  /** Whether the query has succeeded */
  isSuccess: false;
  /** The error if any occurred */
  error: Error;
  /** The result data if the query has succeeded */
  data: undefined;
  /** The status of the query execution */
  status: 'error';
};

/**
 * State of a query execution that has succeeded.
 */
export type QuerySuccessState = {
  /** Whether the query is loading */
  isLoading: false;
  /** Whether the query has failed */
  isError: false;
  /** Whether the query has succeeded */
  isSuccess: true;
  /** The error if any occurred */
  error: undefined;
  /** The result data if the query has succeeded */
  data: QueryResultData;
  /** The status of the query execution */
  status: 'success';
};

export type QueryAction = DataLoadAction<QueryResultData>;

export function queryStateReducer(state: QueryState, action: QueryAction): QueryState {
  return dataLoadStateReducer<QueryResultData>(state, action);
}
