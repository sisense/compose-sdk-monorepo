import { useCallback, useEffect, useMemo, useReducer } from 'react';

import {
  deleteWidgetsFromLayout,
  findDeletedWidgetsFromLayout,
} from '@/domains/dashboarding/components/editable-layout/helpers';
import { DashboardModel } from '@/domains/dashboarding/dashboard-model';
import { RestApiNotReadyError, useRestApi } from '@/infra/api/rest-api';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { usePrevious } from '@/shared/hooks/use-previous';

import {
  dashboardReducer,
  persistDashboardModelMiddleware,
  UseDashboardModelAction,
  UseDashboardModelActionType,
  UseDashboardModelActionTypeInternal,
  UseDashboardModelInternalAction,
} from './dashboard-model-reducer';
import { checkPersistenceSupport } from './use-dashboard-model-utils';

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
   * Function to dispatch changes to the dashboard model with optional persistence.
   * Returns a promise that resolves to the processed (or transformed) action.
   */
  dispatchChanges: (action: UseDashboardModelAction) => Promise<UseDashboardModelInternalAction>;
}

/**
 * Transforms a WIDGETS_DELETE action to UPDATE_WIDGETS_PANEL_LAYOUT_AND_WIDGETS_DELETE
 * when widgetsPanel exists in the dashboard.
 *
 * @param action - The action to potentially transform
 * @param dashboard - The current dashboard model
 * @returns The transformed action or the original action
 */
const transformWidgetsDeleteAction = (
  action: UseDashboardModelInternalAction,
  dashboard: DashboardModel | null,
): UseDashboardModelInternalAction => {
  if (
    dashboard &&
    action.type === UseDashboardModelActionType.WIDGETS_DELETE &&
    dashboard.layoutOptions.widgetsPanel
  ) {
    const updatedWidgetsPanel = deleteWidgetsFromLayout(
      dashboard.layoutOptions.widgetsPanel,
      action.payload,
    );
    return {
      type: UseDashboardModelActionTypeInternal.UPDATE_WIDGETS_PANEL_LAYOUT_AND_WIDGETS_DELETE,
      payload: {
        widgetsPanel: updatedWidgetsPanel,
        widgets: action.payload,
      },
    };
  }
  return action;
};

/**
 * Transforms a WIDGETS_PANEL_LAYOUT_UPDATE action to UPDATE_WIDGETS_PANEL_LAYOUT_AND_WIDGETS_DELETE
 * when widgets need to be deleted as a result of the layout update.
 *
 * @param action - The action to potentially transform
 * @param dashboard - The current dashboard model
 * @returns The transformed action or the original action
 */
const transformLayoutUpdateAction = (
  action: UseDashboardModelInternalAction,
  dashboard: DashboardModel | null,
): UseDashboardModelInternalAction => {
  if (
    dashboard &&
    action.type === UseDashboardModelActionType.WIDGETS_PANEL_LAYOUT_UPDATE &&
    dashboard.layoutOptions.widgetsPanel
  ) {
    const widgetsToDelete = findDeletedWidgetsFromLayout(
      dashboard.layoutOptions.widgetsPanel,
      action.payload,
    );
    if (widgetsToDelete.length > 0) {
      return {
        type: UseDashboardModelActionTypeInternal.UPDATE_WIDGETS_PANEL_LAYOUT_AND_WIDGETS_DELETE,
        payload: {
          widgetsPanel: action.payload,
          widgets: widgetsToDelete,
        },
      };
    }
  }
  return action;
};

/**
 * Applies action transformations in a pipeline.
 *
 * @param action - The initial action
 * @param dashboard - The current dashboard model
 * @returns The final transformed action
 */
const transformAction = (
  action: UseDashboardModelInternalAction,
  dashboard: DashboardModel | null,
): UseDashboardModelInternalAction => {
  return transformLayoutUpdateAction(transformWidgetsDeleteAction(action, dashboard), dashboard);
};

/**
 * Hook that provides persistence capabilities for an already loaded dashboard model.
 * This hook manages local state changes and optionally persists them to the server.
 *
 * @param params - Parameters for dashboard persistence
 * @returns Dashboard persistence state and dispatch function
 *
 * @sisenseInternal
 */
export function useDashboardPersistence({
  dashboard,
  persist = true,
  sharedMode = false,
}: UseDashboardPersistenceParams): UseDashboardPersistenceResult {
  const { restApi: api, isReady: apiIsReady } = useRestApi();
  const { app } = useSisenseContext();
  const { themeSettings } = useThemeContext();
  const previousDashboard = usePrevious(dashboard);

  const isPersistenceSupported = useMemo(
    () => !!app?.httpClient.auth && checkPersistenceSupport(app.httpClient.auth.type, persist),
    [app?.httpClient.auth, persist],
  );
  const shouldEnablePersist = persist && isPersistenceSupported;

  const [localDashboard, dispatch] = useReducer(dashboardReducer, dashboard);

  const persistentDispatch = useCallback(
    async (action: UseDashboardModelInternalAction): Promise<UseDashboardModelInternalAction> => {
      if (!apiIsReady || !api || !app) {
        throw new RestApiNotReadyError();
      }

      // Transform the action to handle layout updates and widget deletions
      const transformedAction = transformAction(action, localDashboard);

      if (shouldEnablePersist) {
        const processedAction = await persistDashboardModelMiddleware({
          dashboardOid: localDashboard?.oid,
          action: transformedAction,
          restApi: api,
          sharedMode,
          appSettings: app.settings,
          themeSettings,
        });
        dispatch(processedAction);
        return processedAction;
      }
      dispatch(transformedAction);
      return transformedAction;
    },
    [
      shouldEnablePersist,
      localDashboard,
      api,
      apiIsReady,
      dispatch,
      sharedMode,
      app,
      themeSettings,
    ],
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
