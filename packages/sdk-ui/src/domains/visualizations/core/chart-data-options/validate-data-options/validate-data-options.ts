/* eslint-disable max-params */
import { Attribute, Data, Filter, Measure } from '@sisense/sdk-data';
import merge from 'ts-deepmerge';

import { TranslatableError } from '../../../../../infra/translation/translatable-error';
import { ChartType } from '../../../../../types';
import { DataTable } from '../../chart-data-processor/table-processor';
import {
  CategoricalChartDataOptions,
  CategoricalChartDataOptionsInternal,
  ChartDataOptions,
  ChartDataOptionsInternal,
} from '../types';
import { validateCategoricalChartDataOptions } from './validate-categorical-data-options';

export type DataColumnNamesMapping = Record<string, string>;

/**
 * Generates and applies unique data column names and creates a mapping of new names to original names.
 *
 * @param measures - An array of Value objects representing measures.
 * @returns - The mapping of unique names to original names.
 */
export const generateUniqueDataColumnsNames = (measures: Measure[]): DataColumnNamesMapping => {
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
// eslint-disable-next-line max-lines-per-function
export const validateDataOptionsAgainstData = (
  data: Data | DataTable,
  attributes: Attribute[],
  measures: Measure[],
  dataColumnNamesMapping: DataColumnNamesMapping,
  filters?: Filter[],
  highlights?: Filter[],
): boolean => {
  if (!data) return true;

  if (attributes.length + measures.length === 0) {
    throw new TranslatableError('errors.dataOptions.noDimensionsAndMeasures');
  }

  attributes.forEach((attribute) => {
    const index = data.columns.findIndex((column) => column.name === attribute.name);
    if (index === -1) {
      throw new TranslatableError('errors.dataOptions.attributeNotFound', {
        attributeName: attribute.name,
      });
    }
  });

  measures.forEach((measure) => {
    const index = data.columns.findIndex(
      (column) =>
        column.name === measure.name || column.name === dataColumnNamesMapping[measure.name],
    );
    if (index === -1) {
      throw new TranslatableError('errors.dataOptions.measureNotFound', {
        measureName: dataColumnNamesMapping[measure.name],
      });
    }
  });

  if (filters) {
    filters.forEach((filter) => {
      const index = data.columns.findIndex((column) => column.name === filter.attribute.name);
      if (index === -1) {
        throw new TranslatableError('errors.dataOptions.filterAttributeNotFound', {
          attributeName: filter.attribute.name,
        });
      }
    });
  }

  if (highlights) {
    highlights.forEach((highlight) => {
      const index = data.columns.findIndex((column) => column.name === highlight.attribute.name);
      if (index === -1) {
        throw new TranslatableError('errors.dataOptions.highlightAttributeNotFound', {
          attributeName: highlight.attribute.name,
        });
      }
    });
  }

  return true;
};

export function validateDataOptions(
  chartType: ChartType,
  dataOptions: ChartDataOptions,
): ChartDataOptions {
  switch (chartType) {
    case 'pie':
    case 'funnel':
    case 'treemap':
      return validateCategoricalChartDataOptions(
        chartType,
        dataOptions as CategoricalChartDataOptions,
      );
    default:
      return dataOptions;
  }
}
