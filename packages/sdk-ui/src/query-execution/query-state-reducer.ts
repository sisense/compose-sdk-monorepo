import { QueryResultData } from '@sisense/sdk-data';

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

export type QueryAction =
  | {
      type: 'loading';
    }
  | {
      type: 'success';
      data: QueryResultData;
    }
  | {
      type: 'error';
      error: Error;
    };

export function queryStateReducer(state: QueryState, action: QueryAction): QueryState {
  switch (action.type) {
    case 'loading':
      return startLoading(state);
    case 'success':
      return applySuccessData(action.data);
    case 'error':
      return applyError(action.error);
  }
}

function startLoading(state: QueryState): QueryLoadingState {
  return {
    ...state,
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'loading',
    error: undefined,
  };
}

function applySuccessData(data: QueryResultData): QuerySuccessState {
  return {
    isLoading: false,
    isError: false,
    isSuccess: true,
    data,
    status: 'success',
    error: undefined,
  };
}

function applyError(error: Error): QueryErrorState {
  return {
    isLoading: false,
    isError: true,
    isSuccess: false,
    data: undefined,
    status: 'error',
    error,
  };
}
