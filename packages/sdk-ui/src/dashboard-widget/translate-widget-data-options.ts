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
  createFilterFromJaql,
  PivotJaql,
  Attribute,
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
  isPivotWidget,
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
import findKey from 'lodash/findKey';

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
      thousandSeparator: numberFormat.number?.separated,
      prefix: numberFormat.currency?.position === CurrencyPosition.PRE,
      symbol: numberFormat.currency?.symbol,
      name: getNumberFormatName(numberFormat),
    } as NumberFormatConfig;
  }

  return null;
}

export function createDataColumn(item: PanelItem, customPaletteColors?: Color[]) {
  const element = createDimensionalElementFromJaql(item.jaql, item.format);
  const sortType = getSortType(item.jaql.sort ?? item.categoriesSorting);
  const numberFormatConfig = extractNumberFormat(item);
  const subtotal = item.format?.subtotal;

  if (MetadataTypes.isMeasure(element)) {
    const color = createValueColorOptions(item.format?.color, customPaletteColors);
    const showOnRightAxis = item.y2;
    const chartType = item.singleSeriesType;
    const totalsCalculation = 'subtotalAgg' in item.jaql && item.jaql.subtotalAgg;
    const dataBars = item.format?.databars;

    return {
      column: element,
      ...(color && { color }),
      ...(showOnRightAxis && { showOnRightAxis }),
      ...(sortType && { sortType }),
      ...(chartType && { chartType }),
      ...(numberFormatConfig && { numberFormatConfig }),
      ...(totalsCalculation && { totalsCalculation }),
      ...(dataBars && { dataBars }),
    } as StyledMeasureColumn;
  }

  return {
    column: element,
    isColored: item.isColored ?? false,
    ...(sortType && { sortType }),
    ...(numberFormatConfig && { numberFormatConfig }),
    ...(subtotal && { includeSubTotals: subtotal }),
  } as StyledColumn;
}

/** @internal */
export const createDataOptionsFromPanels = (panels: Panel[], variantColors: Color[]) => {
  const dataOptions: { [key: string]: any[] } = {};
  panels.forEach((panel) => {
    if (panel.name !== 'filters') {
      dataOptions[panel.name.toLowerCase()] = createColumnsFromPanelItems(
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
 * TEMPORARY WORKAROUND UNTIL PIVOT TABLE IS FULLY AVAILABLE
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
  const color: [StyledMeasureColumn] = [
    createColumnsFromPanelItems<StyledMeasureColumn>(panels, 'color', paletteColors)[0],
  ];

  return {
    geo,
    color,
  };
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
  if (isPivotWidget(widgetType)) {
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
