/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { MetadataItem } from '@sisense/sdk-query-client';
import { deriveChartFamily, getChartOptions } from './get-widget-options';
import { ChartRecommendations } from '../api/types';
import { getDefaultStyleOptions } from '@/chart-options-processor/chart-options-service';

describe('deriveChartFamily', () => {
  it('should return correct chart families for chart types', () => {
    const tests: { chartType: string; chartFamily: string }[] = [
      {
        chartType: 'column',
        chartFamily: 'cartesian',
      },
      {
        chartType: 'pie',
        chartFamily: 'categorical',
      },
      {
        chartType: 'scatter',
        chartFamily: 'scatter',
      },
      {
        chartType: 'scattermap',
        chartFamily: 'scattermap',
      },
      {
        chartType: 'indicator',
        chartFamily: 'indicator',
      },
      {
        chartType: 'areamap',
        chartFamily: 'areamap',
      },
      {
        chartType: 'boxplot',
        chartFamily: 'boxplot',
      },
      {
        chartType: 'table',
        chartFamily: 'table',
      },
    ];
    tests.forEach((test) => {
      expect(deriveChartFamily(test.chartType)).toBe(test.chartFamily);
    });
  });
});

describe('getChartOptions', () => {
  it('should return chart options with correct style options based on value of useCustomizedStyleOptions', () => {
    const jaql: MetadataItem[] = [];
    const chartRecommendations: ChartRecommendations = {
      chartFamily: 'cartesian',
      chartType: 'bar',
      axesMapping: {},
    };

    const { dataOptions, chartStyleOptions, expandedChartStyleOptions } = getChartOptions(
      jaql,
      chartRecommendations,
      false,
    );

    expect(dataOptions).toBeDefined();
    expect(chartStyleOptions).toEqual(getDefaultStyleOptions());
    expect(expandedChartStyleOptions).toEqual(getDefaultStyleOptions());
  });
});
