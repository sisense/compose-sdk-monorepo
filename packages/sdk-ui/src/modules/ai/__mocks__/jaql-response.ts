const MOCK_JAQL_RESPONSE = {
  headers: ['years in Date', 'total of Revenue'],
  metadata: [
    {
      jaql: {
        datatype: 'datetime',
        level: 'years',
        column: 'Date',
        dim: '[Commerce.Date]',
        title: 'years in Date',
        table: 'Commerce',
      },
      format: {
        mask: {
          months: 'M-yy',
          weeks: 'ww yyyy',
          minutes: 'HH:mm',
          quarters: 'yyyy Q',
          days: 'shortDate',
          isdefault: true,
          years: 'yyyy',
        },
      },
      panel: 'columns',
    },
    {
      jaql: {
        context: {
          '[d6fb]': {
            column: 'Revenue',
            dim: '[Commerce.Revenue]',
            table: 'Commerce',
          },
        },
        formula: 'sum([d6fb])',
        type: 'measure',
        title: 'total of Revenue',
      },
      panel: 'measures',
    },
  ],
  datasource: {
    revisionId: 'TBD',
    fullname: 'LocalHost/Sample ECommerce',
  },
  processingInfo: {
    cacheType: 'result',
    cacheTime: '2024-02-26T19:50:22.589Z',
  },
  translationInfo: {
    translationServiceProvider: 'NewTranslationService',
    isTranslationFallback: false,
    isQueryFallback: false,
    translationDuration: 0.001,
    sqlFromCache: true,
  },
  values: [
    [
      {
        data: '2009-01-01T00:00:00',
        text: '2009',
      },
      {
        data: 426752.64145070314,
        text: '426752.641450703',
      },
    ],
    [
      {
        data: '2010-01-01T00:00:00',
        text: '2010',
      },
      {
        data: 4685727.388944754,
        text: '4685727.38894475',
      },
    ],
    [
      {
        data: '2011-01-01T00:00:00',
        text: '2011',
      },
      {
        data: 5637641.021190114,
        text: '5637641.02119011',
      },
    ],
    [
      {
        data: '2012-01-01T00:00:00',
        text: '2012',
      },
      {
        data: 14530194.038532443,
        text: '14530194.0385324',
      },
    ],
    [
      {
        data: '2013-01-01T00:00:00',
        text: '2013',
      },
      {
        data: 14479310.424909197,
        text: '14479310.4249092',
      },
    ],
  ],
};

export default MOCK_JAQL_RESPONSE;
