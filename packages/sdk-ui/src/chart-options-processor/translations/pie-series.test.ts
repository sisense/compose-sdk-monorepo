/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { SeriesType } from '../chart-options-service';
import { formatCategoricalChartData } from './pie-series';
import { CategoricalChartData } from '../../chart-data/types';
import { createAttribute } from '@sisense/sdk-data';
import { PieChartDesignOptions } from './design-options';
import { BaseDesignOptions } from './base-design-options';
import { CategoricalChartDataOptionsInternal } from '../../chart-data-options/types';

describe('formatCategoricalChartData', () => {
  const mockDesignOptions: PieChartDesignOptions = { ...BaseDesignOptions };

  it('converts chart data correctly for data without x values', () => {
    const mockChartData: CategoricalChartData = {
      type: 'categorical',
      series: [
        {
          name: 'y1',
          data: [{ value: 123.4 }],
        },
        {
          name: 'y2',
          data: [{ value: 567.8 }],
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

    expect(
      formatCategoricalChartData(mockChartData, mockDataOptions, mockDesignOptions).series,
    ).toEqual<SeriesType[]>([
      {
        name: '',
        data: [
          expect.objectContaining({
            name: 'y1',
            y: 123.4,
            color: '#a1a1a1',
          }),
          expect.objectContaining({
            name: 'y2',
            y: 567.8,
            color: '#b2b2b2',
          }),
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
          data: [{ value: 123.4 }, { value: 567.8 }, { value: 912.3 }],
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

    expect(
      formatCategoricalChartData(mockChartData, mockDataOptions, mockDesignOptions).series,
    ).toEqual<SeriesType[]>([
      {
        name: 'y1',
        data: [
          expect.objectContaining({
            name: 'v1',
            y: 123.4,
            color: '#a1a1a1',
          }),
          expect.objectContaining({
            name: 'v2',
            y: 567.8,
            color: '#b2b2b2',
          }),
          expect.objectContaining({
            name: 'v3',
            y: 912.3,
            color: '#c3c3c3',
          }),
        ],
        boostThreshold: 0,
        turboThreshold: 0,
      },
    ]);
  });
});
