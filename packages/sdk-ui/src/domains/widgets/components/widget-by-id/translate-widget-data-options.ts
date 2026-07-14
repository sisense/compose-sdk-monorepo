import {
  BaseJaql,
  createDimensionalElementFromJaql,
  DimensionalAttribute,
  DimensionalCalculatedMeasure,
  getSortType,
  isSortDirection,
  JaqlDataSource,
  MetadataTypes,
  PivotJaql,
  Sort,
} from '@sisense/sdk-data';
import type { SortDirection } from '@sisense/sdk-data';
import camelCase from 'lodash-es/camelCase';
import findKey from 'lodash-es/findKey';

import { WidgetDataOptions } from '@/domains/widgets/widget-model';

import {
  AreamapChartDataOptions,
  BoxplotChartDataOptions,
  CalendarHeatmapChartDataOptions,
  PivotTableDataOptions,
  ScattermapChartDataOptions,
  TableDataOptions,
} from '../../../../domains/visualizations/core/chart-data-options/types.js';
import { TranslatableError } from '../../../../infra/translation/translatable-error.js';
import {
  CartesianChartDataOptions,
  CategoricalChartDataOptions,
  Color,
  IndicatorChartDataOptions,
  NumberFormatConfig,
  SankeyChartDataOptions,
  ScatterChartDataOptions,
  StyledColumn,
  StyledMeasureColumn,
} from '../../../../types.js';
import {
  createPanelColorFormat,
  createValueColorOptions,
  createValueToColorMap,
  createValueToColorMultiColumnsMap,
} from './translate-panel-color-format.js';
import { applyStatisticalModels, createStatisticalModels } from './translate-statistical-models.js';
import {
  BoxplotWidgetStyle,
  CartesianWidgetType,
  CategoricalWidgetType,
  CurrencyPosition,
  DatetimeMask,
  FusionWidgetType,
  NumericMask,
  Panel,
  PanelItem,
  PivotWidgetStyle,
  TableWidgetStyle,
  WidgetStyle,
} from './types.js';
import {
  getEnabledPanelItems,
  getRootPanelItem,
  isPivotTableFusionWidget,
  isTableFusionWidget,
} from './utils.js';

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
  const isNumeric =
    (item.jaql as BaseJaql).datatype === 'numeric' ||
    // count aggregation on a non-numeric field results in a numeric value
    (item.jaql as BaseJaql).agg === 'count' ||
    'context' in item.jaql;
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

function numberFormatConfigToNumericMask(config: NumberFormatConfig): NumericMask {
  return {
    abbreviations: {
      k: config.kilo ?? false,
      m: config.million ?? false,
      b: config.billion ?? false,
      t: config.trillion ?? false,
    },
    decimals: config.decimalScale ?? 'auto',
    ...(config.thousandSeparator !== undefined && {
      number: { separated: config.thousandSeparator },
      separated: config.thousandSeparator,
    }),
    ...(config.name === 'Currency' && {
      currency: {
        symbol: config.symbol ?? '',
        position: config.prefix ? CurrencyPosition.PRE : CurrencyPosition.POST,
      },
    }),
    ...(config.name === 'Percent' && { percent: true, type: 'percent' }),
  };
}

function sortDirectionToJaqlSort(sortType: SortDirection): 'asc' | 'desc' | undefined {
  switch (sortType) {
    case 'sortAsc':
      return 'asc';
    case 'sortDesc':
      return 'desc';
    default:
      return undefined;
  }
}

const extractDatetimeFormat = (item: PanelItem) => {
  const mask = item.format?.mask as DatetimeMask | undefined;
  // Mirror the write path in `createPanelItem`: prefer `dateTimeLevel` over `level`
  // so masks stored under either key round-trip cleanly.
  const jl = item.jaql as { level?: string; dateTimeLevel?: string } | undefined;
  const levelKey = jl?.dateTimeLevel || jl?.level;
  return (
    (levelKey && (mask as Record<string, string> | undefined)?.[levelKey]) || mask?.dateAndTime
  );
};

export function createDataColumn(item: PanelItem, customPaletteColors?: Color[]) {
  const element = createDimensionalElementFromJaql(
    item.jaql,
    extractDatetimeFormat(item),
    item.panel,
  );
  const sortType = getSortType(item.jaql.sort ?? item.categoriesSorting);
  const numberFormatConfig = extractNumberFormat(item);
  const width = item.format?.width;
  // panel is needed only to support break-by columns functionality
  const panel = item.panel === 'columns' && item.panel;
  // Sunburst stores the palette index under `colorIndex` instead of `color`
  const color =
    createValueColorOptions(item.format?.color, customPaletteColors) ??
    (item.format && 'colorIndex' in item.format
      ? createValueColorOptions(
          { type: 'color', colorIndex: item.format.colorIndex },
          customPaletteColors,
        )
      : undefined);

  if (MetadataTypes.isMeasure(element)) {
    const dataBarsColor = createValueColorOptions(item.format?.colorSecond, customPaletteColors);
    const totalsCalculation = 'subtotalAgg' in item.jaql && item.jaql.subtotalAgg;

    const dataOption = {
      column: element,
      ...(color && { color }),
      ...(dataBarsColor && { dataBarsColor }),
      ...(item.y2 && { showOnRightAxis: item.y2 }),
      ...(sortType && { sortType }),
      ...(item.singleSeriesType && { chartType: item.singleSeriesType }),
      ...(numberFormatConfig && { numberFormatConfig }),
      ...(totalsCalculation && { totalsCalculation }),
      ...(item.format?.databars && { dataBars: item.format.databars }),
      ...(width && { width }),
      ...(panel && { panel }),
    } as StyledMeasureColumn;

    return applyStatisticalModels(dataOption, item.statisticalModels);
  }

  return {
    column: element,
    ...(item.isColored && { isColored: true }),
    ...(sortType && { sortType }),
    ...(numberFormatConfig && { numberFormatConfig }),
    ...(item.format?.subtotal && { includeSubTotals: item.format.subtotal }),
    ...(width && { width }),
    ...(color && { color }),
    ...(panel && { panel }),
    ...(item.format?.continuous && { continuous: item.format.continuous }),
  } as StyledColumn;
}

/** @internal */
export function createPanelItem(column: StyledColumn | StyledMeasureColumn): PanelItem {
  const element = column.column;
  const isMeasure = MetadataTypes.isMeasure(element);
  const isAttribute = MetadataTypes.isAttribute(element);
  if (!isMeasure && !isAttribute) {
    throw new TranslatableError('errors.unsupportedDimensionalElement');
  }

  const rawJaql = isMeasure
    ? (element as DimensionalCalculatedMeasure).jaql(true)
    : (element as DimensionalAttribute).jaql(true);
  const baseItem: PanelItem = rawJaql.jaql ? rawJaql : { jaql: rawJaql };

  if (isSortDirection(column.sortType)) {
    const jaqlSort = sortDirectionToJaqlSort(column.sortType);
    if (jaqlSort) baseItem.jaql = { ...baseItem.jaql, sort: jaqlSort } as PanelItem['jaql'];
  }

  // Format fragments shared by attributes and measures.
  const colorFormat = createPanelColorFormat(column.color);
  const formatPatch: NonNullable<PanelItem['format']> = {
    ...(colorFormat && { color: colorFormat }),
    ...(column.numberFormatConfig && {
      mask: numberFormatConfigToNumericMask(column.numberFormatConfig),
    }),
    ...(column.width !== undefined && { width: column.width }),
  };

  if (isMeasure) {
    const measure = column as StyledMeasureColumn;
    const dataBarsColorFormat = createPanelColorFormat(measure.dataBarsColor);

    baseItem.panel = 'measures';
    if (measure.showOnRightAxis) baseItem.y2 = measure.showOnRightAxis;
    if (measure.chartType)
      baseItem.singleSeriesType = measure.chartType as PanelItem['singleSeriesType'];
    if (measure.totalsCalculation) {
      baseItem.jaql = { ...baseItem.jaql, subtotalAgg: measure.totalsCalculation };
    }
    if (measure.dataBars) formatPatch.databars = measure.dataBars;
    if (dataBarsColorFormat) formatPatch.colorSecond = dataBarsColorFormat;

    const statisticalModels = createStatisticalModels(measure);
    if (statisticalModels) baseItem.statisticalModels = statisticalModels;
  } else {
    const attribute = column as StyledColumn & { panel?: string };

    if (attribute.isColored) baseItem.isColored = true;
    if (attribute.panel) baseItem.panel = attribute.panel;
    const geoLevel = narrowGeoLevel(attribute.geoLevel);
    if (geoLevel) baseItem.geoLevel = geoLevel;
    if (attribute.includeSubTotals !== undefined) formatPatch.subtotal = attribute.includeSubTotals;
    if (attribute.continuous !== undefined) formatPatch.continuous = attribute.continuous;

    // Datetime mask uses the jaql level (or `dateTimeLevel`) as the key, matching how
    // `DimensionalLevelAttribute.jaql()` writes `format.mask[level] = <format>`.
    const jaql = baseItem.jaql as { level?: string; dateTimeLevel?: string };
    const datetimeLevelKey = jaql.dateTimeLevel || jaql.level;
    if (attribute.dateFormat && datetimeLevelKey) {
      formatPatch.mask = {
        ...(formatPatch.mask as Partial<DatetimeMask> | undefined),
        [datetimeLevelKey]: attribute.dateFormat,
      } as DatetimeMask;
    }
  }

  if (Object.keys(formatPatch).length > 0) {
    baseItem.format = { ...baseItem.format, ...formatPatch };
  }

  return baseItem;
}

function narrowGeoLevel(level: unknown): 'country' | 'state' | 'city' | undefined {
  return level === 'country' || level === 'state' || level === 'city' ? level : undefined;
}

/** @sisenseInternal */
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

export const createPanelsFromDataOptions = (dataOptions: { [key: string]: any[] }) => {
  return Object.entries(dataOptions).map(([panelName, items]) => {
    return {
      name: panelName,
      items: items.map((item) => ({ jaql: item })),
    };
  });
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
  const widgetTypesWithXAxis: FusionWidgetType[] = ['chart/line', 'chart/area'];
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
  widgetType: FusionWidgetType,
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

function extractSankeyChartDataOptions(
  panels: Panel[],
  paletteColors?: Color[],
): SankeyChartDataOptions {
  const category = createColumnsFromPanelItems<StyledColumn>(panels, 'category', paletteColors);
  const [value] = createColumnsFromPanelItems<StyledMeasureColumn>(panels, 'value', paletteColors);

  return {
    category,
    value,
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

/**
 * Parses column pixel widths from `style.tableState.colResize`.
 *
 * Returns `[]` when `colResize.columns` is missing or its length does not match
 * enabled column panel items. Invalid, non-positive, or non-numeric entries are
 * `undefined` so callers can fall back via `widths[index] ?? column.width`.
 *
 * @param panels - JAQL panels with column definitions
 * @param style - Table widget style
 * @returns Parsed widths in display order, or `[]` on count mismatch
 */
function extractTableColumnWidths(
  panels: Panel[],
  style: TableWidgetStyle,
): (number | undefined)[] {
  const columnCount = getEnabledPanelItems(panels, 'columns').length;
  const rawWidths = style.tableState?.colResize?.columns;
  if (!rawWidths || rawWidths.length !== columnCount) return [];

  return rawWidths.map((rawWidth) => {
    const parsed = Math.round(parseFloat(rawWidth));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  });
}

function extractTableChartDataOptions(
  panels: Panel[],
  style: TableWidgetStyle,
  paletteColors?: Color[],
): TableDataOptions {
  const columns = createColumnsFromPanelItems(panels, 'columns', paletteColors);
  const widths = extractTableColumnWidths(panels, style);

  return {
    columns: columns.map((column, index) => {
      // eslint-disable-next-line security/detect-object-injection
      const width = widths[index] ?? column.width;
      return width === undefined ? column : { ...column, width };
    }),
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

    // remove color formatting if color not set, because otherwise it will be colored with palette color
    if (item.format?.color?.type === 'color' && !item.format?.color?.color) {
      delete item.format.color;
    }

    const dataColumn = createDataColumn(item, paletteColors);

    // By default, we provide defaultColor from palette for conditional coloring, but it's not needed in the case of pivot table
    if (typeof dataColumn.color !== 'string' && dataColumn.color?.type === 'conditional') {
      delete dataColumn.color.defaultColor;
    }

    return dataColumn;
  });

  // process rows
  const rows = processPanelItems(panels, 'rows', (item, index, items) => {
    const isLastRow = index === items.length - 1;
    let { sortDetails } = item?.jaql as PivotJaql;

    const row = createDataColumn(item, paletteColors);
    // remove attribute inner sorting
    if (row.column && MetadataTypes.isAttribute(row.column)) {
      row.column = row.column.sort(Sort.None);
    }

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
      return 'geoLevel' in item ? ({ ...column, geoLevel: item.geoLevel } as StyledColumn) : column;
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
 * Extract data options for calendar heatmap from WidgetDto
 *
 * @param panels - Panels
 * @param paletteColors - Palette colors
 * @returns Calendar heatmap chart data options
 */
function extractCaledarHeatmapChartDataOptions(
  panels: Panel[],
  paletteColors?: Color[],
): CalendarHeatmapChartDataOptions {
  return {
    date: createColumnsFromPanelItems<StyledColumn>(panels, 'date', paletteColors)[0],
    value: createColumnsFromPanelItems<StyledMeasureColumn>(panels, 'color', paletteColors)[0],
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
  fusionWidgetType: FusionWidgetType,
  panels: Panel[],
  style: WidgetStyle,
  customPaletteColors?: Color[],
): WidgetDataOptions {
  if (isCartesianWidget(fusionWidgetType)) {
    return extractCartesianChartDataOptions(panels, fusionWidgetType, customPaletteColors);
  }
  if (isCategoricalWidget(fusionWidgetType)) {
    return extractCategoricalChartDataOptions(fusionWidgetType, panels, customPaletteColors);
  }
  if (fusionWidgetType === 'chart/scatter') {
    return extractScatterChartDataOptions(panels, customPaletteColors);
  }
  if (fusionWidgetType === 'indicator') {
    return extractIndicatorChartDataOptions(panels, customPaletteColors);
  }
  if (fusionWidgetType === 'sankey') {
    return extractSankeyChartDataOptions(panels, customPaletteColors);
  }
  if (isTableFusionWidget(fusionWidgetType)) {
    return extractTableChartDataOptions(panels, style as TableWidgetStyle, customPaletteColors);
  }
  if (isPivotTableFusionWidget(fusionWidgetType)) {
    return extractPivotTableChartDataOptions(
      panels,
      style as PivotWidgetStyle,
      customPaletteColors,
    );
  }
  if (fusionWidgetType === 'chart/boxplot') {
    return extractBoxplotChartDataOptions(panels, style as BoxplotWidgetStyle, customPaletteColors);
  }
  if (fusionWidgetType === 'map/scatter') {
    return extractScattermapChartDataOptions(panels, customPaletteColors);
  }
  if (fusionWidgetType === 'map/area') {
    return extractAreamapChartDataOptions(panels, customPaletteColors);
  }
  if (fusionWidgetType === 'heatmap') {
    return extractCaledarHeatmapChartDataOptions(panels, customPaletteColors);
  }
  if (fusionWidgetType === 'richtexteditor' || fusionWidgetType === 'filter') {
    return {};
  }
  throw new TranslatableError('errors.unsupportedWidgetType', { widgetType: fusionWidgetType });
}

function isCartesianWidget(widgetType: FusionWidgetType): widgetType is CartesianWidgetType {
  return ['chart/line', 'chart/area', 'chart/bar', 'chart/column', 'chart/polar'].includes(
    widgetType,
  );
}

function isCategoricalWidget(widgetType: FusionWidgetType): widgetType is CategoricalWidgetType {
  return ['chart/pie', 'chart/funnel', 'treemap', 'sunburst'].includes(widgetType);
}
