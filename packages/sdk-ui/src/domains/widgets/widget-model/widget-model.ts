import { DataSource, Filter } from '@sisense/sdk-data';
import { EmptyObject } from '@sisense/sdk-query-client/src/helpers/utility-types';

import {
  ChartDataOptions,
  PivotTableDataOptions,
} from '@/domains/visualizations/core/chart-data-options/types';
import {
  ChartType,
  DrilldownOptions,
  PivotTableDrilldownOptions,
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
}

export const isWidgetModel = (widget: any): widget is WidgetModel => {
  return !!(widget?.oid && widget?.widgetType);
};
