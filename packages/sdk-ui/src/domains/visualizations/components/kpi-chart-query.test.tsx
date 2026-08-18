/** @vitest-environment jsdom */
import { type Data, measureFactory, type QueryResultData } from '@sisense/sdk-data';
import { render } from '@testing-library/react';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { executeQueryMock } from '@/domains/query-execution/core/__mocks__/execute-query';
import { QueryDescription } from '@/domains/query-execution/core/execute-query';
import { useSisenseContextMock } from '@/infra/contexts/sisense-context/__mocks__/sisense-context';
import { SisenseContextPayload } from '@/infra/contexts/sisense-context/sisense-context';

import { KPI_ROW_TYPE_COLUMN } from './chart/restructured-charts/kpi-chart/data/load-data';
import { KpiChart } from './kpi-chart';

vi.mock('@/domains/query-execution/core/execute-query');
vi.mock('@/infra/contexts/sisense-context/sisense-context');

// The sparkline renders through Highcharts, which errors in the test environment.
vi.mock('highcharts-react-official', () => ({
  default: () => <div>Mock Sparkline</div>,
}));

const revenue = measureFactory.sum(DM.Commerce.Revenue);

const JAN = '2026-01-01T00:00:00';
const FEB = '2026-02-01T00:00:00';

/** Grouped-by-month result: the buckets the sparkline is built from. */
const bucketedResult: QueryResultData = {
  columns: [
    { name: DM.Commerce.Date.Months.name, type: 'datetime' },
    { name: revenue.name, type: 'number' },
  ],
  rows: [
    [
      { data: JAN, text: JAN },
      { data: 100, text: '100' },
    ],
    [
      { data: FEB, text: FEB },
      { data: 120, text: '120' },
    ],
  ],
};

/** Ungrouped result: the whole-period aggregate, deliberately not the sum of the buckets. */
const totalResult: QueryResultData = {
  columns: [{ name: revenue.name, type: 'number' }],
  rows: [[{ data: 999, text: '999' }]],
};

/**
 * Sisense context this test needs: an `app` carrying only the settings the KPI load path reads
 * (`queryLimit`) plus what the component decorator reads (tracking, loading indicator).
 *
 * The single assertion is the fixture boundary: `ClientApplication` is a large runtime object —
 * REST client, query clients, pivot clients — and building a real one would mock the very query
 * layer this test replaces. Everything the code under test touches is present; the assertion
 * covers only the fields it does not.
 */
const contextFixture = (): SisenseContextPayload =>
  ({
    app: {
      settings: {
        queryLimit: 20000,
        trackingConfig: { enabled: false },
        loadingIndicatorConfig: { enabled: true, delay: 0 },
      },
    },
    isInitialized: true,
    tracking: { enabled: false, packageName: '' },
    errorBoundary: { showErrorBox: true },
  } as SisenseContextPayload);

describe('KpiChart - dual-query onDataReady contract', () => {
  beforeEach(() => {
    executeQueryMock.mockReset();
    // `valueMode: 'total'` with a category runs two queries: the regular grouped one and an
    // ungrouped one for the whole-period aggregate. They are told apart by their dimensions.
    executeQueryMock.mockImplementation((queryDescription: QueryDescription) =>
      Promise.resolve(queryDescription.dimensions?.length ? bucketedResult : totalResult),
    );

    useSisenseContextMock.mockReturnValue(contextFixture());
  });

  it('runs onDataReady once, over the merged result of both queries', async () => {
    const onDataReady = vi.fn((data: Data) => data);

    render(
      <KpiChart
        dataSet="Sample ECommerce"
        dataOptions={{
          value: revenue,
          category: DM.Commerce.Date.Months,
          valueMode: 'total',
        }}
        onDataReady={onDataReady}
      />,
    );

    await vi.waitFor(() => expect(onDataReady).toHaveBeenCalled());

    // Both queries ran, and the hook fired once -- it sees the merged result, not one call per
    // query. This is the ordering the prop's TSDoc promises: the merge happens during loading,
    // before the data-level hook.
    expect(executeQueryMock).toHaveBeenCalledTimes(2);
    expect(onDataReady).toHaveBeenCalledTimes(1);

    const receivedData = onDataReady.mock.calls[0][0];

    // The merged shape: the bucketed columns plus the marker column...
    expect(receivedData.columns.map((column) => column.name)).toEqual([
      DM.Commerce.Date.Months.name,
      revenue.name,
      KPI_ROW_TYPE_COLUMN,
    ]);

    // ...one row per bucket, each marked as such, plus a single appended total row.
    const cellData = (row: Data['rows'][number], index: number) => {
      const cell = row[index];
      return typeof cell === 'object' && cell !== null && 'data' in cell ? cell.data : cell;
    };
    expect(receivedData.rows.map((row) => cellData(row, 2))).toEqual(['bucket', 'bucket', 'total']);

    // The measure values have to be asserted alongside the markers: markers alone would still
    // pass if the total row carried a bucket's value. 999 is the ungrouped aggregate and is
    // deliberately not the buckets' sum, so reading the wrong row cannot go unnoticed.
    expect(receivedData.rows.map((row) => cellData(row, 1))).toEqual([100, 120, 999]);

    // The total row's category cell is the blank placeholder standing in for the dropped
    // grouping dimension -- the reason the marker column exists at all, since that cell parses
    // to NaN and must never reach bucket iteration.
    expect(cellData(receivedData.rows[2], 0)).toBe('');
  });
});
