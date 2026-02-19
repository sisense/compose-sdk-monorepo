import { TranslationDictionary } from './index.js';

/**
 * Translation dictionary for Ukrainian language.
 */
export const translation: TranslationDictionary = {
  errors: {
    measure: {
      unsupportedType: 'Непідтримуваний тип measure: {{measureName}}',
      dimensionalCalculatedMeasure: {
        noContext: "DimensionalCalculatedMeasure {{measureName}} має мати властивість 'context'",
      },
      dimensionalBaseMeasure: {
        noAttributeDimExpression:
          "DimensionalBaseMeasure {{measureName}} має мати властивість 'attribute'/'dim'/'expression'",
        noAggAggregation:
          "DimensionalBaseMeasure {{measureName}} має мати властивість 'agg' або 'aggregation'",
      },
    },
    dataModel: {
      noName: "'name' має бути вказано в конфігурації для DataModel",
      noMetadata: "'metadata' має бути вказано в конфігурації для DataModel",
    },
    filter: {
      unsupportedType: 'Непідтримуваний тип фільтра: {{filterType}}',
      unsupportedDatetimeLevel:
        'Фільтри не підтримують наступні рівні "datetime": Hours, MinutesRoundTo30, MinutesRoundTo15, Minutes, Seconds',
      membersFilterNullMember: 'MembersFilter у {{attributeId}} - member не може бути нульовим',
      unsupportedConditionFilter:
        'Jaql для {{attributeName}} містить непідтримуваний condition фільтр: {{filter}}',
      formulaFiltersNotSupported:
        'Фільтри, що містять формули для {{attributeName}} наразі не підтримуються: {{filter}}',
    },
    unsupportedDimensionalElement: 'Непідтримуваний тип елемента',
  },
};
