/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { getChartOptions } from './get-widget-options';
import { getDefaultStyleOptions } from '@/chart-options-processor/chart-options-service';
import { ChartRecommendations } from '@/analytics-composer/types';
import { MetadataItem } from '@sisense/sdk-data';

describe('getChartOptions', () => {
  const jaql: MetadataItem[] = [];
  const chartRecommendations: ChartRecommendations = {
    chartFamily: 'cartesian',
    chartType: 'bar',
    axesMapping: {},
  };

  it('should return chart options when useCustomizedStyleOptions is false', () => {
    const { dataOptions, chartStyleOptions } = getChartOptions(jaql, chartRecommendations, false);
    expect(dataOptions).toBeDefined();
    expect(chartStyleOptions).toEqual(getDefaultStyleOptions());
  });

  it('should return chart options when useCustomizedStyleOptions is true', () => {
    const { dataOptions, chartStyleOptions } = getChartOptions(jaql, chartRecommendations, true);
    expect(dataOptions).toBeDefined();
    expect(chartStyleOptions).toEqual({
      convolution: {
        enabled: true,
        selectedConvolutionType: 'bySlicesCount',
        independentSlicesCount: 7,
      },
      lineWidth: {
        width: 'bold',
      },
      markers: {
        enabled: false,
      },
      legend: {
        enabled: true,
        position: 'right',
      },
      yAxis: {
        gridLines: false,
        title: {
          enabled: true,
        },
      },
      xAxis: {
        gridLines: false,
        title: {
          enabled: true,
        },
      },
      subtype: 'bar/stacked',
    });
  });
});
