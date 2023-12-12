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
    },
    dataModelConfig: {
      noName: "'name' має бути вказано в конфігурації для DataModel",
      noMetadata: "'metadata' має бути вказано в конфігурації для DataModel",
    },
    filter: {
      unsupportedType: 'Непідтримуваний тип фільтра: {{filterType}}',
      unsupportedDatetimeLevel:
        'Фільтри не підтримують наступні рівні "datetime": Hours, MinutesRoundTo30, MinutesRoundTo15',
      membersFilterNullMember: 'MembersFilter у {{attributeId}} - member не може бути нульовим',
    },
    unsupportedDimesionalElement: 'Непідтримуваний тип елемента',
  },
};
