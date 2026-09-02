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
import type { DashboardByIdProps } from './types.js';

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
    // Edit-mode defaults come from the dashboard's own permissions, derived in `toDashboardProps`.
    // The translator is not mocked here, so these tests exercise the real derivation.
    const dashboardModelWith = (userAuth?: Record<string, unknown>) => ({
      dashboard: {
        oid: 'test-oid',
        widgets: [],
        filters: [],
        config: {},
        ...(userAuth ? { userAuth } : {}),
      },
      isLoading: false,
      isError: false,
      error: undefined,
      dispatchChanges: vi.fn(),
    });

    const mockDashboardData = dashboardModelWith();

    const permitting = { dashboards: { toggle_edit_mode: true } };
    const denying = { dashboards: { toggle_edit_mode: false } };

    const renderWithConfig = (config?: DashboardByIdProps['config']) => {
      render(
        <MockedSisenseContextProvider>
          <DashboardById dashboardOid="test-oid" config={config} />
        </MockedSisenseContextProvider>,
      );

      expect(DashboardMock).toHaveBeenCalled();
      return DashboardMock.mock.calls[0][0];
    };

    const editModeEnabledConfig = { widgetsPanel: { editMode: { enabled: true } } };
    const editModeDisabledConfig = { widgetsPanel: { editMode: { enabled: false } } };

    it('enables edit mode from the dashboard permissions when props do not specify it', () => {
      useDashboardModelInternalMock.mockReturnValue(dashboardModelWith(permitting));

      expect(renderWithConfig().config.widgetsPanel.editMode.enabled).toBe(true);
    });

    it('disables edit mode when the dashboard permissions deny it and props do not specify it', () => {
      useDashboardModelInternalMock.mockReturnValue(dashboardModelWith(denying));

      expect(renderWithConfig().config.widgetsPanel.editMode.enabled).toBe(false);
    });

    it('lets props enable edit mode even when the dashboard permissions deny it', () => {
      // Props have the highest precedence by design; the Sisense instance still rejects saves the
      // user is not allowed to make.
      useDashboardModelInternalMock.mockReturnValue(dashboardModelWith(denying));

      expect(renderWithConfig(editModeEnabledConfig).config.widgetsPanel.editMode.enabled).toBe(
        true,
      );
    });

    it('lets props disable edit mode even when the dashboard permissions allow it', () => {
      // Key regression guard: a derived `true` must never override an explicit `false`.
      useDashboardModelInternalMock.mockReturnValue(dashboardModelWith(permitting));

      expect(renderWithConfig(editModeDisabledConfig).config.widgetsPanel.editMode.enabled).toBe(
        false,
      );
    });

    it('derives edit mode from toggle_edit_mode rather than edit_layout', () => {
      useDashboardModelInternalMock.mockReturnValue(
        dashboardModelWith({ dashboards: { toggle_edit_mode: true, edit_layout: false } }),
      );

      expect(renderWithConfig().config.widgetsPanel.editMode.enabled).toBe(true);
    });

    it('falls back to the code default when the dashboard carries no permissions', () => {
      // Older Sisense versions do not return `userAuth`; nothing is derived and the default applies.
      useDashboardModelInternalMock.mockReturnValue(mockDashboardData);

      expect(renderWithConfig().config.widgetsPanel.editMode.enabled).toBe(false);
    });

    it('still honors props when the dashboard carries no permissions', () => {
      useDashboardModelInternalMock.mockReturnValue(mockDashboardData);

      expect(renderWithConfig(editModeEnabledConfig).config.widgetsPanel.editMode.enabled).toBe(
        true,
      );
    });

    it('keeps the derived default when props pass enabled as undefined', () => {
      // `enabled: someOptionalBoolean` is type-legal now that the field is optional. An explicit
      // `undefined` means "no preference" and must not wipe the permission-derived default.
      useDashboardModelInternalMock.mockReturnValue(dashboardModelWith(permitting));

      const config = renderWithConfig({ widgetsPanel: { editMode: { enabled: undefined } } });

      expect(config.config.widgetsPanel.editMode.enabled).toBe(true);
    });

    it('does not take over edit state by injecting isEditing', () => {
      // `Dashboard` treats the presence of `isEditing` as "the host controls edit state".
      useDashboardModelInternalMock.mockReturnValue(dashboardModelWith(permitting));

      const { editMode } = renderWithConfig().config.widgetsPanel;

      expect('isEditing' in editMode).toBe(false);
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

    describe('filter action permissions', () => {
      const filterPermissions = (allowed: boolean) => ({
        // `toggle_edit_mode` is part of the shape because locking follows it as well as `advanced`:
        // Fusion offers lock/unlock only inside edit mode.
        dashboards: {
          toggle_edit_mode: allowed,
          filters: { create: allowed, modify_type: allowed, advanced: allowed },
        },
        widgets: { widgetViewOnly: !allowed },
      });

      const renderActions = (config?: DashboardByIdProps['config']) =>
        renderWithConfig(config).config.filtersPanel.actions;

      it('grants every filter action from the dashboard permissions when props are silent', () => {
        useDashboardModelInternalMock.mockReturnValue(dashboardModelWith(filterPermissions(true)));

        const actions = renderActions();

        expect(actions.addFilter.enabled).toBe(true);
        expect(actions.editFilter.enabled).toBe(true);
        expect(actions.deleteFilter.enabled).toBe(true);
        expect(actions.reorderFilters.enabled).toBe(true);
        expect(actions.lockFilter.enabled).toBe(true);
        expect(actions.editFilter.ranking.visible).toBe(true);
      });

      it('denies every filter action when the dashboard permissions deny them', () => {
        useDashboardModelInternalMock.mockReturnValue(dashboardModelWith(filterPermissions(false)));

        const actions = renderActions();

        expect(actions.addFilter.enabled).toBe(false);
        expect(actions.deleteFilter.enabled).toBe(false);
        expect(actions.reorderFilters.enabled).toBe(false);
        expect(actions.lockFilter.enabled).toBe(false);
        // Editing is ungated in Fusion and its write is scoped to this user's own copy, so it stays
        // available — without the ranking conditions, because `modify_type` is denied.
        expect(actions.editFilter.enabled).toBe(true);
        expect(actions.editFilter.ranking.visible).toBe(false);
      });

      it('lets props disable a filter action the permissions allow', () => {
        // Same precedence guard as edit mode: a derived `true` never beats an explicit `false`.
        useDashboardModelInternalMock.mockReturnValue(dashboardModelWith(filterPermissions(true)));

        const actions = renderActions({
          filtersPanel: { actions: { deleteFilter: { enabled: false } } },
        });

        expect(actions.deleteFilter.enabled).toBe(false);
        expect(actions.addFilter.enabled).toBe(true);
      });

      it('lets props enable a filter action the permissions deny', () => {
        useDashboardModelInternalMock.mockReturnValue(dashboardModelWith(filterPermissions(false)));

        expect(
          renderActions({ filtersPanel: { actions: { addFilter: { enabled: true } } } }).addFilter
            .enabled,
        ).toBe(true);
      });

      it('keeps the derived default when props pass a filter action as undefined', () => {
        useDashboardModelInternalMock.mockReturnValue(dashboardModelWith(filterPermissions(true)));

        const actions = renderActions({
          filtersPanel: { actions: { addFilter: { enabled: undefined } } },
        });

        expect(actions.addFilter.enabled).toBe(true);
      });

      it('hides multi-select when the permissions deny changing filter types', () => {
        // The one revoking derivation, matching Fusion, which hides the toggle for a view-only
        // share. Verified against the live instance.
        useDashboardModelInternalMock.mockReturnValue(dashboardModelWith(filterPermissions(false)));

        const actions = renderActions();

        expect(actions.addFilter.multiSelect.visible).toBe(false);
        expect(actions.editFilter.multiSelect.visible).toBe(false);
      });

      it('keeps multi-select visible when the permissions allow it', () => {
        useDashboardModelInternalMock.mockReturnValue(dashboardModelWith(filterPermissions(true)));

        const actions = renderActions();

        expect(actions.addFilter.multiSelect.visible).toBe(true);
        expect(actions.editFilter.multiSelect.visible).toBe(true);
      });

      it('falls back to the code defaults when the dashboard carries no permissions', () => {
        useDashboardModelInternalMock.mockReturnValue(mockDashboardData);

        const actions = renderActions();

        // No userAuth at all: nothing is derived, so every code default stands — including
        // `editFilter.enabled: false`, which the derivation would otherwise grant, and
        // `lockFilter.enabled: false`, which `DEFAULT_DASHBOARD_BY_ID_CONFIG` overrides back off so
        // that a dashboard loaded by id never grants locking Fusion did not report.
        expect(actions.addFilter.enabled).toBe(false);
        expect(actions.editFilter.enabled).toBe(false);
        expect(actions.deleteFilter.enabled).toBe(false);
        expect(actions.reorderFilters.enabled).toBe(false);
        expect(actions.lockFilter.enabled).toBe(false);
        expect(actions.addFilter.multiSelect.visible).toBe(true);
      });
    });

    describe('widget action permissions', () => {
      // `DashboardById` used to force both flags to `false` in its props layer, which no derived
      // value could survive. These guard the removal of that forcing.
      const widgetPermissions = (allowed: boolean) => ({
        dashboards: { toggle_edit_mode: allowed },
        widgets: { rename: allowed, duplicate: allowed, create: allowed, delete: allowed },
      });

      const renderEditMode = (config?: DashboardByIdProps['config']) =>
        renderWithConfig(config).config.widgetsPanel.editMode;

      it('grants every widget action from the dashboard permissions when props are silent', () => {
        useDashboardModelInternalMock.mockReturnValue(dashboardModelWith(widgetPermissions(true)));

        const editMode = renderEditMode();

        expect(editMode.renameWidget.enabled).toBe(true);
        expect(editMode.duplicateWidget.enabled).toBe(true);
        expect(editMode.deleteWidget.enabled).toBe(true);
      });

      it('denies every widget action when the dashboard permissions deny them', () => {
        useDashboardModelInternalMock.mockReturnValue(dashboardModelWith(widgetPermissions(false)));

        const editMode = renderEditMode();

        expect(editMode.renameWidget.enabled).toBe(false);
        expect(editMode.duplicateWidget.enabled).toBe(false);
        // The revoking one: its code default is `true`, so only an explicit denial takes it away.
        expect(editMode.deleteWidget.enabled).toBe(false);
      });

      it('lets props keep deletion when the dashboard permissions deny it', () => {
        useDashboardModelInternalMock.mockReturnValue(dashboardModelWith(widgetPermissions(false)));

        const editMode = renderEditMode({
          widgetsPanel: { editMode: { deleteWidget: { enabled: true } } },
        });

        expect(editMode.deleteWidget.enabled).toBe(true);
      });

      it('lets props withhold deletion when the dashboard permissions allow it', () => {
        // Deletion is the only widget action whose code default is permissive, so an explicit `false`
        // has to win over both that default and a granting permission.
        useDashboardModelInternalMock.mockReturnValue(dashboardModelWith(widgetPermissions(true)));

        const editMode = renderEditMode({
          widgetsPanel: { editMode: { deleteWidget: { enabled: false } } },
        });

        expect(editMode.deleteWidget.enabled).toBe(false);
      });

      it('denies duplication when creating a widget is denied but duplicating is allowed', () => {
        // Duplication is the only widget-creation path, so it must not bypass `create`.
        useDashboardModelInternalMock.mockReturnValue(
          dashboardModelWith({
            dashboards: { toggle_edit_mode: true },
            widgets: { rename: true, duplicate: true, create: false },
          }),
        );

        const editMode = renderEditMode();

        expect(editMode.duplicateWidget.enabled).toBe(false);
        expect(editMode.renameWidget.enabled).toBe(true);
      });

      it('lets props disable a widget action the permissions allow', () => {
        useDashboardModelInternalMock.mockReturnValue(dashboardModelWith(widgetPermissions(true)));

        const editMode = renderEditMode({
          widgetsPanel: { editMode: { renameWidget: { enabled: false } } },
        });

        expect(editMode.renameWidget.enabled).toBe(false);
        expect(editMode.duplicateWidget.enabled).toBe(true);
      });

      it('lets props enable a widget action the permissions deny', () => {
        useDashboardModelInternalMock.mockReturnValue(dashboardModelWith(widgetPermissions(false)));

        const editMode = renderEditMode({
          widgetsPanel: { editMode: { duplicateWidget: { enabled: true } } },
        });

        expect(editMode.duplicateWidget.enabled).toBe(true);
        expect(editMode.renameWidget.enabled).toBe(false);
      });

      it('falls back to the code defaults when the dashboard carries no permissions', () => {
        useDashboardModelInternalMock.mockReturnValue(mockDashboardData);

        const editMode = renderEditMode();

        expect(editMode.renameWidget.enabled).toBe(false);
        expect(editMode.duplicateWidget.enabled).toBe(false);
        // Permissive default: deletion has always been offered while editing, and a deployment that
        // cannot report permissions must not lose it.
        expect(editMode.deleteWidget.enabled).toBe(true);
      });
    });

    describe('widget export permissions', () => {
      // Both download flags follow the single export permission, and unlike every other derived flag
      // they default to `false`, so the permission can only add the download menu.
      const exportPermissions = (allowed: boolean) => ({ widgets: { export_csv: allowed } });

      const renderActions = (config?: DashboardByIdProps['config']) =>
        renderWithConfig(config).config.widgetsPanel.actions;

      it('offers both downloads when the permissions allow exporting and props are silent', () => {
        useDashboardModelInternalMock.mockReturnValue(dashboardModelWith(exportPermissions(true)));

        const actions = renderActions();

        expect(actions.downloadCsv.enabled).toBe(true);
        expect(actions.downloadExcel.enabled).toBe(true);
      });

      it('withholds both downloads when the permissions deny exporting', () => {
        useDashboardModelInternalMock.mockReturnValue(dashboardModelWith(exportPermissions(false)));

        const actions = renderActions();

        expect(actions.downloadCsv.enabled).toBe(false);
        expect(actions.downloadExcel.enabled).toBe(false);
      });

      it('lets props enable a download the permissions deny', () => {
        useDashboardModelInternalMock.mockReturnValue(dashboardModelWith(exportPermissions(false)));

        const actions = renderActions({
          widgetsPanel: { actions: { downloadCsv: { enabled: true } } },
        });

        expect(actions.downloadCsv.enabled).toBe(true);
        expect(actions.downloadExcel.enabled).toBe(false);
      });

      it('lets props disable a download the permissions allow', () => {
        useDashboardModelInternalMock.mockReturnValue(dashboardModelWith(exportPermissions(true)));

        const actions = renderActions({
          widgetsPanel: { actions: { downloadExcel: { enabled: false } } },
        });

        expect(actions.downloadExcel.enabled).toBe(false);
        expect(actions.downloadCsv.enabled).toBe(true);
      });

      it('keeps the derived default when props pass a download as undefined', () => {
        useDashboardModelInternalMock.mockReturnValue(dashboardModelWith(exportPermissions(true)));

        const actions = renderActions({
          widgetsPanel: { actions: { downloadCsv: { enabled: undefined } } },
        });

        expect(actions.downloadCsv.enabled).toBe(true);
      });

      it('falls back to the code defaults when the dashboard carries no permissions', () => {
        useDashboardModelInternalMock.mockReturnValue(mockDashboardData);

        const actions = renderActions();

        expect(actions.downloadCsv.enabled).toBe(false);
        expect(actions.downloadExcel.enabled).toBe(false);
      });
    });
  });
});
