import type {
  SpecificWidgetOptions,
  WidgetPatch,
  WidgetsPanelLayout,
} from '@/domains/dashboarding/dashboard-model';
import type { WidgetProps } from '@/domains/widgets/components/widget/types';

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
};
