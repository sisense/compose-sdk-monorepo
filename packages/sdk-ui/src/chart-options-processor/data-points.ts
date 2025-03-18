import {
  MetadataTypes,
  isNumber as isNumberType,
  isDatetime as isDatetimeType,
  Measure,
} from '@sisense/sdk-data';
import isDate from 'lodash-es/isDate';
import { DataPoint, HighchartsPoint, ScatterDataPoint, BoxplotDataPoint } from '../types';
import { SisenseChartDataPoint } from '../sisense-chart/types';
import {
  BoxplotChartDataOptionsInternal,
  CartesianChartDataOptionsInternal,
  CategoricalChartDataOptionsInternal,
  ChartDataOptionsInternal,
  DataPointEntry,
  RangeChartDataOptionsInternal,
  ScatterChartDataOptionsInternal,
  StyledColumn,
  StyledMeasureColumn,
} from '..';
import {
  applyFormatPlainText,
  getCompleteNumberFormatConfig,
} from './translations/number-format-config';
import { formatDatetimeString } from '@/pivot-table/formatters/header-cell-formatters/header-cell-value-formatter';
import { getDefaultDateFormat } from './translations/axis-section';
import { applyDateFormat } from '@/query/date-formats';
import { getDataOptionGranularity } from '@/chart-data-options/utils';

type FormatterFn = (value: any) => string;

// todo: move all formatters related logic into a single place
function createFormatter(dataOption: StyledColumn | StyledMeasureColumn) {
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
    const dateFormatter = (date: Date, format: string) => applyDateFormat(date, format);
    formatter = (value: Date | string) =>
      formatDatetimeString(isDate(value) ? value.toISOString() : value, dateFormatter, dateFormat);
  }

  return (value?: number | string | Date) => {
    return value === undefined ? '' : formatter(value);
  };
}

export function getDataPointMetadata(
  dataOptionPath: string,
  dataOption: StyledColumn | StyledMeasureColumn,
) {
  return {
    id: dataOptionPath,
    dataOption,
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
      ...getDataPointMetadata(`category.${index}`, item),
      value,
      displayValue: createFormatter(item)(value),
    } as DataPointEntry;
  });

  const hasMultipleValues = dataOptions.y.length >= 2;
  const valueEntries: DataPointEntry[] = dataOptions.y
    .filter((item, index) => !hasMultipleValues || point.series.index === index)
    .flatMap((item) => {
      const value = point.custom?.rawValue;
      return {
        ...getDataPointMetadata(`value.${point.series.index}`, item),
        value,
        displayValue: createFormatter(item)(value),
      } as DataPointEntry;
    });

  const breakByEntries: DataPointEntry[] = dataOptions.breakBy.map((item, index) => {
    const value = point.series?.options.custom?.rawValue?.[0];
    return {
      ...getDataPointMetadata(`breakBy.${index}`, item),
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
      ...getDataPointMetadata(`category.${index}`, item),
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
        const dataOptionPath = `value.${point.series.index}.${
          isLowerBound ? 'lowerBound' : 'upperBound'
        }`;
        const value = isLowerBound ? point.options?.low : point.options?.high;
        return {
          ...getDataPointMetadata(dataOptionPath, boundItem),
          value,
          displayValue: createFormatter(boundItem)(value),
        } as DataPointEntry;
      });
    });

  const breakByEntries: DataPointEntry[] = dataOptions.breakBy.map((item, index) => {
    const value = point.series?.options.custom?.rawValue?.[0];
    return {
      ...getDataPointMetadata(`breakBy.${index}`, item),
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
      ...getDataPointMetadata(`x`, dataOptions.x),
      value,
      // todo: add formatter after fixing scatter option to contain raw value.
      displayValue: value,
    } as DataPointEntry;
  }

  if (dataOptions.y) {
    const value = point.custom.maskedY;
    entries.y = {
      ...getDataPointMetadata(`y`, dataOptions.y),
      value,
      displayValue: value,
    } as DataPointEntry;
  }

  if (dataOptions.breakByPoint) {
    const value = point.custom?.maskedBreakByPoint;
    entries.breakByPoint = {
      ...getDataPointMetadata(`breakByPoint`, dataOptions.breakByPoint),
      value: point.custom?.maskedBreakByPoint,
      displayValue: value,
    } as DataPointEntry;
  }

  if (dataOptions.breakByColor) {
    const value = point.custom?.maskedBreakByColor;
    entries.breakByColor = {
      ...getDataPointMetadata(`breakByColor`, dataOptions.breakByColor),
      value,
      displayValue: value,
    } as DataPointEntry;
  }

  if (dataOptions.size) {
    const value = point.custom.maskedSize;
    entries.size = {
      ...getDataPointMetadata(`size`, dataOptions.size),
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
      ...getDataPointMetadata(`category.${index}`, item),
      value,
      displayValue: createFormatter(item)(value),
    } as DataPointEntry;
  });

  const valueEntries: DataPointEntry[] = dataOptions.y.map((item, index) => {
    const value = point.custom?.rawValue;
    return {
      ...getDataPointMetadata(`value.${index}`, item),
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
      ...getDataPointMetadata(`category.${index}`, item),
      value,
      displayValue: createFormatter(item)(value),
    } as DataPointEntry;
  });

  const hasMultipleValues = dataOptions.y.length >= 2;
  const valueEntries: DataPointEntry[] = dataOptions.y
    .filter((item, index) => !hasMultipleValues || point.series.index === index)
    .map((item, index) => {
      const value = point.custom?.rawValue;
      return {
        ...getDataPointMetadata(`value.${index}`, item),
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
        ...getDataPointMetadata(`category.${index}`, item),
        value,
        // todo: add formatter after fixing formatting on chart UI level. Currently it aligned.
        displayValue: value,
      } as DataPointEntry;
    });

  const hasMultipleValues = dataOptions.y.length >= 2;
  const valueEntries: DataPointEntry[] = dataOptions.y
    .filter((item, index) => !hasMultipleValues || point.series.index === index)
    .map((item, index) => {
      const value = isParent ? point.value : point.custom?.rawValue;
      return {
        ...getDataPointMetadata(`value.${index}`, item),
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
        ...getDataPointMetadata(`value.0.outlier`, dataOptions.outliers!),
        value,
        displayValue: createFormatter(dataOptions.outliers!)(value),
      } as DataPointEntry,
    ];
  } else {
    entries.value = [
      {
        ...getDataPointMetadata(`value.0.boxMin`, dataOptions.boxMin),
        value: point.options.q1!,
        displayValue: createFormatter(dataOptions.boxMin)(point.options.q1),
      },
      {
        ...getDataPointMetadata(`value.0.boxMedian`, dataOptions.boxMedian),
        value: point.options.median!,
        displayValue: createFormatter(dataOptions.boxMedian)(point.options.median),
      },
      {
        ...getDataPointMetadata(`value.0.boxMax`, dataOptions.boxMax),
        value: point.options.q3!,
        displayValue: createFormatter(dataOptions.boxMax)(point.options.q3),
      },
      {
        ...getDataPointMetadata(`value.0.whiskerMin`, dataOptions.whiskerMin),
        value: point.options.low!,
        displayValue: createFormatter(dataOptions.whiskerMin)(point.options.low),
      },
      {
        ...getDataPointMetadata(`value.0.whiskerMax`, dataOptions.whiskerMax),
        value: point.options.high!,
        displayValue: createFormatter(dataOptions.whiskerMax)(point.options.high),
      },
    ];
  }

  if (dataOptions.category) {
    const value = point.custom.xValue?.[0];
    entries.category = [
      {
        ...getDataPointMetadata(`category.0`, dataOptions.category),
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
    default:
      return getCartesianDataPoint(point, dataOptions as CartesianChartDataOptionsInternal);
  }
}
