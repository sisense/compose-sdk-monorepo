import { renderHook, waitFor } from '@testing-library/react';
import type { Mock } from 'vitest';
import { QueryResultData } from '@sisense/sdk-data';
import {
  useExecuteQueryByWidgetId,
  ExecuteQueryByWidgetIdParams,
} from './use-execute-query-by-widget-id';
import { executeQuery } from '../../query/execute-query.js';
import { ClientApplication } from '../../app/client-application.js';
import { useSisenseContext } from '../sisense-context/sisense-context.js';
import { fetchWidget } from '../../dashboard-widget/fetch-widget';
import { BaseJaql, FilterJaql, WidgetDto } from '../../dashboard-widget/types.js';

vi.mock('../../query/execute-query', () => ({
  executeQuery: vi.fn(),
}));
vi.mock('../sisense-context/sisense-context', async () => {
  const actual: typeof import('../sisense-context/sisense-context.js') = await vi.importActual(
    '../sisense-context/sisense-context',
  );

  return {
    ...actual,
    useSisenseContext: vi.fn(),
  };
});
vi.mock('../../dashboard-widget/fetch-widget.ts', () => ({
  fetchWidget: vi.fn(),
}));

const executeQueryMock = executeQuery as Mock<
  Parameters<typeof executeQuery>,
  ReturnType<typeof executeQuery>
>;
const useSisenseContextMock = useSisenseContext as Mock<
  Parameters<typeof useSisenseContext>,
  ReturnType<typeof useSisenseContext>
>;
const fetchWidgetMock = fetchWidget as Mock<
  Parameters<typeof fetchWidget>,
  ReturnType<typeof fetchWidget>
>;

const mockWidget = {
  datasource: {
    title: 'Some elasticube',
  },
  metadata: {
    panels: [],
  },
} as unknown as WidgetDto;

describe('useExecuteQueryByWidgetId', () => {
  const params: ExecuteQueryByWidgetIdParams = {
    widgetOid: '64473e07dac1920034bce77f',
    dashboardOid: '6441e728dac1920034bce737',
  };

  beforeEach(() => {
    executeQueryMock.mockClear();
    fetchWidgetMock.mockClear();
    useSisenseContextMock.mockReturnValue({
      app: {} as ClientApplication,
      isInitialized: true,
      enableTracking: false,
    });
  });

  it('should fetch data successfully', async () => {
    const mockData: QueryResultData = { columns: [], rows: [] };
    executeQueryMock.mockResolvedValue(mockData);
    fetchWidgetMock.mockResolvedValue(mockWidget);

    const { result } = renderHook(() => useExecuteQueryByWidgetId(params));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toBe(mockData);
    });
  });

  it('should correctly generate query over the widget', async () => {
    const mockData: QueryResultData = { columns: [], rows: [] };
    const mockWidgetWithMetadataItems = {
      ...mockWidget,
      metadata: {
        panels: [
          {
            name: 'some panel with dimensions',
            items: [
              {
                jaql: {
                  title: 'some dimension title',
                  dim: 'some dimension',
                } as unknown as BaseJaql,
              },
            ],
          },
          {
            name: 'some panel with measures',
            items: [
              {
                jaql: {
                  title: 'some measure title',
                  dim: 'some measure',
                  agg: 'sum',
                } as unknown as BaseJaql,
              },
            ],
          },
          {
            name: 'some panel with filters',
            items: [
              {
                jaql: {
                  title: 'some fitler title',
                  dim: 'some filter',
                  filter: {
                    members: ['some member'],
                  },
                } as unknown as FilterJaql,
              },
            ],
          },
        ],
      },
    };
    executeQueryMock.mockResolvedValue(mockData);
    fetchWidgetMock.mockResolvedValue(mockWidgetWithMetadataItems);

    const { result } = renderHook(() => useExecuteQueryByWidgetId(params));

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      // verifies query dimensions
      expect(result.current.query?.dimensions?.length).toBe(1);
      expect((result.current.query?.dimensions?.[0].jaql(true) as BaseJaql).dim).toBe(
        mockWidgetWithMetadataItems.metadata.panels[0].items[0].jaql.dim,
      );
      // verifies query measures
      expect(result.current.query?.measures?.length).toBe(1);
      expect((result.current.query?.measures?.[0].jaql(true) as BaseJaql).dim).toBe(
        mockWidgetWithMetadataItems.metadata.panels[1].items[0].jaql.dim,
      );
      // verifies query filters
      expect(result.current.query?.filters?.length).toBe(1);
      expect((result.current.query?.filters?.[0].jaql(true) as FilterJaql).dim).toBe(
        mockWidgetWithMetadataItems.metadata.panels[2].items[0].jaql.dim,
      );
    });
  });

  it('should handle widget fetch error', async () => {
    const mockError = new Error('Widget fetch error');
    fetchWidgetMock.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useExecuteQueryByWidgetId(params));

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(mockError);
    });
  });

  it('should handle query data load error', async () => {
    const mockError = new Error('Data load error');
    executeQueryMock.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useExecuteQueryByWidgetId(params));

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(mockError);
    });
  });

  it('should handle widget translation error', async () => {
    fetchWidgetMock.mockResolvedValue({
      ...mockWidget,
      metadata: {
        panels: 123, // invalid widget object structure
      },
    } as unknown as WidgetDto);
    const { result } = renderHook(() => useExecuteQueryByWidgetId(params));

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBeDefined();
    });
  });

  it('should handle missing Sisense context', () => {
    useSisenseContextMock.mockReturnValue({ isInitialized: false, enableTracking: false });

    const { result } = renderHook(() => useExecuteQueryByWidgetId(params));

    expect(result.current.isError).toBe(true);
    expect(result.current.error?.message).toMatch(/Sisense Context .* not found/i);
  });
});
