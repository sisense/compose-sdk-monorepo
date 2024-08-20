import { renderHook, waitFor } from '@testing-library/react';
import { trackProductEvent } from '@sisense/sdk-tracking';
import { useExecuteQuery } from './use-execute-query';
import {
  executeQueryMock,
  executeQueryWithCacheMock,
  createExecuteQueryCacheKeyMock,
} from '../query/__mocks__/execute-query';
import type { Mock } from 'vitest';
import { QueryResultData } from '@sisense/sdk-data';
import { ClientApplication } from '../app/client-application';
import { useSisenseContextMock } from '../sisense-context/__mocks__/sisense-context';
import { ExecuteQueryParams } from './types';
import { SisenseContextPayload } from '@/sisense-context/sisense-context';

vi.mock('../query/execute-query');
vi.mock('../sisense-context/sisense-context');

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

const trackProductEventMock = trackProductEvent as Mock<
  Parameters<typeof trackProductEvent>,
  ReturnType<typeof trackProductEvent>
>;

const sisenseContextMock = {
  app: {
    httpClient: {},
    settings: {
      queryCacheConfig: {
        enabled: false,
      },
    },
  } as ClientApplication,
  isInitialized: true,
  tracking: {
    enabled: false,
  },
};

describe('useExecuteQuery', () => {
  const params: ExecuteQueryParams = {
    dataSource: 'Sample ECommerce',
    dimensions: [],
    measures: [],
    filters: [],
    highlights: [],
  };

  const defaultSisenseContext: SisenseContextPayload = {
    app: {
      httpClient: {},
      settings: {
        queryLimit: 20000,
        queryCacheConfig: { enabled: false },
      },
    } as ClientApplication,
    isInitialized: true,
    tracking: {
      enabled: false,
      packageName: 'sdk-ui',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useSisenseContextMock.mockReturnValue(defaultSisenseContext);
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
    useSisenseContextMock.mockReturnValue({
      isInitialized: false,
      appConfig: { trackingConfig: { enabled: false } },
    });

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
      ...defaultSisenseContext,
      tracking: {
        enabled: true,
      },
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

  it('should apply query limit from Sisense context settings', async () => {
    const mockData: QueryResultData = { columns: [], rows: [] };
    executeQueryMock.mockResolvedValue(mockData);
    useSisenseContextMock.mockReturnValue({
      ...defaultSisenseContext,
      app: {
        ...defaultSisenseContext.app,
        settings: {
          queryLimit: 42,
        },
      },
    });

    const { result } = renderHook(() => useExecuteQuery(params));

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(executeQueryMock).toHaveBeenCalledWith(
        expect.objectContaining({
          count: 42,
        }),
        expect.anything(),
        expect.anything(),
      );
    });
  });

  describe('cache enabled', () => {
    beforeEach(() => {
      useSisenseContextMock.mockReturnValue({
        ...sisenseContextMock,
        app: {
          ...sisenseContextMock.app,
          settings: { ...sisenseContextMock.app.settings, queryCacheConfig: { enabled: true } },
        },
      });
      executeQueryWithCacheMock.mockClear();
      trackProductEventMock.mockClear();
      createExecuteQueryCacheKeyMock.mockReturnValue('cache-key');
    });
    it('should call `executeQueryWithCache` function', async () => {
      const mockData: QueryResultData = { columns: [], rows: [] };
      executeQueryWithCacheMock.mockResolvedValue(mockData);

      const { result, rerender } = renderHook((queryParams) => useExecuteQuery(queryParams), {
        initialProps: params,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toBe(mockData);
      });

      rerender({ ...params, dataSource: 'Some_another_datasource' });

      expect(executeQueryWithCacheMock).toHaveBeenCalledTimes(2);
    });

    it('should recall `executeQueryWithCache` if `refetch` called', async () => {
      const mockData: QueryResultData = { columns: [], rows: [] };
      executeQueryWithCacheMock.mockResolvedValue(mockData);

      const { result } = renderHook(() => useExecuteQuery(params));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toBe(mockData);
      });

      result.current.refetch();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toBe(mockData);
      });

      expect(executeQueryWithCacheMock).toHaveBeenCalledTimes(2);
    });
  });
});
