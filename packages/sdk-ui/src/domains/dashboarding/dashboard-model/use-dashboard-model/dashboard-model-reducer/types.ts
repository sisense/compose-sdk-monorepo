import { Filter, FilterRelations } from '@sisense/sdk-data';

import {
  DashboardModel,
  SpecificWidgetOptions,
  WidgetsPanelLayout,
} from '@/domains/dashboarding/dashboard-model';
import { TabberConfig } from '@/domains/dashboarding/hooks/use-tabber';
import type { WidgetPropsUpdate } from '@/domains/dashboarding/persistence/update-types.js';
import type { WidgetDto } from '@/domains/widgets/components/widget-by-id/types';
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
  UPDATE_WIDGET = 'WIDGETS.UPDATE',
  WIDGETS_PANEL_LAYOUT_UPDATE = 'WIDGETS_PANEL_LAYOUT.UPDATE',
  WIDGETS_DELETE = 'WIDGETS.DELETE',
}

/**
 * Fields that can be safely patched on a widget without full DTO reconstruction.
 * Intentionally narrow — extend only when lossless roundtrip is guaranteed.
 *
 * @sisenseInternal
 */
export type WidgetPatch = {
  /**
   * The title of the widget.
   */
  title?: string;
  /**
   * Full widget options to send in the PATCH request.
   * Must include all existing option fields alongside the changed ones, because
   * the server replaces the entire options object rather than merging.
   */
  options?: Partial<NonNullable<WidgetDto['options']>> & {
    previousScrollerLocation: { min: number; max: number };
  };
  /**
   * Full opaque widget style to send in the PATCH request. Used for custom
   * (plugin) widgets whose `styleOptions` round-trip through `WidgetDto.style`.
   * Must reconstruct the entire style object (the server replaces it on PATCH).
   */
  style?: WidgetDto['style'];
  /**
   * Full custom-widget options bag to send in the PATCH request.
   * Must include all existing keys alongside the changed ones, because the
   * server replaces the entire object rather than merging.
   */
  customOptions?: Record<string, unknown>;
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
 * Props-shaped widget update action. Carries a partial `WidgetPropsUpdate` that
 * the reducer applies to the in-memory `WidgetModel` and the persist middleware
 * translates to a targeted DTO patch via its per-field mapping table.
 *
 * @internal
 */
export type UseDashboardModelUpdateWidgetAction = {
  type: UseDashboardModelActionType.UPDATE_WIDGET;
  payload: {
    widgetOid: string;
    update: WidgetPropsUpdate;
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
  | UseDashboardModelUpdateWidgetAction
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
        /**
         * Dashboard-level tabber config for the widget (from `config.tabbers[id]`),
         * carried so the persist middleware can project it back onto the widget DTO
         * and the reducer can store it under the new widget id on duplication.
         */
        tabberConfig?: TabberConfig;
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
