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
    axesMapping: {
      category: [
        {
          column: { name: 'Product Category', type: 'text' },
          enabled: true,
        },
      ],
      value: [
        {
          column: { name: 'Sales Amount', type: 'numeric' },
          enabled: true,
        },
        {
          column: { name: 'Profit', type: 'numeric' },
          enabled: true,
        },
      ],
    },
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
          text: 'Sales Amount, Profit',
        },
      },
      xAxis: {
        gridLines: false,
        title: {
          enabled: true,
          text: 'Product Category',
        },
      },
      subtype: 'bar/stacked',
    });
  });

  describe('when chartType is table', () => {
    const tableJaql: MetadataItem[] = [
      {
        jaql: {
          title: 'Product Category',
          type: 'text',
        },
        panel: 'dimensions',
      },
      {
        jaql: {
          title: 'Sales Amount',
          type: 'numeric',
        },
        panel: 'measures',
      },
    ];

    it('should return table data options with all columns when axesMapping is empty', () => {
      const tableRecommendations: ChartRecommendations = {
        chartFamily: 'table',
        chartType: 'table',
        axesMapping: {},
      };

      const { dataOptions, chartStyleOptions } = getChartOptions(
        tableJaql,
        tableRecommendations,
        true,
      );
      expect(dataOptions).toBeDefined();
      expect(chartStyleOptions).toEqual(getDefaultStyleOptions());
    });

    it('should return table data options with mapped columns when axesMapping is provided', () => {
      const tableRecommendations: ChartRecommendations = {
        chartFamily: 'table',
        chartType: 'table',
        axesMapping: {
          columns: [
            {
              column: { name: 'Product Category', type: 'text' },
              enabled: true,
            },
            {
              column: { name: 'Sales Amount', type: 'numeric' },
              enabled: true,
            },
          ],
        },
      };

      const { dataOptions, chartStyleOptions } = getChartOptions(
        tableJaql,
        tableRecommendations,
        true,
      );
      expect(dataOptions).toBeDefined();
      expect(chartStyleOptions).toEqual(getDefaultStyleOptions());
    });
  });
});
