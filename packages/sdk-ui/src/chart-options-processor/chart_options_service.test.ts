/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { highchartsOptionsService, HighchartsOptionsInternal } from './chart_options_service';
import { CartesianChartData, CategoricalChartData } from '../chart-data/types';
import { cartesianData } from '../chart-data/cartesian_data';
import { categoricalData } from '../chart-data/categorical_data';
import { defaultConfig, NumberFormatConfig } from './translations/number_format_config';
import { BaseDesignOptions } from './translations/base_design_options';
import { createDataTableFromData } from '../chart-data-processor/table_creators';
import { applyNumberFormatToPlotBands } from './plot_bands';
import {
  CartesianChartDataOptionsInternal,
  ChartDataOptionsInternal,
  CategoricalChartDataOptionsInternal,
  Category,
} from '../chart-data-options/types';
import { ChartDesignOptions } from './translations/types';
import { DateLevels } from '@sisense/sdk-data';
import { applyDateFormat } from '../query/date-formats/apply_date_format';
import { getDefaultThemeSettings } from './theme_option_service';

const TestChartDataOptionsMultipleXandYValues: CartesianChartDataOptionsInternal = {
  x: [
    { name: 'Food', type: 'string', sortType: 'sortNone' },
    { name: 'Geo', type: 'string', sortType: 'sortNone' },
  ],
  y: [
    {
      name: 'Revenue',
      aggregation: 'sum',
      title: 'Revenue',
    },
    {
      name: 'Expenses',
      aggregation: 'sum',
      title: 'Expenses',
      showOnRightAxis: true,
    },
  ],
  breakBy: [],
};

const TestChartDataOptions: ChartDataOptionsInternal = {
  x: [{ name: 'Food', type: 'string', sortType: 'sortNone' }],
  y: [
    {
      name: 'Revenue',
      aggregation: 'sum',
      title: 'Revenue',
      sortType: 'sortNone',
    },
  ],
  breakBy: [{ name: 'Geo', type: 'string' }],
};

const TestQueryResult = createDataTableFromData({
  rows: [
    ['Pies', 'USA', '1000', '40', '20'],
    ['Wine', 'USA', '100', '35', '15'],
    ['Pies', 'France', '200', '180', '15'],
    ['Wine', 'France', '400', '350', '25'],
    ['Pasta', 'USA', '1200', '400', '25'],
    ['Pasta', 'France', '600', '270', '25'],
  ],
  columns: [
    { name: 'Food', type: 'string' },
    { name: 'Geo', type: 'string' },
    { name: 'Revenue', type: 'int' },
    { name: 'Expenses', type: 'int' },
    { name: 'COGS', type: 'int' },
  ],
});

const TimeSeriesData = createDataTableFromData({
  columns: [
    { name: 'Months', type: 'date' },
    { name: 'Area', type: 'string' },
    { name: 'Quantity', type: 'number' },
    { name: 'Units', type: 'number' },
  ],
  rows: [
    ['2020-01', 'A', 6781, 10],
    ['2020-02', 'A', 4471, 70],
    ['2020-03', 'B', 1812, 50],
    ['2020-06', 'B', 5001, 60],
    ['2020-07', 'A', 2045, 40],
    ['2020-08', 'B', 3010, 90],
    ['2020-09', 'A', 5447, 80],
    ['2020-10', 'B', 4242, 70],
    ['2020-11', 'B', 936, 20],
  ],
});

const months = {
  name: 'Months',
  type: 'date',
  continuous: true,
  dateFormat: 'Y-MM',
};
const area = {
  name: 'Area',
  type: 'string',
};
const meas1 = {
  name: 'Quantity',
  aggregation: 'sum',
  title: 'Quantity',
};

const meas2 = {
  name: 'Units',
  aggregation: 'sum',
  title: 'Units',
};

const defaultNumberFormat: NumberFormatConfig = {
  name: 'Numbers',
  decimalScale: 3,
  trillion: true,
  billion: true,
  million: true,
  kilo: true,
  thousandSeparator: true,
  prefix: true,
  symbol: '',
};

const dateFormatter = (date: Date, format: string) => applyDateFormat(date, format);

const themeSettings = getDefaultThemeSettings();

const continuousWithGranularityMonths = () => {
  const months2 = {
    name: 'Months',
    type: 'date',
    continuous: true,
    granularity: DateLevels.Months,
    dateFormat: 'Y-MM',
  };
  const dataOptions: CartesianChartDataOptionsInternal = {
    x: [months2],
    y: [meas1, meas2],
    breakBy: [],
  };
  const chartData = cartesianData(dataOptions, TimeSeriesData);

  return highchartsOptionsService(
    chartData,
    'line',
    BaseDesignOptions,
    dataOptions,
    themeSettings,
    dateFormatter,
  );
};

it('renders a time series with multiple measures and no break by', () => {
  const dataOptions: CartesianChartDataOptionsInternal = {
    x: [months],
    y: [meas1, meas2],
    breakBy: [],
  };
  const chartData = cartesianData(dataOptions, TimeSeriesData);

  const { options: chartOptions } = highchartsOptionsService(
    chartData,
    'line',
    BaseDesignOptions,
    dataOptions,
    themeSettings,
    dateFormatter,
  );

  expect(chartOptions).toMatchSnapshot();
});

it('renders a time series with granularity Month', () => {
  const { options: chartOptions } = continuousWithGranularityMonths();
  expect(chartOptions).toMatchSnapshot();
});

it('renders a time series chart with break by', () => {
  const dataOptions: CartesianChartDataOptionsInternal = {
    x: [months],
    y: [meas1],
    breakBy: [area],
  };
  const chartData = cartesianData(dataOptions, TimeSeriesData);

  const { options: chartOptions } = highchartsOptionsService(
    chartData,
    'line',
    BaseDesignOptions,
    dataOptions,
    themeSettings,
    dateFormatter,
  );

  expect(chartOptions).toMatchSnapshot();
});

it('renders a categorical line chart', () => {
  const chartData = cartesianData(TestChartDataOptions, TestQueryResult);

  const { options: chartOptions } = highchartsOptionsService(
    chartData,
    'line',
    BaseDesignOptions,
    TestChartDataOptions,
  );

  expect(chartOptions).toMatchSnapshot();
});

it('renders a categorical line chart with two x axes', () => {
  const chartData = cartesianData(TestChartDataOptionsMultipleXandYValues, TestQueryResult);

  const { options: chartOptions } = highchartsOptionsService(
    chartData,
    'area',
    BaseDesignOptions,
    TestChartDataOptionsMultipleXandYValues,
  );

  expect(chartOptions).toMatchSnapshot();
});

it('chart navigator is on if x axis count is greater than 70 and autoZoom true', () => {
  const chartData: CartesianChartData = {
    type: 'cartesian',
    xAxisCount: 1,
    xValues: Array<number>(71)
      .fill(0)
      .map((d, index) => ({ key: `x${index}`, xValues: [`x${index}`] })),
    series: [
      {
        name: 'series1',
        data: Array<number>(71)
          .fill(0)
          .map((value) => ({ value })),
      },
    ],
  };

  const { options: chartOptions } = highchartsOptionsService(
    chartData,
    'line',
    {
      ...BaseDesignOptions,
      autoZoom: true,
    },
    TestChartDataOptions,
  );
  expect(chartOptions?.navigator?.enabled).toBe(true);
});

it('chart navigator is off if x axis count is greater than 70 and autoZoom false', () => {
  const chartData: CartesianChartData = {
    type: 'cartesian',
    xAxisCount: 1,
    xValues: Array<number>(71)
      .fill(0)
      .map((d, index) => ({ key: `x${index}`, xValues: [`x${index}`] })),
    series: [
      {
        name: 'series1',
        data: Array<number>(71)
          .fill(0)
          .map((value) => ({ value })),
      },
    ],
  };

  const { options: chartOptions } = highchartsOptionsService(
    chartData,
    'line',
    {
      ...BaseDesignOptions,
      autoZoom: false,
    },
    TestChartDataOptions,
  );
  expect(chartOptions?.navigator?.enabled).toBe(false);
});

it('chart navigator is off if x axis count is less than 70 and autoZoom true', () => {
  const chartData: CartesianChartData = {
    type: 'cartesian',
    xAxisCount: 1,
    xValues: Array<number>(69)
      .fill(0)
      .map((d, index) => ({ key: `x${index}`, xValues: [`x${index}`] })),
    series: [
      {
        name: 'series1',
        data: Array<number>(71)
          .fill(0)
          .map((value) => ({ value })),
      },
    ],
  };

  const { options: chartOptions } = highchartsOptionsService(
    chartData,
    'line',
    {
      ...BaseDesignOptions,
      autoZoom: true,
    },
    TestChartDataOptions,
  );
  expect(chartOptions?.navigator?.enabled).toBe(false);
});

it('for cartesian data, limit series to 50 and categories to 100', () => {
  const chartData: CartesianChartData = {
    type: 'cartesian',
    xAxisCount: 1,
    xValues: Array<number>(1001)
      .fill(0)
      .map((d, index) => ({ key: `x${index}`, xValues: [`x${index}`] })),
    series: Array<number>(51)
      .fill(0)
      .map((d, index) => ({
        name: `series${index}`,
        data: Array<number>(1001)
          .fill(0)
          .map((value) => ({ value })),
      })),
  };

  const { options: chartOptions } = highchartsOptionsService(
    chartData,
    'line',
    {
      ...BaseDesignOptions,
      autoZoom: true,
      dataLimits: { seriesCapacity: 50, categoriesCapacity: 100 },
    },
    TestChartDataOptions,
  );
  expect(chartOptions?.xAxis[0].categories?.length).toBe(100);
  expect(chartOptions?.series.length).toBe(50);
});

it('for categorical with multiple values (e.g. pie charts), limit series to 100000', () => {
  const chartData: CategoricalChartData = {
    type: 'categorical',
    xAxisCount: 0,
    xValues: [{ key: '', xValues: [''] }],
    series: Array<number>(101)
      .fill(0)
      .map((d, index) => ({
        name: `value${index}`,
        data: [{ value: 0 }],
      })),
  };

  const { options: chartOptions } = highchartsOptionsService(
    chartData,
    'pie',
    {
      ...BaseDesignOptions,
      pieType: 'classic',
      dataLimits: { seriesCapacity: 100, categoriesCapacity: 100 },
    } as ChartDesignOptions,
    TestChartDataOptions,
  );
  expect(chartOptions?.series[0].data.length).toBe(100);
});

it('for categorical with value and categories (e.g. pie charts), limit series to 100', () => {
  const chartData: CategoricalChartData = {
    type: 'categorical',
    xAxisCount: 1,
    xValues: Array<number>(101)
      .fill(0)
      .map((v, index) => ({ key: `X${index}`, xValues: [`X${index}`] })),
    series: Array<number>(1)
      .fill(0)
      .map((d, index) => ({
        name: `value${index}`,
        data: Array<number>(101)
          .fill(0)
          .map((value) => ({ value })),
      })),
  };

  const { options: chartOptions } = highchartsOptionsService(
    chartData,
    'pie',
    {
      ...BaseDesignOptions,
      pieType: 'classic',
      dataLimits: { seriesCapacity: 100, categoriesCapacity: 100 },
    } as ChartDesignOptions,
    TestChartDataOptions,
  );
  expect(chartOptions?.series[0].data.length).toBe(100);
});

it('applyNumberFormatToPlotBands should work for x1 and x2 if type is number', () => {
  const chartDataOptions: ChartDataOptionsInternal = {
    x: [
      {
        name: 'revenue',
        type: 'number',
        numberFormatConfig: {
          ...defaultConfig,
          name: 'Currency',
          prefix: true,
          symbol: '$',
        },
      },
      {
        name: 'percentage',
        type: 'number',
        numberFormatConfig: { ...defaultConfig, name: 'Percent' },
      },
    ],
    y: [],
    breakBy: [],
  };
  const categories = ['.10', '', '.20', '', '.30', '', '.40'];
  const indexMap = [1, 2, 3, 4];
  const plotBands = [
    { text: '10000', from: 0, to: 1 },
    { text: '20000', from: 1, to: 2 },
    { text: '30000', from: 2, to: 3 },
    { text: '40000', from: 3, to: 4 },
  ];
  const results = applyNumberFormatToPlotBands(chartDataOptions, {
    categories,
    indexMap,
    plotBands,
  });
  expect(results).toEqual({
    categories: ['10%', '', '20%', '', '30%', '', '40%'],
    indexMap: [1, 2, 3, 4],
    plotBands: [
      {
        from: 0,
        text: '$10K',
        to: 1,
      },
      {
        from: 1,
        text: '$20K',
        to: 2,
      },
      {
        from: 2,
        text: '$30K',
        to: 3,
      },
      {
        from: 3,
        text: '$40K',
        to: 4,
      },
    ],
  });
});

it('applyNumberFormatToPlotBands should not change value when x1 and x2 are not numbers', () => {
  const chartDataOptions: ChartDataOptionsInternal = {
    x: [
      {
        name: 'revenue',
        type: 'string',
        numberFormatConfig: {
          ...defaultConfig,
          name: 'Currency',
          prefix: true,
          symbol: '$',
        },
      },
      {
        name: 'percentage',
        type: 'string',
        numberFormatConfig: { ...defaultConfig, name: 'Percent' },
      },
    ],
    y: [],
    breakBy: [],
  };
  const categories = ['10', '20', '30', '40'];
  const indexMap = [1, 2, 3, 4];
  const plotBands = [
    { text: '10000', from: 0, to: 1 },
    { text: '20000', from: 1, to: 2 },
    { text: '30000', from: 2, to: 3 },
    { text: '40000', from: 3, to: 4 },
  ];
  const results = applyNumberFormatToPlotBands(chartDataOptions, {
    categories,
    indexMap,
    plotBands,
  });
  expect(results).toEqual({
    categories: ['10', '20', '30', '40'],
    indexMap: [1, 2, 3, 4],
    plotBands: [
      {
        from: 0,
        text: '10000',
        to: 1,
      },
      {
        from: 1,
        text: '20000',
        to: 2,
      },
      {
        from: 2,
        text: '30000',
        to: 3,
      },
      {
        from: 3,
        text: '40000',
        to: 4,
      },
    ],
  });
});

describe('cartesianData', () => {
  it('default will order X-Axis by sortType ascending', () => {
    const dataOptions = {
      ...TestChartDataOptions,
      x: [{ name: 'Food', type: 'string' }],
    } as CartesianChartDataOptionsInternal;
    const chartData = cartesianData(dataOptions, TestQueryResult);
    expect(chartData.xValues.map((x) => x.key)).toEqual(['Pasta', 'Pies', 'Wine']);
  });
  it('sortNone will order X-Axis by source data order', () => {
    const dataOptions = {
      ...TestChartDataOptions,
      x: [{ name: 'Food', type: 'string', sortType: 'sortNone' }],
    } as CartesianChartDataOptionsInternal;
    const chartData = cartesianData(dataOptions, TestQueryResult);
    expect(chartData.xValues.map((x) => x.key)).toEqual(['Pies', 'Wine', 'Pasta']);
  });
  it('sortDesc will order X-Axis descending', () => {
    const dataOptions = {
      ...TestChartDataOptions,
      x: [{ name: 'Food', type: 'string', sortType: 'sortDesc' }],
    } as CartesianChartDataOptionsInternal;
    const chartData = cartesianData(dataOptions, TestQueryResult);
    expect(chartData.xValues.map((x) => x.key)).toEqual(['Wine', 'Pies', 'Pasta']);
  });
  it('sortAsc will order X-Axis ascending', () => {
    const dataOptions = {
      ...TestChartDataOptions,
      x: [{ name: 'Food', type: 'string', sortType: 'sortAsc' }],
    } as CartesianChartDataOptionsInternal;
    const chartData = cartesianData(dataOptions, TestQueryResult);
    expect(chartData.xValues.map((x) => x.key)).toEqual(['Pasta', 'Pies', 'Wine']);
  });
  it('treat null values as zeros', () => {
    const chartDataOptionsTreatNullsAsZeros = {
      ...TestChartDataOptions,
      y: TestChartDataOptions.y.map((y) => ({
        ...y,
        treatNullDataAsZeros: true,
      })),
    };

    const TestQueryResultWithNulls = createDataTableFromData({
      rows: [
        ['Pies', 'USA', '1000', '40', '20'],
        ['Wine', 'USA', '', '', '15'],
        ['Pies', 'France', '200', '180', '15'],
        ['Wine', 'France', '400', '', '25'],
        ['Pasta', 'USA', '', '400', '25'],
        ['Pasta', 'France', '600', '270', '25'],
      ],
      columns: [
        { name: 'Food', type: 'string' },
        { name: 'Geo', type: 'string' },
        { name: 'Revenue', type: 'int' },
        { name: 'Expenses', type: 'int' },
        { name: 'COGS', type: 'int' },
      ],
    });

    const chartData = cartesianData(TestChartDataOptions, TestQueryResultWithNulls);

    // first test null are filtered default
    const { options: chartOptions } = highchartsOptionsService(
      chartData,
      'line',
      BaseDesignOptions,
      TestChartDataOptions,
    );
    expect(chartOptions?.series[1].data.map((d) => d.y)).toEqual([1000, NaN, NaN]);

    // test treatNullDataAsZeros
    const { options: chartOptionsWithZeros } = highchartsOptionsService(
      chartData,
      'line',
      BaseDesignOptions,
      chartDataOptionsTreatNullsAsZeros,
    );
    expect(chartOptionsWithZeros?.series[1].data.map((d) => d.y)).toEqual([1000, 0, 0]);
  });

  it('format break by number', () => {
    const dataOptionsWithNoFormat = {
      ...TestChartDataOptions,
      breakBy: [
        {
          name: 'COGS',
          type: 'number',
        },
      ],
    } as CartesianChartDataOptionsInternal;
    const dataWithNoFormat = cartesianData(dataOptionsWithNoFormat, TestQueryResult);
    expect(dataWithNoFormat.series.map((s) => s.name)).toEqual(['15', '20', '25']);
    const dataOptions = {
      ...TestChartDataOptions,
      breakBy: [
        {
          name: 'COGS',
          type: 'number',
          numberFormatConfig: { ...defaultNumberFormat, decimalScale: 1 },
        },
      ],
    } as CartesianChartDataOptionsInternal;
    const chartData = cartesianData(dataOptions, TestQueryResult);
    expect(chartData.series.map((s) => s.name)).toEqual(['15.0', '20.0', '25.0']);
  });

  it('format x-axis number', () => {
    const dataOptionsWithNoFormat = {
      ...TestChartDataOptions,
      x: [
        {
          name: 'COGS',
          type: 'number',
        },
      ],
      breakBy: [],
    } as CartesianChartDataOptionsInternal;

    const dataWithNoFormat = cartesianData(dataOptionsWithNoFormat, TestQueryResult);
    const { options: chartOptionsNoFormat } = highchartsOptionsService(
      dataWithNoFormat,
      'line',
      BaseDesignOptions,
      dataOptionsWithNoFormat,
    );
    // x-axis values are formatted when the chart is rendered,
    // for the test we check that the formatter method is properly defined
    const formatterNoFormat = chartOptionsNoFormat.xAxis[0].labels?.formatter;
    expect(
      chartOptionsNoFormat.xAxis[0].categories?.map((value) => {
        if (!formatterNoFormat) return 'no formatter defined';

        const point = {
          value,
          formatter: formatterNoFormat,
        };

        return point.formatter.call({
          value,
          axis: { categories: chartOptionsNoFormat.xAxis[0].categories || [] },
        });
      }),
    ).toEqual(['15', '20', '25']);

    const dataOptions = {
      ...TestChartDataOptions,
      x: [
        {
          name: 'COGS',
          type: 'number',
          numberFormatConfig: { ...defaultNumberFormat, decimalScale: 1 },
        },
      ],
      breakBy: [],
    } as CartesianChartDataOptionsInternal;
    const chartData = cartesianData(dataOptions, TestQueryResult);
    const { options: chartOptions } = highchartsOptionsService(
      chartData,
      'line',
      BaseDesignOptions,
      dataOptions,
    );
    // x-axis values are formatted when the chart is rendered,
    // for the test we check that the formatter method is properly defined
    const formatter = chartOptions.xAxis[0].labels?.formatter;
    expect(
      chartOptions.xAxis[0].categories?.map((value) => {
        if (!formatter) return 'no formatter defined';

        const point = {
          value,
          formatter,
        };

        return point.formatter.call({
          value,
          axis: { categories: chartOptionsNoFormat.xAxis[0].categories || [] },
        });
      }),
    ).toEqual(['15.0', '20.0', '25.0']);
  });

  it('sets options based on blurred rows', () => {
    // Simulate a filter on rows that contain "Wine"
    const TestQueryResultWithBlurredRows = createDataTableFromData({
      rows: [
        [
          { data: 'Pies', text: 'Pies' },
          { data: 'USA', text: 'USA' },
          { data: '1000', text: '1000' },
        ],
        [
          { data: 'Wine', text: 'Wine', blur: true },
          { data: 'USA', text: 'USA', blur: true },
          { data: '100', text: '100', blur: true },
        ],
        [
          { data: 'Pies', text: 'Pies' },
          { data: 'France', text: 'France' },
          { data: '200', text: '200' },
        ],
        [
          { data: 'Wine', text: 'Wine', blur: true },
          { data: 'France', text: 'France', blur: true },
          { data: '400', text: '400', blur: true },
        ],
        [
          { data: 'Pasta', text: 'Pasta' },
          { data: 'USA', text: 'USA' },
          { data: '1200', text: '1200' },
        ],
        [
          { data: 'Pasta', text: 'Pasta' },
          { data: 'France', text: 'France' },
          { data: '600', text: '600' },
        ],
      ],
      columns: [
        { name: 'Food', type: 'string' },
        { name: 'Geo', type: 'string' },
        { name: 'Revenue', type: 'int' },
      ],
    });

    const chartData = cartesianData(TestChartDataOptions, TestQueryResultWithBlurredRows);

    const { options: chartOptions } = highchartsOptionsService(
      chartData,
      'line',
      BaseDesignOptions,
      TestChartDataOptions,
    );

    expect(chartOptions.xAxis[0].categories).toEqual(['Pies', 'Wine', 'Pasta']);
    expect(chartOptions.series[0].data).toMatchObject([
      { selected: false },
      { selected: true, marker: { enabled: false } },
      { selected: false },
    ]);
    expect(chartOptions.series[1].data).toMatchObject([
      { selected: false },
      { selected: true, marker: { enabled: false } },
      { selected: false },
    ]);
  });

  it('disables and clears y-axis title when chart type is polar', () => {
    const chartData = cartesianData(TestChartDataOptions, TestQueryResult);

    const { options: chartOptions } = highchartsOptionsService(
      chartData,
      'polar',
      { ...BaseDesignOptions, polarType: 'area' } as ChartDesignOptions,
      TestChartDataOptions,
    );

    expect(chartOptions.yAxis?.[0].title).toMatchObject({
      enabled: false,
      text: null,
    });
  });
  it('limit series and categories', () => {
    const chartData = cartesianData(TestChartDataOptions, TestQueryResult);

    const { options: chartOptions } = highchartsOptionsService(
      chartData,
      'line',
      {
        ...BaseDesignOptions,
        dataLimits: { seriesCapacity: 1, categoriesCapacity: 2 },
      } as ChartDesignOptions,
      TestChartDataOptions,
    );

    expect(chartData.series).toHaveLength(2);
    expect(chartData.xValues.map((x) => x.key)).toHaveLength(3);
    expect(chartOptions.series).toHaveLength(1);
    expect(chartOptions.xAxis[0].categories ?? []).toHaveLength(2);
  });
});

describe('categoricalCharts', () => {
  const pieData = createDataTableFromData({
    columns: [
      { name: 'Years', type: 'date' },
      { name: 'Group', type: 'string' },
      { name: 'Quantity', type: 'number' },
      { name: 'Units', type: 'number' },
      { name: 'Returns', type: 'number' },
      { name: 'Inventory', type: 'number' },
    ],
    rows: [
      ['2009', 'A', 6781, 1500, 3420, 200],
      ['2011', 'B', 1812, 5000, 1234, 3434],
      ['2012', 'C', 1300, 9000, 5667, 1235],
      ['2013', 'D', 800, 10000, 800, 5566],
      ['2014', 'E', 700, 300, 2500, 678],
    ],
  });

  const units = {
    name: 'Units',
    aggregation: 'sum',
    title: 'Units',
  };

  const quantity = {
    name: 'Quantity',
    aggregation: 'sum',
    title: 'Quantity',
  };

  const returns = {
    name: 'Returns',
    aggregation: 'sum',
    title: 'Returns',
  };

  const inventory = {
    name: 'Inventory',
    aggregation: 'sum',
    title: 'Inventory',
  };

  const group = {
    name: 'Group',
    type: 'string',
  };

  describe('with break by', () => {
    const pieDataOptions: CategoricalChartDataOptionsInternal = {
      y: [units],
      breakBy: [group],
    };

    it('pie chart all slices', () => {
      const chartData = categoricalData(pieDataOptions, pieData);

      // first test null are filtered default
      const { options: chartOptions } = highchartsOptionsService(
        chartData,
        'pie',
        BaseDesignOptions,
        pieDataOptions,
      );
      expect(chartOptions?.series[0].data).toEqual([
        {
          name: 'A',
          y: 1500,
          color: '#00cee6',
          custom: expect.objectContaining({ rawValue: 1500, xValue: ['A'] }),
        },
        {
          name: 'B',
          y: 5000,
          color: '#9b9bd7',
          custom: expect.objectContaining({ rawValue: 5000, xValue: ['B'] }),
        },
        {
          name: 'C',
          y: 9000,
          color: '#6eda55',
          custom: expect.objectContaining({ rawValue: 9000, xValue: ['C'] }),
        },
        {
          name: 'D',
          y: 10000,
          color: '#fc7570',
          custom: expect.objectContaining({ rawValue: 10000, xValue: ['D'] }),
        },
        {
          name: 'E',
          y: 300,
          color: '#fbb755',
          custom: expect.objectContaining({ rawValue: 300, xValue: ['E'] }),
        },
      ]);
    });

    it('pie chart with convolution by percent', () => {
      const chartData = categoricalData(pieDataOptions, pieData);

      const styleOptionsWithConvolution = {
        ...BaseDesignOptions,
        convolution: {
          enabled: true,
          selectedConvolutionType: 'byPercentage',
          minimalIndependentSlicePercentage: 15,
        },
      };

      // first test null are filtered default
      const { options: chartOptions } = highchartsOptionsService(
        chartData,
        'pie',
        styleOptionsWithConvolution,
        pieDataOptions,
      );
      expect(chartOptions?.series[0].data).toEqual([
        {
          name: 'B',
          y: 5000,
          color: '#9b9bd7',
          custom: expect.objectContaining({ rawValue: 5000, xValue: ['B'] }),
        },
        {
          name: 'C',
          y: 9000,
          color: '#6eda55',
          custom: expect.objectContaining({ rawValue: 9000, xValue: ['C'] }),
        },
        {
          name: 'D',
          y: 10000,
          color: '#fc7570',
          custom: expect.objectContaining({ rawValue: 10000, xValue: ['D'] }),
        },
        {
          name: 'Other',
          y: 1800,
          color: '#525A6B',
        },
      ]);
    });

    it('pie chart with convolution by slices count', () => {
      const chartData = categoricalData(pieDataOptions, pieData);

      const styleOptionsWithConvolution = {
        ...BaseDesignOptions,
        convolution: {
          enabled: true,
          selectedConvolutionType: 'bySlicesCount',
          independentSlicesCount: 2,
        },
      };

      // first test null are filtered default
      const { options: chartOptions } = highchartsOptionsService(
        chartData,
        'pie',
        styleOptionsWithConvolution,
        pieDataOptions,
      );
      expect(chartOptions?.series[0].data).toEqual([
        {
          name: 'C',
          y: 9000,
          color: '#6eda55',
          custom: expect.objectContaining({ rawValue: 9000, xValue: ['C'] }),
        },
        {
          name: 'D',
          y: 10000,
          color: '#fc7570',
          custom: expect.objectContaining({ rawValue: 10000, xValue: ['D'] }),
        },
        {
          name: 'Other',
          y: 6800,
          color: '#525A6B',
        },
      ]);
    });

    it('pie chart with disabled convolution', () => {
      const chartData = categoricalData(pieDataOptions, pieData);

      const styleOptionsWithConvolution = {
        ...BaseDesignOptions,
        convolution: {
          enabled: false,
          selectedConvolutionType: 'bySlicesCount',
          independentSlicesCount: 2,
        },
      };

      // first test null are filtered default
      const { options: chartOptions } = highchartsOptionsService(
        chartData,
        'pie',
        styleOptionsWithConvolution,
        pieDataOptions,
      );
      expect(chartOptions?.series[0].data).toEqual([
        {
          name: 'A',
          y: 1500,
          color: '#00cee6',
          custom: expect.objectContaining({ rawValue: 1500, xValue: ['A'] }),
        },
        {
          name: 'B',
          y: 5000,
          color: '#9b9bd7',
          custom: expect.objectContaining({ rawValue: 5000, xValue: ['B'] }),
        },
        {
          name: 'C',
          y: 9000,
          color: '#6eda55',
          custom: expect.objectContaining({ rawValue: 9000, xValue: ['C'] }),
        },
        {
          name: 'D',
          y: 10000,
          color: '#fc7570',
          custom: expect.objectContaining({ rawValue: 10000, xValue: ['D'] }),
        },
        {
          name: 'E',
          y: 300,
          color: '#fbb755',
          custom: expect.objectContaining({ rawValue: 300, xValue: ['E'] }),
        },
      ]);
    });

    it('pie chart format break by number', () => {
      const chartData = categoricalData(
        {
          ...pieDataOptions,
          breakBy: [
            {
              name: 'Quantity',
              type: 'number',
              numberFormatConfig: { ...defaultNumberFormat, decimalScale: 2 },
            },
          ],
        },
        pieData,
      );

      // first test null are filtered default
      const { options: chartOptions } = highchartsOptionsService(
        chartData,
        'pie',
        BaseDesignOptions,
        pieDataOptions,
      );
      expect(chartOptions?.series[0].data.map((d) => d.name)).toEqual([
        '700.00',
        '800.00',
        '1.30K',
        '1.81K',
        '6.78K',
      ]);
    });
  });

  describe('with values', () => {
    const pieDataOptions: CategoricalChartDataOptionsInternal = {
      y: [units, quantity, returns, inventory],
      breakBy: [],
    };

    it('pie chart', () => {
      const chartData = categoricalData(pieDataOptions, {
        ...pieData,
        rows: [pieData.rows[0]],
      });

      // first test null are filtered default
      const { options: chartOptions } = highchartsOptionsService(
        chartData,
        'pie',
        BaseDesignOptions,
        pieDataOptions,
      );
      expect(chartOptions?.series[0].data).toEqual([
        {
          name: 'Units',
          y: 1500,
          color: '#00cee6',
          custom: expect.objectContaining({ rawValue: 1500 }),
        },
        {
          name: 'Quantity',
          y: 6781,
          color: '#9b9bd7',
          custom: expect.objectContaining({ rawValue: 6781 }),
        },
        {
          name: 'Returns',
          y: 3420,
          color: '#6eda55',
          custom: expect.objectContaining({ rawValue: 3420 }),
        },
        {
          name: 'Inventory',
          y: 200,
          color: '#fc7570',
          custom: expect.objectContaining({ rawValue: 200 }),
        },
      ]);
    });
  });
});

describe('funnelChart', () => {
  const funnelData = createDataTableFromData({
    columns: [
      { name: 'Stage', type: 'string' },
      { name: 'Unique Users', type: 'number' },
    ],
    rows: [
      ['Website visits', 15654],
      ['Downloads', 4064],
      ['Requested price list', 1987],
      ['Invoice sent', 976],
      ['Finalized', 846],
    ],
  });

  const stage: Category = {
    name: 'Stage',
    type: 'string',
    sortType: 'sortNone',
  };
  const uniqueUsers = {
    name: 'Unique Users',
    aggregation: 'count',
    title: 'Unique Users',
  };

  describe('with break by', () => {
    let chartOptions: HighchartsOptionsInternal;

    beforeAll(() => {
      const funnelDataOptions: CategoricalChartDataOptionsInternal = {
        y: [uniqueUsers],
        breakBy: [stage],
      };

      const chartData = categoricalData(funnelDataOptions, funnelData);

      const { options: highchartsOptions } = highchartsOptionsService(
        chartData,
        'funnel',
        BaseDesignOptions,
        funnelDataOptions,
      );
      chartOptions = highchartsOptions;
    });

    it('has correct chart type', () => {
      expect(chartOptions.chart.type).toBe('funnel');
    });

    it('has correct chart spacing', () => {
      const expectedSpacing = [30, 30, 30, 30];

      expect(chartOptions.chart.spacing).toStrictEqual(expectedSpacing);
    });

    it('has all categories', () => {
      // make sure each SeriesPointStructure is extended with custom properties
      expect(chartOptions.series[0].data).toEqual([
        {
          name: 'Website visits',
          y: 15654,
          color: '#00cee6',
          custom: { number1: 100 },
        },
        {
          name: 'Downloads',
          y: 4064,
          color: '#9b9bd7',
          custom: { number1: 25.96141561262297 },
        },
        {
          name: 'Requested price list',
          y: 1987,
          color: '#6eda55',
          custom: { number1: 12.693241344065415 },
        },
        {
          name: 'Invoice sent',
          y: 976,
          color: '#fc7570',
          custom: { number1: 6.234828158937013 },
        },
        {
          name: 'Finalized',
          y: 846,
          color: '#fbb755',
          custom: { number1: 5.40436949022614 },
        },
      ]);
    });
  });
});
