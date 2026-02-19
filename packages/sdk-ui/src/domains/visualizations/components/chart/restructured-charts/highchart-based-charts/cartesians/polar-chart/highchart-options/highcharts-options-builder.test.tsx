import omit from 'lodash-es/omit';

import { BuildContext } from '../../../types.js';
import { getLegacyCartesianChartOptions } from '../../helpers/highchart-options/get-legacy-cartesian-chart-options.js';
import { getBasicCartesianLegend } from '../../helpers/highchart-options/legend.js';
import { getBasicCartesianTooltip } from '../../helpers/highchart-options/tooltip.js';
import { getAxes } from './axes.js';
import { polarHighchartsOptionsBuilder } from './highcharts-options-builder.js';

// Mock dependencies
vi.mock('../../helpers/highchart-options/get-legacy-cartesian-chart-options', () => ({
  getLegacyCartesianChartOptions: vi.fn(),
}));

vi.mock('../../helpers/highchart-options/legend', () => ({
  getBasicCartesianLegend: vi.fn(),
}));

vi.mock('../../helpers/highchart-options/tooltip', () => ({
  getBasicCartesianTooltip: vi.fn(),
}));

vi.mock('./axes', () => ({
  getAxes: vi.fn(),
}));

vi.mock('lodash-es/omit', () => ({
  default: vi.fn(),
}));

const mockedGetLegacyCartesianChartOptions = vi.mocked(getLegacyCartesianChartOptions);
const mockedGetBasicCartesianLegend = vi.mocked(getBasicCartesianLegend);
const mockedGetBasicCartesianTooltip = vi.mocked(getBasicCartesianTooltip);
const mockedGetAxes = vi.mocked(getAxes);
const mockedOmit = vi.mocked(omit);

describe('polar-chart highcharts-options-builder', () => {
  const mockContext: BuildContext<'polar'> = {
    chartData: {
      type: 'cartesian',
      xValues: [],
      series: [],
      xAxisCount: 1,
    },
    dataOptions: {
      x: [{ column: { name: 'x', type: 'text' } }],
      y: [{ column: { name: 'y', type: 'number' } }],
      breakBy: [],
    },
    designOptions: {
      lineType: 'straight',
      legend: {
        enabled: true,
        position: 'bottom',
      },
      lineWidth: 2,
      marker: { enabled: false, size: 'small', fill: 'full' },
      xAxis: {
        type: 'linear',
        enabled: true,
        titleEnabled: false,
        title: null,
        gridLine: true,
        labels: true,
        min: null,
        max: null,
        tickInterval: null,
      },
      yAxis: {
        type: 'linear',
        enabled: true,
        titleEnabled: false,
        title: null,
        gridLine: true,
        labels: true,
        min: null,
        max: null,
        tickInterval: null,
      },
      autoZoom: { enabled: true },
      dataLimits: { seriesCapacity: 50, categoriesCapacity: 100000 },
      polarType: 'column',
      designPerSeries: {},
    },
    extraConfig: {
      translate: vi.fn() as any,
      themeSettings: {} as any,
      dateFormatter: vi.fn() as any,
      accessibilityEnabled: false,
    },
  };

  const mockLegacyOptions = {
    chart: {
      type: 'column',
      spacing: [10, 10, 10, 10],
    },
    series: [
      {
        name: 'Series 1',
        data: [1, 2, 3],
        type: 'column',
      },
    ],
    xAxis: [
      {
        type: 'linear',
        categories: ['A', 'B', 'C'],
      },
    ],
    yAxis: [
      {
        type: 'linear',
        title: { text: null },
      },
    ],
    legend: {
      enabled: true,
      align: 'center',
      verticalAlign: 'bottom',
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
      },
    },
    tooltip: {
      shared: true,
      useHTML: true,
    },
    credits: {
      enabled: false,
    },
    exporting: {
      enabled: false,
    },
  };

  const mockAxes = {
    xAxis: [
      {
        type: 'linear',
        categories: ['A', 'B', 'C'],
        startOnTick: false,
        endOnTick: false,
      },
    ],
    yAxis: [
      {
        type: 'linear',
        title: { text: null },
      },
    ],
  };

  const mockLegend = {
    enabled: true,
    align: 'center',
    verticalAlign: 'bottom',
  };

  const mockTooltip = {
    shared: true,
    useHTML: true,
  };

  const mockExtras = {
    credits: { enabled: false },
    exporting: { enabled: false },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockedGetLegacyCartesianChartOptions.mockReturnValue(mockLegacyOptions as any);
    mockedGetAxes.mockReturnValue(mockAxes as any);
    mockedGetBasicCartesianLegend.mockReturnValue(mockLegend as any);
    mockedGetBasicCartesianTooltip.mockReturnValue(mockTooltip as any);
    mockedOmit.mockReturnValue(mockExtras as any);
  });

  describe('getChart', () => {
    it('should return chart options with polar mode enabled', () => {
      const result = polarHighchartsOptionsBuilder.getChart(mockContext);

      expect(mockedGetLegacyCartesianChartOptions).toHaveBeenCalledWith(mockContext, 'polar');
      expect(result).toEqual({
        type: 'column',
        spacing: [10, 10, 10, 10],
        polar: true,
      });
    });

    it('should preserve existing chart options and add polar flag', () => {
      const customChartOptions = {
        type: 'area',
        backgroundColor: '#ffffff',
        borderWidth: 1,
      };

      mockedGetLegacyCartesianChartOptions.mockReturnValue({
        ...mockLegacyOptions,
        chart: customChartOptions,
      } as any);

      const result = polarHighchartsOptionsBuilder.getChart(mockContext);

      expect(result).toEqual({
        ...customChartOptions,
        polar: true,
      });
    });
  });

  describe('getSeries', () => {
    it('should return series from legacy cartesian chart options', () => {
      const result = polarHighchartsOptionsBuilder.getSeries(mockContext);

      expect(mockedGetLegacyCartesianChartOptions).toHaveBeenCalledWith(mockContext, 'polar');
      expect(result).toEqual(mockLegacyOptions.series);
    });

    it('should handle empty series', () => {
      mockedGetLegacyCartesianChartOptions.mockReturnValue({
        ...mockLegacyOptions,
        series: [],
      } as any);

      const result = polarHighchartsOptionsBuilder.getSeries(mockContext);

      expect(result).toEqual([]);
    });
  });

  describe('getAxes', () => {
    it('should delegate to getAxes function', () => {
      const result = polarHighchartsOptionsBuilder.getAxes(mockContext);

      expect(mockedGetAxes).toHaveBeenCalledWith(mockContext);
      expect(result).toEqual(mockAxes);
    });
  });

  describe('getLegend', () => {
    it('should return legend from basic cartesian legend with design options', () => {
      const result = polarHighchartsOptionsBuilder.getLegend(mockContext);

      expect(mockedGetBasicCartesianLegend).toHaveBeenCalledWith(mockContext.designOptions.legend);
      expect(result).toEqual(mockLegend);
    });

    it('should handle different legend positions', () => {
      const contextWithTopLegend = {
        ...mockContext,
        designOptions: {
          ...mockContext.designOptions,
          legend: {
            enabled: true,
            position: 'top' as const,
          },
        },
      };

      const topLegend = {
        enabled: true,
        align: 'center',
        verticalAlign: 'top',
      };

      mockedGetBasicCartesianLegend.mockReturnValue(topLegend as any);

      const result = polarHighchartsOptionsBuilder.getLegend(contextWithTopLegend);

      expect(mockedGetBasicCartesianLegend).toHaveBeenCalledWith({
        enabled: true,
        position: 'top',
      });
      expect(result).toEqual(topLegend);
    });
  });

  describe('getPlotOptions', () => {
    it('should return plot options from legacy cartesian chart options', () => {
      const result = polarHighchartsOptionsBuilder.getPlotOptions(mockContext);

      expect(mockedGetLegacyCartesianChartOptions).toHaveBeenCalledWith(mockContext, 'polar');
      expect(result).toEqual(mockLegacyOptions.plotOptions);
    });

    it('should handle empty plot options', () => {
      mockedGetLegacyCartesianChartOptions.mockReturnValue({
        ...mockLegacyOptions,
        plotOptions: {},
      } as any);

      const result = polarHighchartsOptionsBuilder.getPlotOptions(mockContext);

      expect(result).toEqual({});
    });
  });

  describe('getTooltip', () => {
    it('should delegate to getBasicCartesianTooltip', () => {
      const result = polarHighchartsOptionsBuilder.getTooltip(mockContext);

      expect(mockedGetBasicCartesianTooltip).toHaveBeenCalledWith(mockContext);
      expect(result).toEqual(mockTooltip);
    });
  });

  describe('getExtras', () => {
    it('should return extras by omitting core chart properties', () => {
      const result = polarHighchartsOptionsBuilder.getExtras(mockContext);

      expect(mockedGetLegacyCartesianChartOptions).toHaveBeenCalledWith(mockContext, 'polar');
      expect(mockedOmit).toHaveBeenCalledWith(mockLegacyOptions, [
        'chart',
        'series',
        'xAxis',
        'yAxis',
        'legend',
        'plotOptions',
        'tooltip',
      ]);
      expect(result).toEqual(mockExtras);
    });

    it('should handle legacy options with additional properties', () => {
      const extendedLegacyOptions = {
        ...mockLegacyOptions,
        navigation: { buttonOptions: { enabled: false } },
        responsive: { rules: [] },
        accessibility: { enabled: false },
      };

      const extendedExtras = {
        credits: { enabled: false },
        exporting: { enabled: false },
        navigation: { buttonOptions: { enabled: false } },
        responsive: { rules: [] },
        accessibility: { enabled: false },
      };

      mockedGetLegacyCartesianChartOptions.mockReturnValue(extendedLegacyOptions as any);
      mockedOmit.mockReturnValue(extendedExtras as any);

      const result = polarHighchartsOptionsBuilder.getExtras(mockContext);

      expect(result).toEqual(extendedExtras);
    });
  });

  describe('integration', () => {
    it('should have all required methods for HighchartsOptionsBuilder', () => {
      expect(typeof polarHighchartsOptionsBuilder.getChart).toBe('function');
      expect(typeof polarHighchartsOptionsBuilder.getSeries).toBe('function');
      expect(typeof polarHighchartsOptionsBuilder.getAxes).toBe('function');
      expect(typeof polarHighchartsOptionsBuilder.getLegend).toBe('function');
      expect(typeof polarHighchartsOptionsBuilder.getPlotOptions).toBe('function');
      expect(typeof polarHighchartsOptionsBuilder.getTooltip).toBe('function');
      expect(typeof polarHighchartsOptionsBuilder.getExtras).toBe('function');
    });

    it('should call legacy cartesian chart options multiple times for different methods', () => {
      // Call multiple methods that rely on legacy options
      polarHighchartsOptionsBuilder.getChart(mockContext);
      polarHighchartsOptionsBuilder.getSeries(mockContext);
      polarHighchartsOptionsBuilder.getPlotOptions(mockContext);
      polarHighchartsOptionsBuilder.getExtras(mockContext);

      // Verify that getLegacyCartesianChartOptions was called 4 times
      expect(mockedGetLegacyCartesianChartOptions).toHaveBeenCalledTimes(4);
      // Each call should be with the same arguments
      expect(mockedGetLegacyCartesianChartOptions).toHaveBeenCalledWith(mockContext, 'polar');
    });
  });
});
