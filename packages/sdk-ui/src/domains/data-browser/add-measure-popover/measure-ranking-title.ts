import {
  AggregationType,
  AggregationTypes,
  Attribute,
  getColumnNameFromAttribute,
  isDimensionalBaseMeasure,
  isLevelAttribute,
  Measure,
} from '@sisense/sdk-data';
import type { TFunction } from 'i18next';

import { generateAttributeName } from '@/shared/utils/generate-attribute-name';

const AGGREGATION_TITLE_KEYS: Partial<Record<AggregationType, string>> = {
  [AggregationTypes.Sum]: 'measuresAgg.sum',
  [AggregationTypes.Average]: 'measuresAgg.average',
  [AggregationTypes.Min]: 'measuresAgg.min',
  [AggregationTypes.Max]: 'measuresAgg.max',
  [AggregationTypes.Count]: 'measuresAgg.count',
  [AggregationTypes.CountDistinct]: 'measuresAgg.countDistinct',
  [AggregationTypes.Median]: 'measuresAgg.median',
  [AggregationTypes.Variance]: 'measuresAgg.variance',
  [AggregationTypes.StandardDeviation]: 'measuresAgg.stdev',
};

/**
 * Builds a human-readable measure title from an aggregation type and attribute name.
 *
 * @param aggregation - Measure aggregation type.
 * @param attributeName - Attribute name appended to the aggregation label.
 * @param t - Translation function for aggregation labels.
 * @returns Human-readable measure title.
 * @internal
 */
export function buildMeasureRankingTitle(
  aggregation: AggregationType,
  attributeName: string,
  t: TFunction,
): string {
  const titleKey = AGGREGATION_TITLE_KEYS[aggregation];
  const aggregationLabel = titleKey ? t(titleKey) : aggregation;
  return `${aggregationLabel} ${attributeName}`;
}

function getRankingAttributeDisplayName(attribute: Attribute, t: TFunction): string {
  if (isLevelAttribute(attribute)) {
    return generateAttributeName(t, getColumnNameFromAttribute(attribute), attribute.granularity);
  }
  return attribute.name;
}

/**
 * Returns the ranked-by display label for a measure.
 *
 * @param measure - Measure to display, or null when unset.
 * @param t - Translation function for aggregation labels.
 * @returns Display label for the ranked-by field.
 * @internal
 */
export function getRankingMeasureDisplayName(measure: Measure | null, t: TFunction): string {
  if (!measure) {
    return '';
  }

  if (!isDimensionalBaseMeasure(measure)) {
    return measure.name;
  }

  const aggregation = measure.aggregation as AggregationType;
  const builtTitle = buildMeasureRankingTitle(
    aggregation,
    getRankingAttributeDisplayName(measure.attribute, t),
    t,
  );

  const titleKey = AGGREGATION_TITLE_KEYS[aggregation];
  const aggregationLabel = titleKey ? t(titleKey) : aggregation;
  if (measure.name && builtTitle === `${aggregationLabel} ${measure.name}`) {
    return measure.name;
  }

  return builtTitle;
}
