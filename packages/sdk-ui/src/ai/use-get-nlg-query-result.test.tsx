import { server } from '@/__mocks__/msw';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { MockApiWrapper } from './__mocks__';
import { useGetNlgQueryResult, UseGetNlgQueryResultParams } from './use-get-nlg-query-result';
import { GetNlgQueryResultRequest, GetNlgQueryResultResponse } from './api/types';

const mockNlgRequest: GetNlgQueryResultRequest = {
  jaql: {
    datasource: {
      title: 'My Data Source',
    },
    metadata: [],
  },
  style: 'Large',
};

const mockNlgResponse: GetNlgQueryResultResponse = {
  responseType: 'Text',
  data: {
    answer: 'This is a summary',
  },
};

const renderHookWithWrapper = (params: UseGetNlgQueryResultParams) => {
  return renderHook(() => useGetNlgQueryResult(params), { wrapper: MockApiWrapper });
};

describe('useGetNlgQueryResult', () => {
  beforeEach(() => {
    server.use(http.post('*/api/v2/ai/nlg/queryResult', () => HttpResponse.json(mockNlgResponse)));
  });

  it('returns data when successful', async () => {
    expect.assertions(2);

    const { result } = renderHookWithWrapper(mockNlgRequest);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBe('This is a summary');
  });

  it('when disabled, data is not present, but triggering refetch() returns data', async () => {
    expect.assertions(6);

    const { result } = renderHookWithWrapper({
      ...mockNlgRequest,
      enabled: false,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(true));
    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));

    expect(result.current.data).toBeUndefined();

    result.current.refetch();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBe('This is a summary');
  });
});
