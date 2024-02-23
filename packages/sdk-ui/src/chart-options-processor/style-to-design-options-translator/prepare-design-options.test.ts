/** @vitest-environment jsdom */
import {
  AreamapChartDataOptionsInternal,
  CartesianChartDataOptionsInternal,
  CategoricalChartDataOptionsInternal,
  ScattermapChartDataOptionsInternal,
} from '@/chart-data-options/types';
import {
  AreamapStyleOptions,
  FunnelStyleOptions,
  LineStyleOptions,
  ScattermapStyleOptions,
} from '@/types';
import { prepareChartDesignOptions } from './prepare-design-options';

describe('prepareChartDesignOptions', () => {
  it('should return design options for combo "line + area" chart', () => {
    const chartType = 'line';
    const dataOptionsInternal: CartesianChartDataOptionsInternal = {
      x: [
        {
          dateFormat: 'yy-MM',
          name: 'Months',
          type: 'datelevel',
        },
      ],
      y: [
        { name: '$measure0_avg Cost', title: 'avg Cost' },
        {
          name: '$measure1_Total Revenue',
          title: 'Total Revenue',
          seriesStyleOptions: {
            lineWidth: {
              width: 'thick',
            },
            markers: {
              enabled: true,
              fill: 'filled',
              size: 'large',
            },
          },
        },
      ],
      breakBy: [],
    };
    const styleOptions: LineStyleOptions = {
      subtype: 'line/basic',
      lineWidth: {
        width: 'thin',
      },
      yAxis: {
        title: {
          enabled: true,
          text: 'AVG COST',
        },
      },
      y2Axis: {
        title: {
          enabled: true,
          text: 'REVENUE',
        },
      },
      markers: {
        enabled: true,
        fill: 'hollow',
        size: 'small',
      },
      seriesLabels: {
        enabled: true,
        rotation: -90,
      },
    };
    const result = prepareChartDesignOptions(chartType, dataOptionsInternal, styleOptions);
    expect(result).toMatchSnapshot();
  });

  it('should return design options for areamap chart', () => {
    const chartType = 'areamap';
    const dataOptionsInternal: AreamapChartDataOptionsInternal = {
      geo: {
        name: 'Country',
        type: 'text-attribute',
      },
      color: {
        name: '$measure0_sum Cost',
        title: 'Total Cost',
      },
    };
    const styleOptions: AreamapStyleOptions = {
      mapType: 'world',
    };
    const result = prepareChartDesignOptions(chartType, dataOptionsInternal, styleOptions);
    expect(result).toMatchSnapshot();
  });

  it('should return design options for scattermap chart', () => {
    const chartType = 'scattermap';
    const dataOptionsInternal: ScattermapChartDataOptionsInternal = {
      locations: [
        {
          name: 'Country',
          type: 'text-attribute',
        },
      ],
      locationLevel: 'auto',
    };
    const styleOptions: ScattermapStyleOptions = {
      markers: {
        fill: 'hollow-bold',
      },
    };
    const result = prepareChartDesignOptions(chartType, dataOptionsInternal, styleOptions);
    expect(result).toMatchSnapshot();
  });

  it('should return design options for funnel chart', () => {
    const chartType = 'funnel';
    const dataOptionsInternal: CategoricalChartDataOptionsInternal = {
      y: [
        {
          title: 'Unique Users',
          enabled: true,
          aggregation: 'sum',
          sortType: 'sortDesc',
          name: '$measure0_Unique Users',
        },
      ],
      breakBy: [{ name: 'Stage', type: 'string' }],
    };
    const styleOptions: FunnelStyleOptions = {
      legend: {
        enabled: true,
        position: 'left',
      },
      labels: {
        categories: true,
        decimals: true,
        enabled: true,
        percent: true,
        value: true,
      },
      funnelDirection: 'regular',
      dataLimits: {
        seriesCapacity: 3,
      },
    };
    const result = prepareChartDesignOptions(chartType, dataOptionsInternal, styleOptions);
    expect(result).toMatchSnapshot();
  });
});
