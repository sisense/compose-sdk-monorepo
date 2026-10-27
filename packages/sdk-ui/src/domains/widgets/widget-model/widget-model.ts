import type { Attribute } from '@sisense/sdk-data';
import type { DataSource, Filter, Measure } from '@sisense/sdk-data';

import type {
  JumpToDashboardConfig,
  JumpToDashboardConfigForPivot,
} from '@/domains/dashboarding/hooks/jtd/jtd-types';
import type {
  ChartDataOptions,
  PivotTableDataOptions,
} from '@/domains/visualizations/core/chart-data-options/types';
import type { EmptyObject } from '@/shared/utils/utility-types';
import type {
  ChartType,
  DrilldownOptions,
  PivotTableDrilldownOptions,
  WidgetStyleOptions,
} from '@/types';

import type {
  FilterWidgetControlStyleOptions,
  FilterWidgetFilterType,
} from '../components/filter-widget/types';
import type { WidgetConfig, WidgetType } from '../components/widget/types';

/**
 * Widget data options.
 */
export type WidgetDataOptions = ChartDataOptions | PivotTableDataOptions | EmptyObject;

/**
 * Model of Sisense widget defined in the abstractions of Compose SDK.
 *
 * This is the return type of {@link @sisense/sdk-ui!useGetWidgetModel | `useGetWidgetModel`} —
 * see that hook's documentation for a usage example.
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
   * Widget configuration.
   */
  config?: WidgetConfig;

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
   * Jump to Dashboard configuration for this widget. Omitted or `undefined` when the widget
   * has none.
   *
   * @see {@link widgetModelTranslator.toJtdConfig}
   * @internal
   */
  jtdConfig?: JumpToDashboardConfig | JumpToDashboardConfigForPivot;

  /**
   * Filter widget field data: the attribute the widget filters and how its control is
   * configured. Only present when `widgetType === 'filter'`; a model assembled by hand may omit
   * it, and readers then fall back to the defaults.
   *
   * @internal
   */
  filterWidgetData?: {
    attribute: Attribute;
    filterType: FilterWidgetFilterType;
    isMultiselect: boolean;
    controlStyleOptions?: FilterWidgetControlStyleOptions;
    /**
     * Curated set of Time Frame keys the widget offers. `undefined` means the default 11
     * frames are used.
     */
    timeFrames?: string[];
    /**
     * The measure a `'rank'` filter ranks by. Only set when `filterType` is `'rank'`; a rank
     * widget without one has nothing to rank by, so its control stays disabled.
     */
    rankBy?: Measure;
  };
}

export const isWidgetModel = (widget: any): widget is WidgetModel => {
  return !!(widget?.oid && widget?.widgetType);
};
