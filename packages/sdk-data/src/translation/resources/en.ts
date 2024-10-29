/**
 * Translation dictionary for English language.
 */
export const translation = {
  errors: {
    measure: {
      unsupportedType: 'Unsupported measure type',
      dimensionalCalculatedMeasure: {
        noContext: "DimensionalCalculatedMeasure must have 'context' property",
      },
      dimensionalBaseMeasure: {
        noAttributeDimExpression:
          "DimensionalBaseMeasure must have 'attribute'/'dim'/'expression' property",
        noAggAggregation: "DimensionalBaseMeasure must have 'agg' or 'aggregation' property",
      },
      notAFormula: 'Jaql is not a formula',
    },
    dataModelConfig: {
      noName: "'name' must be specified in config for DataModel",
      noMetadata: "'metadata' must be specified in config for DataModel",
    },
    filter: {
      unsupportedType: 'Unsupported filter type: {{filterType}}',
      unsupportedDatetimeLevel:
        'Filters do not support the next "datetime" levels: Hours, MinutesRoundTo30, MinutesRoundTo15, Minutes, Seconds',
      membersFilterNullMember: 'MembersFilter of {{attributeId}} - member cannot be null',
      unsupportedConditionFilter: 'Jaql contains unsupported condition filter: {{filter}}',
      formulaFiltersNotSupported: 'Formula-based filter not supported yet: {{filter}}',
    },
    unsupportedDimensionalElement: 'Unsupported dimensional element type',
  },
};

export type TranslationDictionary = typeof translation;
