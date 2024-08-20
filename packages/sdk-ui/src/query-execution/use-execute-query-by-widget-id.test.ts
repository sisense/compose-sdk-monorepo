/** @vitest-environment jsdom */
import { renderHook, waitFor } from '@testing-library/react';
import type { Mock } from 'vitest';
import cloneDeep from 'lodash/cloneDeep';
import {
  QueryResultData,
  filterFactory,
  DimensionalAttribute,
  BaseJaql,
  FilterJaql,
  IncludeMembersFilter,
  Filter,
  PivotQueryResultData,
} from '@sisense/sdk-data';
import { useExecuteQueryByWidgetId, useParamsChanged } from './use-execute-query-by-widget-id';
import { executeQuery, executePivotQuery } from '../query/execute-query.js';
import { ClientApplication } from '../app/client-application.js';
import { useSisenseContext } from '../sisense-context/sisense-context.js';
import { WidgetDashboardFilterMode, WidgetDto } from '../dashboard-widget/types.js';
import { trackProductEvent } from '@sisense/sdk-tracking';
import { ExecuteQueryByWidgetIdParams } from './types';

vi.mock('../query/execute-query');
vi.mock('../sisense-context/sisense-context');
const getWidgetMock = vi.fn();
const getDashboardMock = vi.fn();
vi.mock('../api/rest-api', () => ({
  RestApi: class {
    getWidget = getWidgetMock;

    getDashboard = getDashboardMock;
  },
}));

vi.mock('@sisense/sdk-tracking', async () => {
  const actual: typeof import('@sisense/sdk-tracking') = await vi.importActual(
    '@sisense/sdk-tracking',
  );
  return {
    ...actual,
    trackProductEvent: vi.fn().mockImplementation(() => {
      console.log('trackProductEvent');
      return Promise.resolve();
    }),
  };
});

const executeQueryMock = executeQuery as Mock<
  Parameters<typeof executeQuery>,
  ReturnType<typeof executeQuery>
>;
const executePivotQueryMock = executePivotQuery as Mock<
  Parameters<typeof executePivotQuery>,
  ReturnType<typeof executePivotQuery>
>;
const useSisenseContextMock = useSisenseContext as Mock<
  Parameters<typeof useSisenseContext>,
  ReturnType<typeof useSisenseContext>
>;
const trackProductEventMock = trackProductEvent as Mock<
  Parameters<typeof trackProductEvent>,
  ReturnType<typeof trackProductEvent>
>;

const mockChartWidget = {
  type: 'chart/column',
  datasource: {
    title: 'Some elasticube',
  },
  metadata: {
    panels: [],
  },
  options: {
    dashboardFiltersMode: WidgetDashboardFilterMode.SELECT,
  },
  style: {},
} as unknown as WidgetDto;

const mockChartWidgetWithMetadataItems = {
  ...mockChartWidget,
  metadata: {
    panels: [
      {
        name: 'categories',
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
        name: 'values',
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
        name: 'filters',
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

const mockPivotWidget = {
  type: 'pivot2',
  datasource: {
    title: 'Some elasticube',
  },
  metadata: {
    panels: [],
  },
  options: {
    dashboardFiltersMode: WidgetDashboardFilterMode.SELECT,
  },
  style: {},
} as unknown as WidgetDto;

const mockPivotWidgetWithMetadataItems = {
  ...mockPivotWidget,
  metadata: {
    panels: [
      {
        name: 'rows',
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
        name: 'values',
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
        name: 'filters',
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

const mockDashboard = {
  filters: [
    {
      jaql: {
        title: 'some dashboard filter title',
        dim: 'some dimension',
        filter: {
          members: ['some member'],
        },
      } as unknown as FilterJaql,
    },
  ],
};

describe('useExecuteQueryByWidgetId', () => {
  const params: ExecuteQueryByWidgetIdParams = {
    widgetOid: '64473e07dac1920034bce77f',
    dashboardOid: '6441e728dac1920034bce737',
  };

  beforeEach(() => {
    executeQueryMock.mockClear();
    executePivotQueryMock.mockClear();
    getWidgetMock.mockClear();
    getDashboardMock.mockClear();
    trackProductEventMock.mockClear();
    useSisenseContextMock.mockReturnValue({
      app: {} as ClientApplication,
      isInitialized: true,
      tracking: {
        enabled: false,
        packageName: 'sdk-ui',
      },
    });
  });

  describe('non-pivot widget', () => {
    it('should fetch data successfully', async () => {
      const mockData: QueryResultData = { columns: [], rows: [] };
      executeQueryMock.mockResolvedValue(mockData);
      getWidgetMock.mockResolvedValue(mockChartWidget);

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
      getWidgetMock.mockResolvedValue(mockChartWidgetWithMetadataItems);

      const { result } = renderHook(() => useExecuteQueryByWidgetId(params));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        // verifies query dimensions
        expect(result.current.query?.dimensions?.length).toBe(1);
        expect((result.current.query?.dimensions?.[0].jaql(true) as BaseJaql).dim).toBe(
          mockChartWidgetWithMetadataItems.metadata.panels[0].items[0].jaql.dim,
        );
        // verifies query measures
        expect(result.current.query?.measures?.length).toBe(1);
        expect((result.current.query?.measures?.[0].jaql(true) as BaseJaql).dim).toBe(
          mockChartWidgetWithMetadataItems.metadata.panels[1].items[0].jaql.dim,
        );

        const queryFilters = result.current.query?.filters as Filter[] | undefined;
        // verifies query filters
        expect(queryFilters?.length).toBe(1);
        expect((queryFilters?.[0].jaql(true) as FilterJaql).dim).toBe(
          mockChartWidgetWithMetadataItems.metadata.panels[2].items[0].jaql.dim,
        );
      });
    });

    it('should add provided "filters" and "highlights" to the query', async () => {
      const mockData: QueryResultData = { columns: [], rows: [] };
      const filters = [
        filterFactory.members(new DimensionalAttribute('some name', 'some new filter attribute'), [
          'some value',
        ]),
      ];
      const highlights = [
        filterFactory.members(
          new DimensionalAttribute('some name', 'some new highlight filter attribute'),
          ['some value'],
        ),
      ];

      executeQueryMock.mockResolvedValue(mockData);
      getWidgetMock.mockResolvedValue(mockChartWidgetWithMetadataItems);

      const { result } = renderHook(() =>
        useExecuteQueryByWidgetId({
          ...params,
          filters,
          highlights,
        }),
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        const queryFilters = result.current.query?.filters as Filter[] | undefined;
        // verifies query filters
        expect(queryFilters?.length).toBe(2); // one widget filter + one provided filter via props
        expect(
          queryFilters?.find(
            (filter) => (filter.jaql(true) as FilterJaql).dim === filters[0].attribute.expression,
          ),
        ).toBeDefined();

        // verifies highlight filters
        expect(result.current.query?.highlights?.length).toBe(1); // one provided highlight filter via props
        expect(
          result.current.query?.highlights?.find(
            (filter) =>
              (filter.jaql(true) as FilterJaql).dim === highlights[0].attribute.expression,
          ),
        ).toBeDefined();
      });
    });

    it('should merge provided "filters" with existing widget filters using `widgetFirst` strategy', async () => {
      const mockData: QueryResultData = { columns: [], rows: [] };
      const filters = [
        // filter with the same target attribute as already exist in widget
        filterFactory.members(
          new DimensionalAttribute(
            'some name',
            mockChartWidgetWithMetadataItems.metadata.panels[2].items[0].jaql.dim,
          ),
          ['some value of provided filter'],
        ),
      ];

      executeQueryMock.mockResolvedValue(mockData);
      getWidgetMock.mockResolvedValue(mockChartWidgetWithMetadataItems);

      const { result } = renderHook(() =>
        useExecuteQueryByWidgetId({
          ...params,
          filters,
          filtersMergeStrategy: 'widgetFirst',
        }),
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        const queryFilters = result.current.query?.filters as Filter[] | undefined;
        // verifies that query contains only widget filter, while provided filter was ignored due to the lower priority
        expect(queryFilters?.length).toBe(1);
        expect(
          ((queryFilters?.[0].jaql(true) as FilterJaql).filter as IncludeMembersFilter).members,
        ).toStrictEqual(
          (
            (mockChartWidgetWithMetadataItems.metadata.panels[2].items[0].jaql as FilterJaql)
              .filter as IncludeMembersFilter
          ).members,
        );
      });
    });

    it('should merge provided "filters" with existing widget filters using DEFAULT `codeFirst` strategy', async () => {
      const mockData: QueryResultData = { columns: [], rows: [] };
      const filters = [
        // filter with the same target attribute as already exist in widget
        filterFactory.members(
          new DimensionalAttribute(
            'some name',
            mockChartWidgetWithMetadataItems.metadata.panels[2].items[0].jaql.dim,
          ),
          ['some value of provided filter'],
        ),
      ];

      executeQueryMock.mockResolvedValue(mockData);
      getWidgetMock.mockResolvedValue(mockChartWidgetWithMetadataItems);

      const { result } = renderHook(() =>
        useExecuteQueryByWidgetId({
          ...params,
          filters,
        }),
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        const queryFilters = result.current.query?.filters as Filter[] | undefined;
        // verifies that query contains only provided filter, while widget filter was ignored due to the lower priority
        expect(queryFilters?.length).toBe(1);
        expect(
          ((queryFilters?.[0].jaql(true) as FilterJaql).filter as IncludeMembersFilter).members,
        ).toStrictEqual(
          ((filters[0].jaql(true) as FilterJaql).filter as IncludeMembersFilter).members,
        );
      });
    });

    it('should merge provided "filters" with existing widget filters using `codeOnly` strategy', async () => {
      const mockData: QueryResultData = { columns: [], rows: [] };
      const filters = [
        // filter with the new target attribute that not exist in widget
        filterFactory.members(new DimensionalAttribute('some name', 'some new filter attribute'), [
          'some value of provided filter',
        ]),
      ];

      executeQueryMock.mockResolvedValue(mockData);
      getWidgetMock.mockResolvedValue(mockChartWidgetWithMetadataItems);

      const { result } = renderHook(() =>
        useExecuteQueryByWidgetId({
          ...params,
          filters,
          filtersMergeStrategy: 'codeOnly',
        }),
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        const queryFilters = result.current.query?.filters as Filter[] | undefined;
        // verifies that query contains only provided filter, while widget filter was fully ignored
        expect(queryFilters?.length).toBe(1);
        expect(
          ((queryFilters?.[0].jaql(true) as FilterJaql).filter as IncludeMembersFilter).members,
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
        ...mockChartWidget,
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
      useSisenseContextMock.mockReturnValue({
        isInitialized: false,
        tracking: { enabled: false, packageName: 'sdk-ui' },
      });

      const { result } = renderHook(() => useExecuteQueryByWidgetId(params));

      expect(result.current.isError).toBe(true);
      expect(result.current.error?.message).toMatch(/Sisense Context .* not found/i);
    });

    it('should pass "onBeforeQuery" callback to \'executeQuery\' executionConfig', async () => {
      const onBeforeQuery = vi.fn();
      const mockData: QueryResultData = { columns: [], rows: [] };
      executeQueryMock.mockResolvedValue(mockData);
      getWidgetMock.mockResolvedValue(mockChartWidget);

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

    it('should send tracking for the first execution', async () => {
      const mockData: QueryResultData = { columns: [], rows: [] };
      executeQueryMock.mockResolvedValue(mockData);
      getWidgetMock.mockResolvedValue(mockChartWidget);
      useSisenseContextMock.mockReturnValue({
        app: { httpClient: {} } as ClientApplication,
        isInitialized: true,
        tracking: {
          enabled: true,
          packageName: `sdk-ui`,
        },
      });
      vi.stubGlobal('__PACKAGE_VERSION__', 'unit-test-version');

      const { result } = renderHook(() => useExecuteQueryByWidgetId(params));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toBe(mockData);
      });

      expect(trackProductEventMock).toHaveBeenCalledOnce();
      expect(trackProductEventMock).toHaveBeenCalledWith(
        'sdkHookInit',
        expect.objectContaining({
          hookName: 'useExecuteQueryByWidgetId',
        }),
        expect.anything(),
        expect.any(Boolean),
      );
    });

    it("shouldn't send query if 'enabled' set to false", async () => {
      const mockData: QueryResultData = { columns: [], rows: [] };
      executeQueryMock.mockResolvedValue(mockData);

      const { result } = renderHook(() => useExecuteQueryByWidgetId({ ...params, enabled: false }));
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
        expect(result.current.isSuccess).toBe(false);
        expect(result.current.data).toBeUndefined();
      });

      expect(executeQueryMock).not.toHaveBeenCalled();
    });

    it('should merge provided "highlights" with existing widget "highlights" (inhereted from dashboard) using default `codeFirst` strategy', async () => {
      const mockData: QueryResultData = { columns: [], rows: [] };
      const highlights = [
        // filter with the new target attribute that not exist in widget
        filterFactory.members(new DimensionalAttribute('some name', 'some new filter attribute'), [
          'some value of provided filter',
        ]),
      ];

      executeQueryMock.mockResolvedValue(mockData);
      getWidgetMock.mockResolvedValue(mockChartWidgetWithMetadataItems);
      getDashboardMock.mockResolvedValue(mockDashboard);

      const { result } = renderHook(() =>
        useExecuteQueryByWidgetId({
          ...params,
          highlights,
          includeDashboardFilters: true,
        }),
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        // verifies that query contains "highlights" filters both passed via props and taken from widget/dashboard model
        expect(result.current.query?.highlights?.length).toBe(2);
        expect(
          (
            (result.current.query?.highlights?.[1].jaql(true) as FilterJaql)
              .filter as IncludeMembersFilter
          ).members,
        ).toStrictEqual(
          ((highlights[0].jaql(true) as FilterJaql).filter as IncludeMembersFilter).members,
        );
        expect(
          (
            (result.current.query?.highlights?.[0].jaql(true) as FilterJaql)
              .filter as IncludeMembersFilter
          ).members,
        ).toStrictEqual((mockDashboard.filters[0].jaql.filter as IncludeMembersFilter).members);
      });
    });

    it('should merge provided "highlights" with existing widget "highlights" (inhereted from dashboard) using `codeOnly` strategy', async () => {
      const mockData: QueryResultData = { columns: [], rows: [] };
      const highlights = [
        // filter with the new target attribute that not exist in widget
        filterFactory.members(new DimensionalAttribute('some name', 'some new filter attribute'), [
          'some value of provided filter',
        ]),
      ];

      executeQueryMock.mockResolvedValue(mockData);
      getWidgetMock.mockResolvedValue(mockChartWidgetWithMetadataItems);
      getDashboardMock.mockResolvedValue(mockDashboard);

      const { result } = renderHook(() =>
        useExecuteQueryByWidgetId({
          ...params,
          highlights,
          includeDashboardFilters: true,
          filtersMergeStrategy: 'codeOnly',
        }),
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        // verifies that query contains "highlights" filters only taken from props
        expect(result.current.query?.highlights?.length).toBe(1);
        expect(
          (
            (result.current.query?.highlights?.[0].jaql(true) as FilterJaql)
              .filter as IncludeMembersFilter
          ).members,
        ).toStrictEqual(
          ((highlights[0].jaql(true) as FilterJaql).filter as IncludeMembersFilter).members,
        );
      });
    });

    it('should merge provided "highlights" with existing widget "highlights" (inhereted from dashboard) using `widgetFirst` strategy', async () => {
      const mockData: QueryResultData = { columns: [], rows: [] };
      const highlights = [
        // filter with the target attribute that exists in widget
        filterFactory.members(new DimensionalAttribute('some name', 'some dimension'), [
          'some value of provided filter',
        ]),
      ];

      executeQueryMock.mockResolvedValue(mockData);
      getWidgetMock.mockResolvedValue(mockChartWidgetWithMetadataItems);
      getDashboardMock.mockResolvedValue(mockDashboard);

      const { result } = renderHook(() =>
        useExecuteQueryByWidgetId({
          ...params,
          highlights,
          includeDashboardFilters: true,
          filtersMergeStrategy: 'widgetFirst',
        }),
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
        // verifies that query contains "highlights" filters only taken from widget/dashboard model
        expect(result.current.query?.highlights?.length).toBe(1);
        expect(
          (
            (result.current.query?.highlights?.[0].jaql(true) as FilterJaql)
              .filter as IncludeMembersFilter
          ).members,
        ).toStrictEqual((mockDashboard.filters[0].jaql.filter as IncludeMembersFilter).members);
      });
    });
  });

  describe('pivot widget', () => {
    it('should fetch data successfully', async () => {
      const mockData: PivotQueryResultData = { table: { columns: [], rows: [] } };
      executePivotQueryMock.mockResolvedValue(mockData);
      getWidgetMock.mockResolvedValue(mockPivotWidget);

      const { result } = renderHook(() => useExecuteQueryByWidgetId(params));

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isSuccess).toBe(true);
        expect(result.current.data).toBe(mockData.table);
      });
    });

    it('should correctly generate pivot query over the widget', async () => {
      const mockData: PivotQueryResultData = { table: { columns: [], rows: [] } };

      executePivotQueryMock.mockResolvedValue(mockData);
      getWidgetMock.mockResolvedValue(mockPivotWidgetWithMetadataItems);

      const { result } = renderHook(() => useExecuteQueryByWidgetId(params));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);

        // verifies query rows
        expect(result.current.pivotQuery?.rows?.length).toBe(1);
        // verifies query values
        expect(result.current.pivotQuery?.values?.length).toBe(1);

        const queryFilters = result.current.pivotQuery?.filters as Filter[] | undefined;
        // verifies query filters
        expect(queryFilters?.length).toBe(1);
        expect((queryFilters?.[0].jaql(true) as FilterJaql).dim).toBe(
          mockPivotWidgetWithMetadataItems.metadata.panels[2].items[0].jaql.dim,
        );
      });
    });
  });
});

describe('useParamsChanged', () => {
  const initialProps = { dashboardOid: 'd-oid', widgetOid: 'w-oid', count: 100, offset: 0 };

  it('should handle same params', () => {
    const { result, rerender } = renderHook(useParamsChanged, { initialProps });
    expect(result.current).toBe(true);
    rerender(cloneDeep(initialProps));
    expect(result.current).toBe(false);
  });

  it('should handle different params: `offset`', () => {
    const { result, rerender } = renderHook(useParamsChanged, { initialProps });
    expect(result.current).toBe(true);
    rerender({ ...cloneDeep(initialProps), offset: 50 });
    expect(result.current).toBe(true);
  });
});
