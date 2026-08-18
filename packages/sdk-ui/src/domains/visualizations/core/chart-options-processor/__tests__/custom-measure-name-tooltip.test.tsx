import { render } from '@testing-library/react';
import { vi } from 'vitest';

import type { HighchartsOptions } from '@/domains/visualizations/core/chart-options-processor/chart-options-service';
import type { HighchartsDataPointContext } from '@/domains/visualizations/core/chart-options-processor/translations/tooltip-utils';
import { CartesianChartDataOptions, LineChart } from '@/index';

/**
 * Regression coverage for a custom `name` on a value's styled measure column: the tooltip resolves
 * the hovered series back to its data option by the resolved title, which `name` overrides. Matching
 * the underlying column's `title` instead used to find nothing, dropping the value from the tooltip
 * and leaving only the series label.
 *
 * Series names are read off the generated Highcharts options rather than hardcoded, so these also
 * fail if series naming and the tooltip lookup ever diverge again.
 */

// Mocks highcharts to prevent internal `sisense-charts` related error in testing environment
vi.mock('highcharts-react-official', async () => {
  const { MockedHighchartsReact }: typeof import('@/__test-helpers__') = await vi.importActual(
    '@/__test-helpers__',
  );
  return {
    default: MockedHighchartsReact,
  };
});

const CUSTOM_MEASURE_NAME = 'Custom Value Name';

const mockData = {
  columns: [
    { name: 'Category', type: 'string' },
    { name: 'Value', type: 'number' },
    { name: 'Other', type: 'number' },
  ],
  rows: [
    ['A', 100, 7],
    ['B', 150, 9],
  ],
};

const category = [{ column: { name: 'Category', type: 'string' } }];

/** Builds the formatter context Highcharts would pass for a point of the given series. */
const pointContextForSeries = (seriesName: string, y: number): HighchartsDataPointContext => ({
  series: { name: seriesName, color: '#111111' },
  x: 'A',
  y,
  point: { name: '', color: '#222222', y },
});

/**
 * Renders the chart and formats one tooltip per generated series, pairing each point's `y` with the
 * series it belongs to.
 */
const renderAndFormatTooltips = async (
  dataOptions: CartesianChartDataOptions,
): Promise<(string | undefined)[]> => {
  let tooltips: (string | undefined)[] = [];
  const onBeforeRender = vi.fn((options: HighchartsOptions) => {
    // Re-typed to the context the formatter is written against: `HighchartsOptions` declares
    // Highcharts' own formatter signature, which this test's minimal point context doesn't satisfy.
    const formatter = options.tooltip?.formatter as unknown as
      | ((this: HighchartsDataPointContext) => string)
      | undefined;

    tooltips = (options.series ?? []).map((series) => {
      const { name = '', data } = series as { name?: string; data?: { y?: number }[] };
      return formatter?.call(pointContextForSeries(name, data?.[0]?.y ?? 0));
    });
    return options;
  });

  const { findByTestId } = render(
    <LineChart dataSet={mockData} dataOptions={dataOptions} onBeforeRender={onBeforeRender} />,
  );
  expect(await findByTestId('chart-root')).toBeInTheDocument();
  expect(onBeforeRender).toHaveBeenCalled();

  return tooltips;
};

describe('custom measure name in tooltip', () => {
  it('keeps the formatted value of a renamed measure', async () => {
    const [tooltip] = await renderAndFormatTooltips({
      category,
      value: [
        {
          column: { name: 'Value', aggregation: 'sum' },
          name: CUSTOM_MEASURE_NAME,
          numberFormatConfig: { name: 'Numbers', decimalScale: 2 },
        },
      ],
      breakBy: [],
    });

    expect(tooltip).toContain(CUSTOM_MEASURE_NAME);
    expect(tooltip).toContain('100.00');
  });

  it('resolves each series to its own format when only one measure is renamed', async () => {
    const [renamedTooltip, plainTooltip] = await renderAndFormatTooltips({
      category,
      value: [
        {
          column: { name: 'Value', aggregation: 'sum' },
          name: CUSTOM_MEASURE_NAME,
          numberFormatConfig: { name: 'Numbers', decimalScale: 2 },
        },
        {
          column: { name: 'Other', aggregation: 'sum' },
          numberFormatConfig: { name: 'Currency', decimalScale: 0 },
        },
      ],
      breakBy: [],
    });

    expect(renamedTooltip).toContain(CUSTOM_MEASURE_NAME);
    expect(renamedTooltip).toContain('100.00');
    expect(plainTooltip).toContain('$7');
  });
});
