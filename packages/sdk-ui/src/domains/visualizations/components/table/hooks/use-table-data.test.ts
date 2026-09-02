/* eslint-disable @typescript-eslint/no-non-null-assertion */

/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { createAttribute, filterFactory, QueryResultData } from '@sisense/sdk-data';
import { renderHook, waitFor } from '@testing-library/react';

import {
  executeQueryMock,
  executeQueryWithRowCountMock,
} from '@/domains/query-execution/core/__mocks__/execute-query';
import { type ClientApplication } from '@/infra/app/types';
import { useSisenseContextMock } from '@/infra/contexts/sisense-context/__mocks__/sisense-context';
import { SisenseContextPayload } from '@/infra/contexts/sisense-context/sisense-context';
import { useSetErrorMock } from '@/infra/error-boundary/__mocks__/use-set-error';

import { useTableData } from './use-table-data';

vi.mock('@/domains/query-execution/core/execute-query');
vi.mock('@/infra/contexts/sisense-context/sisense-context');
vi.mock('@/infra/error-boundary/use-set-error');

describe('useTableData', () => {
  const col1 = { name: 'AgeRange', type: 'string' };
  const col2 = { name: 'Cost', type: 'number' };
  const dataSet = {
    columns: [col1, col2],
    rows: [
      [{ data: '0-18' }, { data: 1000 }],
      [{ data: '19-28' }, { data: 19.123 }],
      [{ data: '29-35' }, { data: 125 }],
    ],
  };

  const staticProps = {
    dataSet,
    dataOptions: null,
    dataColumnNamesMapping: {},
    filters: undefined,
    filterRelations: undefined,
    count: 0,
    offset: 0,
  };

  const fetchProps = {
    dataSet: 'Sample ECommerce',
    dataOptions: {
      columns: [],
    },
    dataColumnNamesMapping: {},
    filters: undefined,
    filterRelations: undefined,
    count: 2,
    offset: 0,
  };
  const fetchMoreProps = {
    dataSet: 'Sample ECommerce',
    dataOptions: {
      columns: [],
    },
    dataColumnNamesMapping: {},
    filters: undefined,
    filterRelations: undefined,
    count: 2,
    offset: 2,
  };

  const defaultSisenseContext: SisenseContextPayload = {
    app: {
      httpClient: {},
      settings: {
        queryLimit: 20000,
        queryCacheConfig: { enabled: false },
      },
    } as ClientApplication,
    isInitialized: true,
    tracking: {
      enabled: false,
      packageName: 'sdk-ui',
    },
    errorBoundary: {
      showErrorBox: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useSisenseContextMock.mockReturnValue(defaultSisenseContext);
  });

  it('should use static data', () => {
    const { result } = renderHook(useTableData, {
      initialProps: staticProps,
    });

    const { data, dataOptions, loadedRowRange, rowCount } = result.current;
    expect(data).toBe(dataSet);
    expect(dataOptions).toBeNull();
    expect(loadedRowRange).toBeNull();
    expect(rowCount).toBeUndefined();
  });

  it('should fetch data successfully', async () => {
    const mockData: QueryResultData = dataSet;
    executeQueryMock.mockResolvedValue(mockData);

    const { result } = renderHook(useTableData, {
      initialProps: fetchProps,
    });

    const { data, dataOptions } = result.current;
    expect(data).toBeNull();
    expect(dataOptions).toBe(fetchProps.dataOptions);

    await waitFor(() => {
      const { data: data2, dataOptions: dataOptions2, loadedRowRange } = result.current;
      expect(data2).not.toBeNull();

      const { columns, rows } = data2!;
      expect(columns.length).toBe(dataSet.columns.length);
      expect(rows.length).toBe(Math.min(fetchProps.count, dataSet.rows.length));
      expect(dataOptions2).toBe(fetchProps.dataOptions);
      expect(loadedRowRange).toEqual({ start: 0, end: rows.length });
    });
  });

  it('should fetch more data successfully', async () => {
    const mockData: QueryResultData = dataSet;
    executeQueryMock.mockResolvedValue(mockData);

    const { result, rerender } = renderHook(useTableData, {
      initialProps: fetchProps,
    });

    const { data, dataOptions } = result.current;
    expect(data).toBeNull();
    expect(dataOptions).toBe(fetchProps.dataOptions);

    setTimeout(() => {
      rerender(fetchMoreProps);
    }, 0);

    await waitFor(() => {
      const { data: data2, dataOptions: dataOptions2 } = result.current;
      expect(data2).not.toBeNull();

      const { columns, rows } = data2!;
      expect(columns.length).toBe(dataSet.columns.length);
      expect(rows.length).toBe(
        Math.min(fetchProps.count, dataSet.rows.length, fetchMoreProps.offset) +
          Math.min(fetchMoreProps.count, dataSet.rows.length),
      );
      expect(dataOptions2).toBe(fetchMoreProps.dataOptions);
    });
  });

  it('should not fetch when there is no more data', async () => {
    const fetchAllProps = {
      ...fetchProps,
      count: 3,
    };

    const mockData: QueryResultData = dataSet;
    executeQueryMock.mockResolvedValue(mockData);

    const { result, rerender } = renderHook(useTableData, {
      initialProps: fetchAllProps,
    });

    const { data, dataOptions } = result.current;
    expect(data).toBeNull();
    expect(dataOptions).toBe(fetchAllProps.dataOptions);

    await waitFor(() => {
      expect(result.current.loadedRowRange).toEqual({ start: 0, end: dataSet.rows.length });
    });

    // A sequential continuation (offset === the loaded window's end) is skipped once
    // the previous fetch established there is no more data ahead.
    const sequentialContinuationProps = {
      ...fetchAllProps,
      offset: dataSet.rows.length,
    };
    executeQueryMock.mockClear();

    setTimeout(() => {
      rerender(sequentialContinuationProps);
    }, 0);

    await waitFor(() => {
      const { data: data2, dataOptions: dataOptions2 } = result.current;
      expect(data2).not.toBeNull();

      const { columns, rows } = data2!;
      expect(columns.length).toBe(dataSet.columns.length);
      expect(rows.length).toBe(Math.min(fetchAllProps.count, dataSet.rows.length));
      expect(dataOptions2).toBe(fetchAllProps.dataOptions);
    });
    expect(executeQueryMock).not.toHaveBeenCalled();
  });

  it('still fetches a jump to a different offset even after data is exhausted', async () => {
    const fetchAllProps = {
      ...fetchProps,
      count: 3,
    };

    const mockData: QueryResultData = dataSet;
    executeQueryMock.mockResolvedValue(mockData);

    const { result, rerender } = renderHook(useTableData, {
      initialProps: fetchAllProps,
    });

    await waitFor(() => {
      expect(result.current.loadedRowRange).toEqual({ start: 0, end: dataSet.rows.length });
    });

    executeQueryMock.mockClear();
    // offset 2 is not the loaded window's end (3) - a jump, not a sequential continuation.
    rerender({ ...fetchAllProps, offset: 2 });

    await waitFor(() => {
      expect(executeQueryMock).toHaveBeenCalled();
    });
  });

  it('still fetches after filters change even when the previous (empty) query left the loaded window ending at the reset offset', async () => {
    executeQueryMock.mockResolvedValueOnce({ columns: [], rows: [] });

    const { result, rerender } = renderHook(useTableData, {
      initialProps: fetchProps,
    });

    await waitFor(() => {
      expect(result.current.loadedRowRange).toEqual({ start: 0, end: 0 });
    });

    executeQueryMock.mockClear();
    executeQueryMock.mockResolvedValue(dataSet);

    // New filters reset offset back to 0, which equals the exhausted window's end (0) —
    // a naive check would mistake this for a sequential continuation and skip the fetch.
    const newFilter = filterFactory.members(
      createAttribute({ name: 'AgeRange', expression: '[Commerce.AgeRange]' }),
      ['0-18'],
    );
    rerender({ ...fetchProps, filters: [newFilter] });

    await waitFor(() => {
      expect(executeQueryMock).toHaveBeenCalled();
    });
  });

  it('should handle query error', async () => {
    const mockData: QueryResultData = { columns: [], rows: [] };
    executeQueryMock.mockResolvedValue(mockData);

    const mockSetError = vi.fn();
    useSetErrorMock.mockImplementation(() => mockSetError);

    const mockError = new Error('Test error');
    executeQueryMock.mockRejectedValue(mockError);

    const { result } = renderHook(useTableData, {
      initialProps: fetchProps,
    });

    const { data, dataOptions } = result.current;
    expect(data).toBeNull();
    expect(dataOptions).toBe(fetchProps.dataOptions);

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalled();
      expect(mockSetError).toHaveBeenCalledWith(mockError);

      const { data: data2, dataOptions: dataOptions2 } = result.current;
      expect(data2).toBeNull();
      expect(dataOptions2).toBe(fetchProps.dataOptions);
    });
  });

  describe('includeTotalRows', () => {
    const fetchWithTotalRowsProps = {
      ...fetchProps,
      includeTotalRows: true,
    };

    it('fetches the row count alongside the data and exposes it', async () => {
      const mockData: QueryResultData = dataSet;
      executeQueryWithRowCountMock.mockResolvedValue({ data: mockData, rowCount: 42 });

      const { result } = renderHook(useTableData, {
        initialProps: fetchWithTotalRowsProps,
      });

      await waitFor(() => {
        expect(result.current.data).not.toBeNull();
        expect(result.current.rowCount).toBe(42);
      });
      expect(executeQueryWithRowCountMock).toHaveBeenCalled();
      expect(executeQueryMock).not.toHaveBeenCalled();
    });

    it('leaves rowCount undefined when the server does not support it', async () => {
      const mockData: QueryResultData = dataSet;
      executeQueryWithRowCountMock.mockResolvedValue({ data: mockData, rowCount: undefined });

      const { result } = renderHook(useTableData, {
        initialProps: fetchWithTotalRowsProps,
      });

      await waitFor(() => {
        expect(result.current.data).not.toBeNull();
      });
      expect(result.current.rowCount).toBeUndefined();
    });

    it('resets rowCount to undefined when the flag is turned off', async () => {
      const mockData: QueryResultData = dataSet;
      executeQueryWithRowCountMock.mockResolvedValue({ data: mockData, rowCount: 42 });

      const { result, rerender } = renderHook(useTableData, {
        initialProps: fetchWithTotalRowsProps,
      });

      await waitFor(() => {
        expect(result.current.rowCount).toBe(42);
      });

      executeQueryMock.mockResolvedValue(mockData);
      rerender({ ...fetchProps, includeTotalRows: false });

      await waitFor(() => {
        expect(result.current.rowCount).toBeUndefined();
      });
    });
  });

  describe('jumping to a non-contiguous offset', () => {
    it('replaces the loaded window instead of appending', async () => {
      const firstBatch: QueryResultData = dataSet;
      executeQueryMock.mockResolvedValue(firstBatch);

      const { result, rerender } = renderHook(useTableData, {
        initialProps: fetchProps,
      });

      await waitFor(() => {
        expect(result.current.loadedRowRange).toEqual({ start: 0, end: 2 });
      });

      const secondBatch: QueryResultData = {
        columns: dataSet.columns,
        rows: [[{ data: 'X' }, { data: 1 }]],
      };
      executeQueryMock.mockResolvedValue(secondBatch);

      // offset 10 does not equal the loaded window's end (2), so this is a jump
      rerender({ ...fetchProps, offset: 10 });

      await waitFor(() => {
        expect(result.current.loadedRowRange).toEqual({ start: 10, end: 11 });
        expect(result.current.data?.rows).toEqual(secondBatch.rows);
      });
    });
  });
});
