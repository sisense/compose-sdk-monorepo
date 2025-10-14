import { useCallback, useEffect, useMemo, useReducer } from 'react';

import { RestApiNotReadyError, useRestApi } from '@/api/rest-api';
import { usePrevious } from '@/common/hooks/use-previous';
import {
  deleteWidgetsFromLayout,
  findDeletedWidgetsFromLayout,
} from '@/dashboard/components/editable-layout/helpers';
import { DashboardModel } from '@/models';
import { useSisenseContext } from '@/sisense-context/sisense-context';

import { checkPersistenceSupport } from './use-dasboard-model-utils';
import {
  dashboardReducer,
  persistDashboardModelMiddleware,
  UseDashboardModelAction,
  UseDashboardModelActionType,
  UseDashboardModelActionTypeInternal,
  UseDashboardModelInternalAction,
} from './use-dashboard-model-reducer';

export interface UseDashboardPersistenceParams {
  /**
   * The dashboard model to manage persistence for
   */
  dashboard: DashboardModel | null;
  /**
   * Boolean flag indicating whether changes to the dashboard state should be saved to the dashboard in Fusion
   *
   * @default true
   */
  persist?: boolean;
  /**
   * Whether to load the dashboard in shared mode (co-authoring feature).
   *
   * @default false
   * @internal
   */
  sharedMode?: boolean;
}

export interface UseDashboardPersistenceResult {
  /**
   * The current dashboard model with local state
   */
  dashboard: DashboardModel | null;
  /**
   * Function to dispatch changes to the dashboard model with optional persistence
   * Returns a promise when persistence is enabled to allow error handling
   */
  dispatchChanges: (action: UseDashboardModelAction) => Promise<void> | void;
}

/**
 * Hook that provides persistence capabilities for an already loaded dashboard model.
 * This hook manages local state changes and optionally persists them to the server.
 *
 * @param params - Parameters for dashboard persistence
 * @returns Dashboard persistence state and dispatch function
 * @internal
 */
export function useDashboardPersistence({
  dashboard,
  persist = true,
  sharedMode = false,
}: UseDashboardPersistenceParams): UseDashboardPersistenceResult {
  const { restApi: api, isReady: apiIsReady } = useRestApi();
  const { app } = useSisenseContext();
  const previousDashboard = usePrevious(dashboard);

  const isPersistenceSupported = useMemo(
    () => !!app?.httpClient.auth && checkPersistenceSupport(app.httpClient.auth.type, persist),
    [app?.httpClient.auth, persist],
  );
  const shouldEnablePersist = persist && isPersistenceSupported;

  const [localDashboard, dispatch] = useReducer(dashboardReducer, dashboard);

  const persistentDispatch = useCallback(
    async (action: UseDashboardModelInternalAction): Promise<void> => {
      if (!apiIsReady || !api) {
        throw new RestApiNotReadyError();
      }

      if (
        localDashboard &&
        action.type === UseDashboardModelActionType.WIDGETS_DELETE &&
        localDashboard.layoutOptions.widgetsPanel
      ) {
        const updatedWidgetsPanel = deleteWidgetsFromLayout(
          localDashboard.layoutOptions.widgetsPanel,
          action.payload,
        );
        action = {
          type: UseDashboardModelActionTypeInternal.UPDATE_WIDGETS_PANEL_LAYOUT_AND_WIDGETS_DELETE,
          payload: {
            widgetsPanel: updatedWidgetsPanel,
            widgets: action.payload,
          },
        };
      }
      if (
        localDashboard &&
        action.type === UseDashboardModelActionType.WIDGETS_PANEL_LAYOUT_UPDATE &&
        localDashboard.layoutOptions.widgetsPanel
      ) {
        const widgetsToDelete = findDeletedWidgetsFromLayout(
          localDashboard.layoutOptions.widgetsPanel,
          action.payload,
        );
        if (widgetsToDelete.length > 0) {
          action = {
            type: UseDashboardModelActionTypeInternal.UPDATE_WIDGETS_PANEL_LAYOUT_AND_WIDGETS_DELETE,
            payload: {
              widgetsPanel: action.payload,
              widgets: widgetsToDelete,
            },
          };
        }
      }

      if (shouldEnablePersist) {
        const processedAction = await persistDashboardModelMiddleware(
          localDashboard?.oid,
          action,
          api,
          sharedMode,
        );
        dispatch(processedAction);
      } else {
        dispatch(action);
      }
    },
    [shouldEnablePersist, localDashboard, api, apiIsReady, dispatch, sharedMode],
  );

  // Sync with external dashboard changes when the dashboard reference changes
  // Use previous value to avoid infinite loops
  useEffect(() => {
    if (dashboard && dashboard !== previousDashboard) {
      dispatch({
        type: UseDashboardModelActionTypeInternal.DASHBOARD_INIT,
        payload: dashboard,
      });
    }
  }, [dashboard, previousDashboard]);

  return {
    dashboard: localDashboard,
    dispatchChanges: persistentDispatch,
  };
}
