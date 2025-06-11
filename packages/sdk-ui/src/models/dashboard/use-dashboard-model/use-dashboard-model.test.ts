import {
  dashboardModelTranslator,
  useDashboardModel,
  UseDashboardModelActionType,
  widgetModelTranslator,
  WidgetsPanelColumnLayout,
} from '@/models';
import { act, renderHook, waitFor } from '@testing-library/react';
import { filterFactory } from '@sisense/sdk-data';
import * as DM from '../../../__test-helpers__/sample-ecommerce';
import { SisenseContextPayload, useSisenseContext } from '@/sisense-context/sisense-context';
import type { Mock } from 'vitest';
import { Authenticator, HttpClient } from '@sisense/sdk-rest-client';
import { ClientApplication } from '@/app/client-application';
import { sampleEcommerceDashboard } from '../../__mocks__/sample-ecommerce-dashboard';

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
const NEW_WIDGET_OID = 'widget-123';
const addWidgetToDashboardMock = vi.fn().mockImplementation(() =>
  Promise.resolve({
    ...sampleEcommerceDashboard.widgets![0]!,
    oid: NEW_WIDGET_OID,
  }),
);
vi.mock('@/api/rest-api', async () => {
  return {
    useRestApi: () => ({
      isReady: true,
      restApi: {
        patchDashboard: patchDashboardMock,
        addWidgetToDashboard: addWidgetToDashboardMock,
      },
    }),
  };
});

vi.mock('../use-get-dashboard-model', () => ({
  useGetDashboardModelInternal: () => {
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

const useSisenseContextMock = useSisenseContext as Mock<typeof useSisenseContext>;

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
    const newFilters = [filterFactory.members(DM.Commerce.Date, ['02/01/2021'])];
    const { result } = renderHook(() =>
      useDashboardModel({
        dashboardOid: dashboardMock.oid,
        includeWidgets: true,
        includeFilters: true,
        persist: true,
      }),
    );
    await waitFor(() => {
      expect(result.current.dashboard).toBeTruthy();
    });

    const { dispatchChanges } = result.current;
    act(() => {
      dispatchChanges({
        type: UseDashboardModelActionType.FILTERS_UPDATE,
        payload: newFilters,
      });
    });

    await waitFor(() => {
      expect(result.current.dashboard).toEqual({
        ...dashboardMock,
        filters: newFilters,
      });
    });
    expect(patchDashboardMock).toHaveBeenCalledTimes(1);
  });

  it('should update and persist dashboard widgets', async () => {
    const newWidget = widgetModelTranslator.fromWidgetDto(sampleEcommerceDashboard.widgets![0]!);
    const { result } = renderHook(() =>
      useDashboardModel({
        dashboardOid: dashboardMock.oid,
        includeWidgets: true,
        persist: true,
      }),
    );
    await waitFor(() => {
      expect(result.current.dashboard).toBeTruthy();
    });

    const { dispatchChanges } = result.current;
    act(() => {
      dispatchChanges({
        type: UseDashboardModelActionType.ADD_WIDGET,
        payload: newWidget,
      });
    });

    await waitFor(() => {
      // id is assigned by the server
      expect(result.current.dashboard?.widgets[0].dataOptions).toStrictEqual(
        expect.objectContaining(newWidget.dataOptions),
      );
      expect(result.current.dashboard?.widgets[0].oid).toBe(NEW_WIDGET_OID);
    });
    await waitFor(() => {
      expect(addWidgetToDashboardMock).toHaveBeenCalledTimes(1);
    });
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

    const newFilters = [filterFactory.members(DM.Commerce.Date, ['01/01/2021'])];
    const { result } = renderHook(() =>
      useDashboardModel({
        dashboardOid: dashboardMock.oid,
        includeWidgets: true,
        includeFilters: true,
        persist: true,
      }),
    );
    await waitFor(() => {
      expect(result.current.dashboard).toBeTruthy();
    });

    const { dispatchChanges } = result.current;
    act(() => {
      dispatchChanges({
        type: UseDashboardModelActionType.FILTERS_UPDATE,
        payload: newFilters,
      });
    });

    await waitFor(() => {
      expect(result.current.dashboard).toEqual(
        expect.objectContaining({
          filters: newFilters,
        }),
      );
    });
    expect(patchDashboardMock).toHaveBeenCalledTimes(0);
  });

  it('should update dashboard filters without persist', async () => {
    const newFilters = [filterFactory.members(DM.Commerce.Date, ['03/01/2021'])];
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

  it('should update and persist dashboard layout', async () => {
    const newLayout: WidgetsPanelColumnLayout = {
      columns: [
        {
          widthPercentage: 100,
          rows: [
            {
              cells: [
                {
                  widthPercentage: 100,
                  widgetId: 'widget-1',
                },
              ],
            },
          ],
        },
      ],
    };

    const { result } = renderHook(() =>
      useDashboardModel({
        dashboardOid: dashboardMock.oid,
        includeWidgets: true,
        persist: true,
      }),
    );

    await waitFor(() => {
      expect(result.current.dashboard).toBeTruthy();
    });

    const { dispatchChanges } = result.current;
    act(() => {
      dispatchChanges({
        type: UseDashboardModelActionType.WIDGETS_PANEL_LAYOUT_UPDATE,
        payload: newLayout,
      });
    });

    await waitFor(() => {
      expect(result.current.dashboard).toEqual({
        ...dashboardMock,
        layoutOptions: { widgetsPanel: newLayout },
      });
    });
    expect(patchDashboardMock).toHaveBeenCalledTimes(1);
  });
});
