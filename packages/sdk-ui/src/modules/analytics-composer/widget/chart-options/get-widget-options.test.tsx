/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-call */
import { MetadataItem } from '@sisense/sdk-data';

import { getDefaultStyleOptions } from '@/domains/visualizations/core/chart-options-processor/chart-options-service';
import { ChartRecommendations } from '@/modules/analytics-composer/types';
import { IndicatorStyleOptions } from '@/types';

import {
  getChartOptions,
  getChartStyleOptions,
  getMinimalChartStyleOptions,
} from './get-widget-options';

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

describe('getMinimalChartStyleOptions', () => {
  const cartesianAxes = {
    category: [{ column: { name: 'Product Category', type: 'text' }, enabled: true }],
    value: [
      { column: { name: 'Sales Amount', type: 'numeric' }, enabled: true },
      { column: { name: 'Profit', type: 'numeric' }, enabled: true },
    ],
  };

  it('returns subtype and axis titles for line (cartesian) without legend override', () => {
    expect(getMinimalChartStyleOptions('line', cartesianAxes)).toEqual({
      subtype: 'line/spline',
      xAxis: { title: { enabled: true, text: 'Product Category' } },
      yAxis: { title: { enabled: true, text: 'Sales Amount, Profit' } },
    });
  });

  it('returns stacked subtype and axis titles for bar', () => {
    expect(getMinimalChartStyleOptions('bar', cartesianAxes)).toEqual({
      subtype: 'bar/stacked',
      xAxis: { title: { enabled: true, text: 'Product Category' } },
      yAxis: { title: { enabled: true, text: 'Sales Amount, Profit' } },
    });
  });

  it('returns stacked subtype and axis titles for area', () => {
    expect(getMinimalChartStyleOptions('area', cartesianAxes)).toEqual({
      subtype: 'area/stacked',
      xAxis: { title: { enabled: true, text: 'Product Category' } },
      yAxis: { title: { enabled: true, text: 'Sales Amount, Profit' } },
    });
  });

  it('returns spline subtype only for arearange', () => {
    expect(getMinimalChartStyleOptions('arearange', cartesianAxes)).toEqual({
      subtype: 'arearange/spline',
    });
  });

  it('returns polar column subtype and axis titles for polar', () => {
    expect(getMinimalChartStyleOptions('polar', cartesianAxes)).toEqual({
      subtype: 'polar/column',
      xAxis: { title: { enabled: true, text: 'Product Category' } },
      yAxis: { title: { enabled: true, text: 'Sales Amount, Profit' } },
    });
  });

  it('returns full boxplot subtype only for boxplot', () => {
    expect(getMinimalChartStyleOptions('boxplot', cartesianAxes)).toEqual({
      subtype: 'boxplot/full',
    });
  });

  it('returns donut subtype only for pie (no cartesian axes)', () => {
    const pieAxes = {
      category: [{ column: { name: 'Region', type: 'text' }, enabled: true }],
      value: [{ column: { name: 'Revenue', type: 'numeric' }, enabled: true }],
    };
    expect(getMinimalChartStyleOptions('pie', pieAxes)).toEqual({
      subtype: 'pie/donut',
    });
  });

  it('returns column stacked subtype and axis titles for column', () => {
    expect(getMinimalChartStyleOptions('column', cartesianAxes)).toEqual({
      subtype: 'column/stackedcolumn',
      xAxis: { title: { enabled: true, text: 'Product Category' } },
      yAxis: { title: { enabled: true, text: 'Sales Amount, Profit' } },
    });
  });

  it('returns indicator components for primary only', () => {
    const axes = {
      value: [{ column: { name: 'Total Sales', type: 'numeric' }, enabled: true }],
    };
    expect(getMinimalChartStyleOptions('indicator', axes)).toEqual({
      indicatorComponents: {
        title: { shouldBeShown: true, text: 'Total Sales' },
      },
    });
  });

  it('returns indicator components with secondary title when present', () => {
    const axes = {
      value: [{ column: { name: 'Total Sales', type: 'numeric' }, enabled: true }],
      secondary: [{ column: { name: 'Total Revenue', type: 'numeric' }, enabled: true }],
    };
    expect(getMinimalChartStyleOptions('indicator', axes)).toEqual({
      indicatorComponents: {
        title: { shouldBeShown: true, text: 'Total Sales' },
        secondaryTitle: { text: 'Total Revenue' },
      },
    });
  });

  it('returns axis titles for scatter using x and y axes', () => {
    const scatterAxes = {
      x: [{ column: { name: 'Height', type: 'numeric' }, enabled: true }],
      y: [{ column: { name: 'Weight', type: 'numeric' }, enabled: true }],
    };
    expect(getMinimalChartStyleOptions('scatter', scatterAxes)).toEqual({
      xAxis: { title: { enabled: true, text: 'Height' } },
      yAxis: { title: { enabled: true, text: 'Weight' } },
    });
  });

  it('returns empty axis title text for scatter when axes mapping has no x/y', () => {
    expect(getMinimalChartStyleOptions('scatter', {})).toEqual({
      xAxis: { title: { enabled: true, text: undefined } },
      yAxis: { title: { enabled: true, text: undefined } },
    });
  });
});
