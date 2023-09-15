/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Attribute, Measure } from '@sisense/sdk-data';
import {
  isCartesian,
  isCategorical,
  isScatter,
  isIndicator,
} from '../chart-options-processor/translations/types';
import { ChartType } from '../types';
import {
  ChartDataOptions,
  CartesianChartDataOptions,
  CartesianChartDataOptionsInternal,
  CategoricalChartDataOptions,
  CategoricalChartDataOptionsInternal,
  ChartDataOptionsInternal,
  ScatterChartDataOptions,
  ScatterChartDataOptionsInternal,
  IndicatorDataOptionsInternal,
  IndicatorDataOptions,
  TableDataOptionsInternal,
  TableDataOptions,
  Value,
  isCategory,
  isValue,
  Category,
} from './types';
import {
  translateColumnToCategory,
  translateColumnToValue,
  translateColumnToCategoryOrValue,
  translateCategoryToAttribute,
  translateValueToMeasure,
} from './utils';

export function translateChartDataOptions(
  chartType: ChartType,
  dataOptions: ChartDataOptions,
): ChartDataOptionsInternal {
  if (isCartesian(chartType))
    return translateCartesianChartDataOptions(dataOptions as CartesianChartDataOptions);
  else if (isCategorical(chartType))
    return translateCategoricalChartDataOptions(dataOptions as CategoricalChartDataOptions);
  else if (isIndicator(chartType)) {
    return translateIndicatorChartDataOptions(dataOptions as IndicatorDataOptions);
  } else if (isScatter(chartType)) {
    return translateScatterChartDataOptions(dataOptions as ScatterChartDataOptions);
  } else throw new Error(`Unexpected chart type: ${chartType}`);
}

const translateCartesianChartDataOptions = (
  cartesian: CartesianChartDataOptions,
): CartesianChartDataOptionsInternal => {
  return {
    x: cartesian.category.map(translateColumnToCategory),
    y: cartesian.value.map(translateColumnToValue),
    // breakBy may be undefined. If so, default to empty array
    breakBy: cartesian.breakBy?.map(translateColumnToCategory) || [],
    seriesToColorMap: cartesian.seriesToColorMap,
  } as CartesianChartDataOptionsInternal;
};

const translateCategoricalChartDataOptions = (
  categorical: CategoricalChartDataOptions,
): CategoricalChartDataOptionsInternal => {
  return {
    y: categorical.value.map(translateColumnToValue),
    breakBy: categorical.category.map(translateColumnToCategory),
    seriesToColorMap: categorical.seriesToColorMap,
  } as CategoricalChartDataOptionsInternal;
};

const translateIndicatorChartDataOptions = (
  indicatorDataOptions: IndicatorDataOptions,
): IndicatorDataOptionsInternal => {
  return {
    value: indicatorDataOptions.value?.map(translateColumnToValue),
    secondary: indicatorDataOptions.secondary?.map(translateColumnToValue),
    min: indicatorDataOptions.min?.map(translateColumnToValue)?.map(withDefaultAggregation('min')),
    max: indicatorDataOptions.max?.map(translateColumnToValue)?.map(withDefaultAggregation('max')),
  };
};

/**
 * Returns a function that applies the default aggregation to the passed value.
 *
 * @param defaultAggregation - The name of the aggregate function to use as the default. For example, 'sum', 'count', etc. *
 * @returns A function that applies the default aggregation to the passed value if the aggregation is not specified.
 */
const withDefaultAggregation = (defaultAggregation: string) => (value: Value) => {
  // Notes: keeps original object in order to be able to convert it into the "measure"
  return Object.assign(value, {
    aggregation: value.aggregation ?? defaultAggregation,
  });
};

// TODO: review Styled*Column types for x and y
const translateScatterChartDataOptions = (
  scatter: ScatterChartDataOptions,
): ScatterChartDataOptionsInternal => {
  const { x, y, breakByPoint, breakByColor, size, seriesToColorMap } = scatter;
  return {
    x: x && translateColumnToCategoryOrValue(x),
    y: y && translateColumnToCategoryOrValue(y),
    breakByPoint: breakByPoint && translateColumnToCategory(breakByPoint),
    breakByColor: breakByColor && translateColumnToCategoryOrValue(breakByColor),
    size: size && translateColumnToValue(size),
    seriesToColorMap: seriesToColorMap,
  } as ScatterChartDataOptionsInternal;
};

export function getAttributes(
  dataOptions: ChartDataOptionsInternal,
  chartType: ChartType,
): Attribute[] {
  let categories: Category[] = [];

  if (isScatter(chartType)) {
    categories = ['x', 'y', 'breakByPoint', 'breakByColor'].flatMap((key) => {
      return dataOptions[key] && isCategory(dataOptions[key]) ? [dataOptions[key]] : [];
    });
  } else if (isCartesian(chartType) || isCategorical(chartType)) {
    categories = ['x', 'breakBy'].flatMap((key) => {
      return dataOptions[key] ?? [];
    });
  }

  return categories.map(translateCategoryToAttribute);
}

export function getMeasures(
  dataOptions: ChartDataOptionsInternal,
  chartType: ChartType,
): Measure[] {
  let values: Value[] = [];

  if (isIndicator(chartType)) {
    values = getIndicatorValues(dataOptions as IndicatorDataOptionsInternal);
  } else if (isScatter(chartType)) {
    values = ['x', 'y', 'breakByColor', 'size'].flatMap((key) => {
      return dataOptions[key] && isValue(dataOptions[key]) ? [dataOptions[key]] : [];
    });
  } else if (isCartesian(chartType) || isCategorical(chartType)) {
    values = (dataOptions as CartesianChartDataOptionsInternal).y;
  }

  return values.map(translateValueToMeasure);
}

function getIndicatorValues(indicatorDataOptions: IndicatorDataOptionsInternal): Value[] {
  const value = indicatorDataOptions.value?.[0];
  const secondary = indicatorDataOptions.secondary?.[0];
  const min = indicatorDataOptions.min?.[0];
  const max = indicatorDataOptions.max?.[0];

  return [value, secondary, min, max].filter((item): item is Value => !!item);
}

export function translateTableDataOptions(dataOptions: TableDataOptions): TableDataOptionsInternal {
  return {
    columns: dataOptions.columns.map(translateColumnToCategoryOrValue),
  };
}
