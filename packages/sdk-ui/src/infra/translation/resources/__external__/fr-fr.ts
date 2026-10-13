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
  notifications: {
    dismiss: 'Fermer la notification',
    auth: {
      sessionExpiredTitle: 'Session expirée',
      sessionExpiredMessage: 'Votre session a expiré. Reconnectez-vous pour continuer.',
      authenticationFailedTitle: "Échec de l'authentification",
      authenticationFailedMessage:
        "Les identifiants fournis ont été refusés par l'instance Sisense.",
    },
    permission: {
      forbiddenTitle: 'Accès refusé',
      forbiddenMessage: "Vous n'avez pas l'autorisation d'accéder à ces données.",
    },
    network: {
      unreachableTitle: 'Problème de connexion',
      unreachableMessage: "L'instance Sisense est injoignable.",
    },
    server: {
      errorTitle: 'Erreur du serveur',
      errorMessage: "L'instance Sisense a renvoyé une erreur. Réessayez plus tard.",
    },
    general: {
      requestFailedTitle: 'Échec de la requête',
      requestFailedMessage: "Une requête vers l'instance Sisense a échoué.",
    },
  },
  errorBoxText: '$t(common:error): {{errorMessage}}',
  chartNoData: 'Aucun résultat',
  filters: 'Filtres',
  cancel: 'Annuler',
  includeAll: 'Inclure tout',
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
      min: 'Limite inférieure',
      max: 'Limite supérieure',
      forecastValue: 'Valeur de prévision',
      forecast: 'Prévision',
      trend: 'Tendance',
      trendLocalValue: 'Valeur locale',
      confidenceInterval: 'Intervalle de confiance',
      trendType: 'Type',
      trendDataKey: 'Données de la tendance',
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
  filterWidget: {
    placeholders: {
      setFilter: 'Définir le filtre',
    },
    dateRange: {
      from: 'De',
      to: 'À',
      invertedFrom: 'Doit être antérieure à la date de fin',
      invertedTo: 'Doit être postérieure à la date de début',
    },
    numberRange: {
      minimum: 'Minimum',
      maximum: 'Maximum',
      notSet: 'Non défini',
      clear: 'Effacer {{field}}',
    },
    selectedCount: '{{count}} sélectionné(s)',
    allExceptCount: 'Tous sauf {{count}}',
    setupTitle: 'Configurer un widget de filtre',
    setupSubtitle: 'Définissez une dimension et configurez le fonctionnement du filtre',
    emptySetup: 'Configurer le filtre',
    conditionUnsupported:
      'La condition est disponible pour les champs texte, numériques et de date',
    dateCondition: {
      onOrBefore: 'Le ou avant',
      onOrAfter: 'Le ou après',
      includingCurrent: "incluant l'actuel",
      includingCurrentLabel: "Incluant l'actuel",
      countMin: 'Saisissez un nombre entier supérieur ou égal à 1',
      summary: {
        current: '{{- operator}} {{- grain}}',
        relative: '{{- operator}} {{- count}} {{- grain}}',
        relativeIncludingCurrent: '{{- operator}} {{- count}} {{- grain}} {{- includingCurrent}}',
        date: '{{- operator}} {{- date}}',
      },
    },
    conditionNotRepresentable: 'Cette condition ne peut pas être modifiée ici',
    controls: {
      findInList: 'Rechercher dans la liste',
      enterValue: 'Entrez la valeur...',
      noMatches: 'Aucune correspondance',
      clearSelection: 'Effacer la sélection',
      overflowCount: '+{{count}}',
      select: 'Sélectionner',
      selectDateLevel: 'Sélectionner le niveau de date',
      selectCondition: 'Sélectionner une condition',
      selectConnector: 'Sélectionner ET/OU',
      addCondition: '+ Ajouter une condition',
      fillOrRemoveCondition: 'Remplir ou supprimer la condition',
      rangeOrderError: 'La deuxième valeur doit être supérieure à la première',
      betweenMin: 'Minimum',
      betweenMax: 'Maximum',
      increaseCount: 'Augmenter',
      decreaseCount: 'Diminuer',
      selectValues: 'Sélectionner {{level}}',
      clear: 'Effacer',
    },
    timeFrame: {
      /** Accessible name for the row-list popover — read to a screen reader on open. */
      listboxLabel: 'Options de période',
      /**
       * Row labels. Two shapes carry a `{{count}}`, which i18next resolves to the
       * `_one` (singular) or `_other` (plural) key by CLDR plural rules. Locales
       * with more plural forms — Russian's `_few`/`_many`, Polish's `_many` — add
       * more suffixes in their own resources; English needs only the two.
       */
      labels: {
        /** Day-grain count=1: `Today` / `Yesterday` / `Tomorrow` — calendar words, not arithmetic. */
        today: "Aujourd'hui",
        yesterday: 'Hier',
        tomorrow: 'Demain',
        /** `This X` — single period, no count in the label. Day has none (Today covers it). */
        this: {
          week: 'Cette semaine',
          month: 'Ce mois',
          quarter: 'Ce trimestre',
          year: 'Cette année',
        },
        /**
         * `Last X` / `Last N X` — count drops for the singular, plural interpolates it.
         * Day `_one` renders as `Yesterday` and never reaches this key.
         */
        last: {
          week_one: 'La semaine dernière',
          week_few: '{{count}} dernières semaines',
          week_many: '{{count}} dernières semaines',
          week_other: '{{count}} dernières semaines',
          month_one: 'Le mois dernier',
          month_few: '{{count}} derniers mois',
          month_many: '{{count}} derniers mois',
          month_other: '{{count}} derniers mois',
          quarter_one: 'Le trimestre dernier',
          quarter_few: '{{count}} derniers trimestres',
          quarter_many: '{{count}} derniers trimestres',
          quarter_other: '{{count}} derniers trimestres',
          year_one: "L'année dernière",
          year_few: '{{count}} dernières années',
          year_many: '{{count}} dernières années',
          year_other: '{{count}} dernières années',
          day_few: '{{count}} derniers jours',
          day_many: '{{count}} derniers jours',
          day_other: '{{count}} derniers jours',
        },
        /** `Next X` / `Next N X`. Day `_one` renders as `Tomorrow`. */
        next: {
          week_one: 'La semaine prochaine',
          week_few: '{{count}} prochaines semaines',
          week_many: '{{count}} prochaines semaines',
          week_other: '{{count}} prochaines semaines',
          month_one: 'Le mois prochain',
          month_few: '{{count}} prochains mois',
          month_many: '{{count}} prochains mois',
          month_other: '{{count}} prochains mois',
          quarter_one: 'Le trimestre prochain',
          quarter_few: '{{count}} prochains trimestres',
          quarter_many: '{{count}} prochains trimestres',
          quarter_other: '{{count}} prochains trimestres',
          year_one: "L'année prochaine",
          year_few: '{{count}} prochaines années',
          year_many: '{{count}} prochaines années',
          year_other: '{{count}} prochaines années',
          day_few: '{{count}} prochains jours',
          day_many: '{{count}} prochains jours',
          day_other: '{{count}} prochains jours',
        },
        /** Paired frames — include the current period. Day grain has no such pair. */
        thisAndLast: {
          week: 'Cette semaine et la précédente',
          month: 'Ce mois et le précédent',
          quarter: 'Ce trimestre et le précédent',
          year: 'Cette année et la précédente',
        },
        thisAndNext: {
          week: 'Cette semaine et la suivante',
          month: 'Ce mois et le suivant',
          quarter: 'Ce trimestre et le suivant',
          year: 'Cette année et la suivante',
        },
      },
    },
    calendar: {
      selectDates: 'Sélectionner des dates',
      multipleDaysHint: 'Vous pouvez sélectionner plusieurs jours',
      formatError: 'Respectez le format {{- format}}',
      nonexistent: "Cette date n'existe pas",
      chooseDate: 'Choisir une date',
      chooseDates: 'Choisir des dates',
      previousMonth: 'Mois précédent',
      nextMonth: 'Mois suivant',
      previousYear: 'Année précédente',
      nextYear: 'Année suivante',
      openCalendar: 'Ouvrir le calendrier',
      clearDate: 'Effacer la date',
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
    breadcrumbsPrev: 'Préc',
    breadcrumbsNext: 'Suivant',
    popover: {
      members: 'Membres',
      table: 'Table',
      column: 'Colonne',
    },
  },
  widgetHeader: {
    addTitle: 'Ajouter un titre',
    info: {
      details: 'Détails du widget',
      tooltip: 'Cliquez pour voir les détails complets',
    },
    chartTableToggle: {
      switchToTable: 'Passer au tableau',
      switchToChart: 'Passer au graphique',
    },
    menu: {
      deleteWidget: 'Supprimer le widget',
      duplicateWidget: 'Dupliquer le widget',
      renameWidget: 'Renommer le widget',
      distributeEqualWidth: 'Répartir de manière égale dans cette ligne',
      download: 'Télécharger',
      csvFile: 'Fichier CSV',
      excelFile: 'Fichier Excel',
      repeatRowsRecommended: 'Répéter les lignes (Recommandé)',
      mergeRows: 'Fusionner les lignes',
    },
  },
  customWidgets: {
    registerPrompt:
      'Type de widget personnalisé inconnu : {{customWidgetType}}. Veuillez enregistrer ce widget personnalisé.',
  },
  narrativeWidget: {
    generate: 'Générer la narration',
    regenerate: 'Régénérer',
    retry: 'Réessayer la génération',
    disclaimer: "Le contenu est alimenté par l'IA, donc des erreurs sont possibles.",
    updatedAt: 'Mis à jour le {{timestamp}}',
    copy: 'Copier dans le presse-papiers',
    copied: 'Copié',
    creditsUsed: '{{usagePercentage}} % des crédits IA ont été utilisés.',
    noDataTitle: 'Aucune donnée de tableau de bord disponible',
    noDataDescription:
      'Une fois les données du tableau de bord disponibles, vous pourrez générer une narration.',
    failedTitle: 'Impossible de générer la narration',
    failedDescription:
      'Veuillez réessayer plus tard. Si le problème persiste, contactez votre administrateur.',
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
      readMore: 'Afficher plus',
      collapse: 'Réduire',
      yes: 'Oui',
      no: 'Non',
      seeMore: 'Voir plus',
      generateNarrative: 'Générer une narration IA',
      hideNarrative: 'Masquer la narration IA',
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
      failedToFetchCreditBalance: 'Impossible de récupérer le solde de crédits',
    },
    quota: {
      exceededErrorTitle: 'Les réponses IA ne sont actuellement pas disponibles.',
      exceededErrorDescription:
        "Vous avez atteint le quota mensuel de votre entreprise pour l'IA. Le quota sera automatiquement renouvelé au prochain cycle d'utilisation mensuel.",
      warningDescription:
        "Vous avez utilisé {{usagePercentage}} % du quota mensuel de votre entreprise pour l'IA.",
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
    tooltips: {
      selectAllPartiallyLoaded:
        "Toutes les valeurs ne sont pas affichées. Faites défiler la liste vers le bas pour charger les valeurs restantes. Vous pouvez également utiliser la condition « N'est pas » ci-dessous pour exclure des valeurs spécifiques.",
    },
    labels: {
      includeAll: 'Tout inclure (aucun filtre appliqué)',
      allowMultiSelection: 'Autoriser la sélection multiple pour les listes',
      from: 'De',
      to: 'À',
      includeCurrent: "Incluant l'actuel",
      rankedBy: 'Classé par',
      selectField: 'Sélectionner un champ',
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
      between: 'Entre',
      top: 'Top',
      bottom: 'Derniers',
    },
    validationErrors: {
      invalidNumber: 'Nombres uniquement',
      invalidNumericRange: '"À" doit être supérieur à "De"',
    },
    datetimeLevels: {
      year: 'Année',
      year_one: 'Année',
      year_few: 'Années',
      year_many: 'Années',
      year_other: 'Années',
      quarter: 'Trimestre',
      quarter_one: 'Trimestre',
      quarter_few: 'Trimestres',
      quarter_many: 'Trimestres',
      quarter_other: 'Trimestres',
      month: 'Mois',
      month_one: 'Mois',
      month_few: 'Mois',
      month_many: 'Mois',
      month_other: 'Mois',
      week: 'Semaine',
      week_one: 'Semaine',
      week_few: 'Semaines',
      week_many: 'Semaines',
      week_other: 'Semaines',
      day: 'Jour',
      day_one: 'Jour',
      day_few: 'Jours',
      day_many: 'Jours',
      day_other: 'Jours',
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
    more: 'Plus...',
    filter: 'Filtre',
    addMeasure: 'Ajouter une mesure',
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
  filterTile: {
    menu: {
      lock: 'Verrouiller',
      unlock: 'Déverrouiller',
      lockGroup: 'Verrouiller le groupe',
      unlockGroup: 'Déverrouiller le groupe',
    },
    toggleSwitch: 'Activer/désactiver le filtre',
    linkedToWidget: {
      label: 'Lié au widget de filtre',
      tooltip:
        'Ce filtre ne peut pas être modifié depuis le panneau de filtres. Modifiez ses valeurs directement sur le tableau de bord.',
      infoAriaLabel: 'Infos sur le lien avec le widget de filtre',
    },
  },
  chart: {
    indicator: {
      label: "Graphique d'indicateur",
    },
    visualization: {
      label: 'Visualisation des données',
    },
    pivotTable: {
      label: 'Tableau croisé dynamique',
    },
    table: {
      label: 'Tableau de données',
      totalRows: 'Total : {{formattedCount}} lignes',
      rowsRange: 'Lignes {{start}}-{{end}}',
    },
    sankey: {
      alerts: {
        tooManyStages:
          'Le diagramme de Sankey comporte {{stageCount}} étapes ; au-delà de {{softLimit}} le diagramme devient souvent illisible. Réduisez les colonnes de catégorie ou resserrez les filtres.',
      },
    },
  },
  kpi: {
    comparison: {
      vsPriorYear: 'vs année précédente',
      vsPriorQuarter: 'vs trimestre précédent',
      vsPriorMonth: 'vs mois précédent',
      vsPriorWeek: 'vs semaine précédente',
      vsPriorDay: 'vs jour précédent',
      vsPriorPeriod: 'vs période précédente',
      vsBaseline: 'vs {{label}}',
      withBaseline: '{{label}} ({{baseline}})',
    },
    target: {
      ofGoal: "{{percent}} de l'objectif ({{goalValue}})",
      toGo: 'Il reste {{value}}',
    },
    percentFormat: '{{sign}}{{value}}\u202F%',
  },
  loadingOverlay: {
    label: 'Chargement du contenu',
  },
  queryDefinition: {
    showMorePills: 'Afficher {{count}} de plus',
    showLess: 'Afficher moins',
    connectorBy: 'par',
    connectorWhere: 'où',
    tooltipType: 'Type',
    tooltipColumn: 'Colonne',
    tooltipFormula: 'Formule',
    filterPill: {
      customFilter: 'filtre personnalisé',
      empty: 'vide',
      notEmpty: 'non vide',
      not: 'pas {{value}}',
      and: 'et',
      or: 'ou',
      moreValues: '{{values}} +{{count}} de plus',
      range: '{{from}} à {{to}}',
      fromToLatest: '{{from}} à la date la plus récente',
      earliestTo: 'date la plus ancienne à {{to}}',
      dependentOn: 'dépend de {{parents}}',
      dependentFilter: 'filtre dépendant',
      text: {
        contains: 'contient {{value}}',
        startsWith: 'commence par {{value}}',
        endsWith: 'se termine par {{value}}',
        doesntEqual: 'différent de {{value}}',
        doesntStartWith: 'ne commence pas par {{value}}',
        doesntContain: 'ne contient pas {{value}}',
        doesntEndWith: 'ne se termine pas par {{value}}',
        like: 'comme {{value}}',
      },
      ranking: {
        top: 'Top {{count}}',
        bottom: 'Derniers {{count}}',
        by: '{{rank}} par {{measure}}',
      },
      relative: {
        last: 'période précédente de {{count}} {{unit}}',
        next: 'période suivante de {{count}} {{unit}}',
        lastTo: "{{count}} {{unit}} jusqu'au {{date}}",
        nextFrom: '{{count}} {{unit}} à partir du {{date}}',
        includingCurrent: '{{period}}, période actuelle incluse',
        withOffset: '{{period}}, décalage {{offset}}',
        today: "aujourd'hui",
        thisWeek: 'cette semaine',
        thisMonth: 'ce mois-ci',
        thisQuarter: 'ce trimestre',
        thisYear: 'cette année',
      },
      units: {
        year_one: 'année',
        year_few: 'années',
        year_many: 'années',
        year_other: 'années',
        quarter_one: 'trimestre',
        quarter_few: 'trimestres',
        quarter_many: 'trimestres',
        quarter_other: 'trimestres',
        month_one: 'mois',
        month_few: 'mois',
        month_many: 'mois',
        month_other: 'mois',
        week_one: 'semaine',
        week_few: 'semaines',
        week_many: 'semaines',
        week_other: 'semaines',
        day_one: 'jour',
        day_few: 'jours',
        day_many: 'jours',
        day_other: 'jours',
        hour_one: 'heure',
        hour_few: 'heures',
        hour_many: 'heures',
        hour_other: 'heures',
        minute_one: 'minute',
        minute_few: 'minutes',
        minute_many: 'minutes',
        minute_other: 'minutes',
      },
    },
  },
  measures: {
    countShort: 'Nb de {{level}}',
    countDistinct: 'Compter les valeurs uniques',
    count: 'Compter tout',
    average: 'Moyenne',
    sum: 'Somme',
    min: 'Min',
    max: 'Max',
    stdev: 'Écart type',
    median: 'Médiane',
    variance: 'Variance',
  },
  measuresAgg: {
    countDistinct: '# uniques',
    count: 'Nbre de',
    sum: 'Total',
    average: 'Moyenne',
    min: 'Min',
    max: 'Max',
    median: 'Médiane de',
    variance: 'Variance de',
    stdev: 'Écart-type de',
  },
};

export default [
  {
    language: 'fr-FR',
    namespace: SDK_UI_NAMESPACE,
    resources: translation,
  },
];
