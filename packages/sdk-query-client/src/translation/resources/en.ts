export const translation = {
  errors: {
    invalidAttribute:
      'Invalid attribute {{attributeName}}. Hint: attributes for query should be extracted from the data model generated by the CLI tool.',
    noDimensionsOrMeasures:
      'Neither dimensions nor measures found. Query should have at least one dimension or measure.',
    invalidMeasure:
      'Invalid measure "{{measureName}}". Hint: measures for the query can be constructed using the "measureFactory" functions.',
    invalidFilter:
      'Invalid filter "{{filterName}}". Hint: filters for the query can be constructed using the "filterFactory" functions.',
    invalidHighlight:
      'Invalid highlight "{{highlightName}}". Hint: highlights for the query can be constructed using the "filterFactory" functions.',
    invalidCountNegative: 'Invalid count "{{count}}". Count should be non-negative.',
    invalidOffset: 'Invalid offset "{{offset}}". Offset should be non-negative.',
    missingHttpClient: 'Query requires httpClient to work properly.',
    missingPostMethod: 'httpClient must provide "post" method.',
    noJaqlResponse: 'No jaql response received from the server',
    dataSourceNotFound:
      'Failed to get fields for data source "{{dataSource}}". Please make sure the data source exists and is accessible.',
  },
};

export type TranslationDictionary = typeof translation;
