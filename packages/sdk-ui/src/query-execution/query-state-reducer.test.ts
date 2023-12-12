import { QueryResultData } from '@sisense/sdk-data';
import { queryStateReducer } from './query-state-reducer';
import { QueryState, QueryAction } from './types';

describe('queryStateReducer', () => {
  let initialState: QueryState;

  beforeEach(() => {
    initialState = {
      isLoading: true,
      isError: false,
      isSuccess: false,
      error: undefined,
      data: undefined,
      status: 'loading',
    };
  });

  it('should handle startLoading action', () => {
    const action: QueryAction = { type: 'loading' };
    const newState = queryStateReducer(initialState, action);

    expect(newState.isLoading).toBe(true);
    expect(newState.isError).toBe(false);
    expect(newState.isSuccess).toBe(false);
    expect(newState.status).toBe('loading');
    expect(newState.error).toBeUndefined();
    expect(newState.data).toBeUndefined();
  });

  it('should handle data action', () => {
    const testData: QueryResultData = { columns: [], rows: [] };
    const action: QueryAction = { type: 'success', data: testData };
    const newState = queryStateReducer(initialState, action);

    expect(newState.isLoading).toBe(false);
    expect(newState.isError).toBe(false);
    expect(newState.isSuccess).toBe(true);
    expect(newState.data).toBe(testData);
    expect(newState.status).toBe('success');
    expect(newState.error).toBeUndefined();
  });

  it('should handle error action', () => {
    const testError = new Error('Test error');
    const action: QueryAction = { type: 'error', error: testError };
    const newState = queryStateReducer(initialState, action);

    expect(newState.isLoading).toBe(false);
    expect(newState.isError).toBe(true);
    expect(newState.isSuccess).toBe(false);
    expect(newState.data).toBeUndefined();
    expect(newState.status).toBe('error');
    expect(newState.error).toBe(testError);
  });
});
