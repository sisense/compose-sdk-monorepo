export const translation = {
  errors: {
    noSisenseContext: 'Sisense context is not initialized',
    restApiNotReady: 'Rest API is not initialized',
    componentRenderError: 'Unable to render the component',
    sisenseContextNoAuthentication: 'Authentication method is not specified',
    chartNoSisenseContext:
      'Sisense Context for Chart not found. To fix, add a dataSet to the Chart or wrap the component inside a Sisense context provider.',
    widgetByIdNoSisenseContext:
      'Sisense Context for Dashboard Widget not found. To fix, wrap the component inside a Sisense context provider.',
    widgetByIdInvalidIdentifier:
      'Failed to retrieve widget. ' +
      'Please make sure the dashboard widget exists and is accessible.',
    dashboardWidgetsInvalidIdentifiers:
      'Failed to retrieve dashboard widgets. ' +
      'Please make sure the dashboard exists and is accessible.',
    executeQueryNoSisenseContext:
      'Sisense Context for query execution not found. To fix, wrap the component inside a Sisense context provider.',
    executeQueryNoDataSource: 'No dataSource provided to execute query',
    dataOptions: {
      noDimensionsAndMeasures:
        'Neither dimensions nor measures found. Data options should have at least one dimension or measure.',
      attributeNotFound: 'Attribute "{{attributeName}}" not found in the data',
      measureNotFound: 'Measure "{{measureName}}" not found in the data',
      filterAttributeNotFound: 'Filter attribute "{{attributeName}}" not found in the data',
      highlightAttributeNotFound: 'Highlight attribute "{{attributeName}}" not found in the data',
    },
    optionsTranslation: {
      invalidStyleOptions: "Invalid style options for '{{chartType}}' chart",
      invalidInternalDataOptions:
        "Data options are not correctly converted for '{{chartType}}' chart",
    },
    themeNotFound: 'Theme with oid {{themeOid}} not found in the Sisense instance',
    paletteNotFound: "Palette '{{paletteName}}' not found in the Sisense instance",
    chartTypeNotSupported: 'Chart type {{chartType}} is not supported',
    chartInvalidProps: 'Invalid chart props',
    unsupportedWidgetType: "Can't extract props for unsupported widget type - {{widgetType}}",
    sisenseContextNotFound: 'Sisense Context not found. Please ensure it is provided.',
    dashboardInvalidIdentifier:
      'Failed to retrieve dashboard. Please make sure the dashboard exists and is accessible.',
    sharedFormula: {
      identifierExpected:
        'Failed to identify shared formula. Please provide oid or both name and datasource',
      failedToFetch: 'Failed to fetch shared formula',
    },
    widgetModel: {
      incomleteWidget:
        'Widget can not be transformed to DTO because of incomplete property ({{prop}})',
      unsupportedWidgetTypeDto: 'Saving the widget of type {{chartType}} is not supported',
      pivotWidgetNotSupported: 'Pivot widget is not supported for method {{methodName}}',
      textWidgetNotSupported: 'Text widget is not supported for method {{methodName}}',
      onlyTableWidgetSupported: 'Only table widget is supported for method {{methodName}}',
      onlyPivotWidgetSupported: 'Only pivot widget is supported for method {{methodName}}',
      onlyTextWidgetSupported: 'Only text widget is supported for method {{methodName}}',
      onlyCustomWidgetSupported: 'Only custom widget is supported for method {{methodName}}',
      unsupportedWidgetType: 'Unsupported widget type: {{widgetType}}',
      unsupportedFusionWidgetType: 'Unsupported Fusion widget type: {{widgetType}}',
    },
    unknownFilterInFilterRelations: 'Filter relations contain unknown filter',
    filterRelationsNotSupported: 'Filter relations not supported yet',
    invalidFilterType: 'Invalid filter type',
    secondsDateTimeLevelSupportedOnlyForLive:
      "Seconds datetime level is supported only for the 'live' datasource",
    missingMenuRoot: 'Missing initialized menu root',
    missingModalRoot: 'Missing initialized modal root',
    missingDataSource:
      "The 'dataSource' value is missing. It must be provided explicitly, or a 'defaultDataSource' should be specified in the Sisense context provider.",
    incorrectOnDataReadyHandler: "'onDataReady' handler must return a valid data object",
    undefinedDataSource: 'Data source is not defined',
    emptyModel: 'Empty model',
    missingMetadata: 'Missing metadata',
    missingModelTitle: 'Missing model title',
    httpClientNotFound: 'HttpClient not found.',
    serverSettingsNotLoaded: 'Failed to load server settings',
    requiredColumnMissing: 'Missing required column',
    unexpectedChartType: 'Unexpected chart type: {{chartType}}',
    noRowNumColumn: 'Data has no row num column',
    ticIntervalCalculationFailed:
      'Unable to calculate tic interval. Try specifying datetime granularity.',
    polarChartDesignOptionsExpected: 'Polar chart design options expected for polar chart',
    polarChartDesignOptionsNotExpected:
      'Polar chart design options not expected for non-polar chart',
    indicatorInvalidRelativeSize: 'Invalid relative size options',
    unsupportedMapType: 'Unsupported map type: {{mapType}}',
    mapLoadingFailed: 'Failed loading map',
    cascadingFilterOriginalNotFound:
      'Error in cascading filters reassembling. Original cascading filter not found',
    dashboardLoadFailed: 'Failed to load Dashboard. {{error}}',
    widgetLoadFailed: 'Failed to load Widget. {{error}}',
    dashboardWithOidNotFound: 'Dashboard with oid {{dashboardOid}} not found',
    failedToAddWidget: 'Failed to add widget to dashboard',
    widgetWithOidNotFound: 'Widget with oid {{widgetOid}} not found',
    widgetWithOidNotFoundInDashboard:
      'Widget with oid {{widgetOid}} not found in dashboard with oid {{dashboardOid}}',
    widgetEmptyResponse: 'Empty response for widget with oid {{widgetOid}}',
    dateFilterIncorrectOperator: 'Incorrect operator: {{operator}}',
    synchronizedFilterInvalidProps:
      '`useSynchronizedFilter` hook must take at least one of [non-null `filterFromProps`] or [`createEmptyFilter` function]',
    methodNotImplemented: 'Method not implemented.',
    noPivotClient: 'Pivot client not initialized',
    unexpectedCacheValue: 'Unexpected cache value',
    notAMembersFilter: 'Filter is not a MembersFilter',
    drilldownNoInitialDimension:
      'Initial dimension has to be specified to use drilldown with custom components',
    otherWidgetTypesNotSupported: 'Other widget types are not supported yet',
    dataBrowser: {
      dimensionNotFound: 'Dimension with id {{dimensionId}} not found',
      attributeNotFound: 'Attribute with id {{attributeId}} not found',
    },
    addFilterPopover: {
      noDataSources:
        'No data sources available. Try to define `dataSource` in widgets or `defaultDataSource` on the dashboard level.',
    },
    tabberInvalidConfiguration: 'Tabber widget configuration is invalid',
  },
  errorBoxText: '$t(common:error): {{errorMessage}}',
  chartNoData: 'No Results',
  filters: 'Filters',
  widgetDetails: 'Widget Details',
  cancel: 'Cancel',
  includeAll: 'Include all',
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
    displayModePrefix: 'All items',
    equals: 'Equals {{val}}',
    notEquals: 'Does not equal {{val}}',
    lessThan: 'Less than {{val}}',
    lessThanOrEqual: 'Less than or equal to {{val}}',
    greaterThan: 'Greater than {{val}}',
    greaterThanOrEqual: 'Greater than or equal to {{val}}',
    between: 'Between {{valA}} and {{valB}}',
    notBetween: 'Not between {{valA}} and {{valB}}',
    top: 'Top {{valA}} by {{valB}}',
    bottom: 'Last {{valA}} by {{valB}}',
    is: 'Is {{val}}',
    isNot: 'Is not {{val}}',
    contains: 'Contains {{val}}',
    notContains: `Doesn't contain {{val}}`,
    startsWith: 'Starts with {{val}}',
    notStartsWith: `Doesn't start with {{val}}`,
    endsWith: 'Ends with {{val}}',
    notEndsWith: `Doesn't end with {{val}}`,
    like: 'Is like {{val}}',
    byMeasure: 'By measure',
    by: 'by',
  },
  dateFilter: {
    last: 'Last',
    next: 'Next',
    from: 'From',
    to: 'To',
    count: 'Count',
    select: 'Select',
    today: 'Today',
    days: 'Days',
    weeks: 'Weeks',
    months: 'Months',
    quarters: 'Quarters',
    years: 'Years',
    earliestDate: 'Earliest Date',
    latestDate: 'Latest Date',
    todayOutOfRange: 'Today is out of available date range',
    dateRange: {
      fromTo: '{{from}} to {{to}}',
      from: 'From {{val}}',
      to: 'To {{val}}',
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
      ofTotal: 'of total',
      of: 'of',
    },
  },
  advanced: {
    tooltip: {
      min: 'Lower Bound',
      max: 'Upper Bound',
      forecastValue: 'Forecast Value',
      forecast: 'Forecast',
      trend: 'Trend',
      trendLocalValue: 'Local Value',
      confidenceInterval: 'Confidence Interval',
      trendType: 'Type',
      trendDataKey: 'Trend Data',
      trendData: {
        min: 'Min',
        max: 'Max',
        median: 'Median',
        average: 'Average',
      },
    },
  },
  arearange: {
    tooltip: {
      min: 'Min',
      max: 'Max',
    },
  },
  unsupportedFilterMessage: 'Unsupported Filter (applied to the data query)',
  unsupportedFilter: 'Unsupported filter {{filter}}',
  commonFilter: {
    clearSelectionButton: 'Clear Selection',
    selectMenuItem: 'Select',
    unselectMenuItem: 'Un-Select',
  },
  customFilterTileMessage: 'filtered with custom filter',
  filterRelations: {
    and: 'AND',
    or: 'OR',
    andOrFormulaApplied: 'AND/OR Formula applied',
  },
  drilldown: {
    drillMenuItem: 'Drill',
    breadcrumbsAllSuffix: 'All',
    breadcrumbsPrev: 'Prev',
    breadcrumbsNext: 'Next',
    popover: {
      members: 'Members',
      table: 'Table',
      column: 'Column',
    },
  },
  widgetHeader: {
    info: {
      details: 'Widget Details',
      tooltip: 'Click to view full details',
    },
    menu: {
      deleteWidget: 'Delete Widget',
      distributeEqualWidth: 'Distribute equally in this row',
    },
  },
  customWidgets: {
    registerPrompt:
      'Unknown custom widget type: {{customWidgetType}}. Please register this custom widget so it can be rendered.',
  },
  ai: {
    analyticsChatbot: 'Analytics Chatbot',
    dataTopics: 'Data Topics',
    chatbotDescription:
      'Analytics Chatbot is designed to help you interact with your data using natural language.',
    topicSelectPrompt: 'Pick a topic you would like to explore:',
    preview: 'Preview',
    clearHistoryPrompt: 'Do you want to clear this chat?',
    config: {
      inputPromptText: 'Ask a question or type "/" for ideas',
      welcomeText:
        'Welcome to the Analytics Assistant! I can help you explore and gain insights from your data.',
      suggestionsWelcomeText: 'Some questions you may have:',
    },
    buttons: {
      insights: 'Insights',
      correctResponse: 'Correct response',
      incorrectResponse: 'Incorrect response',
      clearChat: 'Clear chat',
      refresh: 'Refresh',
      readMore: 'Read more',
      collapse: 'Collapse',
      yes: 'Yes',
      no: 'No',
      seeMore: 'See more',
    },
    disclaimer: {
      poweredByAi: 'Content is powered by AI, so surprises and mistakes are possible.',
      rateRequest: 'Please rate responses so we can improve!',
    },
    errors: {
      chatUnavailable: 'Chat unavailable. Please try again later.',
      fetchHistory:
        "Something went wrong and we were unable to retrieve the chat thread. Let's start over!",
      recommendationsNotAvailable:
        "Recommendations aren't available right now. Try again in a few minutes.",
      insightsNotAvailable: 'No insights available.',
      VectorDBEmptyResponseError:
        'The AI configuration is not ready, please wait a few minutes and try again.',
      LlmBadConfigurationError:
        'The LLM configuration is wrong. Reach out to your Admin to update the LLM provider configuration.',
      ChartTypeUnsupportedError: 'Requested chart type is not supported.',
      BlockedByLlmContentFiltering:
        'This question is blocked by our content management policy. Please try asking a different question.',
      LlmContextLengthExceedsLimitError:
        "Looks like you've reached the message length limit, please clear this conversation.",
      UserPromptExeedsLimitError:
        'The prompt exceeds the limit. Rephrase your question and use shorter prompt.',
      unexpectedChatResponse:
        'Oh snap, something went wrong. Please try again later or try asking a different question.',
      unexpected: 'Oh snap, something went wrong. Please try again later.',
      unknownResponse: 'Received unknown responseType, raw response=',
      invalidInput: 'Invalid input',
      noAvailableDataTopics: 'None of the provided data models or perspectives are available',
    },
  },
  attribute: {
    datetimeName: {
      years: 'Years in {{columnName}}',
      quarters: 'Quarters in {{columnName}}',
      months: 'Months in {{columnName}}',
      weeks: 'Weeks in {{columnName}}',
      days: 'Days in {{columnName}}',
      hours: 'Hours in {{columnName}}',
      minutes: 'Minutes in {{columnName}}',
    },
  },
  filterEditor: {
    buttons: {
      apply: 'Apply',
      cancel: 'Cancel',
      selectAll: 'Select All',
      clearAll: 'Clear All',
    },
    labels: {
      includeAll: 'Include all (no filter applied)',
      allowMultiSelection: 'Allow multiselect for lists',
      from: 'From',
      to: 'To',
      includeCurrent: 'Including current',
    },
    placeholders: {
      selectFromList: 'Select from list',
      enterEntry: 'Type your entry...',
      enterValue: 'Enter value...',
      select: 'Select',
    },
    conditions: {
      exclude: 'Is not',
      contains: 'Contains',
      notContain: 'Does not contain',
      startsWith: 'Starts with',
      notStartsWith: 'Does not start with',
      endsWith: 'Ends with',
      notEndsWith: 'Does not end with',
      equals: 'Equals',
      notEquals: 'Does not equal',
      isEmpty: 'Is empty',
      isNotEmpty: 'Is not empty',
      lessThan: 'Smaller than',
      lessThanOrEqual: 'Equals or smaller than',
      greaterThan: 'Greater than',
      greaterThanOrEqual: 'Equals or greater than',
      isWithin: 'Is within',
    },
    validationErrors: {
      invalidNumber: 'Numbers only',
      invalidNumericRange: '"To" must be greater than "From"',
    },
    datetimeLevels: {
      year: 'Year',
      quarter: 'Quarter',
      month: 'Month',
      week: 'Week',
      day: 'Day',
      aggrigatedHour: 'Hour (aggregated)',
      aggrigatedMinutesRoundTo15: '15-min (aggregated)',
    },
    relativeTypes: {
      last: 'Last',
      this: 'This',
      next: 'Next',
    },
    datetimePositions: {
      before: 'Before',
      after: 'After',
    },
  },
  dataBrowser: {
    addFilter: 'Add Filter',
    selectField: 'Select Field',
    configureFilter: 'Configure Filter',
    noResults: 'No results',
    searchPlaceholder: 'Search',
  },
  pivotTable: {
    grandTotal: 'Grand Total',
    subTotal: '{{value}} Total',
  },
  dashboard: {
    toolbar: {
      undo: 'Undo',
      redo: 'Redo',
      cancel: 'Cancel',
      apply: 'Apply',
      editLayout: 'Edit Layout',
      viewMode: 'View mode',
    },
  },
  jumpToDashboard: {
    defaultCaption: 'Jump to',
    jumpableTooltip: 'This widget is jumpable',
    noDrillTargets: 'No drill targets available',
  },
  calendarHeatmap: {
    navigation: {
      firstMonth: 'First Month',
      lastMonth: 'Last Month',
      previousMonth: 'Previous Month',
      nextMonth: 'Next Month',
      previousGroup: 'Previous Group',
      nextGroup: 'Next Group',
    },
  },
};

/**
 * A reference type containing all currently used translation keys.
 * This type serves as a complete resource for creating custom translations,
 * ensuring that all required keys are present and included.
 * It can also be used as Partial to make sure custom translation does not contain any typos.
 *
 * @example
 * ```typescript
 * import { TranslationDictionary } from '@sisense/sdk-ui';
 *
 * const customTranslationResources: Partial<TranslationDictionary> = {
 * ```
 * @internal
 */
export type TranslationDictionary = typeof translation;
