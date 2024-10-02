import { ExecutePivotQueryParams, ExecuteQueryParams } from '@/query-execution';
import { WidgetModel } from './widget-model.js';
import { getTranslatedDataOptions } from '@/chart-data-options/get-translated-data-options';
import {
  translatePivotTableDataOptions,
  translateTableDataOptions,
} from '@/chart-data-options/translate-data-options';
import {
  getChartType,
  isChartWidget,
  isPivotTableWidget,
  isPluginWidget,
  isSupportedWidgetType,
  isTableWidget,
  isTextWidget,
} from '@/dashboard-widget/utils';
import {
  ChartProps,
  ChartWidgetProps,
  WidgetProps,
  PivotTableProps,
  PivotTableWidgetProps,
  PluginWidgetProps,
  TableProps,
  TableWidgetProps,
  TextWidgetProps,
  CommonWidgetProps,
} from '@/props';
import { getTableAttributesAndMeasures } from '@/table/hooks/use-table-data';
import { DEFAULT_TABLE_ROWS_PER_PAGE, PAGES_BATCH_SIZE } from '@/table/table-component';
import { Attribute, Measure, convertDataSource } from '@sisense/sdk-data';
import { TranslatableError } from '../../translation/translatable-error.js';
import { getPivotQueryOptions } from '@/pivot-table/hooks/use-get-pivot-table-query.js';
import {
  ChartDataOptions,
  PivotTableDataOptions,
  TableDataOptions,
} from '@/chart-data-options/types.js';
import {
  ChartStyleOptions,
  ChartWidgetStyleOptions,
  CompleteThemeSettings,
  GenericDataOptions,
  PivotTableWidgetStyleOptions,
  TableStyleOptions,
  TextWidgetStyleOptions,
} from '@/types.js';
import { WidgetDto } from '@/dashboard-widget/types.js';
import { AppSettings } from '@/app/settings/settings.js';
import {
  attachDataSourceToPanels,
  createDataOptionsFromPanels,
  extractDataOptions,
} from '@/dashboard-widget/translate-widget-data-options.js';
import {
  extractStyleOptions,
  getStyleWithWidgetDesign,
} from '@/dashboard-widget/translate-widget-style-options.js';
import { extractDrilldownOptions } from '@/dashboard-widget/translate-widget-drilldown-options.js';
import { extractWidgetFilters } from '@/dashboard-widget/translate-widget-filters.js';

/**
 * Translates a {@link WidgetModel} to the parameters for executing a query for the widget.
 *
 * @example
 * ```tsx
 * const {data, isLoading, isError} = useExecuteQuery(widgetModelTranslator.toExecuteQueryParams(widgetModel));
 * ```
 *
 * Note: this method is not supported for getting pivot query.
 * Use {@link toExecutePivotQueryParams} instead for getting query parameters for the pivot widget.
 */
export function toExecuteQueryParams(widgetModel: WidgetModel): ExecuteQueryParams {
  if (isPivotTableWidget(widgetModel.widgetType)) {
    throw new PivotNotSupportedMethodError('toExecuteQueryParams');
  }
  let dimensions: Attribute[];
  let measures: Measure[];
  let count: number | undefined = undefined;
  let ungroup: boolean | undefined = undefined;
  if (isTableWidget(widgetModel.widgetType)) {
    const { attributes: tableAttributes, measures: tableMeasures } = getTableAttributesAndMeasures(
      translateTableDataOptions(widgetModel.dataOptions as TableDataOptions),
    );
    dimensions = tableAttributes;
    measures = tableMeasures;
    count = DEFAULT_TABLE_ROWS_PER_PAGE * PAGES_BATCH_SIZE + 1;
    // ungroup is needed so query without aggregation returns correct result
    ungroup = true;
  } else {
    const { attributes: chartAttributes, measures: chartMeasures } = getTranslatedDataOptions(
      widgetModel.dataOptions as ChartDataOptions,
      widgetModel.chartType!,
    );
    dimensions = chartAttributes;
    measures = chartMeasures;
  }
  return {
    dataSource: widgetModel.dataSource,
    dimensions,
    measures,
    filters: widgetModel.filters,
    highlights: widgetModel.highlights,
    count,
    ungroup,
  };
}

/**
 * Translates a {@link WidgetModel} to the parameters for executing a query for the pivot widget.
 *
 * @example
 * ```tsx
 * const {data, isLoading, isError} = useExecutePivotQuery(widgetModelTranslator.toExecutePivotQueryParams(widgetModel));
 * ```
 *
 * Note: this method is supported only for getting pivot query.
 * Use {@link toExecuteQueryParams} instead for getting query parameters for non-pivot widgets.
 */
export function toExecutePivotQueryParams(widgetModel: WidgetModel): ExecutePivotQueryParams {
  if (!isPivotTableWidget(widgetModel.widgetType)) {
    // eslint-disable-next-line sonarjs/no-duplicate-string
    throw new TranslatableError('errors.widgetModel.onlyPivotWidgetSupported', {
      methodName: 'toExecutePivotQueryParams',
    });
  }

  const { rows, columns, values, grandTotals } = getPivotQueryOptions(
    translatePivotTableDataOptions(widgetModel.dataOptions as PivotTableDataOptions),
  );

  return {
    dataSource: widgetModel.dataSource,
    rows,
    columns,
    values,
    grandTotals,
    filters: widgetModel.filters,
    highlights: widgetModel.highlights,
  };
}

/**
 * Translates a {@link WidgetModel} to the props for rendering a chart.
 *
 * @example
 * ```tsx
 * <Chart {...widgetModelTranslator.toChartProps(widgetModel)} />
 * ```
 *
 * Note: this method is not supported for pivot widgets.
 * Use {@link toPivotTableProps} instead for getting props for the <PivotTable> component.
 */
export function toChartProps(widgetModel: WidgetModel): ChartProps {
  if (isPivotTableWidget(widgetModel.widgetType)) {
    throw new PivotNotSupportedMethodError('toChartProps');
  }

  if (isTextWidget(widgetModel.widgetType)) {
    throw new TextWidgetNotSupportedMethodError('toChartProps');
  }

  if (isTableWidget(widgetModel.widgetType)) {
    return {
      chartType: widgetModel.chartType!,
      ...toTableProps(widgetModel),
    };
  }
  return {
    chartType: widgetModel.chartType!,
    dataOptions: widgetModel.dataOptions as ChartDataOptions,
    styleOptions: widgetModel.styleOptions as ChartStyleOptions,
    dataSet: widgetModel.dataSource,
    filters: widgetModel.filters,
    highlights: widgetModel.highlights,
  };
}

/**
 * Translates a {@link WidgetModel} to the props for rendering a table.
 *
 * @example
 * ```tsx
 * <Table {...widgetModelTranslator.toTableProps(widgetModel)} />
 * ```
 *
 * Note: this method is not supported for chart and pivot widgets.
 * Use {@link toChartProps} instead for getting props for the <Chart> component.
 * Use {@link toPivotTableProps} instead for getting props for the <PivotTable> component.
 */
export function toTableProps(widgetModel: WidgetModel): TableProps {
  if (!isTableWidget(widgetModel.widgetType)) {
    throw new TranslatableError('errors.widgetModel.onlyTableWidgetSupported', {
      methodName: 'toTableProps',
    });
  }
  return {
    dataOptions: widgetModel.dataOptions as TableDataOptions,
    styleOptions: widgetModel.styleOptions as TableStyleOptions,
    dataSet: widgetModel.dataSource,
    filters: widgetModel.filters,
  };
}

/**
 * Translates a {@link WidgetModel} to the props for rendering a pivot table.
 *
 * @example
 * ```tsx
 * <PivotTable {...widgetModelTranslator.toPivotTableProps(widgetModel)} />
 * ```
 *
 * Note: this method is not supported for chart or table widgets.
 * Use {@link toChartProps} instead for getting props for the <Chart> component.
 * Use {@link toTableProps} instead for getting props for the <Table> component.
 */
export function toPivotTableProps(widgetModel: WidgetModel): PivotTableProps {
  if (!isPivotTableWidget(widgetModel.widgetType)) {
    throw new TranslatableError('errors.widgetModel.onlyPivotWidgetSupported', {
      methodName: 'toPivotTableProps',
    });
  }
  return {
    dataOptions: widgetModel.dataOptions as PivotTableDataOptions,
    styleOptions: widgetModel.styleOptions as PivotTableWidgetStyleOptions,
    dataSet: widgetModel.dataSource,
    filters: widgetModel.filters,
    highlights: widgetModel.highlights,
  };
}

/**
 * Translates a {@link WidgetModel} to the props for rendering a chart widget.
 *
 * @example
 * ```tsx
 * <ChartWidget {...widgetModelTranslator.toChartWidgetProps(widgetModel)} />
 * ```
 *
 * Note: this method is not supported for pivot widgets.
 */
export function toChartWidgetProps(widgetModel: WidgetModel): ChartWidgetProps {
  if (isPivotTableWidget(widgetModel.widgetType)) {
    throw new PivotNotSupportedMethodError('toChartWidgetProps');
  }

  if (isTextWidget(widgetModel.widgetType)) {
    throw new TextWidgetNotSupportedMethodError('toChartWidgetProps');
  }

  return {
    chartType: widgetModel.chartType!,
    dataOptions: widgetModel.dataOptions as ChartDataOptions,
    styleOptions: widgetModel.styleOptions,
    dataSource: widgetModel.dataSource,
    filters: widgetModel.filters,
    highlights: widgetModel.highlights,
    title: widgetModel.title,
    description: widgetModel.description || '',
    drilldownOptions: widgetModel.drilldownOptions,
  };
}

/**
 * Translates a {@link WidgetModel} to the props for rendering a table widget.
 *
 * @example
 * ```tsx
 * <TableWidget {...widgetModelTranslator.toTableWidgetProps(widgetModel)} />
 * ```
 *
 * Note: this method is not supported for chart widgets.
 * Use {@link toChartWidgetProps} instead for getting props for the <ChartWidget> component.
 * @internal
 */
export function toTableWidgetProps(widgetModel: WidgetModel): TableWidgetProps {
  if (!isTableWidget(widgetModel.widgetType)) {
    throw new TranslatableError('errors.widgetModel.onlyTableWidgetSupported', {
      methodName: 'toTableWidgetProps',
    });
  }
  return {
    dataOptions: widgetModel.dataOptions as TableDataOptions,
    styleOptions: widgetModel.styleOptions as TableStyleOptions,
    dataSource: widgetModel.dataSource,
    filters: widgetModel.filters,
    title: widgetModel.title,
    description: widgetModel.description || '',
  };
}

/**
 * Translates a {@link WidgetModel} to the props for rendering a pivot table widget.
 *
 * @example
 * ```tsx
 * <PivotTableWidget {...widgetModelTranslator.toPivotTableWidgetProps(widgetModel)} />
 * ```

 * Note: this method is not supported for chart or table widgets.
 * Use {@link toChartWidgetProps} instead for getting props for the <ChartWidget> component.
 * Use {@link toTableWidgetProps} instead for getting props for the <TableWidget> component.
 */
export function toPivotTableWidgetProps(widgetModel: WidgetModel): PivotTableWidgetProps {
  if (!isPivotTableWidget(widgetModel.widgetType)) {
    throw new TranslatableError('errors.widgetModel.onlyPivotWidgetSupported', {
      methodName: 'toPivotTableWidgetProps',
    });
  }
  return {
    dataOptions: widgetModel.dataOptions as PivotTableDataOptions,
    styleOptions: widgetModel.styleOptions as PivotTableWidgetStyleOptions,
    dataSource: widgetModel.dataSource,
    filters: widgetModel.filters,
    highlights: widgetModel.highlights,
    title: widgetModel.title,
    description: widgetModel.description || '',
  };
}

/**
 * Translates a {@link WidgetModel} to the props for rendering a text widget.
 *
 * @example
 * ```tsx
 * <TextWidget {...widgetModelTranslator.toTextWidgetProps(widgetModel)} />
 * ```
 *
 * Note: this method is not supported for chart or pivot widgets.
 * Use {@link toChartWidgetProps} instead for getting props for the <ChartWidget> component.
 * Use {@link toPivotTableWidgetProps} instead for getting props for the <PivotTableWidget> component.
 */
export function toTextWidgetProps(widgetModel: WidgetModel): TextWidgetProps {
  if (!isTextWidget(widgetModel.widgetType)) {
    throw new TranslatableError('errors.widgetModel.onlyTextWidgetSupported', {
      methodName: 'toTextWidgetProps',
    });
  }
  return { styleOptions: widgetModel.styleOptions as TextWidgetStyleOptions };
}

/**
 * Translates a {@link WidgetModel} to the props for rendering a plugin widget.
 *
 * @internal
 */
export function toPluginWidgetProps(widgetModel: WidgetModel): PluginWidgetProps {
  if (!isPluginWidget(widgetModel.widgetType)) {
    throw new TranslatableError('errors.widgetModel.onlyPluginWidgetSupported', {
      methodName: 'toPluginWidgetProps',
    });
  }
  return {
    pluginType: widgetModel.pluginType,
    dataOptions: widgetModel.dataOptions as GenericDataOptions,
    styleOptions: widgetModel.styleOptions as ChartWidgetStyleOptions,
    dataSource: widgetModel.dataSource,
    filters: widgetModel.filters,
    highlights: widgetModel.highlights,
    title: widgetModel.title,
    description: widgetModel.description || '',
  };
}

/**
 * Translates {@link WidgetModel} to {@link CommonWidgetProps}.
 *
 * @internal
 */
export function toCommonWidgetProps(widgetModel: WidgetModel): CommonWidgetProps {
  const { widgetType } = widgetModel;

  if (isPivotTableWidget(widgetType)) {
    return { widgetType: 'pivot', ...toPivotTableWidgetProps(widgetModel) };
  } else if (isTextWidget(widgetType)) {
    return { widgetType: 'text', ...toTextWidgetProps(widgetModel) };
  } else if (isPluginWidget(widgetType)) {
    return { widgetType: 'plugin', ...toPluginWidgetProps(widgetModel) };
  } else {
    return { widgetType: 'chart', ...toChartWidgetProps(widgetModel) };
  }
}

/**
 * Translates {@link WidgetModel} to {@link WidgetProps}.
 *
 * @internal
 */
export function toWidgetProps(widgetModel: WidgetModel): WidgetProps {
  const { oid } = widgetModel;

  return { ...toCommonWidgetProps(widgetModel), id: oid };
}

const throwNotImplemented = () => {
  throw new Error('Method not implemented.');
};

/**
 * The default widget model.
 */
const DEFAULT_WIDGET_MODEL: WidgetModel = {
  oid: '',
  title: '',
  dataSource: '',
  description: '',
  widgetType: 'plugin',
  pluginType: '',
  dataOptions: {},
  styleOptions: {},
  drilldownOptions: {},
  filters: [],
  highlights: [],
  chartType: undefined,
  getExecuteQueryParams: throwNotImplemented,
  getExecutePivotQueryParams: throwNotImplemented,
  getChartProps: throwNotImplemented,
  getTableProps: throwNotImplemented,
  getPivotTableProps: throwNotImplemented,
  getPivotTableWidgetProps: throwNotImplemented,
  getChartWidgetProps: throwNotImplemented,
  getTableWidgetProps: throwNotImplemented,
  getTextWidgetProps: throwNotImplemented,
};

/**
 * Creates a {@link WidgetModel} from a widget DTO.
 *
 * @param widgetDto - The widget DTO to be converted to a widget model
 * @param themeSettings - The theme settings to be used for the widget model
 * @param appSettings - The application settings to be used for the widget model
 * @returns The widget model
 * @internal
 */
export function fromWidgetDto(
  widgetDto: WidgetDto,
  // todo: remove after making palette-dependant colors calculation inside the chart component
  themeSettings?: CompleteThemeSettings,
  appSettings?: AppSettings,
): WidgetModel {
  let widgetType, pluginType, dataOptions, styleOptions;

  const panels = attachDataSourceToPanels(widgetDto.metadata.panels, widgetDto.datasource);

  widgetType = widgetDto.type;
  if (!isSupportedWidgetType(widgetType)) {
    // unknown types are assumped to be plugins
    pluginType = widgetType;
    widgetType = 'plugin' as const;
    dataOptions = createDataOptionsFromPanels(panels, themeSettings?.palette.variantColors ?? []);
    styleOptions = widgetDto.style as unknown;
  } else {
    dataOptions = extractDataOptions(
      widgetType,
      panels,
      widgetDto.style,
      themeSettings?.palette.variantColors,
    );

    styleOptions = extractStyleOptions(widgetType, widgetDto);

    // take into account widget design style feature flag
    const isWidgetDesignStyleEnabled =
      appSettings?.serverFeatures?.widgetDesignStyle?.active ?? true;

    styleOptions = getStyleWithWidgetDesign(
      styleOptions,
      widgetDto.style.widgetDesign,
      isWidgetDesignStyleEnabled,
    );
  }

  // does not handle plugin widget type
  const drilldownOptions = extractDrilldownOptions(widgetType, panels);
  const filters = extractWidgetFilters(panels);
  const chartType = isChartWidget(widgetType) ? getChartType(widgetType) : undefined;

  const widgetModel: WidgetModel = {
    ...DEFAULT_WIDGET_MODEL,
    oid: widgetDto.oid,
    title: widgetDto.title,
    dataSource: convertDataSource(widgetDto.datasource),
    description: widgetDto.desc || '',
    widgetType: widgetType,
    chartType: chartType,
    pluginType: pluginType || '',
    dataOptions: dataOptions || {},
    styleOptions: styleOptions || {},
    drilldownOptions: drilldownOptions,
    filters: filters,
  };

  return {
    ...widgetModel,
    getExecuteQueryParams: () => {
      return toExecuteQueryParams(widgetModel);
    },
    getExecutePivotQueryParams: () => {
      return toExecutePivotQueryParams(widgetModel);
    },
    getChartProps: () => {
      return toChartProps(widgetModel);
    },
    getTableProps: () => {
      return toTableProps(widgetModel);
    },
    getPivotTableProps: () => {
      return toPivotTableProps(widgetModel);
    },
    getChartWidgetProps: () => {
      return toChartWidgetProps(widgetModel);
    },
    getTableWidgetProps: () => {
      return toTableWidgetProps(widgetModel);
    },
    getPivotTableWidgetProps: () => {
      return toPivotTableWidgetProps(widgetModel);
    },
    getTextWidgetProps: () => {
      return toTextWidgetProps(widgetModel);
    },
  };
}

class PivotNotSupportedMethodError extends TranslatableError {
  constructor(methodName: string) {
    super('errors.widgetModel.pivotWidgetNotSupported', { methodName });
  }
}

class TextWidgetNotSupportedMethodError extends TranslatableError {
  constructor(methodName: string) {
    super('errors.widgetModel.textWidgetNotSupported', { methodName });
  }
}
