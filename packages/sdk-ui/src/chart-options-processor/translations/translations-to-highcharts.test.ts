import { StackableChartDesignOptions, PolarChartDesignOptions } from './design-options';
import { formatSeries, addStackingIfSpecified } from './translations-to-highcharts';

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
    expect(result).toEqual({ showTotal: false });
  });

  it('should return stacking as normal and showTotal as false for polar column chart', () => {
    const result = addStackingIfSpecified('polar', {
      polarType: 'column',
    } as PolarChartDesignOptions);
    expect(result).toEqual({ stacking: 'normal', showTotal: false });
  });

  it('should return stacking as normal and showTotal as false for polar area chart', () => {
    const result = addStackingIfSpecified('polar', {
      polarType: 'area',
    } as PolarChartDesignOptions);
    expect(result).toEqual({ stacking: 'normal', showTotal: false });
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
      valueLabel: true,
      showTotal: true,
    } as unknown as StackableChartDesignOptions);
    expect(result).toEqual({ stacking: 'normal', showTotal: true });
  });

  it('should return stacking as percent and showTotal based on design options for stack100 chart types', () => {
    const result = addStackingIfSpecified('bar', {
      stackType: 'stack100',
      valueLabel: true,
      showTotal: true,
    } as unknown as StackableChartDesignOptions);
    expect(result).toEqual({ stacking: 'percent', showTotal: true });
  });

  it('should return showTotal as false if valueLabel is not present in design options', () => {
    const result = addStackingIfSpecified('area', {
      stackType: 'stacked',
    } as StackableChartDesignOptions);
    expect(result).toEqual({ stacking: 'normal', showTotal: false });
  });

  it('should return showTotal as false for default stack type', () => {
    const result = addStackingIfSpecified('column', {
      stackType: 'classic',
    } as StackableChartDesignOptions);
    expect(result).toEqual({ showTotal: false });
  });
});
