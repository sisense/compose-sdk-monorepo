import { EMPTY_PIVOT_QUERY_RESULT_DATA } from '@sisense/sdk-data';
import { type JaqlQueryPayload, type QueryExecutionConfig } from '@sisense/sdk-query-client';
import { renderHook, waitFor } from '@testing-library/react';

import { executePivotQueryMock } from '@/domains/query-execution/core/__mocks__/execute-query';
import { translatePivotTableDataOptions } from '@/domains/visualizations/core/chart-data-options/translate-data-options';
import { ClientApplication } from '@/infra/app/client-application';
import { useSisenseContextMock } from '@/infra/contexts/sisense-context/__mocks__/sisense-context';

import { mockPivotTableProps } from '../__mocks__/mocks';
import { usePivotTableQuery } from './use-get-pivot-table-query';

vi.mock('@/domains/query-execution/core/execute-query');
vi.mock('@/infra/contexts/sisense-context/sisense-context');

const usePivotTableQueryPropsMock = {
  dataSet: mockPivotTableProps.dataSet,
  dataOptionsInternal: translatePivotTableDataOptions(mockPivotTableProps.dataOptions),
  filters: mockPivotTableProps.filters,
};

describe('usePivotTableQuery', () => {
  beforeEach(() => {
    executePivotQueryMock.mockClear();
    useSisenseContextMock.mockReturnValue({
      app: { settings: { trackingConfig: { enabled: false } } } as ClientApplication,
      isInitialized: true,
    });
  });

  it('should run the hook', async () => {
    const jaqlMock = { someProp: 'some pivot query prop value' } as unknown as JaqlQueryPayload;

    executePivotQueryMock.mockImplementation(async (...args: any) => {
      const onBeforeQuery: QueryExecutionConfig['onBeforeQuery'] = args[2]?.onBeforeQuery;
      if (onBeforeQuery) {
        onBeforeQuery(jaqlMock);
      }
      return EMPTY_PIVOT_QUERY_RESULT_DATA;
    });

    const { result } = renderHook(() => usePivotTableQuery(usePivotTableQueryPropsMock));

    await waitFor(() => {
      expect(result.current.jaql).toBe(jaqlMock);
      expect(result.current.error).toBeUndefined();
    });
  });

  it('should handle query error', async () => {
    const mockError = new Error('Test error');
    executePivotQueryMock.mockRejectedValue(mockError);

    const { result } = renderHook(() => usePivotTableQuery(usePivotTableQueryPropsMock));

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
      expect(result.current.jaql).toBeUndefined();
    });
  });
});
