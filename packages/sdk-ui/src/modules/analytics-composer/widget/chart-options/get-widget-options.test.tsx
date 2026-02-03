/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-call */
import { MetadataItem } from '@sisense/sdk-data';

import { getDefaultStyleOptions } from '@/domains/visualizations/core/chart-options-processor/chart-options-service';
import { ChartRecommendations } from '@/modules/analytics-composer/types';
import { IndicatorStyleOptions } from '@/types';

import { getChartOptions, getChartStyleOptions } from './get-widget-options';

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

describe('getChartStyleOptions', () => {
  describe('when chartType is indicator', () => {
    const axesMapping = {
      value: [
        {
          column: { name: 'Total Sales', type: 'numeric' },
          enabled: true,
        },
      ],
    };

    it('should set indicator titles when useCustomizedStyleOptions is true with primary value only', () => {
      const chartStyleOptions = getChartStyleOptions(
        'indicator',
        axesMapping,
        {},
        true,
      ) as IndicatorStyleOptions;

      expect(chartStyleOptions.indicatorComponents?.title?.shouldBeShown).toBe(true);
      expect(chartStyleOptions.indicatorComponents?.title?.text).toBe('Total Sales');
      expect(chartStyleOptions.indicatorComponents?.secondaryTitle?.text).toBeUndefined();
    });

    it('should set indicator titles when useCustomizedStyleOptions is true with primary and secondary values', () => {
      const axesMappingWithSecondary = {
        ...axesMapping,
        secondary: [
          {
            column: { name: 'Total Revenue', type: 'numeric' },
            enabled: true,
          },
        ],
      };

      const chartStyleOptions = getChartStyleOptions(
        'indicator',
        axesMappingWithSecondary,
        {},
        true,
      ) as IndicatorStyleOptions;

      expect(chartStyleOptions.indicatorComponents?.title?.shouldBeShown).toBe(true);
      expect(chartStyleOptions.indicatorComponents?.title?.text).toBe('Total Sales');
      expect(chartStyleOptions.indicatorComponents?.secondaryTitle?.text).toBe('Total Revenue');
    });

    it('should join multiple values with commas', () => {
      const axesMappingMultiple = {
        value: [
          {
            column: { name: 'Sales', type: 'numeric' },
            enabled: true,
          },
          {
            column: { name: 'Profit', type: 'numeric' },
            enabled: true,
          },
        ],
      };

      const chartStyleOptions = getChartStyleOptions(
        'indicator',
        axesMappingMultiple,
        {},
        true,
      ) as IndicatorStyleOptions;

      expect(chartStyleOptions.indicatorComponents?.title?.text).toBe('Sales, Profit');
    });

    it('should not set indicator titles when useCustomizedStyleOptions is false', () => {
      const chartStyleOptions = getChartStyleOptions('indicator', axesMapping, {}, false);

      // Should use default style options, not customized ones
      expect(chartStyleOptions).toEqual(getDefaultStyleOptions());
    });
  });
});
