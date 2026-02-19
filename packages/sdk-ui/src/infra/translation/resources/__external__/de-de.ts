import type { TranslationDictionary } from '../index.js';
import { PACKAGE_NAMESPACE as SDK_UI_NAMESPACE } from '../index.js';

/**
 * Translation dictionary for German language.
 */
const translation: TranslationDictionary = {
  errors: {
    noSisenseContext: 'Sisense-Kontext ist nicht initialisiert',
    restApiNotReady: 'REST-API ist nicht initialisiert',
    componentRenderError: 'Komponente konnte nicht gerendert werden',
    sisenseContextNoAuthentication: 'Authentifizierungsmethode wurde nicht angegeben',
    chartNoSisenseContext:
      'Sisense-Kontext für Diagramm nicht gefunden. Um dies zu beheben, wickeln Sie die Komponente mit einem Sisense-Kontextanbieter ein oder stellen Sie einen vorhandenen Datensatz über Props bereit.',
    widgetByIdNoSisenseContext:
      'Sisense-Kontext für Dashboard-Widget nicht gefunden. Um dies zu beheben, wickeln Sie die Komponente mit einem Sisense-Kontextanbieter ein.',
    widgetByIdInvalidIdentifier:
      'Widget {{widgetOid}} konnte nicht vom Dashboard {{dashboardOid}} abgerufen werden. ' +
      'Bitte stellen Sie sicher, dass das Dashboard-Widget existiert und zugänglich ist.',
    dashboardWidgetsInvalidIdentifiers:
      'Dashboard-Widgets konnten nicht vom Dashboard {{dashboardOid}} abgerufen werden. ' +
      'Bitte stellen Sie sicher, dass das Dashboard existiert und zugänglich ist.',
    executeQueryNoSisenseContext:
      'Sisense-Kontext für Abfrageausführung nicht gefunden. Um dies zu beheben, wickeln Sie die Komponente mit einem Sisense-Kontextanbieter ein.',
    executeQueryNoDataSource: 'Keine dataSource zum Ausführen der Abfrage bereitgestellt',
    dataOptions: {
      noDimensionsAndMeasures:
        'Weder Dimensionen noch Measures gefunden. Datenoptionen sollten mindestens eine Dimension oder ein Measure enthalten.',
      attributeNotFound: 'Attribut "{{attributeName}}" nicht in den Daten gefunden',
      measureNotFound: 'Measure "{{measureName}}" nicht in den Daten gefunden',
      filterAttributeNotFound: 'Filterattribut "{{attributeName}}" nicht in den Daten gefunden',
      highlightAttributeNotFound:
        'Hervorhebungsattribut "{{attributeName}}" nicht in den Daten gefunden',
    },
    optionsTranslation: {
      invalidStyleOptions: "Ungültige Stiloptionen für '{{chartType}}'-Diagramm",
      invalidInternalDataOptions:
        "Datenoptionen wurden nicht korrekt für '{{chartType}}'-Diagramm konvertiert",
    },
    themeNotFound: 'Design mit oid {{themeOid}} nicht in der verbundenen Sisense-Umgebung gefunden',
    paletteNotFound: "Palette '{{paletteName}}' nicht in der verbundenen Sisense-Umgebung gefunden",
    chartTypeNotSupported: 'Diagrammtyp {{chartType}} wird nicht unterstützt',
    chartInvalidProps: 'Ungültige Diagramm-Props für Diagrammtyp: {{chartType}}',
    unsupportedWidgetType:
      'Props für nicht unterstützten Widget-Typ können nicht extrahiert werden - {{widgetType}}',
    dashboardInvalidIdentifier:
      'Dashboard {{dashboardOid}} konnte nicht abgerufen werden. Bitte stellen Sie sicher, dass das Dashboard existiert und für den aktuellen Benutzer zugänglich ist.',
    sharedFormula: {
      identifierExpected:
        'Geteilte Formel konnte nicht abgerufen werden. Bitte geben Sie oid oder sowohl name als auch datasource an. ' +
        'Bereitgestellte Werte: name={{name}}, dataSource={{dataSource}}, oid={{oid}}',
      failedToFetchByOid: 'Geteilte Formel konnte nicht über oid {{oid}} abgerufen werden',
      failedToFetchByName:
        'Geteilte Formel konnte nicht über name {{name}} und dataSource {{dataSource}} abgerufen werden',
    },
    widgetModel: {
      incompleteWidget:
        'WidgetModelTranslator: Widget kann aufgrund unvollständiger Eigenschaft ({{prop}}) nicht in DTO transformiert werden',
      unsupportedWidgetTypeDto:
        'WidgetModelTranslator: Speichern des Widgets vom Typ {{chartType}} wird nicht unterstützt',
      pivotWidgetNotSupported:
        'WidgetModelTranslator: Pivot-Widget wird für Methode {{methodName}} nicht unterstützt',
      textWidgetNotSupported:
        'WidgetModelTranslator: Text-Widget wird für Methode {{methodName}} nicht unterstützt',
      onlyTableWidgetSupported:
        'WidgetModelTranslator: Nur Tabellen-Widget wird für Methode {{methodName}} unterstützt',
      onlyPivotWidgetSupported:
        'WidgetModelTranslator: Nur Pivot-Widget wird für Methode {{methodName}} unterstützt',
      onlyTextWidgetSupported:
        'WidgetModelTranslator: Nur Text-Widget wird für Methode {{methodName}} unterstützt',
      onlyCustomWidgetSupported:
        'WidgetModelTranslator: Nur benutzerdefiniertes Widget wird für Methode {{methodName}} unterstützt',
      unsupportedWidgetType: 'Nicht unterstützter Widget-Typ: {{widgetType}}',
      unsupportedFusionWidgetType: 'Nicht unterstützter Fusion-Widget-Typ: {{widgetType}}',
    },
    unknownFilterInFilterRelations:
      'Filterbeziehung enthält einen Filter {{filterGuid}}, der in den bereitgestellten Filtern nicht gefunden werden konnte',
    invalidFilterType: 'Ungültiger Filtertyp. Erwartet: {{filterType}}',
    secondsDateTimeLevelIsNotSupported:
      "Datums-/Zeitebene 'seconds' wird für diese Datenquelle nicht unterstützt",
    missingMenuRoot: 'Initialisierte Menüwurzel fehlt',
    missingModalRoot: 'Initialisierte modale Wurzel fehlt',
    missingDataSource:
      "Der Wert 'dataSource' fehlt. Er muss explizit bereitgestellt werden, oder ein 'defaultDataSource' sollte im Sisense-Kontextanbieter angegeben werden.",
    incorrectOnDataReadyHandler: "'onDataReady'-Handler muss ein gültiges Datenobjekt zurückgeben",
    emptyModel: 'Leeres Modell',
    missingMetadata: 'Metadaten fehlen',
    missingModelTitle: 'Modelltitel fehlt',
    httpClientNotFound: 'HttpClient nicht gefunden.',
    serverSettingsNotLoaded: 'Servereinstellungen konnten nicht geladen werden',
    requiredColumnMissing: 'Eine erforderliche Spalte fehlt. {{hint}}',
    unexpectedChartType: 'Unerwarteter Diagrammtyp: {{chartType}}',
    noRowNumColumn: 'Daten haben keine row num-Spalte: {{columnName}}',
    tickIntervalCalculationFailed:
      'Tick-Intervall konnte nicht berechnet werden. Versuchen Sie, die Datums-/Zeitgranularität anzugeben.',
    polarChartDesignOptionsExpected:
      'Polardiagramm-Designoptionen werden für Polardiagramm erwartet',
    polarChartDesignOptionsNotExpected:
      'Polardiagramm-Designoptionen werden für Nicht-Polardiagramm nicht erwartet',
    indicatorInvalidRelativeSize: 'Ungültige relative Größenoptionen für Indikatordiagramm',
    unsupportedMapType: 'Nicht unterstützter Kartentyp: {{mapType}}',
    mapLoadingFailed: 'Karte konnte nicht geladen werden',
    cascadingFilterOriginalNotFound:
      'Fehler beim Neuzusammenstellen von Kaskadenfiltern. Ursprünglicher Kaskadenfilter nicht gefunden',
    dashboardLoadFailed: 'Dashboard konnte nicht geladen werden. {{error}}',
    widgetLoadFailed: 'Widget konnte nicht geladen werden. {{error}}',
    failedToAddWidget: 'Widget konnte nicht zum Dashboard hinzugefügt werden',
    widgetEmptyResponse: 'Leere Antwort für Widget mit oid {{widgetOid}}',
    dateFilterIncorrectOperator: 'Falscher Operator: {{operator}}',
    synchronizedFilterInvalidProps:
      'Der Hook `useSynchronizedFilter` muss mindestens eines von [non-null `filterFromProps`] oder [`createEmptyFilter`-Funktion] verwenden',
    unexpectedCacheValue: 'Unerwarteter Cache-Wert',
    notAMembersFilter: 'Filter ist kein MembersFilter',
    drilldownNoInitialDimension:
      'Initiale Dimension muss angegeben werden, um Drilldown mit benutzerdefinierten Komponenten zu verwenden',
    otherWidgetTypesNotSupported: 'Andere Widget-Typen werden noch nicht unterstützt',
    dataBrowser: {
      dimensionNotFound: 'Dimension mit id {{dimensionId}} nicht gefunden',
      attributeNotFound: 'Attribut mit id {{attributeId}} nicht gefunden',
    },
    addFilterPopover: {
      noDataSources:
        'Keine Datenquellen verfügbar. Versuchen Sie, `dataSource` in Widgets oder `defaultDataSource` auf Dashboard-Ebene zu definieren.',
    },
    tabberInvalidConfiguration: 'Tabber-Widget-Konfiguration ist ungültig',
  },
  errorBoxText: '$t(common:error): {{errorMessage}}',
  chartNoData: 'Keine Ergebnisse',
  filters: 'Filter',
  cancel: 'Abbrechen',
  includeAll: 'Alle einschließen',
  formatting: {
    number: {
      abbreviations: {
        thousand: 'T',
        million: 'M',
        billion: 'Mrd',
        trillion: 'B',
      },
    },
  },
  criteriaFilter: {
    displayModePrefix: 'Alle Elemente',
    equals: 'Gleich {{val}}',
    notEquals: 'Ungleich {{val}}',
    lessThan: 'Weniger als {{val}}',
    lessThanOrEqual: 'Weniger als oder gleich {{val}}',
    greaterThan: 'Größer als {{val}}',
    greaterThanOrEqual: 'Größer als oder gleich {{val}}',
    between: 'Zwischen {{valA}} und {{valB}}',
    notBetween: 'Nicht zwischen {{valA}} und {{valB}}',
    top: 'Top {{valA}} nach {{valB}}',
    bottom: 'Letzte {{valA}} nach {{valB}}',
    is: 'Ist {{val}}',
    isNot: 'Ist nicht {{val}}',
    contains: 'Enthält {{val}}',
    notContains: `Enthält nicht {{val}}`,
    startsWith: 'Beginnt mit {{val}}',
    notStartsWith: `Beginnt nicht mit {{val}}`,
    endsWith: 'Endet mit {{val}}',
    notEndsWith: `Endet nicht mit {{val}}`,
    like: 'Ist wie {{val}}',
    byMeasure: 'Nach Maß',
    by: 'nach',
  },
  dateFilter: {
    last: 'Letzte',
    next: 'Nächste',
    from: 'Von',
    to: 'Bis',
    count: 'Anzahl',
    select: 'Auswählen',
    today: 'Heute',
    days: 'Tage',
    weeks: 'Wochen',
    months: 'Monate',
    quarters: 'Quartale',
    years: 'Jahre',
    earliestDate: 'Frühestes Datum',
    latestDate: 'Spätestes Datum',
    todayOutOfRange: 'Heute liegt außerhalb des verfügbaren Datumsbereichs',
    dateRange: {
      fromTo: '{{from}} bis {{to}}',
      from: 'Von {{val}}',
      to: 'Bis {{val}}',
    },
  },
  boxplot: {
    tooltip: {
      whiskers: 'Whiskers',
      box: 'Box',
      min: 'Min',
      median: 'Median',
      max: 'Max',
    },
  },
  treemap: {
    tooltip: {
      ofTotal: 'von insgesamt',
      of: 'von',
    },
  },
  advanced: {
    tooltip: {
      min: 'Untere Grenze',
      max: 'Obere Grenze',
      forecastValue: 'Prognosewert',
      forecast: 'Prognose',
      trend: 'Trend',
      trendLocalValue: 'Lokaler Wert',
      confidenceInterval: 'Konfidenzintervall',
      trendType: 'Typ',
      trendDataKey: 'Trenddaten',
      trendData: {
        min: 'Min',
        max: 'Max',
        median: 'Median',
        average: 'Durchschnitt',
      },
    },
  },
  arearange: {
    tooltip: {
      min: 'Min',
      max: 'Max',
    },
  },
  unsupportedFilterMessage: 'Nicht unterstützter Filter (auf Datenabfrage angewendet)',
  unsupportedFilter: 'Nicht unterstützter Filter {{filter}}',
  commonFilter: {
    clearSelectionButton: 'Auswahl löschen',
    selectMenuItem: 'Auswählen',
    unselectMenuItem: 'Auswahl aufheben',
  },
  customFilterTileMessage: 'mit benutzerdefiniertem Filter gefiltert',
  filterRelations: {
    and: 'UND',
    or: 'ODER',
    andOrFormulaApplied: 'UND/ODER-Formel angewendet',
  },
  drilldown: {
    drillMenuItem: 'Drill',
    breadcrumbsAllSuffix: 'Alle',
    breadcrumbsPrev: 'Zurück',
    breadcrumbsNext: 'Weiter',
    popover: {
      members: 'Mitglieder',
      table: 'Tabelle',
      column: 'Spalte',
    },
  },
  widgetHeader: {
    info: {
      details: 'Widget-Details',
      tooltip: 'Klicken Sie, um vollständige Details anzuzeigen',
    },
    menu: {
      deleteWidget: 'Widget löschen',
      distributeEqualWidth: 'Gleichmäßig in dieser Zeile verteilen',
    },
  },
  customWidgets: {
    registerPrompt:
      'Unbekannter benutzerdefinierter Widget-Typ: {{customWidgetType}}. Bitte registrieren Sie dieses benutzerdefinierte Widget.',
  },
  ai: {
    analyticsChatbot: 'Analytik-Chatbot',
    dataTopics: 'Daten-Themen',
    chatbotDescription:
      'Der Analytik-Chatbot wurde entwickelt, um Ihnen bei der Interaktion mit Ihren Daten in natürlicher Sprache zu helfen.',
    topicSelectPrompt: 'Wählen Sie ein Thema aus, das Sie erkunden möchten:',
    preview: 'Vorschau',
    clearHistoryPrompt: 'Möchten Sie diesen Chat löschen?',
    config: {
      inputPromptText: 'Stellen Sie eine Frage oder geben Sie "/" für Ideen ein',
      welcomeText:
        'Willkommen beim Analytik-Assistenten! Ich kann Ihnen helfen, Ihre Daten zu erkunden und Erkenntnisse daraus zu gewinnen.',
      suggestionsWelcomeText: 'Einige Fragen, die Sie möglicherweise haben:',
    },
    buttons: {
      insights: 'Erkenntnisse',
      correctResponse: 'Korrekte Antwort',
      incorrectResponse: 'Falsche Antwort',
      clearChat: 'Chat löschen',
      refresh: 'Aktualisieren',
      readMore: 'Mehr lesen',
      collapse: 'Einklappen',
      yes: 'Ja',
      no: 'Nein',
      seeMore: 'Mehr anzeigen',
    },
    disclaimer: {
      poweredByAi:
        'Inhalte werden von KI unterstützt, daher sind Überraschungen und Fehler möglich.',
      rateRequest: 'Bitte bewerten Sie Antworten, damit wir uns verbessern können!',
    },
    errors: {
      chatUnavailable: 'Chat nicht verfügbar. Bitte versuchen Sie es später erneut.',
      fetchHistory:
        'Etwas ist schiefgelaufen und wir konnten den Chat-Verlauf nicht abrufen. Lassen Sie uns von vorne beginnen!',
      recommendationsNotAvailable:
        'Empfehlungen sind derzeit nicht verfügbar. Versuchen Sie es in ein paar Minuten erneut.',
      insightsNotAvailable: 'Keine Erkenntnisse verfügbar.',
      VectorDBEmptyResponseError:
        'Die KI-Konfiguration ist noch nicht bereit. Bitte warten Sie einige Minuten und versuchen Sie es erneut.',
      LlmBadConfigurationError:
        'Die LLM-Konfiguration ist falsch. Wenden Sie sich an Ihren Administrator, um die LLM-Provider-Konfiguration zu aktualisieren.',
      ChartTypeUnsupportedError: 'Angeforderter Diagrammtyp wird nicht unterstützt.',
      BlockedByLlmContentFiltering:
        'Diese Frage wird von unserer Content-Management-Richtlinie blockiert. Bitte versuchen Sie, eine andere Frage zu stellen.',
      LlmContextLengthExceedsLimitError:
        'Es sieht so aus, als hätten Sie das Nachrichtenlängenlimit erreicht. Bitte löschen Sie diese Unterhaltung.',
      UserPromptExeedsLimitError:
        'Die Eingabe überschreitet das Limit. Formulieren Sie Ihre Frage um und verwenden Sie eine kürzere Eingabe.',
      unexpectedChatResponse:
        'Oh nein, etwas ist schiefgelaufen. Bitte versuchen Sie es später erneut oder stellen Sie eine andere Frage.',
      unexpected: 'Oh nein, etwas ist schiefgelaufen. Bitte versuchen Sie es später erneut.',
      unknownResponse: 'Unbekannter responseType erhalten, rohe Antwort=',
      invalidInput: 'Ungültige Eingabe',
      noAvailableDataTopics:
        'Keines der bereitgestellten Datenmodelle oder Perspektiven ist verfügbar',
    },
  },
  attribute: {
    datetimeName: {
      years: 'Jahre in {{columnName}}',
      quarters: 'Quartale in {{columnName}}',
      months: 'Monate in {{columnName}}',
      weeks: 'Wochen in {{columnName}}',
      days: 'Tage in {{columnName}}',
      hours: 'Stunden in {{columnName}}',
      minutes: 'Minuten in {{columnName}}',
    },
  },
  filterEditor: {
    buttons: {
      apply: 'Anwenden',
      cancel: 'Abbrechen',
      selectAll: 'Alle auswählen',
      clearAll: 'Alle löschen',
    },
    labels: {
      includeAll: 'Alle einschließen (kein Filter angewendet)',
      allowMultiSelection: 'Mehrfachauswahl für Listen zulassen',
      from: 'Von',
      to: 'Bis',
      includeCurrent: 'Aktuelles einschließen',
    },
    placeholders: {
      selectFromList: 'Aus Liste auswählen',
      enterEntry: 'Geben Sie Ihren Eintrag ein...',
      enterValue: 'Wert eingeben...',
      select: 'Auswählen',
    },
    conditions: {
      exclude: 'Ist nicht',
      contains: 'Enthält',
      notContain: 'Enthält nicht',
      startsWith: 'Beginnt mit',
      notStartsWith: 'Beginnt nicht mit',
      endsWith: 'Endet mit',
      notEndsWith: 'Endet nicht mit',
      equals: 'Gleich',
      notEquals: 'Ungleich',
      isEmpty: 'Ist leer',
      isNotEmpty: 'Ist nicht leer',
      lessThan: 'Kleiner als',
      lessThanOrEqual: 'Gleich oder kleiner als',
      greaterThan: 'Größer als',
      greaterThanOrEqual: 'Gleich oder größer als',
      isWithin: 'Ist innerhalb',
    },
    validationErrors: {
      invalidNumber: 'Nur Zahlen',
      invalidNumericRange: '"Bis" muss größer als "Von" sein',
    },
    datetimeLevels: {
      year: 'Jahr',
      quarter: 'Quartal',
      month: 'Monat',
      week: 'Woche',
      day: 'Tag',
      aggrigatedHour: 'Stunde (aggregiert)',
      aggrigatedMinutesRoundTo15: '15 Min (aggregiert)',
    },
    relativeTypes: {
      last: 'Letzte',
      this: 'Dieses',
      next: 'Nächste',
    },
    datetimePositions: {
      before: 'Vor',
      after: 'Nach',
    },
  },
  dataBrowser: {
    addFilter: 'Filter hinzufügen',
    selectField: 'Feld auswählen',
    configureFilter: 'Filter konfigurieren',
    noResults: 'Keine Ergebnisse',
    searchPlaceholder: 'Suchen',
  },
  pivotTable: {
    grandTotal: 'Gesamtsumme',
    subTotal: '{{value}} Gesamt',
    limits: {
      baseNote:
        'Summen können sich auf die vollständigen Daten beziehen, wenn sie vom Dashboard-Besitzer festgelegt wurden. Falls verfügbar, können Sie Filter verwenden, um weniger Zeilen und Spalten anzuzeigen.',
      rowsLimit: 'Die Pivot-Tabelle ist auf {{recordsCount}} Datensätze begrenzt',
      columnsLimit: 'Die Pivot-Tabelle ist auf {{columnsCount}} Spalten begrenzt',
      columnsAndRowsLimit:
        'Die Pivot-Tabelle ist auf {{recordsCount}} Datensätze und {{columnsCount}} Spalten begrenzt',
    },
  },
  dashboard: {
    toolbar: {
      undo: 'Rückgängig',
      redo: 'Wiederholen',
      cancel: 'Abbrechen',
      apply: 'Anwenden',
      editLayout: 'Layout bearbeiten',
      viewMode: 'Zum Ansichtsmodus wechseln',
      showFilters: 'Filter anzeigen',
      hideFilters: 'Filter ausblenden',
      columns: 'Spalten',
      column: 'Spalte',
    },
  },
  jumpToDashboard: {
    defaultCaption: 'Springen zu',
    jumpableTooltip: 'Dieses Widget ist springbar',
  },
  calendarHeatmap: {
    navigation: {
      firstMonth: 'Erster Monat',
      lastMonth: 'Letzter Monat',
      previousMonth: 'Vorheriger Monat',
      nextMonth: 'Nächster Monat',
      previousGroup: 'Vorherige Gruppe',
      nextGroup: 'Nächste Gruppe',
    },
  },
};

export default [
  {
    language: 'de-DE',
    namespace: SDK_UI_NAMESPACE,
    resources: translation,
  },
];
