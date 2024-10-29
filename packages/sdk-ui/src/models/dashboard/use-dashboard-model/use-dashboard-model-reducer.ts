import { DashboardModel } from '@/models';
import { Filter } from '@sisense/sdk-data';
import { RestApi } from '@/api/rest-api';
import { filterToFilterDto } from '../translate-dashboard-dto-utils';

export type UseDashboardModelState = DashboardModel | null;

/**
 * Internal action types for the dashboard model state used in {@link useDashboardModel}.
 *
 * @internal
 */
export enum UseDashboardModelActionTypeInternal {
  DASHBOARD_INIT = 'DASHBOARD.INIT',
}

/**
 * Action types for the dashboard model state used in {@link useDashboardModel}.
 *
 * @internal
 */
export enum UseDashboardModelActionType {
  FILTERS_UPDATE = 'FILTERS.UPDATE',
}

/**
 * Internal actions for the dashboard model state used in {@link useDashboardModel}.
 *
 * @internal
 */
type UseDashboardModelInternalAction =
  | UseDashboardModelAction
  | {
      type: UseDashboardModelActionTypeInternal.DASHBOARD_INIT;
      payload: DashboardModel;
    };

/**
 * Actions for the dashboard model state used in {@link useDashboardModel}.
 *
 * @internal
 */
export type UseDashboardModelAction = {
  type: UseDashboardModelActionType.FILTERS_UPDATE;
  payload: Filter[];
};

/**
 * Reducer for the dashboard model state used in {@link useDashboardModel}.
 * @param state
 * @param action
 *
 * @internal
 */
export function dashboardReducer(
  state: UseDashboardModelState,
  action: UseDashboardModelInternalAction,
): UseDashboardModelState {
  switch (action.type) {
    case UseDashboardModelActionTypeInternal.DASHBOARD_INIT:
      return {
        ...state,
        ...action.payload,
      };
    case UseDashboardModelActionType.FILTERS_UPDATE:
      return {
        ...(state as DashboardModel),
        filters: action.payload,
      };
    default:
      return state;
  }
}

/**
 * Middleware connector for {@link persistDashboardModelMiddleware}.
 * @param restApi - The Sisense REST API instance
 * @param reducer - The dashboard model reducer
 *
 * @internal
 */
export function withPersistDashboardModelMiddleware(
  restApi: RestApi,
  reducer: (
    state: UseDashboardModelState,
    action: UseDashboardModelInternalAction,
  ) => UseDashboardModelState,
) {
  return (state: UseDashboardModelState, action: UseDashboardModelInternalAction) => {
    if (state !== null && action.type !== UseDashboardModelActionTypeInternal.DASHBOARD_INIT) {
      persistDashboardModelMiddleware(state, action, restApi).catch((error) => {
        console.error('Failed to persist dashboard model changes with error:', error);
      });
    }

    return reducer(state, action);
  };
}

/**
 * Middleware that persists the dashboard model changes to the Sisense server.
 * @param restApi - The Sisense REST API instance
 * @param reducer - The dashboard model reducer
 *
 * @internal
 */
export function persistDashboardModelMiddleware(
  state: DashboardModel,
  action: UseDashboardModelAction,
  restApi: RestApi,
) {
  if (action.type === UseDashboardModelActionType.FILTERS_UPDATE) {
    return restApi.patchDashboard(state.oid, {
      filters: action.payload.map(filterToFilterDto),
    });
  }

  return Promise.resolve(null);
}
