import { GetDashboardModelParams, useGetDashboardModelInternal } from '../use-get-dashboard-model';
import { withTracking } from '@/decorators/hook-decorators';
import {
  useDashboardPersistence,
  UseDashboardPersistenceResult,
} from './use-dashboard-persistence';

export interface UseDashboardModelParams extends GetDashboardModelParams {
  /**
   * Boolean flag indicating whether changes to the dashboard state should be saved to the dashboard in Fusion
   *
   * @default true
   * @internal
   */
  persist?: boolean;
}

export interface UseDashboardModelResult extends UseDashboardPersistenceResult {
  /**
   * Whether the dashboard model is loading
   */
  isLoading: boolean;
  /**
   * Whether the dashboard model load has failed
   */
  isError: boolean;
  /**
   * The error if any occurred during loading
   */
  error: Error | undefined;
}

/**
 *  This hook allows you to retrieve and manage a dashboard model from a Sisense instance.
 *  It handles fetching the existing dashboard, managing its local state, and saving any changes back to the Sisense server.
 * (only filters persist supported for now)
 *
 * @returns Dashboard load state that contains the status of the execution, the result dashboard model, or the error if any, function to dispatch changes to the dashboard model.
 * @group Fusion Embed
 * @fusionEmbed
 * @internal
 */
export const useDashboardModel = withTracking('useDashboardModel')(useDashboardModelInternal);

/**
 * {@link useDashboardModel} without tracking to be used inside other hooks or components in Compose SDK.
 *
 * @internal
 */
export function useDashboardModelInternal({
  dashboardOid,
  includeWidgets,
  includeFilters,
  persist = true,
  sharedMode = false,
}: UseDashboardModelParams): UseDashboardModelResult {
  // Pure data fetching
  const {
    dashboard: fetchedDashboard,
    isLoading,
    isError,
    error,
  } = useGetDashboardModelInternal({
    dashboardOid,
    includeWidgets,
    includeFilters,
    sharedMode,
  });

  // Persistence layer
  const { dashboard, dispatchChanges } = useDashboardPersistence({
    dashboard: fetchedDashboard ?? null,
    persist,
    sharedMode,
  });

  return {
    dashboard,
    isLoading,
    isError,
    error,
    dispatchChanges,
  };
}
