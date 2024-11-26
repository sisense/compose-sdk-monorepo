import { GetDashboardModelParams, useGetDashboardModel } from '@/models';
import { Dispatch, useCallback, useEffect, useMemo, useReducer } from 'react';
import { RestApiNotReadyError, useRestApi } from '@/api/rest-api';
import {
  dashboardReducer,
  UseDashboardModelAction,
  UseDashboardModelInternalAction,
  UseDashboardModelActionTypeInternal,
} from './use-dashboard-model-reducer';
import { withTracking } from '@/decorators/hook-decorators';
import { checkPersistenceSupport } from '@/models/dashboard/use-dashboard-model/use-dasboard-model-utils';
import { useSisenseContext } from '@/sisense-context/sisense-context';

import { persistDashboardModelMiddleware } from './use-dashboard-model-reducer';

export interface UseDashboardModelParams extends GetDashboardModelParams {
  /**
   * Boolean flag indicating whether changes to the dashboard state should be saved to the dashboard in Fusion
   *
   * @default true
   * @internal
   */
  persist?: boolean;
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
}: UseDashboardModelParams) {
  const { restApi: api, isReady: apiIsReady } = useRestApi();
  const { app } = useSisenseContext();

  const isPersistenceSupported = useMemo(
    () => !!app?.httpClient.auth && checkPersistenceSupport(app.httpClient.auth.type, persist),
    [app?.httpClient.auth, persist],
  );
  const shouldEnablePersist = persist && isPersistenceSupported;

  const [dashboard, dispatch] = useReducer(dashboardReducer, null);

  const persistantDispatch = useCallback(
    async (action: UseDashboardModelInternalAction) => {
      if (!apiIsReady || !api) {
        throw new RestApiNotReadyError();
      }
      if (shouldEnablePersist) {
        action = await persistDashboardModelMiddleware(dashboard?.oid, action, api);
      }
      return dispatch(action);
    },
    [shouldEnablePersist, dashboard?.oid, api, apiIsReady, dispatch],
  );

  const {
    dashboard: fetchedDashboard,
    isLoading,
    isError,
  } = useGetDashboardModel({
    dashboardOid,
    includeWidgets,
    includeFilters,
  });

  useEffect(() => {
    if (fetchedDashboard) {
      dispatch({
        type: UseDashboardModelActionTypeInternal.DASHBOARD_INIT,
        payload: fetchedDashboard,
      });
    }
  }, [fetchedDashboard, dispatch]);

  return {
    dashboard,
    isLoading,
    isError,
    dispatchChanges: persistantDispatch as Dispatch<UseDashboardModelAction>,
  };
}
