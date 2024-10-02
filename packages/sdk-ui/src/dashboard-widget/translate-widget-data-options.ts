import mapValues from 'lodash-es/mapValues';
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
  createFilterFromJaql,
  PivotJaql,
  Attribute,
  ForecastFormulaOptions,
  TrendFormulaOptions,
  JaqlDataSource,
} from '@sisense/sdk-data';
import {
  CartesianChartDataOptions,
  CategoricalChartDataOptions,
  ScatterChartDataOptions,
  IndicatorChartDataOptions,
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
  WidgetStyle,
  BoxplotWidgetStyle,
  PivotWidgetStyle,
} from './types';
import {
  createValueToColorMap,
  createValueColorOptions,
  createValueToColorMultiColumnsMap,
} from './translate-panel-color-format';
import {
  getEnabledPanelItems,
  getSortType,
  getRootPanelItem,
  isTableWidget,
  isPivotTableWidget,
} from './utils';
import {
  AreamapChartDataOptions,
  BoxplotChartDataOptions,
  PivotTableDataOptions,
  ScattermapChartDataOptions,
  TableDataOptions,
} from '../chart-data-options/types';
import { WidgetDataOptions } from '../models';
import { TranslatableError } from '../translation/translatable-error';
import findKey from 'lodash-es/findKey';
import camelCase from 'lodash-es/camelCase';

export function createDimensionalElementFromJaql(jaql: Jaql, format?: PanelItem['format']) {
  const isFormulaJaql = 'formula' in jaql;

  const dataSource = 'datasource' in jaql ? jaql.datasource : undefined;

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
        (format?.mask as DatetimeMask)?.[jaql.level!] ??
          (format?.mask as DatetimeMask)?.dateAndTime,
        undefined,
        sort,
      )
    : new DimensionalAttribute(jaql.title, jaql.dim, attributeType, undefined, sort, dataSource);

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

function getNumberFormatName(mask: NumericMask) {
  if (mask.percent || mask.type === 'percent') {
    return 'Percent';
  } else if (mask.currency) {
    return 'Currency';
  } else {
    return 'Numbers';
  }
}

function getNumberFormatDecimalScale(mask: NumericMask): number | 'auto' {
  if (mask.decimals !== undefined && mask.decimals !== 'auto') {
    return typeof mask.decimals === 'string' ? Number.parseFloat(mask.decimals) : mask.decimals;
  }
  return 'auto';
}

function extractNumberFormat(item: PanelItem): NumberFormatConfig | null {
  const isNumeric = (item.jaql as BaseJaql).datatype === 'numeric' || 'context' in item.jaql;
  const numberFormat = item.format?.mask as NumericMask;

  if (isNumeric && numberFormat) {
    return {
      decimalScale: getNumberFormatDecimalScale(numberFormat),
      kilo: numberFormat.abbreviations?.k,
      million: numberFormat.abbreviations?.m,
      billion: numberFormat.abbreviations?.b,
      trillion: numberFormat.abbreviations?.t,
      thousandSeparator: numberFormat.number?.separated ?? numberFormat.separated,
      prefix: numberFormat.currency?.position === CurrencyPosition.PRE,
      symbol: numberFormat.currency?.symbol,
      name: getNumberFormatName(numberFormat),
    } as NumberFormatConfig;
  }

  return null;
}

/**
 * Temporary internal flag to enable/disable statistical models in the data options.
 *
 * @internal
 */
const ENABLE_STATISTICAL_MODELS = false;

/** @internal */
export function applyStatisticalModels(
  dataOption: StyledMeasureColumn,
  statisticalModels?: {
    forecast?: {
      isEnabled: boolean;
      isViewerDisabled: boolean;
      confidence: number;
      forecastPeriod: number;
    };
    trend?: {
      isEnabled: boolean;
      isViewerDisabled: boolean;
      trendType: string;
    };
  },
): StyledMeasureColumn {
  if (!statisticalModels || !ENABLE_STATISTICAL_MODELS) return dataOption;

  const { forecast, trend } = statisticalModels;
  let newDataOption = { ...dataOption }; // Create a shallow copy to avoid mutation

  if (forecast && !forecast.isViewerDisabled && forecast.isEnabled) {
    newDataOption = {
      ...newDataOption,
      forecast: {
        confidenceInterval: forecast.confidence / 100,
        forecastHorizon: forecast.forecastPeriod,
        modelType: 'auto',
      } as ForecastFormulaOptions,
    };
  }

  if (trend && !trend.isViewerDisabled && trend.isEnabled) {
    newDataOption = {
      ...newDataOption,
      trend: {
        modelType: trend.trendType as TrendFormulaOptions['modelType'],
      },
    };
  }

  return newDataOption;
}

export function createDataColumn(item: PanelItem, customPaletteColors?: Color[]) {
  const element = createDimensionalElementFromJaql(item.jaql, item.format);
  const sortType = getSortType(item.jaql.sort ?? item.categoriesSorting);
  const numberFormatConfig = extractNumberFormat(item);
  const subtotal = item.format?.subtotal;
  const width = item.format?.width;
  let color = createValueColorOptions(item.format?.color, customPaletteColors);

  // Hande specific case in Fusion dashboard model
  // Sunburst palette index stores that way
  if (!color && !item.format?.color && item.format && 'colorIndex' in item.format) {
    color = createValueColorOptions(
      {
        type: 'color',
        colorIndex: item.format.colorIndex,
      },
      customPaletteColors,
    );
  }

  if (MetadataTypes.isMeasure(element)) {
    const showOnRightAxis = item.y2;
    const chartType = item.singleSeriesType;
    const totalsCalculation = 'subtotalAgg' in item.jaql && item.jaql.subtotalAgg;
    const dataBars = item.format?.databars;

    const dataOption = {
      column: element,
      ...(color && { color }),
      ...(showOnRightAxis && { showOnRightAxis }),
      ...(sortType && { sortType }),
      ...(chartType && { chartType }),
      ...(numberFormatConfig && { numberFormatConfig }),
      ...(totalsCalculation && { totalsCalculation }),
      ...(dataBars && { dataBars }),
      ...(width && { width }),
    } as StyledMeasureColumn;

    return applyStatisticalModels(dataOption, item.statisticalModels);
  }

  return {
    column: element,
    isColored: item.isColored ?? false,
    ...(sortType && { sortType }),
    ...(numberFormatConfig && { numberFormatConfig }),
    ...(subtotal && { includeSubTotals: subtotal }),
    ...(width && { width }),
    ...(color && { color }),
  } as StyledColumn;
}

/** @internal */
export const createDataOptionsFromPanels = (panels: Panel[], variantColors: Color[]) => {
  const dataOptions: { [key: string]: any[] } = {};
  panels.forEach((panel) => {
    if (panel.name !== 'filters') {
      dataOptions[camelCase(panel.name)] = createColumnsFromPanelItems(
        panels,
        panel.name,
        variantColors,
      );
    }
  });
  return dataOptions;
};

type PanelItemCallback<ProcessResult> = (
  item: PanelItem,
  index: number,
  items: PanelItem[],
) => ProcessResult;

function processPanelItems<ProcessResult>(
  panels: Panel[],
  panelName: string,
  callback: PanelItemCallback<ProcessResult>,
) {
  return getEnabledPanelItems(panels, panelName).map(getRootPanelItem).map(callback);
}

export function createColumnsFromPanelItems<ColumnType = StyledColumn | StyledMeasureColumn>(
  panels: Panel[],
  panelName: string,
  customPaletteColors?: Color[],
) {
  return processPanelItems(
    panels,
    panelName,
    (item) => createDataColumn(item, customPaletteColors) as ColumnType,
  );
}

function extractCartesianChartDataOptions(
  panels: Panel[],
  widgetType: CartesianWidgetType,
  paletteColors?: Color[],
): CartesianChartDataOptions {
  const widgetTypesWithXAxis: WidgetType[] = ['chart/line', 'chart/area'];
  const categoriesPanelName = widgetTypesWithXAxis.includes(widgetType) ? 'x-axis' : 'categories';
  const category = createColumnsFromPanelItems<StyledColumn>(
    panels,
    categoriesPanelName,
    paletteColors,
  );
  const value = createColumnsFromPanelItems<StyledMeasureColumn>(panels, 'values', paletteColors);
  const breakBy = createColumnsFromPanelItems<StyledColumn>(panels, 'break by', paletteColors);
  const membersFormat = getEnabledPanelItems(panels, 'break by')[0]?.format?.members;
  const seriesToColorMap = membersFormat && createValueToColorMap(membersFormat);

  return {
    category,
    value,
    breakBy,
    ...(seriesToColorMap && { seriesToColorMap }),
  };
}

function extractCategoricalChartDataOptions(
  widgetType: WidgetType,
  panels: Panel[],
  customPaletteColors?: Color[],
): CategoricalChartDataOptions {
  const category = createColumnsFromPanelItems<StyledColumn>(
    panels,
    'categories',
    customPaletteColors,
  );
  const value = createColumnsFromPanelItems<StyledMeasureColumn>(
    panels,
    'values',
    customPaletteColors,
  );
  const size = createColumnsFromPanelItems<StyledMeasureColumn>(
    panels,
    'size',
    customPaletteColors,
  );
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
    category,
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
  const [breakByPoint] = createColumnsFromPanelItems<StyledColumn>(panels, 'point', paletteColors);
  const [breakByColor] = createColumnsFromPanelItems(panels, 'Break By / Color', paletteColors);
  const [size] = createColumnsFromPanelItems<StyledMeasureColumn>(panels, 'size', paletteColors);
  const membersFormat = getEnabledPanelItems(panels, 'Break By / Color')[0]?.format?.members;
  const seriesToColorMap = membersFormat && createValueToColorMap(membersFormat);

  return {
    x,
    y,
    breakByPoint,
    breakByColor,
    size,
    ...(seriesToColorMap && { seriesToColorMap }),
  };
}

function extractIndicatorChartDataOptions(
  panels: Panel[],
  paletteColors?: Color[],
): IndicatorChartDataOptions {
  const value = createColumnsFromPanelItems<StyledMeasureColumn>(panels, 'value', paletteColors);
  const secondary = createColumnsFromPanelItems<StyledMeasureColumn>(
    panels,
    'secondary',
    paletteColors,
  );
  const min = createColumnsFromPanelItems<StyledMeasureColumn>(panels, 'min', paletteColors);
  const max = createColumnsFromPanelItems<StyledMeasureColumn>(panels, 'max', paletteColors);

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

/**
 * Translate JAQL of rows, columns, and values of a pivot table into columns of a regular table.
 * Essentially, columns are treated as rows.
 *
 * @param panels - JAQL panels
 * @param paletteColors - palette colors
 * @returns - table data options
 */

function extractPivotTableChartDataOptions(
  panels: Panel[],
  style: PivotWidgetStyle,
  paletteColors?: Color[],
): PivotTableDataOptions {
  let valuesSortDetails: PivotJaql['sortDetails'];
  const valuesFieldIndexesMapping: Record<number, number> = {};

  // process columns
  const columns = createColumnsFromPanelItems(panels, 'columns', paletteColors);

  // process values
  const values = processPanelItems(panels, 'values', (item, index) => {
    const { field, jaql } = item;
    const { sortDetails } = jaql as PivotJaql;

    if (sortDetails) {
      // save measure sorting for later translation into sorting for the last row
      valuesSortDetails = sortDetails;
    }

    if (field) {
      // collect mapping of existing "field.index" to new index in "values" array
      valuesFieldIndexesMapping[field.index] = index;
    }

    return createDataColumn(item, paletteColors);
  });

  // process rows
  const rows = processPanelItems(panels, 'rows', (item, index, items) => {
    const isLastRow = index === items.length - 1;
    let { sortDetails } = item?.jaql as PivotJaql;

    const row = createDataColumn(item, paletteColors);
    // remove attribute inner sorting
    row.column = (row.column as Attribute).sort(Sort.None);

    if (isLastRow && valuesSortDetails) {
      sortDetails = valuesSortDetails;
    }

    const isSortedByMeasure = sortDetails?.field !== item.field?.index;

    if (sortDetails) {
      row.sortType = {
        direction: getSortType(sortDetails.dir),
        ...(isSortedByMeasure && {
          by: {
            valuesIndex: valuesFieldIndexesMapping[sortDetails.field],
            columnsMembersPath: Object.values(sortDetails.measurePath || {}),
          },
        }),
      };
    }

    return row;
  });

  return {
    rows,
    columns,
    values,
    grandTotals: {
      rows: style.rowsGrandTotal,
      columns: style.columnsGrandTotal,
    },
  } as PivotTableDataOptions;
}

export function extractBoxplotBoxType(style: BoxplotWidgetStyle) {
  const widgetBoxTypesMapping = {
    'whisker/iqr': 'iqr',
    'whisker/extremums': 'extremums',
    'whisker/deviation': 'standardDeviation',
  } as const;
  const widgetBoxType = findKey(
    style.whisker,
    (selected) => selected,
  ) as keyof BoxplotWidgetStyle['whisker'];
  return widgetBoxTypesMapping[widgetBoxType];
}

function extractBoxplotChartDataOptions(
  panels: Panel[],
  style: BoxplotWidgetStyle,
  paletteColors?: Color[],
): BoxplotChartDataOptions {
  const category = createColumnsFromPanelItems(panels, 'category', paletteColors) as [StyledColumn];
  const value = createColumnsFromPanelItems(panels, 'value', paletteColors) as [StyledColumn];
  const boxType = extractBoxplotBoxType(style);
  const outliersEnabled = style.outliers.enabled;

  return {
    category,
    value,
    boxType,
    outliersEnabled,
  };
}

function createGeoColumnsFromPanelItems(panels: Panel[], customPaletteColors?: Color[]) {
  return getEnabledPanelItems(panels, 'geo')
    .map(getRootPanelItem)
    .map((item) => {
      const column = createDataColumn(item, customPaletteColors) as StyledColumn;

      if ('geoLevel' in item) {
        return {
          ...column,
          level: item.geoLevel,
        } as StyledColumn;
      }

      return column;
    });
}

function extractScattermapChartDataOptions(
  panels: Panel[],
  paletteColors?: Color[],
): ScattermapChartDataOptions {
  const geo = createGeoColumnsFromPanelItems(panels, paletteColors);
  const size = createColumnsFromPanelItems(panels, 'size', paletteColors)[0] as StyledMeasureColumn;
  const colorBy = createColumnsFromPanelItems(
    panels,
    'color',
    paletteColors,
  )[0] as StyledMeasureColumn;
  const details = createColumnsFromPanelItems(panels, 'details', paletteColors)[0];

  return {
    geo,
    size,
    colorBy,
    details,
  };
}

function extractAreamapChartDataOptions(
  panels: Panel[],
  paletteColors?: Color[],
): AreamapChartDataOptions {
  const geo: [StyledColumn] = [
    createColumnsFromPanelItems<StyledColumn>(panels, 'geo', paletteColors)[0],
  ];
  const color = createColumnsFromPanelItems<StyledMeasureColumn>(panels, 'color', paletteColors)[0];

  return {
    geo,
    ...(color && { color: [color] }),
  };
}

/**
 * Recursive helper function for attachDataSourceToPanels
 */
function attachDataSourceToPanelItem(item: PanelItem, dataSource: JaqlDataSource): PanelItem {
  const updatedItem =
    'dim' in item.jaql
      ? {
          ...item,
          jaql: {
            ...item.jaql,
            datasource: dataSource,
          },
        }
      : item;

  const updatedParent = item.parent
    ? attachDataSourceToPanelItem(item.parent, dataSource)
    : undefined;

  const updatedThrough = item.through
    ? attachDataSourceToPanelItem(item.through, dataSource)
    : undefined;

  return {
    ...updatedItem,
    parent: updatedParent,
    through: updatedThrough,
  };
}

/**
 * Attach a data source to all dimensions in the panels.
 * This is to support multi-source dashboards.
 */
export function attachDataSourceToPanels(panels: Panel[], dataSource: JaqlDataSource): Panel[] {
  return panels.map((panel) => {
    return {
      ...panel,
      items: panel.items.map((item) => attachDataSourceToPanelItem(item, dataSource)),
    };
  });
}

export function extractDataOptions(
  widgetType: WidgetType,
  panels: Panel[],
  style: WidgetStyle,
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
  if (isTableWidget(widgetType)) {
    return extractTableChartDataOptions(panels, customPaletteColors);
  }
  if (isPivotTableWidget(widgetType)) {
    return extractPivotTableChartDataOptions(
      panels,
      style as PivotWidgetStyle,
      customPaletteColors,
    );
  }
  if (widgetType === 'chart/boxplot') {
    return extractBoxplotChartDataOptions(panels, style as BoxplotWidgetStyle, customPaletteColors);
  }
  if (widgetType === 'map/scatter') {
    return extractScattermapChartDataOptions(panels, customPaletteColors);
  }
  if (widgetType === 'map/area') {
    return extractAreamapChartDataOptions(panels, customPaletteColors);
  }
  if (widgetType === 'richtexteditor') {
    return {};
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
