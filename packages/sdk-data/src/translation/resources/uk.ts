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
      invalidDateValue: 'Значення дати фільтра є недійсним Date',
      dateMeasure: {
        notADateMeasure:
          "'{{measure}}' не є мірою дати, тому рівень '{{level}}', потрібний цьому фільтру, не має для нього сенсу. Використовуйте measureGreaterThan та його родину, щоб фільтрувати числову міру за значенням.",
        levelDimensionMismatch:
          "Рівень '{{level}}' належить до {{levelDimension}}, але '{{measure}}' повертає дату з {{measureDimension}}. Фільтр буде застосовано до {{measureDimension}} і поверне рядки, які виглядають правильно, але для іншого виміру. Передайте рівень із {{measureDimension}}.",
      },
      unexpectedFilterRelationsModelNode: 'Неочікуваний вузол моделі зв’язків фільтрів: {{node}}',
    },
    unsupportedDimensionalElement: 'Непідтримуваний тип елемента',
  },
};
