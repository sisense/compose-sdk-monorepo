/** @vitest-environment jsdom */

import { renderHook, waitFor } from '@testing-library/react';
import cloneDeep from 'lodash-es/cloneDeep';
import { trackProductEvent } from '@ethings-os/sdk-tracking';
import { executePivotQueryMock } from '../query/__mocks__/execute-query';
import type { Mock } from 'vitest';
import { EMPTY_PIVOT_QUERY_RESULT_DATA, PivotQueryResultData } from '@ethings-os/sdk-data';
import { ClientApplication } from '../app/client-application';
import { useSisenseContextMock } from '../sisense-context/__mocks__/sisense-context';
import { ExecuteQueryParams } from './types';
import { useExecutePivotQuery, usePivotQueryParamsChanged } from './use-execute-pivot-query';

vi.mock('../query/execute-query');
vi.mock('../sisense-context/sisense-context');
vi.mock('@ethings-os/sdk-tracking', async () => {
  const actual: typeof import('@ethings-os/sdk-tracking') = await vi.importActual(
    '@ethings-os/sdk-tracking',
  );
  return {
    ...actual,
    trackProductEvent: vi.fn().mockImplementation(() => {
      console.log('trackProductEvent');
      return Promise.resolve();
    }),
  };
});

const trackProductEventMock = trackProductEvent as Mock<typeof trackProductEvent>;

describe('useExecutePivotQuery', () => {
  const params: ExecuteQueryParams = {
    dataSource: 'Sample ECommerce',
    dimensions: [],
    measures: [],
    filters: [],
    highlights: [],
  };

  beforeEach(() => {
    executePivotQueryMock.mockClear();
    trackProductEventMock.mockClear();
    useSisenseContextMock.mockReturnValue({
      app: {} as ClientApplication,
      isInitialized: true,
      tracking: {
        enabled: false,
      },
    });
  });

  it('should fetch data successfully', async () => {
    const mockData: PivotQueryResultData = EMPTY_PIVOT_QUERY_RESULT_DATA;
    executePivotQueryMock.mockResolvedValue(mockData);

    const { result } = renderHook(() => useExecutePivotQuery(params));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toBe(mockData);
    });
  });

  it('if enabled is set to false, should return initial state', async () => {
    executePivotQueryMock.mockResolvedValue(EMPTY_PIVOT_QUERY_RESULT_DATA);

    const { result } = renderHook(() => useExecutePivotQuery({ ...params, enabled: false }));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  it('should handle query error', async () => {
    const mockError = new Error('Test error');
    executePivotQueryMock.mockRejectedValue(mockError);

    const { result } = renderHook(() => useExecutePivotQuery(params));

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
      app: { settings: { trackingConfig: { enabled: false } } },
    });

    const { result } = renderHook(() => useExecutePivotQuery(params));

    expect(result.current.isError).toBe(true);
    expect(result.current.error?.message).toMatch(/Sisense Context .* not found/i);
  });

  it('should pass "onBeforeQuery" callback to \'executeQuery\' executionConfig', async () => {
    const onBeforeQuery = vi.fn();
    executePivotQueryMock.mockResolvedValue(EMPTY_PIVOT_QUERY_RESULT_DATA);

    const { result } = renderHook(() =>
      useExecutePivotQuery({
        ...params,
        onBeforeQuery,
      }),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(executePivotQueryMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          onBeforeQuery,
        }),
      );
    });
  });

  it('should send tracking for the first execution', async () => {
    const mockData: PivotQueryResultData = EMPTY_PIVOT_QUERY_RESULT_DATA;
    executePivotQueryMock.mockResolvedValue(mockData);
    useSisenseContextMock.mockReturnValue({
      app: { httpClient: {} } as ClientApplication,
      isInitialized: true,
      tracking: {
        enabled: true,
      },
    });
    vi.stubGlobal('__PACKAGE_VERSION__', 'unit-test-version');

    const { result } = renderHook(() => useExecutePivotQuery(params));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toBe(mockData);
    });

    expect(trackProductEventMock).toHaveBeenCalledOnce();
    expect(trackProductEventMock).toHaveBeenCalledWith(
      'sdkHookInit',
      expect.objectContaining({
        hookName: 'useExecutePivotQuery',
      }),
      expect.anything(),
      expect.any(Boolean),
    );
  });
});

describe('usePivotQueryParamsChanged', () => {
  const initialProps: ExecuteQueryParams = {
    dataSource: 'Sample ECommerce',
    dimensions: [],
    measures: [],
    filters: [],
    highlights: [],
  };

  it('should handle same params', () => {
    const { result, rerender } = renderHook(usePivotQueryParamsChanged, { initialProps });
    expect(result.current).toBe(true);
    rerender(cloneDeep(initialProps));
    expect(result.current).toBe(false);
  });

  it('should handle different params: `dataSource`', () => {
    const { result, rerender } = renderHook(usePivotQueryParamsChanged, { initialProps });
    expect(result.current).toBe(true);
    rerender({ ...cloneDeep(initialProps), dataSource: 'Different Sample ECommerce' });
    expect(result.current).toBe(true);
  });
});
