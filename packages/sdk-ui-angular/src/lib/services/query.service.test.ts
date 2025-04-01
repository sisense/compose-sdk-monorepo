/** @vitest-environment jsdom */

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  executeQuery,
  executeQueryByWidgetId,
  executePivotQuery,
  ExecuteQueryByWidgetIdParams,
  ExecuteQueryParams,
} from '@sisense/sdk-ui-preact';
import { Mock, Mocked } from 'vitest';
import { ExecutePivotQueryParams, QueryService } from './query.service';
import { SisenseContextService } from './sisense-context.service';
import { EMPTY_PIVOT_QUERY_RESULT_DATA, PivotQueryResultData } from '@sisense/sdk-data';

vi.mock('@sisense/sdk-ui-preact', () => ({
  executeQuery: vi.fn(),
  executeQueryByWidgetId: vi.fn(),
  executePivotQuery: vi.fn(),
}));

const executeQueryMock = executeQuery as Mock<typeof executeQuery>;
const executeQueryByWidgetIdMock = executeQueryByWidgetId as Mock<typeof executeQueryByWidgetId>;
const executePivotQueryMock = executePivotQuery as Mock<typeof executePivotQuery>;

describe('QueryService', () => {
  let queryService: QueryService;
  let sisenseContextServiceMock: Mocked<SisenseContextService>;

  beforeEach(() => {
    sisenseContextServiceMock = {
      getApp: vi.fn().mockResolvedValue({}),
    } as unknown as Mocked<SisenseContextService>;

    queryService = new QueryService(sisenseContextServiceMock);
  });

  it('should be created', () => {
    expect(queryService).toBeTruthy();
  });

  describe('executeQuery', () => {
    it('should execute a data query', async () => {
      executeQueryMock.mockResolvedValue({
        columns: [],
        rows: [],
      });

      const params: ExecuteQueryParams = {
        dataSource: 'Sample ECommerce',
        dimensions: [],
        measures: [],
        filters: [],
        highlights: [],
        count: 10,
        offset: 0,
        onBeforeQuery: vi.fn(),
      };
      const result = await queryService.executeQuery(params);
      expect(sisenseContextServiceMock.getApp).toHaveBeenCalled();
      expect(executeQueryMock).toHaveBeenCalledWith(
        {
          dataSource: 'Sample ECommerce',
          dimensions: [],
          measures: [],
          filters: [],
          highlights: [],
          count: 10,
          offset: 0,
        },
        {},
        { onBeforeQuery: expect.any(Function) },
      );
      expect(result).toEqual({ data: { columns: [], rows: [] } });
    });
  });

  describe('executeQueryByWidgetId', () => {
    it('should execute a data query by widget ID', async () => {
      executeQueryByWidgetIdMock.mockResolvedValue({
        data: { columns: [], rows: [] },
        query: { dimensions: [], measures: [], filters: [], highlights: [] },
        pivotQuery: undefined,
      });

      const params: ExecuteQueryByWidgetIdParams = {
        widgetOid: 'mockedWidgetOid',
        dashboardOid: 'mockedDashboardOid',
      };

      const result = await queryService.executeQueryByWidgetId(params);

      expect(sisenseContextServiceMock.getApp).toHaveBeenCalled();

      expect(executeQueryByWidgetIdMock).toHaveBeenCalledWith({
        ...params,
        app: {},
      });
      expect(result).toEqual({
        data: { columns: [], rows: [] },
        query: { dimensions: [], measures: [], filters: [], highlights: [] },
        pivotQuery: undefined,
      });
    });
  });

  describe('executePivotQuery', () => {
    it('should execute a pivot data query', async () => {
      const mockData: PivotQueryResultData = EMPTY_PIVOT_QUERY_RESULT_DATA;
      executePivotQueryMock.mockResolvedValue(mockData);

      const params: ExecutePivotQueryParams = {
        dataSource: 'Sample ECommerce',
        rows: [],
        columns: [],
        values: [],
        filters: [],
        highlights: [],
        grandTotals: {},
        count: 10,
        offset: 0,
        beforeQuery: vi.fn(),
      };
      const result = await queryService.executePivotQuery(params);
      expect(sisenseContextServiceMock.getApp).toHaveBeenCalled();
      expect(executePivotQueryMock).toHaveBeenCalledWith(
        {
          dataSource: params.dataSource,
          rows: params.rows,
          columns: params.columns,
          values: params.values,
          filters: params.filters,
          highlights: params.highlights,
          grandTotals: params.grandTotals,
          count: params.count,
          offset: params.offset,
        },
        {},
        { onBeforeQuery: params.beforeQuery },
      );
      expect(result).toEqual({ data: mockData });
    });
  });
});
