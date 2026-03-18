import { DashboardModel } from '@/domains/dashboarding/dashboard-model';

import {
  UseDashboardModelActionType,
  UseDashboardModelActionTypeInternal,
  UseDashboardModelInternalAction,
  UseDashboardModelState,
} from './types.js';
import { appendWidgetToFirstCell, parseAddWidgetPayload } from './utils.js';

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
    case UseDashboardModelActionType.PATCH_WIDGET: {
      const model = state as DashboardModel;
      const { widgetOid, patch } = action.payload;
      return {
        ...model,
        widgets: model.widgets.map((widget) =>
          widget.oid === widgetOid ? { ...widget, ...patch } : widget,
        ),
      };
    }
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
      const model = state as DashboardModel;
      const {
        widget,
        widgetsPanelLayout: customLayout,
        widgetOptions,
      } = parseAddWidgetPayload(action.payload);
      const widgets = [...model.widgets, widget];
      const newLayout =
        customLayout ?? appendWidgetToFirstCell(model.layoutOptions?.widgetsPanel, widget.oid);

      const updatedWidgetsOptions =
        widgetOptions != null
          ? { ...model.widgetsOptions, [widget.oid]: widgetOptions }
          : model.widgetsOptions;

      return {
        ...model,
        widgets,
        widgetsOptions: updatedWidgetsOptions,
        ...(model.layoutOptions?.widgetsPanel && newLayout
          ? { layoutOptions: { ...model.layoutOptions, widgetsPanel: newLayout } }
          : {}),
      };
    }
    default:
      return state;
  }
}
