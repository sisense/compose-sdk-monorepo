/* eslint-disable max-params */

import { CategoricalChartDataOptionsInternal, ChartDataOptionsInternal, Value } from './types';
import { ChartType } from '../types';
import merge from 'ts-deepmerge';
import { Attribute, Data, Filter, Measure } from '@sisense/sdk-data';

export type DataColumnNamesMapping = Record<string, string>;

/**
 * Generates and applies unique data column names and creates a mapping of new names to original names.
 *
 * @param measures - An array of Value objects representing measures.
 * @returns - The mapping of unique names to original names.
 */
export const generateUniqueDataColumnsNames = (measures: Value[]): DataColumnNamesMapping => {
  const dataColumnNamesMapping: DataColumnNamesMapping = {};
  const getMeasurePrefix = (id: number): string => `$measure${id}_`;

  measures.forEach((measure, index) => {
    const originalName = measure.name;
    const prefix = getMeasurePrefix(index);
    const uniqueName = `${prefix}${originalName}`;

    measure.name = uniqueName;
    dataColumnNamesMapping[uniqueName] = originalName;
  });

  return dataColumnNamesMapping;
};

/**
 * Applies default chart data options based on input chart type.
 */
export const applyDefaultChartDataOptions = (
  chartDataOptions: ChartDataOptionsInternal,
  chartType: ChartType,
): ChartDataOptionsInternal => {
  if (chartType === 'funnel') {
    const updatedOptions = merge(chartDataOptions) as CategoricalChartDataOptionsInternal;
    // apply descending sort to the value if no sort is specified
    if (
      updatedOptions.breakBy.length > 0 &&
      updatedOptions.breakBy[0].sortType === undefined &&
      updatedOptions.y.length > 0 &&
      updatedOptions.y[0].sortType === undefined
    ) {
      updatedOptions.y[0].sortType = 'sortDesc';
      return updatedOptions;
    }
  }

  return chartDataOptions;
};

/**
 * Validates attributes, measures, filters, and highlights against the columns in data.
 */
export const validateDataOptionsAgainstData = (
  data: Data,
  attributes: Attribute[],
  measures: Measure[],
  dataColumnNamesMapping: DataColumnNamesMapping,
  filters?: Filter[],
  highlights?: Filter[],
): boolean => {
  // TODO get error messages into translation file after setting up i18n in new package sdk-common

  if (attributes.length + measures.length === 0) {
    throw new Error(
      'Neither dimensions nor measures found. Data options should have at least one dimension or measure.',
    );
  }

  attributes.forEach((attribute) => {
    const index = data.columns.findIndex((column) => column.name === attribute.name);
    if (index === -1) {
      throw new Error(`Attribute "${attribute.name}" not found in the data`);
    }
  });

  measures.forEach((measure) => {
    const index = data.columns.findIndex(
      (column) =>
        column.name === measure.name || column.name === dataColumnNamesMapping[measure.name],
    );
    if (index === -1) {
      throw new Error(`Measure "${dataColumnNamesMapping[measure.name]}" not found in the data`);
    }
  });

  if (filters) {
    filters.forEach((filter) => {
      const index = data.columns.findIndex((column) => column.name === filter.attribute.name);
      if (index === -1) {
        throw new Error(`Filter attribute "${filter.attribute.name}" not found in the data`);
      }
    });
  }

  if (highlights) {
    highlights.forEach((highlight) => {
      const index = data.columns.findIndex((column) => column.name === highlight.attribute.name);
      if (index === -1) {
        throw new Error(`Highlight attribute "${highlight.attribute.name}" not found in the data`);
      }
    });
  }

  return true;
};
