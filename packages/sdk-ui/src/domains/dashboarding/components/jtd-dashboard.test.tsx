import React from 'react';

import { render, waitFor } from '@testing-library/react';
import { merge as deepMerge } from 'ts-deepmerge';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DashboardConfig, DashboardProps } from '@/domains/dashboarding/types';

import { JtdDashboard } from './jtd-dashboard';

// Set per test to simulate what the target dashboard's permissions imply for edit mode.
let targetEditModeEnabled: boolean | undefined;
let targetFilterActionsEnabled: boolean | undefined;

// Mock the Dashboard component to capture props
vi.mock('@/domains/dashboarding/dashboard', () => ({
  Dashboard: vi.fn(({ config }) => (
    <div data-testid="mocked-dashboard" data-config={JSON.stringify(config)} />
  )),
}));

// Mock the useDashboardModel hook (used internally by useJtdTargetDashboardProps)
vi.mock('@/domains/dashboarding/dashboard-model/use-dashboard-model/use-dashboard-model', () => ({
  useDashboardModel: vi.fn((params) => {
    if (params.enabled && params.dashboardOid) {
      return {
        dashboard: {
          title: 'Test Dashboard',
          widgets: [],
          filters: [],
          config: {
            toolbar: { visible: true },
            filtersPanel: {
              visible: true,
              collapsedInitially: false,
              // Simulates the filter-action defaults the translator derives from the target
              // dashboard's permissions. `undefined` leaves them out, as an unpermissioned
              // dashboard would.
              ...(targetFilterActionsEnabled === undefined
                ? {}
                : {
                    actions: {
                      addFilter: { enabled: targetFilterActionsEnabled },
                      editFilter: { enabled: targetFilterActionsEnabled },
                      deleteFilter: { enabled: targetFilterActionsEnabled },
                      reorderFilters: { enabled: targetFilterActionsEnabled },
                      lockFilter: { enabled: targetFilterActionsEnabled },
                    },
                  }),
            },
            widgetsPanel: {
              responsive: false,
              // Simulates the edit-mode default the translator derives from the target dashboard's
              // permissions. `undefined` leaves it out, as an unpermissioned dashboard would.
              ...(targetEditModeEnabled === undefined
                ? {}
                : { editMode: { enabled: targetEditModeEnabled } }),
            },
          },
        },
        isLoading: false,
        isError: false,
        error: null,
      };
    }
    return {
      dashboard: null,
      isLoading: false,
      isError: false,
      error: null,
    };
  }),
}));

// Mock the dashboard model translator
vi.mock('@/domains/dashboarding/dashboard-model/dashboard-model-translator', () => ({
  toDashboardProps: vi.fn((dashboardModel) => ({
    title: dashboardModel.title,
    widgets: dashboardModel.widgets,
    filters: dashboardModel.filters,
    onFiltersChange: vi.fn(),
    config: dashboardModel.config,
  })),
}));

// Mock the useDefaults hook to replicate production deep merge behavior
vi.mock('@/common/hooks/use-defaults', () => ({
  useDefaults: vi.fn((config, defaults) => {
    // Use the same deep merge logic as production
    return deepMerge.withOptions({ mergeArrays: false }, defaults, config);
  }),
}));

describe('JtdDashboard', () => {
  const mockFilters = [{ attribute: { name: 'test' } }] as any[];

  beforeEach(() => {
    vi.clearAllMocks();
    targetEditModeEnabled = undefined;
    targetFilterActionsEnabled = undefined;
  });

  describe('dashboard config merging', () => {
    it('should use baseConfig when no jtdDashboardConfig is provided', async () => {
      render(
        <JtdDashboard
          dashboard="test-dashboard-id"
          filters={mockFilters}
          mergeTargetDashboardFilters={false}
        />,
      );

      await waitFor(() => {
        const dashboardElement = document.querySelector('[data-testid="mocked-dashboard"]');
        expect(dashboardElement).toBeInTheDocument();

        const configData = dashboardElement?.getAttribute('data-config');
        const config = JSON.parse(configData || '{}');

        // Should use base config without modification
        expect(config.toolbar?.visible).toBe(true);
        expect(config.filtersPanel?.visible).toBe(true);
        expect(config.filtersPanel?.collapsedInitially).toBe(false);
        expect(config.widgetsPanel?.responsive).toBe(false);
      });
    });

    it('should deep merge jtdDashboardConfig with baseConfig, giving priority to JTD config', async () => {
      const jtdDashboardConfig: DashboardConfig = {
        toolbar: { visible: false },
        filtersPanel: {
          visible: false,
          collapsedInitially: true,
        },
        widgetsPanel: {
          responsive: true,
          editMode: {
            enabled: true,
          },
        },
      };

      render(
        <JtdDashboard
          dashboard="test-dashboard-id"
          filters={mockFilters}
          mergeTargetDashboardFilters={false}
          dashboardConfig={jtdDashboardConfig}
        />,
      );

      await waitFor(() => {
        const dashboardElement = document.querySelector('[data-testid="mocked-dashboard"]');
        expect(dashboardElement).toBeInTheDocument();

        const configData = dashboardElement?.getAttribute('data-config');
        const config = JSON.parse(configData || '{}');

        // JTD config should override base config
        expect(config.toolbar?.visible).toBe(false);
        expect(config.filtersPanel?.visible).toBe(false);
        expect(config.filtersPanel?.collapsedInitially).toBe(true);
        expect(config.widgetsPanel?.responsive).toBe(true);
        expect(config.widgetsPanel?.editMode?.enabled).toBe(true);
      });
    });

    it('should merge partial jtdDashboardConfig properties while preserving base config defaults', async () => {
      const partialJtdConfig: DashboardConfig = {
        filtersPanel: {
          visible: false,
          // collapsedInitially not specified - should inherit from base
        },
        // toolbar not specified - should inherit from base
        widgetsPanel: {
          responsive: true,
          // editMode not specified - should inherit from base (undefined)
        },
      };

      render(
        <JtdDashboard
          dashboard="test-dashboard-id"
          filters={mockFilters}
          mergeTargetDashboardFilters={false}
          dashboardConfig={partialJtdConfig}
        />,
      );

      await waitFor(() => {
        const dashboardElement = document.querySelector('[data-testid="mocked-dashboard"]');
        expect(dashboardElement).toBeInTheDocument();

        const configData = dashboardElement?.getAttribute('data-config');
        const config = JSON.parse(configData || '{}');

        // Verify deep merge behavior
        expect(config.toolbar?.visible).toBe(true); // From base config (toolbar not specified in partial config)
        expect(config.filtersPanel?.visible).toBe(false); // From JTD config
        expect(config.filtersPanel?.collapsedInitially).toBe(false); // From base config (not overridden)
        expect(config.widgetsPanel?.responsive).toBe(true); // From JTD config
        expect(config.widgetsPanel?.editMode).toBeDefined(); // From useDefaults deep merge
        expect(config.widgetsPanel?.editMode?.enabled).toBe(false); // From useDefaults base defaults
      });
    });

    it('should handle complex nested overrides correctly', async () => {
      const complexJtdConfig: DashboardConfig = {
        toolbar: { visible: false },
        filtersPanel: {
          visible: true,
          collapsedInitially: true,
        },
        widgetsPanel: {
          responsive: true,
          editMode: {
            enabled: false,
          },
        },
      };

      render(
        <JtdDashboard
          dashboard="test-dashboard-id"
          filters={mockFilters}
          mergeTargetDashboardFilters={true}
          dashboardConfig={complexJtdConfig}
        />,
      );

      await waitFor(() => {
        const dashboardElement = document.querySelector('[data-testid="mocked-dashboard"]');
        expect(dashboardElement).toBeInTheDocument();

        const configData = dashboardElement?.getAttribute('data-config');
        const config = JSON.parse(configData || '{}');

        // Verify all nested properties are correctly merged
        expect(config.toolbar?.visible).toBe(false);
        expect(config.filtersPanel?.visible).toBe(true);
        expect(config.filtersPanel?.collapsedInitially).toBe(true);
        expect(config.widgetsPanel?.responsive).toBe(true);
        expect(config.widgetsPanel?.editMode?.enabled).toBe(false);
      });
    });

    it('should work with dashboard props instead of dashboard ID', async () => {
      const dashboardProps = {
        title: 'Custom Dashboard',
        widgets: [],
        filters: [],
        onFiltersChange: vi.fn(),
        config: {
          toolbar: { visible: false },
          filtersPanel: { visible: true, collapsedInitially: true },
        },
      };

      const jtdConfig: DashboardConfig = {
        toolbar: { visible: true }, // Override dashboard prop
        widgetsPanel: { responsive: true }, // Add new property
      };

      render(
        <JtdDashboard
          dashboard={dashboardProps}
          filters={mockFilters}
          mergeTargetDashboardFilters={false}
          dashboardConfig={jtdConfig}
        />,
      );

      await waitFor(() => {
        const dashboardElement = document.querySelector('[data-testid="mocked-dashboard"]');
        expect(dashboardElement).toBeInTheDocument();

        const configData = dashboardElement?.getAttribute('data-config');
        const config = JSON.parse(configData || '{}');

        // Verify merge with dashboard props config
        expect(config.toolbar?.visible).toBe(true); // Overridden by JTD
        expect(config.filtersPanel?.visible).toBe(true); // From dashboard props
        expect(config.filtersPanel?.collapsedInitially).toBe(true); // From dashboard props
        expect(config.widgetsPanel?.responsive).toBe(true); // From JTD config
      });
    });

    it('should handle empty jtdDashboardConfig gracefully', async () => {
      const emptyJtdConfig: DashboardConfig = {};

      render(
        <JtdDashboard
          dashboard="test-dashboard-id"
          filters={mockFilters}
          mergeTargetDashboardFilters={false}
          dashboardConfig={emptyJtdConfig}
        />,
      );

      await waitFor(() => {
        const dashboardElement = document.querySelector('[data-testid="mocked-dashboard"]');
        expect(dashboardElement).toBeInTheDocument();

        const configData = dashboardElement?.getAttribute('data-config');
        const config = JSON.parse(configData || '{}');

        // Should preserve base config when JTD config is empty
        expect(config.toolbar?.visible).toBe(true);
        expect(config.filtersPanel?.visible).toBe(true);
        expect(config.filtersPanel?.collapsedInitially).toBe(false);
        expect(config.widgetsPanel?.responsive).toBe(false);
      });
    });
  });

  describe('read-only by default', () => {
    const readConfig = () => {
      const dashboardElement = document.querySelector('[data-testid="mocked-dashboard"]');
      expect(dashboardElement).toBeInTheDocument();
      return JSON.parse(dashboardElement?.getAttribute('data-config') || '{}');
    };

    it('keeps a drill-through popup read-only when the user may edit the target dashboard', async () => {
      // Without the pin the target's permission-derived default would put drag handles and a
      // "Delete Widget" menu item inside the popup.
      targetEditModeEnabled = true;

      render(
        <JtdDashboard
          dashboard="test-dashboard-id"
          filters={mockFilters}
          mergeTargetDashboardFilters={false}
        />,
      );

      await waitFor(() => {
        expect(readConfig().widgetsPanel?.editMode?.enabled).toBe(false);
      });
    });

    it('still lets a jump-to-dashboard configuration opt into editing explicitly', async () => {
      targetEditModeEnabled = true;

      render(
        <JtdDashboard
          dashboard="test-dashboard-id"
          filters={mockFilters}
          mergeTargetDashboardFilters={false}
          dashboardConfig={{ widgetsPanel: { editMode: { enabled: true } } }}
        />,
      );

      await waitFor(() => {
        expect(readConfig().widgetsPanel?.editMode?.enabled).toBe(true);
      });
    });

    it('keeps filter actions off when the user may change filters on the target dashboard', async () => {
      // Adding, editing, deleting or locking a filter inside a drill-through popup produces changes
      // that vanish when the popup closes, so the target's permission-derived defaults must not
      // reach it.
      targetFilterActionsEnabled = true;

      render(
        <JtdDashboard
          dashboard="test-dashboard-id"
          filters={mockFilters}
          mergeTargetDashboardFilters={false}
        />,
      );

      await waitFor(() => {
        const actions = readConfig().filtersPanel?.actions;
        expect(actions?.addFilter?.enabled).toBe(false);
        expect(actions?.editFilter?.enabled).toBe(false);
        expect(actions?.deleteFilter?.enabled).toBe(false);
        expect(actions?.reorderFilters?.enabled).toBe(false);
        expect(actions?.lockFilter?.enabled).toBe(false);
      });
    });

    it('still lets a jump-to-dashboard configuration opt into filter actions explicitly', async () => {
      targetFilterActionsEnabled = false;

      render(
        <JtdDashboard
          dashboard="test-dashboard-id"
          filters={mockFilters}
          mergeTargetDashboardFilters={false}
          dashboardConfig={{ filtersPanel: { actions: { addFilter: { enabled: true } } } }}
        />,
      );

      await waitFor(() => {
        expect(readConfig().filtersPanel?.actions?.addFilter?.enabled).toBe(true);
      });
    });

    it('does not override filter actions when the caller passes dashboard props directly', async () => {
      const inlineDashboard: DashboardProps = {
        title: 'Inline dashboard',
        widgets: [],
        filters: [],
        config: { filtersPanel: { actions: { deleteFilter: { enabled: true } } } },
      };

      render(
        <JtdDashboard
          dashboard={inlineDashboard}
          filters={mockFilters}
          mergeTargetDashboardFilters={false}
        />,
      );

      await waitFor(() => {
        expect(readConfig().filtersPanel?.actions?.deleteFilter?.enabled).toBe(true);
      });
    });

    it('keeps locking out of a props-targeted popup, which a hand-assembled dashboard defaults on', async () => {
      // `DEFAULT_DASHBOARD_CONFIG` turns locking on for a dashboard composed from props. A popup
      // discards its writes, so that default must not reach one: the read-only pin sits under the
      // caller's config but over the code defaults.
      const inlineDashboard: DashboardProps = {
        title: 'Inline dashboard',
        widgets: [],
        filters: [],
      };

      render(
        <JtdDashboard
          dashboard={inlineDashboard}
          filters={mockFilters}
          mergeTargetDashboardFilters={false}
        />,
      );

      await waitFor(() => {
        expect(readConfig().filtersPanel?.actions?.lockFilter?.enabled).toBe(false);
      });
    });

    it('still lets a props-targeted popup opt into locking explicitly', async () => {
      const inlineDashboard: DashboardProps = {
        title: 'Inline dashboard',
        widgets: [],
        filters: [],
        config: { filtersPanel: { actions: { lockFilter: { enabled: true } } } },
      };

      render(
        <JtdDashboard
          dashboard={inlineDashboard}
          filters={mockFilters}
          mergeTargetDashboardFilters={false}
        />,
      );

      await waitFor(() => {
        expect(readConfig().filtersPanel?.actions?.lockFilter?.enabled).toBe(true);
      });
    });

    it('does not override edit mode when the caller passes dashboard props directly', async () => {
      // That config is the caller's own, not derived from permissions, so it keeps precedence.
      const inlineDashboard: DashboardProps = {
        title: 'Inline dashboard',
        widgets: [],
        filters: [],
        config: { widgetsPanel: { editMode: { enabled: true } } },
      };

      render(
        <JtdDashboard
          dashboard={inlineDashboard}
          filters={mockFilters}
          mergeTargetDashboardFilters={false}
        />,
      );

      await waitFor(() => {
        expect(readConfig().widgetsPanel?.editMode?.enabled).toBe(true);
      });
    });
  });

  describe('mergeArrays: false option', () => {
    it('should not merge arrays when using ts-deepmerge with mergeArrays: false', async () => {
      // This test verifies that the mergeArrays: false option is properly applied
      // Arrays should be replaced, not merged
      const jtdConfig: DashboardConfig = {
        // This would typically test array merging if we had array properties in DashboardConfig
        // For now, we verify the option is applied correctly by checking the deep merge behavior
        filtersPanel: {
          visible: true,
          collapsedInitially: false,
        },
        widgetsPanel: {
          responsive: true,
        },
      };

      render(
        <JtdDashboard
          dashboard="test-dashboard-id"
          filters={mockFilters}
          mergeTargetDashboardFilters={false}
          dashboardConfig={jtdConfig}
        />,
      );

      await waitFor(() => {
        const dashboardElement = document.querySelector('[data-testid="mocked-dashboard"]');
        expect(dashboardElement).toBeInTheDocument();

        // Verify that deep merge is working as expected
        const configData = dashboardElement?.getAttribute('data-config');
        const config = JSON.parse(configData || '{}');

        expect(config.filtersPanel?.visible).toBe(true);
        expect(config.filtersPanel?.collapsedInitially).toBe(false);
        expect(config.widgetsPanel?.responsive).toBe(true);
      });
    });
  });
});
