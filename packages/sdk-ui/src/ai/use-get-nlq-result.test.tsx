import { server } from '@/__mocks__/msw';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { AiTestWrapper } from './__mocks__';
import { useGetNlqResult, UseGetNlqResultParams } from './use-get-nlq-result';
import { ChartWidgetProps } from '@/props';
import { MOCK_NLQ_RESULT_PARAMS, MOCK_NLQ_RESULT_RESPONSE } from './__mocks__/get-nlq-result-mock';

const renderHookWithWrapper = (params: UseGetNlqResultParams) => {
  return renderHook(() => useGetNlqResult(params), { wrapper: AiTestWrapper });
};

describe('useGetNlqResult', () => {
  beforeEach(() => {
    server.use(
      http.post('*/ai/nlq/query/My%20Data%20Source', () =>
        HttpResponse.json(MOCK_NLQ_RESULT_RESPONSE),
      ),
    );
  });

  it('returns data when successful', async () => {
    const { result } = renderHookWithWrapper(MOCK_NLQ_RESULT_PARAMS);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data?.id).toBe(MOCK_NLQ_RESULT_RESPONSE.widgetProps?.id);
      expect(result.current.data?.widgetType).toBe(
        MOCK_NLQ_RESULT_RESPONSE.widgetProps?.widgetType,
      );
      expect(result.current.isLoading).toBe(false);
    });

    const resultWidgetProps = result.current.data as ChartWidgetProps;
    expect(resultWidgetProps.title).toBe('total of Revenue by Condition');
  });

  it('allows data source with type to be specified', async () => {
    const { result } = renderHookWithWrapper({
      ...MOCK_NLQ_RESULT_PARAMS,
      dataSource: { title: 'My Data Source', type: 'live' },
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data?.id).toBe(MOCK_NLQ_RESULT_RESPONSE.widgetProps?.id);
      expect(result.current.data?.widgetType).toBe(
        MOCK_NLQ_RESULT_RESPONSE.widgetProps?.widgetType,
      );
      expect(result.current.isLoading).toBe(false);
    });

    const resultWidgetProps = result.current.data as ChartWidgetProps;
    expect(resultWidgetProps.title).toBe('total of Revenue by Condition');
  });

  it('returns error when unsuccessful', async () => {
    server.use(http.post('*/ai/nlq/query/My%20Data%20Source', () => HttpResponse.error()));

    const { result } = renderHookWithWrapper(MOCK_NLQ_RESULT_PARAMS);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeDefined();
      expect(result.current.isSuccess).toBe(false);
    });
  });

  it('when disabled, data is not present, but triggering refetch() returns data', async () => {
    const { result } = renderHookWithWrapper({
      ...MOCK_NLQ_RESULT_PARAMS,
      enabled: false,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.data).toBeUndefined();
    });

    result.current.refetch();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data?.id).toBe(MOCK_NLQ_RESULT_RESPONSE.widgetProps?.id);
      expect(result.current.data?.widgetType).toBe(
        MOCK_NLQ_RESULT_RESPONSE.widgetProps?.widgetType,
      );
      expect(result.current.isSuccess).toBe(true);
    });

    const resultWidgetProps = result.current.data as ChartWidgetProps;
    expect(resultWidgetProps.title).toBe('total of Revenue by Condition');
  });
});
