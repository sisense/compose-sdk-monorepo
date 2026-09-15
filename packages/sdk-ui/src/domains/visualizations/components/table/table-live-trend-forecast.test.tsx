/** @vitest-environment jsdom */
import {
  type Attribute,
  createAttribute,
  isForecastMeasure,
  isTrendMeasure,
  type Measure,
  measureFactory,
} from '@sisense/sdk-data';
import { render } from '@testing-library/react';

import { setupI18nMock } from '@/__test-helpers__';
import { executeQueryMock } from '@/domains/query-execution/core/__mocks__/execute-query';
import { type ClientApplication } from '@/infra/app/types';
import { useSisenseContextMock } from '@/infra/contexts/sisense-context/__mocks__/sisense-context';
import { SisenseContextPayload } from '@/infra/contexts/sisense-context/sisense-context';

import { Table } from './table';

setupI18nMock();

vi.mock('@/domains/query-execution/core/execute-query');
vi.mock('@/infra/contexts/sisense-context/sisense-context');

const monthsAttribute = createAttribute({
  name: 'Months',
  type: 'datelevel',
  expression: '[Commerce.Date (Month)]',
});
const countryAttribute = createAttribute({
  name: 'Country',
  type: 'text-attribute',
  expression: '[Commerce.Country]',
});
const revenueMeasure = measureFactory.sum(
  createAttribute({
    name: 'Revenue',
    type: 'numeric-attribute',
    expression: '[Commerce.Revenue]',
  }),
  'Revenue',
);

type QueryDescription = { dimensions: Attribute[]; measures: Measure[]; ungroup: boolean };

describe('Table: live DataSource with two dimensions plus trend/forecast', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const contextMock: SisenseContextPayload = {
      app: {
        httpClient: {},
        settings: { queryLimit: 20000, queryCacheConfig: { enabled: false } },
      } as ClientApplication,
      isInitialized: true,
      tracking: { enabled: false, packageName: 'sdk-ui' },
      errorBoundary: { showErrorBox: true },
    };
    useSisenseContextMock.mockReturnValue(contextMock);

    // Echoes back whatever dimensions/measures were actually requested, plus the
    // backend's unrequested confidence-band columns alongside the forecast measure —
    // so the response is always consistent with the real (aliased) query, regardless
    // of the exact alias string `withUniqueMeasureNames` assigns.
    executeQueryMock.mockImplementation(async (queryDescription: QueryDescription) => {
      const { dimensions, measures } = queryDescription;
      const forecastMeasure = measures.find(isForecastMeasure);

      const columns = [
        ...dimensions.map((d) => ({ name: d.name, type: 'string' })),
        ...measures.map((m) => ({ name: m.name, type: 'number' })),
        ...(forecastMeasure
          ? [
              { name: `${forecastMeasure.name}_upper`, type: 'number' },
              { name: `${forecastMeasure.name}_lower`, type: 'number' },
            ]
          : []),
      ];
      const row = columns.map((_, i) => (i < dimensions.length ? `value-${i}` : (i + 1) * 10));

      return { columns, rows: [row] };
    });
  });

  it('sends base + trend + forecast measures and renders base/trend/forecast/bound columns without a measureNotFound error', async () => {
    const { findByTestId, findAllByRole, queryByLabelText } = render(
      <Table
        dataSet="Sample ECommerce"
        dataOptions={{
          columns: [
            { column: monthsAttribute },
            { column: countryAttribute },
            {
              column: revenueMeasure,
              trend: { modelType: 'linear' },
              forecast: { forecastHorizon: 3 },
            },
          ],
        }}
        // fixed-data-table-2 only renders the columns that fit within the visible width — wide
        // enough here for all 7 (2 dimensions + base/trend/forecast/upper/lower) at ~120px each.
        styleOptions={{ width: 1200 }}
      />,
    );

    expect(await findByTestId('table-root')).toBeTruthy();

    expect(executeQueryMock).toHaveBeenCalledTimes(1);
    const queryDescription = executeQueryMock.mock.calls[0][0] as QueryDescription;

    // ungroup must be skipped whenever a trend/forecast measure is present (BE#081586).
    expect(queryDescription.ungroup).toBe(false);

    // Exactly one base, one trend, and one forecast measure were sent to the query.
    expect(queryDescription.measures).toHaveLength(3);
    expect(queryDescription.measures.filter(isTrendMeasure)).toHaveLength(1);
    expect(queryDescription.measures.filter(isForecastMeasure)).toHaveLength(1);
    expect(
      queryDescription.measures.filter((m) => !isTrendMeasure(m) && !isForecastMeasure(m)),
    ).toHaveLength(1);

    const headers = await findAllByRole('columnheader');
    expect(headers.map((h) => h.textContent)).toEqual([
      'Months',
      'Country',
      'Revenue',
      'Revenue Trend',
      'Revenue Forecast',
      'Revenue Forecast Upper Bound',
      'Revenue Forecast Lower Bound',
    ]);

    // The core assertion: with the real (aliased) measures round-tripped through the mocked
    // query response, validateDataOptionsAgainstData resolves every column and does not
    // raise measureNotFound.
    expect(queryByLabelText('error-box')).toBeFalsy();
  });
});
