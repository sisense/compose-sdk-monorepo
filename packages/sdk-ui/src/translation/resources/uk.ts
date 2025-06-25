import { TranslationDictionary } from './index.js';

export const translation: TranslationDictionary = {
  errors: {
    noSisenseContext: 'Контекст Sisense не ініціалізовано',
    restApiNotReady: 'Rest API не ініціалізовано',
    componentRenderError: 'Не вдалося відобразити компонент',
    sisenseContextNoAuthentication: 'Не вказано метод аутентифікації',
    chartNoSisenseContext:
      'Контекст Sisense для діаграми не знайдено. Щоб виправити, додайте набір даних до Chart або оберніть компонент у SisenseContextProvider.',
    widgetByIdNoSisenseContext:
      'Контекст Sisense для віджета дашборди не знайдено. Щоб виправити, оберніть компонент у SisenseContextProvider.',
    widgetByIdInvalidIdentifier:
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
    optionsTranslation: {
      invalidStyleOptions: "Недійсні параметри `styleOptions` для діаграми '{{chartType}}'",
      invalidInternalDataOptions:
        "Параметри `dataOptions` некоректно перетворені для діаграми '{{chartType}}'",
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
      incomleteWidget: 'Неможливо створити DTO віджету через неповноту властивості ({{prop}})',
      unsupportedWidgetTypeDto: 'Сберігання віджету типу {{chartType}} не підтримується',
      pivotWidgetNotSupported: 'Метод {{methodName}} не підтримується для півот віджету',
      textWidgetNotSupported: 'Метод {{methodName}} не підтримується для текстового віджету',
      onlyTableWidgetSupported: 'Метод {{methodName}} підтримується тільки для табличних віджетів',
      onlyPivotWidgetSupported: 'Метод {{methodName}} підтримується тільки для півот віджетів',
      onlyTextWidgetSupported: 'Метод {{methodName}} підтримується тільки для текстових віджетів',
      onlyCustomWidgetSupported: 'Метод {{methodName}} підтримується тільки для кастомних віджетів',
      unsupportedWidgetType: 'Тип віджету {{widgetType}} не підтримується',
      unsupportedFusionWidgetType: 'Тип Fusion віджету {{widgetType}} не підтримується',
    },
    unknownFilterInFilterRelations: 'Логічні відношення фільтрів містять невідомий фільтр',
    filterRelationsNotSupported: 'Відносини фільтрів ще не підтримуються',
    invalidFilterType: 'Недійсний тип фільтра',
    secondsDateTimeLevelSupportedOnlyForLive:
      "Рівень часу в секундах підтримується лише для 'live' джерела даних",
    missingMenuRoot: 'Відсутній ініціалізований корінь меню',
    missingModalRoot: 'Відсутній ініціалізований корінь модального вікна',
    missingDataSource:
      "Значення 'dataSource' відсутнє. Воно має бути передано явно, або 'defaultDataSource' має бути вказано в SisenseContextProvider.",
    incorrectOnDataReadyHandler: "'onDataReady' має повертати дійсний об'єкт даних",
    undefinedDataSource: 'Не задане джерело даних',
    emptyModel: 'Пуста модель',
    missingMetadata: 'Поле metadata відсутнє',
    missingModelTitle: 'Не знайдено заголовоку моделі',
    httpClientNotFound: 'HttpClient не знайдено',
    serverSettingsNotLoaded: 'Failed to load server settings',
    requiredColumnMissing: "Відсутній обов'язковий стовпець",
    unexpectedChartType: 'Невідомий тип графіка: {{chartType}}',
    noRowNumColumn: 'Дані не містять row num column',
    ticIntervalCalculationFailed:
      'Неможливо обрахувати tic interval. Спробуйте задати datetime granularity.',
    polarChartDesignOptionsExpected: 'Polar chart design options очікуються для polar chart',
    polarChartDesignOptionsNotExpected:
      'Polar chart design options не очікуються для non-polar chart',
    indicatorInvalidRelativeSize: 'Невірні опції relative size',
    unsupportedMapType: 'Непідтримуваний тип мапи: {{mapType}}',
    mapLoadingFailed: 'Не вдалося завантажити мапу',
    cascadingFilterOriginalNotFound:
      'Помилка при реструктуризації каскадних фільтрів. Оригінальний фільтр не знайдено',
    dashboardLoadFailed: 'Не вдалося завантажити Dashboard. {{error}}',
    widgetLoadFailed: 'Не вдалося завантажити віджет. {{error}}',
    dashboardWithOidNotFound: 'Dashboard з oid {{dashboardOid}} не знайдено',
    failedToAddWidget: 'Не вдалося додати віджет',
    widgetWithOidNotFound: 'Віджет з oid {{widgetOid}} не знайдено',
    widgetWithOidNotFoundInDashboard:
      'Віджет з oid {{widgetOid}} не знайдено в Dashboard з oid {{dashboardOid}}',
    widgetEmptyResponse: 'Пуста відповідь для віджета з oid {{widgetOid}}',
    dateFilterIncorrectOperator: 'Некорректний оператор: {{operator}}',
    synchronizedFilterInvalidProps:
      '`useSynchronizedFilter` хук потребує одне з [non-null `filterFromProps`] чи [`createEmptyFilter` function]',
    methodNotImplemented: 'Метод не реалізовано.',
    noPivotClient: 'Pivot client не ініціалізовано',
    unexpectedCacheValue: 'Неочікуване значення кешу',
    notAMembersFilter: 'Фільтр не є MembersFilter',
    drilldownNoInitialDimension:
      'Initial dimension має бути задано щоб використовувати drilldown з користувацькими компонентами',
    otherWidgetTypesNotSupported: 'Інші типи віджетів поки що не підтримуються',
    dataBrowser: {
      dimensionNotFound: 'Dimension з id {{dimensionId}} не знайдено',
      attributeNotFound: 'Attribute з id {{attributeId}} не знайдено',
    },
    addFilterPopover: {
      noDataSources:
        'Не знайдено жодного джерела даних. Спробуйте задати `dataSource` у віджетах або `defaultDataSource` на рівні дашборди.',
    },
    tabberInvalidConfiguration: 'Конфігурація Tabber віджета невірна',
  },
  errorBoxText: '$t(common:error): {{errorMessage}}',
  chartNoData: 'Результатів немає',
  filters: 'Фільтри',
  widgetDetails: 'Деталі віджета',
  cancel: 'Відміна',
  includeAll: 'Всі елементи',
  formatting: {
    number: {
      abbreviations: {
        thousand: 'Тис.',
        million: 'Млн',
        billion: 'Млрд',
        trillion: 'Трлн',
      },
    },
  },
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
    last: 'Останній',
    next: 'Наступний',
    from: 'Від',
    to: 'До',
    count: 'Кількість',
    select: 'Вибрати',
    today: 'Сьогодні',
    days: 'Дні',
    weeks: 'Тижні',
    months: 'Місяці',
    quarters: 'Квартали',
    years: 'Роки',
    earliestDate: 'Найбільш Рання Дата',
    latestDate: 'Найбільш Пізня Дата',
    todayOutOfRange: 'Сьогоднішній день поза доступним діапазоном дат',
    dateRange: {
      fromTo: '{{from}} до {{to}}',
      from: 'Від {{val}}',
      to: 'До {{val}}',
    },
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
  treemap: {
    tooltip: {
      ofTotal: 'загальної кількості',
      of: 'з',
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
  dashboard: {
    toolbar: {
      undo: 'Скасувати',
      redo: 'Повторити',
      cancel: 'Відмінити',
      apply: 'Застосувати',
      editLayout: 'Редагувати макет',
      viewMode: 'Режим перегляду',
    },
  },
  unsupportedFilterMessage: 'Непідтримуваний Фільтр (застосовано до запиту даних)',
  unsupportedFilter: 'Непідтримуваний фільтр {{filter}}',
  commonFilter: {
    clearSelectionButton: 'Очистити виділення',
    selectMenuItem: 'Вибрати',
    unselectMenuItem: 'Cкасувати вибір',
  },
  customFilterTileMessage: 'застосовано користувацький фільтр',
  drilldown: {
    drillMenuItem: 'Деталізація',
    breadcrumbsAllSuffix: 'Все',
    breadcrumbsPrev: 'Попередній',
    breadcrumbsNext: 'Наступний',
    popover: {
      members: 'Учасники',
      table: 'Таблиця',
      column: 'Колонка',
    },
  },
  widgetHeader: {
    info: {
      details: 'Деталі віджета',
      tooltip: 'Натисніть щоб побачити повну інформацію',
    },
    menu: {
      deleteWidget: 'Видалити віджет',
      distributeEqualWidth: 'Розподілити порівну в цьому рядку',
    },
  },
  customWidgets: {
    registerPrompt:
      'Невідомий кастомний віджет: {{customWidgetType}}. Будь ласка зареєструйте цей кастомний віджет щоб він міг бути відображений.',
  },
  ai: {
    analyticsChatbot: 'Аналітичний чат-бот',
    dataTopics: 'Теми Даних',
    chatbotDescription:
      'Аналітичний чат-бот розроблено, щоб допомогти вам взаємодіяти з вашими даними за допомогою розмовної мови.',
    topicSelectPrompt: 'Виберіть тему, яку б ви хотіли дослідити:',
    preview: 'Попередній перегляд',
    clearHistoryPrompt: 'Ви дійсно хочете очистити чат?',
    config: {
      inputPromptText: 'Поставте запитання або введіть «/» для отримання ідей',
      welcomeText:
        'Вітаємо в Аналітичному помічнику! Я можу допомогти вам досліджувати та зрозуміти ваші дані.',
      suggestionsWelcomeText: 'Деякі запитання, які у вас можуть виникнути:',
    },
    buttons: {
      insights: 'Інсайти',
      correctResponse: 'Коректна відповідь',
      incorrectResponse: 'Некоректна відповідь',
      clearChat: 'Очистити чат',
      refresh: 'Оновити',
      readMore: 'Читати ще',
      collapse: 'Згорнути',
      yes: 'Так',
      no: 'Ні',
      seeMore: 'Більше',
    },
    disclaimer: {
      poweredByAi: 'Вміст створено за допомогою ШІ, тому можливі несподіванки та помилки.',
      rateRequest: ' Будь ласка, оцінюйте відповіді, щоб ми могли покращити продукт!',
    },
    errors: {
      chatUnavailable: 'Чат недоступний. Спробуйте пізніше.',
      fetchHistory: 'Щось пішло не так, і ми не змогли відновити історію чату. Почнімо спочатку!',
      recommendationsNotAvailable:
        'Наразі рекомендації недоступні. Спробуйте ще раз через кілька хвилин.',
      insightsNotAvailable: 'Немає доступних інсайтів.',
      VectorDBEmptyResponseError:
        'AI ще конфігурується, будь ласка зачекайте та спробуйте ще раз за хвилинку чи дві.',
      LlmBadConfigurationError:
        'Схоже що LLM невірно сконфігурований. Зверніться до вашого Адміністратора щоб він оновив конфігурацію LLM провайдера.',
      ChartTypeUnsupportedError: 'Графік такого типу покищо не підтримується.',
      BlockedByLlmContentFiltering:
        'Це питання заблоковано нашою політикою керування вмістом. Будь ласка спробуйте поставити інше запитання.',
      LlmContextLengthExceedsLimitError:
        'Схоже ви досягли ліміту кількості сповіщеннь, будь ласка очистіть поточний чат аби розпочати новий.',
      UserPromptExeedsLimitError:
        'Цей запит перевищює максимально дозволений ліміт. Будь ласка перефразуйте та зробіть запит коротше.',
      unexpectedChatResponse:
        'Ой, щось пішло не так. Повторіть спробу пізніше або спробуйте поставити інше запитання.',
      unexpected: 'Ой, лихо! Шось йому стало. Спробуйте трохи пізніше.',
      unknownResponse: 'Отримано невідомий тип відповіді, необроблена відповідь=',
      invalidInput: 'Недійсне введення',
      noAvailableDataTopics: 'Жодне з наданих моделей даних або перспектив доступне',
    },
  },
  filterRelations: {
    and: 'І',
    or: 'АБО',
    andOrFormulaApplied: 'Застосовано формулу І/АБО',
  },
  attribute: {
    datetimeName: {
      years: 'Роки в {{columnName}}',
      quarters: 'Квартали в {{columnName}}',
      months: 'Місяці в {{columnName}}',
      weeks: 'Тижні в {{columnName}}',
      days: 'Дні в {{columnName}}',
      hours: 'Години в {{columnName}}',
      minutes: 'Хвилини в {{columnName}}',
    },
  },
  filterEditor: {
    buttons: {
      apply: 'Застосувати',
      cancel: 'Відміна',
      selectAll: 'Обрати всі',
      clearAll: 'Очистити всі',
    },
    labels: {
      includeAll: 'Обрати всі (фільтр не використовується)',
      allowMultiSelection: 'Дозволити вибір кількох значень для списків',
      from: 'Від',
      to: 'До',
      includeCurrent: 'Включаючи поточний',
    },
    placeholders: {
      selectFromList: 'Виберіть зі списку',
      enterEntry: 'Введіть значення...',
      enterValue: 'Введіть значення...',
      select: 'Вибрати',
    },
    conditions: {
      exclude: 'Не є',
      contains: 'Mістить',
      notContain: 'Не містить',
      startsWith: 'Починається з',
      notStartsWith: 'Не починається з',
      endsWith: 'Закінчується на',
      notEndsWith: 'Не закінчується на',
      equals: 'Дорівнює',
      notEquals: 'Не дорівнює',
      isEmpty: 'Порожній',
      isNotEmpty: 'Не порожній',
      lessThan: 'Менше ніж',
      lessThanOrEqual: 'Менше або дорівнює',
      greaterThan: 'Більше ніж',
      greaterThanOrEqual: 'Більше або дорівнює',
      isWithin: 'В межах',
    },
    validationErrors: {
      invalidNumber: 'Тільки цифри',
      invalidNumericRange: '"До" має бути більше, ніж "Від"',
    },
    datetimeLevels: {
      year: 'Year',
      quarter: 'Quarter',
      month: 'Month',
      week: 'Week',
      day: 'Day',
      aggrigatedHour: 'Hour (aggregated)',
      aggrigatedMinutesRoundTo15: '15-min (aggregated)',
    },
    relativeTypes: {
      last: 'Останній',
      this: 'Поточний',
      next: 'Наступний',
    },
    datetimePositions: {
      before: 'Перед',
      after: 'Після',
    },
  },
  pivotTable: {
    grandTotal: 'Загальний підсумок',
    subTotal: 'Усього {{value}}',
  },
  dataBrowser: {
    addFilter: 'Додати фільтр',
    selectField: 'Вибрати поле',
    configureFilter: 'Налаштувати фільтр',
    noResults: 'Немає результатів',
    searchPlaceholder: 'Пошук',
  },
  jumpToDashboard: {
    defaultCaption: 'Перейти до',
  },
};
