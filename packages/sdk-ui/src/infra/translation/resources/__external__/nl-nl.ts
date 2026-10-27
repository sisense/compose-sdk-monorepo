/* eslint-disable sonarjs/no-duplicate-string -- Locale strings deliberately repeat across
   unrelated keys (a calendar `nextMonth` glyph label and a Time Frame frame name can hold
   the same word). Extracting them to constants would fragment the translations for a
   reviewer walking one section. */
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
  notifications: {
    dismiss: 'Melding sluiten',
    auth: {
      sessionExpiredTitle: 'Sessie verlopen',
      sessionExpiredMessage: 'Uw sessie is verlopen. Meld u opnieuw aan om door te gaan.',
      authenticationFailedTitle: 'Authenticatie mislukt',
      authenticationFailedMessage:
        'De opgegeven aanmeldgegevens zijn door de Sisense-instantie geweigerd.',
    },
    permission: {
      forbiddenTitle: 'Toegang geweigerd',
      forbiddenMessage: 'U hebt geen toestemming om deze gegevens te openen.',
    },
    network: {
      unreachableTitle: 'Verbindingsprobleem',
      unreachableMessage: 'De Sisense-instantie is niet bereikbaar.',
    },
    server: {
      errorTitle: 'Serverfout',
      errorMessage: 'De Sisense-instantie heeft een fout geretourneerd. Probeer het later opnieuw.',
    },
    general: {
      requestFailedTitle: 'Verzoek mislukt',
      requestFailedMessage: 'Een verzoek aan de Sisense-instantie is mislukt.',
    },
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
    earliestDate: 'Vroegste datum',
    latestDate: 'Uiterste datum',
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
      box: 'Box',
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
      forecastValue: 'Waarde prognose',
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
  filterWidget: {
    placeholders: {
      setFilter: 'Filter instellen',
    },
    dateRange: {
      from: 'Van',
      to: 'Tot',
      invertedFrom: 'Moet vóór de einddatum liggen',
      invertedTo: 'Moet na de startdatum liggen',
    },
    numberRange: {
      minimum: 'Minimum',
      maximum: 'Maximum',
      notSet: 'Niet ingesteld',
      clear: '{{field}} wissen',
    },
    rank: {
      rankedBy: 'Gerangschikt op {{- field}}',
      rankedByLabel: 'Gerangschikt op:',
      topBy: 'Top {{valA}} op:',
      bottomBy: 'Laatste {{valA}} op:',
      chooseRankedBy:
        'Kies een veld om op te rangschikken in: Filterinstellingen › Gerangschikt op',
      direction: 'Richting van de rangschikking',
      count: 'Aantal leden',
    },
    selectedCount: '{{count}} geselecteerd',
    allExceptCount: 'Alles behalve {{count}}',
    setupTitle: 'Filterwidget instellen',
    setupSubtitle: 'Stel een dimensie in en configureer hoe het filter werkt',
    emptySetup: 'Filter instellen',
    conditionUnsupported: 'Voorwaarde is beschikbaar voor tekst-, numerieke en datumvelden',
    dateCondition: {
      onOrBefore: 'Op of voor',
      onOrAfter: 'Op of na',
      includingCurrent: 'inclusief huidige',
      includingCurrentLabel: 'Inclusief huidige',
      countMin: 'Voer een geheel getal van 1 of hoger in',
      summary: {
        current: '{{- operator}} {{- grain}}',
        relative: '{{- operator}} {{- count}} {{- grain}}',
        relativeIncludingCurrent: '{{- operator}} {{- count}} {{- grain}} {{- includingCurrent}}',
        date: '{{- operator}} {{- date}}',
      },
    },
    conditionNotRepresentable: 'Deze voorwaarde kan hier niet worden bewerkt',
    controls: {
      findInList: 'Zoeken in de lijst',
      enterValue: 'Voer waarde in...',
      noMatches: 'Geen overeenkomsten',
      clearSelection: 'Selectie wissen',
      overflowCount: '+{{count}}',
      select: 'Selecteren',
      selectDateLevel: 'Datumniveau selecteren',
      selectCondition: 'Conditie selecteren',
      selectConnector: 'EN/OF selecteren',
      addCondition: '+ Conditie toevoegen',
      fillOrRemoveCondition: 'Vul in of verwijder de conditie',
      rangeOrderError: 'De tweede waarde moet groter zijn dan de eerste',
      betweenMin: 'Minimum',
      betweenMax: 'Maximum',
      increaseCount: 'Verhogen',
      decreaseCount: 'Verlagen',
      selectValues: '{{level}} selecteren',
      clear: 'Wissen',
    },
    timeFrame: {
      /** Accessible name for the row-list popover — read to a screen reader on open. */
      listboxLabel: 'Periodeopties',
      /**
       * Row labels. Two shapes carry a `{{count}}`, which i18next resolves to the
       * `_one` (singular) or `_other` (plural) key by CLDR plural rules. Locales
       * with more plural forms — Russian's `_few`/`_many`, Polish's `_many` — add
       * more suffixes in their own resources; English needs only the two.
       */
      labels: {
        /** Day-grain count=1: `Today` / `Yesterday` / `Tomorrow` — calendar words, not arithmetic. */
        today: 'Vandaag',
        yesterday: 'Gisteren',
        tomorrow: 'Morgen',
        /** `This X` — single period, no count in the label. Day has none (Today covers it). */
        this: {
          week: 'Deze week',
          month: 'Deze maand',
          quarter: 'Dit kwartaal',
          year: 'Dit jaar',
        },
        /**
         * `Last X` / `Last N X` — count drops for the singular, plural interpolates it.
         * Day `_one` renders as `Yesterday` and never reaches this key.
         */
        last: {
          week_one: 'Vorige week',
          week_few: 'Laatste {{count}} weken',
          week_many: 'Laatste {{count}} weken',
          week_other: 'Laatste {{count}} weken',
          month_one: 'Vorige maand',
          month_few: 'Laatste {{count}} maanden',
          month_many: 'Laatste {{count}} maanden',
          month_other: 'Laatste {{count}} maanden',
          quarter_one: 'Vorig kwartaal',
          quarter_few: 'Laatste {{count}} kwartalen',
          quarter_many: 'Laatste {{count}} kwartalen',
          quarter_other: 'Laatste {{count}} kwartalen',
          year_one: 'Vorig jaar',
          year_few: 'Laatste {{count}} jaar',
          year_many: 'Laatste {{count}} jaar',
          year_other: 'Laatste {{count}} jaar',
          day_few: 'Laatste {{count}} dagen',
          day_many: 'Laatste {{count}} dagen',
          day_other: 'Laatste {{count}} dagen',
        },
        /** `Next X` / `Next N X`. Day `_one` renders as `Tomorrow`. */
        next: {
          week_one: 'Volgende week',
          week_few: 'Volgende {{count}} weken',
          week_many: 'Volgende {{count}} weken',
          week_other: 'Volgende {{count}} weken',
          month_one: 'Volgende maand',
          month_few: 'Volgende {{count}} maanden',
          month_many: 'Volgende {{count}} maanden',
          month_other: 'Volgende {{count}} maanden',
          quarter_one: 'Volgend kwartaal',
          quarter_few: 'Volgende {{count}} kwartalen',
          quarter_many: 'Volgende {{count}} kwartalen',
          quarter_other: 'Volgende {{count}} kwartalen',
          year_one: 'Volgend jaar',
          year_few: 'Volgende {{count}} jaar',
          year_many: 'Volgende {{count}} jaar',
          year_other: 'Volgende {{count}} jaar',
          day_few: 'Volgende {{count}} dagen',
          day_many: 'Volgende {{count}} dagen',
          day_other: 'Volgende {{count}} dagen',
        },
        /** Paired frames — include the current period. Day grain has no such pair. */
        thisAndLast: {
          week: 'Deze & vorige week',
          month: 'Deze & vorige maand',
          quarter: 'Dit & vorig kwartaal',
          year: 'Dit & vorig jaar',
        },
        thisAndNext: {
          week: 'Deze & volgende week',
          month: 'Deze & volgende maand',
          quarter: 'Dit & volgend kwartaal',
          year: 'Dit & volgend jaar',
        },
      },
    },
    calendar: {
      selectDates: 'Datums selecteren',
      multipleDaysHint: 'U kunt meerdere dagen selecteren',
      formatError: 'Gebruik de notatie {{- format}}',
      nonexistent: 'Deze datum bestaat niet',
      chooseDate: 'Datum kiezen',
      chooseDates: 'Datums kiezen',
      previousMonth: 'Vorige maand',
      nextMonth: 'Volgende maand',
      previousYear: 'Vorig jaar',
      nextYear: 'Volgend jaar',
      openCalendar: 'Kalender openen',
      clearDate: 'Datum wissen',
    },
  },
  unsupportedFilterMessage: 'Niet-ondersteund filter (toegepast op de gegevensquery)',
  unsupportedFilter: 'Niet-ondersteund filter {{filter}}',
  commonFilter: {
    clearSelectionButton: 'Selectie verwijderen',
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
    drillMenuItem: 'Inzoomen',
    breadcrumbsAllSuffix: 'Alle',
    breadcrumbsPrev: 'Vorige',
    breadcrumbsNext: 'Volgende',
    popover: {
      members: 'Leden',
      table: 'Tabel',
      column: 'Kolom',
    },
  },
  widgetHeader: {
    addTitle: 'Titel toevoegen',
    info: {
      details: 'Details van de widget',
      tooltip: 'Klik om volledige details te bekijken',
    },
    chartTableToggle: {
      switchToTable: 'Overschakelen naar tabel',
      switchToChart: 'Overschakelen naar grafiek',
    },
    menu: {
      deleteWidget: 'Widget wissen',
      duplicateWidget: 'Widget dupliceren',
      renameWidget: 'Widget hernoemen',
      distributeEqualWidth: 'Gelijkmatig verdelen in deze rij',
      download: 'Downloaden',
      csvFile: 'CSV-bestand',
      excelFile: 'Excel-bestand',
      repeatRowsRecommended: 'Rijen herhalen (Aanbevolen)',
      mergeRows: 'Rijen samenvoegen',
    },
  },
  customWidgets: {
    registerPrompt:
      'Onbekend aangepast widgettype: {{customWidgetType}}. Registreer dit aangepaste widget.',
  },
  narrativeWidget: {
    generate: 'Narratief genereren',
    regenerate: 'Opnieuw genereren',
    retry: 'Genereren opnieuw proberen',
    disclaimer: 'Inhoud wordt aangedreven door AI, dus fouten zijn mogelijk.',
    updatedAt: 'Bijgewerkt {{timestamp}}',
    copy: 'Kopiëren naar klembord',
    copied: 'Gekopieerd',
    creditsUsed: '{{usagePercentage}}% van de AI-credits is gebruikt.',
    aiContextHint: 'Voor betere prestaties<br/>voegt u <strong>AI-context</strong> toe',
    noDataTitle: 'Geen dashboardgegevens beschikbaar',
    noDataDescription: 'Zodra dashboardgegevens beschikbaar zijn, kunt u een narratief genereren.',
    failedTitle: 'Kan het narratief niet genereren',
    failedDescription:
      'Probeer het later opnieuw. Neem contact op met uw beheerder als het probleem aanhoudt.',
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
      readMore: 'Meer weergeven',
      collapse: 'Inklappen',
      yes: 'Ja',
      no: 'Nee',
      seeMore: 'Meer zien',
      generateNarrative: 'AI-narratief genereren',
      hideNarrative: 'AI-narratief verbergen',
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
      failedToFetchCreditBalance: 'Kredietbalans kon niet worden opgehaald',
    },
    quota: {
      exceededErrorTitle: 'AI-antwoorden zijn momenteel niet beschikbaar.',
      exceededErrorDescription:
        'U heeft de maandelijkse AI-quota van uw bedrijf bereikt. Het quota wordt automatisch vernieuwd bij uw volgende maandelijkse gebruikscyclus.',
      warningDescription:
        'U heeft {{usagePercentage}}% van de maandelijkse AI-quota van uw bedrijf gebruikt.',
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
    tooltips: {
      selectAllPartiallyLoaded:
        'Niet alle waarden worden weergegeven. Scroll in de lijst naar beneden om de resterende waarden te laden. U kunt ook de voorwaarde "Is niet" hieronder gebruiken om specifieke waarden uit te sluiten.',
    },
    labels: {
      includeAll: 'Alles opnemen (geen filter toegepast)',
      allowMultiSelection: 'Meervoudige selectie toestaan voor lijsten',
      from: 'Van',
      to: 'Tot',
      includeCurrent: 'Inclusief huidige',
      rankedBy: 'Gerangschikt op',
      selectField: 'Veld selecteren',
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
      between: 'Tussen',
      top: 'Top',
      bottom: 'Laatste',
    },
    validationErrors: {
      invalidNumber: 'Alleen cijfers',
      invalidNumericRange: '"Tot" moet groter zijn dan "Van"',
    },
    datetimeLevels: {
      year: 'Jaar',
      year_one: 'Jaar',
      year_few: 'Jaren',
      year_many: 'Jaren',
      year_other: 'Jaren',
      quarter: 'Kwartaal',
      quarter_one: 'Kwartaal',
      quarter_few: 'Kwartalen',
      quarter_many: 'Kwartalen',
      quarter_other: 'Kwartalen',
      month: 'Maand',
      month_one: 'Maand',
      month_few: 'Maanden',
      month_many: 'Maanden',
      month_other: 'Maanden',
      week: 'Week',
      week_one: 'Week',
      week_few: 'Weken',
      week_many: 'Weken',
      week_other: 'Weken',
      day: 'Dag',
      day_one: 'Dag',
      day_few: 'Dagen',
      day_many: 'Dagen',
      day_other: 'Dagen',
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
    more: 'Meer...',
    filter: 'Filter',
    addMeasure: 'Maat toevoegen',
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
  filterTile: {
    menu: {
      lock: 'Vergrendelen',
      unlock: 'Ontgrendelen',
      lockGroup: 'Groep vergrendelen',
      unlockGroup: 'Groep ontgrendelen',
    },
    toggleSwitch: 'Filter in-/uitschakelen',
    linkedToWidget: {
      label: 'Gekoppeld aan filterwidget',
      tooltip:
        'Dit filter kan niet worden bewerkt vanuit het filterpaneel. Wijzig de waarden rechtstreeks op het dashboard.',
      infoAriaLabel: 'Info over koppeling met filterwidget',
    },
  },
  chart: {
    indicator: {
      label: 'Indicatorgrafiek',
    },
    visualization: {
      label: 'Gegevensvisualisatie',
    },
    pivotTable: {
      label: 'Draaitabel',
    },
    table: {
      label: 'Gegevenstabel',
      totalRows: 'Totaal aantal rijen: {{formattedCount}}',
      rowsRange: 'Rijen {{start}}-{{end}}',
    },
    sankey: {
      alerts: {
        tooManyStages:
          'Sankey-diagram heeft {{stageCount}} fasen; meer dan {{softLimit}} levert vaak een onleesbaar diagram op. Gebruik minder categoriekolommen of strengere filters.',
      },
    },
  },
  kpi: {
    comparison: {
      vsPriorYear: 't.o.v. vorig jaar',
      vsPriorQuarter: 't.o.v. vorig kwartaal',
      vsPriorMonth: 't.o.v. vorige maand',
      vsPriorWeek: 't.o.v. vorige week',
      vsPriorDay: 't.o.v. vorige dag',
      vsPriorPeriod: 't.o.v. vorige periode',
      vsBaseline: 't.o.v. {{label}}',
      withBaseline: '{{label}} ({{baseline}})',
    },
    target: {
      ofGoal: '{{percent}} van het doel ({{goalValue}})',
      toGo: 'nog {{value}} te gaan',
    },
    percentFormat: '{{sign}}{{value}}%',
  },
  loadingOverlay: {
    label: 'Inhoud laden',
  },
  queryDefinition: {
    showMorePills: 'Nog {{count}} tonen',
    showLess: 'Minder tonen',
    connectorBy: 'per',
    connectorWhere: 'waar',
    tooltipType: 'Type',
    tooltipColumn: 'Kolom',
    tooltipFormula: 'Formule',
    filterPill: {
      customFilter: 'aangepast filter',
      empty: 'leeg',
      notEmpty: 'niet leeg',
      not: 'niet {{value}}',
      and: 'en',
      or: 'of',
      moreValues: '{{values}} +{{count}} meer',
      range: '{{from}} tot {{to}}',
      fromToLatest: '{{from}} tot laatste datum',
      earliestTo: 'eerste datum tot {{to}}',
      dependentOn: 'afhankelijk van {{parents}}',
      dependentFilter: 'afhankelijk filter',
      text: {
        contains: 'bevat {{value}}',
        startsWith: 'begint met {{value}}',
        endsWith: 'eindigt met {{value}}',
        doesntEqual: 'niet gelijk aan {{value}}',
        doesntStartWith: 'begint niet met {{value}}',
        doesntContain: 'bevat niet {{value}}',
        doesntEndWith: 'eindigt niet met {{value}}',
        like: 'zoals {{value}}',
      },
      ranking: {
        top: 'Top {{count}}',
        bottom: 'Laatste {{count}}',
        by: '{{rank}} op {{measure}}',
      },
      relative: {
        last: 'afgelopen {{count}} {{unit}}',
        next: 'volgende {{count}} {{unit}}',
        lastTo: 'afgelopen {{count}} {{unit}} tot {{date}}',
        nextFrom: 'volgende {{count}} {{unit}} vanaf {{date}}',
        includingCurrent: '{{period}} inclusief huidige',
        withOffset: '{{period}}, verschuiving {{offset}}',
        today: 'vandaag',
        thisWeek: 'deze week',
        thisMonth: 'deze maand',
        thisQuarter: 'dit kwartaal',
        thisYear: 'dit jaar',
      },
      units: {
        year_one: 'jaar',
        year_few: 'jaar',
        year_many: 'jaar',
        year_other: 'jaar',
        quarter_one: 'kwartaal',
        quarter_few: 'kwartalen',
        quarter_many: 'kwartalen',
        quarter_other: 'kwartalen',
        month_one: 'maand',
        month_few: 'maanden',
        month_many: 'maanden',
        month_other: 'maanden',
        week_one: 'week',
        week_few: 'weken',
        week_many: 'weken',
        week_other: 'weken',
        day_one: 'dag',
        day_few: 'dagen',
        day_many: 'dagen',
        day_other: 'dagen',
        hour_one: 'uur',
        hour_few: 'uur',
        hour_many: 'uur',
        hour_other: 'uur',
        minute_one: 'minuut',
        minute_few: 'minuten',
        minute_many: 'minuten',
        minute_other: 'minuten',
      },
    },
  },
  measures: {
    countShort: 'Aantal {{level}}',
    countDistinct: 'Unieke telling',
    count: 'Alles tellen',
    average: 'Gemiddelde',
    sum: 'Som',
    min: 'Min',
    max: 'Max',
    stdev: 'Standaarddeviatie',
    median: 'Mediaan',
    variance: 'Variantie',
  },
  measuresAgg: {
    countDistinct: '# unieke',
    count: '#',
    sum: 'Totaal',
    average: 'Gemiddelde',
    min: 'Min',
    max: 'Max',
    median: 'Mediaan van',
    variance: 'Variantie van',
    stdev: 'Standaardafwijking van',
  },
};

export default [
  {
    language: 'nl-NL',
    namespace: SDK_UI_NAMESPACE,
    resources: translation,
  },
];
