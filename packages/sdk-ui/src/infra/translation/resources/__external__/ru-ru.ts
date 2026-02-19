import type { TranslationDictionary } from '../index';
import { PACKAGE_NAMESPACE as SDK_UI_NAMESPACE } from '../index';

/**
 * Translation dictionary for Russian language.
 */
const translation: TranslationDictionary = {
  errors: {
    noSisenseContext: 'Контекст Sisense не инициализирован',
    restApiNotReady: 'REST API не инициализирован',
    componentRenderError: 'Не удалось отобразить компонент',
    sisenseContextNoAuthentication: 'Метод аутентификации не указан',
    chartNoSisenseContext:
      'Контекст Sisense для графика не найден. Чтобы исправить, оберните компонент провайдером контекста Sisense или предоставьте существующий набор данных через props.',
    widgetByIdNoSisenseContext:
      'Контекст Sisense для виджета панели не найден. Чтобы исправить, оберните компонент провайдером контекста Sisense.',
    widgetByIdInvalidIdentifier:
      'Не удалось получить виджет {{widgetOid}} с панели {{dashboardOid}}. ' +
      'Убедитесь, что виджет панели существует и доступен.',
    dashboardWidgetsInvalidIdentifiers:
      'Не удалось получить виджеты панели {{dashboardOid}}. ' +
      'Убедитесь, что панель существует и доступна.',
    executeQueryNoSisenseContext:
      'Контекст Sisense для выполнения запроса не найден. Чтобы исправить, оберните компонент провайдером контекста Sisense.',
    executeQueryNoDataSource: 'Не предоставлен dataSource для выполнения запроса',
    dataOptions: {
      noDimensionsAndMeasures:
        'Не найдено ни измерений, ни показателей. Параметры данных должны содержать хотя бы одно измерение или показатель.',
      attributeNotFound: 'Атрибут "{{attributeName}}" не найден в данных',
      measureNotFound: 'Показатель "{{measureName}}" не найден в данных',
      filterAttributeNotFound: 'Атрибут фильтра "{{attributeName}}" не найден в данных',
      highlightAttributeNotFound: 'Атрибут выделения "{{attributeName}}" не найден в данных',
    },
    optionsTranslation: {
      invalidStyleOptions: "Недопустимые параметры стиля для графика '{{chartType}}'",
      invalidInternalDataOptions:
        "Параметры данных неправильно преобразованы для графика '{{chartType}}'",
    },
    themeNotFound: 'Тема с oid {{themeOid}} не найдена в подключенной среде Sisense',
    paletteNotFound: "Палитра '{{paletteName}}' не найдена в подключенной среде Sisense",
    chartTypeNotSupported: 'Тип графика {{chartType}} не поддерживается',
    chartInvalidProps: 'Недопустимые props графика для типа графика: {{chartType}}',
    unsupportedWidgetType:
      'Не удалось извлечь props для неподдерживаемого типа виджета - {{widgetType}}',
    dashboardInvalidIdentifier:
      'Не удалось получить панель {{dashboardOid}}. Убедитесь, что панель существует и доступна текущему пользователю.',
    sharedFormula: {
      identifierExpected:
        'Не удалось получить общую формулу. Укажите oid или name и datasource. ' +
        'Предоставленные значения: name={{name}}, dataSource={{dataSource}}, oid={{oid}}',
      failedToFetchByOid: 'Не удалось получить общую формулу по oid {{oid}}',
      failedToFetchByName:
        'Не удалось получить общую формулу по name {{name}} и dataSource {{dataSource}}',
    },
    widgetModel: {
      incompleteWidget:
        'WidgetModelTranslator: Виджет не может быть преобразован в DTO из-за неполного свойства ({{prop}})',
      unsupportedWidgetTypeDto:
        'WidgetModelTranslator: Сохранение виджета типа {{chartType}} не поддерживается',
      pivotWidgetNotSupported:
        'WidgetModelTranslator: Сводный виджет не поддерживается для метода {{methodName}}',
      textWidgetNotSupported:
        'WidgetModelTranslator: Текстовый виджет не поддерживается для метода {{methodName}}',
      onlyTableWidgetSupported:
        'WidgetModelTranslator: Только табличный виджет поддерживается для метода {{methodName}}',
      onlyPivotWidgetSupported:
        'WidgetModelTranslator: Только сводный виджет поддерживается для метода {{methodName}}',
      onlyTextWidgetSupported:
        'WidgetModelTranslator: Только текстовый виджет поддерживается для метода {{methodName}}',
      onlyCustomWidgetSupported:
        'WidgetModelTranslator: Только пользовательский виджет поддерживается для метода {{methodName}}',
      unsupportedWidgetType: 'Неподдерживаемый тип виджета: {{widgetType}}',
      unsupportedFusionWidgetType: 'Неподдерживаемый тип виджета Fusion: {{widgetType}}',
    },
    unknownFilterInFilterRelations:
      'Связь фильтров содержит фильтр {{filterGuid}}, который не был найден в предоставленных фильтрах',
    invalidFilterType: 'Недопустимый тип фильтра. Ожидается: {{filterType}}',
    secondsDateTimeLevelIsNotSupported:
      "Уровень даты/времени 'seconds' не поддерживается для этого источника данных",
    missingMenuRoot: 'Отсутствует инициализированный корень меню',
    missingModalRoot: 'Отсутствует инициализированный корень модального окна',
    missingDataSource:
      "Отсутствует значение 'dataSource'. Оно должно быть предоставлено явно, или в провайдере контекста Sisense должен быть указан 'defaultDataSource'.",
    incorrectOnDataReadyHandler:
      "Обработчик 'onDataReady' должен возвращать допустимый объект данных",
    emptyModel: 'Пустая модель',
    missingMetadata: 'Отсутствуют метаданные',
    missingModelTitle: 'Отсутствует заголовок модели',
    httpClientNotFound: 'HttpClient не найден.',
    serverSettingsNotLoaded: 'Не удалось загрузить настройки сервера',
    requiredColumnMissing: 'Отсутствует обязательный столбец. {{hint}}',
    unexpectedChartType: 'Неожиданный тип графика: {{chartType}}',
    noRowNumColumn: 'В данных отсутствует столбец row num: {{columnName}}',
    tickIntervalCalculationFailed:
      'Не удалось вычислить интервал делений. Попробуйте указать детализацию даты/времени.',
    polarChartDesignOptionsExpected:
      'Для полярной диаграммы ожидаются параметры оформления полярной диаграммы',
    polarChartDesignOptionsNotExpected:
      'Параметры оформления полярной диаграммы не ожидаются для неполярной диаграммы',
    indicatorInvalidRelativeSize:
      'Недопустимые параметры относительного размера для графика индикатора',
    unsupportedMapType: 'Неподдерживаемый тип карты: {{mapType}}',
    mapLoadingFailed: 'Не удалось загрузить карту',
    cascadingFilterOriginalNotFound:
      'Ошибка при пересборке каскадных фильтров. Исходный каскадный фильтр не найден',
    dashboardLoadFailed: 'Не удалось загрузить панель. {{error}}',
    widgetLoadFailed: 'Не удалось загрузить виджет. {{error}}',
    failedToAddWidget: 'Не удалось добавить виджет на панель',
    widgetEmptyResponse: 'Пустой ответ для виджета с oid {{widgetOid}}',
    dateFilterIncorrectOperator: 'Неправильный оператор: {{operator}}',
    synchronizedFilterInvalidProps:
      'Хук `useSynchronizedFilter` должен использовать хотя бы один из [non-null `filterFromProps`] или [функция `createEmptyFilter`]',
    unexpectedCacheValue: 'Неожиданное значение кэша',
    notAMembersFilter: 'Фильтр не является MembersFilter',
    drilldownNoInitialDimension:
      'Начальное измерение должно быть указано для использования детализации с пользовательскими компонентами',
    otherWidgetTypesNotSupported: 'Другие типы виджетов пока не поддерживаются',
    dataBrowser: {
      dimensionNotFound: 'Измерение с id {{dimensionId}} не найдено',
      attributeNotFound: 'Атрибут с id {{attributeId}} не найден',
    },
    addFilterPopover: {
      noDataSources:
        'Нет доступных источников данных. Попробуйте определить `dataSource` в виджетах или `defaultDataSource` на уровне панели.',
    },
    tabberInvalidConfiguration: 'Конфигурация виджета Tabber недопустима',
  },
  errorBoxText: '$t(common:error): {{errorMessage}}',
  chartNoData: 'Нет результатов',
  filters: 'Фильтры',
  cancel: 'Отмена',
  includeAll: 'Включить все',
  formatting: {
    number: {
      abbreviations: {
        thousand: 'К',
        million: 'М',
        billion: 'Млрд',
        trillion: 'Т',
      },
    },
  },
  criteriaFilter: {
    displayModePrefix: 'Все элементы',
    equals: 'Равно {{val}}',
    notEquals: 'Не равно {{val}}',
    lessThan: 'Меньше {{val}}',
    lessThanOrEqual: 'Меньше или равно {{val}}',
    greaterThan: 'Больше {{val}}',
    greaterThanOrEqual: 'Больше или равно {{val}}',
    between: 'Между {{valA}} и {{valB}}',
    notBetween: 'Не между {{valA}} и {{valB}}',
    top: 'Топ {{valA}} по {{valB}}',
    bottom: 'Последние {{valA}} по {{valB}}',
    is: 'Равно {{val}}',
    isNot: 'Не равно {{val}}',
    contains: 'Содержит {{val}}',
    notContains: `Не содержит {{val}}`,
    startsWith: 'Начинается с {{val}}',
    notStartsWith: `Не начинается с {{val}}`,
    endsWith: 'Заканчивается на {{val}}',
    notEndsWith: `Не заканчивается на {{val}}`,
    like: 'Похоже на {{val}}',
    byMeasure: 'По показателю',
    by: 'по',
  },
  dateFilter: {
    last: 'Последний',
    next: 'Следующий',
    from: 'С',
    to: 'По',
    count: 'Количество',
    select: 'Выбрать',
    today: 'Сегодня',
    days: 'Дни',
    weeks: 'Недели',
    months: 'Месяцы',
    quarters: 'Кварталы',
    years: 'Годы',
    earliestDate: 'Самая ранняя дата',
    latestDate: 'Самая поздняя дата',
    todayOutOfRange: 'Сегодня находится вне доступного диапазона дат',
    dateRange: {
      fromTo: '{{from}} по {{to}}',
      from: 'С {{val}}',
      to: 'По {{val}}',
    },
  },
  boxplot: {
    tooltip: {
      whiskers: 'Усы',
      box: 'Коробка',
      min: 'Мин',
      median: 'Медиана',
      max: 'Макс',
    },
  },
  treemap: {
    tooltip: {
      ofTotal: 'от общего',
      of: 'из',
    },
  },
  advanced: {
    tooltip: {
      min: 'Нижняя граница',
      max: 'Верхняя граница',
      forecastValue: 'Прогнозное значение',
      forecast: 'Прогноз',
      trend: 'Тренд',
      trendLocalValue: 'Локальное значение',
      confidenceInterval: 'Доверительный интервал',
      trendType: 'Тип',
      trendDataKey: 'Данные тренда',
      trendData: {
        min: 'Мин',
        max: 'Макс',
        median: 'Медиана',
        average: 'Среднее',
      },
    },
  },
  arearange: {
    tooltip: {
      min: 'Мин',
      max: 'Макс',
    },
  },
  unsupportedFilterMessage: 'Неподдерживаемый фильтр (применен к запросу данных)',
  unsupportedFilter: 'Неподдерживаемый фильтр {{filter}}',
  commonFilter: {
    clearSelectionButton: 'Очистить выбор',
    selectMenuItem: 'Выбрать',
    unselectMenuItem: 'Снять выбор',
  },
  customFilterTileMessage: 'отфильтровано пользовательским фильтром',
  filterRelations: {
    and: 'И',
    or: 'ИЛИ',
    andOrFormulaApplied: 'Применена формула И/ИЛИ',
  },
  drilldown: {
    drillMenuItem: 'Детализация',
    breadcrumbsAllSuffix: 'Все',
    breadcrumbsPrev: 'Предыдущий',
    breadcrumbsNext: 'Следующий',
    popover: {
      members: 'Участники',
      table: 'Таблица',
      column: 'Столбец',
    },
  },
  widgetHeader: {
    info: {
      details: 'Детали виджета',
      tooltip: 'Нажмите, чтобы просмотреть полные детали',
    },
    menu: {
      deleteWidget: 'Удалить виджет',
      distributeEqualWidth: 'Равномерно распределить в этой строке',
    },
  },
  customWidgets: {
    registerPrompt:
      'Неизвестный тип пользовательского виджета: {{customWidgetType}}. Пожалуйста, зарегистрируйте этот пользовательский виджет.',
  },
  ai: {
    analyticsChatbot: 'Аналитический чат-бот',
    dataTopics: 'Темы данных',
    chatbotDescription:
      'Аналитический чат-бот предназначен для помощи во взаимодействии с данными с использованием естественного языка.',
    topicSelectPrompt: 'Выберите тему, которую вы хотели бы изучить:',
    preview: 'Предварительный просмотр',
    clearHistoryPrompt: 'Вы хотите очистить этот чат?',
    config: {
      inputPromptText: 'Задайте вопрос или введите "/" для идей',
      welcomeText:
        'Добро пожаловать в Аналитический помощник! Я могу помочь вам изучить и получить информацию из ваших данных.',
      suggestionsWelcomeText: 'Некоторые вопросы, которые у вас могут возникнуть:',
    },
    buttons: {
      insights: 'Информация',
      correctResponse: 'Правильный ответ',
      incorrectResponse: 'Неправильный ответ',
      clearChat: 'Очистить чат',
      refresh: 'Обновить',
      readMore: 'Читать далее',
      collapse: 'Свернуть',
      yes: 'Да',
      no: 'Нет',
      seeMore: 'Смотреть больше',
    },
    disclaimer: {
      poweredByAi: 'Контент создан с помощью ИИ, поэтому возможны сюрпризы и ошибки.',
      rateRequest: 'Пожалуйста, оцените ответы, чтобы мы могли улучшиться!',
    },
    errors: {
      chatUnavailable: 'Чат недоступен. Пожалуйста, попробуйте позже.',
      fetchHistory:
        'Что-то пошло не так, и мы не смогли получить ветку чата. Давайте начнем заново!',
      recommendationsNotAvailable:
        'Рекомендации сейчас недоступны. Попробуйте еще раз через несколько минут.',
      insightsNotAvailable: 'Нет доступной информации.',
      VectorDBEmptyResponseError:
        'Конфигурация ИИ еще не готова, подождите несколько минут и попробуйте снова.',
      LlmBadConfigurationError:
        'Конфигурация LLM неверна. Обратитесь к администратору, чтобы обновить конфигурацию провайдера LLM.',
      ChartTypeUnsupportedError: 'Запрошенный тип графика не поддерживается.',
      BlockedByLlmContentFiltering:
        'Этот вопрос заблокирован нашей политикой управления контентом. Пожалуйста, попробуйте задать другой вопрос.',
      LlmContextLengthExceedsLimitError:
        'Похоже, вы достигли лимита длины сообщения, пожалуйста, очистите этот разговор.',
      UserPromptExeedsLimitError:
        'Запрос превышает лимит. Переформулируйте свой вопрос и используйте более короткий запрос.',
      unexpectedChatResponse:
        'Упс, что-то пошло не так. Пожалуйста, попробуйте позже или попробуйте задать другой вопрос.',
      unexpected: 'Упс, что-то пошло не так. Пожалуйста, попробуйте позже.',
      unknownResponse: 'Получен неизвестный responseType, необработанный ответ=',
      invalidInput: 'Недопустимый ввод',
      noAvailableDataTopics: 'Ни одна из предоставленных моделей данных или перспектив недоступна',
    },
  },
  attribute: {
    datetimeName: {
      years: 'Годы в {{columnName}}',
      quarters: 'Кварталы в {{columnName}}',
      months: 'Месяцы в {{columnName}}',
      weeks: 'Недели в {{columnName}}',
      days: 'Дни в {{columnName}}',
      hours: 'Часы в {{columnName}}',
      minutes: 'Минуты в {{columnName}}',
    },
  },
  filterEditor: {
    buttons: {
      apply: 'Применить',
      cancel: 'Отмена',
      selectAll: 'Выбрать все',
      clearAll: 'Очистить все',
    },
    labels: {
      includeAll: 'Включить все (фильтр не применен)',
      allowMultiSelection: 'Разрешить множественный выбор для списков',
      from: 'С',
      to: 'По',
      includeCurrent: 'Включая текущий',
    },
    placeholders: {
      selectFromList: 'Выбрать из списка',
      enterEntry: 'Введите запись...',
      enterValue: 'Введите значение...',
      select: 'Выбрать',
    },
    conditions: {
      exclude: 'Не является',
      contains: 'Содержит',
      notContain: 'Не содержит',
      startsWith: 'Начинается с',
      notStartsWith: 'Не начинается с',
      endsWith: 'Заканчивается на',
      notEndsWith: 'Не заканчивается на',
      equals: 'Равно',
      notEquals: 'Не равно',
      isEmpty: 'Пусто',
      isNotEmpty: 'Не пусто',
      lessThan: 'Меньше',
      lessThanOrEqual: 'Равно или меньше',
      greaterThan: 'Больше',
      greaterThanOrEqual: 'Равно или больше',
      isWithin: 'В пределах',
    },
    validationErrors: {
      invalidNumber: 'Только числа',
      invalidNumericRange: '"По" должно быть больше, чем "С"',
    },
    datetimeLevels: {
      year: 'Год',
      quarter: 'Квартал',
      month: 'Месяц',
      week: 'Неделя',
      day: 'День',
      aggrigatedHour: 'Час (агрегировано)',
      aggrigatedMinutesRoundTo15: '15 мин (агрегировано)',
    },
    relativeTypes: {
      last: 'Последний',
      this: 'Этот',
      next: 'Следующий',
    },
    datetimePositions: {
      before: 'До',
      after: 'После',
    },
  },
  dataBrowser: {
    addFilter: 'Добавить фильтр',
    selectField: 'Выбрать поле',
    configureFilter: 'Настроить фильтр',
    noResults: 'Нет результатов',
    searchPlaceholder: 'Поиск',
  },
  pivotTable: {
    grandTotal: 'Общий итог',
    subTotal: 'Итого {{value}}',
    limits: {
      baseNote:
        'Итоги могут относиться к полным данным, если они установлены владельцем панели. Если доступно, вы можете использовать фильтры для отображения меньшего количества строк и столбцов.',
      rowsLimit: 'Сводная таблица ограничена {{recordsCount}} записями',
      columnsLimit: 'Сводная таблица ограничена {{columnsCount}} столбцами',
      columnsAndRowsLimit:
        'Сводная таблица ограничена {{recordsCount}} записями и {{columnsCount}} столбцами',
    },
  },
  dashboard: {
    toolbar: {
      undo: 'Отменить',
      redo: 'Повторить',
      cancel: 'Отмена',
      apply: 'Применить',
      editLayout: 'Редактировать макет',
      viewMode: 'Переключиться в режим просмотра',
      showFilters: 'Показать фильтры',
      hideFilters: 'Скрыть фильтры',
      columns: 'Столбцы',
      column: 'Столбец',
    },
  },
  jumpToDashboard: {
    defaultCaption: 'Перейти к',
    jumpableTooltip: 'Этот виджет можно перейти',
  },
  calendarHeatmap: {
    navigation: {
      firstMonth: 'Первый месяц',
      lastMonth: 'Последний месяц',
      previousMonth: 'Предыдущий месяц',
      nextMonth: 'Следующий месяц',
      previousGroup: 'Предыдущая группа',
      nextGroup: 'Следующая группа',
    },
  },
};

export default [
  {
    language: 'ru-RU',
    namespace: SDK_UI_NAMESPACE,
    resources: translation,
  },
];
