import React, { useMemo } from 'react';
import { mergeFilters, type Filter } from '@sisense/sdk-data';
import { LoadingOverlay } from '@/common/components/loading-overlay';
import * as dashboardModelTranslator from '@/models/dashboard/dashboard-model-translator';
import { useDashboardModel } from '@/models/dashboard/use-dashboard-model/use-dashboard-model';
import { TranslatableError } from '@/translation/translatable-error';
import { useDefaults } from '@/common/hooks/use-defaults';
import { DEFAULT_DASHBOARD_BY_ID_CONFIG } from '@/dashboard/constants';
import { Dashboard } from '@/dashboard/dashboard';
import { DashboardConfig } from '@/dashboard/types';

// Props interface for JTD Dashboard component
interface JtdDashboardProps {
  dashboardOid: string;
  filters: Filter[];
  mergeTargetDashboardFilters: boolean;
  displayToolbarRow: boolean;
  displayFilterPane: boolean;
}

/**
 * JTD-specific Dashboard component that handles runtime filters
 * This component reuses DashboardById logic but is specifically designed for JTD use cases
 * @internal
 */
export const JtdDashboard = ({
  dashboardOid,
  filters: runtimeFilters,
  mergeTargetDashboardFilters,
  displayToolbarRow,
  displayFilterPane,
}: JtdDashboardProps) => {
  // Call all hooks at the top level
  const { dashboard, isLoading, isError, error } = useDashboardModel({
    dashboardOid,
    includeWidgets: true,
    includeFilters: true,
    persist: false, // Always non-persistent for JTD
  });

  const dashboardProps = useMemo(() => {
    const props = dashboard && dashboardModelTranslator.toDashboardProps(dashboard);

    // Handle filter merging based on mergeTargetDashboardFilters flag
    if (props && runtimeFilters) {
      if (mergeTargetDashboardFilters) {
        // Merge runtime filters with target dashboard filters
        const dashboardFilters = props.filters || [];
        const mergedFilters =
          Array.isArray(runtimeFilters) && Array.isArray(dashboardFilters)
            ? mergeFilters(dashboardFilters, runtimeFilters)
            : runtimeFilters; // If either is FilterRelations, use runtime filters

        return {
          ...props,
          filters: mergedFilters,
        };
      } else {
        // Only use runtime filters (generated + widget/dashboard filtered by JTD logic)
        return {
          ...props,
          filters: runtimeFilters,
        };
      }
    }

    return props;
  }, [dashboard, runtimeFilters, mergeTargetDashboardFilters]);

  // Move useDefaults calls to top level
  const defaultConfig = useDefaults(dashboardProps?.config, DEFAULT_DASHBOARD_BY_ID_CONFIG);
  const baseConfig = useDefaults<DashboardConfig>(undefined, defaultConfig);

  const dashboardConfig = useMemo(() => {
    // Override toolbar and filters panel visibility based on JTD config
    return {
      ...baseConfig,
      toolbar: {
        ...baseConfig.toolbar,
        visible: displayToolbarRow,
      },
      filtersPanel: {
        ...baseConfig.filtersPanel,
        visible: displayFilterPane,
      },
    };
  }, [baseConfig, displayToolbarRow, displayFilterPane]);

  // Handle error condition after all hooks are called
  if (isError && error) {
    throw new TranslatableError('errors.dashboardLoadFailed', { error: error.message });
  }

  return (
    <LoadingOverlay isVisible={isLoading}>
      {dashboardProps && <Dashboard {...dashboardProps} config={dashboardConfig} />}
    </LoadingOverlay>
  );
};
