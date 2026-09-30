import { Attribute, Measure } from '@sisense/sdk-data';

import { getTranslatedDataOptions } from '@/domains/visualizations/components/chart/helpers/use-translated-data-options.js';
import { getChartBuilder } from '@/domains/visualizations/components/chart/restructured-charts/chart-builder-factory.js';
import { isRestructuredChartType } from '@/domains/visualizations/components/chart/restructured-charts/utils.js';
import {
  adaptDimensionsForQuery,
  adaptMeasuresForQuery,
  type AdaptMeasuresForQueryOptions,
  toDimensionQueryAdaptItem,
  toMeasureQueryAdaptItem,
} from '@/domains/visualizations/core/chart-data-options/apply-styled-options-to-query.js';
import { getTranslatedDataOptions as legacyGetTranslatedDataOptions } from '@/domains/visualizations/core/chart-data-options/get-translated-data-options.js';
import { translateTableDataOptions } from '@/domains/visualizations/core/chart-data-options/translate-data-options';
import type {
  ChartDataOptionsInternal,
  DerivedResultColumn,
  StyledColumn,
  StyledMeasureColumn,
  TableDataOptions,
} from '@/domains/visualizations/core/chart-data-options/types.js';
import {
  isDerivedResultColumn,
  isMeasureColumn,
  isStyledColumn,
} from '@/domains/visualizations/core/chart-data-options/utils.js';
import { applyDefaultChartDataOptions } from '@/domains/visualizations/core/chart-data-options/validate-data-options';
import { ChartDataOptions, ChartType } from '@/types';

/**
 * Shared narrative/JAQL pipeline: styled dimension columns + styled measure columns → adapt sort / trend / forecast.
 * Chart vs table only differ in how those two lists are collected (axes vs `columns` partition).
 *
 * @param styledDimensions - Dimension columns in query order.
 * @param styledMeasures - Measure columns in query order.
 * @param adaptMeasureOptions - Options for trend and forecast expansion of the measures.
 * @returns Dimensions and measures ready for the query.
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
 * @param columns - Table columns after translation.
 * @returns Dimension columns and measure columns, each in column order.
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
 * Every styled column reachable in internal data options. Internal data options keep each column
 * inside its styled wrapper, at any depth.
 * @param node - Internal data options, or any value nested in them.
 * @param out - Accumulator the found columns are pushed to.
 * @returns The accumulator, with every styled column found in traversal order.
 */
function collectStyledColumns(
  node: unknown,
  out: (StyledColumn | StyledMeasureColumn)[] = [],
): (StyledColumn | StyledMeasureColumn)[] {
  if (Array.isArray(node)) {
    node.forEach((item) => collectStyledColumns(item, out));
  } else if (node && typeof node === 'object') {
    if (isStyledColumn(node as StyledColumn | StyledMeasureColumn)) {
      out.push(node as StyledColumn | StyledMeasureColumn);
    } else {
      Object.values(node).forEach((value) => collectStyledColumns(value, out));
    }
  }
  return out;
}

/**
 * Puts the bare attributes and measures a chart queries back into the styled wrappers the internal
 * data options hold them in. One column instance can sit in several wrappers (the same attribute
 * as category and as breakBy); wrappers are consumed in traversal order, which is the order the
 * columns are listed in, so each occurrence takes its own wrapper.
 * @param internalDataOptions - Internal data options holding the styled wrappers.
 * @param attributes - Attributes the chart queries, in query order.
 * @param measures - Measures the chart queries, in query order.
 * @returns The attributes and measures, each in its styled wrapper, or bare when none holds it.
 */
function toStyledAxisColumns(
  internalDataOptions: ChartDataOptionsInternal,
  attributes: Attribute[],
  measures: Measure[],
): { styledDimensions: StyledColumn[]; styledMeasures: StyledMeasureColumn[] } {
  const wrapperPool = new Map<unknown, (StyledColumn | StyledMeasureColumn)[]>();
  collectStyledColumns(internalDataOptions).forEach((styled) =>
    wrapperPool.set(styled.column, [...(wrapperPool.get(styled.column) ?? []), styled]),
  );
  const styledFor = <C extends Attribute | Measure>(column: C) =>
    wrapperPool.get(column)?.shift() ?? { column };

  return {
    styledDimensions: attributes.map((attribute) => styledFor(attribute) as StyledColumn),
    styledMeasures: measures.map((measure) => styledFor(measure) as StyledMeasureColumn),
  };
}

/**
 * Dimensions and measures for narrative / JAQL, including styled sort, trend, and forecast.
 * The chart's own data-options translation (`getTranslatedDataOptions`) decides which columns a
 * chart type queries; the styled wrappers around them carry sort, trend and forecast.
 *
 * @param chartDataOptions - Data options of the chart widget.
 * @param chartType - Chart type the data options belong to.
 * @param adaptMeasureOptions - Options for trend and forecast expansion of the measures.
 * @returns Dimensions and measures the chart queries.
 * @internal
 */
export function getNarrativeDimensionsAndMeasures(
  chartDataOptions: ChartDataOptions,
  chartType: ChartType,
  adaptMeasureOptions?: AdaptMeasuresForQueryOptions,
): { dimensions: Attribute[]; measures: Measure[] } {
  // The chart builders validate the data-options shape strictly (e.g. cartesian needs `breakBy`);
  // options that do not fit a builder take the legacy translation, as they did before.
  const fitsChartBuilder =
    isRestructuredChartType(chartType) &&
    getChartBuilder(chartType).dataOptions.isCorrectDataOptions(chartDataOptions);
  const { dataOptions, attributes, measures } = fitsChartBuilder
    ? getTranslatedDataOptions(chartDataOptions, chartType)
    : legacyGetTranslatedDataOptions(chartDataOptions, chartType);
  const { styledDimensions, styledMeasures } = toStyledAxisColumns(
    applyDefaultChartDataOptions(dataOptions, chartType),
    attributes,
    measures,
  );

  return narrativeQueryFromStyledAxisColumns(styledDimensions, styledMeasures, adaptMeasureOptions);
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
 * @param dataOptions - Data options of the table widget.
 * @param adaptMeasureOptions - Options for trend and forecast expansion of the measures.
 * @returns Dimensions and measures the table queries.
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
