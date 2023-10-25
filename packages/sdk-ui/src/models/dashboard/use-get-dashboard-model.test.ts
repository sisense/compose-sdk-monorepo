import { renderHook, waitFor } from '@testing-library/react';
import type { Mock } from 'vitest';
import { useGetDashboardModel } from './use-get-dashboard-model';
import { getDashboardModel } from './get-dashboard-model';
import { useSisenseContext } from '../../sisense-context/sisense-context';
import { type ClientApplication } from '../../app/client-application';

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

const dashboardMock = {
  oid: 'dashboard-123',
  title: 'Test Dashboard',
  dataSource: 'Test Datasource',
};

const getDashboardModelMock = getDashboardModel as Mock<
  Parameters<typeof getDashboardModel>,
  ReturnType<typeof getDashboardModel>
>;
const useSisenseContextMock = useSisenseContext as Mock<
  Parameters<typeof useSisenseContext>,
  ReturnType<typeof useSisenseContext>
>;

describe('useGetDashboardModel', () => {
  beforeEach(() => {
    getDashboardModelMock.mockClear();
    useSisenseContextMock.mockReturnValue({
      app: {} as ClientApplication,
      isInitialized: true,
      enableTracking: false,
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
});
