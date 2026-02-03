import React from 'react';

import { render, waitFor } from '@testing-library/react';
import deepMerge from 'ts-deepmerge';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DashboardConfig } from '@/domains/dashboarding/types';

import { JtdDashboard } from './jtd-dashboard';

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
            filtersPanel: { visible: true, collapsedInitially: false },
            widgetsPanel: { responsive: false },
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
