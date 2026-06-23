import {
  isDatetime as isDatetimeType,
  isNumber as isNumberType,
  Measure,
  MetadataTypes,
} from '@sisense/sdk-data';
import isDate from 'lodash-es/isDate';

import { formatDateValue } from '@/domains/query-execution/core/date-formats/index.js';
import { SisenseChartDataPoint } from '@/domains/visualizations/components/chart/components/sisense-chart/types';
import { formatDatetimeString } from '@/domains/visualizations/components/pivot-table/formatters/header-cell-formatters/header-cell-value-formatter';
import {
  BoxplotChartDataOptionsInternal,
  CalendarHeatmapChartDataOptionsInternal,
  CartesianChartDataOptionsInternal,
  CategoricalChartDataOptionsInternal,
  ChartDataOptionsInternal,
  RangeChartDataOptionsInternal,
  SankeyChartDataOptionsInternal,
  ScatterChartDataOptionsInternal,
} from '@/domains/visualizations/core/chart-data-options/types';
import { getDataOptionGranularity } from '@/domains/visualizations/core/chart-data-options/utils';
import {
  BoxplotDataPoint,
  CalendarHeatmapDataPoint,
  DataOptionLocation,
  DataPoint,
  DataPointEntry,
  HighchartsPoint,
  ScatterDataPoint,
  StyledColumn,
  StyledMeasureColumn,
} from '@/types';

import { getDefaultDateFormat } from './translations/axis-section.js';
import {
  applyFormatPlainText,
  getCompleteNumberFormatConfig,
} from './translations/number-format-config.js';

type FormatterFn = (value: any) => string;

// todo: move all formatters related logic into a single place
export function createFormatter(dataOption: StyledColumn | StyledMeasureColumn) {
  const type = 'type' in dataOption.column ? dataOption.column.type : 'numeric';
  let formatter: FormatterFn = (value: number | string | Date) => `${value}`;

  if (isNumberType(type)) {
    const numberFormatConfig = getCompleteNumberFormatConfig(
      dataOption && 'numberFormatConfig' in dataOption ? dataOption.numberFormatConfig : undefined,
    );
    formatter = (value: number | string) =>
      applyFormatPlainText(numberFormatConfig, parseFloat(`${value}`));
  }

  if (isDatetimeType(type)) {
    const dateFormat =
      (dataOption as StyledColumn).dateFormat ||
      getDefaultDateFormat(getDataOptionGranularity(dataOption as StyledColumn));
    // todo: connect "app?.settings.locale" and "app?.settings.dateConfig" configurations
    const dateFormatter = (date: Date, format: string) => formatDateValue(date, format);
    formatter = (value: Date | string) =>
      formatDatetimeString(isDate(value) ? value.toISOString() : value, dateFormatter, dateFormat);
  }

  return (value?: number | string | Date) => {
    return value === undefined ? '' : formatter(value);
  };
}

export function getDataPointMetadata(
  dataOption: StyledColumn | StyledMeasureColumn,
  dataOptionLocation?: DataOptionLocation,
) {
  return {
    dataOption,
    ...(dataOptionLocation && { dataOptionLocation }),
    ...(MetadataTypes.isAttribute(dataOption.column) && {
      attribute: dataOption.column,
    }),
    ...(MetadataTypes.isMeasure(dataOption.column) && {
      measure: dataOption.column as Measure,
    }),
  };
}

const getBaseCartesianDataPoint = (point: HighchartsPoint): DataPoint => ({
  value: point.custom?.rawValue,
  categoryValue: point.custom?.xValue?.[0],
  seriesValue: point.series?.options?.custom?.rawValue?.[0],
  categoryDisplayValue: point.name ?? point.category,
});

const getCartesianDataPoint = (
  point: HighchartsPoint,
  dataOptions: CartesianChartDataOptionsInternal,
): DataPoint => {
  const categoryEntries: DataPointEntry[] = dataOptions.x.map((item, index) => {
    const value = point.custom?.xValue?.[index];
    return {
      ...getDataPointMetadata(item),
      value,
      displayValue: createFormatter(item)(value),
    } as DataPointEntry;
  });

  const hasMultipleValues = dataOptions.y.length >= 2;
  const valueEntries: DataPointEntry[] = dataOptions.y
    .filter((item, index) => !hasMultipleValues || point.series.index === index)
    .flatMap((item) => {
      const value = point.custom.rawValue;
      return {
        ...getDataPointMetadata(item),
        value,
        displayValue: createFormatter(item)(value),
      };
    });

  const breakByEntries: DataPointEntry[] = dataOptions.breakBy.map((item) => {
    const value = point.series?.options.custom?.rawValue?.[0];
    return {
      ...getDataPointMetadata(item),
      value,
      displayValue: createFormatter(item)(value),
    } as DataPointEntry;
  });

  const entries = {
    category: categoryEntries,
    value: valueEntries,
    breakBy: breakByEntries,
  };

  return {
    ...getBaseCartesianDataPoint(point),
    entries,
  };
};

const getRangeDataPoint = (
  point: HighchartsPoint,
  dataOptions: RangeChartDataOptionsInternal,
): DataPoint => {
  const categoryEntries: DataPointEntry[] = dataOptions.x.map((item, index) => {
    const value = point.custom?.xValue?.[index];
    return {
      ...getDataPointMetadata(item),
      value,
      displayValue: createFormatter(item)(value),
    } as DataPointEntry;
  });

  const hasMultipleValues = dataOptions.rangeValues.length >= 2;
  const valueEntries: DataPointEntry[] = dataOptions.rangeValues
    .filter((item, index) => !hasMultipleValues || point.series.index === index)
    .flatMap((item) => {
      return item.map((boundItem, boundIndex) => {
        const isLowerBound = boundIndex === 0;
        const value = isLowerBound ? point.options?.low : point.options?.high;
        return {
          ...getDataPointMetadata(boundItem),
          value,
          displayValue: createFormatter(boundItem)(value),
        } as DataPointEntry;
      });
    });

  const breakByEntries: DataPointEntry[] = dataOptions.breakBy.map((item) => {
    const value = point.series?.options.custom?.rawValue?.[0];
    return {
      ...getDataPointMetadata(item),
      value,
      displayValue: createFormatter(item)(value),
    } as DataPointEntry;
  });

  const entries = {
    category: categoryEntries,
    value: valueEntries,
    breakBy: breakByEntries,
  };

  return {
    ...getBaseCartesianDataPoint(point),
    entries,
  };
};

const getScatterDataPoint = (
  point: HighchartsPoint,
  dataOptions: ScatterChartDataOptionsInternal,
): ScatterDataPoint => {
  const entries: NonNullable<ScatterDataPoint['entries']> = {};

  if (dataOptions.x) {
    const value = point.custom.maskedX;
    entries.x = {
      ...getDataPointMetadata(dataOptions.x),
      value,
      // todo: add formatter after fixing scatter option to contain raw value.
      displayValue: value,
    } as DataPointEntry;
  }

  if (dataOptions.y) {
    const value = point.custom.maskedY;
    entries.y = {
      ...getDataPointMetadata(dataOptions.y),
      value,
      displayValue: value,
    } as DataPointEntry;
  }

  if (dataOptions.breakByPoint) {
    const value = point.custom?.maskedBreakByPoint;
    entries.breakByPoint = {
      ...getDataPointMetadata(dataOptions.breakByPoint),
      value: point.custom?.maskedBreakByPoint,
      displayValue: value,
    } as DataPointEntry;
  }

  if (dataOptions.breakByColor) {
    const value = point.custom?.maskedBreakByColor;
    entries.breakByColor = {
      ...getDataPointMetadata(dataOptions.breakByColor),
      value,
      displayValue: value,
    } as DataPointEntry;
  }

  if (dataOptions.size) {
    const value = point.custom.maskedSize;
    entries.size = {
      ...getDataPointMetadata(dataOptions.size),
      value,
      displayValue: value,
    } as DataPointEntry;
  }

  return {
    x: point.x,
    y: point.y,
    size: point.z,
    breakByPoint: point.custom?.maskedBreakByPoint,
    breakByColor: point.custom?.maskedBreakByColor,
    entries,
  };
};

const getFunnelDataPoint = (
  point: HighchartsPoint,
  dataOptions: CategoricalChartDataOptionsInternal,
): DataPoint => {
  const categoryEntries: DataPointEntry[] = dataOptions.breakBy.map((item, index) => {
    const value = point.custom?.xValue?.[index];
    return {
      ...getDataPointMetadata(item),
      value,
      displayValue: createFormatter(item)(value),
    } as DataPointEntry;
  });

  const valueEntries: DataPointEntry[] = dataOptions.y.map((item) => {
    const value = point.custom?.rawValue;
    return {
      ...getDataPointMetadata(item),
      value,
      displayValue: createFormatter(item)(value),
    } as DataPointEntry;
  });

  const entries = {
    category: categoryEntries,
    value: valueEntries,
  };

  return {
    value: point.options.custom.number1,
    categoryValue: point.options.name,
    categoryDisplayValue: point.name,
    entries,
  };
};

const getPieDataPoint = (
  point: HighchartsPoint,
  dataOptions: CategoricalChartDataOptionsInternal,
): DataPoint => {
  const categoryEntries: DataPointEntry[] = dataOptions.breakBy.map((item, index) => {
    const value = point.custom?.xValue?.[index];
    return {
      ...getDataPointMetadata(item),
      value,
      displayValue: createFormatter(item)(value),
    } as DataPointEntry;
  });

  const hasMultipleValues = dataOptions.y.length >= 2;
  const valueEntries: DataPointEntry[] = dataOptions.y
    .filter((item, index) => !hasMultipleValues || point.series.index === index)
    .map((item) => {
      const value = point.custom?.rawValue;
      return {
        ...getDataPointMetadata(item),
        value,
        displayValue: createFormatter(item)(value),
      } as DataPointEntry;
    });

  const entries = {
    category: categoryEntries,
    value: valueEntries,
  };

  return {
    ...getBaseCartesianDataPoint(point),
    entries,
  };
};

const getTreemapDataPoint = (
  point: HighchartsPoint,
  dataOptions: CategoricalChartDataOptionsInternal,
): DataPoint => {
  const pointLevel = point.options.custom.level!;
  const isParent = pointLevel !== point.options.custom.levelsCount;

  const categoryEntries: DataPointEntry[] = dataOptions.breakBy
    .slice(0, pointLevel)
    .map((item, index) => {
      const value = isParent ? point.custom?.rawValues?.[index] : point.custom?.xValue?.[index];
      return {
        ...getDataPointMetadata(item),
        value,
        // todo: add formatter after fixing formatting on chart UI level. Currently it aligned.
        displayValue: value,
      } as DataPointEntry;
    });

  const hasMultipleValues = dataOptions.y.length >= 2;
  const valueEntries: DataPointEntry[] = dataOptions.y
    .filter((item, index) => !hasMultipleValues || point.series.index === index)
    .map((item) => {
      const value = isParent ? point.value : point.custom?.rawValue;
      return {
        ...getDataPointMetadata(item),
        value,
        displayValue: createFormatter(item)(value),
      } as DataPointEntry;
    });

  const entries = {
    category: categoryEntries,
    value: valueEntries,
  };

  return {
    ...getBaseCartesianDataPoint(point),
    entries,
  };
};

const getBoxplotDataPoint = (
  point: HighchartsPoint,
  dataOptions: BoxplotChartDataOptionsInternal,
): BoxplotDataPoint => {
  const isOutlierPoint = point.series.type === 'scatter';
  const entries = {} as NonNullable<BoxplotDataPoint['entries']>;

  if (isOutlierPoint) {
    const value = point.options.y;
    entries.value = [
      {
        ...getDataPointMetadata(dataOptions.outliers!),
        value,
        displayValue: createFormatter(dataOptions.outliers!)(value),
      } as DataPointEntry,
    ];
  } else {
    const toValueEntry = (
      option: StyledMeasureColumn | undefined,
      raw: number | undefined,
    ): DataPointEntry | undefined =>
      option
        ? ({
            ...getDataPointMetadata(option),
            value: raw,
            displayValue: createFormatter(option)(raw),
          } as DataPointEntry)
        : undefined;

    entries.value = [
      toValueEntry(dataOptions.boxMin, point.options.q1),
      toValueEntry(dataOptions.boxMedian, point.options.median),
      toValueEntry(dataOptions.boxMax, point.options.q3),
      toValueEntry(dataOptions.whiskerMin, point.options.low),
      toValueEntry(dataOptions.whiskerMax, point.options.high),
    ].filter((e): e is DataPointEntry => e !== undefined);
  }

  if (dataOptions.category) {
    const value = point.custom.xValue?.[0];
    entries.category = [
      {
        ...getDataPointMetadata(dataOptions.category),
        value,
        displayValue: createFormatter(dataOptions.category)(value),
      } as DataPointEntry,
    ];
  }

  return {
    boxMin: point.options.q1,
    boxMedian: point.options.median,
    boxMax: point.options.q3,
    whiskerMin: point.options.low,
    whiskerMax: point.options.high,
    outlier: point.options.y,
    categoryValue: point.category,
    categoryDisplayValue: point.category,
    entries,
  };
};

const getCalendarHeatmapDataPoint = (
  point: HighchartsPoint,
  dataOptions: CalendarHeatmapChartDataOptionsInternal,
): CalendarHeatmapDataPoint => {
  const date = new Date(point.options.date!);
  const dateString = point.options.dateString!;
  const value = point.options.value!;

  const dateEntry: DataPointEntry = {
    ...getDataPointMetadata(dataOptions.date),
    value: dateString,
    displayValue: createFormatter(dataOptions.date)(date),
  };

  const hasValue = typeof value === 'number';
  const valueEntry: DataPointEntry | undefined =
    dataOptions.value && hasValue
      ? {
          ...getDataPointMetadata(dataOptions.value),
          value: typeof value === 'number' ? value : 0,
          displayValue: createFormatter(dataOptions.value)(value),
        }
      : undefined;

  return {
    entries: {
      date: dateEntry,
      value: valueEntry,
    },
  };
};

/** Highcharts Sankey point fields not present on the base HighchartsPoint type. */
type SankeyHighchartsPoint = HighchartsPoint & {
  isNode?: boolean;
  /** 0-based stage index within the diagram. */
  column?: number;
  id?: string;
  sum?: number;
  weight?: number;
  options?: { custom?: { rawValue?: unknown } };
  fromNode?: {
    name?: string;
    id?: string;
    column?: number;
    options?: { custom?: { rawValue?: unknown } };
  };
  toNode?: {
    name?: string;
    id?: string;
    column?: number;
    options?: { custom?: { rawValue?: unknown } };
  };
};

/**
 * Returns a DataPoint for a Sankey chart click event.
 *
 * A Highcharts Sankey point is either a node (isNode=true, with .id/.name/.sum)
 * or a link (isNode=false/undefined, with .fromNode/.toNode/.weight).
 * We map the clicked node name to a category entry so callers can build filters.
 */
const getSankeyDataPoint = (
  point: HighchartsPoint,
  dataOptions: SankeyChartDataOptionsInternal,
): DataPoint => {
  const p = point as SankeyHighchartsPoint;
  const isNode = Boolean(p.isNode);

  if (isNode) {
    // p.name is the human-readable display label set from SankeyNode.name.
    // p.id carries the column-prefixed unique ID (e.g. "2__Unspecified"); don't expose that.
    const nodeName: string = p.name ?? p.id ?? '';
    // Highcharts sets `point.column` to the 0-based stage index of the node in the diagram.
    // Use it to select exactly the matching category column so callers get a precise attribute.
    const columnIndex: number = typeof p.column === 'number' ? p.column : 0;
    const matchingCategory = dataOptions.category[columnIndex] ?? dataOptions.category[0];
    // Use the raw value stored in node custom data when available (e.g. date timestamps).
    const rawValue: string | number =
      typeof p.options?.custom?.rawValue === 'string' ||
      typeof p.options?.custom?.rawValue === 'number'
        ? p.options.custom.rawValue
        : nodeName;
    const categoryEntries: DataPointEntry[] = [
      {
        ...getDataPointMetadata(matchingCategory),
        value: rawValue,
        displayValue: nodeName,
      } as DataPointEntry,
    ];
    const normalizedSum = p.sum ?? 0;
    const valueEntry: DataPointEntry = {
      ...getDataPointMetadata(dataOptions.value),
      value: normalizedSum,
      displayValue: createFormatter(dataOptions.value)(normalizedSum),
    };
    return {
      value: normalizedSum,
      categoryValue: rawValue,
      categoryDisplayValue: nodeName,
      entries: {
        category: categoryEntries,
        value: [valueEntry],
      },
    };
  }

  // Link point
  const fromName: string = p.fromNode?.name ?? p.fromNode?.id ?? '';
  const toName: string = p.toNode?.name ?? p.toNode?.id ?? '';
  const weight: number = p.weight ?? 0;
  const fromColumn: number = typeof p.fromNode?.column === 'number' ? p.fromNode.column : 0;
  const toColumn: number = typeof p.toNode?.column === 'number' ? p.toNode.column : fromColumn + 1;
  const fromCategory = dataOptions.category[fromColumn] ?? dataOptions.category[0];
  const toCategory =
    dataOptions.category[toColumn] ?? dataOptions.category[dataOptions.category.length - 1];
  const fromRaw: string | number =
    typeof p.fromNode?.options?.custom?.rawValue === 'string' ||
    typeof p.fromNode?.options?.custom?.rawValue === 'number'
      ? p.fromNode.options.custom.rawValue
      : fromName;
  const toRaw: string | number =
    typeof p.toNode?.options?.custom?.rawValue === 'string' ||
    typeof p.toNode?.options?.custom?.rawValue === 'number'
      ? p.toNode.options.custom.rawValue
      : toName;
  return {
    value: weight,
    categoryValue: fromName,
    categoryDisplayValue: `${fromName} → ${toName}`,
    entries: {
      category: [
        { ...getDataPointMetadata(fromCategory), value: fromRaw, displayValue: fromName },
        { ...getDataPointMetadata(toCategory), value: toRaw, displayValue: toName },
      ],
      value: [
        {
          ...getDataPointMetadata(dataOptions.value),
          value: weight,
          displayValue: createFormatter(dataOptions.value)(weight),
        },
      ],
    },
  };
};

export function getDataPoint(
  point: HighchartsPoint,
  dataOptions: ChartDataOptionsInternal,
): SisenseChartDataPoint {
  switch (point.series.chart.options.chart.type) {
    case 'bubble':
    case 'scatter':
      return getScatterDataPoint(point, dataOptions as ScatterChartDataOptionsInternal);
    case 'funnel':
      return getFunnelDataPoint(point, dataOptions as CategoricalChartDataOptionsInternal);
    case 'pie':
      return getPieDataPoint(point, dataOptions as CategoricalChartDataOptionsInternal);
    case 'treemap':
    case 'sunburst':
      return getTreemapDataPoint(point, dataOptions as CategoricalChartDataOptionsInternal);
    case 'boxplot':
      return getBoxplotDataPoint(point, dataOptions as BoxplotChartDataOptionsInternal);
    case 'arearange':
      return getRangeDataPoint(point, dataOptions as RangeChartDataOptionsInternal);
    case 'heatmap':
      return getCalendarHeatmapDataPoint(
        point,
        dataOptions as CalendarHeatmapChartDataOptionsInternal,
      );
    case 'sankey':
      return getSankeyDataPoint(point, dataOptions as SankeyChartDataOptionsInternal);
    default:
      return getCartesianDataPoint(point, dataOptions as CartesianChartDataOptionsInternal);
  }
}
