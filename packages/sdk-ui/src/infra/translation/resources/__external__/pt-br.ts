import type { TranslationDictionary } from '../index';
import { PACKAGE_NAMESPACE as SDK_UI_NAMESPACE } from '../index';

/**
 * Translation dictionary for Portuguese language.
 */
const translation: TranslationDictionary = {
  errors: {
    noSisenseContext: 'O contexto do Sisense não está inicializado',
    restApiNotReady: 'A API REST não está inicializada',
    componentRenderError: 'Não é possível renderizar o componente',
    sisenseContextNoAuthentication: 'O método de autenticação não foi especificado',
    chartNoSisenseContext:
      'Contexto do Sisense para o gráfico não encontrado. Para corrigir, envolva o componente com um provedor de contexto do Sisense ou forneça um conjunto de dados existente via props.',
    widgetByIdNoSisenseContext:
      'Contexto do Sisense para o widget do painel não encontrado. Para corrigir, envolva o componente com um provedor de contexto do Sisense.',
    widgetByIdInvalidIdentifier:
      'Falha ao recuperar o widget {{widgetOid}} do painel {{dashboardOid}}. ' +
      'Certifique-se de que o widget do painel existe e está acessível.',
    dashboardWidgetsInvalidIdentifiers:
      'Falha ao recuperar os widgets do painel {{dashboardOid}}. ' +
      'Certifique-se de que o painel existe e está acessível.',
    executeQueryNoSisenseContext:
      'Contexto do Sisense para execução de consulta não encontrado. Para corrigir, envolva o componente com um provedor de contexto do Sisense.',
    executeQueryNoDataSource: 'Nenhuma dataSource fornecida para executar a consulta',
    dataOptions: {
      noDimensionsAndMeasures:
        'Nenhuma dimensão ou medida encontrada. As opções de dados devem ter pelo menos uma dimensão ou medida.',
      attributeNotFound: 'O atributo "{{attributeName}}" não foi encontrado nos dados',
      measureNotFound: 'A medida "{{measureName}}" não foi encontrada nos dados',
      filterAttributeNotFound:
        'O atributo de filtro "{{attributeName}}" não foi encontrado nos dados',
      highlightAttributeNotFound:
        'O atributo de destaque "{{attributeName}}" não foi encontrado nos dados',
    },
    optionsTranslation: {
      invalidStyleOptions: "Opções de estilo inválidas para o gráfico '{{chartType}}'",
      invalidInternalDataOptions:
        "As opções de dados não foram convertidas corretamente para o gráfico '{{chartType}}'",
    },
    themeNotFound: 'Tema com oid {{themeOid}} não encontrado no ambiente Sisense conectado',
    paletteNotFound: "Paleta '{{paletteName}}' não encontrada no ambiente Sisense conectado",
    chartTypeNotSupported: 'Tipo de gráfico {{chartType}} não é suportado',
    chartInvalidProps: 'Props de gráfico inválidos para o tipo de gráfico: {{chartType}}',
    unsupportedWidgetType:
      'Não é possível extrair props para o tipo de widget não suportado - {{widgetType}}',
    dashboardInvalidIdentifier:
      'Falha ao recuperar o painel {{dashboardOid}}. Certifique-se de que o painel existe e está acessível ao usuário atual.',
    sharedFormula: {
      identifierExpected:
        'Falha ao recuperar a fórmula compartilhada. Forneça oid ou name e datasource. ' +
        'Valores fornecidos: name={{name}}, dataSource={{dataSource}}, oid={{oid}}',
      failedToFetchByOid: 'Falha ao buscar a fórmula compartilhada por oid {{oid}}',
      failedToFetchByName:
        'Falha ao buscar a fórmula compartilhada por name {{name}} e dataSource {{dataSource}}',
    },
    widgetModel: {
      incompleteWidget:
        'WidgetModelTranslator: O widget não pode ser transformado em DTO devido a uma propriedade incompleta ({{prop}})',
      unsupportedWidgetTypeDto:
        'WidgetModelTranslator: Salvar o widget do tipo {{chartType}} não é suportado',
      pivotWidgetNotSupported:
        'WidgetModelTranslator: O widget Pivot não é suportado para o método {{methodName}}',
      textWidgetNotSupported:
        'WidgetModelTranslator: O widget de texto não é suportado para o método {{methodName}}',
      onlyTableWidgetSupported:
        'WidgetModelTranslator: Apenas o widget de tabela é suportado para o método {{methodName}}',
      onlyPivotWidgetSupported:
        'WidgetModelTranslator: Apenas o widget Pivot é suportado para o método {{methodName}}',
      onlyTextWidgetSupported:
        'WidgetModelTranslator: Apenas o widget de texto é suportado para o método {{methodName}}',
      onlyCustomWidgetSupported:
        'WidgetModelTranslator: Apenas o widget personalizado é suportado para o método {{methodName}}',
      unsupportedWidgetType: 'Tipo de widget não suportado: {{widgetType}}',
      unsupportedFusionWidgetType: 'Tipo de widget Fusion não suportado: {{widgetType}}',
    },
    unknownFilterInFilterRelations:
      'A relação de filtros contém um filtro {{filterGuid}} que não pôde ser encontrado nos filtros fornecidos',
    invalidFilterType: 'Tipo de filtro inválido. Esperado: {{filterType}}',
    secondsDateTimeLevelIsNotSupported:
      "O nível de data/hora 'seconds' não é suportado para esta fonte de dados",
    missingMenuRoot: 'Raiz do menu inicializada ausente',
    missingModalRoot: 'Raiz modal inicializada ausente',
    missingDataSource:
      "O valor 'dataSource' está ausente. Ele deve ser fornecido explicitamente ou um 'defaultDataSource' deve ser especificado no provedor de contexto do Sisense.",
    incorrectOnDataReadyHandler:
      "O manipulador 'onDataReady' deve retornar um objeto de dados válido",
    emptyModel: 'Modelo vazio',
    missingMetadata: 'Metadados ausentes',
    missingModelTitle: 'Título do modelo ausente',
    httpClientNotFound: 'HttpClient não encontrado.',
    serverSettingsNotLoaded: 'Falha ao carregar as configurações do servidor',
    requiredColumnMissing: 'Uma coluna obrigatória está ausente. {{hint}}',
    unexpectedChartType: 'Tipo de gráfico inesperado: {{chartType}}',
    noRowNumColumn: 'Os dados não têm coluna row num: {{columnName}}',
    tickIntervalCalculationFailed:
      'Não é possível calcular o intervalo de marca. Tente especificar a granularidade de data/hora.',
    polarChartDesignOptionsExpected:
      'Opções de design de gráfico polar esperadas para gráfico polar',
    polarChartDesignOptionsNotExpected:
      'Opções de design de gráfico polar não esperadas para gráfico não polar',
    indicatorInvalidRelativeSize:
      'Opções de tamanho relativo inválidas para o gráfico de indicador',
    unsupportedMapType: 'Tipo de mapa não suportado: {{mapType}}',
    mapLoadingFailed: 'Falha ao carregar o mapa',
    cascadingFilterOriginalNotFound:
      'Erro ao remontar os filtros em cascata. Filtro em cascata original não encontrado',
    dashboardLoadFailed: 'Falha ao carregar o painel. {{error}}',
    widgetLoadFailed: 'Falha ao carregar o widget. {{error}}',
    failedToAddWidget: 'Falha ao adicionar o widget ao painel',
    widgetEmptyResponse: 'Resposta vazia para o widget com oid {{widgetOid}}',
    dateFilterIncorrectOperator: 'Operador incorreto: {{operator}}',
    synchronizedFilterInvalidProps:
      'O hook `useSynchronizedFilter` deve usar pelo menos um de [non-null `filterFromProps`] ou [função `createEmptyFilter`]',
    unexpectedCacheValue: 'Valor de cache inesperado',
    notAMembersFilter: 'O filtro não é um MembersFilter',
    drilldownNoInitialDimension:
      'A dimensão inicial deve ser especificada para usar drilldown com componentes personalizados',
    otherWidgetTypesNotSupported: 'Outros tipos de widgets ainda não são suportados',
    dataBrowser: {
      dimensionNotFound: 'Dimensão com id {{dimensionId}} não encontrada',
      attributeNotFound: 'Atributo com id {{attributeId}} não encontrado',
    },
    addFilterPopover: {
      noDataSources:
        'Nenhuma fonte de dados disponível. Tente definir `dataSource` nos widgets ou `defaultDataSource` no nível do painel.',
    },
    tabberInvalidConfiguration: 'A configuração do widget Tabber é inválida',
  },
  errorBoxText: '$t(common:error): {{errorMessage}}',
  chartNoData: 'Sem resultados',
  filters: 'Filtros',
  cancel: 'Cancelar',
  includeAll: 'Incluir tudo',
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
    displayModePrefix: 'Todos os itens',
    equals: 'Igual a {{val}}',
    notEquals: 'Diferente de {{val}}',
    lessThan: 'Menor que {{val}}',
    lessThanOrEqual: 'Menor ou igual a {{val}}',
    greaterThan: 'Maior que {{val}}',
    greaterThanOrEqual: 'Maior ou igual a {{val}}',
    between: 'Entre {{valA}} e {{valB}}',
    notBetween: 'Não entre {{valA}} e {{valB}}',
    top: 'Top {{valA}} por {{valB}}',
    bottom: 'Últimos {{valA}} por {{valB}}',
    is: 'É {{val}}',
    isNot: 'Não é {{val}}',
    contains: 'Contém {{val}}',
    notContains: `Não contém {{val}}`,
    startsWith: 'Começa com {{val}}',
    notStartsWith: `Não começa com {{val}}`,
    endsWith: 'Termina com {{val}}',
    notEndsWith: `Não termina com {{val}}`,
    like: 'É como {{val}}',
    byMeasure: 'Por medida',
    by: 'por',
  },
  dateFilter: {
    last: 'Último',
    next: 'Próximo',
    from: 'De',
    to: 'Até',
    count: 'Contagem',
    select: 'Selecionar',
    today: 'Hoje',
    days: 'Dias',
    weeks: 'Semanas',
    months: 'Meses',
    quarters: 'Trimestres',
    years: 'Anos',
    earliestDate: 'Data mais antiga',
    latestDate: 'Data mais recente',
    todayOutOfRange: 'Hoje está fora do intervalo de datas disponível',
    dateRange: {
      fromTo: '{{from}} até {{to}}',
      from: 'De {{val}}',
      to: 'Até {{val}}',
    },
  },
  boxplot: {
    tooltip: {
      whiskers: 'Bigodes',
      box: 'Caixa',
      min: 'Mín',
      median: 'Mediana',
      max: 'Máx',
    },
  },
  treemap: {
    tooltip: {
      ofTotal: 'do total',
      of: 'de',
    },
  },
  advanced: {
    tooltip: {
      min: 'Limite inferior',
      max: 'Limite superior',
      forecastValue: 'Valor de previsão',
      forecast: 'Previsão',
      trend: 'Tendência',
      trendLocalValue: 'Valor local',
      confidenceInterval: 'Intervalo de confiança',
      trendType: 'Tipo',
      trendDataKey: 'Dados de tendência',
      trendData: {
        min: 'Mín',
        max: 'Máx',
        median: 'Mediana',
        average: 'Média',
      },
    },
  },
  arearange: {
    tooltip: {
      min: 'Mín',
      max: 'Máx',
    },
  },
  unsupportedFilterMessage: 'Filtro não suportado (aplicado à consulta de dados)',
  unsupportedFilter: 'Filtro não suportado {{filter}}',
  commonFilter: {
    clearSelectionButton: 'Limpar seleção',
    selectMenuItem: 'Selecionar',
    unselectMenuItem: 'Desselecionar',
  },
  customFilterTileMessage: 'filtrado com filtro personalizado',
  filterRelations: {
    and: 'E',
    or: 'OU',
    andOrFormulaApplied: 'Fórmula E/OU aplicada',
  },
  drilldown: {
    drillMenuItem: 'Explorar',
    breadcrumbsAllSuffix: 'Tudo',
    breadcrumbsPrev: 'Anterior',
    breadcrumbsNext: 'Próximo',
    popover: {
      members: 'Membros',
      table: 'Tabela',
      column: 'Coluna',
    },
  },
  widgetHeader: {
    info: {
      details: 'Detalhes do widget',
      tooltip: 'Clique para ver os detalhes completos',
    },
    menu: {
      deleteWidget: 'Excluir widget',
      distributeEqualWidth: 'Distribuir igualmente nesta linha',
    },
  },
  customWidgets: {
    registerPrompt:
      'Tipo de widget personalizado desconhecido: {{customWidgetType}}. Por favor, registre este widget personalizado.',
  },
  ai: {
    analyticsChatbot: 'Chatbot de análise',
    dataTopics: 'Tópicos de dados',
    chatbotDescription:
      'O chatbot de análise foi projetado para ajudá-lo a interagir com seus dados usando linguagem natural.',
    topicSelectPrompt: 'Escolha um tópico que você gostaria de explorar:',
    preview: 'Visualização',
    clearHistoryPrompt: 'Deseja limpar este chat?',
    config: {
      inputPromptText: 'Faça uma pergunta ou digite "/" para obter ideias',
      welcomeText:
        'Bem-vindo ao Assistente de Análise! Posso ajudá-lo a explorar e obter insights de seus dados.',
      suggestionsWelcomeText: 'Algumas perguntas que você pode ter:',
    },
    buttons: {
      insights: 'Insights',
      correctResponse: 'Resposta correta',
      incorrectResponse: 'Resposta incorreta',
      clearChat: 'Limpar chat',
      refresh: 'Atualizar',
      readMore: 'Ler mais',
      collapse: 'Recolher',
      yes: 'Sim',
      no: 'Não',
      seeMore: 'Ver mais',
    },
    disclaimer: {
      poweredByAi: 'O conteúdo é alimentado por IA, então surpresas e erros são possíveis.',
      rateRequest: 'Por favor, avalie as respostas para que possamos melhorar!',
    },
    errors: {
      chatUnavailable: 'Chat indisponível. Por favor, tente novamente mais tarde.',
      fetchHistory:
        'Algo deu errado e não conseguimos recuperar o thread do chat. Vamos começar de novo!',
      recommendationsNotAvailable:
        'As recomendações não estão disponíveis no momento. Tente novamente em alguns minutos.',
      insightsNotAvailable: 'Nenhum insight disponível.',
      VectorDBEmptyResponseError:
        'A configuração de IA não está pronta, aguarde alguns minutos e tente novamente.',
      LlmBadConfigurationError:
        'A configuração do LLM está incorreta. Entre em contato com seu administrador para atualizar a configuração do provedor LLM.',
      ChartTypeUnsupportedError: 'O tipo de gráfico solicitado não é suportado.',
      BlockedByLlmContentFiltering:
        'Esta pergunta está bloqueada por nossa política de gerenciamento de conteúdo. Por favor, tente fazer uma pergunta diferente.',
      LlmContextLengthExceedsLimitError:
        'Parece que você atingiu o limite de comprimento da mensagem, limpe esta conversa.',
      UserPromptExeedsLimitError:
        'A solicitação excede o limite. Reformule sua pergunta e use uma solicitação mais curta.',
      unexpectedChatResponse:
        'Ops, algo deu errado. Por favor, tente novamente mais tarde ou tente fazer uma pergunta diferente.',
      unexpected: 'Ops, algo deu errado. Por favor, tente novamente mais tarde.',
      unknownResponse: 'Tipo de resposta desconhecido recebido, resposta bruta=',
      invalidInput: 'Entrada inválida',
      noAvailableDataTopics:
        'Nenhum dos modelos de dados ou perspectivas fornecidos está disponível',
    },
  },
  attribute: {
    datetimeName: {
      years: 'Anos em {{columnName}}',
      quarters: 'Trimestres em {{columnName}}',
      months: 'Meses em {{columnName}}',
      weeks: 'Semanas em {{columnName}}',
      days: 'Dias em {{columnName}}',
      hours: 'Horas em {{columnName}}',
      minutes: 'Minutos em {{columnName}}',
    },
  },
  filterEditor: {
    buttons: {
      apply: 'Aplicar',
      cancel: 'Cancelar',
      selectAll: 'Selecionar tudo',
      clearAll: 'Limpar tudo',
    },
    labels: {
      includeAll: 'Incluir tudo (nenhum filtro aplicado)',
      allowMultiSelection: 'Permitir seleção múltipla para listas',
      from: 'De',
      to: 'Até',
      includeCurrent: 'Incluindo atual',
    },
    placeholders: {
      selectFromList: 'Selecionar da lista',
      enterEntry: 'Digite sua entrada...',
      enterValue: 'Digite o valor...',
      select: 'Selecionar',
    },
    conditions: {
      exclude: 'Não é',
      contains: 'Contém',
      notContain: 'Não contém',
      startsWith: 'Começa com',
      notStartsWith: 'Não começa com',
      endsWith: 'Termina com',
      notEndsWith: 'Não termina com',
      equals: 'Igual a',
      notEquals: 'Diferente de',
      isEmpty: 'Está vazio',
      isNotEmpty: 'Não está vazio',
      lessThan: 'Menor que',
      lessThanOrEqual: 'Igual ou menor que',
      greaterThan: 'Maior que',
      greaterThanOrEqual: 'Igual ou maior que',
      isWithin: 'Está dentro',
    },
    validationErrors: {
      invalidNumber: 'Apenas números',
      invalidNumericRange: '"Até" deve ser maior que "De"',
    },
    datetimeLevels: {
      year: 'Ano',
      quarter: 'Trimestre',
      month: 'Mês',
      week: 'Semana',
      day: 'Dia',
      aggrigatedHour: 'Hora (agregada)',
      aggrigatedMinutesRoundTo15: '15 min (agregado)',
    },
    relativeTypes: {
      last: 'Último',
      this: 'Este',
      next: 'Próximo',
    },
    datetimePositions: {
      before: 'Antes',
      after: 'Depois',
    },
  },
  dataBrowser: {
    addFilter: 'Adicionar filtro',
    selectField: 'Selecionar campo',
    configureFilter: 'Configurar filtro',
    noResults: 'Sem resultados',
    searchPlaceholder: 'Pesquisar',
  },
  pivotTable: {
    grandTotal: 'Total geral',
    subTotal: 'Total {{value}}',
    limits: {
      baseNote:
        'Os totais podem se referir aos dados completos se definidos pelo proprietário do painel. Se disponível, você pode usar filtros para exibir menos linhas e colunas.',
      rowsLimit: 'A tabela dinâmica está limitada a {{recordsCount}} registros',
      columnsLimit: 'A tabela dinâmica está limitada a {{columnsCount}} colunas',
      columnsAndRowsLimit:
        'A tabela dinâmica está limitada a {{recordsCount}} registros e {{columnsCount}} colunas',
    },
  },
  dashboard: {
    toolbar: {
      undo: 'Desfazer',
      redo: 'Refazer',
      cancel: 'Cancelar',
      apply: 'Aplicar',
      editLayout: 'Editar layout',
      viewMode: 'Alternar para o modo de visualização',
      showFilters: 'Mostrar filtros',
      hideFilters: 'Ocultar filtros',
      columns: 'Colunas',
      column: 'Coluna',
    },
  },
  jumpToDashboard: {
    defaultCaption: 'Ir para',
    jumpableTooltip: 'Este widget é navegável',
  },
  calendarHeatmap: {
    navigation: {
      firstMonth: 'Primeiro mês',
      lastMonth: 'Último mês',
      previousMonth: 'Mês anterior',
      nextMonth: 'Próximo mês',
      previousGroup: 'Grupo anterior',
      nextGroup: 'Próximo grupo',
    },
  },
};

export default [
  {
    language: 'pt-BR',
    namespace: SDK_UI_NAMESPACE,
    resources: translation,
  },
];
