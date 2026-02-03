import { CsvQueryAction, CsvQueryState } from '../../types.js';
import { downloadCsvQueryStateReducer } from './csv-query-state-reducer.js';

describe('downloadCsvQueryStateReducer', () => {
  let initialState: CsvQueryState;

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
    const action: CsvQueryAction = { type: 'loading' };
    const newState = downloadCsvQueryStateReducer(initialState, action);

    expect(newState.isLoading).toBe(true);
    expect(newState.isError).toBe(false);
    expect(newState.isSuccess).toBe(false);
    expect(newState.status).toBe('loading');
    expect(newState.error).toBeUndefined();
    expect(newState.data).toBeUndefined();
  });

  it('should handle data action', () => {
    const testData = new Blob(['test'], { type: 'text/csv' });
    const action: CsvQueryAction = { type: 'success', data: testData };
    const newState = downloadCsvQueryStateReducer(initialState, action);

    expect(newState.isLoading).toBe(false);
    expect(newState.isError).toBe(false);
    expect(newState.isSuccess).toBe(true);
    expect(newState.data).toBe(testData);
    expect(newState.status).toBe('success');
    expect(newState.error).toBeUndefined();
  });

  it('should handle error action', () => {
    const testError = new Error('Test error');
    const action: CsvQueryAction = { type: 'error', error: testError };
    const newState = downloadCsvQueryStateReducer(initialState, action);

    expect(newState.isLoading).toBe(false);
    expect(newState.isError).toBe(true);
    expect(newState.isSuccess).toBe(false);
    expect(newState.data).toBeUndefined();
    expect(newState.status).toBe('error');
    expect(newState.error).toBe(testError);
  });
});
