import { server } from '@/__mocks__/msw';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { AiTestWrapper } from './__mocks__';
import { useGetNlgQueryResult, UseGetNlgQueryResultParams } from './use-get-nlg-query-result';
import { GetNlgQueryResultResponse } from './api/types';

const mockNlgParams: UseGetNlgQueryResultParams = {
  dataSource: 'My Data Source',
  dimensions: [],
};

const mockNlgResponse: GetNlgQueryResultResponse = {
  responseType: 'Text',
  data: {
    answer: 'This is a summary',
  },
};

const renderHookWithWrapper = (params: UseGetNlgQueryResultParams) => {
  return renderHook(() => useGetNlgQueryResult(params), { wrapper: AiTestWrapper });
};

describe('useGetNlgQueryResult', () => {
  beforeEach(() => {
    server.use(http.post('*/api/v2/ai/nlg/queryResult', () => HttpResponse.json(mockNlgResponse)));
  });

  it('returns data when successful', async () => {
    const { result } = renderHookWithWrapper(mockNlgParams);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBe('This is a summary');
  });

  it('allows data source with type to be specified', async () => {
    const { result } = renderHookWithWrapper({
      ...mockNlgParams,
      dataSource: { title: 'My Data Source', type: 'live' },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBe('This is a summary');
  });

  it('returns error when unsuccessful', async () => {
    server.use(http.post('*/api/v2/ai/nlg/queryResult', () => HttpResponse.error()));

    const { result } = renderHookWithWrapper(mockNlgParams);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeDefined();
    expect(result.current.isSuccess).toBe(false);
  });

  it('when disabled, data is not present, but triggering refetch() returns data', async () => {
    const { result } = renderHookWithWrapper({
      ...mockNlgParams,
      enabled: false,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(true));

    expect(result.current.data).toBeUndefined();

    result.current.refetch();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBe('This is a summary');
  });
});
