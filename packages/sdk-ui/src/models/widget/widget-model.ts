import { DataSource, Filter } from '@sisense/sdk-data';
import { ChartDataOptions, PivotTableDataOptions } from '@/chart-data-options/types';
import type { WidgetType } from '@/props';
import { ChartType, DrilldownOptions, WidgetStyleOptions } from '@/types';
import { EmptyObject } from '@sisense/sdk-query-client/src/helpers/utility-types';

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
  drilldownOptions: DrilldownOptions;
}

export const isWidgetModel = (widget: any): widget is WidgetModel => {
  return !!(widget?.oid && widget?.widgetType);
};
