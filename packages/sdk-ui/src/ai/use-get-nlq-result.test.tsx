import { server } from '@/__mocks__/msw';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { AiTestWrapper } from './__mocks__';
import { QueryRecommendation } from './api/types';
import { useGetNlqResult, UseGetNlqResultParams } from './use-get-nlq-result';
import { ChartWidgetProps } from '@/props';

const mockNlqParams: UseGetNlqResultParams = {
  dataSource: 'My Data Source',
  query: 'Show me total revenue by condition',
};

const mockNlqResponse: QueryRecommendation = {
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
};

const renderHookWithWrapper = (params: UseGetNlqResultParams) => {
  return renderHook(() => useGetNlqResult(params), { wrapper: AiTestWrapper });
};

describe('useGetNlqResult', () => {
  beforeEach(() => {
    server.use(
      http.post('*/ai/nlq/query/My%20Data%20Source', () => HttpResponse.json(mockNlqResponse)),
    );
  });

  it('returns data when successful', async () => {
    const { result } = renderHookWithWrapper(mockNlqParams);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const resultWidgetProps = result.current.data as ChartWidgetProps;
    expect(resultWidgetProps.title).toBe('total of Revenue by Condition');
  });

  it('allows data source with type to be specified', async () => {
    const { result } = renderHookWithWrapper({
      ...mockNlqParams,
      dataSource: { title: 'My Data Source', type: 'live' },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const resultWidgetProps = result.current.data as ChartWidgetProps;
    expect(resultWidgetProps.title).toBe('total of Revenue by Condition');
  });

  it('returns error when unsuccessful', async () => {
    server.use(http.post('*/ai/nlq/query/My%20Data%20Source', () => HttpResponse.error()));

    const { result } = renderHookWithWrapper(mockNlqParams);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeDefined();
    expect(result.current.isSuccess).toBe(false);
  });

  it('when disabled, data is not present, but triggering refetch() returns data', async () => {
    const { result } = renderHookWithWrapper({
      ...mockNlqParams,
      enabled: false,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(true));

    expect(result.current.data).toBeUndefined();

    result.current.refetch();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const resultWidgetProps = result.current.data as ChartWidgetProps;
    expect(resultWidgetProps.title).toBe('total of Revenue by Condition');
  });
});
