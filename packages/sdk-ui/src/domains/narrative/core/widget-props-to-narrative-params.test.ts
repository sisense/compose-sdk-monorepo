import { measureFactory } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';
import type { ChartWidgetProps } from '@/domains/widgets/components/chart-widget/types';
import type { PivotTableWidgetProps } from '@/domains/widgets/components/pivot-table-widget/types';
import type { WidgetProps, WithCommonWidgetProps } from '@/domains/widgets/components/widget/types';

import {
  buildWidgetNarrativeRequests,
  convertChartWidgetPropsToNarrativeParams,
  convertPivotWidgetPropsToNarrativeRequest,
  convertWidgetPropsToNarrativeParams,
} from './widget-props-to-narrative-params.js';

describe('convertChartWidgetPropsToNarrativeParams', () => {
  it('includes trend and forecast companion measures from styled value columns', () => {
    const params = convertChartWidgetPropsToNarrativeParams({
      chartType: 'bar',
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
    });
    expect(params.measures).toHaveLength(3);
  });

  it('omits trend and forecast companion measures when includeTrendAndForecast is false', () => {
    const params = convertChartWidgetPropsToNarrativeParams({
      chartType: 'bar',
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
      config: {
        narrative: { includeTrendAndForecast: false },
      },
    });
    expect(params.measures).toHaveLength(1);
  });
});

const chartPropsWithTrend: WithCommonWidgetProps<ChartWidgetProps, 'chart'> = {
  widgetType: 'chart',
  id: 'c1',
  chartType: 'bar',
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

const pivotProps: WithCommonWidgetProps<PivotTableWidgetProps, 'pivot'> = {
  widgetType: 'pivot',
  id: 'p1',
  dataSource: DM.DataSource,
  dataOptions: {
    rows: [DM.Commerce.AgeRange],
    columns: [{ column: DM.Commerce.Gender, includeSubTotals: true }],
    values: [measureFactory.sum(DM.Commerce.Cost, 'Total Cost')],
  },
};

describe('buildWidgetNarrativeRequests', () => {
  describe('chart widget', () => {
    it('returns supported=true with both requests when includeTrendAndForecast is true (default)', () => {
      const { supported, narrativeRequest, narrativeFallbackRequest } =
        buildWidgetNarrativeRequests(chartPropsWithTrend);

      expect(supported).toBe(true);
      expect(narrativeRequest).toBeDefined();
      expect(narrativeFallbackRequest).toBeDefined();
    });

    it('fallback has fewer JAQL metadata items than primary (trend/forecast stripped)', () => {
      const { narrativeRequest, narrativeFallbackRequest } =
        buildWidgetNarrativeRequests(chartPropsWithTrend);

      if (!narrativeRequest || !narrativeFallbackRequest) {
        throw new Error('Expected primary and fallback narrative requests.');
      }

      const primaryCount = narrativeRequest.jaql.metadata?.length ?? 0;
      const fallbackCount = narrativeFallbackRequest.jaql.metadata?.length ?? 0;
      expect(fallbackCount).toBeLessThan(primaryCount);
    });

    it('returns supported=true with no fallback when includeTrendAndForecast is false', () => {
      const props: WithCommonWidgetProps<ChartWidgetProps, 'chart'> = {
        ...chartPropsWithTrend,
        config: {
          narrative: { includeTrendAndForecast: false },
        },
      };
      const { supported, narrativeRequest, narrativeFallbackRequest } =
        buildWidgetNarrativeRequests(props);

      expect(supported).toBe(true);
      expect(narrativeRequest).toBeDefined();
      expect(narrativeFallbackRequest).toBeUndefined();
    });

    it('returns supported=false when dataSource cannot be resolved', () => {
      const { supported, narrativeRequest, narrativeFallbackRequest, missingDataSource } =
        buildWidgetNarrativeRequests({
          ...chartPropsWithTrend,
          dataSource: undefined,
        });

      expect(supported).toBe(false);
      expect(missingDataSource).toBe(true);
      expect(narrativeRequest).toBeUndefined();
      expect(narrativeFallbackRequest).toBeUndefined();
    });
  });

  describe('pivot widget', () => {
    it('returns supported=true with both requests when includeTrendAndForecast is true (default)', () => {
      const { supported, narrativeRequest, narrativeFallbackRequest } =
        buildWidgetNarrativeRequests(pivotProps);

      expect(supported).toBe(true);
      expect(narrativeRequest).toBeDefined();
      expect(narrativeFallbackRequest).toBeDefined();
    });

    it('returns supported=true with no fallback when includeTrendAndForecast is false', () => {
      const props: WithCommonWidgetProps<PivotTableWidgetProps, 'pivot'> = {
        ...pivotProps,
        config: {
          narrative: { includeTrendAndForecast: false },
        },
      };
      const { supported, narrativeFallbackRequest } = buildWidgetNarrativeRequests(props);

      expect(supported).toBe(true);
      expect(narrativeFallbackRequest).toBeUndefined();
    });
  });

  describe('unsupported widget type', () => {
    it('returns supported=false for text widgets', () => {
      const textWidget: WidgetProps = {
        widgetType: 'text',
        id: 't1',
        styleOptions: {
          html: '<p>Text widget</p>',
          vAlign: 'valign-top',
          bgColor: '#ffffff',
        },
      };

      const { supported, narrativeRequest, narrativeFallbackRequest } =
        buildWidgetNarrativeRequests(textWidget);

      expect(supported).toBe(false);
      expect(narrativeRequest).toBeUndefined();
      expect(narrativeFallbackRequest).toBeUndefined();
    });
  });
});

describe('convertWidgetPropsToNarrativeParams', () => {
  it('returns a narrative request for chart props with widgetType', () => {
    const request = convertWidgetPropsToNarrativeParams(chartPropsWithTrend);
    expect(request.jaql.metadata?.length).toBeGreaterThan(0);
  });

  it('returns pivot-format narrative request for pivot props', () => {
    const request = convertWidgetPropsToNarrativeParams(pivotProps);
    expect(request.jaql.format).toBe('pivot');
  });
});

describe('convertPivotWidgetPropsToNarrativeRequest', () => {
  it('produces pivot JAQL with format pivot', () => {
    const request = convertPivotWidgetPropsToNarrativeRequest({
      widgetType: 'pivot',
      id: 'p1',
      dataSource: DM.DataSource,
      dataOptions: {
        rows: [DM.Commerce.AgeRange],
        columns: [{ column: DM.Commerce.Gender, includeSubTotals: true }],
        values: [measureFactory.sum(DM.Commerce.Cost, 'Total Cost')],
      },
    });
    expect(request.jaql.format).toBe('pivot');
    expect(request.jaql.metadata?.length).toBeGreaterThan(0);
    expect(request.jaql.grandTotals).toBeDefined();
  });
});
