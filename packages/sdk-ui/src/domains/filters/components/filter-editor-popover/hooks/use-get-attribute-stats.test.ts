import type { QueryResultData } from '@sisense/sdk-data';
import { createAttribute, filterFactory, measureFactory } from '@sisense/sdk-data';
import { renderHook } from '@testing-library/react';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { useExecuteQueryInternal } from '@/domains/query-execution/hooks/use-execute-query/use-execute-query';
import type { ExecuteQueryResult } from '@/domains/query-execution/types';

import { useGetAttributeStats } from './use-get-attribute-stats.js';

vi.mock('@/domains/query-execution/hooks/use-execute-query/use-execute-query', () => ({
  useExecuteQueryInternal: vi.fn(),
}));

const useExecuteQueryInternalMock = vi.mocked(useExecuteQueryInternal);

const queryResult = (row: QueryResultData['rows'][number]): QueryResultData => ({
  columns: [],
  rows: [row],
});

const queryControls = { refetch: vi.fn(), loadMore: vi.fn(), isAllItemsLoaded: true };

const successState = (data: QueryResultData): ExecuteQueryResult => ({
  isLoading: false,
  isError: false,
  isSuccess: true,
  error: undefined,
  data,
  status: 'success',
  ...queryControls,
});

const loadingState = (): ExecuteQueryResult => ({
  isLoading: true,
  isError: false,
  isSuccess: false,
  error: undefined,
  data: undefined,
  status: 'loading',
  ...queryControls,
});

const errorState = (error: Error): ExecuteQueryResult => ({
  isLoading: false,
  isError: true,
  isSuccess: false,
  error,
  data: undefined,
  status: 'error',
  ...queryControls,
});

const mockQueryState = (state: ExecuteQueryResult) =>
  useExecuteQueryInternalMock.mockReturnValue(state);

describe('useGetAttributeStats', () => {
  beforeEach(() => {
    useExecuteQueryInternalMock.mockReset();
  });

  it('should query count, min and max for a date attribute', () => {
    mockQueryState(
      successState(
        queryResult([
          { data: 42, text: '42' },
          { data: '2010-01-01T00:00:00', text: '2010' },
          { data: '2013-12-31T00:00:00', text: '2013' },
        ]),
      ),
    );

    const { result } = renderHook(() =>
      useGetAttributeStats({ attribute: DM.Commerce.Date.Days, enabled: true }),
    );

    expect(useExecuteQueryInternalMock).toHaveBeenCalledWith(
      expect.objectContaining({
        measures: [
          measureFactory.countDistinct(DM.Commerce.Date.Days),
          measureFactory.min(DM.Commerce.Date.Days),
          measureFactory.max(DM.Commerce.Date.Days),
        ],
        enabled: true,
      }),
    );
    expect(result.current.data).toEqual({
      count: 42,
      min: '2010-01-01T00:00:00',
      max: '2013-12-31T00:00:00',
    });
  });

  it('should query only the count for a text attribute', () => {
    mockQueryState(successState(queryResult([{ data: 2, text: '2' }])));

    const { result } = renderHook(() => useGetAttributeStats({ attribute: DM.Commerce.Gender }));

    expect(useExecuteQueryInternalMock).toHaveBeenCalledWith(
      expect.objectContaining({ measures: [measureFactory.countDistinct(DM.Commerce.Gender)] }),
    );
    expect(result.current.data).toEqual({ count: 2 });
  });

  it('should omit min and max when the result has no such cells', () => {
    mockQueryState(successState(queryResult([{ data: 0, text: '0' }])));

    const { result } = renderHook(() => useGetAttributeStats({ attribute: DM.Commerce.Cost }));

    expect(result.current.data).toEqual({ count: 0 });
  });

  it('should pass the filters to the query', () => {
    mockQueryState(loadingState());
    const parentFilters = [filterFactory.members(DM.Commerce.Gender, ['Female'])];

    renderHook(() =>
      useGetAttributeStats({ attribute: DM.Commerce.Date.Days, filters: parentFilters }),
    );

    expect(useExecuteQueryInternalMock).toHaveBeenCalledWith(
      expect.objectContaining({ filters: parentFilters }),
    );
  });

  it("should use the attribute's own data source over the default one", () => {
    mockQueryState(loadingState());

    renderHook(() =>
      useGetAttributeStats({ attribute: DM.Commerce.Date.Days, defaultDataSource: 'Other' }),
    );

    expect(useExecuteQueryInternalMock).toHaveBeenCalledWith(
      expect.objectContaining({ dataSource: expect.objectContaining({ title: DM.DataSource }) }),
    );
  });

  it('should fall back to the default data source when the attribute has none', () => {
    mockQueryState(loadingState());
    const attributeWithoutDataSource = createAttribute({
      name: 'Cost',
      type: 'numeric-attribute',
      expression: '[Commerce.Cost]',
    });

    renderHook(() =>
      useGetAttributeStats({
        attribute: attributeWithoutDataSource,
        defaultDataSource: 'Other',
      }),
    );

    expect(useExecuteQueryInternalMock).toHaveBeenCalledWith(
      expect.objectContaining({ dataSource: 'Other' }),
    );
  });

  it('should report no data and pass the query state through while loading', () => {
    mockQueryState(loadingState());

    const { result } = renderHook(() => useGetAttributeStats({ attribute: DM.Commerce.Date.Days }));

    expect(result.current).toEqual({
      isLoading: true,
      isError: false,
      isSuccess: false,
      error: undefined,
      data: undefined,
    });
  });

  it('should pass a query error through', () => {
    const error = new Error('query failed');
    mockQueryState(errorState(error));

    const { result } = renderHook(() => useGetAttributeStats({ attribute: DM.Commerce.Date.Days }));

    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(error);
    expect(result.current.data).toBeUndefined();
  });
});
