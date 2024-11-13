/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { renderHook, waitFor } from '@testing-library/react';
import { useTableData } from './use-table-data';
import { executeQueryMock } from '../../query/__mocks__/execute-query';
import { QueryResultData } from '@sisense/sdk-data';
import { ClientApplication } from '../../app/client-application';
import { useSisenseContextMock } from '../../sisense-context/__mocks__/sisense-context';
import { SisenseContextPayload } from '@/sisense-context/sisense-context';
import { useSetErrorMock } from '../../error-boundary/__mocks__/use-set-error';

vi.mock('../../query/execute-query');
vi.mock('../../sisense-context/sisense-context');
vi.mock('../../error-boundary/use-set-error');

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

    const [data, dataOptions] = result.current;
    expect(data).toBe(dataSet);
    expect(dataOptions).toBeNull();
  });

  it('should fetch data successfully', async () => {
    const mockData: QueryResultData = dataSet;
    executeQueryMock.mockResolvedValue(mockData);

    const { result } = renderHook(useTableData, {
      initialProps: fetchProps,
    });

    const [data, dataOptions] = result.current;
    expect(data).toBeNull();
    expect(dataOptions).toBe(fetchProps.dataOptions);

    await waitFor(() => {
      const [data2, dataOptions2] = result.current;
      expect(data2).not.toBeNull();

      const { columns, rows } = data2!;
      expect(columns.length).toBe(dataSet.columns.length);
      expect(rows.length).toBe(Math.min(fetchProps.count, dataSet.rows.length));
      expect(dataOptions2).toBe(fetchProps.dataOptions);
    });
  });

  it('should fetch more data successfully', async () => {
    const mockData: QueryResultData = dataSet;
    executeQueryMock.mockResolvedValue(mockData);

    const { result, rerender } = renderHook(useTableData, {
      initialProps: fetchProps,
    });

    const [data, dataOptions] = result.current;
    expect(data).toBeNull();
    expect(dataOptions).toBe(fetchProps.dataOptions);

    setTimeout(() => {
      rerender(fetchMoreProps);
    }, 0);

    await waitFor(() => {
      const [data2, dataOptions2] = result.current;
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

    const [data, dataOptions] = result.current;
    expect(data).toBeNull();
    expect(dataOptions).toBe(fetchAllProps.dataOptions);

    setTimeout(() => {
      rerender(fetchMoreProps);
    }, 0);

    await waitFor(() => {
      const [data2, dataOptions2] = result.current;
      expect(data2).not.toBeNull();

      const { columns, rows } = data2!;
      expect(columns.length).toBe(dataSet.columns.length);
      expect(rows.length).toBe(Math.min(fetchAllProps.count, dataSet.rows.length));
      expect(dataOptions2).toBe(fetchAllProps.dataOptions);
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

    const [data, dataOptions] = result.current;
    expect(data).toBeNull();
    expect(dataOptions).toBe(fetchProps.dataOptions);

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalled();
      expect(mockSetError).toHaveBeenCalledWith(mockError);

      const [data2, dataOptions2] = result.current;
      expect(data2).toBeNull();
      expect(dataOptions2).toBe(fetchProps.dataOptions);
    });
  });
});
