import { CartesianChartDataOptionsInternal } from '../../chart-data-options/types';
import { CartesianChartData, CategoricalSeriesValues, ChartData } from '../../chart-data/types';
import { PolarChartDesignOptions, StackableChartDesignOptions } from './design-options';
import {
  addStackingIfSpecified,
  determineYAxisOptions,
  formatSeries,
} from './translations-to-highcharts';

describe('formatSeries', () => {
  const series = {
    name: 'Series 1',
    data: [
      { value: 10, rawValue: 10, xValue: ['xAxis 1'] },
      { value: 20, rawValue: 20, xValue: ['xAxis 2'] },
      { value: 30, rawValue: 30, xValue: ['xAxis 3'] },
    ],
  };
  const indexMap = [0, 1, 2];
  const treatNullDataAsZeros = false;
  const categories = ['Category 1', 'Category 2', 'Category 3'];
  const categoryColors = ['red', 'blue', 'green'];

  test('should return the formatted series with categories', () => {
    const formattedSeries = formatSeries(
      series,
      indexMap,
      treatNullDataAsZeros,
      categories,
      categoryColors,
    );

    expect(formattedSeries).toEqual({
      name: 'Series 1',
      data: [
        {
          name: 'Category 1',
          y: 10,
          color: 'red',
          custom: { rawValue: 10, xValue: ['xAxis 1'] },
        },
        {
          name: 'Category 2',
          y: 20,
          color: 'blue',
          custom: { rawValue: 20, xValue: ['xAxis 2'] },
        },
        {
          name: 'Category 3',
          y: 30,
          color: 'green',
          custom: { rawValue: 30, xValue: ['xAxis 3'] },
        },
      ],
    });
  });

  test('should return the formatted series without categories', () => {
    const formattedSeries = formatSeries(series, indexMap, treatNullDataAsZeros);

    expect(formattedSeries).toEqual({
      name: 'Series 1',
      data: [
        {
          y: 10,
          custom: { rawValue: 10, xValue: ['xAxis 1'] },
          selected: false,
        },
        {
          y: 20,
          custom: { rawValue: 20, xValue: ['xAxis 2'] },
          selected: false,
        },
        {
          y: 30,
          custom: { rawValue: 30, xValue: ['xAxis 3'] },
          selected: false,
        },
      ],
    });
  });

  test('should return the formatted series with color applied per datapoint', () => {
    const testSeries = {
      name: 'Series 1',
      data: [
        { value: 10, rawValue: 10, xValue: ['xAxis 1'], color: 'red' },
        { value: 20, rawValue: 20, xValue: ['xAxis 2'], color: 'blue' },
        { value: 30, rawValue: 30, xValue: ['xAxis 3'], color: 'green' },
      ],
    };

    const formattedSeries = formatSeries(testSeries, indexMap, treatNullDataAsZeros);

    expect(formattedSeries).toEqual({
      name: 'Series 1',
      data: [
        {
          y: 10,
          custom: { rawValue: 10, xValue: ['xAxis 1'] },
          color: 'red',
          selected: false,
        },
        {
          y: 20,
          custom: { rawValue: 20, xValue: ['xAxis 2'] },
          color: 'blue',
          selected: false,
        },
        {
          y: 30,
          custom: { rawValue: 30, xValue: ['xAxis 3'] },
          color: 'green',
          selected: false,
        },
      ],
    });
  });

  test('should return the formatted series with blur applied per datapoint', () => {
    const testSeries = {
      name: 'Series 1',
      data: [
        { value: 10, rawValue: 10, xValue: ['xAxis 1'], blur: true },
        { value: 20, rawValue: 20, xValue: ['xAxis 2'], blur: false },
        { value: 30, rawValue: 30, xValue: ['xAxis 3'], blur: true },
      ],
    };

    const formattedSeries = formatSeries(testSeries, indexMap, treatNullDataAsZeros);

    expect(formattedSeries).toEqual({
      name: 'Series 1',
      data: [
        {
          y: 10,
          custom: { rawValue: 10, xValue: ['xAxis 1'] },
          selected: true,
          marker: {
            enabled: false,
            isIsolatedPoint: false,
          },
        },
        {
          y: 20,
          custom: { rawValue: 20, xValue: ['xAxis 2'] },
          selected: false,
          marker: {
            enabled: true,
            isIsolatedPoint: false,
          },
        },
        {
          y: 30,
          custom: { rawValue: 30, xValue: ['xAxis 3'] },
          selected: true,
          marker: {
            enabled: false,
            isIsolatedPoint: false,
          },
        },
      ],
    });
  });

  test('should return the formatted series with isolated point', () => {
    const testSeries = {
      name: 'Series 1',
      data: [
        { value: NaN, rawValue: 'value1', xValue: ['xAxis 1'] },
        { value: 20, rawValue: 20, xValue: ['xAxis 2'] },
        { value: NaN, rawValue: 'value3', xValue: ['xAxis 3'] },
      ],
    };
    const formattedSeries = formatSeries(testSeries, indexMap, treatNullDataAsZeros);

    expect(formattedSeries).toEqual({
      name: 'Series 1',
      data: [
        {
          y: NaN,
          custom: { rawValue: 'value1', xValue: ['xAxis 1'] },
          selected: false,
        },
        {
          y: 20,
          custom: { rawValue: 20, xValue: ['xAxis 2'] },
          marker: {
            enabled: true,
            isIsolatedPoint: true,
          },
          selected: false,
        },
        {
          y: NaN,
          custom: { rawValue: 'value3', xValue: ['xAxis 3'] },
          selected: false,
        },
      ],
    });
  });
});

describe('addStackingIfSpecified', () => {
  it('should return showTotal as false for non-stackable chart types', () => {
    const result = addStackingIfSpecified('line', {
      stackType: 'stacked',
    } as StackableChartDesignOptions);
    expect(result).toEqual({ totalLabels: { enabled: false } });
  });

  it('should return stacking as normal and showTotal as false for polar column chart', () => {
    const result = addStackingIfSpecified('polar', {
      polarType: 'column',
    } as PolarChartDesignOptions);
    expect(result).toEqual({ stacking: 'normal', totalLabels: { enabled: false } });
  });

  it('should return stacking as normal and showTotal as false for polar area chart', () => {
    const result = addStackingIfSpecified('polar', {
      polarType: 'area',
    } as PolarChartDesignOptions);
    expect(result).toEqual({ stacking: 'normal', totalLabels: { enabled: false } });
  });

  it('should throw an error for polar chart with non-polar design options', () => {
    expect(() => {
      addStackingIfSpecified('polar', { stackType: 'stacked' } as StackableChartDesignOptions);
    }).toThrow('Polar chart design options expected for polar chart');
  });

  it('should throw an error for non-polar chart with polar design options', () => {
    expect(() => {
      addStackingIfSpecified('column', { polarType: 'column' } as PolarChartDesignOptions);
    }).toThrow('Polar chart design options not expected for non-polar chart');
  });

  it('should return stacking as normal and showTotal based on design options for stackable chart types', () => {
    const result = addStackingIfSpecified('column', {
      stackType: 'stacked',
      seriesLabels: {
        enabled: true,
      },
      totalLabels: { enabled: true },
    } as unknown as StackableChartDesignOptions);
    expect(result).toEqual({ stacking: 'normal', totalLabels: { enabled: true } });
  });

  it('should return stacking as percent and showTotal based on design options for stack100 chart types', () => {
    const result = addStackingIfSpecified('bar', {
      stackType: 'stack100',
      seriesLabels: {
        enabled: true,
      },
      totalLabels: { enabled: true },
    } as unknown as StackableChartDesignOptions);
    expect(result).toEqual({ stacking: 'percent', totalLabels: { enabled: true } });
  });

  it('should return showTotal as false if valueLabel is not present in design options', () => {
    const result = addStackingIfSpecified('area', {
      stackType: 'stacked',
    } as StackableChartDesignOptions);
    expect(result).toEqual({ stacking: 'normal', totalLabels: { enabled: false } });
  });

  it('should return showTotal as false for default stack type', () => {
    const result = addStackingIfSpecified('column', {
      stackType: 'classic',
    } as StackableChartDesignOptions);
    expect(result).toEqual({ totalLabels: { enabled: false } });
  });
});

describe('determineYAxisOptions', () => {
  const createMockStyledMeasureColumn = (overrides = {}) => ({
    column: {
      name: 'Revenue',
      type: 'numeric',
      aggregation: 'sum',
    },
    chartType: undefined,
    showOnRightAxis: false,
    enabled: true,
    treatNullDataAsZeros: false,
    connectNulls: false,
    ...overrides,
  });

  const createMockSeries = (data: number[] = [100, 200, 300]): CategoricalSeriesValues => ({
    name: 'Test Series',
    data: data.map((value) => ({
      value,
      rawValue: value,
      xValue: [`Category ${value}`],
    })),
  });

  const createMockCartesianChartData = (seriesCount = 1): CartesianChartData => ({
    type: 'cartesian',
    xAxisCount: 1,
    xValues: [{ key: 'category', xValues: ['Cat1', 'Cat2', 'Cat3'] }],
    series: Array(seriesCount)
      .fill(null)
      .map((_, i) => createMockSeries([100 + i, 200 + i, 300 + i])),
  });

  const createMockCartesianDataOptions = (
    yColumns = 1,
    overrides = {},
  ): CartesianChartDataOptionsInternal => ({
    x: [{ column: { name: 'Category', type: 'text' } }],
    y: Array(yColumns)
      .fill(null)
      .map((_, i) =>
        createMockStyledMeasureColumn({
          column: { name: `Measure${i + 1}`, type: 'numeric', aggregation: 'sum' },
          ...overrides,
        }),
      ),
    breakBy: [],
    ...overrides,
  });

  describe('when chart data is not cartesian', () => {
    it('should return empty arrays for non-cartesian chart data', () => {
      const nonCartesianChartData: ChartData = {
        type: 'categorical',
        xAxisCount: 1,
        xValues: [{ key: 'category', xValues: ['Cat1', 'Cat2'] }],
        series: [createMockSeries()],
      };

      const dataOptions = createMockCartesianDataOptions();

      const result = determineYAxisOptions(nonCartesianChartData, dataOptions);

      expect(result).toEqual([[], [], [], []]);
    });
  });

  describe('when there are no breakBy values', () => {
    describe('and no y values', () => {
      it('should return default configuration for empty y values', () => {
        const chartData = createMockCartesianChartData(0);
        const dataOptions: CartesianChartDataOptionsInternal = {
          x: [{ column: { name: 'Category', type: 'text' } }],
          y: [],
          breakBy: [],
        };

        const result = determineYAxisOptions(chartData, dataOptions);

        expect(result).toEqual([[0], [undefined], [false], [false]]);
      });
    });

    describe('and single y value', () => {
      it('should map single y value to left axis by default', () => {
        const chartData = createMockCartesianChartData(1);
        const dataOptions = createMockCartesianDataOptions(1);

        const result = determineYAxisOptions(chartData, dataOptions);

        expect(result).toEqual([[0], [undefined], [false], [false]]);
      });

      it('should map single y value to right axis when showOnRightAxis is true', () => {
        const chartData = createMockCartesianChartData(1);
        const dataOptions = createMockCartesianDataOptions(1, { showOnRightAxis: true });

        const result = determineYAxisOptions(chartData, dataOptions);

        expect(result).toEqual([[1], [undefined], [false], [false]]);
      });

      it('should handle treatNullDataAsZeros setting', () => {
        const chartData = createMockCartesianChartData(1);
        const dataOptions = createMockCartesianDataOptions(1, { treatNullDataAsZeros: true });

        const result = determineYAxisOptions(chartData, dataOptions);

        expect(result).toEqual([[0], [undefined], [true], [false]]);
      });

      it('should handle connectNulls setting', () => {
        const chartData = createMockCartesianChartData(1);
        const dataOptions = createMockCartesianDataOptions(1, { connectNulls: true });

        const result = determineYAxisOptions(chartData, dataOptions);

        expect(result).toEqual([[0], [undefined], [false], [true]]);
      });

      it('should ignore chartType when only one y value', () => {
        const chartData = createMockCartesianChartData(1);
        const dataOptions = createMockCartesianDataOptions(1, { chartType: 'line' });

        const result = determineYAxisOptions(chartData, dataOptions);

        expect(result).toEqual([[0], [undefined], [false], [false]]);
      });
    });

    describe('and multiple y values', () => {
      it('should map multiple y values with mixed axis sides', () => {
        const chartData = createMockCartesianChartData(3);
        const dataOptions: CartesianChartDataOptionsInternal = {
          x: [{ column: { name: 'Category', type: 'text' } }],
          y: [
            createMockStyledMeasureColumn({ showOnRightAxis: false }),
            createMockStyledMeasureColumn({ showOnRightAxis: true }),
            createMockStyledMeasureColumn({ showOnRightAxis: false }),
          ],
          breakBy: [],
        };

        const result = determineYAxisOptions(chartData, dataOptions);

        expect(result).toEqual([
          [0, 1, 0],
          [undefined, undefined, undefined],
          [false, false, false],
          [false, false, false],
        ]);
      });

      it('should respect chartType for multiple enabled y values', () => {
        const chartData = createMockCartesianChartData(2);
        const dataOptions: CartesianChartDataOptionsInternal = {
          x: [{ column: { name: 'Category', type: 'text' } }],
          y: [
            createMockStyledMeasureColumn({ chartType: 'line', enabled: true }),
            createMockStyledMeasureColumn({ chartType: 'column', enabled: true }),
          ],
          breakBy: [],
        };

        const result = determineYAxisOptions(chartData, dataOptions);

        expect(result).toEqual([
          [0, 0],
          ['line', 'column'],
          [false, false],
          [false, false],
        ]);
      });

      it('should ignore chartType when multiple y values but only one enabled', () => {
        const chartData = createMockCartesianChartData(2);
        const dataOptions: CartesianChartDataOptionsInternal = {
          x: [{ column: { name: 'Category', type: 'text' } }],
          y: [
            createMockStyledMeasureColumn({ chartType: 'line', enabled: true }),
            createMockStyledMeasureColumn({ chartType: 'column', enabled: false }),
          ],
          breakBy: [],
        };

        const result = determineYAxisOptions(chartData, dataOptions);

        expect(result).toEqual([
          [0, 0],
          [undefined, undefined],
          [false, false],
          [false, false],
        ]);
      });

      it('should ignore chartType when auto is specified', () => {
        const chartData = createMockCartesianChartData(2);
        const dataOptions: CartesianChartDataOptionsInternal = {
          x: [{ column: { name: 'Category', type: 'text' } }],
          y: [
            createMockStyledMeasureColumn({ chartType: 'auto', enabled: true }),
            createMockStyledMeasureColumn({ chartType: 'column', enabled: true }),
          ],
          breakBy: [],
        };

        const result = determineYAxisOptions(chartData, dataOptions);

        expect(result).toEqual([
          [0, 0],
          [undefined, 'column'],
          [false, false],
          [false, false],
        ]);
      });

      it('should handle mixed null data treatment settings', () => {
        const chartData = createMockCartesianChartData(3);
        const dataOptions: CartesianChartDataOptionsInternal = {
          x: [{ column: { name: 'Category', type: 'text' } }],
          y: [
            createMockStyledMeasureColumn({ treatNullDataAsZeros: true }),
            createMockStyledMeasureColumn({ treatNullDataAsZeros: false }),
            createMockStyledMeasureColumn({ treatNullDataAsZeros: true }),
          ],
          breakBy: [],
        };

        const result = determineYAxisOptions(chartData, dataOptions);

        expect(result).toEqual([
          [0, 0, 0],
          [undefined, undefined, undefined],
          [true, false, true],
          [false, false, false],
        ]);
      });

      it('should handle mixed connectNulls settings', () => {
        const chartData = createMockCartesianChartData(2);
        const dataOptions: CartesianChartDataOptionsInternal = {
          x: [{ column: { name: 'Category', type: 'text' } }],
          y: [
            createMockStyledMeasureColumn({ connectNulls: true }),
            createMockStyledMeasureColumn({ connectNulls: false }),
          ],
          breakBy: [],
        };

        const result = determineYAxisOptions(chartData, dataOptions);

        expect(result).toEqual([
          [0, 0],
          [undefined, undefined],
          [false, false],
          [true, false],
        ]);
      });
    });
  });

  describe('when there are breakBy values', () => {
    it('should use first y value settings for all series', () => {
      const chartData = createMockCartesianChartData(3);
      const dataOptions: CartesianChartDataOptionsInternal = {
        x: [{ column: { name: 'Category', type: 'text' } }],
        y: [
          createMockStyledMeasureColumn({
            showOnRightAxis: true,
            treatNullDataAsZeros: true,
            connectNulls: true,
          }),
        ],
        breakBy: [{ column: { name: 'Region', type: 'text' } }],
      };

      const result = determineYAxisOptions(chartData, dataOptions);

      expect(result).toEqual([
        [1, 1, 1],
        [undefined, undefined, undefined],
        [true, true, true],
        [true, true, true],
      ]);
    });

    it('should handle case with no y values and breakBy present', () => {
      const chartData = createMockCartesianChartData(2);
      const dataOptions: CartesianChartDataOptionsInternal = {
        x: [{ column: { name: 'Category', type: 'text' } }],
        y: [],
        breakBy: [{ column: { name: 'Region', type: 'text' } }],
      };

      const result = determineYAxisOptions(chartData, dataOptions);

      expect(result).toEqual([
        [0, 0],
        [undefined, undefined],
        [undefined, undefined],
        [undefined, undefined],
      ]);
    });

    it('should always use undefined for chartType when breakBy is present', () => {
      const chartData = createMockCartesianChartData(2);
      const dataOptions: CartesianChartDataOptionsInternal = {
        x: [{ column: { name: 'Category', type: 'text' } }],
        y: [createMockStyledMeasureColumn({ chartType: 'line' })],
        breakBy: [{ column: { name: 'Region', type: 'text' } }],
      };

      const result = determineYAxisOptions(chartData, dataOptions);

      expect(result).toEqual([
        [0, 0],
        [undefined, undefined],
        [false, false],
        [false, false],
      ]);
    });
  });

  describe('edge cases', () => {
    it('should handle chart data with no series', () => {
      const chartData: CartesianChartData = {
        type: 'cartesian',
        xAxisCount: 1,
        xValues: [{ key: 'category', xValues: ['Cat1'] }],
        series: [],
      };
      const dataOptions = createMockCartesianDataOptions(1);

      const result = determineYAxisOptions(chartData, dataOptions);

      expect(result).toEqual([[0], [undefined], [false], [false]]);
    });

    it('should handle undefined values gracefully', () => {
      const chartData = createMockCartesianChartData(1);
      const dataOptions: CartesianChartDataOptionsInternal = {
        x: [{ column: { name: 'Category', type: 'text' } }],
        y: [
          createMockStyledMeasureColumn({
            showOnRightAxis: undefined,
            treatNullDataAsZeros: undefined,
            connectNulls: undefined,
          }),
        ],
        breakBy: [],
      };

      const result = determineYAxisOptions(chartData, dataOptions);

      expect(result).toEqual([[0], [undefined], [false], [false]]);
    });
  });
});
