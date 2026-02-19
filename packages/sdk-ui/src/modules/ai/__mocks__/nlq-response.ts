import { NlqResponseData } from '../api/types.js';

const MOCK_NLQ_RESPONSE = {
  nlqPrompt: 'revenue per year in column chart',
  jaql: {
    datasource: {
      title: 'Sample ECommerce',
    },
    metadata: [
      {
        jaql: {
          dim: '[Commerce.Date]',
          table: 'Commerce',
          column: 'Date',
          datatype: 'datetime',
          level: 'years',
          title: 'years in Date',
        },
        format: {
          mask: {
            days: 'shortDate',
            isdefault: true,
            minutes: 'HH:mm',
            months: 'M-yy',
            quarters: 'yyyy Q',
            weeks: 'ww yyyy',
            years: 'yyyy',
          },
        },
        panel: 'columns',
      },
      {
        jaql: {
          type: 'measure',
          context: {
            '[d6fb]': {
              dim: '[Commerce.Revenue]',
              table: 'Commerce',
              column: 'Revenue',
            },
          },
          formula: 'sum([d6fb])',
          title: 'total of Revenue',
        },
        panel: 'measures',
      },
    ],
  },
  chartRecommendations: {
    chartFamily: 'cartesian',
    chartType: 'column',
    axesMapping: {
      category: [
        {
          name: 'years in Date',
          type: 'date',
        },
      ],
      value: [
        {
          name: 'total of Revenue',
          type: 'number',
        },
      ],
    },
  },
  queryTitle: 'total of Revenue by years in Date',
  detailedDescription: 'total of [Commerce.Revenue] by years in [Commerce.Date]',
  followupQuestions: [
    'What is the total revenue per year?',
    'Which brand has the highest revenue per year?',
    'Which category has the highest revenue per year?',
    'What is the average revenue per year?',
    'How does the revenue per year vary by country?',
  ],
} as unknown as NlqResponseData;

export default MOCK_NLQ_RESPONSE;
