import { TranslationDictionary } from './index.js';

export const translation: TranslationDictionary = {
  errors: {
    noSisenseContext: 'Контекст Sisense не ініціалізовано',
    componentRenderError: 'Не вдалося відобразити компонент',
    sisenseContextNoAuthentication: 'Не вказано метод аутентифікації',
    chartNoSisenseContext:
      'Контекст Sisense для діаграми не знайдено. Щоб виправити, додайте набір даних до Chart або оберніть компонент у SisenseContextProvider.',
    dashboardWidgetNoSisenseContext:
      'Контекст Sisense для віджета дашборди не знайдено. Щоб виправити, оберніть компонент у SisenseContextProvider.',
    dashboardWidgetInvalidIdentifiers:
      'Не вдалося отримати віджет. ' + 'Переконайтеся, що віджет дашборди існує і доступний.',
    dashboardWidgetsInvalidIdentifiers:
      'Не вдалося отримати віджети дашборди. ' + 'Переконайтеся, що дашборда існує і доступна.',
    executeQueryNoSisenseContext:
      'Контекст Sisense для виконання запиту не знайдено. Щоб виправити, оберніть компонент у SisenseContextProvider.',
    executeQueryNoDataSource: 'Не надано dataSource для виконання запиту',
    dataOptions: {
      emptyValueArray: 'Недійсні dataOptions - Масив "value" порожній',
      noDimensionsAndMeasures:
        'Не знайдено ні dimension-ів, ні measure-ів. Параметри даних повинні мати щонайменше один dimension або measure.',
      attributeNotFound: 'Атрибут "{{attributeName}}" не знайдено в даних',
      measureNotFound: 'Measure "{{measureName}}" не знайдено в даних',
      filterAttributeNotFound: 'Атрибут фільтра "{{attributeName}}" не знайдено в даних',
      highlightAttributeNotFound: 'Атрибут виділення "{{attributeName}}" не знайдено в даних',
    },
    themeNotFound: 'Тему з oid {{themeOid}} не знайдено на Sisense-сервері',
    paletteNotFound: 'Палітру "{{paletteName}}" не знайдено на Sisense-сервері',
    chartTypeNotSupported: 'Тип діаграми {{chartType}} не підтримується',
    chartInvalidProps: 'Недійсні параметри діаграми',
    unsupportedWidgetType:
      'Неможливо отримати властивості для непідтримуваного типу віджета - {{widgetType}}',
    sisenseContextNotFound: 'Контекст Sisense не знайдено. Переконайтеся, що він наданий.',
    dashboardInvalidIdentifier:
      'Не вдалося отримати дашборд. Переконайтеся, що дашборд існує і доступний.',
    sharedFormula: {
      identifierExpected:
        'Не вдалося ідентифікувати загальну формулу. Будь ласка, надайте oid або пару name та datasource',
      failedToFetch: 'Не вдалося отримати спільну формулу',
    },
    widgetModel: {
      pivotWidgetNotSupported: 'Метод {{methodName}} не підтримується для півот віджету',
      onlyTableWidgetSupported: 'Метод {{methodName}} підтримуються тільки для табличним віджетом',
      onlyPivotWidgetSupported: 'Метод {{methodName}} підтримуються тільки для півот віджетом',
    },
    unknownFilterInFilterRelations: 'Логічні відношення фільтрів містять невідомий фільтр',
    filterRelationsNotSupported: 'Відносини фільтрів ще не підтримуються',
  },
  errorBoxText: '$t(common:error): {{errorMessage}}',
  chartNoData: 'Результатів немає',
  criteriaFilter: {
    equals: 'Дорівнює {{val}}',
    notEquals: 'Не дорівнює {{val}}',
    lessThan: 'Менше ніж {{val}}',
    lessThanOrEqual: 'Менше або дорівнює {{val}}',
    greaterThan: 'Більше ніж {{val}}',
    greaterThanOrEqual: 'Більше або дорівнює {{val}}',
    between: 'Між {{valA}} та {{valB}}',
    notBetween: 'Не між {{valA}} та {{valB}}',
    top: 'Перші {{valA}} за {{valB}}',
    bottom: 'Останні {{valA}} за {{valB}}',
    is: 'Є {{val}}',
    isNot: 'Не є {{val}}',
    contains: 'Містить {{val}}',
    notContains: `Не містить {{val}}`,
    startsWith: 'Починається з {{val}}',
    notStartsWith: `Не починається з {{val}}`,
    endsWith: 'Закінчується на {{val}}',
    notEndsWith: `Не закінчується на {{val}}`,
    like: 'Схоже на {{val}}',
    byMeasure: 'By measure',
    by: 'by',
  },
  dateFilter: {
    last: 'Last',
    next: 'Next',
    from: 'From',
    count: 'Count',
    today: 'Today',
    days: 'Days',
    weeks: 'Weeks',
    months: 'Months',
    quarters: 'Quarters',
    years: 'Years',
    earliestDate: 'Earliest Date',
    latestDate: 'Latest Date',
    todayOutOfRange: 'Today is out of available date range',
  },
  boxplot: {
    tooltip: {
      whiskers: 'Вуса',
      box: 'Коробка',
      min: 'Мінімум',
      median: 'Медіана',
      max: 'Максимум',
    },
  },
  arearange: {
    tooltip: {
      min: 'Мінімум',
      max: 'Максимум',
    },
  },
  unsupportedFilter: {
    title: 'Непідтримуваний Фільтр',
    message: 'Застосовано до запиту даних',
  },
};
