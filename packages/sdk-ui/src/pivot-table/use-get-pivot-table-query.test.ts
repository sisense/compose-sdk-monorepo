import { useGetPivotTableQuery } from './use-get-pivot-table-query';
import { EMPTY_PIVOT_QUERY_RESULT_DATA } from '@sisense/sdk-data';
import { renderHook, waitFor } from '@testing-library/react';
import { ClientApplication } from '../app/client-application';
import { useSisenseContextMock } from '../sisense-context/__mocks__/sisense-context';
import { executePivotQueryMock } from '../query/__mocks__/execute-query';
import { mockPivotTableProps } from './__mocks__/mocks';

vi.mock('../query/execute-query');
vi.mock('../sisense-context/sisense-context');

describe('useGetPivotTableQuery', () => {
  beforeEach(() => {
    executePivotQueryMock.mockClear();
    useSisenseContextMock.mockReturnValue({
      app: {} as ClientApplication,
      isInitialized: true,
      enableTracking: false,
    });
  });

  it('should run the hook', async () => {
    executePivotQueryMock.mockResolvedValue(EMPTY_PIVOT_QUERY_RESULT_DATA);

    const { result } = renderHook(() => useGetPivotTableQuery(mockPivotTableProps));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.jaql).toBeNull();
    });
  });

  it('should handle query error', async () => {
    const mockError = new Error('Test error');
    executePivotQueryMock.mockRejectedValue(mockError);

    const { result } = renderHook(() => useGetPivotTableQuery(mockPivotTableProps));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(true);
      expect(result.current.isSuccess).toBe(false);
    });
  });
});
