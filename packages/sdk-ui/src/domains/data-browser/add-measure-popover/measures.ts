import {
  AggregationType,
  AggregationTypes,
  DimensionalAttribute,
  isDimensionalLevelAttribute,
  LevelAttribute,
  MetadataTypes,
} from '@sisense/sdk-data';

type MeasureConfig = {
  titleKey: string;
  name: AggregationType;
  merged?: boolean;
  class: string;
  group: string;
};

const countDistinct: MeasureConfig = {
  titleKey: 'measures.countDistinct',
  name: AggregationTypes.CountDistinct,
  class: 'item-type itype-count',
  merged: true,
  group: 'countsum',
};

const countDuplicates: MeasureConfig = {
  titleKey: 'measures.count',
  name: AggregationTypes.Count,
  class: 'item-type itype-countduplicates',
  group: 'countsum',
};

const sum: MeasureConfig = {
  titleKey: 'measures.sum',
  name: AggregationTypes.Sum,
  class: 'item-type itype-sum',
  group: 'countsum',
};

const min: MeasureConfig = {
  titleKey: 'measures.min',
  name: AggregationTypes.Min,
  class: 'item-type itype-min',
  group: 'stat',
};
const max: MeasureConfig = {
  titleKey: 'measures.max',
  name: AggregationTypes.Max,
  class: 'item-type itype-max',
  group: 'stat',
};
const average: MeasureConfig = {
  titleKey: 'measures.average',
  name: AggregationTypes.Average,
  class: 'item-type itype-avg',
  group: 'stat',
};
const median: MeasureConfig = {
  titleKey: 'measures.median',
  name: AggregationTypes.Median,
  class: 'item-type itype-median',
  group: 'stat',
};
const variance: MeasureConfig = {
  titleKey: 'measures.variance',
  name: AggregationTypes.Variance,
  class: 'item-type itype-var',
  group: 'var',
};
const standardDeviation: MeasureConfig = {
  titleKey: 'measures.stdev',
  name: AggregationTypes.StandardDeviation,
  class: 'item-type itype-stdev',
  group: 'var',
};

const textMeasures: MeasureConfig[] = [countDistinct, countDuplicates];

const numericMeasures: MeasureConfig[] = [
  sum,
  countDistinct,
  countDuplicates,
  min,
  max,
  average,
  median,
  variance,
  standardDeviation,
];

const dateTimeMeasures: MeasureConfig[] = [countDuplicates, countDistinct];

/**
 * @internal
 */
export function getMeasuresListForAttribute(attribute: DimensionalAttribute | LevelAttribute) {
  const typeLowered = attribute.type.toLowerCase();

  const measures =
    typeLowered === MetadataTypes.TextAttribute
      ? textMeasures
      : typeLowered === MetadataTypes.NumericAttribute
      ? numericMeasures
      : isDimensionalLevelAttribute(attribute)
      ? dateTimeMeasures
      : [];

  return measures.filter((measure) => !(attribute.merged || attribute.indexed) || measure.merged);
}
