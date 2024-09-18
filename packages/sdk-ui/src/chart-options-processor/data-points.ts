import { MetadataTypes } from '@sisense/sdk-data';
import { DataPoint, HighchartsPoint, ScatterDataPoint, BoxplotDataPoint } from '../types';
import { SisenseChartDataPoint } from '../sisense-chart/types';
import {
  BoxplotChartDataOptionsInternal,
  CartesianChartDataOptionsInternal,
  CategoricalChartDataOptionsInternal,
  Category,
  ChartDataOptionsInternal,
  DataPointEntry,
  RangeChartDataOptionsInternal,
  ScatterChartDataOptionsInternal,
  Value,
} from '..';
import {
  translateCategoryOrValueToColumn,
  translateCategoryToAttribute,
  translateValueToMeasure,
} from '@/chart-data-options/utils';

export function getDataPointMetadata(dataOptionPath: string, dataOption: Category | Value) {
  return {
    id: dataOptionPath,
    dataOption: translateCategoryOrValueToColumn(dataOption),
    ...(MetadataTypes.isAttribute(dataOption) && {
      attribute: translateCategoryToAttribute(dataOption as Category),
    }),
    ...(MetadataTypes.isMeasure(dataOption) && {
      measure: translateValueToMeasure(dataOption as Value),
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
    return {
      ...getDataPointMetadata(`category.${index}`, item),
      value: point.custom?.xValue?.[index],
    } as DataPointEntry;
  });

  const hasMultipleValues = dataOptions.y.length >= 2;
  const valueEntries: DataPointEntry[] = dataOptions.y
    .filter((item, index) => !hasMultipleValues || point.series.index === index)
    .flatMap((item) => {
      return {
        ...getDataPointMetadata(`value.${point.series.index}`, item),
        value: point.custom?.rawValue,
      } as DataPointEntry;
    });

  const breakByEntries: DataPointEntry[] = dataOptions.breakBy.map((item, index) => {
    return {
      ...getDataPointMetadata(`breakBy.${index}`, item),
      value: point.series?.options.custom?.rawValue?.[0],
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
    return {
      ...getDataPointMetadata(`category.${index}`, item),
      value: point.custom?.xValue?.[index],
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
        } as DataPointEntry;
      });
    });

  const breakByEntries: DataPointEntry[] = dataOptions.breakBy.map((item, index) => {
    return {
      ...getDataPointMetadata(`breakBy.${index}`, item),
      value: point.series?.options.custom?.rawValue?.[0],
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
    entries.x = {
      ...getDataPointMetadata(`x`, dataOptions.x),
      value: point.custom.maskedX,
    } as DataPointEntry;
  }

  if (dataOptions.y) {
    entries.y = {
      ...getDataPointMetadata(`y`, dataOptions.y),
      value: point.custom.maskedY,
    } as DataPointEntry;
  }

  if (dataOptions.breakByPoint) {
    entries.breakByPoint = {
      ...getDataPointMetadata(`breakByPoint`, dataOptions.breakByPoint),
      value: point.custom?.maskedBreakByPoint,
    } as DataPointEntry;
  }

  if (dataOptions.breakByColor) {
    entries.breakByColor = {
      ...getDataPointMetadata(`breakByColor`, dataOptions.breakByColor),
      value: point.custom?.maskedBreakByColor,
    } as DataPointEntry;
  }

  if (dataOptions.size) {
    entries.size = {
      ...getDataPointMetadata(`size`, dataOptions.size),
      value: point.custom.maskedSize,
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
    return {
      ...getDataPointMetadata(`category.${index}`, item),
      value: point.custom?.xValue?.[index],
    } as DataPointEntry;
  });

  const valueEntries: DataPointEntry[] = dataOptions.y.map((item, index) => {
    return {
      ...getDataPointMetadata(`value.${index}`, item),
      value: point.custom?.rawValue,
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
    return {
      ...getDataPointMetadata(`category.${index}`, item),
      value: point.custom?.xValue?.[index],
    } as DataPointEntry;
  });

  const hasMultipleValues = dataOptions.y.length >= 2;
  const valueEntries: DataPointEntry[] = dataOptions.y
    .filter((item, index) => !hasMultipleValues || point.series.index === index)
    .map((item, index) => {
      return {
        ...getDataPointMetadata(`value.${index}`, item),
        value: point.custom?.rawValue,
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
      return {
        ...getDataPointMetadata(`category.${index}`, item),
        value: isParent ? point.custom?.rawValues?.[index] : point.custom?.xValue?.[index],
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
    entries.value = [
      {
        ...getDataPointMetadata(`value.0.outlier`, dataOptions.outliers!),
        value: point.options.y,
      } as DataPointEntry,
    ];
  } else {
    entries.value = [
      {
        ...getDataPointMetadata(`value.0.boxMin`, dataOptions.boxMin),
        value: point.options.q1!,
      },
      {
        ...getDataPointMetadata(`value.0.boxMedian`, dataOptions.boxMedian),
        value: point.options.median!,
      },
      {
        ...getDataPointMetadata(`value.0.boxMax`, dataOptions.boxMax),
        value: point.options.q3!,
      },
      {
        ...getDataPointMetadata(`value.0.whiskerMin`, dataOptions.whiskerMin),
        value: point.options.low!,
      },
      {
        ...getDataPointMetadata(`value.0.whiskerMax`, dataOptions.whiskerMax),
        value: point.options.high!,
      },
    ];
  }

  if (dataOptions.category) {
    entries.category = [
      {
        ...getDataPointMetadata(`category.0`, dataOptions.category),
        value: point.custom.xValue?.[0],
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
