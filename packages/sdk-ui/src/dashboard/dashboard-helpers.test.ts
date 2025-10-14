import { describe, expect, it, vi } from 'vitest';

import { JumpToDashboardConfig } from '@/dashboard/hooks/jtd/jtd-types';
import { WidgetProps } from '@/props';

import { applyJtdConfig, applyJtdConfigs } from './dashboard-helpers';
import { DashboardProps } from './types';

describe('Dashboard JTD Helpers', () => {
  const mockWidgets: WidgetProps[] = [
    {
      id: 'widget-1',
      widgetType: 'chart',
      chartType: 'column' as const,
      dataOptions: {},
      title: 'Widget 1',
    },
    {
      id: 'widget-2',
      widgetType: 'chart',
      chartType: 'pie' as const,
      dataOptions: {},
      title: 'Widget 2',
    },
    {
      id: 'widget-3',
      widgetType: 'chart',
      chartType: 'bar' as const,
      dataOptions: {},
      title: 'Widget 3',
    },
  ];

  const mockDashboard: DashboardProps = {
    title: 'Test Dashboard',
    widgets: mockWidgets,
    widgetsOptions: {
      'widget-1': {
        filtersOptions: { ignoreFilters: { all: false, ids: [] } },
      },
    },
  };

  const mockJtdConfig: JumpToDashboardConfig = {
    enabled: true,
    targets: [{ id: 'target-dashboard-id', caption: 'Sales Details' }],
    interaction: {
      triggerMethod: 'rightclick',
    },
  };

  const mockJumpToDashboardConfig: JumpToDashboardConfig = {
    targets: [{ id: 'target-dashboard-id', caption: 'Sales Analytics' }],
    interaction: {
      triggerMethod: 'rightclick',
      captionPrefix: 'Jump to Dashboard',
    },
  };

  describe('applyJtdConfig', () => {
    it('should apply JTD config to a widget in the dashboard', () => {
      const result = applyJtdConfig(mockDashboard, 'widget-1', mockJtdConfig);

      expect(result).not.toBe(mockDashboard); // Should return a new object
      expect(result.widgetsOptions?.['widget-1']?.jtdConfig).toEqual(mockJtdConfig);
      expect(result.widgetsOptions?.['widget-1']?.filtersOptions).toEqual({
        ignoreFilters: { all: false, ids: [] },
      }); // Should preserve existing options
    });

    it('should apply JTD config to a widget that has no previous options', () => {
      const result = applyJtdConfig(mockDashboard, 'widget-2', mockJtdConfig);

      expect(result.widgetsOptions?.['widget-2']?.jtdConfig).toEqual(mockJtdConfig);
      expect(result.widgetsOptions?.['widget-1']).toEqual(
        mockDashboard.widgetsOptions?.['widget-1'],
      ); // Should not affect other widgets
    });

    it('should support JumpToDashboardConfig format', () => {
      const result = applyJtdConfig(mockDashboard, 'widget-2', mockJumpToDashboardConfig);

      expect(result.widgetsOptions?.['widget-2']?.jtdConfig).toEqual(mockJumpToDashboardConfig);
    });

    it('should create widgetsOptions if it does not exist', () => {
      const dashboardWithoutOptions: DashboardProps = {
        title: 'Test Dashboard',
        widgets: mockWidgets,
      };

      const result = applyJtdConfig(dashboardWithoutOptions, 'widget-1', mockJtdConfig);

      expect(result.widgetsOptions?.['widget-1']?.jtdConfig).toEqual(mockJtdConfig);
    });

    it('should warn and return original dashboard if widget does not exist', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = applyJtdConfig(mockDashboard, 'non-existent-widget', mockJtdConfig);

      expect(result).toBe(mockDashboard); // Should return the same object
      expect(consoleSpy).toHaveBeenCalledWith(
        'Widget with OID "non-existent-widget" not found in dashboard. JTD config not applied.',
      );

      consoleSpy.mockRestore();
    });
  });

  describe('applyJtdConfigs', () => {
    const mockConfigsPerWidget = {
      'widget-1': mockJtdConfig,
      'widget-2': mockJumpToDashboardConfig,
    };

    it('should apply JTD configs to multiple widgets in the dashboard', () => {
      const result = applyJtdConfigs(mockDashboard, mockConfigsPerWidget);

      expect(result).not.toBe(mockDashboard); // Should return a new object
      expect(result.widgetsOptions?.['widget-1']?.jtdConfig).toEqual(mockJtdConfig);
      expect(result.widgetsOptions?.['widget-2']?.jtdConfig).toEqual(mockJumpToDashboardConfig);
      expect(result.widgetsOptions?.['widget-1']?.filtersOptions).toEqual({
        ignoreFilters: { all: false, ids: [] },
      }); // Should preserve existing options
    });

    it('should handle empty configs object', () => {
      const result = applyJtdConfigs(mockDashboard, {});

      expect(result.widgetsOptions).toEqual(mockDashboard.widgetsOptions);
    });

    it('should warn and filter out configs for non-existent widgets', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const configsWithInvalidWidget = {
        'widget-1': mockJtdConfig,
        'non-existent-widget': mockJtdConfig,
        'another-invalid-widget': mockJumpToDashboardConfig,
      };

      const result = applyJtdConfigs(mockDashboard, configsWithInvalidWidget);

      expect(result.widgetsOptions?.['widget-1']?.jtdConfig).toEqual(mockJtdConfig);
      expect(result.widgetsOptions?.['non-existent-widget']).toBeUndefined();
      expect(result.widgetsOptions?.['another-invalid-widget']).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Widgets with OIDs [non-existent-widget, another-invalid-widget] not found in dashboard. JTD configs for these widgets not applied.',
      );

      consoleSpy.mockRestore();
    });

    it('should create widgetsOptions if it does not exist', () => {
      const dashboardWithoutOptions: DashboardProps = {
        title: 'Test Dashboard',
        widgets: mockWidgets,
      };

      const result = applyJtdConfigs(dashboardWithoutOptions, mockConfigsPerWidget);

      expect(result.widgetsOptions?.['widget-1']?.jtdConfig).toEqual(mockJtdConfig);
      expect(result.widgetsOptions?.['widget-2']?.jtdConfig).toEqual(mockJumpToDashboardConfig);
    });
  });
});
