/* eslint-disable sonarjs/no-duplicate-string */
import type { TranslationDictionary } from '../index';
import { PACKAGE_NAMESPACE as SDK_UI_NAMESPACE } from '../index';

/**
 * Translation dictionary for French language.
 */
const translation: TranslationDictionary = {
  errors: {
    noSisenseContext: "Le contexte Sisense n'est pas initialisé",
    restApiNotReady: "L'API REST n'est pas initialisée",
    componentRenderError: 'Impossible de rendre le composant',
    sisenseContextNoAuthentication: "La méthode d'authentification n'est pas spécifiée",
    chartNoSisenseContext:
      'Contexte Sisense pour le graphique introuvable. Pour corriger, enveloppez le composant avec un fournisseur de contexte Sisense ou fournissez un jeu de données existant via les props.',
    widgetByIdNoSisenseContext:
      'Contexte Sisense pour le widget du tableau de bord introuvable. Pour corriger, enveloppez le composant avec un fournisseur de contexte Sisense.',
    widgetByIdInvalidIdentifier:
      'Échec de la récupération du widget {{widgetOid}} du tableau de bord {{dashboardOid}}. ' +
      'Veuillez vous assurer que le widget du tableau de bord existe et est accessible.',
    dashboardWidgetsInvalidIdentifiers:
      'Échec de la récupération des widgets du tableau de bord {{dashboardOid}}. ' +
      'Veuillez vous assurer que le tableau de bord existe et est accessible.',
    executeQueryNoSisenseContext:
      "Contexte Sisense pour l'exécution de requête introuvable. Pour corriger, enveloppez le composant avec un fournisseur de contexte Sisense.",
    executeQueryNoDataSource: 'Aucune dataSource fournie pour exécuter la requête',
    dataOptions: {
      noDimensionsAndMeasures:
        'Aucune dimension ni mesure trouvée. Les options de données doivent avoir au moins une dimension ou une mesure.',
      attributeNotFound: 'L\'attribut "{{attributeName}}" est introuvable dans les données',
      measureNotFound: 'La mesure "{{measureName}}" est introuvable dans les données',
      filterAttributeNotFound:
        'L\'attribut de filtre "{{attributeName}}" est introuvable dans les données',
      highlightAttributeNotFound:
        'L\'attribut de surbrillance "{{attributeName}}" est introuvable dans les données',
    },
    optionsTranslation: {
      invalidStyleOptions: "Options de style non valides pour le graphique '{{chartType}}'",
      invalidInternalDataOptions:
        "Les options de données ne sont pas correctement converties pour le graphique '{{chartType}}'",
    },
    themeNotFound: "Thème avec oid {{themeOid}} introuvable dans l'environnement Sisense connecté",
    paletteNotFound: "Palette '{{paletteName}}' introuvable dans l'environnement Sisense connecté",
    chartTypeNotSupported: 'Type de graphique {{chartType}} non pris en charge',
    chartInvalidProps: 'Props de graphique non valides pour le type de graphique : {{chartType}}',
    unsupportedWidgetType:
      "Impossible d'extraire les props pour le type de widget non pris en charge - {{widgetType}}",
    dashboardInvalidIdentifier:
      "Échec de la récupération du tableau de bord {{dashboardOid}}. Veuillez vous assurer que le tableau de bord existe et est accessible à l'utilisateur actuel.",
    sharedFormula: {
      identifierExpected:
        'Échec de la récupération de la formule partagée. Veuillez fournir oid ou à la fois name et datasource. ' +
        'Valeurs fournies : name={{name}}, dataSource={{dataSource}}, oid={{oid}}',
      failedToFetchByOid: 'Échec de la récupération de la formule partagée par oid {{oid}}',
      failedToFetchByName:
        'Échec de la récupération de la formule partagée par name {{name}} et dataSource {{dataSource}}',
    },
    widgetModel: {
      incompleteWidget:
        "WidgetModelTranslator : Le widget ne peut pas être transformé en DTO en raison d'une propriété incomplète ({{prop}})",
      unsupportedWidgetTypeDto:
        "WidgetModelTranslator : L'enregistrement du widget de type {{chartType}} n'est pas pris en charge",
      pivotWidgetNotSupported:
        "WidgetModelTranslator : Le widget Pivot n'est pas pris en charge pour la méthode {{methodName}}",
      textWidgetNotSupported:
        "WidgetModelTranslator : Le widget texte n'est pas pris en charge pour la méthode {{methodName}}",
      onlyTableWidgetSupported:
        'WidgetModelTranslator : Seul le widget tableau est pris en charge pour la méthode {{methodName}}',
      onlyPivotWidgetSupported:
        'WidgetModelTranslator : Seul le widget Pivot est pris en charge pour la méthode {{methodName}}',
      onlyTextWidgetSupported:
        'WidgetModelTranslator : Seul le widget texte est pris en charge pour la méthode {{methodName}}',
      onlyCustomWidgetSupported:
        'WidgetModelTranslator : Seul le widget personnalisé est pris en charge pour la méthode {{methodName}}',
      unsupportedWidgetType: 'Type de widget non pris en charge : {{widgetType}}',
      unsupportedFusionWidgetType: 'Type de widget Fusion non pris en charge : {{widgetType}}',
    },
    unknownFilterInFilterRelations:
      "La relation de filtres contient un filtre {{filterGuid}} qui n'a pas pu être trouvé dans les filtres fournis",
    invalidFilterType: 'Type de filtre non valide. Attendu : {{filterType}}',
    secondsDateTimeLevelIsNotSupported:
      "Le niveau de date/heure 'seconds' n'est pas pris en charge pour cette source de données",
    missingMenuRoot: 'Racine de menu initialisée manquante',
    missingModalRoot: 'Racine modale initialisée manquante',
    missingDataSource:
      "La valeur 'dataSource' est manquante. Elle doit être fournie explicitement, ou un 'defaultDataSource' doit être spécifié dans le fournisseur de contexte Sisense.",
    incorrectOnDataReadyHandler:
      "Le gestionnaire 'onDataReady' doit renvoyer un objet de données valide",
    emptyModel: 'Modèle vide',
    missingMetadata: 'Métadonnées manquantes',
    missingModelTitle: 'Titre du modèle manquant',
    httpClientNotFound: 'HttpClient introuvable.',
    serverSettingsNotLoaded: 'Échec du chargement des paramètres du serveur',
    requiredColumnMissing: 'Une colonne requise est manquante. {{hint}}',
    unexpectedChartType: 'Type de graphique inattendu : {{chartType}}',
    noRowNumColumn: "Les données n'ont pas de colonne row num : {{columnName}}",
    tickIntervalCalculationFailed:
      "Impossible de calculer l'intervalle de graduation. Essayez de spécifier la granularité de date/heure.",
    polarChartDesignOptionsExpected:
      'Options de conception de graphique polaire attendues pour le graphique polaire',
    polarChartDesignOptionsNotExpected:
      'Options de conception de graphique polaire non attendues pour un graphique non polaire',
    indicatorInvalidRelativeSize:
      'Options de taille relative non valides pour le graphique indicateur',
    unsupportedMapType: 'Type de carte non pris en charge : {{mapType}}',
    mapLoadingFailed: 'Échec du chargement de la carte',
    cascadingFilterOriginalNotFound:
      "Erreur lors du réassemblage des filtres en cascade. Filtre en cascade d'origine introuvable",
    dashboardLoadFailed: 'Échec du chargement du tableau de bord. {{error}}',
    widgetLoadFailed: 'Échec du chargement du widget. {{error}}',
    failedToAddWidget: "Échec de l'ajout du widget au tableau de bord",
    widgetEmptyResponse: 'Réponse vide pour le widget avec oid {{widgetOid}}',
    dateFilterIncorrectOperator: 'Opérateur incorrect : {{operator}}',
    synchronizedFilterInvalidProps:
      "Le hook `useSynchronizedFilter` doit prendre au moins l'un des éléments suivants : [non-null `filterFromProps`] ou [fonction `createEmptyFilter`]",
    unexpectedCacheValue: 'Valeur de cache inattendue',
    notAMembersFilter: "Le filtre n'est pas un MembersFilter",
    drilldownNoInitialDimension:
      'La dimension initiale doit être spécifiée pour utiliser le drilldown avec des composants personnalisés',
    otherWidgetTypesNotSupported: 'Les autres types de widgets ne sont pas encore pris en charge',
    dataBrowser: {
      dimensionNotFound: 'Dimension avec id {{dimensionId}} introuvable',
      attributeNotFound: 'Attribut avec id {{attributeId}} introuvable',
    },
    addFilterPopover: {
      noDataSources:
        'Aucune source de données disponible. Essayez de définir `dataSource` dans les widgets ou `defaultDataSource` au niveau du tableau de bord.',
    },
    tabberInvalidConfiguration: 'La configuration du widget Tabber est non valide',
  },
  errorBoxText: '$t(common:error): {{errorMessage}}',
  chartNoData: 'Aucun résultat',
  filters: 'Filtres',
  cancel: 'Annuler',
  includeAll: 'Tout inclure',
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
    displayModePrefix: 'Tous les éléments',
    equals: 'Égal à {{val}}',
    notEquals: 'Différent de {{val}}',
    lessThan: 'Inférieur à {{val}}',
    lessThanOrEqual: 'Inférieur ou égal à {{val}}',
    greaterThan: 'Supérieur à {{val}}',
    greaterThanOrEqual: 'Supérieur ou égal à {{val}}',
    between: 'Entre {{valA}} et {{valB}}',
    notBetween: 'Pas entre {{valA}} et {{valB}}',
    top: 'Top {{valA}} par {{valB}}',
    bottom: 'Derniers {{valA}} par {{valB}}',
    is: 'Est {{val}}',
    isNot: "N'est pas {{val}}",
    contains: 'Contient {{val}}',
    notContains: `Ne contient pas {{val}}`,
    startsWith: 'Commence par {{val}}',
    notStartsWith: `Ne commence pas par {{val}}`,
    endsWith: 'Se termine par {{val}}',
    notEndsWith: `Ne se termine pas par {{val}}`,
    like: 'Est comme {{val}}',
    byMeasure: 'Par mesure',
    by: 'par',
  },
  dateFilter: {
    last: 'Dernier',
    next: 'Suivant',
    from: 'De',
    to: 'À',
    count: 'Nombre',
    select: 'Sélectionner',
    today: "Aujourd'hui",
    days: 'Jours',
    weeks: 'Semaines',
    months: 'Mois',
    quarters: 'Trimestres',
    years: 'Années',
    earliestDate: 'Date la plus ancienne',
    latestDate: 'Date la plus récente',
    todayOutOfRange: "Aujourd'hui est en dehors de la plage de dates disponible",
    dateRange: {
      fromTo: '{{from}} à {{to}}',
      from: 'De {{val}}',
      to: 'À {{val}}',
    },
  },
  boxplot: {
    tooltip: {
      whiskers: 'Moustaches',
      box: 'Boîte',
      min: 'Min',
      median: 'Médiane',
      max: 'Max',
    },
  },
  treemap: {
    tooltip: {
      ofTotal: 'du total',
      of: 'de',
    },
  },
  advanced: {
    tooltip: {
      min: 'Borne inférieure',
      max: 'Borne supérieure',
      forecastValue: 'Valeur de prévision',
      forecast: 'Prévision',
      trend: 'Tendance',
      trendLocalValue: 'Valeur locale',
      confidenceInterval: 'Intervalle de confiance',
      trendType: 'Type',
      trendDataKey: 'Données de tendance',
      trendData: {
        min: 'Min',
        max: 'Max',
        median: 'Médiane',
        average: 'Moyenne',
      },
    },
  },
  arearange: {
    tooltip: {
      min: 'Min',
      max: 'Max',
    },
  },
  unsupportedFilterMessage: 'Filtre non pris en charge (appliqué à la requête de données)',
  unsupportedFilter: 'Filtre non pris en charge {{filter}}',
  commonFilter: {
    clearSelectionButton: 'Effacer la sélection',
    selectMenuItem: 'Sélectionner',
    unselectMenuItem: 'Désélectionner',
  },
  customFilterTileMessage: 'filtré avec un filtre personnalisé',
  filterRelations: {
    and: 'ET',
    or: 'OU',
    andOrFormulaApplied: 'Formule ET/OU appliquée',
  },
  drilldown: {
    drillMenuItem: 'Explorer',
    breadcrumbsAllSuffix: 'Tout',
    breadcrumbsPrev: 'Précédent',
    breadcrumbsNext: 'Suivant',
    popover: {
      members: 'Membres',
      table: 'Tableau',
      column: 'Colonne',
    },
  },
  widgetHeader: {
    info: {
      details: 'Détails du widget',
      tooltip: 'Cliquez pour voir les détails complets',
    },
    menu: {
      deleteWidget: 'Supprimer le widget',
      distributeEqualWidth: 'Distribuer équitablement dans cette ligne',
    },
  },
  customWidgets: {
    registerPrompt:
      'Type de widget personnalisé inconnu : {{customWidgetType}}. Veuillez enregistrer ce widget personnalisé.',
  },
  ai: {
    analyticsChatbot: "Chatbot d'analyse",
    dataTopics: 'Sujets de données',
    chatbotDescription:
      "Le chatbot d'analyse est conçu pour vous aider à interagir avec vos données en utilisant le langage naturel.",
    topicSelectPrompt: 'Choisissez un sujet que vous souhaitez explorer :',
    preview: 'Aperçu',
    clearHistoryPrompt: 'Voulez-vous effacer ce chat ?',
    config: {
      inputPromptText: 'Posez une question ou tapez "/" pour des idées',
      welcomeText:
        "Bienvenue dans l'Assistant d'analyse ! Je peux vous aider à explorer et à obtenir des informations à partir de vos données.",
      suggestionsWelcomeText: 'Quelques questions que vous pourriez avoir :',
    },
    buttons: {
      insights: 'Informations',
      correctResponse: 'Réponse correcte',
      incorrectResponse: 'Réponse incorrecte',
      clearChat: 'Effacer le chat',
      refresh: 'Actualiser',
      readMore: 'Lire plus',
      collapse: 'Réduire',
      yes: 'Oui',
      no: 'Non',
      seeMore: 'Voir plus',
    },
    disclaimer: {
      poweredByAi:
        "Le contenu est alimenté par l'IA, donc des surprises et des erreurs sont possibles.",
      rateRequest: 'Veuillez noter les réponses pour que nous puissions nous améliorer !',
    },
    errors: {
      chatUnavailable: 'Chat indisponible. Veuillez réessayer plus tard.',
      fetchHistory:
        "Quelque chose s'est mal passé et nous n'avons pas pu récupérer le fil de discussion. Recommençons !",
      recommendationsNotAvailable:
        'Les recommandations ne sont pas disponibles pour le moment. Réessayez dans quelques minutes.',
      insightsNotAvailable: 'Aucune information disponible.',
      VectorDBEmptyResponseError:
        "La configuration de l'IA n'est pas prête, veuillez attendre quelques minutes et réessayer.",
      LlmBadConfigurationError:
        'La configuration LLM est incorrecte. Contactez votre administrateur pour mettre à jour la configuration du fournisseur LLM.',
      ChartTypeUnsupportedError: "Le type de graphique demandé n'est pas pris en charge.",
      BlockedByLlmContentFiltering:
        'Cette question est bloquée par notre politique de gestion de contenu. Veuillez essayer de poser une question différente.',
      LlmContextLengthExceedsLimitError:
        'Il semble que vous ayez atteint la limite de longueur de message, veuillez effacer cette conversation.',
      UserPromptExeedsLimitError:
        "L'invite dépasse la limite. Reformulez votre question et utilisez une invite plus courte.",
      unexpectedChatResponse:
        "Oh non, quelque chose s'est mal passé. Veuillez réessayer plus tard ou essayer de poser une question différente.",
      unexpected: "Oh non, quelque chose s'est mal passé. Veuillez réessayer plus tard.",
      unknownResponse: 'Type de réponse inconnu reçu, réponse brute =',
      invalidInput: 'Entrée non valide',
      noAvailableDataTopics:
        "Aucun des modèles de données ou perspectives fournis n'est disponible",
    },
  },
  attribute: {
    datetimeName: {
      years: 'Années dans {{columnName}}',
      quarters: 'Trimestres dans {{columnName}}',
      months: 'Mois dans {{columnName}}',
      weeks: 'Semaines dans {{columnName}}',
      days: 'Jours dans {{columnName}}',
      hours: 'Heures dans {{columnName}}',
      minutes: 'Minutes dans {{columnName}}',
    },
  },
  filterEditor: {
    buttons: {
      apply: 'Appliquer',
      cancel: 'Annuler',
      selectAll: 'Tout sélectionner',
      clearAll: 'Tout effacer',
    },
    labels: {
      includeAll: 'Tout inclure (aucun filtre appliqué)',
      allowMultiSelection: 'Autoriser la sélection multiple pour les listes',
      from: 'De',
      to: 'À',
      includeCurrent: "Incluant l'actuel",
    },
    placeholders: {
      selectFromList: 'Sélectionner dans la liste',
      enterEntry: 'Tapez votre entrée...',
      enterValue: 'Entrez la valeur...',
      select: 'Sélectionner',
    },
    conditions: {
      exclude: "N'est pas",
      contains: 'Contient',
      notContain: 'Ne contient pas',
      startsWith: 'Commence par',
      notStartsWith: 'Ne commence pas par',
      endsWith: 'Se termine par',
      notEndsWith: 'Ne se termine pas par',
      equals: 'Égal à',
      notEquals: 'Différent de',
      isEmpty: 'Est vide',
      isNotEmpty: "N'est pas vide",
      lessThan: 'Inférieur à',
      lessThanOrEqual: 'Égal ou inférieur à',
      greaterThan: 'Supérieur à',
      greaterThanOrEqual: 'Égal ou supérieur à',
      isWithin: 'Est dans',
    },
    validationErrors: {
      invalidNumber: 'Nombres uniquement',
      invalidNumericRange: '"À" doit être supérieur à "De"',
    },
    datetimeLevels: {
      year: 'Année',
      quarter: 'Trimestre',
      month: 'Mois',
      week: 'Semaine',
      day: 'Jour',
      aggrigatedHour: 'Heure (agrégée)',
      aggrigatedMinutesRoundTo15: '15 min (agrégé)',
    },
    relativeTypes: {
      last: 'Dernier',
      this: 'Ce',
      next: 'Suivant',
    },
    datetimePositions: {
      before: 'Avant',
      after: 'Après',
    },
  },
  dataBrowser: {
    addFilter: 'Ajouter un filtre',
    selectField: 'Sélectionner un champ',
    configureFilter: 'Configurer le filtre',
    noResults: 'Aucun résultat',
    searchPlaceholder: 'Rechercher',
  },
  pivotTable: {
    grandTotal: 'Total général',
    subTotal: 'Total {{value}}',
    limits: {
      baseNote:
        'Les totaux peuvent faire référence aux données complètes si définis par le propriétaire du tableau de bord. Si disponible, vous pouvez utiliser des filtres pour afficher moins de lignes et de colonnes.',
      rowsLimit: 'Le tableau croisé dynamique est limité à {{recordsCount}} enregistrements',
      columnsLimit: 'Le tableau croisé dynamique est limité à {{columnsCount}} colonnes',
      columnsAndRowsLimit:
        'Le tableau croisé dynamique est limité à {{recordsCount}} enregistrements et {{columnsCount}} colonnes',
    },
  },
  dashboard: {
    toolbar: {
      undo: 'Annuler',
      redo: 'Refaire',
      cancel: 'Annuler',
      apply: 'Appliquer',
      editLayout: 'Modifier la mise en page',
      viewMode: 'Passer en mode affichage',
      showFilters: 'Afficher les filtres',
      hideFilters: 'Masquer les filtres',
      columns: 'Colonnes',
      column: 'Colonne',
    },
  },
  jumpToDashboard: {
    defaultCaption: 'Aller à',
    jumpableTooltip: 'Ce widget est navigable',
  },
  calendarHeatmap: {
    navigation: {
      firstMonth: 'Premier mois',
      lastMonth: 'Dernier mois',
      previousMonth: 'Mois précédent',
      nextMonth: 'Mois suivant',
      previousGroup: 'Groupe précédent',
      nextGroup: 'Groupe suivant',
    },
  },
};

export default [
  {
    language: 'fr-FR',
    namespace: SDK_UI_NAMESPACE,
    resources: translation,
  },
];
