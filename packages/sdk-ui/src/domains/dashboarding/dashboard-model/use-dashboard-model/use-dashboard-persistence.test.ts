import { filterFactory } from '@sisense/sdk-data';
import { Authenticator, HttpClient } from '@sisense/sdk-rest-client';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { Mock } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import {
  DashboardModel,
  dashboardModelTranslator,
  UseDashboardModelActionType,
} from '@/domains/dashboarding/dashboard-model';
import { widgetModelTranslator } from '@/domains/widgets/widget-model';
import { ClientApplication } from '@/infra/app/client-application';
import {
  SisenseContextPayload,
  useSisenseContext,
} from '@/infra/contexts/sisense-context/sisense-context';

import { sampleEcommerceDashboard } from '../__mocks__/sample-ecommerce-dashboard';
import { useDashboardPersistence } from './use-dashboard-persistence';

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

vi.mock('@/infra/contexts/sisense-context/sisense-context', async () => {
  const actual: typeof import('@/infra/contexts/sisense-context/sisense-context') =
    await vi.importActual('@/infra/contexts/sisense-context/sisense-context');

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
const deleteWidgetFromDashboardMock = vi.fn().mockImplementation(() => Promise.resolve());

vi.mock('@/infra/api/rest-api', async () => {
  return {
    useRestApi: () => ({
      isReady: true,
      restApi: {
        patchDashboard: patchDashboardMock,
        addWidgetToDashboard: addWidgetToDashboardMock,
        deleteWidgetFromDashboard: deleteWidgetFromDashboardMock,
      },
    }),
  };
});

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

describe('useDashboardPersistence', () => {
  beforeEach(() => {
    patchDashboardMock.mockClear();
    addWidgetToDashboardMock.mockClear();
    deleteWidgetFromDashboardMock.mockClear();
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

  it('should initialize with provided dashboard model', () => {
    const { result } = renderHook(() =>
      useDashboardPersistence({
        dashboard: dashboardMock,
        persist: true,
      }),
    );

    expect(result.current.dashboard).toEqual(dashboardMock);
    expect(typeof result.current.dispatchChanges).toBe('function');
  });

  it('should handle null dashboard model', () => {
    const { result } = renderHook(() =>
      useDashboardPersistence({
        dashboard: null,
        persist: true,
      }),
    );

    expect(result.current.dashboard).toBeNull();
    expect(typeof result.current.dispatchChanges).toBe('function');
  });

  it('should update dashboard model when external dashboard changes', () => {
    const { result, rerender } = renderHook(
      ({ dashboard }) =>
        useDashboardPersistence({
          dashboard,
          persist: true,
        }),
      {
        initialProps: { dashboard: dashboardMock },
      },
    );

    expect(result.current.dashboard).toEqual(dashboardMock);

    const updatedDashboard = {
      ...dashboardMock,
      title: 'Updated Dashboard',
    };

    rerender({ dashboard: updatedDashboard });

    expect(result.current.dashboard).toEqual(updatedDashboard);
  });

  it('should update and persist dashboard filters', async () => {
    const newFilters = [filterFactory.members(DM.Commerce.Date, ['02/01/2021'])];
    const { result } = renderHook(() =>
      useDashboardPersistence({
        dashboard: dashboardMock,
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
      useDashboardPersistence({
        dashboard: dashboardMock,
        persist: true,
      }),
    );

    const { dispatchChanges } = result.current;
    act(() => {
      dispatchChanges({
        type: UseDashboardModelActionType.ADD_WIDGET,
        payload: newWidget,
      });
    });

    await waitFor(() => {
      // Widget data should match (server preserves client data)
      expect(result.current.dashboard?.widgets[0].dataOptions).toStrictEqual(
        expect.objectContaining(newWidget.dataOptions),
      );
      // Widget OID should be server-assigned, not client OID
      expect(result.current.dashboard?.widgets[0].oid).toBe(NEW_WIDGET_OID);
    });
    await waitFor(() => {
      expect(addWidgetToDashboardMock).toHaveBeenCalledTimes(1);
    });
  });

  it('should not persist changes when persist is false', async () => {
    const newFilters = [filterFactory.members(DM.Commerce.Date, ['03/01/2021'])];
    const { result } = renderHook(() =>
      useDashboardPersistence({
        dashboard: dashboardMock,
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

  it('should not persist changes with WAT authentication', async () => {
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
      useDashboardPersistence({
        dashboard: dashboardMock,
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

    await waitFor(() => {
      expect(result.current.dashboard).toEqual(
        expect.objectContaining({
          filters: newFilters,
        }),
      );
    });
    expect(patchDashboardMock).toHaveBeenCalledTimes(0);
  });

  it('should handle dashboard model updates without triggering unnecessary re-initialization', () => {
    const { result, rerender } = renderHook(
      ({ dashboard }) =>
        useDashboardPersistence({
          dashboard,
          persist: true,
        }),
      {
        initialProps: { dashboard: dashboardMock },
      },
    );

    // Same dashboard reference should not trigger re-initialization
    rerender({ dashboard: dashboardMock });
    expect(result.current.dashboard).toEqual(dashboardMock);

    // Different dashboard should trigger re-initialization
    const newDashboard = {
      ...dashboardMock,
      oid: 'different-dashboard',
    };
    rerender({ dashboard: newDashboard });
    expect(result.current.dashboard).toEqual(newDashboard);
  });

  it('should maintain local state when dashboard prop becomes null', () => {
    const { result, rerender } = renderHook(
      ({ dashboard }: { dashboard: DashboardModel | null }) =>
        useDashboardPersistence({
          dashboard,
          persist: true,
        }),
      {
        initialProps: { dashboard: dashboardMock as DashboardModel | null },
      },
    );

    expect(result.current.dashboard).toEqual(dashboardMock);

    // Setting dashboard to null should not clear local state
    rerender({ dashboard: null });
    expect(result.current.dashboard).toEqual(dashboardMock);
  });

  it('should handle persistence errors gracefully', async () => {
    patchDashboardMock.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() =>
      useDashboardPersistence({
        dashboard: dashboardMock,
        persist: true,
      }),
    );

    const newFilters = [filterFactory.members(DM.Commerce.Date, ['02/01/2021'])];
    const { dispatchChanges } = result.current;

    await expect(
      act(async () => {
        await dispatchChanges({
          type: UseDashboardModelActionType.FILTERS_UPDATE,
          payload: newFilters,
        });
      }),
    ).rejects.toThrow('Network error');

    expect(patchDashboardMock).toHaveBeenCalledTimes(1);
  });

  it('should update and persist dashboard widgets deletion', async () => {
    // First add a widget to the dashboard
    const newWidget = widgetModelTranslator.fromWidgetDto(sampleEcommerceDashboard.widgets![0]!);
    const dashboardWithWidget = {
      ...dashboardMock,
      widgets: [newWidget],
    };

    const { result } = renderHook(() =>
      useDashboardPersistence({
        dashboard: dashboardWithWidget,
        persist: true,
      }),
    );

    const { dispatchChanges } = result.current;

    // Delete the widget
    act(() => {
      dispatchChanges({
        type: UseDashboardModelActionType.WIDGETS_DELETE,
        payload: [newWidget.oid],
      });
    });

    await waitFor(() => {
      expect(result.current.dashboard?.widgets).toHaveLength(0);
    });

    await waitFor(() => {
      expect(deleteWidgetFromDashboardMock).toHaveBeenCalledTimes(1);
      expect(deleteWidgetFromDashboardMock).toHaveBeenCalledWith(
        dashboardMock.oid,
        newWidget.oid,
        false,
      );
    });
  });

  it('should update and persist dashboard layout changes', async () => {
    const newLayout = {
      columns: [
        {
          widthPercentage: 50,
          rows: [
            {
              cells: [
                {
                  widgetId: 'widget-1',
                  widthPercentage: 100,
                },
              ],
            },
          ],
        },
        {
          widthPercentage: 50,
          rows: [
            {
              cells: [
                {
                  widgetId: 'widget-2',
                  widthPercentage: 100,
                },
              ],
            },
          ],
        },
      ],
    };

    const { result } = renderHook(() =>
      useDashboardPersistence({
        dashboard: dashboardMock,
        persist: true,
      }),
    );

    const { dispatchChanges } = result.current;

    act(() => {
      dispatchChanges({
        type: UseDashboardModelActionType.WIDGETS_PANEL_LAYOUT_UPDATE,
        payload: newLayout,
      });
    });

    await waitFor(() => {
      expect(result.current.dashboard?.layoutOptions.widgetsPanel).toEqual(newLayout);
    });

    await waitFor(() => {
      expect(patchDashboardMock).toHaveBeenCalledTimes(1);
      expect(patchDashboardMock).toHaveBeenCalledWith(
        dashboardMock.oid,
        {
          layout: expect.any(Object),
        },
        false,
      );
    });
  });

  it('should not persist widget deletion when persist is false', async () => {
    const newWidget = widgetModelTranslator.fromWidgetDto(sampleEcommerceDashboard.widgets![0]!);
    const dashboardWithWidget = {
      ...dashboardMock,
      widgets: [newWidget],
    };

    const { result } = renderHook(() =>
      useDashboardPersistence({
        dashboard: dashboardWithWidget,
        persist: false,
      }),
    );

    const { dispatchChanges } = result.current;

    act(() => {
      dispatchChanges({
        type: UseDashboardModelActionType.WIDGETS_DELETE,
        payload: [newWidget.oid],
      });
    });

    expect(result.current.dashboard?.widgets).toHaveLength(0);
    expect(deleteWidgetFromDashboardMock).toHaveBeenCalledTimes(0);
  });
});
