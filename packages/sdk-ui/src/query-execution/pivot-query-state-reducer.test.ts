import { EMPTY_PIVOT_QUERY_RESULT_DATA, PivotQueryResultData } from '@sisense/sdk-data';
import { pivotQueryStateReducer } from './pivot-query-state-reducer';
import { PivotQueryState, PivotQueryAction } from './types';

describe('pivotQueryStateReducer', () => {
  let initialState: PivotQueryState;

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
    const action: PivotQueryAction = { type: 'loading' };
    const newState = pivotQueryStateReducer(initialState, action);

    expect(newState.isLoading).toBe(true);
    expect(newState.isError).toBe(false);
    expect(newState.isSuccess).toBe(false);
    expect(newState.status).toBe('loading');
    expect(newState.error).toBeUndefined();
    expect(newState.data).toBeUndefined();
  });

  it('should handle data action', () => {
    const testData: PivotQueryResultData = EMPTY_PIVOT_QUERY_RESULT_DATA;
    const action: PivotQueryAction = { type: 'success', data: testData };
    const newState = pivotQueryStateReducer(initialState, action);

    expect(newState.isLoading).toBe(false);
    expect(newState.isError).toBe(false);
    expect(newState.isSuccess).toBe(true);
    expect(newState.data).toBe(testData);
    expect(newState.status).toBe('success');
    expect(newState.error).toBeUndefined();
  });

  it('should handle error action', () => {
    const testError = new Error('Test error');
    const action: PivotQueryAction = { type: 'error', error: testError };
    const newState = pivotQueryStateReducer(initialState, action);

    expect(newState.isLoading).toBe(false);
    expect(newState.isError).toBe(true);
    expect(newState.isSuccess).toBe(false);
    expect(newState.data).toBeUndefined();
    expect(newState.status).toBe('error');
    expect(newState.error).toBe(testError);
  });
});
