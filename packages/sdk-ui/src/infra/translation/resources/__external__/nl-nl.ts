import type { TranslationDictionary } from '../index';
import { PACKAGE_NAMESPACE as SDK_UI_NAMESPACE } from '../index';

/**
 * Translation dictionary for Dutch language.
 */
const translation: TranslationDictionary = {
  errors: {
    noSisenseContext: 'Sisense-context is niet geïnitialiseerd',
    restApiNotReady: 'REST API is niet geïnitialiseerd',
    componentRenderError: 'Kan component niet renderen',
    sisenseContextNoAuthentication: 'Authenticatiemethode is niet opgegeven',
    chartNoSisenseContext:
      'Sisense-context voor grafiek niet gevonden. Om dit op te lossen, wikkel de component in een Sisense-contextprovider of geef een bestaande dataset op via props.',
    widgetByIdNoSisenseContext:
      'Sisense-context voor dashboardwidget niet gevonden. Om dit op te lossen, wikkel de component in een Sisense-contextprovider.',
    widgetByIdInvalidIdentifier:
      'Kan widget {{widgetOid}} niet ophalen van dashboard {{dashboardOid}}. ' +
      'Zorg ervoor dat de dashboardwidget bestaat en toegankelijk is.',
    dashboardWidgetsInvalidIdentifiers:
      'Kan dashboardwidgets niet ophalen van dashboard {{dashboardOid}}. ' +
      'Zorg ervoor dat het dashboard bestaat en toegankelijk is.',
    executeQueryNoSisenseContext:
      'Sisense-context voor query-uitvoering niet gevonden. Om dit op te lossen, wikkel de component in een Sisense-contextprovider.',
    executeQueryNoDataSource: 'Geen dataSource opgegeven om query uit te voeren',
    dataOptions: {
      noDimensionsAndMeasures:
        'Geen dimensies of metingen gevonden. Gegevensopties moeten ten minste één dimensie of meting hebben.',
      attributeNotFound: 'Attribuut "{{attributeName}}" niet gevonden in de gegevens',
      measureNotFound: 'Meting "{{measureName}}" niet gevonden in de gegevens',
      filterAttributeNotFound: 'Filterattribuut "{{attributeName}}" niet gevonden in de gegevens',
      highlightAttributeNotFound:
        'Markeerattribuut "{{attributeName}}" niet gevonden in de gegevens',
    },
    optionsTranslation: {
      invalidStyleOptions: "Ongeldige stijlopties voor '{{chartType}}'-grafiek",
      invalidInternalDataOptions:
        "Gegevensopties zijn niet correct geconverteerd voor '{{chartType}}'-grafiek",
    },
    themeNotFound: 'Thema met oid {{themeOid}} niet gevonden in de verbonden Sisense-omgeving',
    paletteNotFound: "Palet '{{paletteName}}' niet gevonden in de verbonden Sisense-omgeving",
    chartTypeNotSupported: 'Grafiektype {{chartType}} wordt niet ondersteund',
    chartInvalidProps: 'Ongeldige grafiekprops voor grafiektype: {{chartType}}',
    unsupportedWidgetType:
      'Kan props niet extraheren voor niet-ondersteund widgettype - {{widgetType}}',
    dashboardInvalidIdentifier:
      'Kan dashboard {{dashboardOid}} niet ophalen. Zorg ervoor dat het dashboard bestaat en toegankelijk is voor de huidige gebruiker.',
    sharedFormula: {
      identifierExpected:
        'Kan gedeelde formule niet ophalen. Geef oid of zowel name als datasource op. ' +
        'Opgegeven waarden: name={{name}}, dataSource={{dataSource}}, oid={{oid}}',
      failedToFetchByOid: 'Kan gedeelde formule niet ophalen op oid {{oid}}',
      failedToFetchByName:
        'Kan gedeelde formule niet ophalen op name {{name}} en dataSource {{dataSource}}',
    },
    widgetModel: {
      incompleteWidget:
        'WidgetModelTranslator: Widget kan niet worden getransformeerd naar DTO vanwege onvolledige eigenschap ({{prop}})',
      unsupportedWidgetTypeDto:
        'WidgetModelTranslator: Opslaan van widget van type {{chartType}} wordt niet ondersteund',
      pivotWidgetNotSupported:
        'WidgetModelTranslator: Pivot-widget wordt niet ondersteund voor methode {{methodName}}',
      textWidgetNotSupported:
        'WidgetModelTranslator: Tekstwidget wordt niet ondersteund voor methode {{methodName}}',
      onlyTableWidgetSupported:
        'WidgetModelTranslator: Alleen tabelwidget wordt ondersteund voor methode {{methodName}}',
      onlyPivotWidgetSupported:
        'WidgetModelTranslator: Alleen pivot-widget wordt ondersteund voor methode {{methodName}}',
      onlyTextWidgetSupported:
        'WidgetModelTranslator: Alleen tekstwidget wordt ondersteund voor methode {{methodName}}',
      onlyCustomWidgetSupported:
        'WidgetModelTranslator: Alleen aangepaste widget wordt ondersteund voor methode {{methodName}}',
      unsupportedWidgetType: 'Niet-ondersteund widgettype: {{widgetType}}',
      unsupportedFusionWidgetType: 'Niet-ondersteund Fusion-widgettype: {{widgetType}}',
    },
    unknownFilterInFilterRelations:
      'Filterrelatie bevat een filter {{filterGuid}} dat niet kon worden gevonden in de opgegeven filters',
    invalidFilterType: 'Ongeldig filtertype. Verwachte: {{filterType}}',
    secondsDateTimeLevelIsNotSupported:
      "Datum/tijdniveau 'seconds' wordt niet ondersteund voor deze gegevensbron",
    missingMenuRoot: 'Geïnitialiseerde menuwortel ontbreekt',
    missingModalRoot: 'Geïnitialiseerde modaalwortel ontbreekt',
    missingDataSource:
      "De waarde 'dataSource' ontbreekt. Deze moet expliciet worden opgegeven, of een 'defaultDataSource' moet worden opgegeven in de Sisense-contextprovider.",
    incorrectOnDataReadyHandler: "Handler 'onDataReady' moet een geldig gegevensobject retourneren",
    emptyModel: 'Leeg model',
    missingMetadata: 'Metadata ontbreekt',
    missingModelTitle: 'Modeltitel ontbreekt',
    httpClientNotFound: 'HttpClient niet gevonden.',
    serverSettingsNotLoaded: 'Serverinstellingen laden mislukt',
    requiredColumnMissing: 'Een vereiste kolom ontbreekt. {{hint}}',
    unexpectedChartType: 'Onverwacht grafiektype: {{chartType}}',
    noRowNumColumn: 'Gegevens hebben geen row num-kolom: {{columnName}}',
    tickIntervalCalculationFailed:
      'Kan tickinterval niet berekenen. Probeer de datum/tijdgranulariteit op te geven.',
    polarChartDesignOptionsExpected: 'Polaire grafiekontwerpopties verwacht voor polaire grafiek',
    polarChartDesignOptionsNotExpected:
      'Polaire grafiekontwerpopties niet verwacht voor niet-polaire grafiek',
    indicatorInvalidRelativeSize: 'Ongeldige relatieve grootteopties voor indicatorgrafiek',
    unsupportedMapType: 'Niet-ondersteund kaarttype: {{mapType}}',
    mapLoadingFailed: 'Kan kaart niet laden',
    cascadingFilterOriginalNotFound:
      'Fout bij opnieuw samenstellen van cascadefilters. Oorspronkelijk cascadefilter niet gevonden',
    dashboardLoadFailed: 'Kan dashboard niet laden. {{error}}',
    widgetLoadFailed: 'Kan widget niet laden. {{error}}',
    failedToAddWidget: 'Kan widget niet toevoegen aan dashboard',
    widgetEmptyResponse: 'Lege reactie voor widget met oid {{widgetOid}}',
    dateFilterIncorrectOperator: 'Onjuiste operator: {{operator}}',
    synchronizedFilterInvalidProps:
      'Hook `useSynchronizedFilter` moet ten minste één van [non-null `filterFromProps`] of [`createEmptyFilter`-functie] gebruiken',
    unexpectedCacheValue: 'Onverwachte cachewaarde',
    notAMembersFilter: 'Filter is geen MembersFilter',
    drilldownNoInitialDimension:
      'Initiële dimensie moet worden opgegeven om drilldown te gebruiken met aangepaste componenten',
    otherWidgetTypesNotSupported: 'Andere widgettypen worden nog niet ondersteund',
    dataBrowser: {
      dimensionNotFound: 'Dimensie met id {{dimensionId}} niet gevonden',
      attributeNotFound: 'Attribuut met id {{attributeId}} niet gevonden',
    },
    addFilterPopover: {
      noDataSources:
        'Geen gegevensbronnen beschikbaar. Probeer `dataSource` in widgets te definiëren of `defaultDataSource` op dashboardniveau.',
    },
    tabberInvalidConfiguration: 'Tabber-widgetconfiguratie is ongeldig',
  },
  errorBoxText: '$t(common:error): {{errorMessage}}',
  chartNoData: 'Geen resultaten',
  filters: 'Filters',
  cancel: 'Annuleren',
  includeAll: 'Alles opnemen',
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
    displayModePrefix: 'Alle items',
    equals: 'Gelijk aan {{val}}',
    notEquals: 'Niet gelijk aan {{val}}',
    lessThan: 'Minder dan {{val}}',
    lessThanOrEqual: 'Minder dan of gelijk aan {{val}}',
    greaterThan: 'Groter dan {{val}}',
    greaterThanOrEqual: 'Groter dan of gelijk aan {{val}}',
    between: 'Tussen {{valA}} en {{valB}}',
    notBetween: 'Niet tussen {{valA}} en {{valB}}',
    top: 'Top {{valA}} op {{valB}}',
    bottom: 'Laatste {{valA}} op {{valB}}',
    is: 'Is {{val}}',
    isNot: 'Is niet {{val}}',
    contains: 'Bevat {{val}}',
    notContains: `Bevat niet {{val}}`,
    startsWith: 'Begint met {{val}}',
    notStartsWith: `Begint niet met {{val}}`,
    endsWith: 'Eindigt met {{val}}',
    notEndsWith: `Eindigt niet met {{val}}`,
    like: 'Is zoals {{val}}',
    byMeasure: 'Per maat',
    by: 'op',
  },
  dateFilter: {
    last: 'Laatste',
    next: 'Volgende',
    from: 'Van',
    to: 'Tot',
    count: 'Aantal',
    select: 'Selecteren',
    today: 'Vandaag',
    days: 'Dagen',
    weeks: 'Weken',
    months: 'Maanden',
    quarters: 'Kwartalen',
    years: 'Jaren',
    earliestDate: 'Eerste datum',
    latestDate: 'Laatste datum',
    todayOutOfRange: 'Vandaag valt buiten het beschikbare datumbereik',
    dateRange: {
      fromTo: '{{from}} tot {{to}}',
      from: 'Van {{val}}',
      to: 'Tot {{val}}',
    },
  },
  boxplot: {
    tooltip: {
      whiskers: 'Snorharen',
      box: 'Doos',
      min: 'Min',
      median: 'Mediaan',
      max: 'Max',
    },
  },
  treemap: {
    tooltip: {
      ofTotal: 'van totaal',
      of: 'van',
    },
  },
  advanced: {
    tooltip: {
      min: 'Ondergrens',
      max: 'Bovengrens',
      forecastValue: 'Prognosewaarde',
      forecast: 'Prognose',
      trend: 'Trend',
      trendLocalValue: 'Lokale waarde',
      confidenceInterval: 'Betrouwbaarheidsinterval',
      trendType: 'Type',
      trendDataKey: 'Trendgegevens',
      trendData: {
        min: 'Min',
        max: 'Max',
        median: 'Mediaan',
        average: 'Gemiddelde',
      },
    },
  },
  arearange: {
    tooltip: {
      min: 'Min',
      max: 'Max',
    },
  },
  unsupportedFilterMessage: 'Niet-ondersteund filter (toegepast op de gegevensquery)',
  unsupportedFilter: 'Niet-ondersteund filter {{filter}}',
  commonFilter: {
    clearSelectionButton: 'Selectie wissen',
    selectMenuItem: 'Selecteren',
    unselectMenuItem: 'Deselecteren',
  },
  customFilterTileMessage: 'gefilterd met aangepast filter',
  filterRelations: {
    and: 'EN',
    or: 'OF',
    andOrFormulaApplied: 'EN/OF-formule toegepast',
  },
  drilldown: {
    drillMenuItem: 'Boren',
    breadcrumbsAllSuffix: 'Alles',
    breadcrumbsPrev: 'Vorige',
    breadcrumbsNext: 'Volgende',
    popover: {
      members: 'Leden',
      table: 'Tabel',
      column: 'Kolom',
    },
  },
  widgetHeader: {
    info: {
      details: 'Widgetdetails',
      tooltip: 'Klik om volledige details te bekijken',
    },
    menu: {
      deleteWidget: 'Widget verwijderen',
      distributeEqualWidth: 'Gelijkmatig verdelen in deze rij',
    },
  },
  customWidgets: {
    registerPrompt:
      'Onbekend aangepast widgettype: {{customWidgetType}}. Registreer dit aangepaste widget.',
  },
  ai: {
    analyticsChatbot: 'Analytische chatbot',
    dataTopics: 'Gegevenstopics',
    chatbotDescription:
      'De analytische chatbot is ontworpen om u te helpen interactie te hebben met uw gegevens met natuurlijke taal.',
    topicSelectPrompt: 'Kies een topic dat u wilt verkennen:',
    preview: 'Voorvertoning',
    clearHistoryPrompt: 'Wilt u deze chat wissen?',
    config: {
      inputPromptText: 'Stel een vraag of typ "/" voor ideeën',
      welcomeText:
        'Welkom bij de Analytische Assistent! Ik kan u helpen uw gegevens te verkennen en inzichten te verkrijgen.',
      suggestionsWelcomeText: 'Enkele vragen die u mogelijk heeft:',
    },
    buttons: {
      insights: 'Inzichten',
      correctResponse: 'Correcte reactie',
      incorrectResponse: 'Onjuiste reactie',
      clearChat: 'Chat wissen',
      refresh: 'Vernieuwen',
      readMore: 'Meer lezen',
      collapse: 'Inklappen',
      yes: 'Ja',
      no: 'Nee',
      seeMore: 'Meer zien',
    },
    disclaimer: {
      poweredByAi: 'Inhoud wordt aangedreven door AI, dus verrassingen en fouten zijn mogelijk.',
      rateRequest: 'Beoordeel reacties zodat we kunnen verbeteren!',
    },
    errors: {
      chatUnavailable: 'Chat niet beschikbaar. Probeer het later opnieuw.',
      fetchHistory:
        'Er is iets misgegaan en we konden de chatthread niet ophalen. Laten we opnieuw beginnen!',
      recommendationsNotAvailable:
        'Aanbevelingen zijn momenteel niet beschikbaar. Probeer het over een paar minuten opnieuw.',
      insightsNotAvailable: 'Geen inzichten beschikbaar.',
      VectorDBEmptyResponseError:
        'De AI-configuratie is nog niet klaar, wacht een paar minuten en probeer het opnieuw.',
      LlmBadConfigurationError:
        'De LLM-configuratie is onjuist. Neem contact op met uw beheerder om de LLM-providerconfiguratie bij te werken.',
      ChartTypeUnsupportedError: 'Het gevraagde grafiektype wordt niet ondersteund.',
      BlockedByLlmContentFiltering:
        'Deze vraag wordt geblokkeerd door ons contentbeheerbeleid. Probeer een andere vraag te stellen.',
      LlmContextLengthExceedsLimitError:
        'Het lijkt erop dat u de berichtlengtelimiet heeft bereikt, wis deze conversatie.',
      UserPromptExeedsLimitError:
        'De prompt overschrijdt de limiet. Herschrijf uw vraag en gebruik een kortere prompt.',
      unexpectedChatResponse:
        'Oeps, er is iets misgegaan. Probeer het later opnieuw of probeer een andere vraag te stellen.',
      unexpected: 'Oeps, er is iets misgegaan. Probeer het later opnieuw.',
      unknownResponse: 'Onbekend responseType ontvangen, ruwe reactie=',
      invalidInput: 'Ongeldige invoer',
      noAvailableDataTopics:
        'Geen van de opgegeven gegevensmodellen of perspectieven is beschikbaar',
    },
  },
  attribute: {
    datetimeName: {
      years: 'Jaren in {{columnName}}',
      quarters: 'Kwartalen in {{columnName}}',
      months: 'Maanden in {{columnName}}',
      weeks: 'Weken in {{columnName}}',
      days: 'Dagen in {{columnName}}',
      hours: 'Uren in {{columnName}}',
      minutes: 'Minuten in {{columnName}}',
    },
  },
  filterEditor: {
    buttons: {
      apply: 'Toepassen',
      cancel: 'Annuleren',
      selectAll: 'Alles selecteren',
      clearAll: 'Alles wissen',
    },
    labels: {
      includeAll: 'Alles opnemen (geen filter toegepast)',
      allowMultiSelection: 'Meervoudige selectie toestaan voor lijsten',
      from: 'Van',
      to: 'Tot',
      includeCurrent: 'Inclusief huidige',
    },
    placeholders: {
      selectFromList: 'Selecteren uit lijst',
      enterEntry: 'Voer uw item in...',
      enterValue: 'Voer waarde in...',
      select: 'Selecteren',
    },
    conditions: {
      exclude: 'Is niet',
      contains: 'Bevat',
      notContain: 'Bevat niet',
      startsWith: 'Begint met',
      notStartsWith: 'Begint niet met',
      endsWith: 'Eindigt met',
      notEndsWith: 'Eindigt niet met',
      equals: 'Gelijk aan',
      notEquals: 'Niet gelijk aan',
      isEmpty: 'Is leeg',
      isNotEmpty: 'Is niet leeg',
      lessThan: 'Kleiner dan',
      lessThanOrEqual: 'Gelijk aan of kleiner dan',
      greaterThan: 'Groter dan',
      greaterThanOrEqual: 'Gelijk aan of groter dan',
      isWithin: 'Is binnen',
    },
    validationErrors: {
      invalidNumber: 'Alleen cijfers',
      invalidNumericRange: '"Tot" moet groter zijn dan "Van"',
    },
    datetimeLevels: {
      year: 'Jaar',
      quarter: 'Kwartaal',
      month: 'Maand',
      week: 'Week',
      day: 'Dag',
      aggrigatedHour: 'Uur (geaggregeerd)',
      aggrigatedMinutesRoundTo15: '15 min (geaggregeerd)',
    },
    relativeTypes: {
      last: 'Laatste',
      this: 'Dit',
      next: 'Volgende',
    },
    datetimePositions: {
      before: 'Voor',
      after: 'Na',
    },
  },
  dataBrowser: {
    addFilter: 'Filter toevoegen',
    selectField: 'Veld selecteren',
    configureFilter: 'Filter configureren',
    noResults: 'Geen resultaten',
    searchPlaceholder: 'Zoeken',
  },
  pivotTable: {
    grandTotal: 'Totaal',
    subTotal: '{{value}} Totaal',
    limits: {
      baseNote:
        'Totalen kunnen verwijzen naar de volledige gegevens als ingesteld door de dashboardeigenaar. Indien beschikbaar, kunt u filters gebruiken om minder rijen en kolommen weer te geven.',
      rowsLimit: 'De pivottabel is beperkt tot {{recordsCount}} records',
      columnsLimit: 'De pivottabel is beperkt tot {{columnsCount}} kolommen',
      columnsAndRowsLimit:
        'De pivottabel is beperkt tot {{recordsCount}} records en {{columnsCount}} kolommen',
    },
  },
  dashboard: {
    toolbar: {
      undo: 'Ongedaan maken',
      redo: 'Opnieuw doen',
      cancel: 'Annuleren',
      apply: 'Toepassen',
      editLayout: 'Lay-out bewerken',
      viewMode: 'Overschakelen naar weergavemodus',
      showFilters: 'Filters weergeven',
      hideFilters: 'Filters verbergen',
      columns: 'Kolommen',
      column: 'Kolom',
    },
  },
  jumpToDashboard: {
    defaultCaption: 'Springen naar',
    jumpableTooltip: 'Deze widget is springbaar',
  },
  calendarHeatmap: {
    navigation: {
      firstMonth: 'Eerste maand',
      lastMonth: 'Laatste maand',
      previousMonth: 'Vorige maand',
      nextMonth: 'Volgende maand',
      previousGroup: 'Vorige groep',
      nextGroup: 'Volgende groep',
    },
  },
};

export default [
  {
    language: 'nl-NL',
    namespace: SDK_UI_NAMESPACE,
    resources: translation,
  },
];
