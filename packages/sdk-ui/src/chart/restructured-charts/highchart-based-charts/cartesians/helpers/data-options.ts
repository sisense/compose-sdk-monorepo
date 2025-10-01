import isArray from 'lodash-es/isArray';
import {
  CartesianChartDataOptionsInternal,
  ChartDataOptions,
  ChartDataOptionsInternal,
  StyledColumn,
  StyledMeasureColumn,
} from '@/chart-data-options/types';
import {
  isMeasureColumn,
  isStyledColumn,
  normalizeColumn,
  normalizeMeasureColumn,
} from '@/chart-data-options/utils';
import { CartesianChartDataOptions } from '@/types';
import {
  Attribute,
  CalculatedMeasureColumn,
  Column,
  Measure,
  MeasureColumn,
} from '@ethings-os/sdk-data';

/**
 * Translates the data options for cartesian charts to internal format.
 */
export const translateCartesianChartDataOptions = (
  dataOptions: CartesianChartDataOptions,
): CartesianChartDataOptionsInternal => {
  return {
    x: dataOptions.category.map((c) => normalizeColumn(c)),
    y: dataOptions.value.map((c) => normalizeMeasureColumn(c)),
    // breakBy may be undefined. If so, default to empty array
    breakBy: dataOptions.breakBy?.map((c) => normalizeColumn(c)) || [],
    seriesToColorMap: dataOptions.seriesToColorMap,
  };
};

/**
 * Returns the attributes from the internal data options for cartesian charts.
 */
export function getCartesianAttributes(
  internalDataOptions: CartesianChartDataOptionsInternal,
): Attribute[] {
  return [
    ...internalDataOptions.x.map(getColumn),
    ...internalDataOptions.breakBy.map(getColumn),
  ].filter(isAttributeColumn) as Attribute[];
}

/**
 * Returns the measures from the internal data options for cartesian charts.
 */
export function getCartesianMeasures(
  internalDataOptions: CartesianChartDataOptionsInternal,
): Measure[] {
  return internalDataOptions.y.map(getColumn).filter(isMeasureColumn) as Measure[];
}

/**
 * Checks if the data options are correct for cartesian charts.
 */
export function isCartesianChartDataOptions(
  dataOptions: ChartDataOptions,
): dataOptions is CartesianChartDataOptions {
  return (
    'category' in dataOptions &&
    isArray(dataOptions.category) &&
    'value' in dataOptions &&
    isArray(dataOptions.value) &&
    'breakBy' in dataOptions &&
    isArray(dataOptions.breakBy)
  );
}

/**
 * Checks if the internal data options are correct for cartesian charts.
 */
export function isCartesianChartDataOptionsInternal(
  dataOptions: ChartDataOptionsInternal,
): dataOptions is CartesianChartDataOptionsInternal {
  return (
    'x' in dataOptions &&
    isArray(dataOptions.x) &&
    dataOptions.x.every(isStyledColumn) &&
    'y' in dataOptions &&
    isArray(dataOptions.y) &&
    dataOptions.y.every(isStyledColumn) &&
    'breakBy' in dataOptions &&
    isArray(dataOptions.breakBy) &&
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
export function isAttributeColumn(
  column: MeasureColumn | CalculatedMeasureColumn | Column,
): column is Column {
  return !isMeasureColumn(column);
}

/**
 * Checks if the chart should have Y2 axis.
 */
export function shouldHaveY2Axis(dataOptions: CartesianChartDataOptionsInternal): boolean {
  return dataOptions.y.some((y) => y.showOnRightAxis);
}
