/* eslint-disable max-lines */
/* eslint-disable complexity */
import mapValues from 'lodash/mapValues';
import {
  MetadataTypes,
  DimensionalBaseMeasure,
  DimensionalAttribute,
  DimensionalLevelAttribute,
  DimensionalCalculatedMeasure,
  MeasureContext,
  Sort,
} from '@sisense/sdk-data';
import {
  CartesianChartDataOptions,
  CategoricalChartDataOptions,
  ScatterChartDataOptions,
  IndicatorDataOptions,
  StyledMeasureColumn,
  StyledColumn,
  CompleteThemeSettings,
} from '../types';
import { Panel, PanelItem, Jaql, WidgetType, DataType } from './types';
import { createValueToColorMap, createValueColorOptions } from './translate_panel_color_format';
import { getEnabledPanelItems, getSortType, getRootPanelItem } from './utils';
import { TableDataOptions } from '../chart-data-options/types';

function createDimensionalElementFromJaql(jaql: Jaql, format?: { mask?: Record<string, string> }) {
  const isFormulaJaql = 'formula' in jaql;

  let sort;
  if (jaql.sort) {
    sort = jaql.sort === 'asc' ? Sort.Ascending : Sort.Descending;
  }

  if (isFormulaJaql) {
    const context: MeasureContext = mapValues(jaql.context ?? {}, (jaqlContextValue) =>
      createDimensionalElementFromJaql(jaqlContextValue),
    );

    return new DimensionalCalculatedMeasure(
      jaql.title,
      jaql.formula,
      context,
      undefined,
      undefined,
      sort,
    );
  }

  const hasAggregation = !!jaql.agg;
  const isDatatypeDatetime = jaql.datatype === DataType.DATETIME;
  const attributeType =
    jaql.datatype === DataType.NUMERIC
      ? MetadataTypes.NumericAttribute
      : MetadataTypes.TextAttribute;
  const attribute = isDatatypeDatetime
    ? // todo: fully translate jaql to granularity
      new DimensionalLevelAttribute(
        jaql.title,
        jaql.dim,
        jaql.level!,
        format?.mask?.[jaql.level!],
        undefined,
        sort,
      )
    : new DimensionalAttribute(jaql.title, jaql.dim, attributeType, undefined, sort);

  if (hasAggregation) {
    return new DimensionalBaseMeasure(
      jaql.title,
      attribute,
      DimensionalBaseMeasure.aggregationFromJAQL(jaql.agg || ''),
      undefined,
      undefined,
      sort,
    );
  }

  return attribute;
}

export function createDataColumn(item: PanelItem, themeSettings?: CompleteThemeSettings) {
  const element = createDimensionalElementFromJaql(item.jaql, item.format);
  const sortType = getSortType(item.jaql.sort ?? item.categoriesSorting);

  if (MetadataTypes.isMeasure(element)) {
    const color = createValueColorOptions(item.format?.color, themeSettings);
    const showOnRightAxis = item.y2;
    const chartType = item.singleSeriesType;

    return {
      column: element,
      ...(color && { color }),
      ...(showOnRightAxis && { showOnRightAxis }),
      ...(sortType && { sortType }),
      ...(chartType && { chartType }),
    } as StyledMeasureColumn;
  }

  return {
    column: element,
    ...(sortType && { sortType }),
  } as StyledColumn;
}

function createColumnsFromPanelItems(
  panels: Panel[],
  panelName: string,
  themeSettings?: CompleteThemeSettings,
) {
  return getEnabledPanelItems(panels, panelName)
    .map(getRootPanelItem)
    .map((item) => createDataColumn(item, themeSettings));
}

function extractCartesianChartDataOptions(
  panels: Panel[],
  widgetType: WidgetType,
  themeSettings?: CompleteThemeSettings,
): CartesianChartDataOptions {
  const categoriesPanelName = [WidgetType.LineChart, WidgetType.AreaChart].includes(widgetType)
    ? 'x-axis'
    : 'categories';
  const category = createColumnsFromPanelItems(panels, categoriesPanelName, themeSettings);
  const value = createColumnsFromPanelItems(panels, 'values', themeSettings);
  const breakBy = createColumnsFromPanelItems(panels, 'break by', themeSettings);
  const membersFormat = getEnabledPanelItems(panels, 'break by')[0]?.format?.members;
  const seriesToColorMap = membersFormat && createValueToColorMap(membersFormat);

  return {
    category: category as StyledColumn[],
    value: value,
    breakBy: breakBy as StyledColumn[],
    ...(seriesToColorMap && { seriesToColorMap }),
  };
}

function extractCategoricalChartDataOptions(
  panels: Panel[],
  themeSettings?: CompleteThemeSettings,
): CategoricalChartDataOptions {
  const category = createColumnsFromPanelItems(panels, 'categories', themeSettings);
  const value = createColumnsFromPanelItems(panels, 'values', themeSettings);
  const membersFormat = getEnabledPanelItems(panels, 'categories')[0]?.format?.members;
  const seriesToColorMap = membersFormat && createValueToColorMap(membersFormat);

  return {
    category: category as StyledColumn[],
    value,
    ...(seriesToColorMap && { seriesToColorMap }),
  };
}

function extractScatterChartDataOptions(
  panels: Panel[],
  themeSettings?: CompleteThemeSettings,
): ScatterChartDataOptions {
  const [x] = createColumnsFromPanelItems(panels, 'x-axis', themeSettings);
  const [y] = createColumnsFromPanelItems(panels, 'y-axis', themeSettings);
  const [breakByPoint] = createColumnsFromPanelItems(panels, 'point', themeSettings);
  const [breakByColor] = createColumnsFromPanelItems(panels, 'Break By / Color', themeSettings);
  const [size] = createColumnsFromPanelItems(panels, 'size', themeSettings);
  const membersFormat = getEnabledPanelItems(panels, 'Break By / Color')[0]?.format?.members;
  const seriesToColorMap = membersFormat && createValueToColorMap(membersFormat);

  return {
    x,
    y,
    breakByPoint: breakByPoint as StyledColumn,
    breakByColor,
    size,
    ...(seriesToColorMap && { seriesToColorMap }),
  };
}

function extractIndicatorChartDataOptions(
  panels: Panel[],
  themeSettings?: CompleteThemeSettings,
): IndicatorDataOptions {
  const value = createColumnsFromPanelItems(panels, 'value', themeSettings);
  const secondary = createColumnsFromPanelItems(panels, 'secondary', themeSettings);
  const min = createColumnsFromPanelItems(panels, 'min', themeSettings);
  const max = createColumnsFromPanelItems(panels, 'max', themeSettings);

  return {
    value,
    secondary,
    min,
    max,
  };
}

function extractTableChartDataOptions(
  panels: Panel[],
  themeSettings?: CompleteThemeSettings,
): TableDataOptions {
  return {
    columns: createColumnsFromPanelItems(panels, 'columns', themeSettings),
  };
}

export function extractDataOptions(
  widgetType: WidgetType,
  panels: Panel[],
  themeSettings?: CompleteThemeSettings,
) {
  switch (widgetType) {
    case WidgetType.LineChart:
    case WidgetType.AreaChart:
    case WidgetType.BarChart:
    case WidgetType.ColumnChart:
    case WidgetType.PolarChart:
      return extractCartesianChartDataOptions(panels, widgetType, themeSettings);
    case WidgetType.PieChart:
    case WidgetType.FunnelChart:
      return extractCategoricalChartDataOptions(panels, themeSettings);
    case WidgetType.ScatterChart:
      return extractScatterChartDataOptions(panels, themeSettings);
    case WidgetType.IndicatorChart:
      return extractIndicatorChartDataOptions(panels, themeSettings);
    case WidgetType.Table:
    case WidgetType.TableWithAggregation:
      return extractTableChartDataOptions(panels, themeSettings);
  }
}