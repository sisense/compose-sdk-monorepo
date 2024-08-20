/** @vitest-environment jsdom */

import { renderHook, waitFor } from '@testing-library/react';
import type { Mock } from 'vitest';
import { trackProductEvent } from '@sisense/sdk-tracking';
import { useGetDashboardModel } from './use-get-dashboard-model';
import { getDashboardModel } from './get-dashboard-model';
import { useSisenseContext } from '../../sisense-context/sisense-context';
import { type ClientApplication } from '../../app/client-application';
import { DashboardModel } from '@/models';

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

vi.mock('../../sisense-context/sisense-context', async () => {
  const actual: typeof import('../../sisense-context/sisense-context') = await vi.importActual(
    '../../sisense-context/sisense-context',
  );

  return {
    ...actual,
    useSisenseContext: vi.fn(),
  };
});

vi.mock('./get-dashboard-model', () => ({
  getDashboardModel: vi.fn(),
}));

const dashboardMock = new DashboardModel({
  oid: 'dashboard-123',
  title: 'Test Dashboard',
  datasource: {
    title: 'Test Datasource',
    id: 'Test Datasource',
  },
});

const getDashboardModelMock = getDashboardModel as Mock<
  Parameters<typeof getDashboardModel>,
  ReturnType<typeof getDashboardModel>
>;
const useSisenseContextMock = useSisenseContext as Mock<
  Parameters<typeof useSisenseContext>,
  ReturnType<typeof useSisenseContext>
>;
const trackProductEventMock = trackProductEvent as Mock<
  Parameters<typeof trackProductEvent>,
  ReturnType<typeof trackProductEvent>
>;

describe('useGetDashboardModel', () => {
  beforeEach(() => {
    getDashboardModelMock.mockClear();
    trackProductEventMock.mockClear();
    useSisenseContextMock.mockReturnValue({
      app: {} as ClientApplication,
      isInitialized: true,
      tracking: {
        enabled: false,
        packageName: 'sdk-ui',
      },
    });
  });

  it('should fetch a dashboard model', async () => {
    getDashboardModelMock.mockResolvedValue(dashboardMock);
    const { result } = renderHook(() =>
      useGetDashboardModel({
        dashboardOid: dashboardMock.oid,
      }),
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.dashboard).toBe(dashboardMock);
    });
  });

  it('should handle dashboard fetch error', async () => {
    const mockError = new Error('Dashboard fetch error');
    getDashboardModelMock.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() =>
      useGetDashboardModel({
        dashboardOid: dashboardMock.oid,
      }),
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(mockError);
    });
  });

  it('should send tracking for the first execution', async () => {
    useSisenseContextMock.mockReturnValue({
      app: { httpClient: {} } as ClientApplication,
      isInitialized: true,
      tracking: {
        enabled: true,
        packageName: 'sdk-ui',
      },
    });
    vi.stubGlobal('__PACKAGE_VERSION__', 'unit-test-version');

    const { result } = renderHook(() =>
      useGetDashboardModel({
        dashboardOid: dashboardMock.oid,
      }),
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.dashboard).toBe(dashboardMock);
    });

    expect(trackProductEventMock).toHaveBeenCalledOnce();
    expect(trackProductEventMock).toHaveBeenCalledWith(
      'sdkHookInit',
      expect.objectContaining({
        hookName: 'useGetDashboardModel',
      }),
      expect.anything(),
      expect.any(Boolean),
    );
  });
});
