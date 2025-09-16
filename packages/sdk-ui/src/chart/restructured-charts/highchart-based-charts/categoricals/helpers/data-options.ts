import {
  Attribute,
  CalculatedMeasureColumn,
  Column,
  Measure,
  MeasureColumn,
} from '@sisense/sdk-data';
import {
  ChartDataOptions,
  CategoricalChartDataOptions,
  CategoricalChartDataOptionsInternal,
  StyledMeasureColumn,
  StyledColumn,
} from '@/chart-data-options/types';
import {
  isMeasureColumn,
  isStyledColumn,
  normalizeColumn,
  normalizeMeasureColumn,
} from '@/chart-data-options/utils';

/**
 * Translates categorical chart data options to internal format.
 */
export function translateCategoricalDataOptionsToInternal(
  dataOptions: CategoricalChartDataOptions,
): CategoricalChartDataOptionsInternal {
  return {
    y: dataOptions.value.map((c) => normalizeMeasureColumn(c)),
    breakBy: dataOptions.category.map((c) => normalizeColumn(c)),
    seriesToColorMap: dataOptions.seriesToColorMap,
  };
}

/**
 * Gets attributes from categorical chart data options.
 */
export function getCategoricalAttributes(
  internalDataOptions: CategoricalChartDataOptionsInternal,
): Attribute[] {
  return [...internalDataOptions.breakBy.map(getColumn)].filter(isAttributeColumn) as Attribute[];
}

/**
 * Gets measures from categorical chart data options.
 */
export function getCategoricalMeasures(
  internalDataOptions: CategoricalChartDataOptionsInternal,
): Measure[] {
  return internalDataOptions.y.map(getColumn).filter(isMeasureColumn) as Measure[];
}

/**
 * Type guard to check if data options are categorical chart data options.
 */
export function isCategoricalChartDataOptions(
  dataOptions: ChartDataOptions,
): dataOptions is CategoricalChartDataOptions {
  return (
    'category' in dataOptions &&
    'value' in dataOptions &&
    Array.isArray((dataOptions as CategoricalChartDataOptions).category) &&
    Array.isArray((dataOptions as CategoricalChartDataOptions).value)
  );
}

/**
 * Type guard to check if internal data options are categorical chart data options.
 */
export function isCategoricalChartDataOptionsInternal(
  dataOptions: any,
): dataOptions is CategoricalChartDataOptionsInternal {
  return (
    dataOptions &&
    'y' in dataOptions &&
    Array.isArray(dataOptions.y) &&
    dataOptions.y.every(isMeasureColumn) &&
    'breakBy' in dataOptions &&
    Array.isArray(dataOptions.breakBy) &&
    dataOptions.breakBy.every(isStyledColumn)
  );
}

/**
 * Returns the column from the styled column.
 */
function getColumn(
  styledColumn: StyledColumn | StyledMeasureColumn,
): MeasureColumn | CalculatedMeasureColumn | Column {
  return styledColumn.column;
}

/**
 * Checks if the column is an attribute column.
 */
function isAttributeColumn(
  column: MeasureColumn | CalculatedMeasureColumn | Column,
): column is Column {
  return !isMeasureColumn(column);
}
