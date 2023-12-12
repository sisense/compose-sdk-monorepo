/** @vitest-environment jsdom */

import { renderHook, waitFor } from '@testing-library/react';
import { trackProductEvent } from '@sisense/sdk-tracking';
import { useExecuteQuery } from './use-execute-query';
import { executeQuery } from '../query/execute-query';
import type { Mock } from 'vitest';
import { QueryResultData } from '@sisense/sdk-data';
import { ClientApplication } from '../app/client-application';
import { useSisenseContext } from '../sisense-context/sisense-context';
import { ExecuteQueryParams } from './types';

vi.mock('../query/execute-query', () => ({
  executeQuery: vi.fn(),
}));
vi.mock('../sisense-context/sisense-context', async () => {
  const actual: typeof import('../sisense-context/sisense-context') = await vi.importActual(
    '../sisense-context/sisense-context',
  );

  return {
    ...actual,
    useSisenseContext: vi.fn(),
  };
});

vi.mock('@sisense/sdk-tracking', async () => {
  const actual: typeof import('@sisense/sdk-tracking') = await vi.importActual(
    '@sisense/sdk-tracking',
  );
  return {
    ...actual,
    trackProductEvent: vi.fn().mockImplementation(() => {
      console.log('trackProductEvent');
      return Promise.resolve();
    }),
  };
});

const executeQueryMock = executeQuery as Mock<
  Parameters<typeof executeQuery>,
  ReturnType<typeof executeQuery>
>;
const useSisenseContextMock = useSisenseContext as Mock<
  Parameters<typeof useSisenseContext>,
  ReturnType<typeof useSisenseContext>
>;

const trackProductEventMock = trackProductEvent as Mock<
  Parameters<typeof trackProductEvent>,
  ReturnType<typeof trackProductEvent>
>;

describe('useExecuteQuery', () => {
  const params: ExecuteQueryParams = {
    dataSource: 'Sample ECommerce',
    dimensions: [],
    measures: [],
    filters: [],
    highlights: [],
  };

  beforeEach(() => {
    executeQueryMock.mockClear();
    useSisenseContextMock.mockReturnValue({
      app: {} as ClientApplication,
      isInitialized: true,
      enableTracking: false,
    });
  });

  it('should fetch data successfully', async () => {
    const mockData: QueryResultData = { columns: [], rows: [] };
    executeQueryMock.mockResolvedValue(mockData);

    const { result } = renderHook(() => useExecuteQuery(params));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toBe(mockData);
    });
  });

  it('if enabled is set to false, should return initial state', async () => {
    const mockData: QueryResultData = { columns: [], rows: [] };
    executeQueryMock.mockResolvedValue(mockData);

    const { result } = renderHook(() => useExecuteQuery({ ...params, enabled: false }));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  it('should handle query error', async () => {
    const mockError = new Error('Test error');
    executeQueryMock.mockRejectedValue(mockError);

    const { result } = renderHook(() => useExecuteQuery(params));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(mockError);
    });
  });

  it('should handle missing Sisense context', () => {
    useSisenseContextMock.mockReturnValue({ isInitialized: false, enableTracking: false });

    const { result } = renderHook(() => useExecuteQuery(params));

    expect(result.current.isError).toBe(true);
    expect(result.current.error?.message).toMatch(/Sisense Context .* not found/i);
  });

  it('should pass "onBeforeQuery" callback to \'executeQuery\' executionConfig', async () => {
    const onBeforeQuery = vi.fn();
    const mockData: QueryResultData = { columns: [], rows: [] };
    executeQueryMock.mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      useExecuteQuery({
        ...params,
        onBeforeQuery,
      }),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(executeQueryMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          onBeforeQuery,
        }),
      );
    });
  });

  it('should send tracking for the first execution', async () => {
    const mockData: QueryResultData = { columns: [], rows: [] };
    executeQueryMock.mockResolvedValue(mockData);
    useSisenseContextMock.mockReturnValue({
      app: { httpClient: {} } as ClientApplication,
      isInitialized: true,
      enableTracking: true,
    });
    vi.stubGlobal('__PACKAGE_VERSION__', 'unit-test-version');

    const { result } = renderHook(() => useExecuteQuery(params));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toBe(mockData);
    });

    expect(trackProductEventMock).toHaveBeenCalledOnce();
    expect(trackProductEventMock).toHaveBeenCalledWith(
      'sdkHookInit',
      expect.objectContaining({
        hookName: 'useExecuteQuery',
      }),
      expect.anything(),
      expect.any(Boolean),
    );
  });
});
