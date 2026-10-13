/* eslint-disable sonarjs/no-duplicate-string -- Locale strings deliberately repeat across
   unrelated keys and across CLDR plural forms this language does not distinguish (Time
   Frame's `_few`/`_many` mirroring `_other`). Constants would fragment the translations. */
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
  notifications: {
    dismiss: 'Chiudi notifica',
    auth: {
      sessionExpiredTitle: 'Sessione scaduta',
      sessionExpiredMessage: 'La sessione è scaduta. Accedi di nuovo per continuare.',
      authenticationFailedTitle: 'Autenticazione non riuscita',
      authenticationFailedMessage:
        "Le credenziali fornite sono state rifiutate dall'istanza Sisense.",
    },
    permission: {
      forbiddenTitle: 'Accesso negato',
      forbiddenMessage: 'Non hai i permessi per accedere a questi dati.',
    },
    network: {
      unreachableTitle: 'Problema di connessione',
      unreachableMessage: "Impossibile raggiungere l'istanza Sisense.",
    },
    server: {
      errorTitle: 'Errore del server',
      errorMessage: "L'istanza Sisense ha restituito un errore. Riprova più tardi.",
    },
    general: {
      requestFailedTitle: 'Richiesta non riuscita',
      requestFailedMessage: "Una richiesta all'istanza Sisense non è riuscita.",
    },
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
    count: 'Conta',
    select: 'Seleziona',
    today: 'Oggi',
    days: 'Giorni',
    weeks: 'Settimane',
    months: 'Mesi',
    quarters: 'Trimestri',
    years: 'Anni',
    earliestDate: 'Data meno recente',
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
      forecastValue: 'Valore previsionale',
      forecast: 'Previsione',
      trend: 'Tendenza',
      trendLocalValue: 'Valore locale',
      confidenceInterval: 'Intervallo di confidenza',
      trendType: 'Tipo',
      trendDataKey: 'Dati tendenza',
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
  filterWidget: {
    placeholders: {
      setFilter: 'Imposta filtro',
    },
    dateRange: {
      from: 'Da',
      to: 'A',
      invertedFrom: 'Deve essere precedente alla data di fine',
      invertedTo: 'Deve essere successiva alla data di inizio',
    },
    numberRange: {
      minimum: 'Minimo',
      maximum: 'Massimo',
      notSet: 'Non impostato',
      clear: 'Cancella {{field}}',
    },
    selectedCount: '{{count}} selezionati',
    allExceptCount: 'Tutti tranne {{count}}',
    setupTitle: 'Configura un widget filtro',
    setupSubtitle: 'Imposta una dimensione e configura come funziona il filtro',
    emptySetup: 'Imposta filtro',
    conditionUnsupported: 'La condizione è disponibile per i campi di testo, numerici e di data',
    dateCondition: {
      onOrBefore: 'In data o prima',
      onOrAfter: 'In data o dopo',
      includingCurrent: 'includendo corrente',
      includingCurrentLabel: 'Includendo corrente',
      countMin: 'Inserisci un numero intero maggiore o uguale a 1',
      summary: {
        current: '{{- operator}} {{- grain}}',
        relative: '{{- operator}} {{- count}} {{- grain}}',
        relativeIncludingCurrent: '{{- operator}} {{- count}} {{- grain}} {{- includingCurrent}}',
        date: '{{- operator}} {{- date}}',
      },
    },
    conditionNotRepresentable: 'Questa condizione non può essere modificata qui',
    controls: {
      findInList: "Cerca nell'elenco",
      enterValue: 'Inserisci il valore...',
      noMatches: 'Nessuna corrispondenza',
      clearSelection: 'Cancella selezione',
      overflowCount: '+{{count}}',
      select: 'Seleziona',
      selectDateLevel: 'Seleziona il livello di data',
      selectCondition: 'Seleziona condizione',
      selectConnector: 'Seleziona E/O',
      addCondition: '+ Aggiungi condizione',
      fillOrRemoveCondition: 'Compila o rimuovi la condizione',
      rangeOrderError: 'Il secondo valore deve essere superiore al primo',
      betweenMin: 'Minimo',
      betweenMax: 'Massimo',
      increaseCount: 'Aumenta',
      decreaseCount: 'Diminuisci',
      selectValues: 'Seleziona {{level}}',
      clear: 'Cancella',
    },
    timeFrame: {
      /** Accessible name for the row-list popover — read to a screen reader on open. */
      listboxLabel: 'Opzioni periodo',
      /**
       * Row labels. Two shapes carry a `{{count}}`, which i18next resolves to the
       * `_one` (singular) or `_other` (plural) key by CLDR plural rules. Locales
       * with more plural forms — Russian's `_few`/`_many`, Polish's `_many` — add
       * more suffixes in their own resources; English needs only the two.
       */
      labels: {
        /** Day-grain count=1: `Today` / `Yesterday` / `Tomorrow` — calendar words, not arithmetic. */
        today: 'Oggi',
        yesterday: 'Ieri',
        tomorrow: 'Domani',
        /** `This X` — single period, no count in the label. Day has none (Today covers it). */
        this: {
          week: 'Questa settimana',
          month: 'Questo mese',
          quarter: 'Questo trimestre',
          year: "Quest'anno",
        },
        /**
         * `Last X` / `Last N X` — count drops for the singular, plural interpolates it.
         * Day `_one` renders as `Yesterday` and never reaches this key.
         */
        last: {
          week_one: 'Settimana scorsa',
          week_few: 'Ultime {{count}} settimane',
          week_many: 'Ultime {{count}} settimane',
          week_other: 'Ultime {{count}} settimane',
          month_one: 'Mese scorso',
          month_few: 'Ultimi {{count}} mesi',
          month_many: 'Ultimi {{count}} mesi',
          month_other: 'Ultimi {{count}} mesi',
          quarter_one: 'Trimestre scorso',
          quarter_few: 'Ultimi {{count}} trimestri',
          quarter_many: 'Ultimi {{count}} trimestri',
          quarter_other: 'Ultimi {{count}} trimestri',
          year_one: 'Anno scorso',
          year_few: 'Ultimi {{count}} anni',
          year_many: 'Ultimi {{count}} anni',
          year_other: 'Ultimi {{count}} anni',
          day_few: 'Ultimi {{count}} giorni',
          day_many: 'Ultimi {{count}} giorni',
          day_other: 'Ultimi {{count}} giorni',
        },
        /** `Next X` / `Next N X`. Day `_one` renders as `Tomorrow`. */
        next: {
          week_one: 'Prossima settimana',
          week_few: 'Prossime {{count}} settimane',
          week_many: 'Prossime {{count}} settimane',
          week_other: 'Prossime {{count}} settimane',
          month_one: 'Prossimo mese',
          month_few: 'Prossimi {{count}} mesi',
          month_many: 'Prossimi {{count}} mesi',
          month_other: 'Prossimi {{count}} mesi',
          quarter_one: 'Prossimo trimestre',
          quarter_few: 'Prossimi {{count}} trimestri',
          quarter_many: 'Prossimi {{count}} trimestri',
          quarter_other: 'Prossimi {{count}} trimestri',
          year_one: 'Prossimo anno',
          year_few: 'Prossimi {{count}} anni',
          year_many: 'Prossimi {{count}} anni',
          year_other: 'Prossimi {{count}} anni',
          day_few: 'Prossimi {{count}} giorni',
          day_many: 'Prossimi {{count}} giorni',
          day_other: 'Prossimi {{count}} giorni',
        },
        /** Paired frames — include the current period. Day grain has no such pair. */
        thisAndLast: {
          week: 'Questa e la scorsa settimana',
          month: 'Questo e lo scorso mese',
          quarter: 'Questo e lo scorso trimestre',
          year: "Quest'anno e lo scorso",
        },
        thisAndNext: {
          week: 'Questa e la prossima settimana',
          month: 'Questo e il prossimo mese',
          quarter: 'Questo e il prossimo trimestre',
          year: "Quest'anno e il prossimo",
        },
      },
    },
    calendar: {
      selectDates: 'Seleziona date',
      multipleDaysHint: 'È possibile selezionare più giorni',
      formatError: 'Rispetta il formato {{- format}}',
      nonexistent: 'Questa data non esiste',
      chooseDate: 'Scegli una data',
      chooseDates: 'Scegli le date',
      previousMonth: 'Mese precedente',
      nextMonth: 'Mese successivo',
      previousYear: 'Anno precedente',
      nextYear: 'Anno successivo',
      openCalendar: 'Apri calendario',
      clearDate: 'Cancella data',
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
    drillMenuItem: 'Espandi',
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
    addTitle: 'Aggiungi titolo',
    info: {
      details: 'Dettagli widget',
      tooltip: 'Fare clic per visualizzare i dettagli completi',
    },
    chartTableToggle: {
      switchToTable: 'Passa alla tabella',
      switchToChart: 'Passa al grafico',
    },
    menu: {
      deleteWidget: 'Elimina widget',
      duplicateWidget: 'Duplica widget',
      renameWidget: 'Rinomina widget',
      distributeEqualWidth: 'Distribuisci allo stesso modo in questa riga',
      download: 'Scarica',
      csvFile: 'File CSV',
      excelFile: 'File Excel',
      repeatRowsRecommended: 'Ripeti le righe (consigliato)',
      mergeRows: 'Unisci righe',
    },
  },
  customWidgets: {
    registerPrompt:
      'Tipo di widget personalizzato sconosciuto: {{customWidgetType}}. Si prega di registrare questo widget personalizzato.',
  },
  narrativeWidget: {
    generate: 'Genera narrazione',
    regenerate: 'Rigenera',
    retry: 'Riprova generazione',
    disclaimer: "Il contenuto è alimentato dall'IA, quindi sono possibili errori.",
    updatedAt: 'Aggiornato {{timestamp}}',
    copy: 'Copia negli appunti',
    copied: 'Copiato',
    creditsUsed: 'È stato utilizzato il {{usagePercentage}}% dei crediti IA.',
    noDataTitle: 'Nessun dato della dashboard disponibile',
    noDataDescription:
      'Quando i dati della dashboard saranno disponibili, potrai generare una narrazione.',
    failedTitle: 'Impossibile generare la narrazione',
    failedDescription: "Riprova più tardi. Se il problema persiste, contatta l'amministratore.",
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
      readMore: 'Mostra di più',
      collapse: 'Comprimi',
      yes: 'Sì',
      no: 'No',
      seeMore: 'Vedi di più',
      generateNarrative: 'Genera narrazione IA',
      hideNarrative: 'Nascondi narrazione IA',
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
      failedToFetchCreditBalance: 'Impossibile recuperare il saldo dei crediti',
    },
    quota: {
      exceededErrorTitle: 'Le risposte IA non sono attualmente disponibili.',
      exceededErrorDescription:
        'Hai raggiunto la quota mensile di IA della tua azienda. La quota verrà rinnovata automaticamente al prossimo ciclo di utilizzo mensile.',
      warningDescription:
        'Hai utilizzato il {{usagePercentage}}% della quota mensile di IA della tua azienda.',
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
    tooltips: {
      selectAllPartiallyLoaded:
        'Non tutti i valori sono visualizzati. Scorri la lista verso il basso per caricare i valori rimanenti. Puoi anche usare la condizione "Non è" qui sotto per escludere valori specifici.',
    },
    labels: {
      includeAll: 'Includi tutto (nessun filtro applicato)',
      allowMultiSelection: 'Consenti selezione multipla per le liste',
      from: 'Da',
      to: 'A',
      includeCurrent: 'Includendo corrente',
      rankedBy: 'Classificato per',
      selectField: 'Seleziona campo',
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
      between: 'Tra',
      top: 'Top',
      bottom: 'Ultimi',
    },
    validationErrors: {
      invalidNumber: 'Solo numeri',
      invalidNumericRange: '"A" deve essere maggiore di "Da"',
    },
    datetimeLevels: {
      year: 'Anno',
      year_one: 'Anno',
      year_few: 'Anni',
      year_many: 'Anni',
      year_other: 'Anni',
      quarter: 'Trimestre',
      quarter_one: 'Trimestre',
      quarter_few: 'Trimestri',
      quarter_many: 'Trimestri',
      quarter_other: 'Trimestri',
      month: 'Mese',
      month_one: 'Mese',
      month_few: 'Mesi',
      month_many: 'Mesi',
      month_other: 'Mesi',
      week: 'Settimana',
      week_one: 'Settimana',
      week_few: 'Settimane',
      week_many: 'Settimane',
      week_other: 'Settimane',
      day: 'Giorno',
      day_one: 'Giorno',
      day_few: 'Giorni',
      day_many: 'Giorni',
      day_other: 'Giorni',
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
    more: 'Altro...',
    filter: 'Filtro',
    addMeasure: 'Aggiungi misura',
  },
  pivotTable: {
    grandTotal: 'Totale complessivo',
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
  filterTile: {
    menu: {
      lock: 'Blocca',
      unlock: 'Sblocca',
      lockGroup: 'Blocca gruppo',
      unlockGroup: 'Sblocca gruppo',
    },
    toggleSwitch: 'Attiva/disattiva filtro',
    linkedToWidget: {
      label: 'Collegato al widget filtro',
      tooltip:
        'Questo filtro non può essere modificato dal pannello dei filtri. Modifica i valori direttamente nella dashboard.',
      infoAriaLabel: 'Informazioni sul collegamento al widget filtro',
    },
  },
  chart: {
    indicator: {
      label: 'Grafico indicatore',
    },
    visualization: {
      label: 'Visualizzazione dati',
    },
    pivotTable: {
      label: 'Tabella pivot',
    },
    table: {
      label: 'Tabella dati',
      totalRows: 'Totale: {{formattedCount}} righe',
      rowsRange: 'Righe {{start}}-{{end}}',
    },
    sankey: {
      alerts: {
        tooManyStages:
          'Il diagramma di Sankey ha {{stageCount}} fasi; più di {{softLimit}} spesso produce un diagramma illeggibile. Riduci le colonne categoria o applica filtri più restrittivi.',
      },
    },
  },
  kpi: {
    comparison: {
      vsPriorYear: 'vs anno precedente',
      vsPriorQuarter: 'vs trimestre precedente',
      vsPriorMonth: 'vs mese precedente',
      vsPriorWeek: 'vs settimana precedente',
      vsPriorDay: 'vs giorno precedente',
      vsPriorPeriod: 'vs periodo precedente',
      vsBaseline: 'vs {{label}}',
      withBaseline: '{{label}} ({{baseline}})',
    },
    target: {
      ofGoal: "{{percent}} dell'obiettivo ({{goalValue}})",
      toGo: 'Mancano {{value}}',
    },
    percentFormat: '{{sign}}{{value}}%',
  },
  loadingOverlay: {
    label: 'Caricamento contenuto',
  },
  queryDefinition: {
    showMorePills: 'Mostra altri {{count}}',
    showLess: 'Mostra meno',
    connectorBy: 'per',
    connectorWhere: 'dove',
    tooltipType: 'Tipo',
    tooltipColumn: 'Colonna',
    tooltipFormula: 'Formula',
    filterPill: {
      customFilter: 'filtro personalizzato',
      empty: 'vuoto',
      notEmpty: 'non vuoto',
      not: 'non {{value}}',
      and: 'e',
      or: 'o',
      moreValues: '{{values}} +{{count}} altri',
      range: '{{from}} a {{to}}',
      fromToLatest: '{{from}} alla data più recente',
      earliestTo: 'data più antica a {{to}}',
      dependentOn: 'dipende da {{parents}}',
      dependentFilter: 'filtro dipendente',
      text: {
        contains: 'contiene {{value}}',
        startsWith: 'inizia con {{value}}',
        endsWith: 'termina con {{value}}',
        doesntEqual: 'diverso da {{value}}',
        doesntStartWith: 'non inizia con {{value}}',
        doesntContain: 'non contiene {{value}}',
        doesntEndWith: 'non termina con {{value}}',
        like: 'simile a {{value}}',
      },
      ranking: {
        top: 'Top {{count}}',
        bottom: 'Ultimi {{count}}',
        by: '{{rank}} per {{measure}}',
      },
      relative: {
        last: 'periodo precedente di {{count}} {{unit}}',
        next: 'periodo successivo di {{count}} {{unit}}',
        lastTo: '{{count}} {{unit}} fino al {{date}}',
        nextFrom: '{{count}} {{unit}} dal {{date}}',
        includingCurrent: '{{period}}, periodo corrente incluso',
        withOffset: '{{period}}, scostamento {{offset}}',
        today: 'oggi',
        thisWeek: 'questa settimana',
        thisMonth: 'questo mese',
        thisQuarter: 'questo trimestre',
        thisYear: "quest'anno",
      },
      units: {
        year_one: 'anno',
        year_few: 'anni',
        year_many: 'anni',
        year_other: 'anni',
        quarter_one: 'trimestre',
        quarter_few: 'trimestri',
        quarter_many: 'trimestri',
        quarter_other: 'trimestri',
        month_one: 'mese',
        month_few: 'mesi',
        month_many: 'mesi',
        month_other: 'mesi',
        week_one: 'settimana',
        week_few: 'settimane',
        week_many: 'settimane',
        week_other: 'settimane',
        day_one: 'giorno',
        day_few: 'giorni',
        day_many: 'giorni',
        day_other: 'giorni',
        hour_one: 'ora',
        hour_few: 'ore',
        hour_many: 'ore',
        hour_other: 'ore',
        minute_one: 'minuto',
        minute_few: 'minuti',
        minute_many: 'minuti',
        minute_other: 'minuti',
      },
    },
  },
  measures: {
    countShort: 'N° di {{level}}',
    countDistinct: 'Conta unici',
    count: 'Conta tutti',
    average: 'Media',
    sum: 'Somma',
    min: 'Min',
    max: 'Max',
    stdev: 'Deviazione standard',
    median: 'Mediana',
    variance: 'Varianza',
  },
  measuresAgg: {
    countDistinct: '# unici',
    count: 'N. di',
    sum: 'Totale',
    average: 'Media',
    min: 'Min',
    max: 'Max',
    median: 'Mediana di',
    variance: 'Varianza di',
    stdev: 'Deviazione standard di',
  },
};

export default [
  {
    language: 'it-IT',
    namespace: SDK_UI_NAMESPACE,
    resources: translation,
  },
];
