import { ScatterChartData } from '../chart-data/types';
import { ScatterChartDesignOptions } from './translations/design_options';
import { getScatterChartOptions, getScatterLegendSettings } from './scatter_chart_options';
import { SERIES_CAPACITY } from './translations/base_design_options';
import { ScatterCustomPointOptions } from './translations/scatter_tooltip';

const customCategoriesCapacity = 2;

describe('getScatterChartOptions', () => {
  const chartData: ScatterChartData = {
    type: 'scatter',
    scatterDataTable: [
      {
        xAxis: { displayValue: 'xCategory1' },
        yAxis: { displayValue: 'yCategory2' },
      },
      // data item outside the categories data capacity limit
      {
        xAxis: { displayValue: 'xCategory3' },
        yAxis: { displayValue: 'yCategory3' },
      },
    ],
    xCategories: ['xCategory1', 'xCategory2', 'xCategory3'],
    yCategories: ['yCategory1', 'yCategory2', 'yCategory3'],
  };
  const chartType = 'scatter';
  const chartDesignOptions: ScatterChartDesignOptions = {
    legend: 'bottom',
    valueLabel: null,
    lineType: 'straight',
    lineWidth: 0,
    marker: {
      enabled: true,
      fill: 'hollow',
      size: 'small',
    },
    xAxis: {
      enabled: true,
      gridLine: true,
      labels: true,
      type: 'linear',
      titleEnabled: true,
      title: 'X Axis title',
      min: null,
      max: null,
      tickInterval: null,
    },
    yAxis: {
      enabled: true,
      gridLine: true,
      labels: true,
      type: 'linear',
      titleEnabled: true,
      title: 'Y Axis title',
      min: null,
      max: null,
      tickInterval: null,
    },
    autoZoom: true,
    dataLimits: {
      seriesCapacity: SERIES_CAPACITY,
      categoriesCapacity: customCategoriesCapacity,
    },
    markerSize: {
      scatterDefaultSize: 20,
      scatterBubbleMinSize: 20,
      scatterBubbleMaxSize: 40,
    },
  };

  const dataOptions = {};

  const { options } = getScatterChartOptions(chartData, chartType, chartDesignOptions, dataOptions);

  it('Has "chart" options', () => {
    expect(options.chart).toBeInstanceOf(Object);
  });

  it('Has "title" options', () => {
    expect(options.title).toBeInstanceOf(Object);
  });

  it('Has "subtitle" options', () => {
    expect(options.subtitle).toBeInstanceOf(Object);
  });

  it('Has "xAxis" options', () => {
    expect(options.xAxis).toBeInstanceOf(Object);
  });

  it('Has "yAxis" options', () => {
    expect(options.yAxis).toBeInstanceOf(Object);
  });

  it('Has "legend" options', () => {
    expect(options.legend).toBeInstanceOf(Object);
  });

  it('Has "plotOptions" options', () => {
    expect(options.plotOptions).toBeInstanceOf(Object);
  });

  it('Has "series" options', () => {
    expect(options.series).toHaveLength(1);
  });

  it('Has "tooltip" options', () => {
    expect(options.tooltip).toBeInstanceOf(Object);
  });

  // options.chart
  it('Has correct chart type', () => {
    expect(options.chart.type).toBe('bubble');
  });

  it('Has correct chart spacing', () => {
    const expectedSpacing = [20, 20, 20, 20];

    expect(options.chart.spacing).toStrictEqual(expectedSpacing);
  });

  it('Has correct marginTop value', () => {
    const expectedValue = 30;

    expect(options.chart.marginTop).toStrictEqual(expectedValue);
  });

  it('should alignTicks disabled', () => {
    expect(options.chart.alignTicks).toBe(false);
  });

  it('should apply data limits to axes', () => {
    expect(chartData.xCategories?.length).toBeGreaterThan(customCategoriesCapacity);
    expect(chartData.yCategories?.length).toBeGreaterThan(customCategoriesCapacity);
    expect(options.xAxis[0].categories).toHaveLength(customCategoriesCapacity);
    expect(options.yAxis![0].categories).toHaveLength(customCategoriesCapacity);
  });

  it('should generate series without points related to categories restricted data limits', () => {
    const xCategoriesAllowed = chartData.xCategories?.slice(0, customCategoriesCapacity);
    const yCategoriesAllowed = chartData.yCategories?.slice(0, customCategoriesCapacity);

    options.series[0].data.forEach((point) => {
      const { maskedX, maskedY } = point.custom as unknown as ScatterCustomPointOptions;
      expect(xCategoriesAllowed).toContain(maskedX);
      expect(yCategoriesAllowed).toContain(maskedY);
    });
  });
});

describe('Scatter legend', () => {
  const options = getScatterLegendSettings('bottom');

  it('should be enabled', () => {
    expect(options.enabled).toBe(true);
  });

  it('should have correct item styles', () => {
    expect(options.itemStyle).toStrictEqual({
      color: '#5B6372',
      cursor: 'default',
      fontFamily: 'Open Sans',
      fontSize: '13px',
      fontWeight: 'normal',
    });
  });

  it('should have correct legend style', () => {
    expect(options).toMatchObject({
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: '0',
    });
  });

  it('should have correct position', () => {
    expect(options).toMatchObject({
      align: 'center',
      layout: 'horizontal',
      verticalAlign: 'bottom',
    });
  });
});
