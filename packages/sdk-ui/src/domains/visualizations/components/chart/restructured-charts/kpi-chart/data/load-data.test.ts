import { measureFactory, QueryResultData } from '@sisense/sdk-data';
import { JaqlQueryPayload, QueryExecutionConfig } from '@sisense/sdk-query-client';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { QueryDescription } from '@/domains/query-execution/core/execute-query.js';
import { type ClientApplication } from '@/infra/app/types.js';

import { loadDataBySingleQuery } from '../../helpers/data-loading.js';
import { translateKpiChartDataOptions } from '../data-options/data-options.js';
import { KPI_ROW_TYPE_COLUMN, loadKpiData, mergeTotalIntoResult } from './load-data.js';

vi.mock('../../helpers/data-loading', () => ({
  loadDataBySingleQuery: vi.fn(),
}));

const mockLoadDataBySingleQuery = vi.mocked(loadDataBySingleQuery);

/**
 * `loadKpiData` only forwards `app` opaquely to `loadDataBySingleQuery` (mocked above), so no
 * real client field is ever read here -- a bare stub is intentional, not an escape hatch.
 */
function createMockApp(): ClientApplication {
  return {} as ClientApplication;
}

const mockApp = createMockApp();
const revenue = measureFactory.sum(DM.Commerce.Revenue);

const baseQueryDescription: QueryDescription = {
  dataSource: DM.DataSource,
  dimensions: [DM.Commerce.Date.Months],
  measures: [revenue],
};

const emptyResult: QueryResultData = { columns: [], rows: [] };

describe('loadKpiData', () => {
  beforeEach(() => {
    mockLoadDataBySingleQuery.mockReset();
  });

  it('passes through a single query when valueMode is "last" (category set)', async () => {
    const dataOptions = translateKpiChartDataOptions({
      value: revenue,
      category: DM.Commerce.Date.Months,
      valueMode: 'last',
    });
    mockLoadDataBySingleQuery.mockResolvedValue(emptyResult);

    const result = await loadKpiData({
      app: mockApp,
      chartDataOptionsInternal: dataOptions,
      queryDescription: baseQueryDescription,
    });

    expect(mockLoadDataBySingleQuery).toHaveBeenCalledTimes(1);
    expect(mockLoadDataBySingleQuery).toHaveBeenCalledWith({
      app: mockApp,
      queryDescription: baseQueryDescription,
      executionConfig: undefined,
    });
    expect(result).toBe(emptyResult);
  });

  it('passes through a single query when valueMode is "total" but no category is set', async () => {
    const dataOptions = translateKpiChartDataOptions({
      value: revenue,
      valueMode: 'total',
    });
    const queryDescription: QueryDescription = {
      dataSource: DM.DataSource,
      dimensions: [],
      measures: [revenue],
    };
    mockLoadDataBySingleQuery.mockResolvedValue(emptyResult);

    const result = await loadKpiData({
      app: mockApp,
      chartDataOptionsInternal: dataOptions,
      queryDescription,
    });

    expect(mockLoadDataBySingleQuery).toHaveBeenCalledTimes(1);
    expect(mockLoadDataBySingleQuery).toHaveBeenCalledWith({
      app: mockApp,
      queryDescription,
      executionConfig: undefined,
    });
    expect(result).toBe(emptyResult);
  });

  it('runs a dual query and merges results when valueMode is "total" and category is set', async () => {
    const dataOptions = translateKpiChartDataOptions({
      value: revenue,
      category: DM.Commerce.Date.Months,
      valueMode: 'total',
    });

    const bucketedResult: QueryResultData = {
      columns: [
        { name: 'Date.Months', type: 'date' },
        { name: 'total revenue', type: 'number' },
      ],
      rows: [
        [{ data: '2024-01-01T00:00:00' }, { data: 100 }],
        [{ data: '2024-02-01T00:00:00' }, { data: 150 }],
      ],
    };
    const totalResult: QueryResultData = {
      columns: [{ name: 'total revenue', type: 'number' }],
      rows: [[{ data: 250 }]],
    };

    mockLoadDataBySingleQuery
      .mockResolvedValueOnce(bucketedResult)
      .mockResolvedValueOnce(totalResult);

    const result = await loadKpiData({
      app: mockApp,
      chartDataOptionsInternal: dataOptions,
      queryDescription: baseQueryDescription,
    });

    expect(mockLoadDataBySingleQuery).toHaveBeenCalledTimes(2);
    expect(mockLoadDataBySingleQuery).toHaveBeenNthCalledWith(1, {
      app: mockApp,
      queryDescription: baseQueryDescription,
      executionConfig: undefined,
    });
    expect(mockLoadDataBySingleQuery).toHaveBeenNthCalledWith(2, {
      app: mockApp,
      queryDescription: { ...baseQueryDescription, dimensions: [] },
      executionConfig: undefined,
    });

    expect(result).toEqual<QueryResultData>({
      columns: [
        { name: 'Date.Months', type: 'date' },
        { name: 'total revenue', type: 'number' },
        { name: KPI_ROW_TYPE_COLUMN, type: 'string' },
      ],
      rows: [
        [{ data: '2024-01-01T00:00:00' }, { data: 100 }, { data: 'bucket' }],
        [{ data: '2024-02-01T00:00:00' }, { data: 150 }, { data: 'bucket' }],
        [{ data: '' }, { data: 250 }, { data: 'total' }],
      ],
    });
  });

  it('forwards a provided executionConfig to both queries in the dual-query path', async () => {
    const dataOptions = translateKpiChartDataOptions({
      value: revenue,
      category: DM.Commerce.Date.Months,
      valueMode: 'total',
    });
    const executionConfig: QueryExecutionConfig = {
      onBeforeQuery: (jaql: JaqlQueryPayload) => jaql,
    };

    const bucketedResult: QueryResultData = {
      columns: [
        { name: 'Date.Months', type: 'date' },
        { name: 'total revenue', type: 'number' },
      ],
      rows: [],
    };
    const totalResult: QueryResultData = {
      columns: [{ name: 'total revenue', type: 'number' }],
      rows: [[{ data: 0 }]],
    };
    mockLoadDataBySingleQuery
      .mockResolvedValueOnce(bucketedResult)
      .mockResolvedValueOnce(totalResult);

    await loadKpiData({
      app: mockApp,
      chartDataOptionsInternal: dataOptions,
      queryDescription: baseQueryDescription,
      executionConfig,
    });

    expect(mockLoadDataBySingleQuery).toHaveBeenNthCalledWith(1, {
      app: mockApp,
      queryDescription: baseQueryDescription,
      executionConfig,
    });
    expect(mockLoadDataBySingleQuery).toHaveBeenNthCalledWith(2, {
      app: mockApp,
      queryDescription: { ...baseQueryDescription, dimensions: [] },
      executionConfig,
    });
  });
});

describe('mergeTotalIntoResult', () => {
  it('appends the marker column and a total row per the merge contract', () => {
    const bucketed: QueryResultData = {
      columns: [
        { name: 'Date.Months', type: 'date' },
        { name: 'total revenue', type: 'number' },
      ],
      rows: [
        [{ data: '2024-01-01T00:00:00' }, { data: 100 }],
        [{ data: '2024-02-01T00:00:00' }, { data: 150 }],
      ],
    };
    const total: QueryResultData = {
      columns: [{ name: 'total revenue', type: 'number' }],
      rows: [[{ data: 250 }]],
    };

    expect(mergeTotalIntoResult(bucketed, total)).toEqual<QueryResultData>({
      columns: [
        { name: 'Date.Months', type: 'date' },
        { name: 'total revenue', type: 'number' },
        { name: KPI_ROW_TYPE_COLUMN, type: 'string' },
      ],
      rows: [
        [{ data: '2024-01-01T00:00:00' }, { data: 100 }, { data: 'bucket' }],
        [{ data: '2024-02-01T00:00:00' }, { data: 150 }, { data: 'bucket' }],
        [{ data: '' }, { data: 250 }, { data: 'total' }],
      ],
    });
  });

  it('handles multiple measures in the total row', () => {
    const bucketed: QueryResultData = {
      columns: [
        { name: 'Date.Months', type: 'date' },
        { name: 'total revenue', type: 'number' },
        { name: 'total cost', type: 'number' },
      ],
      rows: [[{ data: '2024-01-01T00:00:00' }, { data: 100 }, { data: 40 }]],
    };
    const total: QueryResultData = {
      columns: [
        { name: 'total revenue', type: 'number' },
        { name: 'total cost', type: 'number' },
      ],
      rows: [[{ data: 100 }, { data: 40 }]],
    };

    expect(mergeTotalIntoResult(bucketed, total)).toEqual<QueryResultData>({
      columns: [
        { name: 'Date.Months', type: 'date' },
        { name: 'total revenue', type: 'number' },
        { name: 'total cost', type: 'number' },
        { name: KPI_ROW_TYPE_COLUMN, type: 'string' },
      ],
      rows: [
        [{ data: '2024-01-01T00:00:00' }, { data: 100 }, { data: 40 }, { data: 'bucket' }],
        [{ data: '' }, { data: 100 }, { data: 40 }, { data: 'total' }],
      ],
    });
  });

  it('still appends a total row (with a leading placeholder cell) when there are no bucketed rows', () => {
    const bucketed: QueryResultData = {
      columns: [
        { name: 'Date.Months', type: 'date' },
        { name: 'total revenue', type: 'number' },
      ],
      rows: [],
    };
    const total: QueryResultData = {
      columns: [{ name: 'total revenue', type: 'number' }],
      rows: [[{ data: 0 }]],
    };

    expect(mergeTotalIntoResult(bucketed, total)).toEqual<QueryResultData>({
      columns: [
        { name: 'Date.Months', type: 'date' },
        { name: 'total revenue', type: 'number' },
        { name: KPI_ROW_TYPE_COLUMN, type: 'string' },
      ],
      rows: [[{ data: '' }, { data: 0 }, { data: 'total' }]],
    });
  });

  it('omits the total row entirely when the total query itself returns no rows (no malformed row with missing measure cells)', () => {
    const bucketed: QueryResultData = {
      columns: [
        { name: 'Date.Months', type: 'date' },
        { name: 'total revenue', type: 'number' },
      ],
      rows: [[{ data: '2024-01-01T00:00:00' }, { data: 100 }]],
    };
    const total: QueryResultData = {
      columns: [{ name: 'total revenue', type: 'number' }],
      rows: [],
    };

    expect(mergeTotalIntoResult(bucketed, total)).toEqual<QueryResultData>({
      columns: [
        { name: 'Date.Months', type: 'date' },
        { name: 'total revenue', type: 'number' },
        { name: KPI_ROW_TYPE_COLUMN, type: 'string' },
      ],
      rows: [[{ data: '2024-01-01T00:00:00' }, { data: 100 }, { data: 'bucket' }]],
    });
  });
});
