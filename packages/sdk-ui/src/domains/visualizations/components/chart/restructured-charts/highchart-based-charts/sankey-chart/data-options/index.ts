import { Attribute, Measure } from '@sisense/sdk-data';

import {
  ChartDataOptions,
  ChartDataOptionsInternal,
  SankeyChartDataOptions,
  SankeyChartDataOptionsInternal,
} from '@/domains/visualizations/core/chart-data-options/types';
import {
  isStyledColumn,
  normalizeColumn,
  normalizeMeasureColumn,
  translateColumnToAttribute,
  translateColumnToMeasure,
} from '@/domains/visualizations/core/chart-data-options/utils';

/**
 * Translates public Sankey data options to the internal format.
 */
function translateDataOptionsToInternal(
  dataOptions: SankeyChartDataOptions,
): SankeyChartDataOptionsInternal {
  return {
    category: dataOptions.category.map((c) => normalizeColumn(c)),
    value: normalizeMeasureColumn(dataOptions.value),
    seriesToColorMap: dataOptions.seriesToColorMap,
  };
}

/**
 * Returns all category columns as query attributes.
 */
function getAttributes(internalDataOptions: SankeyChartDataOptionsInternal): Attribute[] {
  return internalDataOptions.category.map((c) => translateColumnToAttribute(c)).filter(Boolean);
}

/**
 * Returns the value column as a query measure.
 */
function getMeasures(internalDataOptions: SankeyChartDataOptionsInternal): Measure[] {
  return [translateColumnToMeasure(internalDataOptions.value)];
}

/**
 * Type guard: checks if data options are SankeyChartDataOptions (public).
 * Key distinction: `value` is a single measure (not an array), `category` has at least two columns
 * (flow stages), and the shape is not Cartesian (`breakBy` is absent).
 */
function isCorrectDataOptions(
  dataOptions: ChartDataOptions,
): dataOptions is SankeyChartDataOptions {
  if (!('category' in dataOptions && 'value' in dataOptions)) {
    return false;
  }
  if ('breakBy' in dataOptions) {
    return false;
  }
  const { category, value } = dataOptions;
  if (!Array.isArray(category) || Array.isArray(value)) {
    return false;
  }
  if (category.length < 2) {
    return false;
  }
  const isObjectColumn = (col: unknown) =>
    col !== null && col !== undefined && typeof col === 'object' && !Array.isArray(col);
  return category.every(isObjectColumn) && isObjectColumn(value);
}

/**
 * Type guard: checks if internal data options are SankeyChartDataOptionsInternal.
 */
function isCorrectDataOptionsInternal(
  dataOptions: ChartDataOptionsInternal,
): dataOptions is SankeyChartDataOptionsInternal {
  if (!('category' in dataOptions && 'value' in dataOptions)) {
    return false;
  }
  const { category, value } = dataOptions;
  if (!Array.isArray(category) || Array.isArray(value)) {
    return false;
  }
  return category.every((c) => isStyledColumn(c)) && isStyledColumn(value);
}

/** Translator bundle for converting between public and internal Sankey data options. */
export const dataOptionsTranslators = {
  translateDataOptionsToInternal,
  getAttributes,
  getMeasures,
  isCorrectDataOptions,
  isCorrectDataOptionsInternal,
};
