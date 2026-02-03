import { filterFactory } from '@sisense/sdk-data';
import { render } from '@testing-library/react';
import { beforeEach, Mock } from 'vitest';

import { MockedSisenseContextProvider } from '@/__test-helpers__';
import {
  UseDashboardModelActionType,
  useDashboardModelInternal,
} from '@/domains/dashboarding/dashboard-model';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';

import * as DM from '../../__test-helpers__/sample-ecommerce.js';
import { DashboardById } from './dashboard-by-id.js';
import { Dashboard } from './dashboard.js';

// Mock the Dashboard component completely
vi.mock('./dashboard', () => ({
  Dashboard: vi.fn(() => <div data-testid="dashboard" />),
}));

// Mock the useDashboardModel hook
vi.mock('@/domains/dashboarding/dashboard-model/use-dashboard-model/use-dashboard-model', () => ({
  useDashboardModelInternal: vi.fn(),
}));

// Mock the useSisenseContext hook
vi.mock('@/infra/contexts/sisense-context/sisense-context', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('@/infra/contexts/sisense-context/sisense-context')
  >();
  return {
    ...actual,
    useSisenseContext: vi.fn(),
  };
});

const useDashboardModelInternalMock = useDashboardModelInternal as Mock;
const useSisenseContextMock = useSisenseContext as Mock;
const DashboardMock = Dashboard as Mock;

describe('DashboardById', () => {
  beforeEach(() => {
    useDashboardModelInternalMock.mockClear();
    useSisenseContextMock.mockClear();
    DashboardMock.mockClear();

    // Set up default mock for useSisenseContext
    useSisenseContextMock.mockReturnValue({
      isInitialized: true,
      app: {
        httpClient: {
          post: vi.fn().mockResolvedValue({}),
        } as any, // Mock httpClient
        settings: {
          user: {
            permissions: {
              dashboards: {
                edit_layout: false,
              },
            },
          },
        },
      },
      errorBoundary: {
        showErrorBox: true,
      },
      tracking: {
        enabled: true,
        packageName: 'sdk-ui',
      },
    });
  });

  it('should render Dashboard', () => {
    useDashboardModelInternalMock.mockReturnValue({
      dashboard: {
        oid: 'test-oid',
        widgets: [],
        filters: [],
        config: {
          tabbers: [],
        },
      },
      isLoading: false,
      isError: false,
      error: undefined,
      dispatchChanges: vi.fn(),
      config: {},
    });

    const { getByTestId } = render(
      <MockedSisenseContextProvider>
        <DashboardById dashboardOid="test-oid" />
      </MockedSisenseContextProvider>,
    );

    expect(getByTestId('dashboard')).toBeInTheDocument();
  });

  it('the Dashboard should not be rendered due to a loading in progress', () => {
    useDashboardModelInternalMock.mockReturnValue({
      dashboard: null,
      isLoading: true,
      isError: false,
      error: undefined,
      dispatchChanges: vi.fn(),
    });

    const { queryByTestId } = render(
      <MockedSisenseContextProvider>
        <DashboardById dashboardOid="test-oid" />
      </MockedSisenseContextProvider>,
    );

    expect(queryByTestId('dashboard')).toBeNull();
  });

  it('the Dashboard should not be rendered due to a loading error', () => {
    useDashboardModelInternalMock.mockReturnValue({
      dashboard: null,
      isLoading: false,
      isError: true,
      error: new Error('Test error'),
      dispatchChanges: vi.fn(),
    });

    const { queryByTestId } = render(
      <MockedSisenseContextProvider>
        <DashboardById dashboardOid="test-oid" />
      </MockedSisenseContextProvider>,
    );

    expect(queryByTestId('dashboard')).toBeNull();
  });

  it('should dispatch filters update then Dashboard trigger related onChange', () => {
    const filters = [filterFactory.members(DM.Commerce.Gender, ['Male'])];
    const dispatchChangesMock = vi.fn();

    useDashboardModelInternalMock.mockReturnValue({
      dashboard: {
        oid: 'test-oid',
        widgets: [],
        filters: [],
        config: {
          tabbers: [],
        },
      },
      isLoading: false,
      isError: false,
      error: undefined,
      dispatchChanges: dispatchChangesMock,
    });

    DashboardMock.mockImplementation(({ onChange }) => {
      // Trigger the onChange immediately to simulate user interaction
      if (onChange) {
        onChange({ type: 'filters/updated', payload: filters });
      }
      return <div data-testid="dashboard" />;
    });

    render(
      <MockedSisenseContextProvider>
        <DashboardById dashboardOid="test-oid" />
      </MockedSisenseContextProvider>,
    );

    expect(dispatchChangesMock).toHaveBeenCalledWith({
      type: UseDashboardModelActionType.FILTERS_UPDATE,
      payload: filters,
    });
  });

  describe('dashboard edit mode permissions', () => {
    const mockDashboardData = {
      dashboard: {
        oid: 'test-oid',
        widgets: [],
        filters: [],
        config: {},
      },
      isLoading: false,
      isError: false,
      error: undefined,
      dispatchChanges: vi.fn(),
    };

    it('should enable edit mode when user has edit_layout permission and prop config enables it', () => {
      useDashboardModelInternalMock.mockReturnValue(mockDashboardData);
      useSisenseContextMock.mockReturnValue({
        isInitialized: true,
        app: {
          httpClient: {
            post: vi.fn().mockResolvedValue({}),
          } as any,
          settings: {
            user: {
              permissions: {
                dashboards: {
                  edit_layout: true,
                },
              },
            },
          },
        },
        errorBoundary: {
          showErrorBox: true,
        },
        tracking: {
          enabled: true,
          packageName: 'sdk-ui',
        },
      });

      const configWithEditMode = {
        widgetsPanel: {
          editMode: {
            enabled: true,
          },
        },
      };

      render(
        <MockedSisenseContextProvider>
          <DashboardById dashboardOid="test-oid" config={configWithEditMode} />
        </MockedSisenseContextProvider>,
      );

      expect(DashboardMock).toHaveBeenCalled();
      const dashboardCall = DashboardMock.mock.calls[0][0];
      expect(dashboardCall.config.widgetsPanel.editMode.enabled).toBe(true);
    });

    it('should disable edit mode when user lacks edit_layout permission even if prop config enables it', () => {
      useDashboardModelInternalMock.mockReturnValue(mockDashboardData);
      useSisenseContextMock.mockReturnValue({
        isInitialized: true,
        app: {
          httpClient: {
            post: vi.fn().mockResolvedValue({}),
          } as any,
          settings: {
            user: {
              permissions: {
                dashboards: {
                  edit_layout: false,
                },
              },
            },
          },
        },
        errorBoundary: {
          showErrorBox: true,
        },
        tracking: {
          enabled: true,
          packageName: 'sdk-ui',
        },
      });

      const configWithEditMode = {
        widgetsPanel: {
          editMode: {
            enabled: true,
          },
        },
      };

      render(
        <MockedSisenseContextProvider>
          <DashboardById dashboardOid="test-oid" config={configWithEditMode} />
        </MockedSisenseContextProvider>,
      );

      expect(DashboardMock).toHaveBeenCalled();
      const dashboardCall = DashboardMock.mock.calls[0][0];
      expect(dashboardCall.config.widgetsPanel.editMode.enabled).toBe(false);
    });

    it('should disable edit mode when prop config disables it regardless of user permissions', () => {
      useDashboardModelInternalMock.mockReturnValue(mockDashboardData);
      useSisenseContextMock.mockReturnValue({
        isInitialized: true,
        app: {
          httpClient: {
            post: vi.fn().mockResolvedValue({}),
          } as any,
          settings: {
            user: {
              permissions: {
                dashboards: {
                  edit_layout: true,
                },
              },
            },
          },
        },
        errorBoundary: {
          showErrorBox: true,
        },
        tracking: {
          enabled: true,
          packageName: 'sdk-ui',
        },
      });

      const configWithEditModeDisabled = {
        widgetsPanel: {
          editMode: {
            enabled: false,
          },
        },
      };

      render(
        <MockedSisenseContextProvider>
          <DashboardById dashboardOid="test-oid" config={configWithEditModeDisabled} />
        </MockedSisenseContextProvider>,
      );

      expect(DashboardMock).toHaveBeenCalled();
      const dashboardCall = DashboardMock.mock.calls[0][0];
      expect(dashboardCall.config.widgetsPanel.editMode.enabled).toBe(false);
    });

    it('should disable edit mode when user permissions are undefined', () => {
      useDashboardModelInternalMock.mockReturnValue(mockDashboardData);
      useSisenseContextMock.mockReturnValue({
        isInitialized: true,
        app: {
          httpClient: {
            post: vi.fn().mockResolvedValue({}),
          } as any,
        },
        errorBoundary: {
          showErrorBox: true,
        },
        tracking: {
          enabled: true,
          packageName: 'sdk-ui',
        },
      });

      const configWithEditMode = {
        widgetsPanel: {
          editMode: {
            enabled: true,
          },
        },
      };

      render(
        <MockedSisenseContextProvider>
          <DashboardById dashboardOid="test-oid" config={configWithEditMode} />
        </MockedSisenseContextProvider>,
      );

      expect(DashboardMock).toHaveBeenCalled();
      const dashboardCall = DashboardMock.mock.calls[0][0];
      expect(dashboardCall.config.widgetsPanel.editMode.enabled).toBe(false);
    });

    it('should disable edit mode when app settings are undefined', () => {
      useDashboardModelInternalMock.mockReturnValue(mockDashboardData);
      useSisenseContextMock.mockReturnValue({
        isInitialized: true,
        app: undefined,
        errorBoundary: {
          showErrorBox: true,
        },
        tracking: {
          enabled: true,
          packageName: 'sdk-ui',
        },
      });

      const configWithEditMode = {
        widgetsPanel: {
          editMode: {
            enabled: true,
          },
        },
      };

      render(
        <MockedSisenseContextProvider>
          <DashboardById dashboardOid="test-oid" config={configWithEditMode} />
        </MockedSisenseContextProvider>,
      );

      // When app is undefined, the component should not render the Dashboard at all
      expect(DashboardMock).not.toHaveBeenCalled();
    });
  });
});
