import flow from 'lodash-es/flow';

import { DashboardModel } from '@/domains/dashboarding/dashboard-model';
import { deepMerge } from '@/domains/dashboarding/persistence/deep-merge.js';
import type { WidgetPropsUpdate } from '@/domains/dashboarding/persistence/update-types.js';
import { WidgetModel } from '@/domains/widgets/widget-model';
import { ContextfulTransformer } from '@/shared/utils/utility-types/transformer';

import {
  UseDashboardModelActionType,
  UseDashboardModelActionTypeInternal,
  UseDashboardModelInternalAction,
  UseDashboardModelState,
} from './types.js';
import { appendWidgetToFirstCell, parseAddWidgetPayload } from './utils.js';

/**
 * Deep-merges a partial `styleOptions` subtree into the widget's existing
 * `styleOptions`, preserving sibling keys at any depth. Returns the widget
 * unchanged when no update is provided.
 * @param styleOptions - The partial style options to merge, if any.
 * @returns A transformer over a widget that merges its `styleOptions`.
 */
const withStyleOptions: ContextfulTransformer<WidgetModel, WidgetPropsUpdate['styleOptions']> =
  (styleOptions) => (widget) =>
    // Deep merge subsumes the previously special-cased
    // `navigator.scrollerLocation` graft: nested plain objects merge recursively,
    // so a partial subtree lands without dropping sibling keys at any depth.
    styleOptions
      ? { ...widget, styleOptions: deepMerge(widget.styleOptions ?? {}, styleOptions) }
      : widget;

/**
 * Deep-merges a partial `customOptions` subtree into the widget's existing
 * `customOptions`, preserving sibling keys at any depth. Returns the widget
 * unchanged when no update is provided.
 * @param customOptions - The partial custom options to merge, if any.
 * @returns A transformer over a widget that merges its `customOptions`.
 */
const withCustomOptions: ContextfulTransformer<WidgetModel, WidgetPropsUpdate['customOptions']> =
  (customOptions) => (widget) =>
    customOptions
      ? { ...widget, customOptions: deepMerge(widget.customOptions ?? {}, customOptions) }
      : widget;

/**
 * Sets the widget's `title`. Returns the widget unchanged when the title update
 * is `undefined`.
 * @param title - The new title, or `undefined` to leave the widget untouched.
 * @returns A transformer over a widget that sets its `title`.
 */
const withTitle: ContextfulTransformer<WidgetModel, WidgetPropsUpdate['title']> =
  (title) => (widget) =>
    title === undefined ? widget : { ...widget, title };

/**
 * Applies a narrow {@link WidgetPropsUpdate} to a {@link WidgetModel} by
 * deep-merging the supported subtrees (see {@link deepMerge} for the
 * semantics) — fields outside the supported set are silently ignored
 * (TypeScript guards against this at call sites, since `WidgetPropsUpdate`
 * only carries supported keys).
 */
function applyWidgetPropsUpdate(widget: WidgetModel, update: WidgetPropsUpdate): WidgetModel {
  return flow(
    withStyleOptions(update.styleOptions),
    withCustomOptions(update.customOptions),
    withTitle(update.title),
  )(widget);
}

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
    case UseDashboardModelActionType.UPDATE_WIDGET: {
      const model = state as DashboardModel;
      const { widgetOid, update } = action.payload;
      return {
        ...model,
        widgets: model.widgets.map((widget) =>
          widget.oid === widgetOid ? applyWidgetPropsUpdate(widget, update) : widget,
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
        tabberConfig,
      } = parseAddWidgetPayload(action.payload);
      const widgets = [...model.widgets, widget];
      const newLayout =
        customLayout ?? appendWidgetToFirstCell(model.layoutOptions?.widgetsPanel, widget.oid);

      const updatedWidgetsOptions =
        widgetOptions != null
          ? { ...model.widgetsOptions, [widget.oid]: widgetOptions }
          : model.widgetsOptions;

      // Carry the dashboard-level tabber config to the new widget id (duplication).
      const updatedConfig =
        tabberConfig != null
          ? {
              ...model.config,
              tabbers: { ...model.config?.tabbers, [widget.oid]: tabberConfig },
            }
          : model.config;

      return {
        ...model,
        widgets,
        widgetsOptions: updatedWidgetsOptions,
        config: updatedConfig,
        ...(model.layoutOptions?.widgetsPanel && newLayout
          ? { layoutOptions: { ...model.layoutOptions, widgetsPanel: newLayout } }
          : {}),
      };
    }
    default:
      return state;
  }
}
