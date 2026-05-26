import type { ExcelQueryAction, ExcelQueryState } from '../../types.js';
import { downloadExcelQueryStateReducer } from './excel-query-state-reducer.js';

describe('downloadExcelQueryStateReducer', () => {
  let initialState: ExcelQueryState;

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

  it('should handle loading action', () => {
    const action: ExcelQueryAction = { type: 'loading' };
    const newState = downloadExcelQueryStateReducer(initialState, action);

    expect(newState.isLoading).toBe(true);
    expect(newState.isError).toBe(false);
    expect(newState.isSuccess).toBe(false);
    expect(newState.status).toBe('loading');
    expect(newState.error).toBeUndefined();
    expect(newState.data).toBeUndefined();
  });

  it('should handle success action with blob', () => {
    const testData = new Blob(['x'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const action: ExcelQueryAction = { type: 'success', data: testData };
    const newState = downloadExcelQueryStateReducer(initialState, action);

    expect(newState.isLoading).toBe(false);
    expect(newState.isError).toBe(false);
    expect(newState.isSuccess).toBe(true);
    expect(newState.data).toBe(testData);
    expect(newState.status).toBe('success');
    expect(newState.error).toBeUndefined();
  });

  it('should handle error action', () => {
    const testError = new Error('Test error');
    const action: ExcelQueryAction = { type: 'error', error: testError };
    const newState = downloadExcelQueryStateReducer(initialState, action);

    expect(newState.isLoading).toBe(false);
    expect(newState.isError).toBe(true);
    expect(newState.isSuccess).toBe(false);
    expect(newState.data).toBeUndefined();
    expect(newState.status).toBe('error');
    expect(newState.error).toBe(testError);
  });
});
