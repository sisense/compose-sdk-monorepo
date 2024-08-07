/** @vitest-environment jsdom */

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  executeQuery,
  executeQueryByWidgetId,
  ExecuteQueryByWidgetIdParams,
  ExecuteQueryParams,
} from '@sisense/sdk-ui-preact';
import { Mock, Mocked } from 'vitest';
import { QueryService } from './query.service';
import { SisenseContextService } from './sisense-context.service';

vi.mock('@sisense/sdk-ui-preact', () => ({
  executeQuery: vi.fn(),
  executeQueryByWidgetId: vi.fn(),
}));

const executeQueryMock = executeQuery as Mock<
  Parameters<typeof executeQuery>,
  ReturnType<typeof executeQuery>
>;

const executeQueryByWidgetIdMock = executeQueryByWidgetId as Mock<
  Parameters<typeof executeQueryByWidgetId>,
  ReturnType<typeof executeQueryByWidgetId>
>;

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
});
