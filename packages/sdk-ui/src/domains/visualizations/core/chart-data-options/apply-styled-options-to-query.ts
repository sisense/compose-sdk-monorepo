import {
  Attribute,
  convertSortDirectionToSort,
  FORECAST_PREFIX,
  isAttributeInstance,
  isForecastMeasure,
  isMeasureInstance,
  isSortDirection,
  isTrendMeasure,
  Measure,
  measureFactory,
  TREND_PREFIX,
} from '@sisense/sdk-data';

import type {
  CategoryStyle,
  SeriesStyle,
  StyledColumn,
  StyledMeasureColumn,
  ValueStyle,
} from './types.js';

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
 * Builds a dimension adapt item using `StyledColumn`’s own shape (no `splitColumn` merge).
 *
 * @internal
 */
export function toDimensionQueryAdaptItem(sc: StyledColumn): DimensionQueryAdaptItem {
  const { column, ...style } = sc;
  if (!isAttributeInstance(column)) {
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
  if (!isMeasureInstance(column)) {
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
 * Checks whether any measure in the list is a trend or forecast measure.
 *
 * @param measures - The measures to check.
 * @returns `true` if at least one measure is a trend or forecast measure.
 * @internal
 */
export function hasAdvancedAnalyticsMeasure(measures: readonly Measure[]): boolean {
  return measures.some((m) => isTrendMeasure(m) || isForecastMeasure(m));
}

/**
 * Options for {@link adaptMeasuresForQuery}.
 *
 * @internal
 */
export type AdaptMeasuresForQueryOptions = {
  /**
   * When `true` (default), trend and forecast will be included if present.
   * When `false`, trend and forecast will be omitted if they are present.
   *
   * @default true
   */
  includeTrendAndForecast?: boolean;
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
  const includeTrendAndForecast = options?.includeTrendAndForecast ?? true;
  const result: Measure[] = [];
  for (const { measure, style } of items) {
    const sortType = style?.sortType;
    const baseMeasure =
      sortType && isSortDirection(sortType)
        ? measure.sort(convertSortDirectionToSort(sortType))
        : measure;
    result.push(baseMeasure);

    if (includeTrendAndForecast && style?.trend && !isTrendMeasure(measure)) {
      result.push(
        measureFactory.trend(measure, `${TREND_PREFIX}_${measure.name ?? 'Measure'}`, style.trend),
      );
    }
    if (includeTrendAndForecast && style?.forecast && !isForecastMeasure(measure)) {
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
