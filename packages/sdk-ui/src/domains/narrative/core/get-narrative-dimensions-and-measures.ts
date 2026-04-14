import { Attribute, Measure } from '@sisense/sdk-data';

import {
  adaptDimensionsForQuery,
  adaptMeasuresForQuery,
  type AdaptMeasuresForQueryOptions,
  toDimensionQueryAdaptItem,
  toMeasureQueryAdaptItem,
} from '@/domains/visualizations/core/chart-data-options/apply-styled-options-to-query.js';
import {
  getStyledDimensionColumns,
  getStyledMeasureColumns,
  translateChartDataOptions,
  translateTableDataOptions,
} from '@/domains/visualizations/core/chart-data-options/translate-data-options';
import type {
  StyledColumn,
  StyledMeasureColumn,
  TableDataOptions,
} from '@/domains/visualizations/core/chart-data-options/types.js';
import { isMeasureColumn } from '@/domains/visualizations/core/chart-data-options/utils.js';
import {
  applyDefaultChartDataOptions,
  validateDataOptions,
} from '@/domains/visualizations/core/chart-data-options/validate-data-options';
import { ChartDataOptions, ChartType } from '@/types';

/**
 * Shared narrative/JAQL pipeline: styled dimension columns + styled measure columns → adapt sort / trend / forecast.
 * Chart vs table only differ in how those two lists are collected (axes vs `columns` partition).
 *
 * @internal
 */
function narrativeQueryFromStyledAxisColumns(
  styledDimensions: StyledColumn[],
  styledMeasures: StyledMeasureColumn[],
  adaptMeasureOptions?: AdaptMeasuresForQueryOptions,
): { dimensions: Attribute[]; measures: Measure[] } {
  const dimensionItems = styledDimensions.map(toDimensionQueryAdaptItem);
  const measureItems = styledMeasures.map(toMeasureQueryAdaptItem);

  return {
    dimensions: adaptDimensionsForQuery(dimensionItems),
    measures: adaptMeasuresForQuery(measureItems, adaptMeasureOptions),
  };
}

/** Same partition as {@link getTableAttributesAndMeasures}: column order preserved within each group. */
function partitionTableColumnsByMeasure(columns: readonly (StyledColumn | StyledMeasureColumn)[]): {
  dimensionColumns: StyledColumn[];
  measureColumns: StyledMeasureColumn[];
} {
  const dimensionColumns: StyledColumn[] = [];
  const measureColumns: StyledMeasureColumn[] = [];
  for (const col of columns) {
    if (isMeasureColumn(col)) {
      measureColumns.push(col);
    } else {
      dimensionColumns.push(col);
    }
  }
  return { dimensionColumns, measureColumns };
}

/**
 * Dimensions and measures for narration / JAQL, including styled sort, trend, and forecast.
 *
 * @internal
 */
export function getNarrativeDimensionsAndMeasures(
  chartDataOptions: ChartDataOptions,
  chartType: ChartType,
  adaptMeasureOptions?: AdaptMeasuresForQueryOptions,
): { dimensions: Attribute[]; measures: Measure[] } {
  const validatedDataOptions = validateDataOptions(chartType, chartDataOptions);
  const chartDataOptionsWithoutDefaults = translateChartDataOptions(
    chartType,
    validatedDataOptions,
  );
  const dataOptions = applyDefaultChartDataOptions(chartDataOptionsWithoutDefaults, chartType);

  return narrativeQueryFromStyledAxisColumns(
    getStyledDimensionColumns(dataOptions, chartType),
    getStyledMeasureColumns(dataOptions, chartType),
    adaptMeasureOptions,
  );
}

/**
 * Table dimensions and measures for narration / JAQL, including styled sort, trend, and forecast.
 *
 * @internal
 */
export function getNarrativeDimensionsAndMeasuresFromTable(
  dataOptions: TableDataOptions,
  adaptMeasureOptions?: AdaptMeasuresForQueryOptions,
): {
  dimensions: Attribute[];
  measures: Measure[];
} {
  const translatedDataOptions = translateTableDataOptions(dataOptions);
  const { dimensionColumns, measureColumns } = partitionTableColumnsByMeasure(
    translatedDataOptions.columns,
  );
  return narrativeQueryFromStyledAxisColumns(dimensionColumns, measureColumns, adaptMeasureOptions);
}
