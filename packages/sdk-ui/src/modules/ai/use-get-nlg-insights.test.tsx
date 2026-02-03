import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { server } from '@/__mocks__/msw';

import { AiTestWrapper } from './__mocks__/index.js';
import { GetNlgInsightsResponse } from './api/types.js';
import { useGetNlgInsights, UseGetNlgInsightsParams } from './use-get-nlg-insights.js';

const mockNlgParams: UseGetNlgInsightsParams = {
  dataSource: 'My Data Source',
  dimensions: [],
};

const mockNlgResponse: GetNlgInsightsResponse = {
  responseType: 'Text',
  data: {
    answer: 'This is a summary',
  },
};

const renderHookWithWrapper = (params: UseGetNlgInsightsParams) => {
  return renderHook(() => useGetNlgInsights(params), { wrapper: AiTestWrapper });
};

describe('useGetNlgInsights', () => {
  beforeEach(() => {
    server.use(http.post('*/api/v2/ai/nlg/queryResult', () => HttpResponse.json(mockNlgResponse)));
  });

  it('returns data when successful', async () => {
    const { result } = renderHookWithWrapper(mockNlgParams);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toBe(mockNlgResponse.data?.answer);
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBe('This is a summary');
  });

  it('allows data source with type to be specified', async () => {
    const { result } = renderHookWithWrapper({
      ...mockNlgParams,
      dataSource: { title: 'My Data Source', type: 'live' },
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toBe(mockNlgResponse.data?.answer);
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBe('This is a summary');
  });

  it('returns error when unsuccessful', async () => {
    server.use(http.post('*/api/v2/ai/nlg/queryResult', () => HttpResponse.error()));

    const { result } = renderHookWithWrapper(mockNlgParams);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeDefined();
      expect(result.current.isSuccess).toBe(false);
    });
  });

  it('when disabled, data is not present, but triggering refetch() returns data', async () => {
    const { result } = renderHookWithWrapper({
      ...mockNlgParams,
      enabled: false,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
      expect(result.current.isSuccess).toBe(false);
    });

    result.current.refetch();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toBe(mockNlgResponse.data?.answer);
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBe('This is a summary');
  });
});
