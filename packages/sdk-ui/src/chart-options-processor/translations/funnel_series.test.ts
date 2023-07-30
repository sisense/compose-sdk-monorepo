import { SeriesType } from '../chart_options_service';
import { formatFunnelChartData } from './funnel_series';
import { CategoricalChartData } from '../../chart-data/types';
import { createAttribute } from '@sisense/sdk-data';
import { FunnelChartDesignOptions } from './design_options';
import { BaseDesignOptions } from './base_design_options';
import { CategoricalChartDataOptionsInternal } from '../../chart-data-options/types';

describe('formatFunnelChartData', () => {
  const mockDesignOptions: FunnelChartDesignOptions = { ...BaseDesignOptions };

  it('converts chart data correctly for data without x values', () => {
    const mockChartData: CategoricalChartData = {
      type: 'categorical',
      series: [
        {
          name: 'y1',
          data: [{ value: 303.3 }],
        },
        {
          name: 'y2',
          data: [{ value: 202.2 }],
        },
      ],
      xAxisCount: 0,
      xValues: [],
    };
    const mockDataOptions: CategoricalChartDataOptionsInternal = {
      breakBy: [],
      y: [
        {
          name: 'y1',
          aggregation: 'sum',
          title: 'y1',
          sortType: 'sortNone',
          color: '#a1a1a1',
          enabled: true,
        },
        {
          name: 'y2',
          aggregation: 'sum',
          title: 'y2',
          sortType: 'sortNone',
          color: '#b2b2b2',
          enabled: true,
        },
      ],
    };

    expect(formatFunnelChartData(mockChartData, mockDataOptions, mockDesignOptions).series).toEqual<
      SeriesType[]
    >([
      {
        name: '',
        data: [
          {
            name: 'y1',
            y: 303.3,
            color: '#a1a1a1',
            custom: {
              number1: 100,
            },
          },
          {
            name: 'y2',
            y: 202.2,
            color: '#b2b2b2',
            custom: {
              number1: 66.66666666666666,
            },
          },
        ],
        boostThreshold: 0,
        turboThreshold: 0,
      },
    ]);
  });

  it('converts chart data correctly for data with x values', () => {
    const mockChartData: CategoricalChartData = {
      type: 'categorical',
      series: [
        {
          name: 'y1',
          data: [{ value: 303.3 }, { value: 202.2 }, { value: 101.1 }],
        },
      ],
      xAxisCount: 1,
      xValues: [
        { key: 'v1', xValues: ['v1'] },
        { key: 'v2', xValues: ['v2'] },
        { key: 'v3', xValues: ['v3'] },
      ],
    };
    const mockDataOptions: CategoricalChartDataOptionsInternal = {
      breakBy: [createAttribute({ name: 'x1' })],
      y: [
        {
          name: 'y1',
          aggregation: 'sum',
          title: 'y1',
          sortType: 'sortNone',
          color: '#d4d4d4',
        },
      ],
      seriesToColorMap: {
        v1: '#a1a1a1',
        v2: '#b2b2b2',
        v3: '#c3c3c3',
      },
    };

    expect(formatFunnelChartData(mockChartData, mockDataOptions, mockDesignOptions).series).toEqual<
      SeriesType[]
    >([
      {
        name: 'y1',
        data: [
          {
            name: 'v1',
            y: 303.3,
            color: '#a1a1a1',
            custom: { number1: 100 },
          },
          {
            name: 'v2',
            y: 202.2,
            color: '#b2b2b2',
            custom: { number1: 66.66666666666666 },
          },
          {
            name: 'v3',
            y: 101.1,
            color: '#c3c3c3',
            custom: { number1: 33.33333333333333 },
          },
        ],
        boostThreshold: 0,
        turboThreshold: 0,
      },
    ]);
  });
});
