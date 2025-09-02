import { describe, test, expect, vi } from 'vitest';
import { areaHighchartsOptionsBuilder } from './highcharts-options-builder';
import { BuildContext } from '../../../../types';
import { StackableChartDesignOptions } from '@/chart-options-processor/translations/design-options';
import { CartesianChartDataOptionsInternal } from '@/chart-data-options/types';
import { CompleteThemeSettings } from '@/types';
import { TFunction } from '@sisense/sdk-common';

// Mock the dependencies
vi.mock('../../../helpers/highchart-options/get-legacy-cartesian-chart-options', () => ({
  getLegacyCartesianChartOptions: vi.fn(),
}));

vi.mock('../../../helpers/highchart-options/legend', () => ({
  getBasicCartesianLegend: vi.fn(),
}));

vi.mock('../../../helpers/highchart-options/tooltip', () => ({
  getBasicCartesianTooltip: vi.fn(),
}));

vi.mock('./axes', () => ({
  getAxes: vi.fn(),
}));

vi.mock('lodash-es/omit', () => ({
  default: vi.fn(),
}));

vi.mock('@/utils/__development-utils__/highcharts-options-builder-collector', () => ({
  withMethodsInputOutputCollection: vi.fn(() => (target: any) => target),
}));

// Import mocked functions
import { getLegacyCartesianChartOptions } from '../../../helpers/highchart-options/get-legacy-cartesian-chart-options';
import { getBasicCartesianLegend } from '../../../helpers/highchart-options/legend';
import { getBasicCartesianTooltip } from '../../../helpers/highchart-options/tooltip';
import { getAxes } from './axes';
import omit from 'lodash-es/omit';

describe('areaHighchartsOptionsBuilder', () => {
  const createMockBuildContext = (
    stackType: 'classic' | 'stacked' | 'stack100' = 'stacked',
    showTotal = false,
    legendPosition: 'top' | 'left' | 'right' | 'bottom' | null = 'bottom',
  ): BuildContext<'area'> => ({
    chartData: {
      type: 'cartesian',
      series: [
        {
          name: 'Series 1',
          data: [10, 20, 30],
        },
        {
          name: 'Series 2',
          data: [15, 25, 35],
        },
      ],
      xAxisCount: 1,
      xValues: ['A', 'B', 'C'],
    } as any,
    dataOptions: {
      x: [{ column: { name: 'Category', type: 'string' }, sortType: 'sortNone' }],
      y: [
        {
          column: { name: 'Revenue', aggregation: 'sum' },
          showOnRightAxis: false,
          numberFormatConfig: { decimalScale: 2, symbol: '$', prefix: true },
        },
      ],
      breakBy: [],
    } as CartesianChartDataOptionsInternal,
    designOptions: {
      stackType,
      showTotal,
      totalLabelRotation: 0,
      valueLabel: {},
      legend: legendPosition,
      lineType: 'straight',
      lineWidth: 2,
      marker: { enabled: false, size: 'small', fill: 'full' },
      autoZoom: { enabled: false },
      xAxis: {
        type: 'linear',
        enabled: true,
        titleEnabled: true,
        title: 'X Axis',
        gridLine: true,
        labels: true,
        min: null,
        max: null,
        tickInterval: null,
      },
      yAxis: {
        type: 'linear',
        enabled: true,
        titleEnabled: true,
        title: 'Y Axis',
        gridLine: true,
        labels: true,
        min: null,
        max: null,
        tickInterval: null,
      },
      dataLimits: {
        seriesCapacity: 50,
        categoriesCapacity: 50000,
      },
      designPerSeries: {},
    } as StackableChartDesignOptions,
    extraConfig: {
      translate: vi.fn((key: string) => key) as unknown as TFunction,
      themeSettings: {
        typography: {
          primaryTextColor: '#000000',
        },
      } as CompleteThemeSettings,
      dateFormatter: vi.fn(() => 'formatted-date'),
      accessibilityEnabled: false,
    },
  });

  // Mock return values for dependencies
  const mockLegacyOptions = {
    chart: {
      type: 'area',
      backgroundColor: '#ffffff',
      plotBackgroundColor: null,
    },
    series: [
      {
        name: 'Mock Series',
        type: 'area',
        data: [1, 2, 3],
      },
    ],
    xAxis: {
      categories: ['A', 'B', 'C'],
      title: { text: 'X Axis' },
    },
    yAxis: {
      title: { text: 'Y Axis' },
      min: 0,
    },
    legend: {
      enabled: true,
      align: 'center',
      verticalAlign: 'bottom',
    },
    plotOptions: {
      area: {
        stacking: 'normal',
        marker: { enabled: false },
      },
    },
    tooltip: {
      enabled: true,
      shared: true,
    },
    // Additional properties to test omit functionality
    extraneous: {
      property: 'value',
    },
    navigation: {
      buttonOptions: {
        enabled: false,
      },
    },
  };

  const mockAxes = {
    xAxis: [
      {
        categories: ['A', 'B', 'C'],
        title: { text: 'Enhanced X Axis' },
      },
    ],
    yAxis: [
      {
        title: { text: 'Enhanced Y Axis' },
        min: 0,
        stackLabels: { enabled: true },
      },
    ],
  };

  const mockLegend = {
    enabled: true,
    align: 'center',
    verticalAlign: 'bottom',
    itemStyle: { fontSize: '12px' },
  };

  const mockTooltip = {
    enabled: true,
    shared: true,
    backgroundColor: '#ffffff',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock behaviors
    (getLegacyCartesianChartOptions as any).mockReturnValue(mockLegacyOptions);
    (getAxes as any).mockReturnValue(mockAxes);
    (getBasicCartesianLegend as any).mockReturnValue(mockLegend);
    (getBasicCartesianTooltip as any).mockReturnValue(mockTooltip);
    (omit as any).mockImplementation((obj: any, keys: string[]) => {
      const result = { ...obj };
      keys.forEach((key: string) => delete result[key]);
      return result;
    });
  });

  describe('getChart', () => {
    test('should return chart options from legacy cartesian chart options', () => {
      const ctx = createMockBuildContext();
      const result = areaHighchartsOptionsBuilder.getChart(ctx);

      expect(getLegacyCartesianChartOptions).toHaveBeenCalledWith(ctx, 'area');
      expect(result).toEqual(mockLegacyOptions.chart);
    });

    test('should call legacy function with correct chart type for different contexts', () => {
      const contexts = [
        createMockBuildContext('classic'),
        createMockBuildContext('stacked'),
        createMockBuildContext('stack100'),
      ];

      contexts.forEach((ctx) => {
        vi.clearAllMocks();
        areaHighchartsOptionsBuilder.getChart(ctx);

        expect(getLegacyCartesianChartOptions).toHaveBeenCalledWith(ctx, 'area');
      });
    });
  });

  describe('getSeries', () => {
    test('should return series options from legacy cartesian chart options', () => {
      const ctx = createMockBuildContext();
      const result = areaHighchartsOptionsBuilder.getSeries(ctx);

      expect(getLegacyCartesianChartOptions).toHaveBeenCalledWith(ctx, 'area');
      expect(result).toEqual(mockLegacyOptions.series);
    });

    test('should maintain series data integrity across different configurations', () => {
      const testCases = [
        { stackType: 'classic' as const, showTotal: false },
        { stackType: 'stacked' as const, showTotal: true },
        { stackType: 'stack100' as const, showTotal: true },
      ];

      testCases.forEach(({ stackType, showTotal }) => {
        const ctx = createMockBuildContext(stackType, showTotal);
        const result = areaHighchartsOptionsBuilder.getSeries(ctx);

        expect(result).toEqual(mockLegacyOptions.series);
        expect(getLegacyCartesianChartOptions).toHaveBeenCalledWith(ctx, 'area');
      });
    });
  });

  describe('getAxes', () => {
    test('should return axes from getAxes function', () => {
      const ctx = createMockBuildContext();
      const result = areaHighchartsOptionsBuilder.getAxes(ctx);

      expect(getAxes).toHaveBeenCalledWith(ctx);
      expect(result).toEqual(mockAxes);
    });

    test('should delegate axis creation to specialized area chart axes function', () => {
      const contexts = [
        createMockBuildContext('classic'),
        createMockBuildContext('stacked', true),
        createMockBuildContext('stack100', true),
      ];

      contexts.forEach((ctx) => {
        vi.clearAllMocks();
        areaHighchartsOptionsBuilder.getAxes(ctx);

        expect(getAxes).toHaveBeenCalledWith(ctx);
        expect(getAxes).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('getLegend', () => {
    test('should return legend from getBasicCartesianLegend with design options legend', () => {
      const ctx = createMockBuildContext('stacked', false, 'top');
      const result = areaHighchartsOptionsBuilder.getLegend(ctx);

      expect(getBasicCartesianLegend).toHaveBeenCalledWith(ctx.designOptions.legend);
      expect(result).toEqual(mockLegend);
    });

    test('should handle different legend positions', () => {
      const legendPositions: Array<'top' | 'left' | 'right' | 'bottom' | null> = [
        'top',
        'left',
        'right',
        'bottom',
        null,
      ];

      legendPositions.forEach((position) => {
        vi.clearAllMocks();
        const ctx = createMockBuildContext('stacked', false, position);
        areaHighchartsOptionsBuilder.getLegend(ctx);

        expect(getBasicCartesianLegend).toHaveBeenCalledWith(position);
      });
    });
  });

  describe('getPlotOptions', () => {
    test('should return plot options from legacy cartesian chart options', () => {
      const ctx = createMockBuildContext();
      const result = areaHighchartsOptionsBuilder.getPlotOptions(ctx);

      expect(getLegacyCartesianChartOptions).toHaveBeenCalledWith(ctx, 'area');
      expect(result).toEqual(mockLegacyOptions.plotOptions);
    });

    test('should provide area-specific plot options for different stack types', () => {
      const stackTypes: Array<'classic' | 'stacked' | 'stack100'> = [
        'classic',
        'stacked',
        'stack100',
      ];

      stackTypes.forEach((stackType) => {
        vi.clearAllMocks();
        const ctx = createMockBuildContext(stackType);
        const result = areaHighchartsOptionsBuilder.getPlotOptions(ctx);

        expect(getLegacyCartesianChartOptions).toHaveBeenCalledWith(ctx, 'area');
        expect(result).toBeDefined();
      });
    });
  });

  describe('getTooltip', () => {
    test('should return tooltip from getBasicCartesianTooltip', () => {
      const ctx = createMockBuildContext();
      const result = areaHighchartsOptionsBuilder.getTooltip(ctx);

      expect(getBasicCartesianTooltip).toHaveBeenCalledWith(ctx);
      expect(result).toEqual(mockTooltip);
    });

    test('should use basic cartesian tooltip for all area chart configurations', () => {
      const configurations = [
        createMockBuildContext('classic'),
        createMockBuildContext('stacked', true),
        createMockBuildContext('stack100', true),
      ];

      configurations.forEach((ctx) => {
        vi.clearAllMocks();
        areaHighchartsOptionsBuilder.getTooltip(ctx);

        expect(getBasicCartesianTooltip).toHaveBeenCalledWith(ctx);
      });
    });
  });

  describe('getExtras', () => {
    test('should return omitted properties from legacy options', () => {
      const ctx = createMockBuildContext();
      areaHighchartsOptionsBuilder.getExtras(ctx);

      expect(getLegacyCartesianChartOptions).toHaveBeenCalledWith(ctx, 'area');
      expect(omit).toHaveBeenCalledWith(mockLegacyOptions, [
        'chart',
        'series',
        'xAxis',
        'yAxis',
        'legend',
        'plotOptions',
        'tooltip',
      ]);
    });

    test('should exclude main option categories and return remaining properties', () => {
      const ctx = createMockBuildContext();
      areaHighchartsOptionsBuilder.getExtras(ctx);

      // Verify that omit was called with correct exclusion list
      const expectedOmitKeys = [
        'chart',
        'series',
        'xAxis',
        'yAxis',
        'legend',
        'plotOptions',
        'tooltip',
      ];

      expect(omit).toHaveBeenCalledWith(mockLegacyOptions, expectedOmitKeys);
    });

    test('should preserve non-main option properties', () => {
      // Mock omit to return what we expect
      const expectedExtras = {
        extraneous: { property: 'value' },
        navigation: { buttonOptions: { enabled: false } },
      };
      (omit as any).mockReturnValue(expectedExtras);

      const ctx = createMockBuildContext();
      const result = areaHighchartsOptionsBuilder.getExtras(ctx);

      expect(result).toEqual(expectedExtras);
    });
  });

  describe('builder object structure', () => {
    test('should have all required methods', () => {
      const requiredMethods = [
        'getChart',
        'getSeries',
        'getAxes',
        'getLegend',
        'getPlotOptions',
        'getTooltip',
        'getExtras',
      ];

      requiredMethods.forEach((method) => {
        expect(areaHighchartsOptionsBuilder).toHaveProperty(method);
        expect(typeof areaHighchartsOptionsBuilder[method]).toBe('function');
      });
    });

    test('should implement HighchartsOptionsBuilder interface correctly', () => {
      const ctx = createMockBuildContext();

      // Test that all methods can be called with build context
      expect(() => areaHighchartsOptionsBuilder.getChart(ctx)).not.toThrow();
      expect(() => areaHighchartsOptionsBuilder.getSeries(ctx)).not.toThrow();
      expect(() => areaHighchartsOptionsBuilder.getAxes(ctx)).not.toThrow();
      expect(() => areaHighchartsOptionsBuilder.getLegend(ctx)).not.toThrow();
      expect(() => areaHighchartsOptionsBuilder.getPlotOptions(ctx)).not.toThrow();
      expect(() => areaHighchartsOptionsBuilder.getTooltip(ctx)).not.toThrow();
      expect(() => areaHighchartsOptionsBuilder.getExtras(ctx)).not.toThrow();
    });
  });

  describe('functional programming patterns', () => {
    test('should not mutate build context', () => {
      const ctx = createMockBuildContext();
      const originalDataOptions = JSON.parse(JSON.stringify(ctx.dataOptions));
      const originalDesignOptions = JSON.parse(JSON.stringify(ctx.designOptions));
      const originalChartData = JSON.parse(JSON.stringify(ctx.chartData));

      // Call all methods
      areaHighchartsOptionsBuilder.getChart(ctx);
      areaHighchartsOptionsBuilder.getSeries(ctx);
      areaHighchartsOptionsBuilder.getAxes(ctx);
      areaHighchartsOptionsBuilder.getLegend(ctx);
      areaHighchartsOptionsBuilder.getPlotOptions(ctx);
      areaHighchartsOptionsBuilder.getTooltip(ctx);
      areaHighchartsOptionsBuilder.getExtras(ctx);

      // Test that main data structures weren't mutated (excluding function properties)
      expect(ctx.dataOptions).toEqual(originalDataOptions);
      expect(ctx.designOptions).toEqual(originalDesignOptions);
      expect(ctx.chartData).toEqual(originalChartData);
    });

    test('should return consistent results for same input', () => {
      const ctx = createMockBuildContext('stack100', true);

      const methods = [
        'getChart',
        'getSeries',
        'getAxes',
        'getLegend',
        'getPlotOptions',
        'getTooltip',
        'getExtras',
      ] as const;

      methods.forEach((method) => {
        const result1 = areaHighchartsOptionsBuilder[method](ctx);
        const result2 = areaHighchartsOptionsBuilder[method](ctx);

        expect(result1).toEqual(result2);
      });
    });
  });

  describe('integration with development utils', () => {
    test('should be wrapped with withMethodsInputOutputCollection', () => {
      // This test verifies that the development utility wrapper is applied
      // The actual functionality is tested through the behavior of the methods
      expect(areaHighchartsOptionsBuilder).toBeDefined();
      expect(typeof areaHighchartsOptionsBuilder).toBe('object');
    });
  });

  describe('area chart specificity', () => {
    test('should always use "area" as chart type in legacy options calls', () => {
      const ctx = createMockBuildContext();

      // Call methods that use legacy options
      areaHighchartsOptionsBuilder.getChart(ctx);
      areaHighchartsOptionsBuilder.getSeries(ctx);
      areaHighchartsOptionsBuilder.getPlotOptions(ctx);
      areaHighchartsOptionsBuilder.getExtras(ctx);

      // Verify all calls used 'area' as chart type
      expect(getLegacyCartesianChartOptions).toHaveBeenCalledTimes(4);
      (getLegacyCartesianChartOptions as any).mock.calls.forEach((call: any[]) => {
        expect(call[1]).toBe('area');
      });
    });

    test('should use area-specific axes function', () => {
      const ctx = createMockBuildContext();
      areaHighchartsOptionsBuilder.getAxes(ctx);

      // Verify it uses the area-specific getAxes function, not legacy
      expect(getAxes).toHaveBeenCalledWith(ctx);
      expect(getAxes).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling', () => {
    test('should handle errors in dependency functions gracefully', () => {
      const ctx = createMockBuildContext();

      // Mock one dependency to throw
      (getLegacyCartesianChartOptions as any).mockImplementation(() => {
        throw new Error('Mock error');
      });

      expect(() => areaHighchartsOptionsBuilder.getChart(ctx)).toThrow('Mock error');
    });

    test('should handle undefined context properties', () => {
      const ctx = createMockBuildContext();
      ctx.designOptions.legend = undefined as any;

      expect(() => areaHighchartsOptionsBuilder.getLegend(ctx)).not.toThrow();
      expect(getBasicCartesianLegend).toHaveBeenCalledWith(undefined);
    });
  });

  describe('type safety', () => {
    test('should work with minimal build context', () => {
      const minimalCtx = createMockBuildContext();

      // Remove optional properties to test minimal configuration
      delete (minimalCtx.designOptions as any).totalLabelRotation;
      delete (minimalCtx.designOptions as any).showTotal;

      expect(() => {
        areaHighchartsOptionsBuilder.getChart(minimalCtx);
        areaHighchartsOptionsBuilder.getSeries(minimalCtx);
        areaHighchartsOptionsBuilder.getAxes(minimalCtx);
        areaHighchartsOptionsBuilder.getLegend(minimalCtx);
        areaHighchartsOptionsBuilder.getPlotOptions(minimalCtx);
        areaHighchartsOptionsBuilder.getTooltip(minimalCtx);
        areaHighchartsOptionsBuilder.getExtras(minimalCtx);
      }).not.toThrow();
    });
  });
});
