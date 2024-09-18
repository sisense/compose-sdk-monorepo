export const translation = {
  errors: {
    noSisenseContext: 'Sisense context is not initialized',
    componentRenderError: 'Unable to render the component',
    sisenseContextNoAuthentication: 'Authentication method is not specified',
    chartNoSisenseContext:
      'Sisense Context for Chart not found. To fix, add a dataSet to the Chart or wrap the component inside a Sisense context provider.',
    dashboardWidgetNoSisenseContext:
      'Sisense Context for Dashboard Widget not found. To fix, wrap the component inside a Sisense context provider.',
    dashboardWidgetInvalidIdentifiers:
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
      pivotWidgetNotSupported: 'Pivot widget is not supported for method {{methodName}}',
      textWidgetNotSupported: 'Text widget is not supported for method {{methodName}}',
      onlyTableWidgetSupported: 'Only table widget is supported for method {{methodName}}',
      onlyPivotWidgetSupported: 'Only pivot widget is supported for method {{methodName}}',
      onlyTextWidgetSupported: 'Only text widget is supported for method {{methodName}}',
    },
    unknownFilterInFilterRelations: 'Filter relations contain unknown filter',
    filterRelationsNotSupported: 'Filter relations not supported yet',
    invalidFilterType: 'Invalid filter type',
    secondsDateTimeLevelSupportedOnlyForLive:
      "Seconds datetime level is supported only for the 'live' datasource",
  },
  errorBoxText: '$t(common:error): {{errorMessage}}',
  chartNoData: 'No Results',
  criteriaFilter: {
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
    count: 'Count',
    today: 'Today',
    days: 'Days',
    weeks: 'Weeks',
    months: 'Months',
    quarters: 'Quarters',
    years: 'Years',
    earliestDate: 'Earliest Date',
    latestDate: 'Latest Date',
    todayOutOfRange: 'Today is out of available date range',
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
  unsupportedFilter: {
    title: 'Unsupported Filter',
    message: 'Applied to the data query',
  },
  commonFilter: {
    clearSelectionButton: 'Clear Selection',
  },
  customFilterTileMessage: 'filtered with custom filter',
};

export type TranslationDictionary = typeof translation;
