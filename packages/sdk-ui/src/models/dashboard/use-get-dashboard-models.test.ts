import { renderHook, waitFor } from '@testing-library/react';
import type { Mock } from 'vitest';
import { useGetDashboardModels } from './use-get-dashboard-models.js';
import { getDashboardModels } from './get-dashboard-models.js';
import { useSisenseContext } from '../../sisense-context/sisense-context.js';
import { type ClientApplication } from '../../app/client-application.js';

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

const dashboardsMock = [
  {
    oid: 'dashboard-123',
    title: 'Test Dashboard',
    dataSource: 'Test Datasource',
  },
];

const getDashboarsdModelsMock = getDashboardModels as Mock<
  Parameters<typeof getDashboardModels>,
  ReturnType<typeof getDashboardModels>
>;
const useSisenseContextMock = useSisenseContext as Mock<
  Parameters<typeof useSisenseContext>,
  ReturnType<typeof useSisenseContext>
>;

describe('useGetDashboardModels', () => {
  beforeEach(() => {
    getDashboarsdModelsMock.mockClear();
    useSisenseContextMock.mockReturnValue({
      app: {} as ClientApplication,
      isInitialized: true,
      enableTracking: false,
    });
  });

  it('should fetch dashboard models', async () => {
    getDashboarsdModelsMock.mockResolvedValue(dashboardsMock);
    const { result } = renderHook(() => useGetDashboardModels());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.dashboards).toBe(dashboardsMock);
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
});
