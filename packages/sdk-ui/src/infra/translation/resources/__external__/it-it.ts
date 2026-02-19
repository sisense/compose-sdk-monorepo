import type { TranslationDictionary } from '../index';
import { PACKAGE_NAMESPACE as SDK_UI_NAMESPACE } from '../index';

/**
 * Translation dictionary for Italian language.
 */
const translation: TranslationDictionary = {
  errors: {
    noSisenseContext: 'Il contesto Sisense non è inizializzato',
    restApiNotReady: "L'API REST non è inizializzata",
    componentRenderError: 'Impossibile renderizzare il componente',
    sisenseContextNoAuthentication: 'Il metodo di autenticazione non è specificato',
    chartNoSisenseContext:
      'Contesto Sisense per il grafico non trovato. Per risolvere, avvolgere il componente con un provider di contesto Sisense o fornire un set di dati esistente tramite props.',
    widgetByIdNoSisenseContext:
      'Contesto Sisense per il widget della dashboard non trovato. Per risolvere, avvolgere il componente con un provider di contesto Sisense.',
    widgetByIdInvalidIdentifier:
      'Impossibile recuperare il widget {{widgetOid}} dalla dashboard {{dashboardOid}}. ' +
      'Assicurarsi che il widget della dashboard esista e sia accessibile.',
    dashboardWidgetsInvalidIdentifiers:
      'Impossibile recuperare i widget della dashboard {{dashboardOid}}. ' +
      'Assicurarsi che la dashboard esista e sia accessibile.',
    executeQueryNoSisenseContext:
      "Contesto Sisense per l'esecuzione della query non trovato. Per risolvere, avvolgere il componente con un provider di contesto Sisense.",
    executeQueryNoDataSource: 'Nessuna dataSource fornita per eseguire la query',
    dataOptions: {
      noDimensionsAndMeasures:
        'Nessuna dimensione o misura trovata. Le opzioni dei dati devono avere almeno una dimensione o misura.',
      attributeNotFound: 'L\'attributo "{{attributeName}}" non è stato trovato nei dati',
      measureNotFound: 'La misura "{{measureName}}" non è stata trovata nei dati',
      filterAttributeNotFound:
        'L\'attributo del filtro "{{attributeName}}" non è stato trovato nei dati',
      highlightAttributeNotFound:
        'L\'attributo di evidenziazione "{{attributeName}}" non è stato trovato nei dati',
    },
    optionsTranslation: {
      invalidStyleOptions: "Opzioni di stile non valide per il grafico '{{chartType}}'",
      invalidInternalDataOptions:
        "Le opzioni dei dati non sono state convertite correttamente per il grafico '{{chartType}}'",
    },
    themeNotFound: "Tema con oid {{themeOid}} non trovato nell'ambiente Sisense connesso",
    paletteNotFound: "Palette '{{paletteName}}' non trovata nell'ambiente Sisense connesso",
    chartTypeNotSupported: 'Tipo di grafico {{chartType}} non supportato',
    chartInvalidProps: 'Props del grafico non valide per il tipo di grafico: {{chartType}}',
    unsupportedWidgetType:
      'Impossibile estrarre le props per il tipo di widget non supportato - {{widgetType}}',
    dashboardInvalidIdentifier:
      "Impossibile recuperare la dashboard {{dashboardOid}}. Assicurarsi che la dashboard esista e sia accessibile all'utente corrente.",
    sharedFormula: {
      identifierExpected:
        'Impossibile recuperare la formula condivisa. Fornire oid o sia name che datasource. ' +
        'Valori forniti: name={{name}}, dataSource={{dataSource}}, oid={{oid}}',
      failedToFetchByOid: 'Impossibile recuperare la formula condivisa per oid {{oid}}',
      failedToFetchByName:
        'Impossibile recuperare la formula condivisa per name {{name}} e dataSource {{dataSource}}',
    },
    widgetModel: {
      incompleteWidget:
        'WidgetModelTranslator: Il widget non può essere trasformato in DTO a causa di una proprietà incompleta ({{prop}})',
      unsupportedWidgetTypeDto:
        'WidgetModelTranslator: Il salvataggio del widget di tipo {{chartType}} non è supportato',
      pivotWidgetNotSupported:
        'WidgetModelTranslator: Il widget Pivot non è supportato per il metodo {{methodName}}',
      textWidgetNotSupported:
        'WidgetModelTranslator: Il widget di testo non è supportato per il metodo {{methodName}}',
      onlyTableWidgetSupported:
        'WidgetModelTranslator: Solo il widget tabella è supportato per il metodo {{methodName}}',
      onlyPivotWidgetSupported:
        'WidgetModelTranslator: Solo il widget Pivot è supportato per il metodo {{methodName}}',
      onlyTextWidgetSupported:
        'WidgetModelTranslator: Solo il widget di testo è supportato per il metodo {{methodName}}',
      onlyCustomWidgetSupported:
        'WidgetModelTranslator: Solo il widget personalizzato è supportato per il metodo {{methodName}}',
      unsupportedWidgetType: 'Tipo di widget non supportato: {{widgetType}}',
      unsupportedFusionWidgetType: 'Tipo di widget Fusion non supportato: {{widgetType}}',
    },
    unknownFilterInFilterRelations:
      'La relazione dei filtri contiene un filtro {{filterGuid}} che non è stato trovato nei filtri forniti',
    invalidFilterType: 'Tipo di filtro non valido. Previsto: {{filterType}}',
    secondsDateTimeLevelIsNotSupported:
      "Il livello data/ora 'seconds' non è supportato per questa origine dati",
    missingMenuRoot: 'Radice del menu inizializzata mancante',
    missingModalRoot: 'Radice modale inizializzata mancante',
    missingDataSource:
      "Il valore 'dataSource' è mancante. Deve essere fornito esplicitamente o un 'defaultDataSource' deve essere specificato nel provider di contesto Sisense.",
    incorrectOnDataReadyHandler: "Il gestore 'onDataReady' deve restituire un oggetto dati valido",
    emptyModel: 'Modello vuoto',
    missingMetadata: 'Metadati mancanti',
    missingModelTitle: 'Titolo del modello mancante',
    httpClientNotFound: 'HttpClient non trovato.',
    serverSettingsNotLoaded: 'Impossibile caricare le impostazioni del server',
    requiredColumnMissing: 'Una colonna richiesta è mancante. {{hint}}',
    unexpectedChartType: 'Tipo di grafico imprevisto: {{chartType}}',
    noRowNumColumn: 'I dati non hanno la colonna row num: {{columnName}}',
    tickIntervalCalculationFailed:
      "Impossibile calcolare l'intervallo dei tick. Provare a specificare la granularità data/ora.",
    polarChartDesignOptionsExpected:
      'Opzioni di design del grafico polare previste per il grafico polare',
    polarChartDesignOptionsNotExpected:
      'Opzioni di design del grafico polare non previste per grafico non polare',
    indicatorInvalidRelativeSize:
      'Opzioni di dimensione relativa non valide per il grafico indicatore',
    unsupportedMapType: 'Tipo di mappa non supportato: {{mapType}}',
    mapLoadingFailed: 'Errore nel caricamento della mappa',
    cascadingFilterOriginalNotFound:
      'Errore nel riassemblaggio dei filtri a cascata. Filtro a cascata originale non trovato',
    dashboardLoadFailed: 'Errore nel caricamento della dashboard. {{error}}',
    widgetLoadFailed: 'Errore nel caricamento del widget. {{error}}',
    failedToAddWidget: "Errore nell'aggiunta del widget alla dashboard",
    widgetEmptyResponse: 'Risposta vuota per il widget con oid {{widgetOid}}',
    dateFilterIncorrectOperator: 'Operatore errato: {{operator}}',
    synchronizedFilterInvalidProps:
      "L'hook `useSynchronizedFilter` deve prendere almeno uno tra [non-null `filterFromProps`] o [funzione `createEmptyFilter`]",
    unexpectedCacheValue: 'Valore della cache imprevisto',
    notAMembersFilter: 'Il filtro non è un MembersFilter',
    drilldownNoInitialDimension:
      'La dimensione iniziale deve essere specificata per utilizzare il drilldown con componenti personalizzati',
    otherWidgetTypesNotSupported: 'Altri tipi di widget non sono ancora supportati',
    dataBrowser: {
      dimensionNotFound: 'Dimensione con id {{dimensionId}} non trovata',
      attributeNotFound: 'Attributo con id {{attributeId}} non trovato',
    },
    addFilterPopover: {
      noDataSources:
        'Nessuna origine dati disponibile. Provare a definire `dataSource` nei widget o `defaultDataSource` a livello di dashboard.',
    },
    tabberInvalidConfiguration: 'La configurazione del widget Tabber non è valida',
  },
  errorBoxText: '$t(common:error): {{errorMessage}}',
  chartNoData: 'Nessun risultato',
  filters: 'Filtri',
  cancel: 'Annulla',
  includeAll: 'Includi tutto',
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
    displayModePrefix: 'Tutti gli elementi',
    equals: 'Uguale a {{val}}',
    notEquals: 'Diverso da {{val}}',
    lessThan: 'Minore di {{val}}',
    lessThanOrEqual: 'Minore o uguale a {{val}}',
    greaterThan: 'Maggiore di {{val}}',
    greaterThanOrEqual: 'Maggiore o uguale a {{val}}',
    between: 'Tra {{valA}} e {{valB}}',
    notBetween: 'Non tra {{valA}} e {{valB}}',
    top: 'Top {{valA}} per {{valB}}',
    bottom: 'Ultimi {{valA}} per {{valB}}',
    is: 'È {{val}}',
    isNot: 'Non è {{val}}',
    contains: 'Contiene {{val}}',
    notContains: `Non contiene {{val}}`,
    startsWith: 'Inizia con {{val}}',
    notStartsWith: `Non inizia con {{val}}`,
    endsWith: 'Termina con {{val}}',
    notEndsWith: `Non termina con {{val}}`,
    like: 'È come {{val}}',
    byMeasure: 'Per misura',
    by: 'per',
  },
  dateFilter: {
    last: 'Ultimo',
    next: 'Prossimo',
    from: 'Da',
    to: 'A',
    count: 'Conteggio',
    select: 'Seleziona',
    today: 'Oggi',
    days: 'Giorni',
    weeks: 'Settimane',
    months: 'Mesi',
    quarters: 'Trimestri',
    years: 'Anni',
    earliestDate: 'Data più antica',
    latestDate: 'Data più recente',
    todayOutOfRange: "Oggi è fuori dall'intervallo di date disponibile",
    dateRange: {
      fromTo: '{{from}} a {{to}}',
      from: 'Da {{val}}',
      to: 'A {{val}}',
    },
  },
  boxplot: {
    tooltip: {
      whiskers: 'Baffi',
      box: 'Scatola',
      min: 'Min',
      median: 'Mediana',
      max: 'Max',
    },
  },
  treemap: {
    tooltip: {
      ofTotal: 'del totale',
      of: 'di',
    },
  },
  advanced: {
    tooltip: {
      min: 'Limite inferiore',
      max: 'Limite superiore',
      forecastValue: 'Valore di previsione',
      forecast: 'Previsione',
      trend: 'Tendenza',
      trendLocalValue: 'Valore locale',
      confidenceInterval: 'Intervallo di confidenza',
      trendType: 'Tipo',
      trendDataKey: 'Dati di tendenza',
      trendData: {
        min: 'Min',
        max: 'Max',
        median: 'Mediana',
        average: 'Media',
      },
    },
  },
  arearange: {
    tooltip: {
      min: 'Min',
      max: 'Max',
    },
  },
  unsupportedFilterMessage: 'Filtro non supportato (applicato alla query dei dati)',
  unsupportedFilter: 'Filtro non supportato {{filter}}',
  commonFilter: {
    clearSelectionButton: 'Cancella selezione',
    selectMenuItem: 'Seleziona',
    unselectMenuItem: 'Deseleziona',
  },
  customFilterTileMessage: 'filtrato con filtro personalizzato',
  filterRelations: {
    and: 'E',
    or: 'O',
    andOrFormulaApplied: 'Formula E/O applicata',
  },
  drilldown: {
    drillMenuItem: 'Esplora',
    breadcrumbsAllSuffix: 'Tutto',
    breadcrumbsPrev: 'Precedente',
    breadcrumbsNext: 'Successivo',
    popover: {
      members: 'Membri',
      table: 'Tabella',
      column: 'Colonna',
    },
  },
  widgetHeader: {
    info: {
      details: 'Dettagli del widget',
      tooltip: 'Fare clic per visualizzare i dettagli completi',
    },
    menu: {
      deleteWidget: 'Elimina widget',
      distributeEqualWidth: 'Distribuisci equamente in questa riga',
    },
  },
  customWidgets: {
    registerPrompt:
      'Tipo di widget personalizzato sconosciuto: {{customWidgetType}}. Si prega di registrare questo widget personalizzato.',
  },
  ai: {
    analyticsChatbot: 'Chatbot di analisi',
    dataTopics: 'Argomenti dei dati',
    chatbotDescription:
      'Il chatbot di analisi è progettato per aiutarti a interagire con i tuoi dati usando il linguaggio naturale.',
    topicSelectPrompt: 'Scegli un argomento che vorresti esplorare:',
    preview: 'Anteprima',
    clearHistoryPrompt: 'Vuoi cancellare questa chat?',
    config: {
      inputPromptText: 'Fai una domanda o digita "/" per idee',
      welcomeText:
        "Benvenuto nell'Assistente di analisi! Posso aiutarti a esplorare e ottenere informazioni dai tuoi dati.",
      suggestionsWelcomeText: 'Alcune domande che potresti avere:',
    },
    buttons: {
      insights: 'Informazioni',
      correctResponse: 'Risposta corretta',
      incorrectResponse: 'Risposta errata',
      clearChat: 'Cancella chat',
      refresh: 'Aggiorna',
      readMore: 'Leggi di più',
      collapse: 'Comprimi',
      yes: 'Sì',
      no: 'No',
      seeMore: 'Vedi di più',
    },
    disclaimer: {
      poweredByAi: "Il contenuto è alimentato dall'IA, quindi sono possibili sorprese ed errori.",
      rateRequest: 'Si prega di valutare le risposte in modo che possiamo migliorare!',
    },
    errors: {
      chatUnavailable: 'Chat non disponibile. Si prega di riprovare più tardi.',
      fetchHistory:
        'Qualcosa è andato storto e non siamo riusciti a recuperare il thread della chat. Ricominciamo!',
      recommendationsNotAvailable:
        'Le raccomandazioni non sono disponibili al momento. Riprova tra qualche minuto.',
      insightsNotAvailable: 'Nessuna informazione disponibile.',
      VectorDBEmptyResponseError:
        "La configurazione dell'IA non è pronta, attendere alcuni minuti e riprovare.",
      LlmBadConfigurationError:
        "La configurazione LLM è errata. Contattare l'amministratore per aggiornare la configurazione del provider LLM.",
      ChartTypeUnsupportedError: 'Il tipo di grafico richiesto non è supportato.',
      BlockedByLlmContentFiltering:
        'Questa domanda è bloccata dalla nostra politica di gestione dei contenuti. Si prega di provare a fare una domanda diversa.',
      LlmContextLengthExceedsLimitError:
        'Sembra che tu abbia raggiunto il limite di lunghezza del messaggio, si prega di cancellare questa conversazione.',
      UserPromptExeedsLimitError:
        'La richiesta supera il limite. Riformula la tua domanda e usa una richiesta più breve.',
      unexpectedChatResponse:
        'Ops, qualcosa è andato storto. Si prega di riprovare più tardi o provare a fare una domanda diversa.',
      unexpected: 'Ops, qualcosa è andato storto. Si prega di riprovare più tardi.',
      unknownResponse: 'Ricevuto responseType sconosciuto, risposta non elaborata=',
      invalidInput: 'Input non valido',
      noAvailableDataTopics: 'Nessuno dei modelli di dati o prospettive forniti è disponibile',
    },
  },
  attribute: {
    datetimeName: {
      years: 'Anni in {{columnName}}',
      quarters: 'Trimestri in {{columnName}}',
      months: 'Mesi in {{columnName}}',
      weeks: 'Settimane in {{columnName}}',
      days: 'Giorni in {{columnName}}',
      hours: 'Ore in {{columnName}}',
      minutes: 'Minuti in {{columnName}}',
    },
  },
  filterEditor: {
    buttons: {
      apply: 'Applica',
      cancel: 'Annulla',
      selectAll: 'Seleziona tutto',
      clearAll: 'Cancella tutto',
    },
    labels: {
      includeAll: 'Includi tutto (nessun filtro applicato)',
      allowMultiSelection: 'Consenti selezione multipla per le liste',
      from: 'Da',
      to: 'A',
      includeCurrent: 'Includendo corrente',
    },
    placeholders: {
      selectFromList: "Seleziona dall'elenco",
      enterEntry: 'Digita la tua voce...',
      enterValue: 'Inserisci il valore...',
      select: 'Seleziona',
    },
    conditions: {
      exclude: 'Non è',
      contains: 'Contiene',
      notContain: 'Non contiene',
      startsWith: 'Inizia con',
      notStartsWith: 'Non inizia con',
      endsWith: 'Termina con',
      notEndsWith: 'Non termina con',
      equals: 'Uguale a',
      notEquals: 'Diverso da',
      isEmpty: 'È vuoto',
      isNotEmpty: 'Non è vuoto',
      lessThan: 'Minore di',
      lessThanOrEqual: 'Uguale o minore di',
      greaterThan: 'Maggiore di',
      greaterThanOrEqual: 'Uguale o maggiore di',
      isWithin: "È all'interno",
    },
    validationErrors: {
      invalidNumber: 'Solo numeri',
      invalidNumericRange: '"A" deve essere maggiore di "Da"',
    },
    datetimeLevels: {
      year: 'Anno',
      quarter: 'Trimestre',
      month: 'Mese',
      week: 'Settimana',
      day: 'Giorno',
      aggrigatedHour: 'Ora (aggregata)',
      aggrigatedMinutesRoundTo15: '15 min (aggregato)',
    },
    relativeTypes: {
      last: 'Ultimo',
      this: 'Questo',
      next: 'Prossimo',
    },
    datetimePositions: {
      before: 'Prima',
      after: 'Dopo',
    },
  },
  dataBrowser: {
    addFilter: 'Aggiungi filtro',
    selectField: 'Seleziona campo',
    configureFilter: 'Configura filtro',
    noResults: 'Nessun risultato',
    searchPlaceholder: 'Cerca',
  },
  pivotTable: {
    grandTotal: 'Totale generale',
    subTotal: 'Totale {{value}}',
    limits: {
      baseNote:
        'I totali possono riferirsi ai dati completi se impostati dal proprietario della dashboard. Se disponibile, puoi usare i filtri per visualizzare meno righe e colonne.',
      rowsLimit: 'La tabella pivot è limitata a {{recordsCount}} record',
      columnsLimit: 'La tabella pivot è limitata a {{columnsCount}} colonne',
      columnsAndRowsLimit:
        'La tabella pivot è limitata a {{recordsCount}} record e {{columnsCount}} colonne',
    },
  },
  dashboard: {
    toolbar: {
      undo: 'Annulla',
      redo: 'Ripeti',
      cancel: 'Annulla',
      apply: 'Applica',
      editLayout: 'Modifica layout',
      viewMode: 'Passa alla modalità visualizzazione',
      showFilters: 'Mostra filtri',
      hideFilters: 'Nascondi filtri',
      columns: 'Colonne',
      column: 'Colonna',
    },
  },
  jumpToDashboard: {
    defaultCaption: 'Vai a',
    jumpableTooltip: 'Questo widget è navigabile',
  },
  calendarHeatmap: {
    navigation: {
      firstMonth: 'Primo mese',
      lastMonth: 'Ultimo mese',
      previousMonth: 'Mese precedente',
      nextMonth: 'Mese successivo',
      previousGroup: 'Gruppo precedente',
      nextGroup: 'Gruppo successivo',
    },
  },
};

export default [
  {
    language: 'it-IT',
    namespace: SDK_UI_NAMESPACE,
    resources: translation,
  },
];
