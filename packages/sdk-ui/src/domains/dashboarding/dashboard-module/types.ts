import { Filter, FilterRelations } from '@sisense/sdk-data';

import { SpecificWidgetOptions, WidgetsPanelLayout } from '@/domains/dashboarding/dashboard-model';
import { DashboardProps } from '@/domains/dashboarding/types';
import { WidgetProps } from '@/domains/widgets/components/widget/types';

/**
 * Dashboard state API.
 *
 * Passed as the second argument to every {@link DashboardCustomization}. Each method is backed by
 * the composition layer's own state, so mutations flow through the normal dashboard pipeline and are
 * persisted automatically when the dashboard has persistence enabled.
 *
 * @sisenseInternal
 */
export interface DashboardStateApi {
  /**
   * Adds a widget to the dashboard. Persists automatically when the dashboard is configured with
   * persistence enabled; otherwise updates local state only.
   *
   * @param widget - The widget to add.
   * @param options - Optional dashboard-level configuration for the new widget:
   * - `widgetOptions`: dashboard-level options for the widget (e.g. filtersOptions, jtdConfig).
   * - `widgetsPanelLayout`: explicit widgets-panel layout describing where the widget is placed;
   *   When omitted, the widget is appended in a new full-width row at the end of the first column.
   * @returns void
   */
  addWidget: (
    widget: WidgetProps,
    options?: {
      widgetOptions?: SpecificWidgetOptions;
      widgetsPanelLayout?: WidgetsPanelLayout;
    },
  ) => void;
  /**
   * Replaces the dashboard filters.
   *
   * @param filters - The new filters or filter relations to apply.
   * @returns void
   */
  setFilters: (filters: Filter[] | FilterRelations) => void;
  /**
   * Replaces the widgets-panel layout.
   *
   * @param layout - The new widgets-panel layout.
   * @returns void
   */
  setWidgetsLayout: (layout: WidgetsPanelLayout) => void;
}

/**
 * A dashboard customization middleware.
 *
 * Receives the dashboard props and returns a (possibly) modified copy — for example to
 * inject a header item via `config.header.items`. The second argument is a {@link DashboardStateApi}
 * for imperatively mutating dashboard state (e.g. adding a widget) in response to later user
 * interaction. Customizations must be pure with respect to `dashboard` (return new props rather than
 * mutate the argument) and idempotent, since they are re-applied on every render.
 *
 * @sisenseInternal
 */
export type DashboardCustomization = (
  /**
   * The current dashboard props (read-only). Return a new object with your modifications rather
   * than mutating this value directly.
   *
   * @param dashboard - Current dashboard props.
   * @param stateApi - API for imperatively mutating dashboard state.
   * @returns Modified dashboard props.
   */
  dashboard: Readonly<DashboardProps>,
  stateApi: DashboardStateApi,
) => DashboardProps;
