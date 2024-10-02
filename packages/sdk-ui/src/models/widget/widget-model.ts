import { DataSource, Filter } from '@sisense/sdk-data';
import { ChartDataOptions, PivotTableDataOptions } from '../../chart-data-options/types';
import { WidgetType } from '../../dashboard-widget/types';
import {
  ChartProps,
  ChartWidgetProps,
  PivotTableProps,
  TableProps,
  TableWidgetProps,
  PivotTableWidgetProps,
  TextWidgetProps,
} from '../../props';
import { ExecutePivotQueryParams, ExecuteQueryParams } from '../../query-execution';
import { ChartType, DrilldownOptions, WidgetStyleOptions } from '../../types';
import { EmptyObject } from '@sisense/sdk-query-client/src/helpers/utility-types';

/**
 * Widget data options.
 */
export type WidgetDataOptions = ChartDataOptions | PivotTableDataOptions | EmptyObject;

/**
 * Model of Sisense widget defined in the abstractions of Compose SDK.
 *
 * @group Fusion Embed
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
   *
   * @deprecated Use {@link widgetModelTranslator} methods instead
   */
  widgetType: WidgetType;

  /**
   * Plugin type. Only present for plugin widgets.
   *
   * If this is a plugin widget, this is typically the name/ID of the plugin.
   */
  pluginType: string;

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

  /**
   * Returns the parameters to be used for executing a query for the widget.
   *
   * @example
   * ```tsx
   * const {data, isLoading, isError} = useExecuteQuery(widget.getExecuteQueryParams());
   * ```
   *
   * Note: this method is not supported for getting pivot query.
   * Use {@link getExecutePivotQueryParams} instead for getting query parameters for the pivot widget.
   * @deprecated Use {@link widgetModelTranslator.toExecuteQueryParams} instead
   */
  getExecuteQueryParams(): ExecuteQueryParams;

  /**
   * Returns the parameters to be used for executing a query for the pivot widget.
   *
   * @example
   * ```tsx
   * const {data, isLoading, isError} = useExecutePivotQuery(widget.getExecutePivotQueryParams());
   * ```
   *
   * Note: this method is supported only for getting pivot query.
   * Use {@link getExecuteQueryParams} instead for getting query parameters for non-pivot widgets.
   * @deprecated Use {@link widgetModelTranslator.toExecutePivotQueryParams} instead
   */
  getExecutePivotQueryParams(): ExecutePivotQueryParams;

  /**
   * Returns the props to be used for rendering a chart.
   *
   * @example
   * ```tsx
   * <Chart {...widget.getChartProps()} />
   * ```
   *
   * Note: this method is not supported for pivot table widgets.
   * Use {@link getPivotTableProps} instead for getting props for the <PivotTable> component.
   * @deprecated Use {@link widgetModelTranslator.toChartProps} instead
   */
  getChartProps(): ChartProps;

  /**
   * Returns the props to be used for rendering a table.
   *
   * @example
   * ```tsx
   * <Table {...widget.getTableProps()} />
   * ```
   *
   * Note: this method is not supported for chart and pivot widgets.
   * Use {@link getChartProps} instead for getting props for the <Chart> component.
   * Use {@link getPivotTableProps} instead for getting props for the <PivotTable> component.
   * @deprecated Use {@link widgetModelTranslator.toTableProps} instead
   */
  getTableProps(): TableProps;

  /**
   * Returns the props to be used for rendering a pivot table.
   *
   * @example
   * ```tsx
   * <PivotTable {...widget.getPivotTableProps()} />
   * ```
   *
   * Note: this method is not supported for chart or table widgets.
   * Use {@link getChartProps} instead for getting props for the <Chart> component.
   * Use {@link getTableProps} instead for getting props for the <Table> component.
   * @deprecated Use {@link widgetModelTranslator.toPivotTableProps} instead
   */
  getPivotTableProps(): PivotTableProps;

  /**
   * Returns the props to be used for rendering a chart widget.
   *
   * @example
   * ```tsx
   * <ChartWidget {...widget.getChartWidgetProps()} />
   * ```
   *
   * Note: this method is not supported for pivot widgets.
   * @deprecated Use {@link widgetModelTranslator.toChartWidgetProps} instead
   */
  getChartWidgetProps(): ChartWidgetProps;

  /**
   * Returns the props to be used for rendering a table widget.
   *
   * @example
   * ```tsx
   * <TableWidget {...widget.getTableWidgetProps()} />
   * ```
   *
   * Note: this method is not supported for chart widgets.
   * Use {@link getChartWidgetProps} instead for getting props for the <ChartWidget> component.
   * @deprecated Use {@link widgetModelTranslator.toTableWidgetProps} instead
   * @internal
   */
  getTableWidgetProps(): TableWidgetProps;

  /**
   * Returns the props to be used for rendering a pivot table widget.
   *
   * @example
   * ```tsx
   * <PivotTableWidget {...widget.getPivotTableWidgetProps()} />
   * ```

   * Note: this method is not supported for chart or table widgets.
   * Use {@link getChartWidgetProps} instead for getting props for the <ChartWidget> component.
   * Use {@link getTableWidgetProps} instead for getting props for the <TableWidget> component.
   * @deprecated Use {@link widgetModelTranslator.toPivotTableWidgetProps} instead
   * @internal
   */
  getPivotTableWidgetProps(): PivotTableWidgetProps;

  /**
   * Returns the props to be used for rendering a text widget.
   *
   * @example
   * ```tsx
   * <TextWidget {...widget.getTextWidgetProps()} />
   * ```
   *
   * Note: this method is not supported for chart or pivot widgets.
   * Use {@link getChartWidgetProps} instead for getting props for the <ChartWidget> component.
   * Use {@link getPivotTableWidgetProps} instead for getting props for the <PivotTableWidget> component.
   * @deprecated Use {@link widgetModelTranslator.toTextWidgetProps} instead
   */
  getTextWidgetProps(): TextWidgetProps;
}

export const isWidgetModel = (widget: any): widget is WidgetModel => {
  return !!(widget?.oid && widget?.widgetType);
};
