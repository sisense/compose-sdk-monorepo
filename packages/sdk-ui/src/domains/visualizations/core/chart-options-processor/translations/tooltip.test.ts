import { TFunction } from '@sisense/sdk-common';
import { describe, expect, it, vi } from 'vitest';

import { NumberFormatConfig } from '@/types';

import { translation } from '../../../../../infra/translation/resources/en';
import { colorChineseSilver, colorWhite } from '../../chart-data-options/coloring/consts';
import { CartesianChartDataOptionsInternal } from '../../chart-data-options/types';
import { FORECAST_PREFIX, TREND_PREFIX } from '../advanced-chart-options';
import { cartesianDataFormatter, getCartesianTooltipSettings } from './tooltip';
import { HighchartsDataPointContext } from './tooltip-utils';

const mockTranslate = vi.fn((key: string) => {
  const keys = key.split('.');
  let value: unknown = translation;
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k];
  }
  return typeof value === 'string' ? value : key;
}) as unknown as TFunction;

const baseMeasureColumn = (title: string) => ({
  column: { title, name: title.toLowerCase().replace(/\s+/g, '_'), type: 'number' as const },
  enabled: true,
  chartType: 'column' as const,
});

const createCartesianOptions = (
  overrides: Partial<CartesianChartDataOptionsInternal> = {},
): CartesianChartDataOptionsInternal => ({
  x: [
    {
      column: { name: 'x_col', type: 'string' },
      enabled: true,
    },
  ],
  y: [baseMeasureColumn('Revenue')],
  breakBy: [],
  ...overrides,
});

const createPointContext = (
  overrides: Partial<HighchartsDataPointContext> = {},
): HighchartsDataPointContext => ({
  series: { name: 'Revenue', color: '#111111' },
  x: '2024',
  y: 42,
  point: {
    name: 'Revenue',
    color: '#222222',
    y: 42,
  },
  ...overrides,
});
describe('tooltip utils', () => {
  describe('cartesianDataFormatter', () => {
    it('renders a standard tooltip with series name, formatted value, and x label', () => {
      const chartDataOptions = createCartesianOptions();
      const ctx = createPointContext();

      const html = cartesianDataFormatter(ctx, chartDataOptions);

      expect(html).toContain('Revenue');
      expect(html).toContain('42');
      expect(html).toContain('2024');
      // Self-closing <br /> is normalized to <br> by DOMPurify in tooltipWrapper.
      expect(html).toMatch(/<br[>\s/]/);
      expect(html).not.toMatch(/<br\s*\/>\s*<span/);
    });

    it('appends a percentage segment when percentage is present and the series supports it', () => {
      const chartDataOptions = createCartesianOptions();
      const ctx = createPointContext({ percentage: 33.7 });

      const html = cartesianDataFormatter(ctx, chartDataOptions);

      expect(html).toContain('/ 34%');
    });

    it('when breakBy is set, uses the first enabled Y measure for formatting', () => {
      const chartDataOptions = createCartesianOptions({
        breakBy: [{ column: { name: 'region', type: 'string' }, enabled: true }],
        y: [
          { ...baseMeasureColumn('Ignored'), enabled: false },
          { ...baseMeasureColumn('Active'), enabled: true },
        ],
      });
      const ctx = createPointContext({
        series: { name: 'Some Series', color: '#111' },
      });

      const html = cartesianDataFormatter(ctx, chartDataOptions);

      expect(html).toContain('42');
    });

    it('when breakBy is empty, selects Y by matching series name to measure column title', () => {
      const chartDataOptions = createCartesianOptions({
        y: [baseMeasureColumn('Alpha'), baseMeasureColumn('Beta')],
      });
      const ctx = createPointContext({
        series: { name: 'Beta', color: '#111' },
      });

      const html = cartesianDataFormatter(ctx, chartDataOptions);

      expect(html).toContain('Beta');
      expect(html).toContain('42');
    });

    it('formats a second X dimension when two X axes and custom xValue are present', () => {
      const chartDataOptions = createCartesianOptions({
        x: [
          { column: { name: 'x2_panel', type: 'string' }, enabled: true },
          { column: { name: 'x1_category', type: 'string' }, enabled: true },
        ],
      });
      const ctx = createPointContext({
        point: {
          name: 'Revenue',
          color: '#222',
          y: 10,
          custom: {
            xValue: ['WEEK-31', '2011-08-03T00:00:00'],
            xDisplayValue: ['WEEK-31', '03.08.11'],
          },
        },
        x: '03.08.11',
      });

      const html = cartesianDataFormatter(ctx, chartDataOptions);

      expect(html).toContain('WEEK-31');
      expect(html).toContain('03.08.11');
      expect(html).toMatch(/WEEK-31,\s*03\.08\.11/);
    });

    it('includes low and high range lines when point defines low and high', () => {
      const chartDataOptions = createCartesianOptions();
      const ctx = createPointContext({
        point: {
          name: 'Revenue',
          color: '#222',
          y: 40,
          low: 10,
          high: 90,
        },
      });

      const html = cartesianDataFormatter(ctx, chartDataOptions, mockTranslate);

      expect(html).toContain('10');
      expect(html).toContain('90');
    });

    it('renders trend tooltip when series name uses the trend prefix', () => {
      const expression = 'modelType=linear';
      const trendSeriesName = `${TREND_PREFIX}_Sales`;
      const chartDataOptions = createCartesianOptions({
        y: [
          {
            ...baseMeasureColumn(trendSeriesName),
            column: {
              title: trendSeriesName,
              name: 'sales',
              type: 'number',
              expression,
            },
          },
        ],
      });
      const ctx = createPointContext({
        series: { name: trendSeriesName, color: '#111' },
        point: {
          name: trendSeriesName,
          color: '#222',
          y: 5,
          trend: { min: 1, max: 9, median: 5, average: 5 },
        },
      });

      const html = cartesianDataFormatter(ctx, chartDataOptions, mockTranslate);

      expect(html).toContain('Linear Trend');
      expect(html).toContain('Sales');
    });

    it('renders forecast tooltip when series name uses the forecast prefix', () => {
      const expression = 'confidenceInterval=0.95';
      const forecastSeriesName = `${FORECAST_PREFIX}_Sales`;
      const chartDataOptions = createCartesianOptions({
        y: [
          {
            ...baseMeasureColumn(forecastSeriesName),
            column: {
              title: forecastSeriesName,
              name: 'sales',
              type: 'number',
              expression,
            },
          },
        ],
      });
      const ctx = createPointContext({
        series: { name: forecastSeriesName, color: '#111' },
        point: {
          name: forecastSeriesName,
          color: '#222',
          y: 100,
          low: 80,
          high: 120,
        },
      });

      const html = cartesianDataFormatter(ctx, chartDataOptions, mockTranslate);

      expect(html).toContain('95%');
      expect(html).toContain('Forecast');
    });

    it('defaults forecast confidence to 80% when expression has no confidence interval', () => {
      const forecastSeriesName = `${FORECAST_PREFIX}_Sales`;
      const chartDataOptions = createCartesianOptions({
        y: [
          {
            ...baseMeasureColumn(forecastSeriesName),
            column: {
              title: forecastSeriesName,
              name: 'sales',
              type: 'number',
              expression: 'other=value',
            },
          },
        ],
      });
      const ctx = createPointContext({
        series: { name: forecastSeriesName, color: '#111' },
        point: {
          name: forecastSeriesName,
          color: '#222',
          y: 1,
        },
      });

      const html = cartesianDataFormatter(ctx, chartDataOptions, mockTranslate);

      expect(html).toContain('80%');
    });
  });

  describe('getCartesianTooltipSettings', () => {
    it('returns Highcharts tooltip options and delegates formatting to cartesianDataFormatter', () => {
      const chartDataOptions = createCartesianOptions();
      const ctx = createPointContext();

      const settings = getCartesianTooltipSettings(chartDataOptions, mockTranslate);

      expect(settings).toEqual({
        animation: false,
        backgroundColor: colorWhite,
        borderColor: colorChineseSilver,
        borderRadius: 10,
        borderWidth: 1,
        useHTML: true,
        formatter: expect.any(Function),
      });

      const formatter = settings.formatter;
      if (!formatter) {
        throw new Error('expected tooltip formatter');
      }
      const html = formatter.call(ctx);
      expect(html).toContain('Revenue');
      expect(html).toContain('42');
    });
  });

  describe('getCartesianTooltipSettings with number formats', () => {
    const format1: NumberFormatConfig = { name: 'Currency', symbol: '$', decimalScale: 2 };
    const format2: NumberFormatConfig = { name: 'Currency', symbol: '!', decimalScale: 3 };
    const format3: NumberFormatConfig = { name: 'Currency', symbol: '@', decimalScale: 4 };

    const dataOptions: CartesianChartDataOptionsInternal = {
      x: [
        { column: { name: 'x1', type: 'number' }, numberFormatConfig: format1 },
        { column: { name: 'x2', type: 'number' }, numberFormatConfig: format2 },
      ],
      y: [{ column: { title: 'v', name: 'v' }, numberFormatConfig: format3, enabled: true }],
      breakBy: [{ column: { name: 'b', type: 'number' } }],
    };

    it('should display cartesian tooltip for point', () => {
      const point: HighchartsDataPointContext = {
        series: { name: '3.14', color: 'red' },
        x: '1.25905',
        y: 42.0009,
        point: {
          x: 1,
          y: 42.0009,
          name: '3.14',
          color: 'red',
          custom: { xValue: [9.8765, 1.25905] },
        },
      };

      const seriesPoint = { ...point, ...getCartesianTooltipSettings(dataOptions) };
      const tooltip = seriesPoint.formatter ? seriesPoint.formatter.call(seriesPoint) : null;
      expect(tooltip).toMatchSnapshot();
    });

    it('should display pie tooltip for point', () => {
      const point: HighchartsDataPointContext = {
        series: { name: '3.14', color: 'red' },
        x: '',
        y: 42.0009,
        percentage: 20,
        point: {
          y: 42.0009,
          name: '3.14',
          color: 'red',
          custom: {},
        },
      };

      const seriesPoint = {
        ...point,
        ...getCartesianTooltipSettings({ ...dataOptions, breakBy: [dataOptions.x[0]] }),
      };
      const tooltip = seriesPoint.formatter ? seriesPoint.formatter.call(seriesPoint) : null;
      expect(tooltip).toMatchSnapshot();
    });

    it('should not contain percent for unsupported column', () => {
      const point: HighchartsDataPointContext = {
        series: { name: '3.14', color: 'red' },
        x: '',
        y: 42.0009,
        percentage: 20,
        point: {
          y: 42.0009,
          name: '3.14',
          color: 'red',
          custom: {},
        },
      };

      const seriesPoint = {
        ...point,
        ...getCartesianTooltipSettings({
          ...dataOptions,
          y: [{ ...dataOptions.y[0], chartType: 'line' }],
        }),
      };
      const tooltip = seriesPoint.formatter ? seriesPoint.formatter.call(seriesPoint) : null;
      expect(tooltip).toMatchSnapshot();
    });
  });
});
