import { measureFactory } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import type { ChartWidgetProps } from '@/domains/widgets/components/chart-widget/types';
import type { PivotTableWidgetProps } from '@/domains/widgets/components/pivot-table-widget/types';
import type { WidgetProps, WithCommonWidgetProps } from '@/domains/widgets/components/widget/types';
import { NARRATIVE_BY_CSDK } from '@/infra/api/narrative/narrative-constants.js';
import type { CartesianChartDataOptions } from '@/types';

import { buildDashboardNarrativeQueries } from './build-dashboard-narrative-queries.js';
import { buildWidgetNarrativeRequests } from './widget-props-to-narrative-params.js';

const chartWithTrend: WithCommonWidgetProps<ChartWidgetProps, 'chart'> = {
  widgetType: 'chart',
  id: 'c1',
  title: 'Revenue by month',
  chartType: 'line',
  dataSource: DM.DataSource,
  dataOptions: {
    category: [DM.Commerce.Date.Months],
    value: [
      {
        column: measureFactory.sum(DM.Commerce.Revenue),
        trend: {},
        forecast: { modelType: 'holtWinters' },
      },
    ],
    breakBy: [],
  },
};

const pivot: WithCommonWidgetProps<PivotTableWidgetProps, 'pivot'> = {
  widgetType: 'pivot',
  id: 'p1',
  title: 'Cost by age range',
  dataSource: DM.DataSource,
  dataOptions: {
    rows: [DM.Commerce.AgeRange],
    values: [measureFactory.sum(DM.Commerce.Cost, 'Total Cost')],
  },
};

const text: WidgetProps = {
  widgetType: 'text',
  id: 't1',
  styleOptions: { html: '<p>hello</p>', bgColor: '#fff', vAlign: 'valign-middle' },
};

const filter: WidgetProps = {
  widgetType: 'filter',
  id: 'f1',
  attribute: DM.Commerce.Gender,
};

const narrative: WidgetProps = { widgetType: 'narrative', id: 'n1', title: 'Dashboard Narrative' };

describe('buildDashboardNarrativeQueries', () => {
  it('returns one query per chart or pivot widget, in the given order', () => {
    const queries = buildDashboardNarrativeQueries([pivot, chartWithTrend]);

    expect(queries.map((query) => query.title)).toEqual(['Cost by age range', 'Revenue by month']);
  });

  it('forwards the chart type of a chart widget and labels a pivot as pivot', () => {
    const queries = buildDashboardNarrativeQueries([chartWithTrend, pivot]);

    expect(queries.map((query) => query.chartType)).toEqual(['line', 'pivot']);
  });

  it('carries the widget JAQL with the client origin tag', () => {
    const [query] = buildDashboardNarrativeQueries([chartWithTrend]);

    expect(query.jaql.datasource).toMatchObject({ title: 'Sample ECommerce' });
    expect(query.jaql.metadata?.length).toBeGreaterThan(0);
    expect(query.jaql.by).toBe(NARRATIVE_BY_CSDK);
  });

  it('strips trend and forecast companion measures', () => {
    const { narrativeRequest } = buildWidgetNarrativeRequests(chartWithTrend);
    const [query] = buildDashboardNarrativeQueries([chartWithTrend]);

    expect(query.jaql.metadata).toHaveLength(2);
    expect(narrativeRequest?.jaql.metadata).toHaveLength(4);
  });

  it('leaves out text, filter and narrative widgets', () => {
    const queries = buildDashboardNarrativeQueries([text, chartWithTrend, filter, narrative]);

    expect(queries).toHaveLength(1);
    expect(queries[0].title).toBe('Revenue by month');
  });

  it('leaves out a chart whose data source cannot be resolved', () => {
    const queries = buildDashboardNarrativeQueries([{ ...chartWithTrend, dataSource: undefined }]);

    expect(queries).toEqual([]);
  });

  it('falls back to the default data source', () => {
    const queries = buildDashboardNarrativeQueries(
      [{ ...chartWithTrend, dataSource: undefined }],
      DM.DataSource,
    );

    expect(queries).toHaveLength(1);
    expect(queries[0].jaql.datasource).toMatchObject({ title: 'Sample ECommerce' });
  });

  it('omits the title when the widget has none', () => {
    const [query] = buildDashboardNarrativeQueries([{ ...chartWithTrend, title: undefined }]);

    expect(query.title).toBeUndefined();
  });

  it('returns an empty list for no widgets', () => {
    expect(buildDashboardNarrativeQueries([])).toEqual([]);
  });
});

describe('buildDashboardNarrativeQueries — measureFormats', () => {
  const revenue = measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue');
  const cost = measureFactory.sum(DM.Commerce.Cost, 'Total Cost');

  const columnChart = (
    value: CartesianChartDataOptions['value'],
  ): WithCommonWidgetProps<ChartWidgetProps, 'chart'> => ({
    widgetType: 'chart',
    id: 'c2',
    chartType: 'column',
    dataSource: DM.DataSource,
    dataOptions: { category: [DM.Commerce.AgeRange], value, breakBy: [] },
  });

  it('keys each measure format by the measure title in the query JAQL', () => {
    const [query] = buildDashboardNarrativeQueries([
      columnChart([{ column: revenue, numberFormatConfig: { name: 'Currency', symbol: '€' } }]),
    ]);

    const titles = query.jaql.metadata?.map((item) => item.jaql?.title);
    expect(titles).toContain('Total Revenue');
    expect(Object.keys(query.measureFormats ?? {})).toEqual(['Total Revenue']);
  });

  it('maps a currency config onto a currency mask', () => {
    const [query] = buildDashboardNarrativeQueries([
      columnChart([
        {
          column: revenue,
          numberFormatConfig: {
            name: 'Currency',
            symbol: '€',
            prefix: false,
            decimalScale: 2,
            kilo: false,
            million: true,
          },
        },
      ]),
    ]);

    expect(query.measureFormats?.['Total Revenue']).toMatchObject({
      currency: { symbol: '€', position: 'post' },
      decimals: 2,
      abbreviations: { k: false, m: true },
    });
  });

  it('maps a percent config onto a percent mask', () => {
    const [query] = buildDashboardNarrativeQueries([
      columnChart([{ column: revenue, numberFormatConfig: { name: 'Percent', decimalScale: 1 } }]),
    ]);

    expect(query.measureFormats?.['Total Revenue']).toMatchObject({
      type: 'percent',
      decimals: 1,
    });
    expect(query.measureFormats?.['Total Revenue']).not.toHaveProperty('currency');
  });

  it('gives a measure without a config the default format the widget renders with', () => {
    const [query] = buildDashboardNarrativeQueries([columnChart([revenue])]);

    expect(query.measureFormats?.['Total Revenue']).toMatchObject({
      type: 'number',
      decimals: 'auto',
      separated: true,
      abbreviations: { k: true, m: true, b: true, t: true },
    });
  });

  it('covers every measure of a chart', () => {
    const [query] = buildDashboardNarrativeQueries([
      columnChart([{ column: revenue, numberFormatConfig: { name: 'Percent' } }, cost]),
    ]);

    expect(Object.keys(query.measureFormats ?? {})).toEqual(['Total Revenue', 'Total Cost']);
  });

  it('covers the values of a pivot', () => {
    const [query] = buildDashboardNarrativeQueries([
      {
        ...pivot,
        dataOptions: {
          rows: [DM.Commerce.AgeRange],
          values: [{ column: cost, numberFormatConfig: { name: 'Currency', symbol: '$' } }],
        },
      },
    ]);

    expect(query.measureFormats?.['Total Cost']).toMatchObject({
      currency: { symbol: '$', position: 'pre' },
    });
  });

  it('leaves out the trend and forecast companions', () => {
    const [query] = buildDashboardNarrativeQueries([chartWithTrend]);

    expect(Object.keys(query.measureFormats ?? {})).toEqual(['sum Revenue']);
  });

  it('omits measureFormats from a query without measures', () => {
    const [query] = buildDashboardNarrativeQueries([
      {
        ...pivot,
        dataOptions: { rows: [DM.Commerce.AgeRange], values: [] },
      },
    ]);

    expect(query).not.toHaveProperty('measureFormats');
  });
});
