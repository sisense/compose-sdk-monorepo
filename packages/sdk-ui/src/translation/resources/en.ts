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
    executeQueryNoSisenseContext:
      'Sisense Context for query execution not found. To fix, wrap the component inside a Sisense context provider.',
    executeQueryNoDataSource: 'No dataSource provided to execute query',
    dataOptions: {
      emptyValueArray: 'Invalid dataOptions – Array "value" is empty',
      noDimensionsAndMeasures:
        'Neither dimensions nor measures found. Data options should have at least one dimension or measure.',
      attributeNotFound: 'Attribute "{{attributeName}}" not found in the data',
      measureNotFound: 'Measure "{{measureName}}" not found in the data',
      filterAttributeNotFound: 'Filter attribute "{{attributeName}}" not found in the data',
      highlightAttributeNotFound: 'Highlight attribute "{{attributeName}}" not found in the data',
    },
    themeNotFound: 'Theme with oid {{themeOid}} not found in the Sisense instance',
    paletteNotFound: "Palette '{{paletteName}}' not found in the Sisense instance",
    unsupportedWidgetType: "Can't extract props for unsupported widget type - {{widgetType}}",
    sisenseContextNotFound: 'Sisense Context not found. Please ensure it is provided.',
    dashboardInvalidIdentifier:
      'Failed to retrieve dashboard. Please make sure the dashboard exists and is accessible.',
  },
  errorBoxText: '$t(common:error): {{errorMessage}}',
  chartNoData: 'No Results',
};

export type TranslationDictionary = typeof translation;
