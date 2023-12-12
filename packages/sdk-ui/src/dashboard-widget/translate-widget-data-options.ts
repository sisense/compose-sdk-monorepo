/* eslint-disable max-lines */
/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
import mapValues from 'lodash/mapValues';
import {
  MetadataTypes,
  DimensionalBaseMeasure,
  DimensionalAttribute,
  DimensionalLevelAttribute,
  DimensionalCalculatedMeasure,
  MeasureContext,
  DataType,
  Sort,
  Jaql,
  BaseJaql,
} from '@sisense/sdk-data';
import {
  CartesianChartDataOptions,
  CategoricalChartDataOptions,
  ScatterChartDataOptions,
  IndicatorDataOptions,
  StyledMeasureColumn,
  StyledColumn,
  NumberFormatConfig,
  Color,
} from '../types';
import {
  CartesianWidgetType,
  CategoricalWidgetType,
  Panel,
  PanelItem,
  WidgetType,
  NumericMask,
  CurrencyPosition,
  DatetimeMask,
} from './types';
import {
  createValueToColorMap,
  createValueColorOptions,
  createValueToColorMultiColumnsMap,
} from './translate-panel-color-format';
import { getEnabledPanelItems, getSortType, getRootPanelItem, isTabularWidget } from './utils';
import { TableDataOptions } from '../chart-data-options/types';
import { createFilterFromJaql } from './translate-widget-filters';
import { WidgetDataOptions } from '../models';
import { TranslatableError } from '../translation/translatable-error';

export function createDimensionalElementFromJaql(jaql: Jaql, format?: PanelItem['format']) {
  const isFormulaJaql = 'formula' in jaql;

  let sort;
  if (jaql.sort) {
    sort = jaql.sort === 'asc' ? Sort.Ascending : Sort.Descending;
  }

  if (isFormulaJaql) {
    const context: MeasureContext = mapValues(jaql.context ?? {}, (jaqlContextValue) => {
      if (typeof jaqlContextValue === 'string') {
        return jaqlContextValue;
      }
      return jaqlContextValue && createDimensionalElementFromJaql(jaqlContextValue);
    });

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
    ? new DimensionalLevelAttribute(
        jaql.title,
        jaql.dim,
        DimensionalLevelAttribute.translateJaqlToGranularity(jaql),
        (format?.mask as DatetimeMask)?.[jaql.level!],
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

  if ('filter' in jaql) {
    return createFilterFromJaql(jaql);
  }

  return attribute;
}

function extractNumberFormat(item: PanelItem): NumberFormatConfig | null {
  const isNumeric = (item.jaql as BaseJaql).datatype === 'numeric' || 'context' in item.jaql;
  const numberFormat = item.format?.mask as NumericMask;

  if (isNumeric && numberFormat) {
    return {
      decimalScale: numberFormat.decimals || 'auto',
      kilo: numberFormat.abbreviations?.k,
      million: numberFormat.abbreviations?.m,
      billion: numberFormat.abbreviations?.b,
      trillion: numberFormat.abbreviations?.t,
      thousandSeparator: numberFormat.number?.separated,
      prefix: numberFormat.currency?.position === CurrencyPosition.PRE,
      symbol: numberFormat.currency?.symbol,
      name: numberFormat.percent ? 'Percent' : numberFormat.currency ? 'Currency' : 'Numbers',
    } as NumberFormatConfig;
  }

  return null;
}

export function createDataColumn(item: PanelItem, customPaletteColors?: Color[]) {
  const element = createDimensionalElementFromJaql(item.jaql, item.format);
  const sortType = getSortType(item.jaql.sort ?? item.categoriesSorting);
  const numberFormatConfig = extractNumberFormat(item);

  if (MetadataTypes.isMeasure(element)) {
    const color = createValueColorOptions(item.format?.color, customPaletteColors);
    const showOnRightAxis = item.y2;
    const chartType = item.singleSeriesType;

    return {
      column: element,
      ...(color && { color }),
      ...(showOnRightAxis && { showOnRightAxis }),
      ...(sortType && { sortType }),
      ...(chartType && { chartType }),
      ...(numberFormatConfig && { numberFormatConfig }),
    } as StyledMeasureColumn;
  }

  return {
    column: element,
    isColored: item.isColored ?? false,
    ...(sortType && { sortType }),
    ...(numberFormatConfig && { numberFormatConfig }),
  } as StyledColumn;
}

function createColumnsFromPanelItems(
  panels: Panel[],
  panelName: string,
  customPaletteColors?: Color[],
) {
  return getEnabledPanelItems(panels, panelName)
    .map(getRootPanelItem)
    .map((item) => createDataColumn(item, customPaletteColors));
}

function extractCartesianChartDataOptions(
  panels: Panel[],
  widgetType: CartesianWidgetType,
  paletteColors?: Color[],
): CartesianChartDataOptions {
  const widgetTypesWithXAxis: WidgetType[] = ['chart/line', 'chart/area'];
  const categoriesPanelName = widgetTypesWithXAxis.includes(widgetType) ? 'x-axis' : 'categories';
  const category = createColumnsFromPanelItems(panels, categoriesPanelName, paletteColors);
  const value = createColumnsFromPanelItems(panels, 'values', paletteColors);
  const breakBy = createColumnsFromPanelItems(panels, 'break by', paletteColors);
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
  widgetType: WidgetType,
  panels: Panel[],
  customPaletteColors?: Color[],
): CategoricalChartDataOptions {
  const category = createColumnsFromPanelItems(panels, 'categories', customPaletteColors);
  const value = createColumnsFromPanelItems(panels, 'values', customPaletteColors);
  const size = createColumnsFromPanelItems(panels, 'size', customPaletteColors);
  let membersFormat, seriesToColorMap;
  if (widgetType === 'sunburst') {
    seriesToColorMap = createValueToColorMultiColumnsMap(
      getEnabledPanelItems(panels, 'categories'),
    );
  } else {
    membersFormat = getEnabledPanelItems(panels, 'categories')[0]?.format?.members;

    if (getEnabledPanelItems(panels, 'color').length) {
      membersFormat = getEnabledPanelItems(panels, 'color')[0]?.format?.members;
    }

    seriesToColorMap = membersFormat && createValueToColorMap(membersFormat);
  }

  return {
    category: category as StyledColumn[],
    value: [...value, ...size],
    ...(seriesToColorMap && { seriesToColorMap }),
  };
}

function extractScatterChartDataOptions(
  panels: Panel[],
  paletteColors?: Color[],
): ScatterChartDataOptions {
  const [x] = createColumnsFromPanelItems(panels, 'x-axis', paletteColors);
  const [y] = createColumnsFromPanelItems(panels, 'y-axis', paletteColors);
  const [breakByPoint] = createColumnsFromPanelItems(panels, 'point', paletteColors);
  const [breakByColor] = createColumnsFromPanelItems(panels, 'Break By / Color', paletteColors);
  const [size] = createColumnsFromPanelItems(panels, 'size', paletteColors);
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
  paletteColors?: Color[],
): IndicatorDataOptions {
  const value = createColumnsFromPanelItems(panels, 'value', paletteColors);
  const secondary = createColumnsFromPanelItems(panels, 'secondary', paletteColors);
  const min = createColumnsFromPanelItems(panels, 'min', paletteColors);
  const max = createColumnsFromPanelItems(panels, 'max', paletteColors);

  return {
    value,
    secondary,
    min,
    max,
  };
}

function extractTableChartDataOptions(panels: Panel[], paletteColors?: Color[]): TableDataOptions {
  return {
    columns: createColumnsFromPanelItems(panels, 'columns', paletteColors),
  };
}

export function extractDataOptions(
  widgetType: WidgetType,
  panels: Panel[],
  customPaletteColors?: Color[],
): WidgetDataOptions {
  if (isCartesianWidget(widgetType)) {
    return extractCartesianChartDataOptions(panels, widgetType, customPaletteColors);
  }
  if (isCategoricalWidget(widgetType)) {
    return extractCategoricalChartDataOptions(widgetType, panels, customPaletteColors);
  }
  if (widgetType === 'chart/scatter') {
    return extractScatterChartDataOptions(panels, customPaletteColors);
  }
  if (widgetType === 'indicator') {
    return extractIndicatorChartDataOptions(panels, customPaletteColors);
  }
  if (isTabularWidget(widgetType)) {
    return extractTableChartDataOptions(panels, customPaletteColors);
  }
  throw new TranslatableError('errors.unsupportedWidgetType', { widgetType });
}

function isCartesianWidget(widgetType: WidgetType): widgetType is CartesianWidgetType {
  return ['chart/line', 'chart/area', 'chart/bar', 'chart/column', 'chart/polar'].includes(
    widgetType,
  );
}

function isCategoricalWidget(widgetType: WidgetType): widgetType is CategoricalWidgetType {
  return ['chart/pie', 'chart/funnel', 'treemap', 'sunburst'].includes(widgetType);
}
