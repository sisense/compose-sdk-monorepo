import { ExecutePivotQueryParams, ExecuteQueryParams } from '@/query-execution';
import { WidgetModel } from './widget-model.js';
import { getTranslatedDataOptions } from '@/chart-data-options/get-translated-data-options';
import {
  translatePivotTableDataOptions,
  translateTableDataOptions,
} from '@/chart-data-options/translate-data-options';
import {
  getChartType,
  getFusionWidgetType,
  getWidgetType,
  isChartFusionWidget,
  isChartWidgetProps,
  isPivotWidget,
  isPluginWidget,
  isSupportedWidgetType,
  isTableWidgetModel,
  isTextWidget,
} from '@/widget-by-id/utils.js';
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
import {
  Attribute,
  Filter,
  Measure,
  MeasureColumn,
  Column,
  convertDataSource,
  JaqlDataSource,
  JaqlDataSourceForDto,
} from '@sisense/sdk-data';
import { TranslatableError } from '../../translation/translatable-error.js';
import { getPivotQueryOptions } from '@/pivot-table/hooks/use-get-pivot-table-query.js';
import {
  CartesianChartDataOptions,
  CategoricalChartDataOptions,
  ChartDataOptions,
  IndicatorChartDataOptions,
  PivotTableDataOptions,
  ScatterChartDataOptions,
  TableDataOptions,
  TableDataOptionsInternal,
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
import {
  IndicatorWidgetStyle,
  Panel,
  PanelItem,
  WidgetDto,
  WidgetStyle,
} from '@/widget-by-id/types.js';
import { AppSettings } from '@/app/settings/settings.js';
import {
  attachDataSourceToPanels,
  createDataOptionsFromPanels,
  createPanelItem,
  extractDataOptions,
} from '@/widget-by-id/translate-widget-data-options.js';
import {
  extractStyleOptions,
  getFlattenWidgetDesign,
  getStyleWithWidgetDesign,
} from '@/widget-by-id/translate-widget-style-options.js';
import { extractDrilldownOptions } from '@/widget-by-id/translate-widget-drilldown-options.js';
import { extractWidgetFilters } from '@/widget-by-id/translate-widget-filters.js';
import {
  isCartesian,
  isCategorical,
  isIndicator,
  isScatter,
  isTable,
} from '@/chart-options-processor/translations/types.js';

import {
  normalizeAnyColumn,
  normalizeColumn,
  normalizeMeasureColumn,
} from '@/chart-data-options/utils.js';

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
  if (isPivotWidget(widgetModel.widgetType)) {
    throw new PivotNotSupportedMethodError('toExecuteQueryParams');
  }
  let dimensions: Attribute[];
  let measures: Measure[];
  let count: number | undefined = undefined;
  let ungroup: boolean | undefined = undefined;
  if (isTableWidgetModel(widgetModel)) {
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
  if (!isPivotWidget(widgetModel.widgetType)) {
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
  if (isPivotWidget(widgetModel.widgetType)) {
    throw new PivotNotSupportedMethodError('toChartProps');
  }

  if (isTextWidget(widgetModel.widgetType)) {
    throw new TextWidgetNotSupportedMethodError('toChartProps');
  }

  if (isTableWidgetModel(widgetModel)) {
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
  if (!isTableWidgetModel(widgetModel)) {
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
  if (!isPivotWidget(widgetModel.widgetType)) {
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
  if (isPivotWidget(widgetModel.widgetType)) {
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
  if (!isTableWidgetModel(widgetModel)) {
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
 */
export function toPivotTableWidgetProps(widgetModel: WidgetModel): PivotTableWidgetProps {
  if (!isPivotWidget(widgetModel.widgetType)) {
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

  if (isPivotWidget(widgetType)) {
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
  let fusionWidgetType, pluginType, dataOptions, styleOptions;

  const panels = attachDataSourceToPanels(widgetDto.metadata.panels, widgetDto.datasource);

  fusionWidgetType = widgetDto.type;
  if (!isSupportedWidgetType(fusionWidgetType)) {
    // unknown types are assumped to be plugins
    pluginType = fusionWidgetType;
    fusionWidgetType = 'plugin' as const;
    dataOptions = createDataOptionsFromPanels(panels, themeSettings?.palette.variantColors ?? []);
    const { widgetDesign, ...rest } = widgetDto.style;
    styleOptions = { ...rest, ...(widgetDesign ? getFlattenWidgetDesign(widgetDesign) : {}) };
  } else {
    dataOptions = extractDataOptions(
      fusionWidgetType,
      panels,
      widgetDto.style,
      themeSettings?.palette.variantColors,
    );

    styleOptions = extractStyleOptions(fusionWidgetType, widgetDto);

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
  const drilldownOptions = extractDrilldownOptions(fusionWidgetType, panels);
  const filters = extractWidgetFilters(panels);
  const chartType = isChartFusionWidget(fusionWidgetType)
    ? getChartType(fusionWidgetType)
    : undefined;

  const widgetModel: WidgetModel = {
    ...DEFAULT_WIDGET_MODEL,
    oid: widgetDto.oid,
    title: widgetDto.title,
    dataSource: convertDataSource(widgetDto.datasource),
    description: widgetDto.desc || '',
    widgetType: getWidgetType(fusionWidgetType),
    chartType: chartType,
    pluginType: pluginType || '',
    dataOptions: dataOptions || {},
    styleOptions: styleOptions || {},
    drilldownOptions: drilldownOptions,
    filters: filters,
  };

  return widgetModel;
}

/**
 * Creates a {@link WidgetModel} from a {@link ChartWidgetProps}.
 *
 * @param chartWidgetProps - The ChartWidgetProps to be converted to a widget model
 * @returns WidgetModel
 * @internal
 */
export function fromChartWidgetProps(chartWidgetProps: ChartWidgetProps): WidgetModel {
  const widgetModel: WidgetModel = {
    ...DEFAULT_WIDGET_MODEL,
    ...chartWidgetProps,
    filters: (chartWidgetProps.filters as Filter[]) || [], // typecast because of FilterRelation tmp incompatibility
    widgetType: 'chart',
  };

  return widgetModel;
}

/**
 * Creates a {@link WidgetModel} from a {@link WidgetProps}.
 *
 * @param widgetProps - The WidgetProps to be converted to a widget model
 * @returns WidgetModel
 * @internal
 */
export function fromWidgetProps(widgetProps: WidgetProps): WidgetModel {
  if (isChartWidgetProps(widgetProps)) {
    return fromChartWidgetProps(widgetProps);
  }

  throw new TranslatableError('errors.otherWidgetTypesNotSupported');
}

/**
 * Translates a {@link WidgetModel} to {@link WidgetDto}.
 *
 * @param widgetModel - The WidgetModel to be converted to a widgetDto
 * @param dataSource - The full datasource details
 * @returns WidgetDto
 * @internal
 */
export function toWidgetDto(
  widgetModel: WidgetModel,
  dataSource?: JaqlDataSourceForDto,
): WidgetDto {
  const datasource = dataSource || widgetModel.dataSource;
  if (typeof datasource === 'string') throw new IncompleteWidgetTypeError('dataSource');
  if (
    !datasource.id ||
    (!(datasource as JaqlDataSource).live && !(datasource as JaqlDataSource).address)
  )
    throw new IncompleteWidgetTypeError('dataSource');

  const chartType = widgetModel.chartType;
  let fusionWidgetType = getFusionWidgetType(widgetModel.widgetType, chartType);
  let style: WidgetStyle = {};
  // TODO: For some reason TreeMap, Sunburst (and maybe others) are not include subtype in the styleOptions
  let subtype: string = (widgetModel.styleOptions as IndicatorWidgetStyle).subtype || '';

  if (!chartType) throw new Error('Chart type is required');

  const panels: Panel[] = [];
  if (isCartesian(chartType)) {
    const categoriesPanelName = ['chart/line', 'chart/area'].includes(widgetModel.widgetType)
      ? 'x-axis'
      : 'categories';
    const items: PanelItem[] = (widgetModel.dataOptions as CartesianChartDataOptions).category.map(
      (column) => createPanelItem(normalizeColumn(column)),
    );
    const categoryPanel: Panel = {
      name: categoriesPanelName,
      items,
    };
    panels.push(categoryPanel);
    const valueItems = (widgetModel.dataOptions as CartesianChartDataOptions).value.map((column) =>
      createPanelItem(normalizeMeasureColumn(column)),
    );

    panels.push({
      name: 'values',
      items: valueItems,
    });
    const breakByItems = (widgetModel.dataOptions as CartesianChartDataOptions).breakBy.map(
      (column) => createPanelItem(normalizeColumn(column)),
    );

    panels.push({
      name: 'break by',
      items: breakByItems,
    });
    // fix subtype
    if (chartType === 'polar') {
      subtype = 'column/polar';
    } else if (chartType === 'bar') {
      subtype = subtype || 'bar/classic';
    } else if (chartType === 'column') {
      subtype = subtype || 'column/classic';
    } else if (chartType === 'area') {
      subtype = subtype || 'area/basic';
    } else if (chartType === 'line') {
      subtype = subtype || 'line/basic';
    }

    // Styling: TBD
  } else if (isTable(chartType)) {
    const { attributes, measures } = getTableAttributesAndMeasures(
      widgetModel.dataOptions as TableDataOptionsInternal,
    );
    const items: PanelItem[] = [
      ...attributes.map((column) => createPanelItem(normalizeColumn(column))),
      ...measures.map((column) => createPanelItem(normalizeMeasureColumn(column))),
    ];
    panels.push({
      name: 'columns',
      items,
    });
    // tablewidgetagg is now a disabled plugin by default, and tablewidget should be fully compatible
    fusionWidgetType = 'tablewidget';
  } else if (isIndicator(chartType)) {
    ['value', 'min', 'max', 'secondary'].forEach((panelName) => {
      const items: PanelItem[] = (
        (widgetModel.dataOptions as IndicatorChartDataOptions)[
          panelName as keyof IndicatorChartDataOptions
        ] || []
      ).map((column) => createPanelItem(normalizeMeasureColumn(column)));
      panels.push({ name: panelName, items });
    });
    subtype = subtype || 'indicator/numeric';

    // Simple default style,  Empty style or {} cause errors
    style = {
      ...(subtype === 'indicator/gauge'
        ? {
            subtype: 'round',
            skin: '1',
          }
        : {
            subtype: 'simple',
            skin: 'vertical',
          }),
      components: {
        ticks: {
          inactive: false,
          enabled: true,
        },
        labels: {
          inactive: false,
          enabled: true,
        },
        title: {
          inactive: false,
          enabled: true,
        },
        secondaryTitle: {
          inactive: true,
          enabled: true,
        },
      },
    } as WidgetStyle;
  } else if (isCategorical(chartType)) {
    const items: PanelItem[] = (
      widgetModel.dataOptions as CategoricalChartDataOptions
    ).category.map((column) => createPanelItem(normalizeAnyColumn(column)));
    panels.push({
      name: 'categories',
      items,
    });
    const valueItems = (widgetModel.dataOptions as CategoricalChartDataOptions).value.map(
      (column) => createPanelItem(normalizeAnyColumn(column)),
    );
    const isTreemap = chartType === 'treemap';
    panels.push({
      name: isTreemap ? 'size' : 'values',
      items: valueItems,
    });
    if (isTreemap) {
      const emptyPanels = ['color', 'values']; // required for treemap
      emptyPanels.forEach((panelName) => {
        panels.push({
          name: panelName,
          items: [],
        });
      });
    }

    // Styling: TBD
    if (chartType === 'pie') {
      subtype = subtype || 'pie/basic';
      style = {
        convolution: {
          enabled: true,
          selectedConvolutionType: 'bySlicesCount',
          minimalIndependentSlicePercentage: 3,
          independentSlicesCount: 7,
        },
      } as WidgetStyle;
    } else if (chartType === 'treemap' || chartType === 'sunburst') {
      subtype = subtype || chartType;
    } else if (chartType === 'funnel') {
      subtype = subtype || 'chart/funnel';
    }
  } else if (isScatter(chartType)) {
    (
      ['x', 'y', 'size', 'breakByColor', 'breakByPoint'] as (keyof ScatterChartDataOptions)[]
    ).forEach((panelName) => {
      if (
        (widgetModel.dataOptions as ScatterChartDataOptions)[panelName] as Column | MeasureColumn
      ) {
        const aliases: { [key: string]: string } = {
          breakByColor: 'Break By / Color',
          breakByPoint: 'point',
          x: 'x-axis',
          y: 'y-axis',
        };
        const items: PanelItem[] = [
          createPanelItem(
            normalizeAnyColumn(
              (widgetModel.dataOptions as ScatterChartDataOptions)[panelName]! as Column,
            ),
          ),
        ];
        panels.push({
          name: aliases[panelName] || panelName,
          items,
        });
      }
    });
    // default subtype
    subtype = subtype || 'bubble/scatter';
    // Styling
  } else {
    throw new UnsupportedChartTypeError(chartType);
  }
  const filterItems = (widgetModel.filters || []).map((filter) => filter.jaql());
  panels.push({
    name: 'filters',
    items: filterItems,
  });

  const widget: WidgetDto = {
    oid: widgetModel.oid || '',
    title: widgetModel.title,
    desc: widgetModel.description,
    datasource,
    type: fusionWidgetType,
    metadata: {
      panels,
    },
    style,
    subtype,
  };
  return widget;
}

class IncompleteWidgetTypeError extends TranslatableError {
  constructor(prop: string) {
    super('errors.widgetModel.incomleteWidget', { prop });
  }
}
class UnsupportedChartTypeError extends TranslatableError {
  constructor(chartType: string) {
    super('errors.widgetModel.unsupportedWidgetTypeDto', { chartType });
  }
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
