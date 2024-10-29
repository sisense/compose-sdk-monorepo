/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Attribute, Measure } from '@sisense/sdk-data';
import { isRange } from './../chart-options-processor/translations/types';
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
  IndicatorChartDataOptionsInternal,
  ScatterChartDataOptions,
  ScatterChartDataOptionsInternal,
  IndicatorChartDataOptions,
  TableDataOptionsInternal,
  TableDataOptions,
  BoxplotChartDataOptions,
  BoxplotChartCustomDataOptions,
  AreamapChartDataOptions,
  AreamapChartDataOptionsInternal,
  ScattermapChartDataOptions,
  PivotTableDataOptions,
  PivotTableDataOptionsInternal,
  RangeChartDataOptions,
  StyledMeasureColumn,
  StyledColumn,
} from './types';
import {
  normalizeColumn,
  normalizeMeasureColumn,
  normalizeAnyColumn,
  safeMerge,
  isMeasureColumn,
} from './utils';
import { translateScattermapChartDataOptions } from './translate-scattermap-data-options';
import { translateRangeChartDataOptions } from './translate-range-data-options';
import { TranslatableError } from '@/translation/translatable-error';

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
  } else if (isRange(chartType)) {
    return translateRangeChartDataOptions(dataOptions as RangeChartDataOptions);
  } else throw new TranslatableError('errors.unexpectedChartType', { chartType });
}

const translateCartesianChartDataOptions = (
  cartesian: CartesianChartDataOptions,
): CartesianChartDataOptionsInternal => {
  return {
    x: cartesian.category.map(normalizeColumn),
    y: cartesian.value.map(normalizeMeasureColumn),
    // breakBy may be undefined. If so, default to empty array
    breakBy: cartesian.breakBy?.map(normalizeColumn) || [],
    seriesToColorMap: cartesian.seriesToColorMap,
  };
};

const translateCategoricalChartDataOptions = (
  categorical: CategoricalChartDataOptions,
): CategoricalChartDataOptionsInternal => {
  return {
    y: categorical.value.map(normalizeMeasureColumn),
    breakBy: categorical.category.map(normalizeColumn),
    seriesToColorMap: categorical.seriesToColorMap,
  };
};

const translateIndicatorChartDataOptions = (
  indicatorChartDataOptions: IndicatorChartDataOptions,
): IndicatorChartDataOptionsInternal => {
  return {
    value: indicatorChartDataOptions.value?.map(normalizeMeasureColumn),
    secondary: indicatorChartDataOptions.secondary?.map(normalizeMeasureColumn),
    min: indicatorChartDataOptions.min
      ?.map(normalizeMeasureColumn)
      ?.map(withDefaultAggregation('min')),
    max: indicatorChartDataOptions.max
      ?.map(normalizeMeasureColumn)
      ?.map(withDefaultAggregation('max')),
  };
};

/**
 * Returns a function that applies the default aggregation to the passed value.
 *
 * @param defaultAggregation - The name of the aggregate function to use as the default. For example, 'sum', 'count', etc. *
 * @returns A function that applies the default aggregation to the passed value if the aggregation is not specified.
 */
const withDefaultAggregation =
  (defaultAggregation: string) => (targetColumn: StyledMeasureColumn) => {
    const { column } = targetColumn;
    const aggregation = ('aggregation' in column && column.aggregation) || defaultAggregation;
    return {
      ...targetColumn,
      column: safeMerge(column, { aggregation }),
    } as StyledMeasureColumn;
  };

// TODO: review Styled*Column types for x and y
const translateScatterChartDataOptions = (
  scatter: ScatterChartDataOptions,
): ScatterChartDataOptionsInternal => {
  const { x, y, breakByPoint, breakByColor, size, seriesToColorMap } = scatter;
  return {
    x: x && normalizeAnyColumn(x),
    y: y && normalizeAnyColumn(y),
    breakByPoint: breakByPoint && normalizeColumn(breakByPoint),
    breakByColor: breakByColor && normalizeAnyColumn(breakByColor),
    size: size && normalizeMeasureColumn(size),
    seriesToColorMap: seriesToColorMap,
  };
};

const translateAreamapDataOptions = (
  dataOptions: AreamapChartDataOptions,
): AreamapChartDataOptionsInternal => {
  return {
    geo: dataOptions.geo && normalizeColumn(dataOptions.geo[0]),
    color: dataOptions.color && normalizeMeasureColumn(dataOptions.color[0]),
  };
};

export function getAttributes(
  dataOptions: ChartDataOptionsInternal,
  chartType: ChartType,
): Attribute[] {
  let targetDataOptionKeys: string[] = [];

  if (isScatter(chartType)) {
    targetDataOptionKeys = ['x', 'y', 'breakByPoint', 'breakByColor'];
  } else if (isCartesian(chartType) || isCategorical(chartType) || isRange(chartType)) {
    targetDataOptionKeys = ['x', 'breakBy'];
  } else if (isBoxplot(chartType)) {
    targetDataOptionKeys = ['category', 'outliers'];
  } else if (isAreamap(chartType)) {
    targetDataOptionKeys = ['geo'];
  } else if (isScattermap(chartType)) {
    targetDataOptionKeys = ['locations'];
  }

  const targetColumns = targetDataOptionKeys
    .flatMap<StyledColumn>((key) => dataOptions[key] ?? [])
    .filter((dataOption) => !isMeasureColumn(dataOption));

  return targetColumns.map(({ column: attribute }) => attribute as Attribute);
}

export function getMeasures(
  dataOptions: ChartDataOptionsInternal,
  chartType: ChartType,
): Measure[] {
  let targetDataOptionKeys: string[] = [];

  if (isIndicator(chartType)) {
    targetDataOptionKeys = ['value', 'secondary', 'min', 'max'];
  } else if (isScatter(chartType)) {
    targetDataOptionKeys = ['x', 'y', 'breakByColor', 'size'];
  } else if (isCartesian(chartType) || isCategorical(chartType) || isRange(chartType)) {
    targetDataOptionKeys = ['y'];
  } else if (isBoxplot(chartType)) {
    targetDataOptionKeys = [
      'boxMin',
      'boxMedian',
      'boxMax',
      'whiskerMin',
      'whiskerMax',
      'outliersCount',
    ];
  } else if (isAreamap(chartType)) {
    targetDataOptionKeys = ['color'];
  } else if (isScattermap(chartType)) {
    targetDataOptionKeys = ['size', 'colorBy', 'details'];
  }

  const targetColumns = targetDataOptionKeys
    .flatMap<StyledMeasureColumn>((key) => dataOptions[key] ?? [])
    .filter(isMeasureColumn);

  return targetColumns.map(({ column: measure }) => measure as Measure);
}

export function translateTableDataOptions(dataOptions: TableDataOptions): TableDataOptionsInternal {
  return {
    columns: dataOptions.columns.map(normalizeAnyColumn),
  };
}

/**
 * Translates pivot table data options to the internal structure.
 */
export function translatePivotTableDataOptions(
  dataOptions: PivotTableDataOptions,
): PivotTableDataOptionsInternal {
  return {
    rows: dataOptions.rows?.map(normalizeColumn),
    columns: dataOptions.columns?.map(normalizeColumn),
    values: dataOptions.values?.map(normalizeMeasureColumn),
    grandTotals: dataOptions.grandTotals,
  };
}
