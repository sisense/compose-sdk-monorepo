/** @vitest-environment jsdom */
import { trackProductEvent } from '@sisense/sdk-tracking';
import { renderHook, waitFor } from '@testing-library/react';
import 'blob-polyfill';
import type { Mock } from 'vitest';

import { ClientApplication } from '../../../../infra/app/client-application.js';
import { useSisenseContextMock } from '../../../../infra/contexts/sisense-context/__mocks__/sisense-context.js';
import { executeCsvQueryMock } from '../../core/__mocks__/execute-query.js';
import { ExecuteQueryParams } from '../../types.js';
import { useExecuteCsvQuery } from './use-execute-csv-query.js';

vi.mock('../../core/execute-query');
vi.mock('@/infra/contexts/sisense-context/sisense-context');

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

const trackProductEventMock = trackProductEvent as Mock<typeof trackProductEvent>;

const mockCsv = 'Name,Age,Location\nJohn,25,New York\nEmma,28,Los Angeles';
const mockData = new Blob([mockCsv], { type: 'text/csv' });

describe('useExecuteCsvQuery', () => {
  const params: ExecuteQueryParams = {
    dataSource: 'Sample ECommerce',
    dimensions: [],
    measures: [],
    filters: [],
    highlights: [],
  };

  beforeEach(() => {
    executeCsvQueryMock.mockClear();
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
    executeCsvQueryMock.mockResolvedValue(mockData);

    const { result } = renderHook(() => useExecuteCsvQuery(params));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toBe(mockCsv);
    });
  });

  it('should provide data stream successfully', async () => {
    executeCsvQueryMock.mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      useExecuteCsvQuery({ ...params, config: { asDataStream: true } }),
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toBe(mockData);
    });
  });

  it('if enabled is set to false, should return initial state', async () => {
    executeCsvQueryMock.mockResolvedValue(mockData);

    const { result } = renderHook(() => useExecuteCsvQuery({ ...params, enabled: false }));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  it('should handle query error', async () => {
    const mockError = new Error('Test error');
    executeCsvQueryMock.mockRejectedValue(mockError);

    const { result } = renderHook(() => useExecuteCsvQuery(params));

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

    const { result } = renderHook(() => useExecuteCsvQuery(params));

    expect(result.current.isError).toBe(true);
    expect(result.current.error?.message).toMatch(/Sisense Context .* not found/i);
  });

  it('should pass "onBeforeQuery" callback to \'executeCsvQuery\' executionConfig', async () => {
    const onBeforeQuery = vi.fn();
    executeCsvQueryMock.mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      useExecuteCsvQuery({
        ...params,
        onBeforeQuery,
      }),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(executeCsvQueryMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          onBeforeQuery,
        }),
      );
    });
  });

  it('should send tracking for the first execution', async () => {
    executeCsvQueryMock.mockResolvedValue(mockData);
    useSisenseContextMock.mockReturnValue({
      app: { httpClient: {} } as ClientApplication,
      isInitialized: true,
      tracking: {
        enabled: true,
      },
    });
    vi.stubGlobal('__PACKAGE_VERSION__', 'unit-test-version');

    const { result } = renderHook(() => useExecuteCsvQuery(params));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toBe(mockCsv);
    });

    expect(trackProductEventMock).toHaveBeenCalledOnce();
    expect(trackProductEventMock).toHaveBeenCalledWith(
      'sdkHookInit',
      expect.objectContaining({
        hookName: 'useExecuteCsvQuery',
      }),
      expect.anything(),
      expect.any(Boolean),
    );
  });
});
