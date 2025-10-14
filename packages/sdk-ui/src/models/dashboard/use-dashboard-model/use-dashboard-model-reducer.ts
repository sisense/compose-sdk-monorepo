import { Filter, FilterRelations } from '@sisense/sdk-data';

import { RestApi } from '@/api/rest-api';
import { DashboardModel, WidgetModel, widgetModelTranslator, WidgetsPanelLayout } from '@/models';
import {
  filterRelationRulesToFilterRelationsModel,
  splitFiltersAndRelations,
} from '@/utils/filter-relations';

import { filterToFilterDto, layoutToLayoutDto } from '../translate-dashboard-dto-utils';

export type UseDashboardModelState = DashboardModel | null;

/**
 * Internal action types for the dashboard model state used in {@link useDashboardModel}.
 *
 * @internal
 */
export enum UseDashboardModelActionTypeInternal {
  DASHBOARD_INIT = 'DASHBOARD.INIT',
  UPDATE_WIDGETS_PANEL_LAYOUT_AND_WIDGETS_DELETE = 'UPDATE_WIDGETS_PANEL_LAYOUT_AND_WIDGETS_DELETE',
}

/**
 * Action types for the dashboard model state used in {@link useDashboardModel}.
 *
 * @internal
 */
export enum UseDashboardModelActionType {
  FILTERS_UPDATE = 'FILTERS.UPDATE',
  ADD_WIDGET = 'WIDGETS.ADD',
  WIDGETS_PANEL_LAYOUT_UPDATE = 'WIDGETS_PANEL_LAYOUT.UPDATE',
  WIDGETS_DELETE = 'WIDGETS.DELETE',
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
    }
  | {
      type: UseDashboardModelActionTypeInternal.UPDATE_WIDGETS_PANEL_LAYOUT_AND_WIDGETS_DELETE;
      payload: {
        widgetsPanel: WidgetsPanelLayout;
        widgets: string[];
      };
    };

/**
 * Actions for the dashboard model state used in {@link useDashboardModel}.
 *
 * @internal
 */
export type UseDashboardModelAction =
  | UseDashboardModelFilterUpdateAction
  | UseDashboardModelAddWidgetAction
  | UseDashboardModelLayoutUpdateAction
  | UseDashboardWidgetsDeleteAction;

/**
 * Filter update actions for the dashboard model state used in {@link useDashboardModel}.
 *
 * @internal
 */
export type UseDashboardModelFilterUpdateAction = {
  type: UseDashboardModelActionType.FILTERS_UPDATE;
  payload: Filter[] | FilterRelations;
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
 * Layout update action for the dashboard model state used in {@link useDashboardModel}.
 *
 * @internal
 */
export type UseDashboardModelLayoutUpdateAction = {
  type: UseDashboardModelActionType.WIDGETS_PANEL_LAYOUT_UPDATE;
  payload: WidgetsPanelLayout;
};

/**
 * Layout update action for the dashboard model state used in {@link useDashboardModel}.
 *
 * @internal
 */
export type UseDashboardWidgetsDeleteAction = {
  type: UseDashboardModelActionType.WIDGETS_DELETE;
  payload: string[];
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
    case UseDashboardModelActionType.WIDGETS_PANEL_LAYOUT_UPDATE:
      return {
        ...(state as DashboardModel),
        layoutOptions: {
          ...(state as DashboardModel).layoutOptions,
          widgetsPanel: action.payload,
        },
      };
    case UseDashboardModelActionType.WIDGETS_DELETE:
      return {
        ...(state as DashboardModel),
        widgets: (state as DashboardModel).widgets.filter(
          (widget) => !action.payload.includes(widget.oid),
        ),
      };
    case UseDashboardModelActionTypeInternal.UPDATE_WIDGETS_PANEL_LAYOUT_AND_WIDGETS_DELETE:
      return {
        ...(state as DashboardModel),
        layoutOptions: {
          ...(state as DashboardModel).layoutOptions,
          widgetsPanel: action.payload.widgetsPanel,
        },
        widgets: (state as DashboardModel).widgets.filter(
          (widget) => !action.payload.widgets.includes(widget.oid),
        ),
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
 * Translates filters and relations to DTOs.
 *
 * @param filtersOrFilterRelations - The filters or filter relations to translate
 * @returns The translated filters and relations DTOs for Fusion
 * @internal
 */
export function translateFiltersAndRelationsToDto(
  filtersOrFilterRelations: Filter[] | FilterRelations,
) {
  const { filters, relations } = splitFiltersAndRelations(filtersOrFilterRelations);
  const filterDtos = filters.map(filterToFilterDto);
  const filterRelationsModel = filterRelationRulesToFilterRelationsModel(relations, filters);
  const stringDataSource = getDataSourceStringFromFilters(filters);
  return {
    filters: filterDtos,
    filterRelations: filterRelationsModel
      ? [
          {
            datasource: stringDataSource,
            filterRelations: filterRelationsModel,
          },
        ]
      : undefined,
  };
}

/**
 * Middleware that persists the dashboard model changes to the Sisense server.
 *
 * @param restApi - The Sisense REST API instance
 * @param reducer - The dashboard model reducer
 * @internal
 */
export async function persistDashboardModelMiddleware(
  dashboardOid: string | undefined,
  action: UseDashboardModelInternalAction,
  restApi: RestApi,
  sharedMode: boolean,
): Promise<UseDashboardModelInternalAction> {
  if (!dashboardOid) throw new Error('Dashboard model is not initialized');

  switch (action.type) {
    case UseDashboardModelActionType.FILTERS_UPDATE:
      await restApi.patchDashboard(
        dashboardOid,
        translateFiltersAndRelationsToDto(action.payload),
        sharedMode,
      );
      break;
    case UseDashboardModelActionType.ADD_WIDGET: {
      const widgetDto = await restApi.addWidgetToDashboard(
        dashboardOid,
        widgetModelTranslator.toWidgetDto(action.payload),
        sharedMode,
      );

      if (!widgetDto) throw new Error('Failed to add widget to dashboard');
      return {
        type: UseDashboardModelActionType.ADD_WIDGET,
        payload: widgetModelTranslator.fromWidgetDto(widgetDto),
      };
    }
    case UseDashboardModelActionType.WIDGETS_PANEL_LAYOUT_UPDATE:
      await restApi.patchDashboard(
        dashboardOid,
        {
          layout: layoutToLayoutDto(action.payload),
        },
        sharedMode,
      );
      break;
    case UseDashboardModelActionType.WIDGETS_DELETE:
      await Promise.all(
        action.payload.map((widgetOid) =>
          restApi.deleteWidgetFromDashboard(dashboardOid, widgetOid, sharedMode),
        ),
      );
      break;
    case UseDashboardModelActionTypeInternal.UPDATE_WIDGETS_PANEL_LAYOUT_AND_WIDGETS_DELETE:
      await restApi.patchDashboard(
        dashboardOid,
        {
          layout: layoutToLayoutDto(action.payload.widgetsPanel),
        },
        sharedMode,
      );
      await Promise.all(
        action.payload.widgets.map((widgetOid) =>
          restApi.deleteWidgetFromDashboard(dashboardOid, widgetOid, sharedMode),
        ),
      );
      break;
  }

  return action;
}

function getDataSourceStringFromFilters(filters: Filter[]): string {
  const allUniqueDatasources = new Set(filters.map((filter) => filter.dataSource?.title));
  if (allUniqueDatasources.size > 1) {
    throw new Error('Persisting filters from multiple datasources is not supported now');
  }
  return allUniqueDatasources.values().next().value;
}
