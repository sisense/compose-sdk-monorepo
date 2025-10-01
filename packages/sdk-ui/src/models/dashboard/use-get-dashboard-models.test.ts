/** @vitest-environment jsdom */
import { renderHook, waitFor } from '@testing-library/react';
import { trackProductEvent } from '@ethings-os/sdk-tracking';
import type { Mock } from 'vitest';
import { useGetDashboardModels } from './use-get-dashboard-models.js';
import { getDashboardModels } from './get-dashboard-models.js';
import { useSisenseContext } from '../../sisense-context/sisense-context.js';
import { type ClientApplication } from '../../app/client-application.js';
import { sampleEcommerceDashboard } from '../__mocks__/sample-ecommerce-dashboard.js';
import { sampleHealthcareDashboard } from '../__mocks__/sample-healthcare-dashboard.js';
import { DashboardModel, dashboardModelTranslator } from '@/models';
const dashboardModelsMock: DashboardModel[] = [
  sampleEcommerceDashboard,
  sampleHealthcareDashboard,
].map((dashboard) => dashboardModelTranslator.fromDashboardDto(dashboard));

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

vi.mock('../../sisense-context/sisense-context', async () => {
  const actual: typeof import('../../sisense-context/sisense-context.js') = await vi.importActual(
    '../../sisense-context/sisense-context',
  );

  return {
    ...actual,
    useSisenseContext: vi.fn(),
  };
});

vi.mock('./get-dashboard-models', () => ({
  getDashboardModels: vi.fn(),
}));

const getDashboarsdModelsMock = getDashboardModels as Mock<typeof getDashboardModels>;
const useSisenseContextMock = useSisenseContext as Mock<typeof useSisenseContext>;

const trackProductEventMock = trackProductEvent as Mock<typeof trackProductEvent>;

describe('useGetDashboardModels', () => {
  beforeEach(() => {
    getDashboarsdModelsMock.mockClear();
    trackProductEventMock.mockClear();
    useSisenseContextMock.mockReturnValue({
      app: {} as ClientApplication,
      isInitialized: true,
      tracking: {
        enabled: false,
        packageName: 'sdk-ui',
      },
      errorBoundary: {
        showErrorBox: true,
      },
    });
  });

  it('should fetch dashboard models', async () => {
    getDashboarsdModelsMock.mockResolvedValue(dashboardModelsMock);
    const { result } = renderHook(() => useGetDashboardModels());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.dashboards).toBe(dashboardModelsMock);
    });
  });

  it('should handle dashboards fetch error', async () => {
    const mockError = new Error('Dashboards fetch error');
    getDashboarsdModelsMock.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useGetDashboardModels());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(mockError);
    });
  });

  it('should send tracking for the first execution', async () => {
    getDashboarsdModelsMock.mockResolvedValue(dashboardModelsMock);

    useSisenseContextMock.mockReturnValue({
      app: { httpClient: {} } as ClientApplication,
      isInitialized: true,
      tracking: {
        enabled: true,
        packageName: 'sdk-ui',
      },
      errorBoundary: {
        showErrorBox: true,
      },
    });
    vi.stubGlobal('__PACKAGE_VERSION__', 'unit-test-version');

    const { result } = renderHook(() => useGetDashboardModels());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.dashboards).toBe(dashboardModelsMock);
    });

    expect(trackProductEventMock).toHaveBeenCalledOnce();
    expect(trackProductEventMock).toHaveBeenCalledWith(
      'sdkHookInit',
      expect.objectContaining({
        hookName: 'useGetDashboardModels',
      }),
      expect.anything(),
      expect.any(Boolean),
    );
  });
});
