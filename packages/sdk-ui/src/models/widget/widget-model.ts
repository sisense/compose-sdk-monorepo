/* eslint-disable max-lines */
import { Attribute, Filter, Measure } from '@sisense/sdk-data';
import { getTranslatedDataOptions } from '../../chart-data-options/get-translated-data-options';
import { translateTableDataOptions } from '../../chart-data-options/translate-data-options';
import { ChartDataOptions, TableDataOptions } from '../../chart-data-options/types';
import { extractDataOptions } from '../../dashboard-widget/translate-widget-data-options';
import { extractDrilldownOptions } from '../../dashboard-widget/translate-widget-drilldown-options';
import { extractFilters } from '../../dashboard-widget/translate-widget-filters';
import { extractStyleOptions } from '../../dashboard-widget/translate-widget-style-options';
import { Panel, WidgetDto, WidgetSubtype, WidgetType } from '../../dashboard-widget/types';
import { getChartType, isSupportedWidgetType, isTabularWidget } from '../../dashboard-widget/utils';
import { ChartProps, ChartWidgetProps, TableProps, TableWidgetProps } from '../../props';
import { ExecuteQueryParams } from '../../query-execution';
import { getTableAttributesAndMeasures } from '../../table/hooks/use-table-data';
import { DEFAULT_TABLE_ROWS_PER_PAGE, PAGES_BATCH_SIZE } from '../../table/table';
import { TranslatableError } from '../../translation/translatable-error';
import {
  ChartType,
  DrilldownOptions,
  ChartStyleOptions,
  TableStyleOptions,
  CompleteThemeSettings,
} from '../../types';

/**
 * Widget data options.
 */
export type WidgetDataOptions = ChartDataOptions | TableDataOptions;

/**
 * Model of Sisense widget defined in the abstractions of Compose SDK.
 *
 * @group Fusion Assets
 */
export class WidgetModel {
  /**
   * Unique identifier of the widget.
   */
  oid: string;

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
  dataSource: string;

  /**
   * Widget type.
   */
  widgetType: WidgetType;

  /** @internal */
  pluginType: string;

  /** @internal */
  pluginPanels: Panel[];

  /** @internal */
  pluginStyles: any;

  /**
   * Widget data options.
   */
  dataOptions: WidgetDataOptions;

  /**
   * Widget style options.
   */
  styleOptions: ChartStyleOptions | TableStyleOptions;

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
   * Creates a new widget model.
   *
   * @param widgetDto - The widget DTO to be converted to a widget model
   * @param themeSettings - The theme settings to be used for the widget model
   * @internal
   */
  constructor(
    widgetDto: WidgetDto,
    // todo: remove after making palette-dependant colors calculation inside the chart component
    themeSettings?: CompleteThemeSettings,
  ) {
    this.oid = widgetDto.oid;
    this.title = widgetDto.title;
    this.dataSource = widgetDto.datasource.title;
    this.description = widgetDto.desc || '';

    const widgetType = widgetDto.type;
    if (!isSupportedWidgetType(widgetType)) {
      // unknown types are assumped to be plugins
      this.widgetType = 'plugin';
      this.pluginType = widgetType;
      this.pluginPanels = widgetDto.metadata.panels;
      this.pluginStyles = widgetDto.style;
    } else {
      this.widgetType = widgetType;
      this.dataOptions = extractDataOptions(
        this.widgetType,
        widgetDto.metadata.panels,
        widgetDto.style,
        themeSettings?.palette.variantColors,
      );

      this.styleOptions = extractStyleOptions(
        widgetType,
        widgetDto.subtype as WidgetSubtype,
        widgetDto.style,
        widgetDto.metadata.panels,
      );
    }

    // does not handle widget type plugin
    this.drilldownOptions = extractDrilldownOptions(this.widgetType, widgetDto.metadata.panels);
    this.filters = extractFilters(widgetDto.metadata.panels);
    this.chartType = isTabularWidget(widgetType) ? undefined : getChartType(this.widgetType);
  }

  /**
   * Returns the parameters to be used for executing a query for the widget.
   *
   * @example
   * ```tsx
   * const {data, isLoading, isError} = useExecuteQuery(widget.getExecuteQueryParams());
   * ```
   */
  getExecuteQueryParams(): ExecuteQueryParams {
    let dimensions: Attribute[];
    let measures: Measure[];
    let count: number | undefined = undefined;
    if (isTabularWidget(this.widgetType)) {
      const { attributes: tableAttributes, measures: tableMeasures } =
        getTableAttributesAndMeasures(
          translateTableDataOptions(this.dataOptions as TableDataOptions),
        );
      dimensions = tableAttributes;
      measures = tableMeasures;
      count = DEFAULT_TABLE_ROWS_PER_PAGE * PAGES_BATCH_SIZE + 1;
    } else {
      const { attributes: chartAttributes, measures: chartMeasures } = getTranslatedDataOptions(
        this.dataOptions as ChartDataOptions,
        this.chartType!,
      );
      dimensions = chartAttributes;
      measures = chartMeasures;
    }
    return {
      dataSource: this.dataSource,
      dimensions,
      measures,
      filters: this.filters,
      highlights: this.highlights,
      count,
    };
  }

  /**
   * Returns the props to be used for rendering a chart.

   * @example
   * ```tsx
   * <Chart {...widget.getChartProps()} />
   * ```
   *
   * Note: this method is not supported for tabular widgets.
   * Use {@link getTableProps} instead for getting props for the <Table> component.
   */
  getChartProps(): ChartProps {
    if (isTabularWidget(this.widgetType)) {
      throw new TranslatableError('errors.widgetModel.tabularWidgetNotSupported', {
        methodName: 'getChartProps',
      });
    }
    return {
      chartType: this.chartType!,
      dataOptions: this.dataOptions as ChartDataOptions,
      styleOptions: this.styleOptions as ChartStyleOptions,
      dataSet: this.dataSource,
      filters: this.filters,
      highlights: this.highlights,
    };
  }

  /**
   * Returns the props to be used for rendering a table.
   *
   * @example
   * ```tsx
   * <Table {...widget.getTableProps()} />
   * ```
   *
   * Note: this method is not supported for chart widgets.
   * Use {@link getChartProps} instead for getting props for the <Chart> component.
   */
  getTableProps(): TableProps {
    if (!isTabularWidget(this.widgetType)) {
      throw new TranslatableError('errors.widgetModel.onlyTabularWidgetsSupported', {
        methodName: 'getTableProps',
      });
    }
    return {
      dataOptions: this.dataOptions as TableDataOptions,
      styleOptions: this.styleOptions as TableStyleOptions,
      dataSet: this.dataSource,
      filters: this.filters,
    };
  }

  /**
   * Returns the props to be used for rendering a chart widget.
   *
   * @example
   * ```tsx
   * <ChartWidget {...widget.getChartWidgetProps()} />
   * ```
   *
   * Note: this method is not supported for tabular widgets.
   */
  getChartWidgetProps(): ChartWidgetProps {
    if (isTabularWidget(this.widgetType)) {
      throw new TranslatableError('Tabular widgets are not supported for this method');
    }
    return {
      chartType: this.chartType!,
      dataOptions: this.dataOptions as ChartDataOptions,
      styleOptions: this.styleOptions as ChartStyleOptions,
      dataSource: this.dataSource,
      filters: this.filters,
      highlights: this.highlights,
      title: this.title,
      description: this.description || '',
      drilldownOptions: this.drilldownOptions,
    };
  }

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
   * @internal
   */
  getTableWidgetProps(): TableWidgetProps {
    if (!isTabularWidget(this.widgetType)) {
      throw new TranslatableError('errors.widgetModel.onlyTabularWidgetsSupported', {
        methodName: 'getTableWidgetProps',
      });
    }
    return {
      dataOptions: this.dataOptions as TableDataOptions,
      styleOptions: this.styleOptions as TableStyleOptions,
      dataSource: this.dataSource,
      filters: this.filters,
      title: this.title,
      description: this.description || '',
    };
  }
}
