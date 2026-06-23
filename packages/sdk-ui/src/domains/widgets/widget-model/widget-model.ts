import { DataSource, Filter } from '@sisense/sdk-data';
import { EmptyObject } from '@sisense/sdk-query-client/src/helpers/utility-types';

import type {
  JumpToDashboardConfig,
  JumpToDashboardConfigForPivot,
} from '@/domains/dashboarding/hooks/jtd/jtd-types';
import {
  ChartDataOptions,
  PivotTableDataOptions,
} from '@/domains/visualizations/core/chart-data-options/types';
import {
  ChartType,
  DrilldownOptions,
  PivotTableDrilldownOptions,
  WidgetAiOptions,
  WidgetStyleOptions,
} from '@/types';

import type { WidgetType } from '../components/widget/types';

/**
 * Widget data options.
 */
export type WidgetDataOptions = ChartDataOptions | PivotTableDataOptions | EmptyObject;

/**
 * Model of Sisense widget defined in the abstractions of Compose SDK.
 *
 * @group Fusion Assets
 * @fusionEmbed
 */
export interface WidgetModel {
  /**
   * Unique identifier of the widget.
   */
  readonly oid: string;

  /**
   * Widget title.
   */
  title: string;

  /**
   * Widget description.
   */
  description: string;

  /**
   * Full name of the widget data source.
   */
  dataSource: DataSource;

  /**
   * Widget type.
   */
  widgetType: WidgetType;

  /**
   * Custom widget type. Only present for custom widgets.
   *
   * If this is a custom widget, this is typically the name/ID of the custom widget.
   */
  customWidgetType: string;

  /**
   * Widget data options.
   */
  dataOptions: WidgetDataOptions;

  /**
   * Widget style options.
   */
  styleOptions: WidgetStyleOptions;

  /**
   * Configuration for AI-powered widget features such as automated narrative generation
   * @alpha
   */
  aiOptions?: WidgetAiOptions;

  /**
   * Custom widget options. Only present for custom widgets.
   *
   * Contains widget-specific configuration that doesn't fit into standard style or data options.
   */
  customOptions?: Record<string, any>;

  /**
   * Widget filters.
   */
  filters: Filter[];

  /**
   * Widget highlights.
   */
  highlights: Filter[];

  /**
   * Widget chart type.
   */
  chartType?: ChartType;

  /**
   * Widget drilldown options.
   */
  drilldownOptions: DrilldownOptions | PivotTableDrilldownOptions;

  /**
   * Jump to Dashboard configuration for this widget, when the model was built from a Fusion
   * `WidgetDto` via `fromWidgetDto`. Populated with the same translation as dashboard
   * `fromDashboardDto` uses for `widgetsOptions` (via `translateWidgetsOptions` →
   * `jumpToDashboardConfigFromWidgetDto`). Omitted or `undefined` when the model is not
   * Fusion-sourced (e.g. from widget props) or the widget has no versioned JTD.
   *
   * @see {@link widgetModelTranslator.toJtdConfig}
   * @internal
   */
  jtdConfig?: JumpToDashboardConfig | JumpToDashboardConfigForPivot;
}

export const isWidgetModel = (widget: any): widget is WidgetModel => {
  return !!(widget?.oid && widget?.widgetType);
};
