/**
 * Translation dictionary for English language.
 */
export const translation = {
  errors: {
    measure: {
      unsupportedType: 'Unsupported measure type for measure: {{measureName}}',
      dimensionalCalculatedMeasure: {
        noContext: "DimensionalCalculatedMeasure {{measureName}} must have 'context' property",
      },
      dimensionalBaseMeasure: {
        noAttributeDimExpression:
          "DimensionalBaseMeasure {{measureName}} must have 'attribute'/'dim'/'expression' property",
        noAggAggregation:
          "DimensionalBaseMeasure {{measureName}} must have 'agg' or 'aggregation' property",
      },
    },
    dataModel: {
      noName: "'name' must be specified in config for DataModel",
      noMetadata: "'metadata' must be specified in config for DataModel",
    },
    filter: {
      unsupportedType: 'Unsupported filter type: {{filterType}}',
      unsupportedDatetimeLevel:
        'Filters do not support the following "datetime" levels: Hours, MinutesRoundTo30, MinutesRoundTo15, Minutes, Seconds',
      membersFilterNullMember: 'MembersFilter of {{attributeId}} - member cannot be null',
      unsupportedConditionFilter:
        'Jaql for {{attributeName}} contains unsupported condition filter: {{filter}}',
      formulaFiltersNotSupported:
        'Formula-based filter for {{attributeName}} not supported yet: {{filter}}',
    },
    unsupportedDimensionalElement: 'Unsupported dimensional element type',
  },
};

/**
 * A reference type containing all currently used translation keys.
 * This type serves as a complete resource for creating custom translations,
 * ensuring that all required keys are present and included.
 * It can also be used as Partial to make sure custom translation does not contain any typos.
 *
 * @example
 * ```typescript
 * import { TranslationDictionary } from '@sisense/sdk-data';
 *
 * const customTranslationResources: Partial<TranslationDictionary> = {
 * ```
 * @internal
 */
export type TranslationDictionary = typeof translation;
