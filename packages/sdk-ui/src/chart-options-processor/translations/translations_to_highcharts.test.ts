import { formatSeries } from './translations_to_highcharts';

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
        },
        {
          y: 20,
          custom: { rawValue: 20, xValue: ['xAxis 2'] },
        },
        {
          y: 30,
          custom: { rawValue: 30, xValue: ['xAxis 3'] },
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
        },
        {
          y: 20,
          custom: { rawValue: 20, xValue: ['xAxis 2'] },
          color: 'blue',
        },
        {
          y: 30,
          custom: { rawValue: 30, xValue: ['xAxis 3'] },
          color: 'green',
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
        },
        {
          y: 20,
          custom: { rawValue: 20, xValue: ['xAxis 2'] },
          marker: {
            enabled: true,
            isIsolatedPoint: true,
          },
        },
        {
          y: NaN,
          custom: { rawValue: 'value3', xValue: ['xAxis 3'] },
        },
      ],
    });
  });
});
