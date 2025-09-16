import { describe, it, expect } from 'vitest';
import { processSeries, type SeriesProcessingConfig } from './series-processor';
import { CategoricalSeriesValues } from '../../../chart-data/types';
import { CartesianChartDataOptionsInternal } from '../../../chart-data-options/types';
import { ChartDesignOptions, SeriesDesignOptions } from '../../translations/types';
import { ChartType } from '../../../types';

/**
 * Mock data for testing
 */
const createMockSeriesData = (): CategoricalSeriesValues[] => [
  {
    name: 'Series1',
    data: [{ value: 100 }, { value: 150 }, { value: 200 }],
  },
  {
    name: 'Series2',
    data: [{ value: 80 }, { value: 120 }, { value: 180 }],
  },
];

const createMockDataOptions = (): CartesianChartDataOptionsInternal => ({
  breakBy: [],
  y: [
    {
      column: {
        name: 'Series1',
        aggregation: 'sum',
        title: 'Series 1',
      },
      sortType: 'sortNone',
      color: '#ff0000',
      enabled: true,
    },
    {
      column: {
        name: 'Series2',
        aggregation: 'sum',
        title: 'Series 2',
      },
      sortType: 'sortNone',
      color: '#00ff00',
      enabled: true,
    },
  ],
  x: [
    {
      column: {
        name: 'Category',
        type: 'string',
      },
    },
  ],
});

const createBaseConfig = (): SeriesProcessingConfig => ({
  chartData: {
    series: createMockSeriesData(),
  },
  chartType: 'line' as ChartType,
  chartDesignOptions: {
    dataLimits: {
      seriesCapacity: 10,
      categoriesCapacity: 100,
    },
    marker: {
      enabled: true,
      size: 'small',
      fill: 'full',
    },
  } as ChartDesignOptions,
  dataOptions: createMockDataOptions(),
  continuousDatetimeXAxis: false,
  indexMap: [0, 1, 2],
  categories: ['A', 'B', 'C'],
  treatNullDataAsZeros: false,
  yTreatNullDataAsZeros: [false, false],
  yConnectNulls: [false, false],
  yAxisSide: [0, 0],
  yAxisChartType: [undefined, undefined],
  yAxisSettings: [
    {
      tickInterval: 1,
      min: undefined,
      max: undefined,
      title: { text: 'Y Axis' },
    },
    {
      tickInterval: 1,
      min: undefined,
      max: undefined,
      title: { text: 'Y Axis' },
    },
  ],
  axisClipped: [
    { minClipped: false, maxClipped: false },
    { minClipped: false, maxClipped: false },
  ],
  xAxisSettings: [
    {
      tickInterval: 1,
      min: undefined,
      max: undefined,
      title: { text: 'X Axis' },
    },
  ],
});

describe('processSeries', () => {
  describe('lineWidth property', () => {
    it('should apply lineWidth when provided in series design options', () => {
      const config = createBaseConfig();
      config.chartDesignOptions = {
        ...config.chartDesignOptions,
        line: {
          width: 5,
        },
      } as ChartDesignOptions;

      const result = processSeries(config);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('lineWidth', 5);
      expect(result[1]).toHaveProperty('lineWidth', 5);
    });

    it('should not include lineWidth when not provided in series design options', () => {
      const config = createBaseConfig();
      config.chartDesignOptions = {
        ...config.chartDesignOptions,
        line: {
          dashStyle: 'Dash',
        },
      } as ChartDesignOptions;

      const result = processSeries(config);

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('lineWidth');
      expect(result[1]).not.toHaveProperty('lineWidth');
    });

    it('should not include lineWidth when line object is undefined', () => {
      const config = createBaseConfig();
      config.chartDesignOptions = {
        ...config.chartDesignOptions,
        line: undefined,
      } as ChartDesignOptions;

      const result = processSeries(config);

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('lineWidth');
      expect(result[1]).not.toHaveProperty('lineWidth');
    });

    it('should handle lineWidth value of 0', () => {
      const config = createBaseConfig();
      config.chartDesignOptions = {
        ...config.chartDesignOptions,
        line: {
          width: 0,
        },
      } as ChartDesignOptions;

      const result = processSeries(config);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('lineWidth', 0);
      expect(result[1]).toHaveProperty('lineWidth', 0);
    });

    it('should handle large lineWidth values', () => {
      const config = createBaseConfig();
      config.chartDesignOptions = {
        ...config.chartDesignOptions,
        line: {
          width: 20,
        },
      } as ChartDesignOptions;

      const result = processSeries(config);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('lineWidth', 20);
      expect(result[1]).toHaveProperty('lineWidth', 20);
    });
  });

  describe('dashStyle property', () => {
    it('should apply dashStyle when provided in series design options', () => {
      const config = createBaseConfig();
      config.chartDesignOptions = {
        ...config.chartDesignOptions,
        line: {
          dashStyle: 'ShortDash',
        },
      } as ChartDesignOptions;

      const result = processSeries(config);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('dashStyle', 'ShortDash');
      expect(result[1]).toHaveProperty('dashStyle', 'ShortDash');
    });

    it('should not include dashStyle when not provided in series design options', () => {
      const config = createBaseConfig();
      config.chartDesignOptions = {
        ...config.chartDesignOptions,
        line: {
          width: 3,
        },
      } as ChartDesignOptions;

      const result = processSeries(config);

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('dashStyle');
      expect(result[1]).not.toHaveProperty('dashStyle');
    });

    it('should handle various dashStyle values', () => {
      const dashStyles = [
        'Solid',
        'ShortDash',
        'ShortDot',
        'ShortDashDot',
        'Dot',
        'Dash',
        'LongDash',
        'DashDot',
        'LongDashDot',
        'LongDashDotDot',
      ];

      dashStyles.forEach((dashStyle) => {
        const config = createBaseConfig();
        config.chartDesignOptions = {
          ...config.chartDesignOptions,
          line: {
            dashStyle: dashStyle as any,
          },
        } as ChartDesignOptions;

        const result = processSeries(config);

        expect(result).toHaveLength(2);
        expect(result[0]).toHaveProperty('dashStyle', dashStyle);
        expect(result[1]).toHaveProperty('dashStyle', dashStyle);
      });
    });

    it('should not include dashStyle when line object is undefined', () => {
      const config = createBaseConfig();
      config.chartDesignOptions = {
        ...config.chartDesignOptions,
        line: undefined,
      } as ChartDesignOptions;

      const result = processSeries(config);

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('dashStyle');
      expect(result[1]).not.toHaveProperty('dashStyle');
    });
  });

  describe('linecap property', () => {
    it('should apply linecap when endCap is provided in series design options', () => {
      const config = createBaseConfig();
      config.chartDesignOptions = {
        ...config.chartDesignOptions,
        line: {
          endCap: 'Round',
        },
      } as ChartDesignOptions;

      const result = processSeries(config);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('linecap', 'round');
      expect(result[1]).toHaveProperty('linecap', 'round');
    });

    it('should convert endCap to lowercase for linecap property', () => {
      const config = createBaseConfig();
      config.chartDesignOptions = {
        ...config.chartDesignOptions,
        line: {
          endCap: 'Square',
        },
      } as ChartDesignOptions;

      const result = processSeries(config);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('linecap', 'square');
      expect(result[1]).toHaveProperty('linecap', 'square');
    });

    it('should not include linecap when endCap is not provided in series design options', () => {
      const config = createBaseConfig();
      config.chartDesignOptions = {
        ...config.chartDesignOptions,
        line: {
          width: 3,
        },
      } as ChartDesignOptions;

      const result = processSeries(config);

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('linecap');
      expect(result[1]).not.toHaveProperty('linecap');
    });

    it('should handle various endCap values', () => {
      const endCaps = ['Round', 'Square', 'Butt'];

      endCaps.forEach((endCap) => {
        const config = createBaseConfig();
        config.chartDesignOptions = {
          ...config.chartDesignOptions,
          line: {
            endCap: endCap as any,
          },
        } as ChartDesignOptions;

        const result = processSeries(config);

        expect(result).toHaveLength(2);
        expect(result[0]).toHaveProperty('linecap', endCap.toLowerCase());
        expect(result[1]).toHaveProperty('linecap', endCap.toLowerCase());
      });
    });

    it('should not include linecap when line object is undefined', () => {
      const config = createBaseConfig();
      config.chartDesignOptions = {
        ...config.chartDesignOptions,
        line: undefined,
      } as ChartDesignOptions;

      const result = processSeries(config);

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('linecap');
      expect(result[1]).not.toHaveProperty('linecap');
    });
  });

  describe('shadow property', () => {
    it('should apply shadow when provided in series design options', () => {
      const config = createBaseConfig();
      config.chartDesignOptions = {
        ...config.chartDesignOptions,
        line: {
          shadow: true,
        },
      } as ChartDesignOptions;

      const result = processSeries(config);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('shadow', true);
      expect(result[1]).toHaveProperty('shadow', true);
    });

    it('should apply shadow false when provided in series design options', () => {
      const config = createBaseConfig();
      config.chartDesignOptions = {
        ...config.chartDesignOptions,
        line: {
          shadow: false,
        },
      } as ChartDesignOptions;

      const result = processSeries(config);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('shadow', false);
      expect(result[1]).toHaveProperty('shadow', false);
    });

    it('should not include shadow when not provided in series design options', () => {
      const config = createBaseConfig();
      config.chartDesignOptions = {
        ...config.chartDesignOptions,
        line: {
          width: 3,
        },
      } as ChartDesignOptions;

      const result = processSeries(config);

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('shadow');
      expect(result[1]).not.toHaveProperty('shadow');
    });

    it('should not include shadow when line object is undefined', () => {
      const config = createBaseConfig();
      config.chartDesignOptions = {
        ...config.chartDesignOptions,
        line: undefined,
      } as ChartDesignOptions;

      const result = processSeries(config);

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('shadow');
      expect(result[1]).not.toHaveProperty('shadow');
    });
  });

  describe('combined line properties', () => {
    it('should apply all line properties when all are provided', () => {
      const config = createBaseConfig();
      config.chartDesignOptions = {
        ...config.chartDesignOptions,
        line: {
          width: 4,
          dashStyle: 'Dash',
          endCap: 'Round',
          shadow: true,
        },
      } as ChartDesignOptions;

      const result = processSeries(config);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('lineWidth', 4);
      expect(result[0]).toHaveProperty('dashStyle', 'Dash');
      expect(result[0]).toHaveProperty('linecap', 'round');
      expect(result[0]).toHaveProperty('shadow', true);
      expect(result[1]).toHaveProperty('lineWidth', 4);
      expect(result[1]).toHaveProperty('dashStyle', 'Dash');
      expect(result[1]).toHaveProperty('linecap', 'round');
      expect(result[1]).toHaveProperty('shadow', true);
    });

    it('should apply only provided line properties', () => {
      const config = createBaseConfig();
      config.chartDesignOptions = {
        ...config.chartDesignOptions,
        line: {
          width: 2,
          dashStyle: 'Dot',
          // endCap and shadow intentionally omitted
        },
      } as ChartDesignOptions;

      const result = processSeries(config);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('lineWidth', 2);
      expect(result[0]).toHaveProperty('dashStyle', 'Dot');
      expect(result[0]).not.toHaveProperty('linecap');
      expect(result[0]).not.toHaveProperty('shadow');
      expect(result[1]).toHaveProperty('lineWidth', 2);
      expect(result[1]).toHaveProperty('dashStyle', 'Dot');
      expect(result[1]).not.toHaveProperty('linecap');
      expect(result[1]).not.toHaveProperty('shadow');
    });
  });

  describe('series-specific design options', () => {
    it('should apply series-specific line properties when designPerSeries is provided', () => {
      const config = createBaseConfig();
      config.chartDesignOptions = {
        ...config.chartDesignOptions,
        line: {
          width: 1,
          dashStyle: 'Solid',
        },
        designPerSeries: {
          Series1: {
            line: {
              width: 5,
              dashStyle: 'Dash',
              endCap: 'Square',
              shadow: true,
            },
            marker: {
              enabled: true,
              size: 'small',
              fill: 'full',
            },
          } as SeriesDesignOptions,
        },
      } as ChartDesignOptions;

      const result = processSeries(config);

      expect(result).toHaveLength(2);
      // First series should use series-specific design
      expect(result[0]).toHaveProperty('lineWidth', 5);
      expect(result[0]).toHaveProperty('dashStyle', 'Dash');
      expect(result[0]).toHaveProperty('linecap', 'square');
      expect(result[0]).toHaveProperty('shadow', true);
      // Second series should use global design
      expect(result[1]).toHaveProperty('lineWidth', 1);
      expect(result[1]).toHaveProperty('dashStyle', 'Solid');
      expect(result[1]).not.toHaveProperty('linecap');
      expect(result[1]).not.toHaveProperty('shadow');
    });

    it('should fallback to global design when series-specific design is not provided', () => {
      const config = createBaseConfig();
      config.chartDesignOptions = {
        ...config.chartDesignOptions,
        line: {
          width: 3,
          dashStyle: 'LongDash',
          shadow: false,
        },
        designPerSeries: {
          Series1: {
            line: {
              width: 7,
            },
            marker: {
              enabled: true,
              size: 'small',
              fill: 'full',
            },
          } as SeriesDesignOptions,
        },
      } as ChartDesignOptions;

      const result = processSeries(config);

      expect(result).toHaveLength(2);
      // First series should use series-specific design (only width)
      expect(result[0]).toHaveProperty('lineWidth', 7);
      expect(result[0]).not.toHaveProperty('dashStyle');
      expect(result[0]).not.toHaveProperty('shadow');
      // Second series should use global design
      expect(result[1]).toHaveProperty('lineWidth', 3);
      expect(result[1]).toHaveProperty('dashStyle', 'LongDash');
      expect(result[1]).toHaveProperty('shadow', false);
    });
  });

  describe('edge cases', () => {
    it('should handle undefined line properties gracefully', () => {
      const config = createBaseConfig();
      config.chartDesignOptions = {
        ...config.chartDesignOptions,
        line: {
          width: undefined,
          dashStyle: undefined,
          endCap: undefined,
          shadow: undefined,
        },
      } as ChartDesignOptions;

      const result = processSeries(config);

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('lineWidth');
      expect(result[0]).not.toHaveProperty('dashStyle');
      expect(result[0]).not.toHaveProperty('linecap');
      expect(result[0]).not.toHaveProperty('shadow');
      expect(result[1]).not.toHaveProperty('lineWidth');
      expect(result[1]).not.toHaveProperty('dashStyle');
      expect(result[1]).not.toHaveProperty('linecap');
      expect(result[1]).not.toHaveProperty('shadow');
    });

    it('should handle empty line object', () => {
      const config = createBaseConfig();
      config.chartDesignOptions = {
        ...config.chartDesignOptions,
        line: {},
      } as ChartDesignOptions;

      const result = processSeries(config);

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('lineWidth');
      expect(result[0]).not.toHaveProperty('dashStyle');
      expect(result[0]).not.toHaveProperty('linecap');
      expect(result[0]).not.toHaveProperty('shadow');
      expect(result[1]).not.toHaveProperty('lineWidth');
      expect(result[1]).not.toHaveProperty('dashStyle');
      expect(result[1]).not.toHaveProperty('linecap');
      expect(result[1]).not.toHaveProperty('shadow');
    });

    it('should handle missing line object entirely', () => {
      const config = createBaseConfig();
      config.chartDesignOptions = {
        ...config.chartDesignOptions,
        // line property intentionally omitted
      } as ChartDesignOptions;

      const result = processSeries(config);

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('lineWidth');
      expect(result[0]).not.toHaveProperty('dashStyle');
      expect(result[0]).not.toHaveProperty('linecap');
      expect(result[0]).not.toHaveProperty('shadow');
      expect(result[1]).not.toHaveProperty('lineWidth');
      expect(result[1]).not.toHaveProperty('dashStyle');
      expect(result[1]).not.toHaveProperty('linecap');
      expect(result[1]).not.toHaveProperty('shadow');
    });

    it('should respect seriesCapacity limit', () => {
      const config = createBaseConfig();
      config.chartDesignOptions = {
        ...config.chartDesignOptions,
        dataLimits: {
          seriesCapacity: 1,
          categoriesCapacity: 100,
        },
        line: {
          width: 3,
        },
      } as ChartDesignOptions;

      const result = processSeries(config);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('lineWidth', 3);
    });

    it('should handle single series correctly', () => {
      const config = createBaseConfig();
      config.chartData.series = [config.chartData.series[0]]; // Only first series
      config.chartDesignOptions = {
        ...config.chartDesignOptions,
        line: {
          width: 6,
          dashStyle: 'ShortDashDot',
          endCap: 'Square',
          shadow: true,
        },
      } as ChartDesignOptions;

      const result = processSeries(config);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('lineWidth', 6);
      expect(result[0]).toHaveProperty('dashStyle', 'ShortDashDot');
      expect(result[0]).toHaveProperty('linecap', 'square');
      expect(result[0]).toHaveProperty('shadow', true);
    });
  });

  describe('other series properties preservation', () => {
    it('should preserve other series properties when line properties are applied', () => {
      const config = createBaseConfig();
      config.chartDesignOptions = {
        ...config.chartDesignOptions,
        line: {
          width: 4,
          dashStyle: 'Dash',
        },
      } as ChartDesignOptions;

      const result = processSeries(config);

      expect(result).toHaveLength(2);

      // Check that line properties are applied
      expect(result[0]).toHaveProperty('lineWidth', 4);
      expect(result[0]).toHaveProperty('dashStyle', 'Dash');

      // Check that other properties are preserved
      expect(result[0]).toHaveProperty('name', 'Series1');
      expect(result[0]).toHaveProperty('showInNavigator', true);
      expect(result[0]).toHaveProperty('stickyTracking', false);
      expect(result[0]).toHaveProperty('boostThreshold', 0);
      expect(result[0]).toHaveProperty('turboThreshold', 0);
      expect(result[0]).toHaveProperty('yAxis', 0);
      expect(result[0]).toHaveProperty('connectNulls', false);
      expect(result[0]).toHaveProperty('dataLabels');
      expect(result[0]).toHaveProperty('marker');
    });
  });
});
