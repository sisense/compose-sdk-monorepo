import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { server } from '@/__mocks__/msw';
import { ChartWidgetProps, TableWidgetProps } from '@/props';

import { AiTestWrapper } from './__mocks__';
import {
  MOCK_QUERY_REC_PARAMS,
  MOCK_QUERY_REC_RESPONSE,
} from './__mocks__/query-reccomendation-mock';
import {
  useGetQueryRecommendations,
  UseGetQueryRecommendationsParams,
} from './use-get-query-recommendations';

const renderHookWithWrapper = (params: UseGetQueryRecommendationsParams) => {
  return renderHook(() => useGetQueryRecommendations(params), { wrapper: AiTestWrapper });
};

describe('useGetQueryRecommendations', () => {
  beforeEach(() => {
    server.use(
      http.get('*/api/v2/ai/recommendations/query/My%20Data%20Source/2', () =>
        HttpResponse.json(MOCK_QUERY_REC_RESPONSE),
      ),
    );
  });

  it('returns data when successful', async () => {
    const { result } = renderHookWithWrapper(MOCK_QUERY_REC_PARAMS);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data?.length).toBe(MOCK_QUERY_REC_PARAMS.count);

      const widget1 = result.current.data![0].widgetProps as ChartWidgetProps;
      expect(widget1.title).toBe('total of Revenue by Brand');

      const widget2 = result.current.data![1].widgetProps as TableWidgetProps;
      expect(widget2.title).toBe('total of Revenue by Category');
    });
  });

  it('returns error when unsuccessful', async () => {
    server.use(
      http.get('*/api/v2/ai/recommendations/query/My%20Data%20Source/2', () =>
        HttpResponse.error(),
      ),
    );

    const { result } = renderHookWithWrapper(MOCK_QUERY_REC_PARAMS);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeDefined();
      expect(result.current.isSuccess).toBe(false);
    });
  });

  it('when disabled, data is not present, but triggering refetch() returns data', async () => {
    const { result } = renderHookWithWrapper({
      ...MOCK_QUERY_REC_PARAMS,
      enabled: false,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });

    result.current.refetch();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data?.length).toBe(MOCK_QUERY_REC_PARAMS.count);

      const widget1 = result.current.data![0].widgetProps as ChartWidgetProps;
      expect(widget1.title).toBe('total of Revenue by Brand');

      const widget2 = result.current.data![1].widgetProps as TableWidgetProps;
      expect(widget2.title).toBe('total of Revenue by Category');
    });
  });
});
