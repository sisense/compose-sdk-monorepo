import { Filter, FilterRelations } from '@sisense/sdk-data';

import {
  DashboardModel,
  SpecificWidgetOptions,
  WidgetsPanelLayout,
} from '@/domains/dashboarding/dashboard-model';
import { WidgetModel } from '@/domains/widgets/widget-model';

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
 * @sisenseInternal
 */
export enum UseDashboardModelActionType {
  FILTERS_UPDATE = 'FILTERS.UPDATE',
  ADD_WIDGET = 'WIDGETS.ADD',
  PATCH_WIDGET = 'WIDGETS.PATCH',
  WIDGETS_PANEL_LAYOUT_UPDATE = 'WIDGETS_PANEL_LAYOUT.UPDATE',
  WIDGETS_DELETE = 'WIDGETS.DELETE',
}

/**
 * Fields that can be safely patched on a widget without full DTO reconstruction.
 * Intentionally narrow — extend only when lossless roundtrip is guaranteed.
 *
 * @internal
 */
export type WidgetPatch = {
  title?: string;
};

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
  | UseDashboardModelPatchWidgetAction
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
 * If widgetsPanelLayout is not provided, the widget will be appended to the first cell of the first column.
 *
 * WidgetModel plain payload will be deprecated in the future.
 * Instead, use the following payload:
 * {
 *   widget: WidgetModel;
 *   widgetsPanelLayout?: WidgetsPanelLayout;
 *   widgetOptions?: SpecificWidgetOptions;
 * }
 */
export type UseDashboardModelAddWidgetAction = {
  type: UseDashboardModelActionType.ADD_WIDGET;
  payload:
    | WidgetModel
    | {
        widget: WidgetModel;
        widgetsPanelLayout?: WidgetsPanelLayout;
        widgetOptions?: SpecificWidgetOptions;
      };
};

/**
 * Patch widget action for the dashboard model state used in {@link useDashboardModel}.
 *
 * @internal
 */
export type UseDashboardModelPatchWidgetAction = {
  type: UseDashboardModelActionType.PATCH_WIDGET;
  payload: {
    widgetOid: string;
    patch: WidgetPatch;
  };
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
 * Widgets delete action for the dashboard model state used in {@link useDashboardModel}.
 * {@link UseDashboardWidgetsDeleteAction} is dispatched with
 * {@link UseDashboardModelActionType.WIDGETS_DELETE}.
 *
 * @internal
 */
export type UseDashboardWidgetsDeleteAction = {
  type: UseDashboardModelActionType.WIDGETS_DELETE;
  payload: string[];
};

export type AddWidgetPayload = UseDashboardModelAddWidgetAction['payload'];
