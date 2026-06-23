import {
  Attribute,
  convertDataSource,
  convertJaqlDataSourceForDto,
  Filter,
  JaqlDataSourceForDto,
  Measure,
} from '@sisense/sdk-data';

import { jumpToDashboardConfigFromWidgetDto } from '@/domains/dashboarding/dashboard-model/translate-dashboard-utils.js';
import type {
  JumpToDashboardConfig,
  JumpToDashboardConfigForPivot,
} from '@/domains/dashboarding/hooks/jtd/jtd-types.js';
import { ExecutePivotQueryParams, ExecuteQueryParams } from '@/domains/query-execution/index.js';
import { getPivotQueryOptions } from '@/domains/visualizations/components/pivot-table/hooks/use-get-pivot-table-query.js';
import { getTableAttributesAndMeasures } from '@/domains/visualizations/components/table/hooks/use-table-data.js';
import {
  DEFAULT_TABLE_ROWS_PER_PAGE,
  PAGES_BATCH_SIZE,
} from '@/domains/visualizations/components/table/table-component.js';
import { getTranslatedDataOptions } from '@/domains/visualizations/core/chart-data-options/get-translated-data-options.js';
import {
  translatePivotTableDataOptions,
  translateTableDataOptions,
} from '@/domains/visualizations/core/chart-data-options/translate-data-options.js';
import {
  AreamapChartDataOptions,
  BoxplotChartDataOptions,
  CalendarHeatmapChartDataOptions,
  CartesianChartDataOptions,
  CategoricalChartDataOptions,
  ChartDataOptions,
  IndicatorChartDataOptions,
  PivotTableDataOptions,
  ScatterChartDataOptions,
  ScattermapChartDataOptions,
  TableDataOptions,
  TableDataOptionsInternal,
} from '@/domains/visualizations/core/chart-data-options/types.js';
import { ChartWidgetProps } from '@/domains/widgets/components/chart-widget/types';
import { CommonWidgetProps } from '@/domains/widgets/components/common-widget/types';
import { CustomWidgetProps } from '@/domains/widgets/components/custom-widget/types';
import { PivotTableWidgetProps } from '@/domains/widgets/components/pivot-table-widget/types';
import { TextWidgetProps } from '@/domains/widgets/components/text-widget/types';
import {
  attachDataSourceToPanels,
  createDataOptionsFromPanels,
  extractDataOptions,
} from '@/domains/widgets/components/widget-by-id/translate-widget-data-options.js';
import { extractDrilldownOptions } from '@/domains/widgets/components/widget-by-id/translate-widget-drilldown-options.js';
import { extractWidgetFilters } from '@/domains/widgets/components/widget-by-id/translate-widget-filters.js';
import {
  extractStyleOptions,
  getFlattenWidgetDesign,
  getStyleWithWidgetDesign,
  toAreamapSubtype,
  toAreaWidgetStyle,
  toBarWidgetStyle,
  toBoxplotWidgetStyle,
  toCalendarHeatmapWidgetStyle,
  toColumnWidgetStyle,
  toFunnelWidgetStyle,
  toIndicatorWidgetStyle,
  toLineWidgetStyle,
  toPieWidgetStyle,
  toPivotTableWidgetStyle,
  toPolarWidgetStyle,
  toScattermapWidgetStyle,
  toScatterWidgetStyle,
  toSunburstWidgetStyle,
  toTableWidgetStyle,
  toTreemapWidgetStyle,
  withWidgetDesign,
} from '@/domains/widgets/components/widget-by-id/translate-widget-style-options/index.js';
import { toTabberWidgetStyle } from '@/domains/widgets/components/widget-by-id/translate-widget-style-options/tabber.js';
import {
  extractWidgetNarrativeOptionsFromDto,
  mergeWidgetStyleWithNarrativeForDto,
} from '@/domains/widgets/components/widget-by-id/translate-widget-style-options/widget-narrative-style.js';
import {
  FusionWidgetType,
  IndicatorWidgetStyle,
  Panel,
  WidgetDto,
  WidgetStyle,
  WidgetSubtype,
} from '@/domains/widgets/components/widget-by-id/types.js';
import {
  getChartType,
  getFusionWidgetType,
  getWidgetType,
  isChartFusionWidget,
  isChartWidgetProps,
  isCustomWidget,
  isCustomWidgetProps,
  isPivotTableWidgetProps,
  isPivotWidget,
  isSupportedPluginCsdkWidget,
  isSupportedPluginFusionWidget,
  isSupportedWidgetType,
  isTableWidgetModel,
  isTextWidget,
  isTextWidgetProps,
} from '@/domains/widgets/components/widget-by-id/utils.js';
import { WidgetProps } from '@/domains/widgets/components/widget/types';
import { AppSettings } from '@/infra/app/settings/settings.js';
import { getDefaultThemeSettings } from '@/infra/contexts/theme-provider/default-theme-settings';
import { TranslatableError } from '@/infra/translation/translatable-error';
import { ChartProps, PivotTableProps, TableProps } from '@/props';
import {
  AreamapStyleOptions,
  AreaStyleOptions,
  BoxplotStyleOptions,
  CalendarHeatmapStyleOptions,
  ChartStyleOptions,
  CompleteThemeSettingsInternal,
  CustomWidgetStyleOptions,
  DrilldownOptions,
  FunnelStyleOptions,
  GenericDataOptions,
  IndicatorStyleOptions,
  LineStyleOptions,
  PieStyleOptions,
  PivotTableDrilldownOptions,
  PivotTableWidgetStyleOptions,
  PolarStyleOptions,
  ScattermapStyleOptions,
  ScatterStyleOptions,
  StackableStyleOptions,
  SunburstStyleOptions,
  TabberButtonsWidgetCustomOptions,
  TabberButtonsWidgetStyleOptions,
  TableStyleOptions,
  TextWidgetStyleOptions,
  TreemapStyleOptions,
  WidgetStyleOptions,
} from '@/types.js';

import { WidgetDataOptions, WidgetModel } from '../widget-model';
import { processTabberWidget } from './process-tabber-widget';
import {
  toAreamapPanels,
  toAreaPanels,
  toBarPanels,
  toBoxplotPanels,
  toCalendarHeatmapPanels,
  toColumnPanels,
  toCustomWidgetPanels,
  toFunnelPanels,
  toIndicatorPanels,
  toLinePanels,
  toPiePanels,
  toPivotTablePanels,
  toPolarPanels,
  toScattermapPanels,
  toScatterPanels,
  toSunburstPanels,
  toTablePanels,
  toTreemapPanels,
} from './to-widget-dto-panels';
import { isWidgetDesignEnabled } from './utils';

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
    aiOptions: widgetModel.aiOptions,
    dataSource: widgetModel.dataSource,
    filters: widgetModel.filters,
    highlights: widgetModel.highlights,
    title: widgetModel.title,
    description: widgetModel.description || '',
    drilldownOptions: widgetModel.drilldownOptions as DrilldownOptions,
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
    aiOptions: widgetModel.aiOptions,
    dataSource: widgetModel.dataSource,
    filters: widgetModel.filters,
    highlights: widgetModel.highlights,
    drilldownOptions: widgetModel.drilldownOptions as PivotTableDrilldownOptions,
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
 * Translates a {@link WidgetModel} to the props for rendering a custom widget.
 *
 * @internal
 */
export function toCustomWidgetProps(widgetModel: WidgetModel): CustomWidgetProps {
  if (!isCustomWidget(widgetModel.widgetType)) {
    throw new TranslatableError('errors.widgetModel.onlyCustomWidgetSupported', {
      methodName: 'toCustomWidgetProps',
    });
  }

  return {
    customWidgetType: widgetModel.customWidgetType,
    dataOptions: widgetModel.dataOptions as GenericDataOptions,
    styleOptions: widgetModel.styleOptions as CustomWidgetStyleOptions,
    dataSource: widgetModel.dataSource,
    filters: widgetModel.filters,
    highlights: widgetModel.highlights,
    title: widgetModel.title,
    description: widgetModel.description || '',
    customOptions: widgetModel.customOptions,
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
  } else if (isCustomWidget(widgetType)) {
    return { widgetType: 'custom', ...toCustomWidgetProps(widgetModel) };
  } else {
    return { widgetType: 'chart', ...toChartWidgetProps(widgetModel) };
  }
}

/**
 * Translates {@link WidgetModel} to {@link WidgetProps}.
 *
 * @example
 * ```tsx
 * <Widget {...widgetModelTranslator.toWidgetProps(widgetModel)} />
 * ```
 */
export function toWidgetProps(widgetModel: WidgetModel): WidgetProps {
  const { oid } = widgetModel;

  return { ...toCommonWidgetProps(widgetModel), id: oid };
}

/**
 * Returns Jump to Dashboard configuration for a {@link WidgetModel} that was built from
 * Fusion via {@link fromWidgetDto}.
 *
 * @param widgetModel - The {@link WidgetModel} built from Fusion via {@link fromWidgetDto};
 *
 * @returns `JumpToDashboardConfig`, `JumpToDashboardConfigForPivot`, or `null` when the model is not
 * Fusion-sourced, or the widget has no versioned JTD.
 *
 * @example
 * ```tsx
 * const widgetProps = widgetModelTranslator.toWidgetProps(widgetModel);
 * const jtdConfig = widgetModelTranslator.toJtdConfig(widgetModel);
 * // When jtdConfig is non-null, pass widgetProps and jtdConfig to useJtdWidget; otherwise render the widget with widgetProps alone.
 * ```
 *
 * @sisenseInternal
 * @alpha
 */
export function toJtdConfig(
  widgetModel: WidgetModel,
): JumpToDashboardConfig | JumpToDashboardConfigForPivot | null {
  return widgetModel.jtdConfig ?? null;
}

/**
 * The default widget model.
 */
const DEFAULT_WIDGET_MODEL: WidgetModel = {
  oid: '',
  title: '',
  dataSource: '',
  description: '',
  widgetType: 'custom',
  customWidgetType: '',
  dataOptions: {},
  styleOptions: {},
  customOptions: undefined,
  drilldownOptions: {},
  filters: [],
  highlights: [],
  chartType: undefined,
  aiOptions: undefined,
};

/**
 * Widget category discriminated union for type-safe processing
 */
type WidgetCategory =
  | { type: 'unsupported-custom'; originalType: string }
  | { type: 'official-custom'; originalType: string }
  | { type: 'standard'; fusionType: FusionWidgetType };

/**
 * Determines the category of a widget based on its type.
 * Pure function that classifies widgets into three categories.
 *
 * @param fusionWidgetType - The fusion widget type string from DTO
 * @returns The widget category
 */
const categorizeWidget = (fusionWidgetType: string): WidgetCategory => {
  // Check for officially supported custom widgets (e.g., 'WidgetsTabber' from DTO)
  if (isSupportedPluginFusionWidget(fusionWidgetType)) {
    return { type: 'official-custom', originalType: fusionWidgetType };
  }

  if (isSupportedWidgetType(fusionWidgetType)) {
    return { type: 'standard', fusionType: fusionWidgetType };
  }

  return { type: 'unsupported-custom', originalType: fusionWidgetType };
};

/**
 * Extracts variant colors from theme settings.
 * Pure function with default fallback that filters out null values.
 *
 * @param themeSettings - Optional theme settings
 * @returns Array of variant colors as strings (nulls filtered out)
 */
const getVariantColors = (themeSettings?: CompleteThemeSettingsInternal): string[] => {
  const colors = themeSettings?.palette.variantColors ?? [];
  return colors.filter((color): color is string => color !== null);
};

/**
 * Processes unsupported custom widgets.
 * Pure function that creates data and style options for unknown widget types.
 *
 * @param params - Parameters for processing unsupported custom widget
 * @returns Object containing fusion type, custom type, data options, and style options
 */
const processUnsupportedCustomWidget = (params: {
  originalType: string;
  panels: Panel[];
  widgetStyle: WidgetStyle;
  variantColors: string[];
}): {
  fusionWidgetType: FusionWidgetType;
  customWidgetType: string;
  dataOptions: GenericDataOptions;
  styleOptions: CustomWidgetStyleOptions;
} => {
  const { originalType, panels, widgetStyle, variantColors } = params;
  const { widgetDesign, narration, ...styleRest } = widgetStyle;
  void narration; // Narration is intentionally excluded from unsupported custom widget styles

  return {
    fusionWidgetType: 'custom',
    customWidgetType: originalType,
    dataOptions: createDataOptionsFromPanels(panels, variantColors),
    styleOptions: {
      ...styleRest,
      ...(widgetDesign ? getFlattenWidgetDesign(widgetDesign) : {}),
    },
  };
};

/**
 * Processes officially supported custom widgets.
 * Pure function that creates data and style options for official custom widgets like TabberButtonsWidget.
 * These widgets use the custom widget infrastructure but have official support.
 * Maps from DTO widget type (e.g., 'WidgetsTabber') to CSDK widget type (e.g., 'tabber-buttons').
 *
 * @param params - Parameters for processing official custom widget
 * @returns Object containing fusion type, custom type, data options, and style options
 */
const processOfficialCustomWidget = (params: {
  originalType: string;
  panels: Panel[];
  widgetDto: WidgetDto;
  variantColors: string[];
}): {
  fusionWidgetType: FusionWidgetType;
  customWidgetType: string;
  dataOptions: GenericDataOptions;
  styleOptions: CustomWidgetStyleOptions;
  customOptions?: Record<string, any>;
} => {
  const { originalType, panels, widgetDto, variantColors } = params;

  // for now only Tabber is officially supported custom widget
  if (originalType === 'WidgetsTabber') {
    return processTabberWidget({ panels, widgetDto, variantColors });
  }

  throw new TranslatableError('errors.unsupportedWidgetType', { widgetType: originalType });
};
/**
 * Processes standard supported widgets.
 * Pure function that extracts data and style options for standard widgets.
 *
 * @param params - Parameters for processing standard widget
 * @returns Object containing fusion type, custom type, data options, and style options
 */
const processStandardWidget = (params: {
  fusionType: FusionWidgetType;
  panels: Panel[];
  widgetStyle: WidgetStyle;
  widgetDto: WidgetDto;
  variantColors: string[];
}): {
  fusionWidgetType: FusionWidgetType;
  customWidgetType: string;
  dataOptions: ChartDataOptions | PivotTableDataOptions | TableDataOptions;
  styleOptions:
    | ChartStyleOptions
    | TableStyleOptions
    | TextWidgetStyleOptions
    | PivotTableWidgetStyleOptions;
} => {
  const { fusionType, panels, widgetStyle, widgetDto, variantColors } = params;

  return {
    fusionWidgetType: fusionType,
    customWidgetType: '',
    dataOptions: extractDataOptions(fusionType, panels, widgetStyle, variantColors),
    styleOptions: extractStyleOptions(fusionType, widgetDto) as
      | ChartStyleOptions
      | TableStyleOptions
      | TextWidgetStyleOptions
      | PivotTableWidgetStyleOptions,
  };
};

/**
 * Applies widget design to style options based on feature flag.
 * Pure function that conditionally merges widget design.
 *
 * @param params - Parameters for applying widget design
 * @returns Updated style options
 */
const applyWidgetDesign = (params: {
  styleOptions:
    | ChartStyleOptions
    | TableStyleOptions
    | TextWidgetStyleOptions
    | CustomWidgetStyleOptions
    | PivotTableWidgetStyleOptions;
  widgetStyle: WidgetStyle;
  isEnabled: boolean;
}): WidgetStyleOptions => {
  const { styleOptions, widgetStyle, isEnabled } = params;

  return getStyleWithWidgetDesign(styleOptions, widgetStyle.widgetDesign, isEnabled);
};

/**
 * Processes widget based on its category.
 * Pure function that delegates to category-specific processors.
 *
 * @param params - Parameters for processing widget
 * @returns Processed widget data
 */
const processWidgetByCategory = (params: {
  category: WidgetCategory;
  panels: Panel[];
  widgetDto: WidgetDto;
  variantColors: string[];
  isWidgetDesignEnabled: boolean;
}): {
  fusionWidgetType: FusionWidgetType;
  customWidgetType: string;
  dataOptions: WidgetDataOptions;
  styleOptions: WidgetStyleOptions;
  customOptions?: Record<string, any>;
} => {
  const { category, panels, widgetDto, variantColors, isWidgetDesignEnabled } = params;

  switch (category.type) {
    case 'unsupported-custom':
      // Widget design is already applied in processUnsupportedCustomWidget
      return processUnsupportedCustomWidget({
        originalType: category.originalType,
        panels,
        widgetStyle: widgetDto.style,
        variantColors,
      });

    case 'official-custom': {
      const result = processOfficialCustomWidget({
        originalType: category.originalType,
        panels,
        widgetDto,
        variantColors,
      });
      // Apply widget design for official custom widgets
      const styleOptionsWithDesign = applyWidgetDesign({
        styleOptions: result.styleOptions,
        widgetStyle: widgetDto.style,
        isEnabled: isWidgetDesignEnabled,
      });
      return {
        ...result,
        styleOptions: styleOptionsWithDesign,
      };
    }

    case 'standard': {
      const result = processStandardWidget({
        fusionType: category.fusionType,
        panels,
        widgetStyle: widgetDto.style,
        widgetDto,
        variantColors,
      });
      // Apply widget design for standard widgets
      const styleOptionsWithDesign = applyWidgetDesign({
        styleOptions: result.styleOptions,
        widgetStyle: widgetDto.style,
        isEnabled: isWidgetDesignEnabled,
      });
      return {
        ...result,
        styleOptions: styleOptionsWithDesign,
      };
    }
  }
};

/**
 * Builds the final widget model from processed data.
 * Pure function that constructs the widget model.
 *
 * @param params - Parameters for building widget model
 * @returns Complete widget model
 */
const buildWidgetModel = (params: {
  widgetDto: WidgetDto;
  fusionWidgetType: FusionWidgetType;
  customWidgetType: string;
  dataOptions: WidgetDataOptions;
  styleOptions: WidgetStyleOptions;
  customOptions?: Record<string, any>;
  panels: Panel[];
}): WidgetModel => {
  const {
    widgetDto,
    fusionWidgetType,
    customWidgetType,
    dataOptions,
    styleOptions,
    customOptions,
    panels,
  } = params;

  const drilldownOptions = extractDrilldownOptions(fusionWidgetType, panels);
  const filters = extractWidgetFilters(panels);
  const chartType = isChartFusionWidget(fusionWidgetType)
    ? getChartType(fusionWidgetType)
    : undefined;

  const jtdConfig = jumpToDashboardConfigFromWidgetDto(widgetDto);

  const narrativeOptions = extractWidgetNarrativeOptionsFromDto(widgetDto.style?.narration);
  const aiOptions = narrativeOptions !== undefined ? { narrative: narrativeOptions } : undefined;

  // Merge the opaque DTO `customOptions` bag (persisted plugin runtime state)
  // under any category-specific options (e.g. Tabber's), which take precedence.
  const mergedCustomOptions =
    widgetDto.customOptions || customOptions
      ? { ...widgetDto.customOptions, ...customOptions }
      : undefined;

  return {
    ...DEFAULT_WIDGET_MODEL,
    oid: widgetDto.oid,
    title: widgetDto.title,
    dataSource: convertDataSource(widgetDto.datasource),
    description: widgetDto.desc || '',
    widgetType: getWidgetType(fusionWidgetType),
    chartType,
    customWidgetType,
    dataOptions,
    styleOptions,
    customOptions: mergedCustomOptions,
    drilldownOptions,
    filters,
    ...(jtdConfig ? { jtdConfig } : {}),
    ...(aiOptions !== undefined ? { aiOptions } : {}),
  };
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
  themeSettings?: CompleteThemeSettingsInternal,
  appSettings?: AppSettings,
): WidgetModel {
  const panels = attachDataSourceToPanels(widgetDto.metadata.panels, widgetDto.datasource);
  const category = categorizeWidget(widgetDto.type);
  const variantColors = getVariantColors(themeSettings);
  const widgetDesignEnabled = isWidgetDesignEnabled(appSettings);

  const processed = processWidgetByCategory({
    category,
    panels,
    widgetDto,
    variantColors,
    isWidgetDesignEnabled: widgetDesignEnabled,
  });

  return buildWidgetModel({
    widgetDto,
    panels,
    ...processed,
  });
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
 * Creates a {@link WidgetModel} from a {@link PivotTableWidgetProps}.
 *
 * @param pivotTableWidgetProps - The PivotTableWidgetProps to be converted to a widget model
 * @returns WidgetModel
 * @internal
 */
export function fromPivotTableWidgetProps(
  pivotTableWidgetProps: PivotTableWidgetProps,
): WidgetModel {
  const widgetModel: WidgetModel = {
    ...DEFAULT_WIDGET_MODEL,
    ...pivotTableWidgetProps,
    filters: (pivotTableWidgetProps.filters as Filter[]) || [], // typecast because of FilterRelation tmp incompatibility
    widgetType: 'pivot',
  };

  return widgetModel;
}

/**
 * Creates a {@link WidgetModel} from a {@link TextWidgetProps}.
 *
 * @param textWidgetProps - The TextWidgetProps to be converted to a widget model
 * @returns WidgetModel
 * @internal
 */
export function fromTextWidgetProps(textWidgetProps: TextWidgetProps): WidgetModel {
  const widgetModel: WidgetModel = {
    ...DEFAULT_WIDGET_MODEL,
    styleOptions: textWidgetProps.styleOptions as WidgetModel['styleOptions'],
    widgetType: 'text',
  };

  return widgetModel;
}

/**
 * Creates a {@link WidgetModel} from a {@link CustomWidgetProps}.
 *
 * @param customWidgetProps - The CustomWidgetProps to be converted to a widget model
 * @returns WidgetModel
 * @internal
 */
export function fromCustomWidgetProps(customWidgetProps: CustomWidgetProps): WidgetModel {
  const widgetModel: WidgetModel = {
    ...DEFAULT_WIDGET_MODEL,
    ...customWidgetProps,
    filters: (customWidgetProps.filters as Filter[]) || [],
    widgetType: 'custom',
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
    return withOid(widgetProps.id)(fromChartWidgetProps(widgetProps));
  }
  if (isPivotTableWidgetProps(widgetProps)) {
    return withOid(widgetProps.id)(fromPivotTableWidgetProps(widgetProps));
  }
  if (isTextWidgetProps(widgetProps)) {
    return withOid(widgetProps.id)(fromTextWidgetProps(widgetProps));
  }
  if (isCustomWidgetProps(widgetProps)) {
    return withOid(widgetProps.id)(fromCustomWidgetProps(widgetProps));
  }

  throw new TranslatableError('errors.otherWidgetTypesNotSupported');
}

function withOid(oid: string): (widgetModel: WidgetModel) => WidgetModel {
  return (widgetModel: WidgetModel) => ({
    ...widgetModel,
    oid,
  });
}

/**
 * Translates a {@link WidgetModel} to {@link WidgetDto}.
 *
 * @param widgetModel - The WidgetModel to be converted to a widgetDto
 * @param dataSource - The full datasource details
 * @param themeSettings - The theme settings to be used for the widget design
 * @param appSettings - The application settings to be used for the widget design
 * @returns WidgetDto
 *
 * @sisenseInternal
 */
export function toWidgetDto(
  widgetModel: WidgetModel,
  dataSource?: JaqlDataSourceForDto,
  themeSettings?: CompleteThemeSettingsInternal,
  appSettings?: AppSettings,
): WidgetDto {
  const datasource = dataSource ?? convertJaqlDataSourceForDto(widgetModel.dataSource);
  const isLive = Boolean(datasource.live);
  if (!datasource.id || (!isLive && !datasource.address)) {
    throw new IncompleteWidgetTypeError('dataSource');
  }

  const chartType = widgetModel.chartType;
  let fusionWidgetType = getFusionWidgetType(
    widgetModel.widgetType,
    chartType,
    widgetModel.customWidgetType,
  );
  let style: WidgetStyle = {};
  // TODO: For some reason TreeMap, Sunburst (and maybe others) are not include subtype in the styleOptions
  let subtype: string = (widgetModel.styleOptions as IndicatorWidgetStyle).subtype || '';

  const panels: Panel[] = [];
  if (isPivotWidget(widgetModel.widgetType)) {
    const pivotDataOptions = widgetModel.dataOptions as PivotTableDataOptions;
    panels.push(...toPivotTablePanels(pivotDataOptions));
    subtype = subtype || 'pivot2';
    style = toPivotTableWidgetStyle(
      widgetModel.styleOptions as PivotTableWidgetStyleOptions,
      pivotDataOptions.grandTotals,
    );
  } else if (isTextWidget(widgetModel.widgetType)) {
    const textStyleOptions = widgetModel.styleOptions as TextWidgetStyleOptions;
    subtype = 'richtexteditor';
    style = {
      content: {
        html: textStyleOptions.html,
        vAlign: textStyleOptions.vAlign,
        bgColor: textStyleOptions.bgColor,
        textAlign: 'center',
      },
    };
  } else if (isCustomWidget(widgetModel.widgetType)) {
    panels.push(...toCustomWidgetPanels(widgetModel.dataOptions as GenericDataOptions));
    if (widgetModel.customWidgetType && isSupportedPluginCsdkWidget(widgetModel.customWidgetType)) {
      // Officially-supported plugin widgets (e.g. Tabber) round-trip through a dedicated
      // DTO shape: the Fusion type doubles as the subtype, and the CSDK style + custom
      // options are re-encoded into the Fusion DTO style — opaque pass-through is invalid.
      subtype = fusionWidgetType;
      style = toTabberWidgetStyle(
        (widgetModel.styleOptions ?? {}) as TabberButtonsWidgetStyleOptions,
        (widgetModel.customOptions ?? { tabNames: [] }) as TabberButtonsWidgetCustomOptions,
      );
    } else {
      // Custom-widget styles are plugin-defined; pass through opaquely.
      style = (widgetModel.styleOptions as unknown as WidgetStyle) ?? {};
    }
  } else if (!chartType) {
    throw new Error('Chart type is required');
  } else if (chartType === 'line') {
    panels.push(...toLinePanels(widgetModel.dataOptions as CartesianChartDataOptions));
    subtype = subtype || 'line/basic';
    style = toLineWidgetStyle(widgetModel.styleOptions as LineStyleOptions);
  } else if (chartType === 'area') {
    panels.push(...toAreaPanels(widgetModel.dataOptions as CartesianChartDataOptions));
    subtype = subtype || 'area/basic';
    style = toAreaWidgetStyle(
      widgetModel.styleOptions as AreaStyleOptions,
      subtype as WidgetSubtype,
    );
  } else if (chartType === 'bar') {
    panels.push(...toBarPanels(widgetModel.dataOptions as CartesianChartDataOptions));
    subtype = subtype || 'bar/classic';
    style = toBarWidgetStyle(
      widgetModel.styleOptions as StackableStyleOptions,
      subtype as WidgetSubtype,
    );
  } else if (chartType === 'column') {
    panels.push(...toColumnPanels(widgetModel.dataOptions as CartesianChartDataOptions));
    subtype = subtype || 'column/classic';
    style = toColumnWidgetStyle(
      widgetModel.styleOptions as StackableStyleOptions,
      subtype as WidgetSubtype,
    );
  } else if (chartType === 'polar') {
    panels.push(...toPolarPanels(widgetModel.dataOptions as CartesianChartDataOptions));
    const polarSubtypeToWidgetSubtype: Record<string, string> = {
      'polar/column': 'column/polar',
      'polar/area': 'area/polar',
      'polar/line': 'line/polar',
    };
    const polarSubtype = (widgetModel.styleOptions as PolarStyleOptions).subtype;
    subtype = (polarSubtype && polarSubtypeToWidgetSubtype[polarSubtype]) || 'column/polar';
    style = toPolarWidgetStyle(widgetModel.styleOptions as PolarStyleOptions);
  } else if (chartType === 'table') {
    panels.push(...toTablePanels(widgetModel.dataOptions as TableDataOptionsInternal));
    // tablewidgetagg is now a disabled custom widget by default, and tablewidget should be fully compatible
    fusionWidgetType = 'tablewidget';
    subtype = 'tablewidget';
    style = toTableWidgetStyle(widgetModel.styleOptions as TableStyleOptions);
  } else if (chartType === 'indicator') {
    panels.push(...toIndicatorPanels(widgetModel.dataOptions as IndicatorChartDataOptions));
    subtype = subtype || 'indicator/numeric';
    style = toIndicatorWidgetStyle(widgetModel.styleOptions as IndicatorStyleOptions);
  } else if (chartType === 'pie') {
    panels.push(...toPiePanels(widgetModel.dataOptions as CategoricalChartDataOptions));
    subtype = subtype || 'pie/basic';
    style = toPieWidgetStyle(widgetModel.styleOptions as PieStyleOptions);
  } else if (chartType === 'funnel') {
    panels.push(...toFunnelPanels(widgetModel.dataOptions as CategoricalChartDataOptions));
    subtype = subtype || 'chart/funnel';
    style = toFunnelWidgetStyle(widgetModel.styleOptions as FunnelStyleOptions);
  } else if (chartType === 'treemap') {
    panels.push(...toTreemapPanels(widgetModel.dataOptions as CategoricalChartDataOptions));
    subtype = subtype || chartType;
    style = toTreemapWidgetStyle(widgetModel.styleOptions as TreemapStyleOptions);
  } else if (chartType === 'sunburst') {
    panels.push(...toSunburstPanels(widgetModel.dataOptions as CategoricalChartDataOptions));
    subtype = subtype || chartType;
    style = toSunburstWidgetStyle(widgetModel.styleOptions as SunburstStyleOptions);
  } else if (chartType === 'scatter') {
    panels.push(...toScatterPanels(widgetModel.dataOptions as ScatterChartDataOptions));
    subtype = subtype || 'bubble/scatter';
    style = toScatterWidgetStyle(widgetModel.styleOptions as ScatterStyleOptions);
  } else if (chartType === 'boxplot') {
    const boxplotDataOptions = widgetModel.dataOptions as BoxplotChartDataOptions;
    panels.push(...toBoxplotPanels(boxplotDataOptions));
    subtype = subtype || 'boxplot/full';
    style = toBoxplotWidgetStyle(
      widgetModel.styleOptions as BoxplotStyleOptions,
      boxplotDataOptions.boxType,
      boxplotDataOptions.outliersEnabled,
    );
  } else if (chartType === 'scattermap') {
    const scattermapStyleOptions = widgetModel.styleOptions as ScattermapStyleOptions;
    panels.push(
      ...toScattermapPanels(
        widgetModel.dataOptions as ScattermapChartDataOptions,
        scattermapStyleOptions.markers?.size,
      ),
    );
    // Scattermap DTO always uses the `map/scatter` subtype; the `'scattermap'`
    // subtype picked up from styleOptions is the CSDK chart-subtype, not the DTO one.
    subtype = 'map/scatter';
    style = toScattermapWidgetStyle(scattermapStyleOptions);
  } else if (chartType === 'areamap') {
    const areamapStyleOptions = widgetModel.styleOptions as AreamapStyleOptions;
    panels.push(...toAreamapPanels(widgetModel.dataOptions as AreamapChartDataOptions));
    subtype = toAreamapSubtype(areamapStyleOptions.mapType);
  } else if (chartType === 'calendar-heatmap') {
    panels.push(
      ...toCalendarHeatmapPanels(widgetModel.dataOptions as CalendarHeatmapChartDataOptions),
    );
    // Calendar heatmap DTO uses `heatmap` as both `type` and `subtype`; the CSDK
    // styleOptions.subtype (`'calendar-heatmap/split' | 'calendar-heatmap/continuous'`)
    // is the chart-subtype, not the DTO one, and is encoded in style flags instead.
    subtype = 'heatmap';
    style = toCalendarHeatmapWidgetStyle(widgetModel.styleOptions as CalendarHeatmapStyleOptions);
  } else {
    throw new UnsupportedChartTypeError(chartType);
  }
  const filterItems = (widgetModel.filters || []).map((filter) => filter.jaql());
  panels.push({
    name: 'filters',
    items: filterItems,
  });

  const styleWithWidgetDesign = withWidgetDesign(
    style,
    widgetModel.styleOptions,
    themeSettings ?? getDefaultThemeSettings(),
    appSettings,
  );

  const styleWithDtoNarration = mergeWidgetStyleWithNarrativeForDto(
    styleWithWidgetDesign,
    widgetModel.aiOptions?.narrative,
  );

  const widget: WidgetDto = {
    oid: widgetModel.oid || '',
    title: widgetModel.title,
    desc: widgetModel.description,
    datasource,
    type: fusionWidgetType,
    metadata: {
      panels,
    },
    style: styleWithDtoNarration,
    subtype,
    // Custom-widget options round-trip opaquely through the DTO's `customOptions` bag.
    ...(isCustomWidget(widgetModel.widgetType) && widgetModel.customOptions
      ? { customOptions: widgetModel.customOptions }
      : {}),
  };
  return widget;
}

class IncompleteWidgetTypeError extends TranslatableError {
  constructor(prop: string) {
    super('errors.widgetModel.incompleteWidget', { prop });
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
