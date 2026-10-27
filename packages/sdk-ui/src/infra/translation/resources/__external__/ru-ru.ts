/* eslint-disable sonarjs/no-duplicate-string -- Locale strings deliberately repeat across
   unrelated keys (a calendar `nextMonth` glyph label and a Time Frame frame name can hold
   the same word). Extracting them to constants would fragment the translations for a
   reviewer walking one section. */
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
  notifications: {
    dismiss: 'Закрыть уведомление',
    auth: {
      sessionExpiredTitle: 'Сессия истекла',
      sessionExpiredMessage: 'Ваша сессия истекла. Войдите снова, чтобы продолжить.',
      authenticationFailedTitle: 'Ошибка аутентификации',
      authenticationFailedMessage: 'Указанные учетные данные были отклонены экземпляром Sisense.',
    },
    permission: {
      forbiddenTitle: 'Доступ запрещен',
      forbiddenMessage: 'У вас нет разрешения на доступ к этим данным.',
    },
    network: {
      unreachableTitle: 'Проблема с подключением',
      unreachableMessage: 'Не удалось подключиться к экземпляру Sisense.',
    },
    server: {
      errorTitle: 'Ошибка сервера',
      errorMessage: 'Экземпляр Sisense вернул ошибку. Повторите попытку позже.',
    },
    general: {
      requestFailedTitle: 'Запрос не выполнен',
      requestFailedMessage: 'Запрос к экземпляру Sisense не выполнен.',
    },
  },
  errorBoxText: '$t(common:error): {{errorMessage}}',
  chartNoData: 'Нет результатов',
  filters: 'Фильтры',
  cancel: 'Отмена',
  includeAll: 'Включить все',
  formatting: {
    number: {
      abbreviations: {
        thousand: 'тыс.',
        million: 'млн',
        billion: 'млрд',
        trillion: 'трлн',
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
    last: 'Последние',
    next: 'Следующий',
    from: 'От',
    to: 'До',
    count: 'Количество',
    select: 'Выбрать',
    today: 'Сегодня',
    days: 'Дни',
    weeks: 'Недели',
    months: 'Месяцы',
    quarters: 'Кварталы',
    years: 'Годы',
    earliestDate: 'Самая ранняя дата',
    latestDate: 'Последняя дата',
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
      box: 'Ящик',
      min: 'Минимум',
      median: 'Медиана',
      max: 'Максимум',
    },
  },
  treemap: {
    tooltip: {
      ofTotal: 'от общего числа',
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
        min: 'Минимум',
        max: 'Максимум',
        median: 'Медиана',
        average: 'Среднее',
      },
    },
  },
  arearange: {
    tooltip: {
      min: 'Минимум',
      max: 'Максимум',
    },
  },
  filterWidget: {
    placeholders: {
      setFilter: 'Установить фильтр',
    },
    dateRange: {
      from: 'С',
      to: 'По',
      invertedFrom: 'Должно быть раньше конечной даты',
      invertedTo: 'Должно быть позже начальной даты',
    },
    numberRange: {
      minimum: 'Минимум',
      maximum: 'Максимум',
      notSet: 'Не задано',
      clear: 'Очистить {{field}}',
    },
    rank: {
      rankedBy: 'Ранжировано по {{- field}}',
      rankedByLabel: 'Ранжировано по:',
      topBy: 'Топ {{valA}} по:',
      bottomBy: 'Последние {{valA}} по:',
      chooseRankedBy:
        'Выберите поле для ранжирования в разделе: Настройки фильтра › Ранжировано по',
      direction: 'Направление ранжирования',
      count: 'Количество элементов',
    },
    selectedCount: 'Выбрано: {{count}}',
    allExceptCount: 'Все, кроме {{count}}',
    setupTitle: 'Настройте виджет фильтр',
    setupSubtitle: 'Выберите измерение и настройте работу фильтра',
    emptySetup: 'Настроить фильтр',
    conditionUnsupported: 'Условие доступно для текстовых, числовых и полей даты',
    dateCondition: {
      onOrBefore: 'До включительно',
      onOrAfter: 'После включительно',
      includingCurrent: 'включая текущий',
      includingCurrentLabel: 'Включая текущий',
      countMin: 'Введите целое число от 1',
      summary: {
        current: '{{- operator}} {{- grain}}',
        relative: '{{- operator}} {{- count}} {{- grain}}',
        // "период" (masc.) instead of the bare grain noun (неделя/месяц/etc., mixed gender) so
        // "текущий" always agrees, instead of "включая текущий" clashing with a feminine/plural grain.
        relativeIncludingCurrent: '{{- operator}} {{- count}} {{- grain}}, включая текущий период',
        date: '{{- operator}} {{- date}}',
      },
    },
    conditionNotRepresentable: 'Это условие нельзя редактировать здесь',
    controls: {
      findInList: 'Поиск в списке',
      enterValue: 'Введите значение...',
      noMatches: 'Нет совпадений',
      clearSelection: 'Очистить выбор',
      overflowCount: '+{{count}}',
      select: 'Выбрать',
      selectDateLevel: 'Выберите уровень даты',
      selectCondition: 'Выберите условие',
      selectConnector: 'Выберите И/ИЛИ',
      addCondition: '+ Добавить условие',
      fillOrRemoveCondition: 'Заполните или удалите условие',
      rangeOrderError: 'Второе значение должно быть больше первого',
      betweenMin: 'Минимум',
      betweenMax: 'Максимум',
      increaseCount: 'Увеличить',
      decreaseCount: 'Уменьшить',
      selectValues: 'Выберите {{level}}',
      clear: 'Очистить',
    },
    timeFrame: {
      /** Accessible name for the row-list popover — read to a screen reader on open. */
      listboxLabel: 'Варианты периода',
      /**
       * Row labels. Two shapes carry a `{{count}}`, which i18next resolves to the
       * `_one` (singular) or `_other` (plural) key by CLDR plural rules. Locales
       * with more plural forms — Russian's `_few`/`_many`, Polish's `_many` — add
       * more suffixes in their own resources; English needs only the two.
       */
      labels: {
        /** Day-grain count=1: `Today` / `Yesterday` / `Tomorrow` — calendar words, not arithmetic. */
        today: 'Сегодня',
        yesterday: 'Вчера',
        tomorrow: 'Завтра',
        /** `This X` — single period, no count in the label. Day has none (Today covers it). */
        this: {
          week: 'Эта неделя',
          month: 'Этот месяц',
          quarter: 'Этот квартал',
          year: 'Этот год',
        },
        /**
         * `Last X` / `Last N X` — count drops for the singular, plural interpolates it.
         * Day `_one` renders as `Yesterday` and never reaches this key.
         *
         * Russian requires four plural forms — `_one` (n=1, 21, 31 …), `_few` (n=2–4, 22–24 …),
         * `_many` (n=0, 5–20, 25–30 …) and `_other` (fractional) — and i18next does NOT fall
         * back to `_other` within the language if the CLDR-selected form is missing, so a
         * catalogue count of 6 (which selects `_many`) reaches English through the fallback
         * chain when only `_one`/`_other` are defined. Abbreviated units (нед., мес., кв., г.,
         * дн.) read grammatically for every form, so `_few`/`_many` reuse the `_other` text.
         */
        last: {
          week_one: 'Прошлая неделя',
          week_few: 'Последние {{count}} нед.',
          week_many: 'Последние {{count}} нед.',
          week_other: 'Последние {{count}} нед.',
          month_one: 'Прошлый месяц',
          month_few: 'Последние {{count}} мес.',
          month_many: 'Последние {{count}} мес.',
          month_other: 'Последние {{count}} мес.',
          quarter_one: 'Прошлый квартал',
          quarter_few: 'Последние {{count}} кв.',
          quarter_many: 'Последние {{count}} кв.',
          quarter_other: 'Последние {{count}} кв.',
          year_one: 'Прошлый год',
          year_few: 'Последние {{count}} г.',
          year_many: 'Последние {{count}} г.',
          year_other: 'Последние {{count}} г.',
          day_few: 'Последние {{count}} дн.',
          day_many: 'Последние {{count}} дн.',
          day_other: 'Последние {{count}} дн.',
        },
        /** `Next X` / `Next N X`. Day `_one` renders as `Tomorrow`. */
        next: {
          week_one: 'Следующая неделя',
          week_few: 'Следующие {{count}} нед.',
          week_many: 'Следующие {{count}} нед.',
          week_other: 'Следующие {{count}} нед.',
          month_one: 'Следующий месяц',
          month_few: 'Следующие {{count}} мес.',
          month_many: 'Следующие {{count}} мес.',
          month_other: 'Следующие {{count}} мес.',
          quarter_one: 'Следующий квартал',
          quarter_few: 'Следующие {{count}} кв.',
          quarter_many: 'Следующие {{count}} кв.',
          quarter_other: 'Следующие {{count}} кв.',
          year_one: 'Следующий год',
          year_few: 'Следующие {{count}} г.',
          year_many: 'Следующие {{count}} г.',
          year_other: 'Следующие {{count}} г.',
          day_few: 'Следующие {{count}} дн.',
          day_many: 'Следующие {{count}} дн.',
          day_other: 'Следующие {{count}} дн.',
        },
        /** Paired frames — include the current period. Day grain has no such pair. */
        thisAndLast: {
          week: 'Эта и прошлая неделя',
          month: 'Этот и прошлый месяц',
          quarter: 'Этот и прошлый квартал',
          year: 'Этот и прошлый год',
        },
        thisAndNext: {
          week: 'Эта и следующая неделя',
          month: 'Этот и следующий месяц',
          quarter: 'Этот и следующий квартал',
          year: 'Этот и следующий год',
        },
      },
    },
    calendar: {
      selectDates: 'Выберите даты',
      multipleDaysHint: 'Можно выбрать несколько дней',
      formatError: 'Используйте формат {{- format}}',
      nonexistent: 'Такой даты не существует',
      chooseDate: 'Выбор даты',
      chooseDates: 'Выбор дат',
      previousMonth: 'Предыдущий месяц',
      nextMonth: 'Следующий месяц',
      previousYear: 'Предыдущий год',
      nextYear: 'Следующий год',
      openCalendar: 'Открыть календарь',
      clearDate: 'Очистить дату',
    },
  },
  unsupportedFilterMessage: 'Неподдерживаемый фильтр (применен к запросу данных)',
  unsupportedFilter: 'Неподдерживаемый фильтр {{filter}}',
  commonFilter: {
    clearSelectionButton: 'Очистить выделение',
    selectMenuItem: 'Выбрать',
    unselectMenuItem: 'Отменить выбор',
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
    breadcrumbsPrev: 'Назад',
    breadcrumbsNext: 'Следующий',
    popover: {
      members: 'Участники',
      table: 'Таблица',
      column: 'Столбец',
    },
  },
  widgetHeader: {
    addTitle: 'Добавить название',
    info: {
      details: 'Сведения о виджете',
      tooltip: 'Нажмите, чтобы просмотреть полные детали',
    },
    chartTableToggle: {
      switchToTable: 'Переключить на таблицу',
      switchToChart: 'Переключить на диаграмму',
    },
    menu: {
      deleteWidget: 'Удалить виджет',
      duplicateWidget: 'Дублировать виджет',
      renameWidget: 'Переименовать виджет',
      distributeEqualWidth: 'Распределить равномерно в этой строке',
      download: 'Загрузить',
      csvFile: 'Файл CSV',
      excelFile: 'Файл Excel',
      repeatRowsRecommended: 'Повторять строки (Рекомендуется)',
      mergeRows: 'Объединить строки',
    },
  },
  customWidgets: {
    registerPrompt:
      'Неизвестный тип пользовательского виджета: {{customWidgetType}}. Пожалуйста, зарегистрируйте этот пользовательский виджет.',
  },
  narrativeWidget: {
    generate: 'Создать нарратив',
    regenerate: 'Создать заново',
    retry: 'Повторить создание',
    disclaimer: 'Контент создан с помощью ИИ, поэтому возможны ошибки.',
    updatedAt: 'Обновлено {{timestamp}}',
    copy: 'Копировать в буфер обмена',
    copied: 'Скопировано',
    creditsUsed: 'Использовано {{usagePercentage}}% кредитов ИИ.',
    aiContextHint: 'Для лучшей работы<br/>добавьте <strong>Контекст ИИ</strong>',
    noDataTitle: 'Нет доступных данных панели',
    noDataDescription: 'Когда данные панели станут доступны, вы сможете создать нарратив.',
    failedTitle: 'Не удалось создать нарратив',
    failedDescription:
      'Повторите попытку позже. Если проблема не исчезнет, обратитесь к администратору.',
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
      readMore: 'Показать больше',
      collapse: 'Свернуть',
      yes: 'Да',
      no: 'Нет',
      seeMore: 'Смотреть больше',
      generateNarrative: 'Создать нарратив ИИ',
      hideNarrative: 'Скрыть нарратив ИИ',
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
      failedToFetchCreditBalance: 'Не удалось получить баланс кредитов',
    },
    quota: {
      exceededErrorTitle: 'Ответы ИИ в настоящее время недоступны.',
      exceededErrorDescription:
        'Вы достигли месячной квоты ИИ вашей компании. Квота будет автоматически обновлена в следующем месячном цикле использования.',
      warningDescription: 'Вы использовали {{usagePercentage}}% месячной квоты ИИ вашей компании.',
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
    tooltips: {
      selectAllPartiallyLoaded:
        'Отображаются не все значения. Прокрутите список вниз, чтобы загрузить остальные значения. Вы также можете использовать условие "Не является" ниже, чтобы исключить определенные значения.',
    },
    labels: {
      includeAll: 'Включить все (фильтр не применен)',
      allowMultiSelection: 'Разрешить множественный выбор для списков',
      from: 'С',
      to: 'По',
      includeCurrent: 'Включая текущий',
      rankedBy: 'Ранжировано по',
      selectField: 'Выберите поле',
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
      between: 'Между',
      top: 'Топ',
      bottom: 'Последние',
    },
    validationErrors: {
      invalidNumber: 'Только числа',
      invalidNumericRange: '"По" должно быть больше, чем "С"',
    },
    datetimeLevels: {
      year: 'Год',
      /** CLDR ru: one (1, 21, 31…), few (2–4, 22–24…), many (0, 5–20, 25–30…). */
      year_one: 'Год',
      year_few: 'Года',
      year_many: 'Лет',
      year_other: 'Лет',
      quarter: 'Квартал',
      quarter_one: 'Квартал',
      quarter_few: 'Квартала',
      quarter_many: 'Кварталов',
      quarter_other: 'Кварталов',
      month: 'Месяц',
      month_one: 'Месяц',
      month_few: 'Месяца',
      month_many: 'Месяцев',
      month_other: 'Месяцев',
      week: 'Неделя',
      week_one: 'Неделя',
      week_few: 'Недели',
      week_many: 'Недель',
      week_other: 'Недель',
      day: 'День',
      day_one: 'День',
      day_few: 'Дня',
      day_many: 'Дней',
      day_other: 'Дней',
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
    more: 'Ещё...',
    filter: 'Фильтр',
    addMeasure: 'Добавить показатель',
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
  filterTile: {
    menu: {
      lock: 'Блокировать',
      unlock: 'Разблокировать',
      lockGroup: 'Блокировать группу',
      unlockGroup: 'Разблокировать группу',
    },
    toggleSwitch: 'Включить/отключить фильтр',
    linkedToWidget: {
      label: 'Связано с виджетом фильтра',
      tooltip:
        'Этот фильтр нельзя изменить на панели фильтров. Изменяйте значения непосредственно на панели.',
      infoAriaLabel: 'Сведения о связи с виджетом фильтра',
    },
  },
  chart: {
    indicator: {
      label: 'Диаграмма показателя',
    },
    visualization: {
      label: 'Визуализация данных',
    },
    pivotTable: {
      label: 'Сводная таблица',
    },
    table: {
      label: 'Таблица данных',
      totalRows: 'Всего строк: {{formattedCount}}',
      rowsRange: 'Строки {{start}}-{{end}}',
    },
    sankey: {
      alerts: {
        tooManyStages:
          'Диаграмма Sankey содержит {{stageCount}} этапов; больше {{softLimit}} часто делает диаграмму нечитаемой. Уменьшите число столбцов категории или ужесточите фильтры.',
      },
    },
  },
  kpi: {
    comparison: {
      vsPriorYear: 'к прошлому году',
      vsPriorQuarter: 'к прошлому кварталу',
      vsPriorMonth: 'к прошлому месяцу',
      vsPriorWeek: 'к прошлой неделе',
      vsPriorDay: 'к прошлому дню',
      vsPriorPeriod: 'к прошлому периоду',
      vsBaseline: 'по сравнению с {{label}}',
      withBaseline: '{{label}} ({{baseline}})',
    },
    target: {
      ofGoal: '{{percent}} от цели ({{goalValue}})',
      toGo: 'осталось {{value}}',
    },
    percentFormat: '{{sign}}{{value}}\u00A0%',
  },
  loadingOverlay: {
    label: 'Загрузка содержимого',
  },
  queryDefinition: {
    showMorePills: 'Показать ещё {{count}}',
    showLess: 'Показать меньше',
    connectorBy: 'по',
    connectorWhere: 'где',
    tooltipType: 'Тип',
    tooltipColumn: 'Столбец',
    tooltipFormula: 'Формула',
    filterPill: {
      customFilter: 'пользовательский фильтр',
      empty: 'пусто',
      notEmpty: 'не пусто',
      not: 'не {{value}}',
      and: 'и',
      or: 'или',
      moreValues: '{{values}} +{{count}} ещё',
      range: '{{from}} – {{to}}',
      fromToLatest: '{{from}} – самая поздняя дата',
      earliestTo: 'самая ранняя дата – {{to}}',
      dependentOn: 'зависит от {{parents}}',
      dependentFilter: 'зависимый фильтр',
      text: {
        contains: 'содержит {{value}}',
        startsWith: 'начинается с {{value}}',
        endsWith: 'заканчивается на {{value}}',
        doesntEqual: 'не равно {{value}}',
        doesntStartWith: 'не начинается с {{value}}',
        doesntContain: 'не содержит {{value}}',
        doesntEndWith: 'не заканчивается на {{value}}',
        like: 'похоже на {{value}}',
      },
      ranking: {
        top: 'Топ {{count}}',
        bottom: 'Последние {{count}}',
        by: '{{rank}} по {{measure}}',
      },
      relative: {
        last: 'последние {{count}} {{unit}}',
        next: 'следующие {{count}} {{unit}}',
        lastTo: 'последние {{count}} {{unit}} до {{date}}',
        nextFrom: 'следующие {{count}} {{unit}} с {{date}}',
        includingCurrent: '{{period}}, включая текущий',
        withOffset: '{{period}}, смещение {{offset}}',
        today: 'сегодня',
        thisWeek: 'эта неделя',
        thisMonth: 'этот месяц',
        thisQuarter: 'этот квартал',
        thisYear: 'этот год',
      },
      units: {
        year_one: 'год',
        year_few: 'года',
        year_many: 'лет',
        year_other: 'года',
        quarter_one: 'квартал',
        quarter_few: 'квартала',
        quarter_many: 'кварталов',
        quarter_other: 'квартала',
        month_one: 'месяц',
        month_few: 'месяца',
        month_many: 'месяцев',
        month_other: 'месяца',
        week_one: 'неделя',
        week_few: 'недели',
        week_many: 'недель',
        week_other: 'недели',
        day_one: 'день',
        day_few: 'дня',
        day_many: 'дней',
        day_other: 'дня',
        hour_one: 'час',
        hour_few: 'часа',
        hour_many: 'часов',
        hour_other: 'часа',
        minute_one: 'минута',
        minute_few: 'минуты',
        minute_many: 'минут',
        minute_other: 'минуты',
      },
    },
  },
  measures: {
    countShort: 'Кол-во {{level}}',
    countDistinct: 'Подсчет уникальных',
    count: 'Подсчет всех',
    average: 'Среднее',
    sum: 'Сумма',
    min: 'Минимум',
    max: 'Максимум',
    stdev: 'Стандартное отклонение',
    median: 'Медиана',
    variance: 'Дисперсия',
  },
  measuresAgg: {
    countDistinct: '# уникальных',
    count: 'Кол-во',
    sum: 'Итого',
    average: 'Среднее',
    min: 'Минимум',
    max: 'Максимум',
    median: 'Медиана',
    variance: 'Дисперсия',
    stdev: 'Стандартное отклонение',
  },
};

export default [
  {
    language: 'ru-RU',
    namespace: SDK_UI_NAMESPACE,
    resources: translation,
  },
];
