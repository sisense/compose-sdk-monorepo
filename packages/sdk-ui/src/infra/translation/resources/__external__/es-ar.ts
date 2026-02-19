import type { TranslationDictionary } from '../index';
import { PACKAGE_NAMESPACE as SDK_UI_NAMESPACE } from '../index';

/**
 * Translation dictionary for Spanish (Argentina) language.
 */
const translation: TranslationDictionary = {
  errors: {
    noSisenseContext: 'El contexto de Sisense no está inicializado',
    restApiNotReady: 'La API REST no está inicializada',
    componentRenderError: 'No se puede renderizar el componente',
    sisenseContextNoAuthentication: 'No se especificó el método de autenticación',
    chartNoSisenseContext:
      'No se encontró el contexto de Sisense para el gráfico. Para solucionarlo, envolvés el componente con un proveedor de contexto de Sisense o proporcionás un conjunto de datos existente mediante props.',
    widgetByIdNoSisenseContext:
      'No se encontró el contexto de Sisense para el widget del panel. Para solucionarlo, envolvés el componente con un proveedor de contexto de Sisense.',
    widgetByIdInvalidIdentifier:
      'No se pudo recuperar el widget {{widgetOid}} del panel {{dashboardOid}}. ' +
      'Asegurate de que el widget del panel existe y es accesible.',
    dashboardWidgetsInvalidIdentifiers:
      'No se pudieron recuperar los widgets del panel {{dashboardOid}}. ' +
      'Asegurate de que el panel existe y es accesible.',
    executeQueryNoSisenseContext:
      'No se encontró el contexto de Sisense para la ejecución de consultas. Para solucionarlo, envolvés el componente con un proveedor de contexto de Sisense.',
    executeQueryNoDataSource: 'No se proporcionó dataSource para ejecutar la consulta',
    dataOptions: {
      noDimensionsAndMeasures:
        'No se encontraron dimensiones ni medidas. Las opciones de datos deben tener al menos una dimensión o medida.',
      attributeNotFound: 'El atributo "{{attributeName}}" no se encontró en los datos',
      measureNotFound: 'La medida "{{measureName}}" no se encontró en los datos',
      filterAttributeNotFound:
        'El atributo de filtro "{{attributeName}}" no se encontró en los datos',
      highlightAttributeNotFound:
        'El atributo de resaltado "{{attributeName}}" no se encontró en los datos',
    },
    optionsTranslation: {
      invalidStyleOptions: "Opciones de estilo no válidas para el gráfico '{{chartType}}'",
      invalidInternalDataOptions:
        "Las opciones de datos no se convirtieron correctamente para el gráfico '{{chartType}}'",
    },
    themeNotFound: 'No se encontró el tema con oid {{themeOid}} en el entorno de Sisense conectado',
    paletteNotFound:
      "No se encontró la paleta '{{paletteName}}' en el entorno de Sisense conectado",
    chartTypeNotSupported: 'El tipo de gráfico {{chartType}} no es compatible',
    chartInvalidProps: 'Props de gráfico no válidos para el tipo de gráfico: {{chartType}}',
    unsupportedWidgetType:
      'No se pueden extraer las props para el tipo de widget no compatible - {{widgetType}}',
    dashboardInvalidIdentifier:
      'No se pudo recuperar el panel {{dashboardOid}}. Asegurate de que el panel existe y es accesible para el usuario actual.',
    sharedFormula: {
      identifierExpected:
        'No se pudo recuperar la fórmula compartida. Proporcioná oid o tanto name como datasource. ' +
        'Valores proporcionados: name={{name}}, dataSource={{dataSource}}, oid={{oid}}',
      failedToFetchByOid: 'No se pudo obtener la fórmula compartida por oid {{oid}}',
      failedToFetchByName:
        'No se pudo obtener la fórmula compartida por name {{name}} y dataSource {{dataSource}}',
    },
    widgetModel: {
      incompleteWidget:
        'WidgetModelTranslator: El widget no se puede transformar a DTO debido a una propiedad incompleta ({{prop}})',
      unsupportedWidgetTypeDto:
        'WidgetModelTranslator: No se admite guardar el widget de tipo {{chartType}}',
      pivotWidgetNotSupported:
        'WidgetModelTranslator: El widget Pivot no es compatible con el método {{methodName}}',
      textWidgetNotSupported:
        'WidgetModelTranslator: El widget de texto no es compatible con el método {{methodName}}',
      onlyTableWidgetSupported:
        'WidgetModelTranslator: Solo el widget de tabla es compatible con el método {{methodName}}',
      onlyPivotWidgetSupported:
        'WidgetModelTranslator: Solo el widget Pivot es compatible con el método {{methodName}}',
      onlyTextWidgetSupported:
        'WidgetModelTranslator: Solo el widget de texto es compatible con el método {{methodName}}',
      onlyCustomWidgetSupported:
        'WidgetModelTranslator: Solo el widget personalizado es compatible con el método {{methodName}}',
      unsupportedWidgetType: 'Tipo de widget no compatible: {{widgetType}}',
      unsupportedFusionWidgetType: 'Tipo de widget Fusion no compatible: {{widgetType}}',
    },
    unknownFilterInFilterRelations:
      'La relación de filtros contiene un filtro {{filterGuid}} que no se pudo encontrar en los filtros proporcionados',
    invalidFilterType: 'Tipo de filtro no válido. Esperado: {{filterType}}',
    secondsDateTimeLevelIsNotSupported:
      "El nivel de fecha y hora 'seconds' no es compatible con esta fuente de datos",
    missingMenuRoot: 'Falta la raíz del menú inicializada',
    missingModalRoot: 'Falta la raíz modal inicializada',
    missingDataSource:
      "Falta el valor 'dataSource'. Debe proporcionarse explícitamente o se debe especificar un 'defaultDataSource' en el proveedor de contexto de Sisense.",
    incorrectOnDataReadyHandler:
      "El controlador 'onDataReady' debe devolver un objeto de datos válido",
    emptyModel: 'Modelo vacío',
    missingMetadata: 'Faltan metadatos',
    missingModelTitle: 'Falta el título del modelo',
    httpClientNotFound: 'No se encontró HttpClient.',
    serverSettingsNotLoaded: 'Error al cargar la configuración del servidor',
    requiredColumnMissing: 'Falta una columna requerida. {{hint}}',
    unexpectedChartType: 'Tipo de gráfico inesperado: {{chartType}}',
    noRowNumColumn: 'Los datos no tienen columna row num: {{columnName}}',
    tickIntervalCalculationFailed:
      'No se pudo calcular el intervalo de marcas. Intentá especificar la granularidad de fecha y hora.',
    polarChartDesignOptionsExpected:
      'Se esperan opciones de diseño de gráfico polar para el gráfico polar',
    polarChartDesignOptionsNotExpected:
      'No se esperan opciones de diseño de gráfico polar para gráfico no polar',
    indicatorInvalidRelativeSize:
      'Opciones de tamaño relativo no válidas para el gráfico de indicador',
    unsupportedMapType: 'Tipo de mapa no compatible: {{mapType}}',
    mapLoadingFailed: 'Error al cargar el mapa',
    cascadingFilterOriginalNotFound:
      'Error al reensamblar los filtros en cascada. No se encontró el filtro en cascada original',
    dashboardLoadFailed: 'Error al cargar el panel. {{error}}',
    widgetLoadFailed: 'Error al cargar el widget. {{error}}',
    failedToAddWidget: 'Error al agregar el widget al panel',
    widgetEmptyResponse: 'Respuesta vacía para el widget con oid {{widgetOid}}',
    dateFilterIncorrectOperator: 'Operador incorrecto: {{operator}}',
    synchronizedFilterInvalidProps:
      'El hook `useSynchronizedFilter` debe tomar al menos uno de [non-null `filterFromProps`] o [función `createEmptyFilter`]',
    unexpectedCacheValue: 'Valor de caché inesperado',
    notAMembersFilter: 'El filtro no es un MembersFilter',
    drilldownNoInitialDimension:
      'Se debe especificar la dimensión inicial para usar drilldown con componentes personalizados',
    otherWidgetTypesNotSupported: 'Otros tipos de widgets aún no son compatibles',
    dataBrowser: {
      dimensionNotFound: 'No se encontró la dimensión con id {{dimensionId}}',
      attributeNotFound: 'No se encontró el atributo con id {{attributeId}}',
    },
    addFilterPopover: {
      noDataSources:
        'No hay fuentes de datos disponibles. Intentá definir `dataSource` en los widgets o `defaultDataSource` a nivel de panel.',
    },
    tabberInvalidConfiguration: 'La configuración del widget Tabber no es válida',
  },
  errorBoxText: '$t(common:error): {{errorMessage}}',
  chartNoData: 'Sin resultados',
  filters: 'Filtros',
  cancel: 'Cancelar',
  includeAll: 'Incluir todo',
  formatting: {
    number: {
      abbreviations: {
        thousand: 'K',
        million: 'M',
        billion: 'B',
        trillion: 'T',
      },
    },
  },
  criteriaFilter: {
    displayModePrefix: 'Todos los elementos',
    equals: 'Igual a {{val}}',
    notEquals: 'No igual a {{val}}',
    lessThan: 'Menor que {{val}}',
    lessThanOrEqual: 'Menor o igual que {{val}}',
    greaterThan: 'Mayor que {{val}}',
    greaterThanOrEqual: 'Mayor o igual que {{val}}',
    between: 'Entre {{valA}} y {{valB}}',
    notBetween: 'No entre {{valA}} y {{valB}}',
    top: 'Top {{valA}} por {{valB}}',
    bottom: 'Últimos {{valA}} por {{valB}}',
    is: 'Es {{val}}',
    isNot: 'No es {{val}}',
    contains: 'Contiene {{val}}',
    notContains: `No contiene {{val}}`,
    startsWith: 'Comienza con {{val}}',
    notStartsWith: `No comienza con {{val}}`,
    endsWith: 'Termina con {{val}}',
    notEndsWith: `No termina con {{val}}`,
    like: 'Es como {{val}}',
    byMeasure: 'Por medida',
    by: 'por',
  },
  dateFilter: {
    last: 'Último',
    next: 'Siguiente',
    from: 'Desde',
    to: 'Hasta',
    count: 'Cantidad',
    select: 'Seleccionar',
    today: 'Hoy',
    days: 'Días',
    weeks: 'Semanas',
    months: 'Meses',
    quarters: 'Trimestres',
    years: 'Años',
    earliestDate: 'Fecha más temprana',
    latestDate: 'Fecha más reciente',
    todayOutOfRange: 'Hoy está fuera del rango de fechas disponible',
    dateRange: {
      fromTo: '{{from}} hasta {{to}}',
      from: 'Desde {{val}}',
      to: 'Hasta {{val}}',
    },
  },
  boxplot: {
    tooltip: {
      whiskers: 'Bigotes',
      box: 'Caja',
      min: 'Mín',
      median: 'Mediana',
      max: 'Máx',
    },
  },
  treemap: {
    tooltip: {
      ofTotal: 'del total',
      of: 'de',
    },
  },
  advanced: {
    tooltip: {
      min: 'Límite inferior',
      max: 'Límite superior',
      forecastValue: 'Valor de pronóstico',
      forecast: 'Pronóstico',
      trend: 'Tendencia',
      trendLocalValue: 'Valor local',
      confidenceInterval: 'Intervalo de confianza',
      trendType: 'Tipo',
      trendDataKey: 'Datos de tendencia',
      trendData: {
        min: 'Mín',
        max: 'Máx',
        median: 'Mediana',
        average: 'Promedio',
      },
    },
  },
  arearange: {
    tooltip: {
      min: 'Mín',
      max: 'Máx',
    },
  },
  unsupportedFilterMessage: 'Filtro no compatible (aplicado a la consulta de datos)',
  unsupportedFilter: 'Filtro no compatible {{filter}}',
  commonFilter: {
    clearSelectionButton: 'Borrar selección',
    selectMenuItem: 'Seleccionar',
    unselectMenuItem: 'Deseleccionar',
  },
  customFilterTileMessage: 'filtrado con filtro personalizado',
  filterRelations: {
    and: 'Y',
    or: 'O',
    andOrFormulaApplied: 'Fórmula Y/O aplicada',
  },
  drilldown: {
    drillMenuItem: 'Explorar',
    breadcrumbsAllSuffix: 'Todo',
    breadcrumbsPrev: 'Anterior',
    breadcrumbsNext: 'Siguiente',
    popover: {
      members: 'Miembros',
      table: 'Tabla',
      column: 'Columna',
    },
  },
  widgetHeader: {
    info: {
      details: 'Detalles del widget',
      tooltip: 'Hacé clic para ver los detalles completos',
    },
    menu: {
      deleteWidget: 'Eliminar widget',
      distributeEqualWidth: 'Distribuir equitativamente en esta fila',
    },
  },
  customWidgets: {
    registerPrompt:
      'Tipo de widget personalizado desconocido: {{customWidgetType}}. Por favor, registrá este widget personalizado.',
  },
  ai: {
    analyticsChatbot: 'Chatbot de análisis',
    dataTopics: 'Temas de datos',
    chatbotDescription:
      'El chatbot de análisis está diseñado para ayudarte a interactuar con tus datos usando lenguaje natural.',
    topicSelectPrompt: 'Seleccioná un tema que te gustaría explorar:',
    preview: 'Vista previa',
    clearHistoryPrompt: '¿Querés borrar este chat?',
    config: {
      inputPromptText: 'Hacé una pregunta o escribí "/" para obtener ideas',
      welcomeText:
        '¡Bienvenido al Asistente de Análisis! Puedo ayudarte a explorar y obtener información de tus datos.',
      suggestionsWelcomeText: 'Algunas preguntas que podés tener:',
    },
    buttons: {
      insights: 'Información',
      correctResponse: 'Respuesta correcta',
      incorrectResponse: 'Respuesta incorrecta',
      clearChat: 'Borrar chat',
      refresh: 'Actualizar',
      readMore: 'Leer más',
      collapse: 'Contraer',
      yes: 'Sí',
      no: 'No',
      seeMore: 'Ver más',
    },
    disclaimer: {
      poweredByAi:
        'El contenido está impulsado por IA, por lo que pueden ocurrir sorpresas y errores.',
      rateRequest: '¡Por favor, calificá las respuestas para que podamos mejorar!',
    },
    errors: {
      chatUnavailable: 'Chat no disponible. Por favor, intentá de nuevo más tarde.',
      fetchHistory: 'Algo salió mal y no pudimos recuperar el hilo del chat. ¡Empecemos de nuevo!',
      recommendationsNotAvailable:
        'Las recomendaciones no están disponibles en este momento. Intentá de nuevo en unos minutos.',
      insightsNotAvailable: 'No hay información disponible.',
      VectorDBEmptyResponseError:
        'La configuración de IA no está lista, por favor esperá unos minutos e intentá de nuevo.',
      LlmBadConfigurationError:
        'La configuración de LLM es incorrecta. Comunicate con tu administrador para actualizar la configuración del proveedor de LLM.',
      ChartTypeUnsupportedError: 'El tipo de gráfico solicitado no es compatible.',
      BlockedByLlmContentFiltering:
        'Esta pregunta está bloqueada por nuestra política de gestión de contenido. Por favor, intentá hacer una pregunta diferente.',
      LlmContextLengthExceedsLimitError:
        'Parece que alcanzaste el límite de longitud del mensaje, por favor borrá esta conversación.',
      UserPromptExeedsLimitError:
        'La solicitud excede el límite. Reformulá tu pregunta y usá una solicitud más corta.',
      unexpectedChatResponse:
        'Vaya, algo salió mal. Por favor, intentá de nuevo más tarde o intentá hacer una pregunta diferente.',
      unexpected: 'Vaya, algo salió mal. Por favor, intentá de nuevo más tarde.',
      unknownResponse: 'Se recibió un responseType desconocido, respuesta sin procesar=',
      invalidInput: 'Entrada no válida',
      noAvailableDataTopics:
        'Ninguno de los modelos de datos o perspectivas proporcionados está disponible',
    },
  },
  attribute: {
    datetimeName: {
      years: 'Años en {{columnName}}',
      quarters: 'Trimestres en {{columnName}}',
      months: 'Meses en {{columnName}}',
      weeks: 'Semanas en {{columnName}}',
      days: 'Días en {{columnName}}',
      hours: 'Horas en {{columnName}}',
      minutes: 'Minutos en {{columnName}}',
    },
  },
  filterEditor: {
    buttons: {
      apply: 'Aplicar',
      cancel: 'Cancelar',
      selectAll: 'Seleccionar todo',
      clearAll: 'Borrar todo',
    },
    labels: {
      includeAll: 'Incluir todo (sin filtro aplicado)',
      allowMultiSelection: 'Permitir selección múltiple para listas',
      from: 'Desde',
      to: 'Hasta',
      includeCurrent: 'Incluyendo actual',
    },
    placeholders: {
      selectFromList: 'Seleccionar de la lista',
      enterEntry: 'Escribí tu entrada...',
      enterValue: 'Ingresá el valor...',
      select: 'Seleccionar',
    },
    conditions: {
      exclude: 'No es',
      contains: 'Contiene',
      notContain: 'No contiene',
      startsWith: 'Comienza con',
      notStartsWith: 'No comienza con',
      endsWith: 'Termina con',
      notEndsWith: 'No termina con',
      equals: 'Igual a',
      notEquals: 'No igual a',
      isEmpty: 'Está vacío',
      isNotEmpty: 'No está vacío',
      lessThan: 'Menor que',
      lessThanOrEqual: 'Igual o menor que',
      greaterThan: 'Mayor que',
      greaterThanOrEqual: 'Igual o mayor que',
      isWithin: 'Está dentro',
    },
    validationErrors: {
      invalidNumber: 'Solo números',
      invalidNumericRange: '"Hasta" debe ser mayor que "Desde"',
    },
    datetimeLevels: {
      year: 'Año',
      quarter: 'Trimestre',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      aggrigatedHour: 'Hora (agregada)',
      aggrigatedMinutesRoundTo15: '15 min (agregado)',
    },
    relativeTypes: {
      last: 'Último',
      this: 'Este',
      next: 'Siguiente',
    },
    datetimePositions: {
      before: 'Antes',
      after: 'Después',
    },
  },
  dataBrowser: {
    addFilter: 'Agregar filtro',
    selectField: 'Seleccionar campo',
    configureFilter: 'Configurar filtro',
    noResults: 'Sin resultados',
    searchPlaceholder: 'Buscar',
  },
  pivotTable: {
    grandTotal: 'Total general',
    subTotal: 'Total {{value}}',
    limits: {
      baseNote:
        'Los totales pueden referirse a los datos completos si los establece el propietario del panel. Si está disponible, podés usar filtros para mostrar menos filas y columnas.',
      rowsLimit: 'La tabla dinámica está limitada a {{recordsCount}} registros',
      columnsLimit: 'La tabla dinámica está limitada a {{columnsCount}} columnas',
      columnsAndRowsLimit:
        'La tabla dinámica está limitada a {{recordsCount}} registros y {{columnsCount}} columnas',
    },
  },
  dashboard: {
    toolbar: {
      undo: 'Deshacer',
      redo: 'Rehacer',
      cancel: 'Cancelar',
      apply: 'Aplicar',
      editLayout: 'Editar diseño',
      viewMode: 'Cambiar al modo de vista',
      showFilters: 'Mostrar filtros',
      hideFilters: 'Ocultar filtros',
      columns: 'Columnas',
      column: 'Columna',
    },
  },
  jumpToDashboard: {
    defaultCaption: 'Saltar a',
    jumpableTooltip: 'Este widget es saltable',
  },
  calendarHeatmap: {
    navigation: {
      firstMonth: 'Primer mes',
      lastMonth: 'Último mes',
      previousMonth: 'Mes anterior',
      nextMonth: 'Mes siguiente',
      previousGroup: 'Grupo anterior',
      nextGroup: 'Grupo siguiente',
    },
  },
};

export default [
  {
    language: 'es-AR',
    namespace: SDK_UI_NAMESPACE,
    resources: translation,
  },
];
