/** @vitest-environment jsdom */
import { renderHook, waitFor } from '@testing-library/react';
import type { Mock } from 'vitest';
import {
  QueryResultData,
  filters as filtersFactory,
  DimensionalAttribute,
} from '@sisense/sdk-data';
import {
  useExecuteQueryByWidgetId,
  ExecuteQueryByWidgetIdParams,
  isParamsChanged,
} from './use-execute-query-by-widget-id';
import { executeQuery } from '../query/execute-query.js';
import { ClientApplication } from '../app/client-application.js';
import { useSisenseContext } from '../sisense-context/sisense-context.js';
import {
  BaseJaql,
  FilterJaql,
  IncludeMembersFilter,
  WidgetDto,
} from '../dashboard-widget/types.js';

vi.mock('../query/execute-query', () => ({
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
const getWidgetMock = vi.fn();
vi.mock('../api/rest-api', () => ({
  RestApi: class {
    getWidget = getWidgetMock;
  },
}));

const executeQueryMock = executeQuery as Mock<
  Parameters<typeof executeQuery>,
  ReturnType<typeof executeQuery>
>;
const useSisenseContextMock = useSisenseContext as Mock<
  Parameters<typeof useSisenseContext>,
  ReturnType<typeof useSisenseContext>
>;

const mockWidget = {
  datasource: {
    title: 'Some elasticube',
  },
  metadata: {
    panels: [],
  },
} as unknown as WidgetDto;

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
              title: 'some filter title',
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

describe('useExecuteQueryByWidgetId', () => {
  const params: ExecuteQueryByWidgetIdParams = {
    widgetOid: '64473e07dac1920034bce77f',
    dashboardOid: '6441e728dac1920034bce737',
  };

  beforeEach(() => {
    executeQueryMock.mockClear();
    getWidgetMock.mockClear();
    useSisenseContextMock.mockReturnValue({
      app: {} as ClientApplication,
      isInitialized: true,
      enableTracking: false,
    });
  });

  it('should fetch data successfully', async () => {
    const mockData: QueryResultData = { columns: [], rows: [] };
    executeQueryMock.mockResolvedValue(mockData);
    getWidgetMock.mockResolvedValue(mockWidget);

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

    executeQueryMock.mockResolvedValue(mockData);
    getWidgetMock.mockResolvedValue(mockWidgetWithMetadataItems);

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

  it('should add provided "filters" and "highlights" to the query', async () => {
    const mockData: QueryResultData = { columns: [], rows: [] };
    const filters = [
      filtersFactory.members(new DimensionalAttribute('some name', 'some new filter attribute'), [
        'some value',
      ]),
    ];
    const highlights = [
      filtersFactory.members(
        new DimensionalAttribute('some name', 'some new highlight filter attribute'),
        ['some value'],
      ),
    ];

    executeQueryMock.mockResolvedValue(mockData);
    getWidgetMock.mockResolvedValue(mockWidgetWithMetadataItems);

    const { result } = renderHook(() =>
      useExecuteQueryByWidgetId({
        ...params,
        filters,
        highlights,
      }),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      // verifies query filters
      expect(result.current.query?.filters?.length).toBe(2); // one widget filter + one provided filter via props
      expect(
        result.current.query?.filters?.find(
          (filter) => (filter.jaql(true) as FilterJaql).dim === filters[0].attribute.expression,
        ),
      ).toBeDefined();

      // verifies highlight filters
      expect(result.current.query?.highlights?.length).toBe(1); // one provided highlight filter via props
      expect(
        result.current.query?.highlights?.find(
          (filter) => (filter.jaql(true) as FilterJaql).dim === highlights[0].attribute.expression,
        ),
      ).toBeDefined();
    });
  });

  it('should merge provided "filters" with existing widget filters using `widgetFirst` strategy', async () => {
    const mockData: QueryResultData = { columns: [], rows: [] };
    const filters = [
      // filter with the same target attribute as already exist in widget
      filtersFactory.members(
        new DimensionalAttribute(
          'some name',
          mockWidgetWithMetadataItems.metadata.panels[2].items[0].jaql.dim,
        ),
        ['some value of provided filter'],
      ),
    ];

    executeQueryMock.mockResolvedValue(mockData);
    getWidgetMock.mockResolvedValue(mockWidgetWithMetadataItems);

    const { result } = renderHook(() =>
      useExecuteQueryByWidgetId({
        ...params,
        filters,
        filtersMergeStrategy: 'widgetFirst',
      }),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      // verifies that query contains only widget filter, while provided filter was ignored due to the lower priority
      expect(result.current.query?.filters?.length).toBe(1);
      expect(
        (
          (result.current.query?.filters?.[0].jaql(true) as FilterJaql)
            .filter as IncludeMembersFilter
        ).members,
      ).toStrictEqual(
        (
          (mockWidgetWithMetadataItems.metadata.panels[2].items[0].jaql as FilterJaql)
            .filter as IncludeMembersFilter
        ).members,
      );
    });
  });

  it('should merge provided "filters" with existing widget filters using DEFAULT `codeFirst` strategy', async () => {
    const mockData: QueryResultData = { columns: [], rows: [] };
    const filters = [
      // filter with the same target attribute as already exist in widget
      filtersFactory.members(
        new DimensionalAttribute(
          'some name',
          mockWidgetWithMetadataItems.metadata.panels[2].items[0].jaql.dim,
        ),
        ['some value of provided filter'],
      ),
    ];

    executeQueryMock.mockResolvedValue(mockData);
    getWidgetMock.mockResolvedValue(mockWidgetWithMetadataItems);

    const { result } = renderHook(() =>
      useExecuteQueryByWidgetId({
        ...params,
        filters,
      }),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      // verifies that query contains only provided filter, while widget filter was ignored due to the lower priority
      expect(result.current.query?.filters?.length).toBe(1);
      expect(
        (
          (result.current.query?.filters?.[0].jaql(true) as FilterJaql)
            .filter as IncludeMembersFilter
        ).members,
      ).toStrictEqual(
        ((filters[0].jaql(true) as FilterJaql).filter as IncludeMembersFilter).members,
      );
    });
  });

  it('should merge provided "filters" with existing widget filters using `codeOnly` strategy', async () => {
    const mockData: QueryResultData = { columns: [], rows: [] };
    const filters = [
      // filter with the new target attribute that not exist in widget
      filtersFactory.members(new DimensionalAttribute('some name', 'some new filter attribute'), [
        'some value of provided filter',
      ]),
    ];

    executeQueryMock.mockResolvedValue(mockData);
    getWidgetMock.mockResolvedValue(mockWidgetWithMetadataItems);

    const { result } = renderHook(() =>
      useExecuteQueryByWidgetId({
        ...params,
        filters,
        filtersMergeStrategy: 'codeOnly',
      }),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      // verifies that query contains only provided filter, while widget filter was fully ignored
      expect(result.current.query?.filters?.length).toBe(1);
      expect(
        (
          (result.current.query?.filters?.[0].jaql(true) as FilterJaql)
            .filter as IncludeMembersFilter
        ).members,
      ).toStrictEqual(
        ((filters[0].jaql(true) as FilterJaql).filter as IncludeMembersFilter).members,
      );
    });
  });

  it('should handle widget fetch error', async () => {
    const mockError = new Error('Widget fetch error');
    getWidgetMock.mockRejectedValueOnce(mockError);

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
    getWidgetMock.mockResolvedValue({
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

  it('should pass "onBeforeQuery" callback to \'executeQuery\' executionConfig', async () => {
    const onBeforeQuery = vi.fn();
    const mockData: QueryResultData = { columns: [], rows: [] };
    executeQueryMock.mockResolvedValue(mockData);
    getWidgetMock.mockResolvedValue(mockWidget);

    const { result } = renderHook(() =>
      useExecuteQueryByWidgetId({
        ...params,
        onBeforeQuery,
      }),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(executeQueryMock).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          onBeforeQuery,
        }),
      );
    });
  });
});

describe('isParamsChanged', () => {
  it('should take "count" and "offset" into account', () => {
    expect(
      isParamsChanged(
        { dashboardOid: 'd-oid', widgetOid: 'w-oid', count: 100, offset: 0 },
        { dashboardOid: 'd-oid', widgetOid: 'w-oid', count: 100, offset: 50 },
      ),
    ).toBe(true);

    expect(
      isParamsChanged(
        { dashboardOid: 'd-oid', widgetOid: 'w-oid', count: 100, offset: 0 },
        { dashboardOid: 'd-oid', widgetOid: 'w-oid', count: 100, offset: 0 },
      ),
    ).toBe(false);
  });
});
