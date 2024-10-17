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
      textWidgetNotSupported: 'Метод {{methodName}} не підтримується для текстового віджету',
      onlyTableWidgetSupported: 'Метод {{methodName}} підтримується тільки для табличних віджетів',
      onlyPivotWidgetSupported: 'Метод {{methodName}} підтримується тільки для півот віджетів',
      onlyTextWidgetSupported: 'Метод {{methodName}} підтримується тільки для текстових віджетів',
      onlyPluginWidgetSupported: 'Метод {{methodName}} підтримується тільки для плагінних віджетів',
    },
    unknownFilterInFilterRelations: 'Логічні відношення фільтрів містять невідомий фільтр',
    filterRelationsNotSupported: 'Відносини фільтрів ще не підтримуються',
    invalidFilterType: 'Недійсний тип фільтра',
    secondsDateTimeLevelSupportedOnlyForLive:
      "Рівень часу в секундах підтримується лише для 'live' джерела даних",
    missingMenuRoot: 'Відсутній ініціалізований корінь меню',
    missingDataSource:
      "Значення 'dataSource' відсутнє. Воно має бути передано явно, або 'defaultDataSource' має бути вказано в SisenseContextProvider.",
  },
  errorBoxText: '$t(common:error): {{errorMessage}}',
  chartNoData: 'Результатів немає',
  criteriaFilter: {
    displayModePrefix: 'Всі елементи',
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
  advanced: {
    tooltip: {
      min: 'Lower Bound',
      max: 'Upper Bound',
      forecastValue: 'Forecast Value',
      forecast: 'Forecast',
      trend: 'Trend',
      trendLocalValue: 'Local Value',
      confidenceInterval: 'Confidence Interval',
      trendType: 'Type',
      trendDataKey: 'Trend Data',
      trendData: {
        min: 'Min',
        max: 'Max',
        median: 'Median',
        average: 'Average',
      },
    },
  },
  arearange: {
    tooltip: {
      min: 'Мінімум',
      max: 'Максимум',
    },
  },
  unsupportedFilterMessage: 'Непідтримуваний Фільтр (застосовано до запиту даних)',
  commonFilter: {
    clearSelectionButton: 'Очистити виділення',
    selectMenuItem: 'Вибрати',
    unselectMenuItem: 'Cкасувати вибір',
  },
  customFilterTileMessage: 'застосовано користувацький фільтр',
  drilldown: {
    drillMenuItem: 'Деталізація',
    breadcrumbsAllSuffix: 'Все',
  },
};
