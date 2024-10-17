import { getScatterPlotOptions, type ScatterChartInternalSeries } from './scatter-plot-options';
import { ScatterChartDesignOptions } from './design-options';

const chartDesignOptions = {
  markerSize: {
    scatterDefaultSize: 15,
    scatterBubbleMinSize: 20,
    scatterBubbleMaxSize: 40,
  },
  valueLabel: {
    enabled: true,
    rotation: 0,
  },
} as ScatterChartDesignOptions;

describe('getScatterPlotOptions', () => {
  describe('bubble sizing options', () => {
    it('should have correct options when "size" data options selected', () => {
      const dataOptions = {
        size: {
          column: {
            name: 'size',
            aggregation: 'count',
            title: 'Size',
          },
        },
      };
      const options = getScatterPlotOptions(chartDesignOptions, dataOptions);
      expect(options.bubble).toMatchObject({
        minSize: 20,
        maxSize: 40,
      });
    });

    it('should have correct options when "size" data options not selected', () => {
      const options = getScatterPlotOptions(chartDesignOptions, {});
      expect(options.bubble).toMatchObject({
        maxSize: 15,
        minSize: 15,
      });
    });
  });

  describe('series data labels options', () => {
    const expectedDataLabelsOptions = {
      enabled: true,
      align: 'center',
      verticalAlign: 'middle',
      rotation: 0,
      style: {
        fontWeight: '',
        textOutline: '',
      },
      formatter: expect.any(Function) as () => string,
      types: {
        count: false,
        relative: true,
        totals: true,
      },
    };

    it('should have correct options in case of "horizontal" orientation', () => {
      const options = getScatterPlotOptions(chartDesignOptions, {});
      expect(options.series.dataLabels).toStrictEqual({
        ...expectedDataLabelsOptions,
        y: -1,
      });
    });

    it('should have correct options in case of "diagonal" orientation', () => {
      const options = getScatterPlotOptions(
        {
          ...chartDesignOptions,
          valueLabel: {
            enabled: true,
            rotation: -45,
          },
        },
        {},
      );
      expect(options.series.dataLabels).toStrictEqual({
        ...expectedDataLabelsOptions,
        rotation: -45,
      });
    });

    it('should have correct options in case of "vertical" orientation', () => {
      const options = getScatterPlotOptions(
        {
          ...chartDesignOptions,
          valueLabel: {
            enabled: true,
            rotation: -90,
          },
        },
        {},
      );
      expect(options.series.dataLabels).toStrictEqual({
        ...expectedDataLabelsOptions,
        rotation: -90,
      });
    });

    describe('series data labels formatter', () => {
      const baseValue = '1234';
      const expectedValue = '1.23K';

      it('should have correct formatter over the point value that correspond to "y" measure by priority', () => {
        const options = getScatterPlotOptions(
          {
            ...chartDesignOptions,
            valueLabel: {
              enabled: true,
              rotation: -90,
            },
          },
          {
            y: { column: { name: 'y', aggregation: 'sum', title: 'Y' } },
            x: { column: { name: 'x', aggregation: 'sum', title: 'X' } },
            size: { column: { name: 'size', aggregation: 'sum', title: 'Size' } },
            breakByColor: {
              column: { name: 'breakByColor', aggregation: 'sum', title: 'Break By Color' },
            },
          },
        );

        const formatter = options.series.dataLabels?.formatter;
        const formattedValue = formatter?.call({
          point: {
            custom: {
              maskedY: baseValue,
            },
          },
        } as ScatterChartInternalSeries);

        expect(formattedValue).toBe(expectedValue);
      });

      it('should have correct formatter over the point value that correspond to "x" measure by priority', () => {
        const options = getScatterPlotOptions(
          {
            ...chartDesignOptions,
            valueLabel: {
              enabled: true,
              rotation: -90,
            },
          },
          {
            y: { column: { name: 'y', title: 'Y', type: 'string' } },
            x: { column: { name: 'x', aggregation: 'sum', title: 'X' } },
            size: { column: { name: 'size', aggregation: 'sum', title: 'Size' } },
            breakByColor: {
              column: { name: 'breakByColor', aggregation: 'sum', title: 'Break By Color' },
            },
          },
        );

        const formatter = options.series.dataLabels?.formatter;
        const formattedValue = formatter?.call({
          point: {
            custom: {
              maskedX: baseValue,
            },
          },
        } as ScatterChartInternalSeries);

        expect(formattedValue).toBe(expectedValue);
      });

      it('should have correct formatter over the point value that correspond to "size" measure by priority', () => {
        const options = getScatterPlotOptions(
          {
            ...chartDesignOptions,
            valueLabel: {
              enabled: true,
              rotation: -90,
            },
          },
          {
            y: { column: { name: 'y', title: 'Y', type: 'string' } },
            x: { column: { name: 'x', title: 'X', type: 'string' } },
            size: { column: { name: 'size', aggregation: 'sum', title: 'Size' } },
            breakByColor: {
              column: { name: 'breakByColor', aggregation: 'sum', title: 'Break By Color' },
            },
          },
        );

        const formatter = options.series.dataLabels?.formatter;
        const formattedValue = formatter?.call({
          point: {
            custom: {
              maskedSize: baseValue,
            },
          },
        } as ScatterChartInternalSeries);

        expect(formattedValue).toBe(expectedValue);
      });

      it('should have correct formatter over the point value that correspond to "breakByColor" measure by priority', () => {
        const options = getScatterPlotOptions(
          {
            ...chartDesignOptions,
            valueLabel: {
              enabled: true,
              rotation: -90,
            },
          },
          {
            y: { column: { name: 'y', title: 'Y', type: 'string' } },
            x: { column: { name: 'x', title: 'X', type: 'string' } },
            size: { column: { name: 'size', title: 'Size', type: 'string' } },
            breakByColor: {
              column: { name: 'breakByColor', aggregation: 'sum', title: 'Break By Color' },
            },
          },
        );

        const formatter = options.series.dataLabels?.formatter;
        const formattedValue = formatter?.call({
          point: {
            custom: {
              maskedBreakByColor: baseValue,
            },
          },
        } as ScatterChartInternalSeries);

        expect(formattedValue).toBe(expectedValue);
      });
    });

    it('should have correct series options', () => {
      const options = getScatterPlotOptions(chartDesignOptions, {});
      expect(options.series).toMatchObject({
        allowPointSelect: false,
        boostThreshold: 0,
        stickyTracking: false,
        turboThreshold: 0,
      });
    });
  });
});
