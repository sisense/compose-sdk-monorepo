import { useMemo } from 'react';
import { mergeFilters, type Filter } from '@ethings-os/sdk-data';
import deepMerge from 'ts-deepmerge';
import { LoadingOverlay } from '@/common/components/loading-overlay';
import * as dashboardModelTranslator from '@/models/dashboard/dashboard-model-translator';
import { useDashboardModel } from '@/models/dashboard/use-dashboard-model/use-dashboard-model';
import { useDefaults } from '@/common/hooks/use-defaults';
import { DEFAULT_DASHBOARD_BY_ID_CONFIG, DEFAULT_DASHBOARD_CONFIG } from '@/dashboard/constants';
import { Dashboard } from '@/dashboard/dashboard';
import { DashboardConfig, DashboardProps } from '@/dashboard/types';
import { DashboardId } from '@/models/dashboard/types';
import { withErrorBoundary } from '@/decorators/component-decorators/with-error-boundary';
import { withTracking } from '@/decorators/component-decorators/with-tracking';

interface JtdDashboardProps {
  dashboard: DashboardId | DashboardProps;
  filters: Filter[];
  mergeTargetDashboardFilters: boolean;
  dashboardConfig?: DashboardConfig;
}

/**
 * Type guard to check if dashboard prop is a DashboardId (string)
 */
const isDashboardId = (dashboard: DashboardId | DashboardProps): dashboard is DashboardId => {
  return typeof dashboard === 'string';
};

/**
 * Hook to prepare dashboard props from either ID or props
 * @internal
 */
const useJtdTargetDashboardProps = (dashboard: DashboardId | DashboardProps) => {
  const shouldLoadDashboard = isDashboardId(dashboard);

  const {
    dashboard: dashboardModel,
    isLoading,
    isError,
    error,
  } = useDashboardModel({
    dashboardOid: shouldLoadDashboard ? dashboard : '',
    includeWidgets: true,
    includeFilters: true,
    persist: false,
    enabled: shouldLoadDashboard,
  });

  return useMemo(() => {
    if (shouldLoadDashboard) {
      return {
        dashboardProps: dashboardModel && dashboardModelTranslator.toDashboardProps(dashboardModel),
        isLoading,
        isError,
        error,
      };
    }

    return {
      dashboardProps: dashboard,
      isLoading: false,
      isError: false,
      error: undefined,
    };
  }, [dashboard, dashboardModel, isLoading, isError, error, shouldLoadDashboard]);
};

// Removed individual components - now using unified approach with hook

/**
 * JTD-specific Dashboard component that handles runtime filters
 * This component can render either by dashboard ID or with provided dashboard props
 * @internal
 */
export const JtdDashboard = withTracking({ componentName: 'JtdDashboard', config: {} })(
  withErrorBoundary({
    componentName: 'JtdDashboard',
  })(
    ({
      dashboard,
      filters: runtimeFilters,
      mergeTargetDashboardFilters,
      dashboardConfig: jtdDashboardConfig,
    }: JtdDashboardProps) => {
      const { dashboardProps, isLoading, isError, error } = useJtdTargetDashboardProps(dashboard);

      const finalDashboardProps = useMemo(() => {
        if (!dashboardProps || !runtimeFilters) {
          return dashboardProps;
        }

        if (mergeTargetDashboardFilters) {
          const dashboardFilters = dashboardProps.filters || [];
          const mergedFilters =
            Array.isArray(runtimeFilters) && Array.isArray(dashboardFilters)
              ? mergeFilters(dashboardFilters, runtimeFilters)
              : runtimeFilters;

          return { ...dashboardProps, filters: mergedFilters };
        } else {
          return { ...dashboardProps, filters: runtimeFilters };
        }
      }, [dashboardProps, runtimeFilters, mergeTargetDashboardFilters]);

      const shouldLoadDashboard = isDashboardId(dashboard);
      // TODO - check if relevant:
      // No need to merge finalDashboardProps?.config with default config.
      // The default dashboard config will be applied inside Dashboard component.
      const baseConfig = useDefaults(
        finalDashboardProps?.config,
        shouldLoadDashboard ? DEFAULT_DASHBOARD_BY_ID_CONFIG : DEFAULT_DASHBOARD_CONFIG,
      );

      // TODO - check if relevant:
      // This entire useMemo could be replaced with:
      // const dashboardConfig = useDefaults(jtdDashboardConfig, finalDashboardProps?.config);
      const dashboardConfig = useMemo(() => {
        if (!jtdDashboardConfig) {
          return baseConfig;
        }

        // Deep merge baseConfig with jtdDashboardConfig, giving priority to jtdDashboardConfig
        return deepMerge.withOptions(
          { mergeArrays: false },
          baseConfig,
          jtdDashboardConfig,
        ) as DashboardConfig;
      }, [baseConfig, jtdDashboardConfig]);

      if (isError && error) {
        throw error;
      }

      if (shouldLoadDashboard) {
        return (
          <LoadingOverlay isVisible={isLoading}>
            {finalDashboardProps && <Dashboard {...finalDashboardProps} config={dashboardConfig} />}
          </LoadingOverlay>
        );
      }

      return finalDashboardProps ? (
        <Dashboard {...finalDashboardProps} config={dashboardConfig} />
      ) : null;
    },
  ),
);
