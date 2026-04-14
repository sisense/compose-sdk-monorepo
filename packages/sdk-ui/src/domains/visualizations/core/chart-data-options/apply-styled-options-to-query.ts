import {
  Attribute,
  CalculatedMeasureColumn,
  Column,
  convertSortDirectionToSort,
  isSortDirection,
  Measure,
  MeasureColumn,
  measureFactory,
} from '@sisense/sdk-data';

import type {
  CategoryStyle,
  SeriesStyle,
  StyledColumn,
  StyledMeasureColumn,
  ValueStyle,
} from './types.js';

/**
 * Name prefixes for trend and forecast measures in query payloads (aligned with NLQ JSON and chart).
 *
 * @internal
 */
export const TREND_PREFIX = '$trend';
export const FORECAST_PREFIX = '$forecast';

/**
 * Dimension + optional category style for {@link adaptDimensionsForQuery}.
 * Structurally matches NLQ `DimensionTranslationItem`.
 *
 * @internal
 */
export type DimensionQueryAdaptItem = {
  attribute: Attribute;
  style?: CategoryStyle;
};

/**
 * Measure + optional value style for {@link adaptMeasuresForQuery}.
 * Structurally matches NLQ `MeasureTranslationItem`.
 *
 * @internal
 */
export type MeasureQueryAdaptItem = {
  measure: Measure;
  style?: ValueStyle & SeriesStyle;
};

/**
 * Dimensional {@link Attribute} instances expose JAQL sort APIs; plain {@link Column} does not.
 *
 * @internal
 */
export function isDimensionalAttribute(column: Column): column is Attribute {
  return typeof column === 'object' && column !== null && 'sort' in column && 'getSort' in column;
}

/**
 * Narrative / NLQ query measures are dimensional {@link Measure} instances (e.g. from `measureFactory`).
 *
 * @internal
 */
export function isDimensionalMeasure(
  column: MeasureColumn | CalculatedMeasureColumn,
): column is Measure {
  return (
    typeof column === 'object' && column !== null && 'composeCode' in column && 'sort' in column
  );
}

/**
 * Builds a dimension adapt item using `StyledColumn`’s own shape (no `splitColumn` merge).
 *
 * @internal
 */
export function toDimensionQueryAdaptItem(sc: StyledColumn): DimensionQueryAdaptItem {
  const { column, ...style } = sc;
  if (!isDimensionalAttribute(column)) {
    throw new Error(
      'Narrative styled dimensions require dimensional Attribute instances (data model columns).',
    );
  }
  return { attribute: column, style };
}

/**
 * Builds a measure adapt item using `StyledMeasureColumn`’s own shape (no `splitColumn` merge).
 *
 * @internal
 */
export function toMeasureQueryAdaptItem(smc: StyledMeasureColumn): MeasureQueryAdaptItem {
  const { column, ...style } = smc;
  if (!isDimensionalMeasure(column)) {
    throw new Error(
      'Narrative styled measures require dimensional Measure instances (e.g. from measureFactory).',
    );
  }
  return { measure: column, style };
}

/**
 * Applies sort from styled dimensions to attributes (NLQ JSON → query semantics).
 *
 * @internal
 */
export function adaptDimensionsForQuery(items: DimensionQueryAdaptItem[]): Attribute[] {
  return items.map(({ attribute, style }) => {
    const sortType = style?.sortType;
    if (!sortType) return attribute;
    const direction = typeof sortType === 'object' ? sortType.direction : sortType;
    if (!isSortDirection(direction)) return attribute;
    return attribute.sort(convertSortDirectionToSort(direction));
  });
}

/**
 * @internal
 */
export function isTrendMeasure(measure: Measure): boolean {
  return (
    (measure.composeCode?.includes('measureFactory.trend') ?? false) ||
    (measure.name?.startsWith(TREND_PREFIX) ?? false)
  );
}

/**
 * @internal
 */
export function isForecastMeasure(measure: Measure): boolean {
  return (
    (measure.composeCode?.includes('measureFactory.forecast') ?? false) ||
    (measure.name?.startsWith(FORECAST_PREFIX) ?? false)
  );
}

/**
 * Options for {@link adaptMeasuresForQuery}.
 *
 * @internal
 */
export type AdaptMeasuresForQueryOptions = {
  /**
   * When `true`, trend and forecast companion measures are not appended (e.g. narrative when the
   * backend does not yet support them).
   *
   * @default false
   */
  ignoreTrendAndForecast?: boolean;
};

/**
 * Applies sort, trend, and forecast companion measures (NLQ JSON → query semantics).
 *
 * @internal
 */
export function adaptMeasuresForQuery(
  items: MeasureQueryAdaptItem[],
  options?: AdaptMeasuresForQueryOptions,
): Measure[] {
  const ignoreTrendAndForecast = options?.ignoreTrendAndForecast ?? false;
  const result: Measure[] = [];
  for (const { measure, style } of items) {
    const sortType = style?.sortType;
    const baseMeasure =
      sortType && isSortDirection(sortType)
        ? measure.sort(convertSortDirectionToSort(sortType))
        : measure;
    result.push(baseMeasure);

    if (!ignoreTrendAndForecast && style?.trend && !isTrendMeasure(measure)) {
      result.push(
        measureFactory.trend(measure, `${TREND_PREFIX}_${measure.name ?? 'Measure'}`, style.trend),
      );
    }
    if (!ignoreTrendAndForecast && style?.forecast && !isForecastMeasure(measure)) {
      result.push(
        measureFactory.forecast(
          measure,
          `${FORECAST_PREFIX}_${measure.name ?? 'Measure'}`,
          style.forecast,
        ),
      );
    }
  }
  return result;
}
