import { createAttribute, measureFactory } from '@sisense/sdk-data';
import { QueryRecommendation } from '../api/types';
import { UseGetNlqResultParams } from '../use-get-nlq-result';

export const MOCK_NLQ_RESULT_PARAMS: UseGetNlqResultParams = {
  dataSource: {
    title: 'My Data Source',
    type: 'elasticube',
  },
  query: 'Show me total revenue by condition',
};

export const MOCK_NLQ_RESULT_RESPONSE: QueryRecommendation = {
  nlqPrompt: 'Show me total revenue by condition',
  jaql: {
    datasource: {
      title: 'My Data Source',
    },
    metadata: [
      {
        jaql: {
          dim: '[Commerce.Condition]',
          table: 'Commerce',
          column: 'Condition',
          datatype: 'text',
          title: 'Condition',
        },
        panel: 'rows',
      },
      {
        jaql: {
          type: 'measure',
          context: {
            ['d6fb']: {
              dim: '[Commerce.Revenue]',
              table: 'Commerce',
              column: 'Revenue',
            },
          },
          formula: "sum(['d6fb'])",
          title: 'total of Revenue',
        },
        panel: 'measures',
      },
    ],
  },
  chartRecommendations: {
    chartFamily: 'cartesian',
    chartType: 'bar',
    axesMapping: {
      category: [
        {
          name: 'Condition',
          type: 'string',
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
  queryTitle: 'total of Revenue by Condition',
  detailedDescription: 'total of [Commerce.Revenue] by [Commerce.Condition]',
  userMsg: '',
  clarification: '',
  widgetProps: {
    widgetType: 'chart',
    chartType: 'bar',
    id: 'total of Revenue by Condition',
    title: 'total of Revenue by Condition',
    dataSource: MOCK_NLQ_RESULT_PARAMS.dataSource,
    dataOptions: {
      category: [{ name: 'Condition', type: 'text-attribute' }],
      value: [
        measureFactory.sum(
          createAttribute({
            name: 'total of Revenue',
            expression: '[Commerce.Revenue]',
          }),
        ),
      ],
    },
  },
};
