/** @vitest-environment jsdom */
import { type Data, filterFactory, measureFactory, type QueryResultData } from '@sisense/sdk-data';
import type Highcharts from '@sisense/sisense-charts';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import get from 'lodash-es/get';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import { executeQueryMock } from '@/domains/query-execution/core/__mocks__/execute-query';
import { QueryDescription } from '@/domains/query-execution/core/execute-query';
import { useSisenseContextMock } from '@/infra/contexts/sisense-context/__mocks__/sisense-context';
import { SisenseContextPayload } from '@/infra/contexts/sisense-context/sisense-context';
import { translation } from '@/infra/translation/resources/en';
import type { KpiChartProps } from '@/props';
import type { KpiRenderOptions } from '@/types';

import { formatKpiValue } from './chart/restructured-charts/kpi-chart/renderer/helpers';
import { KpiChart } from './kpi-chart';

vi.mock('@/domains/query-execution/core/execute-query');
vi.mock('@/infra/contexts/sisense-context/sisense-context');

// i18n resources are not loaded in a full-component test, so `t` would return raw keys. Resolve
// interpolated keys against the real en dictionary so the readout assertions see the rendered
// text (e.g. `+20.00%`, `60% of goal`); plain keys pass through unchanged.
vi.mock('react-i18next', async (importOriginal) => {
  const mod = await importOriginal<typeof import('react-i18next')>();
  const t = (key: string, params?: Record<string, unknown>) => {
    const template = get(translation, key) as string | undefined;
    if (!params || typeof template !== 'string') {
      return key;
    }
    return Object.entries(params).reduce(
      (text, [name, value]) => text.split(`{{${name}}}`).join(String(value)),
      template,
    );
  };
  return { ...mod, useTranslation: () => ({ t }) };
});

const { sparklineOptionsSpy } = vi.hoisted(() => ({ sparklineOptionsSpy: vi.fn() }));

// The sparkline renders through Highcharts, which errors in the test environment. The mock
// records the options it was handed so the sparkline-type assertions can read them back.
vi.mock('highcharts-react-official', () => ({
  default: (props: { options: Highcharts.Options }) => {
    sparklineOptionsSpy(props.options);
    return <div data-testid="mock-sparkline" />;
  },
}));

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

const dataSet: Data = {
  columns: [
    { name: 'Months', type: 'date' },
    { name: 'Revenue', type: 'number' },
    { name: 'Cost', type: 'number' },
  ],
  rows: [
    ['2026-01-01', 100, 80],
    ['2026-02-01', 120, 90],
  ],
};

const category = { name: 'Months', type: 'date' };
const revenue = { column: { name: 'Revenue', aggregation: 'sum' } };
const cost = { column: { name: 'Cost', aggregation: 'sum' } };

const LAST_REVENUE = 120;
const LAST_COST = 90;
const LAST_PERIOD_CAPTION = 'Feb 2026';

const baseProps: KpiChartProps = { dataSet, dataOptions: { value: revenue, category } };

/** Builds a 'lg'-tier rect (per `use-size-tier.ts` thresholds) so the sparkline has room. */
function mockCardSize(width = 600, height = 300) {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width,
    height,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
}

/** Renders the card once and hands back a same-instance `update` (no `key`, no remount). */
function renderKpi(props: Partial<KpiChartProps> = {}) {
  const utils = render(<KpiChart {...baseProps} {...props} />);
  const update = (next: Partial<KpiChartProps>) =>
    utils.rerender(<KpiChart {...baseProps} {...next} />);
  return { ...utils, update };
}

/** Sparkline series type from the most recent options handed to the (mocked) Highcharts. */
function lastSparklineType(): string | undefined {
  const options = sparklineOptionsSpy.mock.calls.at(-1)?.[0] as Highcharts.Options | undefined;
  return options?.series?.[0]?.type ?? options?.chart?.type;
}

describe('KpiChart prop reactivity without remount', () => {
  beforeEach(() => {
    sparklineOptionsSpy.mockClear();
    useSisenseContextMock.mockReturnValue(contextFixture());
    mockCardSize();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('data options', () => {
    it('re-reads the headline when dataSet rows change', async () => {
      const { findByText, update } = renderKpi();
      expect(await findByText(formatKpiValue(LAST_REVENUE))).toBeInTheDocument();

      update({
        dataSet: {
          ...dataSet,
          rows: [
            ['2026-01-01', 100, 80],
            ['2026-02-01', 555, 90],
          ],
        },
      });

      expect(await findByText(formatKpiValue(555))).toBeInTheDocument();
    });

    it('switches headline and title when dataOptions.value changes measure', async () => {
      const { findByText, queryByText, update } = renderKpi();
      expect(await findByText(formatKpiValue(LAST_REVENUE))).toBeInTheDocument();
      expect(queryByText('Revenue')).toBeInTheDocument();

      update({ dataOptions: { value: cost, category } });

      expect(await findByText(formatKpiValue(LAST_COST))).toBeInTheDocument();
      expect(queryByText('Cost')).toBeInTheDocument();
      expect(queryByText('Revenue')).not.toBeInTheDocument();
    });

    it('renames the title when dataOptions.value.name changes', async () => {
      const { findByText, update } = renderKpi();
      expect(await findByText('Revenue')).toBeInTheDocument();

      update({ dataOptions: { value: { ...revenue, name: 'Income' }, category } });

      expect(await findByText('Income')).toBeInTheDocument();
    });

    it('reformats the headline when dataOptions.value.numberFormatConfig changes', async () => {
      const { findByText, update } = renderKpi();
      expect(await findByText(formatKpiValue(LAST_REVENUE))).toBeInTheDocument();

      const numberFormatConfig = { decimalScale: 2, symbol: '$', prefix: true } as const;
      update({ dataOptions: { value: { ...revenue, numberFormatConfig }, category } });

      expect(
        await findByText(formatKpiValue(LAST_REVENUE, { ...numberFormatConfig })),
      ).toBeInTheDocument();
    });

    it('drops and restores sparkline + period caption when category is removed / re-added', async () => {
      const { findByText, findByTestId, queryByTestId, queryByText, update } = renderKpi();
      expect(await findByTestId('mock-sparkline')).toBeInTheDocument();
      expect(await findByText(LAST_PERIOD_CAPTION)).toBeInTheDocument();

      update({ dataOptions: { value: revenue } });

      await waitFor(() => expect(queryByTestId('mock-sparkline')).not.toBeInTheDocument());
      expect(queryByText(LAST_PERIOD_CAPTION)).not.toBeInTheDocument();

      update({ dataOptions: { value: revenue, category } });

      expect(await findByTestId('mock-sparkline')).toBeInTheDocument();
      expect(await findByText(LAST_PERIOD_CAPTION)).toBeInTheDocument();
    });

    it('walks the comparison through every variant and back to none', async () => {
      const { findByText, queryByText, update } = renderKpi();
      expect(await findByText(formatKpiValue(LAST_REVENUE))).toBeInTheDocument();
      expect(queryByText('▲')).not.toBeInTheDocument();

      // previous-period: 100 -> 120 is +20%
      update({
        dataOptions: { value: revenue, category, comparison: { type: 'previous-period' } },
      });
      expect(await findByText('▲')).toBeInTheDocument();
      expect(await findByText('+20.00%')).toBeInTheDocument();

      // target: 120 of 200 is 60% of goal
      update({
        dataOptions: { value: revenue, category, comparison: { type: 'target', target: 200 } },
      });
      expect(await findByText('60% of goal')).toBeInTheDocument();
      expect(queryByText('▲')).not.toBeInTheDocument();

      // value: shows the cost measure beside its label
      update({
        dataOptions: { value: revenue, category, comparison: { type: 'value', value: cost } },
      });
      expect(await findByText(formatKpiValue(LAST_COST))).toBeInTheDocument();
      expect(await findByText('Cost')).toBeInTheDocument();
      expect(queryByText('60% of goal')).not.toBeInTheDocument();

      // delta against cost: (120 - 90) / 90 = +33.33%
      update({
        dataOptions: { value: revenue, category, comparison: { type: 'delta', value: cost } },
      });
      expect(await findByText('▲')).toBeInTheDocument();
      expect(await findByText('+33.33%')).toBeInTheDocument();

      // none
      update({ dataOptions: { value: revenue, category } });
      await waitFor(() => expect(queryByText('▲')).not.toBeInTheDocument());
      expect(queryByText('+33.33%')).not.toBeInTheDocument();
    });
  });

  describe('style options', () => {
    it('reacts to title.text, title.enabled and title.showCategoryTitle', async () => {
      const { findByText, queryByText, update } = renderKpi();
      expect(await findByText('Revenue')).toBeInTheDocument();
      expect(await findByText(LAST_PERIOD_CAPTION)).toBeInTheDocument();

      update({ styleOptions: { title: { text: 'Custom title' } } });
      expect(await findByText('Custom title')).toBeInTheDocument();
      expect(queryByText('Revenue')).not.toBeInTheDocument();

      update({ styleOptions: { title: { text: 'Custom title', showCategoryTitle: false } } });
      await waitFor(() => expect(queryByText(LAST_PERIOD_CAPTION)).not.toBeInTheDocument());
      expect(queryByText('Custom title')).toBeInTheDocument();

      update({ styleOptions: { title: { text: 'Custom title', enabled: false } } });
      await waitFor(() => expect(queryByText('Custom title')).not.toBeInTheDocument());
      expect(queryByText(LAST_PERIOD_CAPTION)).not.toBeInTheDocument();

      update({ styleOptions: {} });
      expect(await findByText('Revenue')).toBeInTheDocument();
    });

    it('applies a fixed value.textSize and reverts to auto', async () => {
      const { findByText, update } = renderKpi();
      const headline = await findByText(formatKpiValue(LAST_REVENUE));
      const autoFontSize = headline.style.fontSize;
      expect(autoFontSize).not.toBe('24px');

      update({ styleOptions: { value: { textSize: 24 } } });
      await waitFor(() =>
        expect(findByText(formatKpiValue(LAST_REVENUE))).resolves.toHaveStyle({ fontSize: '24px' }),
      );

      update({ styleOptions: { value: { textSize: 'auto' } } });
      await waitFor(() =>
        expect(findByText(formatKpiValue(LAST_REVENUE))).resolves.toHaveStyle({
          fontSize: autoFontSize,
        }),
      );
    });

    it('swaps value.noDataText on an empty dataset', async () => {
      const emptyDataSet: Data = { ...dataSet, rows: [] };
      const { findByText, queryByText, update } = renderKpi({
        dataSet: emptyDataSet,
        styleOptions: { value: { noDataText: 'N/A' } },
      });
      expect(await findByText('N/A')).toBeInTheDocument();

      update({ dataSet: emptyDataSet, styleOptions: { value: { noDataText: 'Nothing here' } } });

      expect(await findByText('Nothing here')).toBeInTheDocument();
      expect(queryByText('N/A')).not.toBeInTheDocument();
    });

    it('toggles layout between standard and comparison-first', async () => {
      const { findByRole, update } = renderKpi();
      expect(await findByRole('figure')).toHaveAttribute('data-kpi-layout', 'standard');

      update({ styleOptions: { layout: 'comparison-first' } });
      await waitFor(() =>
        expect(findByRole('figure')).resolves.toHaveAttribute(
          'data-kpi-layout',
          'comparison-first',
        ),
      );

      update({ styleOptions: { layout: 'standard' } });
      await waitFor(() =>
        expect(findByRole('figure')).resolves.toHaveAttribute('data-kpi-layout', 'standard'),
      );
    });

    it('reacts to comparison.display, comparison.label and comparison.showIcon', async () => {
      const dataOptions = {
        value: revenue,
        category,
        comparison: { type: 'previous-period' } as const,
      };
      const { findByText, queryByText, update } = renderKpi({ dataOptions });
      expect(await findByText('+20.00%')).toBeInTheDocument();
      expect(await findByText('▲')).toBeInTheDocument();

      update({ dataOptions, styleOptions: { comparison: { display: 'value' } } });
      expect(await findByText('+20')).toBeInTheDocument();
      expect(queryByText('+20.00%')).not.toBeInTheDocument();

      update({ dataOptions, styleOptions: { comparison: { display: 'both' } } });
      expect(await findByText('+20.00% (+20)')).toBeInTheDocument();

      update({ dataOptions, styleOptions: { comparison: { label: 'vs last month' } } });
      expect(await findByText('vs last month')).toBeInTheDocument();
      expect(await findByText('+20.00%')).toBeInTheDocument();

      update({ dataOptions, styleOptions: { comparison: { showIcon: false } } });
      await waitFor(() => expect(queryByText('▲')).not.toBeInTheDocument());
      expect(queryByText('vs last month')).not.toBeInTheDocument();

      update({ dataOptions, styleOptions: { comparison: { showIcon: true } } });
      expect(await findByText('▲')).toBeInTheDocument();
    });

    it('reacts to sparkline.enabled and sparkline.chartType', async () => {
      const { findByTestId, queryByTestId, update } = renderKpi();
      expect(await findByTestId('mock-sparkline')).toBeInTheDocument();
      expect(lastSparklineType()).toBe('area');

      update({ styleOptions: { sparkline: { chartType: 'column' } } });
      await waitFor(() => expect(lastSparklineType()).toBe('column'));

      update({ styleOptions: { sparkline: { enabled: false } } });
      await waitFor(() => expect(queryByTestId('mock-sparkline')).not.toBeInTheDocument());

      update({ styleOptions: { sparkline: { enabled: true, chartType: 'line' } } });
      expect(await findByTestId('mock-sparkline')).toBeInTheDocument();
      await waitFor(() => expect(lastSparklineType()).toBe('line'));
    });

    it('reacts to every card option', async () => {
      const { findByRole, update } = renderKpi();
      const figure = await findByRole('figure');
      expect(figure).toHaveStyle({ textAlign: 'start', borderRadius: '8px' });

      update({
        styleOptions: {
          card: {
            backgroundColor: 'rgb(1, 2, 3)',
            textAlign: 'center',
            showBorder: true,
            cornerRadius: 2,
          },
        },
      });

      await waitFor(() =>
        expect(findByRole('figure')).resolves.toHaveStyle({
          backgroundColor: 'rgb(1, 2, 3)',
          textAlign: 'center',
          borderRadius: '2px',
          borderTopStyle: 'solid',
        }),
      );

      update({ styleOptions: { card: { textAlign: 'right', showBorder: false } } });

      await waitFor(() =>
        expect(findByRole('figure')).resolves.toHaveStyle({
          textAlign: 'end',
          borderRadius: '8px',
          borderTopStyle: 'none',
        }),
      );
    });

    it('resizes the container when width / height change', async () => {
      const { container, findByRole, update } = renderKpi({
        styleOptions: { width: 300, height: 150 },
      });
      await findByRole('figure');
      expect(container.querySelector('div[style*="width: 300px"]')).not.toBeNull();
      expect(container.querySelector('div[style*="height: 150px"]')).not.toBeNull();

      update({ styleOptions: { width: 400, height: 250 } });

      await waitFor(() => {
        expect(container.querySelector('div[style*="width: 400px"]')).not.toBeNull();
        expect(container.querySelector('div[style*="height: 250px"]')).not.toBeNull();
        expect(container.querySelector('div[style*="width: 300px"]')).toBeNull();
      });
    });
  });

  describe('callbacks', () => {
    it('wires, swaps and unwires onDataPointClick', async () => {
      const user = userEvent.setup();
      const first = vi.fn();
      const second = vi.fn();
      const { findByRole, update } = renderKpi();
      let figure = await findByRole('figure');
      expect(figure).not.toHaveAttribute('tabindex');

      update({ onDataPointClick: first });
      await waitFor(() => expect(findByRole('figure')).resolves.toHaveAttribute('tabindex', '0'));
      figure = await findByRole('figure');
      await user.click(figure);
      expect(first).toHaveBeenCalledTimes(1);

      update({ onDataPointClick: second });
      figure = await findByRole('figure');
      await user.click(figure);
      expect(second).toHaveBeenCalledTimes(1);
      expect(first).toHaveBeenCalledTimes(1);

      update({});
      await waitFor(() => expect(findByRole('figure')).resolves.not.toHaveAttribute('tabindex'));
      figure = await findByRole('figure');
      await user.click(figure);
      expect(second).toHaveBeenCalledTimes(1);
    });

    it('re-runs a swapped onBeforeRender and stops when it is removed', async () => {
      const setValue = (value: number) => (options: KpiRenderOptions) => ({ ...options, value });
      const { findByText, update } = renderKpi({ onBeforeRender: setValue(1) });
      expect(await findByText(formatKpiValue(1))).toBeInTheDocument();

      update({ onBeforeRender: setValue(2) });
      expect(await findByText(formatKpiValue(2))).toBeInTheDocument();

      update({});
      expect(await findByText(formatKpiValue(LAST_REVENUE))).toBeInTheDocument();
    });

    it('re-runs a swapped onDataReady and stops when it is removed', async () => {
      const setLastRow = (value: number) => (data: Data) => ({
        ...data,
        rows: data.rows.map((row, index) =>
          index === data.rows.length - 1 ? [row[0], value, row[2]] : row,
        ),
      });
      const { findByText, update } = renderKpi({ onDataReady: setLastRow(987) });
      expect(await findByText(formatKpiValue(987))).toBeInTheDocument();

      update({ onDataReady: setLastRow(555) });
      expect(await findByText(formatKpiValue(555))).toBeInTheDocument();

      update({});
      expect(await findByText(formatKpiValue(LAST_REVENUE))).toBeInTheDocument();
    });
  });

  describe('query path (dataSource)', () => {
    const revenueMeasure = measureFactory.sum(DM.Commerce.Revenue);
    const costMeasure = measureFactory.sum(DM.Commerce.Cost);
    const JAN = '2026-01-01T00:00:00';
    const FEB = '2026-02-01T00:00:00';

    const resultFor = (measureName: string, values: [number, number]): QueryResultData => ({
      columns: [
        { name: DM.Commerce.Date.Months.name, type: 'datetime' },
        { name: measureName, type: 'number' },
      ],
      rows: [
        [
          { data: JAN, text: JAN },
          { data: values[0], text: String(values[0]) },
        ],
        [
          { data: FEB, text: FEB },
          { data: values[1], text: String(values[1]) },
        ],
      ],
    });

    beforeEach(() => {
      executeQueryMock.mockReset();
      // The chart queries measures under uniquified column names (`$measure0_<name>`), so the
      // result must echo the queried name back rather than the measure's own.
      executeQueryMock.mockImplementation((queryDescription: QueryDescription) => {
        const queriedName = queryDescription.measures?.[0]?.name ?? '';
        if (!queryDescription.dimensions?.length) {
          return Promise.resolve({
            columns: [{ name: queriedName, type: 'number' }],
            rows: [[{ data: 999, text: '999' }]],
          });
        }
        return Promise.resolve(
          queriedName.endsWith(costMeasure.name)
            ? resultFor(queriedName, [80, 90])
            : resultFor(queriedName, [100, 120]),
        );
      });
    });

    it('re-queries when dataOptions.value changes and when valueMode flips to total', async () => {
      const { findByText, update } = renderKpi({
        dataSet: 'Sample ECommerce',
        dataOptions: { value: revenueMeasure, category: DM.Commerce.Date.Months },
      });
      expect(await findByText(formatKpiValue(120))).toBeInTheDocument();
      expect(executeQueryMock).toHaveBeenCalledTimes(1);

      update({
        dataSet: 'Sample ECommerce',
        dataOptions: { value: costMeasure, category: DM.Commerce.Date.Months },
      });
      expect(await findByText(formatKpiValue(90))).toBeInTheDocument();
      expect(executeQueryMock).toHaveBeenCalledTimes(2);

      update({
        dataSet: 'Sample ECommerce',
        dataOptions: { value: costMeasure, category: DM.Commerce.Date.Months, valueMode: 'total' },
      });
      // 'total' with a category runs the grouped query plus the ungrouped one -> 2 more calls.
      expect(await findByText(formatKpiValue(999))).toBeInTheDocument();
      expect(executeQueryMock).toHaveBeenCalledTimes(4);
    });

    it('re-queries when filters change', async () => {
      const { findByText, update } = renderKpi({
        dataSet: 'Sample ECommerce',
        dataOptions: { value: revenueMeasure, category: DM.Commerce.Date.Months },
        filters: [],
      });
      expect(await findByText(formatKpiValue(120))).toBeInTheDocument();
      expect(executeQueryMock).toHaveBeenCalledTimes(1);

      update({
        dataSet: 'Sample ECommerce',
        dataOptions: { value: revenueMeasure, category: DM.Commerce.Date.Months },
        filters: [filterFactory.members(DM.Commerce.Gender, ['Male'])],
      });

      await waitFor(() => expect(executeQueryMock).toHaveBeenCalledTimes(2));
      expect(executeQueryMock.mock.calls[1][0].filters).toHaveLength(1);
    });

    it('adds, swaps and removes onDataReady over the same query result without re-querying', async () => {
      const queryProps = {
        dataSet: 'Sample ECommerce',
        dataOptions: { value: revenueMeasure, category: DM.Commerce.Date.Months },
      } as const;
      const setLastRow = (value: number) => (data: Data) => ({
        ...data,
        rows: data.rows.map((row, index) =>
          index === data.rows.length - 1 ? [row[0], value] : row,
        ),
      });
      const { findByText, update } = renderKpi(queryProps);
      expect(await findByText(formatKpiValue(120))).toBeInTheDocument();

      update({ ...queryProps, onDataReady: setLastRow(987) });
      expect(await findByText(formatKpiValue(987))).toBeInTheDocument();

      update({ ...queryProps, onDataReady: setLastRow(555) });
      expect(await findByText(formatKpiValue(555))).toBeInTheDocument();

      update(queryProps);
      expect(await findByText(formatKpiValue(120))).toBeInTheDocument();

      // The hook is a data-level transform, not a query input: one query serves every variant.
      expect(executeQueryMock).toHaveBeenCalledTimes(1);
    });
  });
});
