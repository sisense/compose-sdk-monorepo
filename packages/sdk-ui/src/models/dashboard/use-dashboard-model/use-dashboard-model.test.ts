import { dashboardModelTranslator, useDashboardModel, UseDashboardModelActionType } from '@/models';
import { act, renderHook } from '@testing-library/react';
import { DimensionalAttribute, MembersFilter } from '@sisense/sdk-data';
import { SisenseContextPayload, useSisenseContext } from '@/sisense-context/sisense-context';
import type { Mock } from 'vitest';
import { Authenticator, HttpClient } from '@sisense/sdk-rest-client';
import { ClientApplication } from '@/app/client-application';

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

vi.mock('../../../sisense-context/sisense-context', async () => {
  const actual: typeof import('../../../sisense-context/sisense-context') = await vi.importActual(
    '../../../sisense-context/sisense-context',
  );

  return {
    ...actual,
    useSisenseContext: vi.fn(),
  };
});

const patchDashboardMock = vi.fn().mockImplementation(() => Promise.resolve());
vi.mock('@/api/rest-api', async () => {
  return {
    useGetApi: () => ({
      patchDashboard: patchDashboardMock,
    }),
  };
});

vi.mock('../use-get-dashboard-model', () => ({
  useGetDashboardModel: () => {
    return {
      isLoading: false,
      isError: false,
      isSuccess: true,
      dashboard: dashboardMock,
      status: 'success',
    };
  },
}));

const dashboardMock = dashboardModelTranslator.fromDashboardDto({
  oid: 'dashboard-123',
  title: 'Test Dashboard',
  datasource: {
    title: 'Test Datasource',
    id: 'Test Datasource',
  },
  widgets: [],
});

const useSisenseContextMock = useSisenseContext as Mock<
  Parameters<typeof useSisenseContext>,
  ReturnType<typeof useSisenseContext>
>;

describe('useGetDashboardModel', () => {
  beforeEach(() => {
    patchDashboardMock.mockClear();
    useSisenseContextMock.mockReset();
    useSisenseContextMock.mockReturnValue({
      tracking: {},
      app: {
        httpClient: {
          auth: {
            type: 'bearer',
          } as Authenticator,
        } as HttpClient,
      } as ClientApplication,
    } as SisenseContextPayload);
  });

  it('should load and return dashboard model', async () => {
    const { result } = renderHook(() =>
      useDashboardModel({
        dashboardOid: dashboardMock.oid,
        includeWidgets: true,
        includeFilters: true,
        persist: true,
      }),
    );

    expect(result.current.dashboard).toEqual(dashboardMock);
  });

  it('should update and persist dashboard filters', async () => {
    const newFilters = [new MembersFilter(new DimensionalAttribute('Date', '[TEST]'), ['test-1'])];
    const { result } = renderHook(() =>
      useDashboardModel({
        dashboardOid: dashboardMock.oid,
        includeWidgets: true,
        includeFilters: true,
        persist: true,
      }),
    );

    const { dispatchChanges } = result.current;
    act(() => {
      dispatchChanges({
        type: UseDashboardModelActionType.FILTERS_UPDATE,
        payload: newFilters,
      });
    });

    expect(result.current.dashboard).toEqual({
      ...dashboardMock,
      filters: newFilters,
    });
    expect(patchDashboardMock).toHaveBeenCalledTimes(1);
  });

  it('should update and not persist dashboard filters in case of WAT auth', async () => {
    useSisenseContextMock.mockReturnValue({
      app: {
        httpClient: {
          auth: {
            type: 'wat',
          } as Authenticator,
        } as HttpClient,
      } as ClientApplication,
    } as SisenseContextPayload);

    const newFilters = [new MembersFilter(new DimensionalAttribute('Date', '[TEST]'), ['test-1'])];
    const { result } = renderHook(() =>
      useDashboardModel({
        dashboardOid: dashboardMock.oid,
        includeWidgets: true,
        includeFilters: true,
        persist: true,
      }),
    );

    const { dispatchChanges } = result.current;
    act(() => {
      dispatchChanges({
        type: UseDashboardModelActionType.FILTERS_UPDATE,
        payload: newFilters,
      });
    });

    expect(result.current.dashboard).toEqual({
      ...dashboardMock,
      filters: newFilters,
    });
    expect(patchDashboardMock).toHaveBeenCalledTimes(0);
  });

  it('should update dashboard filters without persist', async () => {
    const newFilters = [new MembersFilter(new DimensionalAttribute('Date', '[TEST]'), ['test-1'])];
    const { result } = renderHook(() =>
      useDashboardModel({
        dashboardOid: dashboardMock.oid,
        includeWidgets: true,
        includeFilters: true,
        persist: false,
      }),
    );

    const { dispatchChanges } = result.current;
    act(() => {
      dispatchChanges({
        type: UseDashboardModelActionType.FILTERS_UPDATE,
        payload: newFilters,
      });
    });

    expect(result.current.dashboard).toEqual({
      ...dashboardMock,
      filters: newFilters,
    });
    expect(patchDashboardMock).toHaveBeenCalledTimes(0);
  });
});
