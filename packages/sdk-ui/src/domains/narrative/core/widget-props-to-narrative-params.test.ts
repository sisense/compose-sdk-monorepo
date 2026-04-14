import { measureFactory } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import * as DM from '@/__test-helpers__/sample-ecommerce';

import {
  convertChartWidgetPropsToNarrativeParams,
  convertPivotWidgetPropsToNarrativeRequest,
} from './widget-props-to-narrative-params.js';

describe('convertChartWidgetPropsToNarrativeParams', () => {
  it('includes trend and forecast companion measures from styled value columns', () => {
    const params = convertChartWidgetPropsToNarrativeParams({
      chartType: 'bar',
      dataSource: DM.DataSource as unknown as import('@sisense/sdk-data').DataSource,
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

  it('omits trend and forecast companion measures when ignoreTrendAndForecast is true', () => {
    const params = convertChartWidgetPropsToNarrativeParams(
      {
        chartType: 'bar',
        dataSource: DM.DataSource as unknown as import('@sisense/sdk-data').DataSource,
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
      },
      undefined,
      undefined,
      true,
    );
    expect(params.measures).toHaveLength(1);
  });
});

describe('convertPivotWidgetPropsToNarrativeRequest', () => {
  it('produces pivot JAQL with format pivot', () => {
    const request = convertPivotWidgetPropsToNarrativeRequest({
      widgetType: 'pivot',
      id: 'p1',
      dataSource: DM.DataSource as unknown as import('@sisense/sdk-data').DataSource,
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
