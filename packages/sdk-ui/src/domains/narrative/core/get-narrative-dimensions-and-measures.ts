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
  DerivedResultColumn,
  StyledColumn,
  StyledMeasureColumn,
  TableDataOptions,
} from '@/domains/visualizations/core/chart-data-options/types.js';
import {
  isDerivedResultColumn,
  isMeasureColumn,
} from '@/domains/visualizations/core/chart-data-options/utils.js';
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

/**
 * Same partition as {@link getTableAttributesAndMeasures}: column order preserved within each
 * group. `translateTableDataOptions` (the plain function this reads from) never produces a
 * `DerivedResultColumn`, but the shared `TableDataOptionsInternal` type allows one, so it's filtered
 * out defensively here too.
 */
function partitionTableColumnsByMeasure(
  columns: readonly (StyledColumn | StyledMeasureColumn | DerivedResultColumn)[],
): {
  dimensionColumns: StyledColumn[];
  measureColumns: StyledMeasureColumn[];
} {
  const dimensionColumns: StyledColumn[] = [];
  const measureColumns: StyledMeasureColumn[] = [];
  for (const col of columns) {
    if (isDerivedResultColumn(col)) {
      continue;
    }
    if (isMeasureColumn(col)) {
      measureColumns.push(col);
    } else {
      dimensionColumns.push(col);
    }
  }
  return { dimensionColumns, measureColumns };
}

/**
 * Dimensions and measures for narrative / JAQL, including styled sort, trend, and forecast.
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
 * Table dimensions and measures for narrative / JAQL, including styled sort, trend, and forecast.
 *
 * Trend/forecast expansion happens once, up front, via `translateTableDataOptions`'s own
 * `includeTrendAndForecast` option — the same expansion Table's own rendering uses — rather than
 * a second time in `narrativeQueryFromStyledAxisColumns`'s `adaptMeasuresForQuery` call, which is
 * explicitly told `includeTrendAndForecast: false` here since there's nothing left for it to do
 * (it still validates each column is a real dimensional Attribute/Measure and applies sort).
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
  const translatedDataOptions = translateTableDataOptions(dataOptions, adaptMeasureOptions);
  const { dimensionColumns, measureColumns } = partitionTableColumnsByMeasure(
    translatedDataOptions.columns,
  );
  return narrativeQueryFromStyledAxisColumns(dimensionColumns, measureColumns, {
    ...adaptMeasureOptions,
    includeTrendAndForecast: false,
  });
}
