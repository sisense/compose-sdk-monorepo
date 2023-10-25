/**
 * States of a data load.
 */
export type DataState<Data> = DataLoadingState<Data> | DataErrorState | DataSuccessState<Data>;

/**
 * State of data loading.
 */
export type DataLoadingState<Data> = {
  /** Whether the data is loading */
  isLoading: true;
  /** Whether the data load has failed */
  isError: false;
  /** Whether the data load has succeeded */
  isSuccess: false;
  /** The error if any occurred */
  error: undefined;
  /** The result data if the load has succeeded */
  data: Data | undefined;
  /** The status of the data load */
  status: 'loading';
};

/**
 * State of a data load that has failed.
 */
export type DataErrorState = {
  /** Whether the data is loading */
  isLoading: false;
  /** Whether the data load has failed */
  isError: true;
  /** Whether the data load has succeeded */
  isSuccess: false;
  /** The error if any occurred */
  error: Error;
  /** The result data if the load has succeeded */
  data: undefined;
  /** The status of the data load */
  status: 'error';
};

/**
 * State of a data load that has succeeded.
 */
export type DataSuccessState<Data> = {
  /** Whether the data is loading */
  isLoading: false;
  /** Whether the data load has failed */
  isError: false;
  /** Whether the data load has succeeded */
  isSuccess: true;
  /** The error if any occurred */
  error: undefined;
  /** The result data if the load has succeeded */
  data: Data;
  /** The status of the data load */
  status: 'success';
};

export type DataLoadAction<Data> =
  | {
      type: 'loading';
    }
  | {
      type: 'success';
      data: Data;
    }
  | {
      type: 'error';
      error: Error;
    };

export function dataLoadStateReducer<Data>(
  state: DataState<Data>,
  action: DataLoadAction<Data>,
): DataState<Data> {
  switch (action.type) {
    case 'loading':
      return startLoading(state);
    case 'success':
      return applySuccessData(action.data);
    case 'error':
      return applyError(action.error);
  }
}

function startLoading<Data>(state: DataState<Data>): DataLoadingState<Data> {
  return {
    ...state,
    isLoading: true,
    isError: false,
    isSuccess: false,
    status: 'loading',
    error: undefined,
  };
}

function applySuccessData<Data>(data: Data): DataSuccessState<Data> {
  return {
    isLoading: false,
    isError: false,
    isSuccess: true,
    data,
    status: 'success',
    error: undefined,
  };
}

function applyError(error: Error): DataErrorState {
  return {
    isLoading: false,
    isError: true,
    isSuccess: false,
    data: undefined,
    status: 'error',
    error,
  };
}
