import { getPivotQueryOptions } from '@/pivot-table/use-get-pivot-table-query';
import { Attribute, Filter, Measure } from '@sisense/sdk-data';
import { over } from 'lodash';
import { getTranslatedDataOptions } from '../../chart-data-options/get-translated-data-options';
import {
  translatePivotTableDataOptions,
  translateTableDataOptions,
} from '../../chart-data-options/translate-data-options';
import {
  ChartDataOptions,
  PivotTableDataOptions,
  TableDataOptions,
} from '../../chart-data-options/types';
import { extractDataOptions } from '../../dashboard-widget/translate-widget-data-options';
import { extractDrilldownOptions } from '../../dashboard-widget/translate-widget-drilldown-options';
import { extractFilters } from '../../dashboard-widget/translate-widget-filters';
import {
  extractStyleOptions,
  getStyleWithWigetDesign,
} from '../../dashboard-widget/translate-widget-style-options';
import { Panel, WidgetDto, WidgetSubtype, WidgetType } from '../../dashboard-widget/types';
import {
  getChartType,
  isChartWidget,
  isPivotWidget,
  isSupportedWidgetType,
  isTableWidget,
} from '../../dashboard-widget/utils';
import {
  ChartProps,
  ChartWidgetProps,
  PivotTableProps,
  TableProps,
  TableWidgetProps,
  PivotTableWidgetProps,
} from '../../props';
import { ExecutePivotQueryParams, ExecuteQueryParams } from '../../query-execution';
import { getTableAttributesAndMeasures } from '../../table/hooks/use-table-data';
import { DEFAULT_TABLE_ROWS_PER_PAGE, PAGES_BATCH_SIZE } from '../../table/table';
import { TranslatableError } from '../../translation/translatable-error';
import {
  ChartType,
  DrilldownOptions,
  ChartStyleOptions,
  TableStyleOptions,
  CompleteThemeSettings,
  PivotTableWidgetStyleOptions,
  RenderToolbarHandler,
  WidgetContainerStyleOptions,
  WidgetStyleOptions,
} from '../../types';
import { AppSettings } from '@/app/settings/settings';

/**
 * Widget data options.
 */
export type WidgetDataOptions = ChartDataOptions | PivotTableDataOptions;

/**
 * Model of Sisense widget defined in the abstractions of Compose SDK.
 *
 * @group Fusion Embed
 * @fusionEmbed
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
   * "onDataPointClick" handler for the constructed component
   *
   * @internal
   */
  componentDataPointClickHandler?: ChartProps['onDataPointClick'];

  /**
   * "onDataPointsSelected" handler for the constructed component
   *
   * @internal
   */
  componentDataPointsSelectedHandler?: ChartProps['onDataPointsSelected'];

  /**
   * Creates a new widget model.
   *
   * @param widgetDto - The widget DTO to be converted to a widget model
   * @param themeSettings - The theme settings to be used for the widget model
   * @param appSettings - The application settings to be used for the widget model
   * @internal
   */
  constructor(
    widgetDto: WidgetDto,
    // todo: remove after making palette-dependant colors calculation inside the chart component
    themeSettings?: CompleteThemeSettings,
    appSettings?: AppSettings,
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

      const styleOptions = extractStyleOptions(
        widgetType,
        widgetDto.subtype as WidgetSubtype,
        widgetDto.style,
        widgetDto.metadata.panels,
      );

      // take into account widget design style feature flag
      const isWidgetDesignStyleEnabled =
        appSettings?.serverFeatures?.widgetDesignStyle?.active ?? true;

      this.styleOptions = getStyleWithWigetDesign(
        styleOptions,
        widgetDto.style.widgetDesign,
        isWidgetDesignStyleEnabled,
      );
    }

    // does not handle widget type plugin
    this.drilldownOptions = extractDrilldownOptions(this.widgetType, widgetDto.metadata.panels);
    this.filters = extractFilters(widgetDto.metadata.panels);
    this.chartType = isChartWidget(widgetType) ? getChartType(this.widgetType) : undefined;
  }

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
   */
  getExecuteQueryParams(): ExecuteQueryParams {
    if (isPivotWidget(this.widgetType)) {
      throw new PivotNotSupportedMethodError('getExecuteQueryParams');
    }
    let dimensions: Attribute[];
    let measures: Measure[];
    let count: number | undefined = undefined;
    let ungroup: boolean | undefined = undefined;
    if (isTableWidget(this.widgetType)) {
      const { attributes: tableAttributes, measures: tableMeasures } =
        getTableAttributesAndMeasures(
          translateTableDataOptions(this.dataOptions as TableDataOptions),
        );
      dimensions = tableAttributes;
      measures = tableMeasures;
      count = DEFAULT_TABLE_ROWS_PER_PAGE * PAGES_BATCH_SIZE + 1;
      // ungroup is needed so query without aggregation returns correct result
      ungroup = true;
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
      ungroup,
    };
  }

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
   */
  getExecutePivotQueryParams(): ExecutePivotQueryParams {
    if (!isPivotWidget(this.widgetType)) {
      // eslint-disable-next-line sonarjs/no-duplicate-string
      throw new TranslatableError('errors.widgetModel.onlyPivotWidgetSupported', {
        methodName: 'getExecutePivotQueryParams',
      });
    }

    const { rows, columns, values, grandTotals } = getPivotQueryOptions(
      translatePivotTableDataOptions(this.dataOptions as PivotTableDataOptions),
    );

    return {
      dataSource: this.dataSource,
      rows,
      columns,
      values,
      grandTotals,
      filters: this.filters,
      highlights: this.highlights,
    };
  }

  /**
   * Returns the props to be used for rendering a chart.
   *
   * @example
   * ```tsx
   * <Chart {...widget.getChartProps()} />
   * ```
   *
   * Note: this method is not supported for tabular widgets.
   * Use {@link getTableProps} instead for getting props for the <Table> component.
   * Use {@link getPivotTableProps} instead for getting props for the <PivotTable> component.
   */
  getChartProps(): ChartProps {
    if (isPivotWidget(this.widgetType)) {
      throw new PivotNotSupportedMethodError('getChartProps');
    }
    if (isTableWidget(this.widgetType)) {
      return {
        chartType: this.chartType!,
        ...this.getTableProps(),
      };
    }
    return {
      chartType: this.chartType!,
      dataOptions: this.dataOptions as ChartDataOptions,
      styleOptions: this.styleOptions,
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
   * Note: this method is not supported for chart and pivot widgets.
   * Use {@link getChartProps} instead for getting props for the <Chart> component.
   * Use {@link getPivotTableProps} instead for getting props for the <PivotTable> component.
   */
  getTableProps(): TableProps {
    if (!isTableWidget(this.widgetType)) {
      throw new TranslatableError('errors.widgetModel.onlyTableWidgetSupported', {
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
   */
  getPivotTableProps(): PivotTableProps {
    if (!isPivotWidget(this.widgetType)) {
      throw new TranslatableError('errors.widgetModel.onlyPivotWidgetSupported', {
        methodName: 'getPivotTableProps',
      });
    }
    return {
      dataOptions: this.dataOptions as PivotTableDataOptions,
      styleOptions: this.styleOptions,
      dataSet: this.dataSource,
      filters: this.filters,
      highlights: this.highlights,
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
   * Note: this method is not supported for pivot widgets.
   */
  getChartWidgetProps(): ChartWidgetProps {
    if (isPivotWidget(this.widgetType)) {
      throw new PivotNotSupportedMethodError('getChartWidgetProps');
    }
    return {
      chartType: this.chartType!,
      dataOptions: this.dataOptions as ChartDataOptions,
      styleOptions: this.styleOptions,
      dataSource: this.dataSource,
      filters: this.filters,
      highlights: this.highlights,
      title: this.title,
      description: this.description || '',
      drilldownOptions: this.drilldownOptions,
      onDataPointClick: this.componentDataPointClickHandler,
      onDataPointsSelected: this.componentDataPointsSelectedHandler,
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
    if (!isTableWidget(this.widgetType)) {
      throw new TranslatableError('errors.widgetModel.onlyTableWidgetSupported', {
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
   * @internal
   */
  getPivotTableWidgetProps(): PivotTableWidgetProps {
    if (!isPivotWidget(this.widgetType)) {
      throw new TranslatableError('errors.widgetModel.onlyPivotWidgetSupported', {
        methodName: 'getPivotTableWidgetProps',
      });
    }
    return {
      dataOptions: this.dataOptions as PivotTableDataOptions,
      styleOptions: this.styleOptions as PivotTableWidgetStyleOptions,
      dataSource: this.dataSource,
      filters: this.filters,
      highlights: this.highlights,
      title: this.title,
      description: this.description || '',
    };
  }

  /**
   * Registers new "onDataPointClick" handler for the constructed component
   *
   * @internal
   */
  registerComponentDataPointClickHandler?(
    handler: NonNullable<ChartProps['onDataPointClick']>,
  ): void {
    const handlers = this.componentDataPointClickHandler
      ? [this.componentDataPointClickHandler, handler]
      : [handler];
    this.componentDataPointClickHandler = over(handlers);
  }

  /**
   * Registers new "onDataPointsSelected" handler for the constructed component
   *
   * @internal
   */
  registerComponentDataPointsSelectedHandler?(
    handler: NonNullable<ChartProps['onDataPointsSelected']>,
  ): void {
    const handlers = this.componentDataPointsSelectedHandler
      ? [this.componentDataPointsSelectedHandler, handler]
      : [handler];
    this.componentDataPointsSelectedHandler = over(handlers);
  }

  /**
   * Registers new "renderToolbar" handler for the constructed component
   *
   * @internal
   */
  registerComponentRenderToolbarHandler?(handler: RenderToolbarHandler): void {
    const widgetStyleOptions = this.styleOptions as WidgetContainerStyleOptions;
    const handlers = widgetStyleOptions?.header?.renderToolbar
      ? [widgetStyleOptions.header.renderToolbar, handler]
      : [handler];

    this.styleOptions = {
      ...widgetStyleOptions,
      header: {
        ...widgetStyleOptions.header,
        renderToolbar: over(handlers),
      },
    } as ChartStyleOptions;
  }
}

class PivotNotSupportedMethodError extends TranslatableError {
  constructor(methodName: string) {
    super('errors.widgetModel.pivotWidgetNotSupported', { methodName });
  }
}
