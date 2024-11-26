import { DashboardModel, WidgetModel, widgetModelTranslator } from '@/models';
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
  DASHBOARD_UPDATE_LAYOUT = 'DASHBOARD.UPDATE_LAYOUT',
}

/**
 * Action types for the dashboard model state used in {@link useDashboardModel}.
 *
 * @internal
 */
export enum UseDashboardModelActionType {
  FILTERS_UPDATE = 'FILTERS.UPDATE',
  ADD_WIDGET = 'WIDGETS.ADD',
}

/**
 * Internal actions for the dashboard model state used in {@link useDashboardModel}.
 *
 * @internal
 */
export type UseDashboardModelInternalAction =
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
export type UseDashboardModelAction =
  | UseDashboardModelFilterUpdateAction
  | UseDashboardModelAddWidgetAction;

/**
 * Filter update actions for the dashboard model state used in {@link useDashboardModel}.
 *
 * @internal
 */
export type UseDashboardModelFilterUpdateAction = {
  type: UseDashboardModelActionType.FILTERS_UPDATE;
  payload: Filter[];
};

/**
 * Add widget action for the dashboard model state used in {@link useDashboardModel}.
 *
 * @internal
 */
export type UseDashboardModelAddWidgetAction = {
  type: UseDashboardModelActionType.ADD_WIDGET;
  payload: WidgetModel;
};

/**
 * Reducer for the dashboard model state used in {@link useDashboardModel}.
 *
 * @param state
 * @param action
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
    case UseDashboardModelActionType.ADD_WIDGET: {
      const widgets = [...(state as DashboardModel).widgets, action.payload];
      const columns = [...((state as DashboardModel)?.layoutOptions?.widgetsPanel?.columns || [])];
      if (columns[0]) {
        if (!columns[0].rows.length) columns[0].rows.push({ cells: [] });
        columns[0].rows[0].cells.push({
          widgetId: action.payload.oid,
          widthPercentage: 100,
        });
      }
      return {
        ...(state as DashboardModel),
        ...(state?.layoutOptions.widgetsPanel
          ? {
              layoutOptions: {
                ...state?.layoutOptions,
                widgetsPanel: {
                  ...state?.layoutOptions.widgetsPanel,
                  columns,
                },
              },
            }
          : null),
        widgets,
      };
    }
    default:
      return state;
  }
}

/**
 * Middleware that persists the dashboard model changes to the Sisense server.
 *
 * @param restApi - The Sisense REST API instance
 * @param reducer - The dashboard model reducer
 * @internal
 */
export function persistDashboardModelMiddleware(
  dashbordOid: string | undefined,
  action: UseDashboardModelInternalAction,
  restApi: RestApi,
): Promise<UseDashboardModelInternalAction> {
  if (!dashbordOid) throw new Error('Dashboard model is not initialized');

  if (action.type === UseDashboardModelActionType.FILTERS_UPDATE) {
    return restApi
      .patchDashboard(dashbordOid, {
        filters: action.payload.map(filterToFilterDto),
      })
      .then(() => action);
  } else if (action.type === UseDashboardModelActionType.ADD_WIDGET) {
    return restApi
      .addWidgetToDashboard(dashbordOid, widgetModelTranslator.toWidgetDto(action.payload))
      .then((widgetDto) => {
        if (!widgetDto) throw new Error('Failed to add widget to dashboard');
        return {
          type: UseDashboardModelActionType.ADD_WIDGET,
          payload: widgetModelTranslator.fromWidgetDto(widgetDto),
        };
      });
  }

  return Promise.resolve(action);
}
