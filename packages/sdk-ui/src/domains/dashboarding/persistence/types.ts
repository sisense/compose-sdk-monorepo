import type {
  SpecificWidgetOptions,
  WidgetPatch,
  WidgetsPanelLayout,
} from '@/domains/dashboarding/dashboard-model';
import type { TabberConfig } from '@/domains/dashboarding/hooks/use-tabber';
import type { WidgetProps } from '@/domains/widgets/components/widget/types';

import type { WidgetPropsUpdate } from './update-types.js';

export type { WidgetPropsUpdate, OnWidgetUpdate } from './update-types.js';

/**
 * Interface for persisting dashboard changes from the composition layer (e.g. add widget).
 *
 * @sisenseInternal
 */
export type DashboardPersistenceManager = {
  /**
   * Adds a widget to the dashboard.
   * @sisenseInternal
   */
  addWidget: (
    /**
     * The new widget to add.
     */
    widget: WidgetProps,
    /**
     * The layout with the new widget added to it.
     */
    widgetsPanelLayout: WidgetsPanelLayout,
    /**
     * The dashboard-level options for the new widget.
     */
    widgetOptions?: SpecificWidgetOptions,
    /**
     * The dashboard-level tabber config for the new widget (from `config.tabbers[id]`).
     * Projected back onto the widget DTO and stored under the new widget id.
     */
    tabberConfig?: TabberConfig,
  ) => Promise<{
    /**
     * The persisted widget (possibly modified by the server, e.g. new id).
     */
    widget: WidgetProps;
    /**
     * The layout with updated widget (after server modifications).
     */
    widgetsPanelLayout: WidgetsPanelLayout;
    /**
     * The options for the widget (after server modifications).
     */
    widgetOptions?: SpecificWidgetOptions;
    /**
     * The tabber config for the widget (after server modifications).
     */
    tabberConfig?: TabberConfig;
  }>;

  /**
   * Patch a single field (e.g. title) on an existing widget.
   * @sisenseInternal
   */
  patchWidget: (
    /**
     * The oid of the widget to patch.
     */
    widgetOid: string,
    /**
     * The patch to apply to the widget.
     */
    patch: WidgetPatch,
  ) => Promise<void>;

  /**
   * Apply a props-shaped partial update to an existing widget. The composition
   * layer's preferred write channel for visualization-originated state
   * (scroll, customOptions, future title/description). Internally routed
   * through the per-field DTO patch table in `persist-dashboard-model-middleware`.
   *
   * Fire-and-forget; errors are logged at the call site. The reducer applies
   * the update to the canonical `WidgetModel` synchronously before the REST
   * call fires.
   *
   * @sisenseInternal
   */
  updateWidget: (widgetOid: string, update: WidgetPropsUpdate) => Promise<void>;
};
