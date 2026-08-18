import type { Data } from '@sisense/sdk-data';
import { render } from '@testing-library/react';

import { formatKpiValue } from './chart/restructured-charts/kpi-chart/renderer/helpers';
import { KpiChart } from './kpi-chart';

// The sparkline renders through Highcharts, which errors in the test environment.
vi.mock('highcharts-react-official', () => ({
  default: () => <div>Mock Sparkline</div>,
}));

const dataSet: Data = {
  columns: [
    { name: 'Months', type: 'date' },
    { name: 'Revenue', type: 'number' },
  ],
  rows: [
    ['2026-01-01', 100],
    ['2026-02-01', 120],
  ],
};

const category = { name: 'Months', type: 'date' };
const value = { column: { name: 'Revenue', aggregation: 'sum' } };

/** Last bucket of `dataSet`, i.e. the headline under the default `valueMode: 'last'`. */
const LAST_BUCKET_VALUE = 120;
const MODIFIED_VALUE = 987;

/**
 * Replaces the measure cell of the last row, leaving every other cell -- and the columns --
 * exactly as received. Mirrors the spread-and-map shape the prop's TSDoc asks consumers for.
 */
const withModifiedLastRow = (data: Data): Data => ({
  ...data,
  rows: data.rows.map((row, index) =>
    index === data.rows.length - 1 ? [row[0], MODIFIED_VALUE] : row,
  ),
});

describe('KpiChart', () => {
  it('renders the headline from the retrieved data when no onDataReady is given', async () => {
    const { findByText } = render(<KpiChart dataSet={dataSet} dataOptions={{ value, category }} />);

    expect(await findByText(formatKpiValue(LAST_BUCKET_VALUE))).toBeInTheDocument();
  });

  it('calls onDataReady with the retrieved data and builds the card from what it returns', async () => {
    const onDataReady = vi.fn(withModifiedLastRow);

    const { findByText } = render(
      <KpiChart dataSet={dataSet} dataOptions={{ value, category }} onDataReady={onDataReady} />,
    );

    expect(await findByText(formatKpiValue(MODIFIED_VALUE))).toBeInTheDocument();

    const receivedData = onDataReady.mock.calls[0][0];
    expect(receivedData.columns.map((column) => column.name)).toEqual(['Months', 'Revenue']);
    expect(receivedData.rows).toHaveLength(dataSet.rows.length);
  });

  it('renders an error when onDataReady returns something that is not data', async () => {
    // Deliberately breaks the `(data: Data) => Data` contract to exercise the runtime
    // validation, so the return type has to be widened past what the prop accepts.
    const onDataReady = vi.fn(() => undefined as unknown as Data);

    const { findByLabelText } = render(
      <KpiChart dataSet={dataSet} dataOptions={{ value, category }} onDataReady={onDataReady} />,
    );

    expect(await findByLabelText('error-box')).toBeInTheDocument();
    expect(onDataReady).toHaveBeenCalled();
  });
});
