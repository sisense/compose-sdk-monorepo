import { TranslationDictionary } from './index.js';

/**
 * Translation dictionary for Ukrainian language.
 */
export const translation: TranslationDictionary = {
  errors: {
    measure: {
      unsupportedType: 'Непідтримуваний тип measure',
      dimensionalCalculatedMeasure: {
        noContext: "DimensionalCalculatedMeasure має мати властивість 'context'",
      },
      dimensionalBaseMeasure: {
        noAttributeDimExpression:
          "DimensionalBaseMeasure має мати властивість 'attribute'/'dim'/'expression'",
        noAggAggregation: "DimensionalBaseMeasure має мати властивість 'agg' або 'aggregation'",
      },
      notAFormula: 'Jaql не формула',
    },
    dataModelConfig: {
      noName: "'name' має бути вказано в конфігурації для DataModel",
      noMetadata: "'metadata' має бути вказано в конфігурації для DataModel",
    },
    filter: {
      unsupportedType: 'Непідтримуваний тип фільтра: {{filterType}}',
      unsupportedDatetimeLevel:
        'Фільтри не підтримують наступні рівні "datetime": Hours, MinutesRoundTo30, MinutesRoundTo15, Minutes, Seconds',
      membersFilterNullMember: 'MembersFilter у {{attributeId}} - member не може бути нульовим',
      unsupportedConditionFilter: 'Jaql містить непідтримуваний condition фільтр: {{filter}}',
      formulaFiltersNotSupported: 'Фільтри, що містять формули наразі не підтримуються: {{filter}}',
    },
    unsupportedDimensionalElement: 'Непідтримуваний тип елемента',
  },
};
