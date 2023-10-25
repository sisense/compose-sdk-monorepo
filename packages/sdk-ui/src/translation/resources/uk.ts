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
    unsupportedWidgetType:
      'Неможливо отримати властивості для непідтримуваного типу віджета - {{widgetType}}',
    sisenseContextNotFound: 'Контекст Sisense не знайдено. Переконайтеся, що він наданий.',
    dashboardInvalidIdentifier:
      'Не вдалося отримати дашборд. Переконайтеся, що дашборд існує і доступний.',
  },
  errorBoxText: '$t(common:error): {{errorMessage}}',
  chartNoData: 'Результатів немає',
};
