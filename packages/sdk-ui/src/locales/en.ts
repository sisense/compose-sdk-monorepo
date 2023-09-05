export const translation = {
  errors: {
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
    },
  },
  common: {
    chartNoData: 'No Results',
  },
};
