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
  isBoxplot,
  isAreamap,
  isScattermap,
} from '../chart-options-processor/translations/types';
import { ChartType } from '../types';
import { translateBoxplotDataOptions } from './translate-boxplot-data-options';
import {
  ChartDataOptions,
  CartesianChartDataOptions,
  CartesianChartDataOptionsInternal,
  CategoricalChartDataOptions,
  CategoricalChartDataOptionsInternal,
  ChartDataOptionsInternal,
  ScatterChartDataOptions,
  ScatterChartDataOptionsInternal,
  IndicatorChartDataOptionsInternal,
  IndicatorChartDataOptions,
  TableDataOptionsInternal,
  TableDataOptions,
  Value,
  isCategory,
  isValue,
  Category,
  BoxplotChartDataOptions,
  BoxplotChartCustomDataOptions,
  AreamapChartDataOptions,
  AreamapChartDataOptionsInternal,
  ScattermapChartDataOptions,
  PivotTableDataOptions,
  PivotTableDataOptionsInternal,
} from './types';
import {
  translateColumnToCategory,
  translateColumnToValue,
  translateColumnToCategoryOrValue,
  translateCategoryToAttribute,
  translateValueToMeasure,
} from './utils';
import { translateScattermapChartDataOptions } from './translate-scattermap-data-options';

export function translateChartDataOptions(
  chartType: ChartType,
  dataOptions: ChartDataOptions,
): ChartDataOptionsInternal {
  if (isCartesian(chartType))
    return translateCartesianChartDataOptions(dataOptions as CartesianChartDataOptions);
  else if (isCategorical(chartType))
    return translateCategoricalChartDataOptions(dataOptions as CategoricalChartDataOptions);
  else if (isIndicator(chartType)) {
    return translateIndicatorChartDataOptions(dataOptions as IndicatorChartDataOptions);
  } else if (isScatter(chartType)) {
    return translateScatterChartDataOptions(dataOptions as ScatterChartDataOptions);
  } else if (isBoxplot(chartType)) {
    return translateBoxplotDataOptions(
      dataOptions as BoxplotChartDataOptions | BoxplotChartCustomDataOptions,
    );
  } else if (isAreamap(chartType)) {
    return translateAreamapDataOptions(dataOptions as AreamapChartDataOptions);
  } else if (isScattermap(chartType)) {
    return translateScattermapChartDataOptions(dataOptions as ScattermapChartDataOptions);
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
  indicatorChartDataOptions: IndicatorChartDataOptions,
): IndicatorChartDataOptionsInternal => {
  return {
    value: indicatorChartDataOptions.value?.map(translateColumnToValue),
    secondary: indicatorChartDataOptions.secondary?.map(translateColumnToValue),
    min: indicatorChartDataOptions.min
      ?.map(translateColumnToValue)
      ?.map(withDefaultAggregation('min')),
    max: indicatorChartDataOptions.max
      ?.map(translateColumnToValue)
      ?.map(withDefaultAggregation('max')),
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

const translateAreamapDataOptions = (
  dataOptions: AreamapChartDataOptions,
): AreamapChartDataOptionsInternal => {
  return {
    geo: dataOptions.geo && translateColumnToCategory(dataOptions.geo[0]),
    color: dataOptions.color && translateColumnToValue(dataOptions.color[0]),
  };
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
  } else if (isBoxplot(chartType)) {
    categories = ['category', 'outliers'].flatMap((key) => {
      return dataOptions[key] ? [dataOptions[key]] : [];
    });
  } else if (isAreamap(chartType)) {
    categories = [(dataOptions as AreamapChartDataOptionsInternal).geo];
  } else if (isScattermap(chartType)) {
    categories = ['locations'].flatMap((key) => {
      return dataOptions[key] ?? [];
    });
  }

  return categories.map(translateCategoryToAttribute);
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export function getMeasures(
  dataOptions: ChartDataOptionsInternal,
  chartType: ChartType,
): Measure[] {
  let values: Value[] = [];

  if (isIndicator(chartType)) {
    values = getIndicatorValues(dataOptions as IndicatorChartDataOptionsInternal);
  } else if (isScatter(chartType)) {
    values = ['x', 'y', 'breakByColor', 'size'].flatMap((key) => {
      return dataOptions[key] && isValue(dataOptions[key]) ? [dataOptions[key]] : [];
    });
  } else if (isCartesian(chartType) || isCategorical(chartType)) {
    values = (dataOptions as CartesianChartDataOptionsInternal).y;
  } else if (isBoxplot(chartType)) {
    values = ['boxMin', 'boxMedian', 'boxMax', 'whiskerMin', 'whiskerMax', 'outliersCount'].flatMap(
      (key) => {
        return dataOptions[key] ? [dataOptions[key]] : [];
      },
    );
  } else if (isAreamap(chartType)) {
    values = [(dataOptions as AreamapChartDataOptionsInternal).color];
  } else if (isScattermap(chartType)) {
    values = ['size', 'colorBy', 'details'].flatMap((key) => {
      return dataOptions[key] && isValue(dataOptions[key]) ? [dataOptions[key]] : [];
    });
  }

  return values.map(translateValueToMeasure);
}

function getIndicatorValues(indicatorChartDataOptions: IndicatorChartDataOptionsInternal): Value[] {
  const value = indicatorChartDataOptions.value?.[0];
  const secondary = indicatorChartDataOptions.secondary?.[0];
  const min = indicatorChartDataOptions.min?.[0];
  const max = indicatorChartDataOptions.max?.[0];

  return [value, secondary, min, max].filter((item): item is Value => !!item);
}

export function translateTableDataOptions(dataOptions: TableDataOptions): TableDataOptionsInternal {
  return {
    columns: dataOptions.columns.map(translateColumnToCategoryOrValue),
  };
}

/**
 * Translates pivot table data options to the internal structure.
 */
export function translatePivotTableDataOptions(
  dataOptions: PivotTableDataOptions,
): PivotTableDataOptionsInternal {
  return {
    rows: dataOptions.rows?.map(translateColumnToCategory),
    columns: dataOptions.columns?.map(translateColumnToCategory),
    values: dataOptions.values?.map(translateColumnToValue),
    grandTotals: dataOptions.grandTotals,
  };
}
