import { describe, expect, test, vi } from 'vitest';

import { CartesianChartDataOptionsInternal } from '@/chart-data-options/types';
import { DataTable } from '@/chart-data-processor/table-processor';
import { CartesianChartData } from '@/chart-data/types';

import { getCartesianChartData } from '../../../helpers/data';
import { getStreamgraphChartData } from './chart-data';

// Mock the getCartesianChartData dependency
vi.mock('../../../helpers/data', () => ({
  getCartesianChartData: vi.fn(),
}));

describe('getStreamgraphChartData', () => {
  const createMockDataOptions = (): CartesianChartDataOptionsInternal => ({
    x: [{ column: { name: 'Year', type: 'string' }, sortType: 'sortNone' }],
    y: [
      {
        column: { name: 'Value', aggregation: 'sum' },
        showOnRightAxis: false,
      },
    ],
    breakBy: [{ column: { name: 'Category', type: 'string' } }],
  });

  const createMockDataTable = (): DataTable => ({
    columns: [],
    rows: [],
  });

  const createMockChartData = (
    seriesData: Array<{ name: string; data: Array<{ value: number }> }>,
  ): CartesianChartData => ({
    type: 'cartesian',
    xAxisCount: 1,
    xValues: [
      {
        key: 'Year',
        xValues: ['2020', '2021', '2022'],
      },
    ],
    series: seriesData.map((s) => ({
      name: s.name,
      data: s.data.map((d) => ({
        value: d.value,
        rawValue: 'test',
        xValue: ['2020'],
      })),
    })),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('normalization of data holes', () => {
    test('should normalize NaN values to 0', () => {
      const mockChartData = createMockChartData([
        {
          name: 'Series A',
          data: [{ value: 10 }, { value: Number.NaN }, { value: 30 }],
        },
      ]);

      (getCartesianChartData as any).mockReturnValue(mockChartData);

      const result = getStreamgraphChartData(createMockDataOptions(), createMockDataTable());

      expect(result.series[0].data[0].value).toBe(10);
      expect(result.series[0].data[1].value).toBe(0);
      expect(result.series[0].data[2].value).toBe(30);
    });

    test('should normalize null values to 0', () => {
      const mockChartData = createMockChartData([
        {
          name: 'Series A',
          data: [{ value: 10 }, { value: null as any }, { value: 30 }],
        },
      ]);

      (getCartesianChartData as any).mockReturnValue(mockChartData);

      const result = getStreamgraphChartData(createMockDataOptions(), createMockDataTable());

      expect(result.series[0].data[0].value).toBe(10);
      expect(result.series[0].data[1].value).toBe(0);
      expect(result.series[0].data[2].value).toBe(30);
    });

    test('should normalize undefined values to 0', () => {
      const mockChartData = createMockChartData([
        {
          name: 'Series A',
          data: [{ value: 10 }, { value: undefined as any }, { value: 30 }],
        },
      ]);

      (getCartesianChartData as any).mockReturnValue(mockChartData);

      const result = getStreamgraphChartData(createMockDataOptions(), createMockDataTable());

      expect(result.series[0].data[0].value).toBe(10);
      expect(result.series[0].data[1].value).toBe(0);
      expect(result.series[0].data[2].value).toBe(30);
    });

    test('should preserve valid numeric values', () => {
      const mockChartData = createMockChartData([
        {
          name: 'Series A',
          data: [{ value: 0 }, { value: 10 }, { value: -5 }, { value: 100.5 }],
        },
      ]);

      (getCartesianChartData as any).mockReturnValue(mockChartData);

      const result = getStreamgraphChartData(createMockDataOptions(), createMockDataTable());

      expect(result.series[0].data[0].value).toBe(0);
      expect(result.series[0].data[1].value).toBe(10);
      expect(result.series[0].data[2].value).toBe(-5);
      expect(result.series[0].data[3].value).toBe(100.5);
    });
  });

  describe('multiple series handling', () => {
    test('should normalize all series independently', () => {
      const mockChartData = createMockChartData([
        {
          name: 'Series A',
          data: [{ value: 10 }, { value: Number.NaN }, { value: 30 }],
        },
        {
          name: 'Series B',
          data: [{ value: null as any }, { value: 20 }, { value: Number.NaN }],
        },
      ]);

      (getCartesianChartData as any).mockReturnValue(mockChartData);

      const result = getStreamgraphChartData(createMockDataOptions(), createMockDataTable());

      expect(result.series).toHaveLength(2);
      expect(result.series[0].data[1].value).toBe(0);
      expect(result.series[1].data[0].value).toBe(0);
      expect(result.series[1].data[2].value).toBe(0);
    });

    test('should handle mixed valid and invalid values across series', () => {
      const mockChartData = createMockChartData([
        {
          name: 'Series A',
          data: [{ value: 10 }, { value: Number.NaN }, { value: 30 }],
        },
        {
          name: 'Series B',
          data: [{ value: 5 }, { value: 15 }, { value: 25 }],
        },
        {
          name: 'Series C',
          data: [{ value: null as any }, { value: undefined as any }, { value: Number.NaN }],
        },
      ]);

      (getCartesianChartData as any).mockReturnValue(mockChartData);

      const result = getStreamgraphChartData(createMockDataOptions(), createMockDataTable());

      expect(result.series).toHaveLength(3);
      // Series A: NaN normalized
      expect(result.series[0].data[0].value).toBe(10);
      expect(result.series[0].data[1].value).toBe(0);
      expect(result.series[0].data[2].value).toBe(30);
      // Series B: all valid
      expect(result.series[1].data[0].value).toBe(5);
      expect(result.series[1].data[1].value).toBe(15);
      expect(result.series[1].data[2].value).toBe(25);
      // Series C: all normalized
      expect(result.series[2].data[0].value).toBe(0);
      expect(result.series[2].data[1].value).toBe(0);
      expect(result.series[2].data[2].value).toBe(0);
    });
  });

  describe('data structure preservation', () => {
    test('should preserve all non-value properties of data points', () => {
      const mockChartData: CartesianChartData = {
        type: 'cartesian',
        xAxisCount: 1,
        xValues: [
          {
            key: 'Year',
            xValues: ['2020'],
          },
        ],
        series: [
          {
            name: 'Series A',
            data: [
              {
                value: Number.NaN,
                rawValue: 'raw1',
                xValue: ['2020'],
                xDisplayValue: ['2020 Display'],
                blur: false,
                color: '#ff0000',
              },
            ],
          },
        ],
      };

      (getCartesianChartData as any).mockReturnValue(mockChartData);

      const result = getStreamgraphChartData(createMockDataOptions(), createMockDataTable());

      expect(result.series[0].data[0].value).toBe(0);
      expect(result.series[0].data[0].rawValue).toBe('raw1');
      expect(result.series[0].data[0].xValue).toEqual(['2020']);
      expect(result.series[0].data[0].xDisplayValue).toEqual(['2020 Display']);
      expect(result.series[0].data[0].blur).toBe(false);
      expect(result.series[0].data[0].color).toBe('#ff0000');
    });

    test('should preserve series metadata', () => {
      const mockChartData: CartesianChartData = {
        type: 'cartesian',
        xAxisCount: 1,
        xValues: [
          {
            key: 'Year',
            xValues: ['2020'],
          },
        ],
        series: [
          {
            name: 'Series A',
            title: 'Series A Title',
            data: [
              {
                value: 10,
                rawValue: 'test',
                xValue: ['2020'],
              },
            ],
          },
        ],
      };

      (getCartesianChartData as any).mockReturnValue(mockChartData);

      const result = getStreamgraphChartData(createMockDataOptions(), createMockDataTable());

      expect(result.series[0].name).toBe('Series A');
      expect(result.series[0].title).toBe('Series A Title');
    });

    test('should preserve chart data structure', () => {
      const mockChartData: CartesianChartData = {
        type: 'cartesian',
        xAxisCount: 2,
        xValues: [
          {
            key: 'Year',
            xValues: ['2020', '2021'],
            rawValues: ['2020', '2021'],
          },
        ],
        series: [
          {
            name: 'Series A',
            data: [
              {
                value: Number.NaN,
                rawValue: 'test',
                xValue: ['2020'],
              },
            ],
          },
        ],
        seriesOther: {
          type: 'cartesian',
          xAxisCount: 1,
          xValues: [],
          series: [],
        },
      };

      (getCartesianChartData as any).mockReturnValue(mockChartData);

      const result = getStreamgraphChartData(createMockDataOptions(), createMockDataTable());

      expect(result.type).toBe('cartesian');
      expect(result.xAxisCount).toBe(2);
      expect(result.xValues).toEqual(mockChartData.xValues);
      expect(result.seriesOther).toEqual(mockChartData.seriesOther);
    });
  });

  describe('edge cases', () => {
    test('should handle empty series', () => {
      const mockChartData: CartesianChartData = {
        type: 'cartesian',
        xAxisCount: 1,
        xValues: [
          {
            key: 'Year',
            xValues: [],
          },
        ],
        series: [],
      };

      (getCartesianChartData as any).mockReturnValue(mockChartData);

      const result = getStreamgraphChartData(createMockDataOptions(), createMockDataTable());

      expect(result.series).toEqual([]);
    });

    test('should handle series with empty data arrays', () => {
      const mockChartData = createMockChartData([
        {
          name: 'Series A',
          data: [],
        },
        {
          name: 'Series B',
          data: [],
        },
      ]);

      (getCartesianChartData as any).mockReturnValue(mockChartData);

      const result = getStreamgraphChartData(createMockDataOptions(), createMockDataTable());

      expect(result.series).toHaveLength(2);
      expect(result.series[0].data).toEqual([]);
      expect(result.series[1].data).toEqual([]);
    });

    test('should handle all values being NaN/null', () => {
      const mockChartData = createMockChartData([
        {
          name: 'Series A',
          data: [{ value: Number.NaN }, { value: null as any }, { value: undefined as any }],
        },
      ]);

      (getCartesianChartData as any).mockReturnValue(mockChartData);

      const result = getStreamgraphChartData(createMockDataOptions(), createMockDataTable());

      expect(result.series[0].data[0].value).toBe(0);
      expect(result.series[0].data[1].value).toBe(0);
      expect(result.series[0].data[2].value).toBe(0);
    });
  });

  describe('integration with getCartesianChartData', () => {
    test('should call getCartesianChartData with correct parameters', () => {
      const dataOptions = createMockDataOptions();
      const dataTable = createMockDataTable();
      const mockChartData = createMockChartData([
        {
          name: 'Series A',
          data: [{ value: 10 }],
        },
      ]);

      (getCartesianChartData as any).mockReturnValue(mockChartData);

      getStreamgraphChartData(dataOptions, dataTable);

      expect(getCartesianChartData).toHaveBeenCalledTimes(1);
      expect(getCartesianChartData).toHaveBeenCalledWith(dataOptions, dataTable);
    });

    test('should return result from composed transformation', () => {
      const mockChartData = createMockChartData([
        {
          name: 'Series A',
          data: [{ value: 10 }, { value: Number.NaN }, { value: 20 }],
        },
      ]);

      (getCartesianChartData as any).mockReturnValue(mockChartData);

      const result = getStreamgraphChartData(createMockDataOptions(), createMockDataTable());

      expect(result).toBeDefined();
      expect(result.type).toBe('cartesian');
      expect(result.series[0].data[1].value).toBe(0);
    });
  });

  describe('immutability', () => {
    test('should not mutate the original chart data', () => {
      const mockChartData = createMockChartData([
        {
          name: 'Series A',
          data: [{ value: 10 }, { value: Number.NaN }, { value: 30 }],
        },
      ]);

      // Store original NaN value before passing to mock
      const originalNaNValue = mockChartData.series[0].data[1].value;
      expect(Number.isNaN(originalNaNValue)).toBe(true);

      // Create a deep copy to return from the mock, preserving NaN
      // Using manual copy since JSON.parse/stringify converts NaN to null
      const originalData: CartesianChartData = {
        ...mockChartData,
        series: mockChartData.series.map((s) => ({
          ...s,
          data: s.data.map((d) => ({ ...d })),
        })),
      };
      (getCartesianChartData as any).mockReturnValue(originalData);

      const result = getStreamgraphChartData(createMockDataOptions(), createMockDataTable());

      // Verify the result has normalized values
      expect(result.series[0].data[1].value).toBe(0);

      // Verify the original data passed to the mock was not mutated
      expect(Number.isNaN(originalData.series[0].data[1].value)).toBe(true);
      expect(Number.isNaN(mockChartData.series[0].data[1].value)).toBe(true);
    });

    test('should return a new object, not the same reference', () => {
      const mockChartData = createMockChartData([
        {
          name: 'Series A',
          data: [{ value: 10 }],
        },
      ]);

      (getCartesianChartData as any).mockReturnValue(mockChartData);

      const result = getStreamgraphChartData(createMockDataOptions(), createMockDataTable());

      expect(result).not.toBe(mockChartData);
      expect(result.series).not.toBe(mockChartData.series);
      expect(result.series[0]).not.toBe(mockChartData.series[0]);
      expect(result.series[0].data).not.toBe(mockChartData.series[0].data);
    });
  });
});
