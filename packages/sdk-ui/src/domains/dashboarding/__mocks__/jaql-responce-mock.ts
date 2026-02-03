export const totalCostByAgeRangeJaqlResult = {
  headers: ['Age Range', '$measure0_Total Cost'],
  metadata: [
    {
      jaql: {
        datatype: 'text',
        dim: '[Commerce.Age Range]',
        title: 'Age Range',
      },
    },
    {
      jaql: {
        agg: 'sum',
        datatype: 'numeric',
        dim: '[Commerce.Cost]',
        title: '$measure0_Total Cost',
      },
    },
  ],
  datasource: {
    revisionId: 'TBD',
    fullname: 'LocalHost/Sample ECommerce',
  },
  processingInfo: {
    cacheType: 'result',
    cacheTime: '2025-01-21T14:13:33.680Z',
  },
  translationInfo: {
    translationServiceProvider: 'NewTranslationService',
    isTranslationFallback: false,
    isQueryFallback: false,
    translationDuration: 0.0,
    sqlFromCache: true,
  },
  values: [
    [
      {
        data: '0-18',
        text: '0-18',
      },
      {
        data: 4319951.642637288,
        text: '4319951.64263729',
      },
    ],
    [
      {
        data: '19-24',
        text: '19-24',
      },
      {
        data: 8656480.951007009,
        text: '8656480.95100701',
      },
    ],
    [
      {
        data: '25-34',
        text: '25-34',
      },
      {
        data: 2.118535045013156e7,
        text: '21185350.4501316',
      },
    ],
    [
      {
        data: '35-44',
        text: '35-44',
      },
      {
        data: 2.3642475964069825e7,
        text: '23642475.9640698',
      },
    ],
    [
      {
        data: '45-54',
        text: '45-54',
      },
      {
        data: 2.038855295629768e7,
        text: '20388552.9562977',
      },
    ],
    [
      {
        data: '55-64',
        text: '55-64',
      },
      {
        data: 1.1818733606352553e7,
        text: '11818733.6063526',
      },
    ],
    [
      {
        data: '65+',
        text: '65+',
      },
      {
        data: 1.7260993425238084e7,
        text: '17260993.4252381',
      },
    ],
  ],
};
