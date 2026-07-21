import Highcharts from '@sisense/sisense-charts';

import { buildSparklineOptions, SparklinePoint } from './sparkline-options.js';

const points: SparklinePoint[] = [
  { x: 1, y: 100 },
  { x: 2, y: null },
  { x: 3, y: 90 },
];

describe('buildSparklineOptions', () => {
  it('enables mouse tracking and a tooltip', () => {
    const options = buildSparklineOptions(points, 'line', '#123456');
    expect(options.tooltip?.enabled).toBe(true);
    expect(options.plotOptions?.series?.enableMouseTracking).toBe(true);
  });

  it('maps the spline chart type to both the chart and series', () => {
    const options = buildSparklineOptions(points, 'spline', '#123456');
    expect(options.chart?.type).toBe('spline');
    expect(options.series?.[0].type).toBe('spline');
  });

  it('preserves null points as gaps rather than coercing them to zero', () => {
    const options = buildSparklineOptions(points, 'line', '#123456');
    const series = options.series?.[0] as Highcharts.SeriesLineOptions;
    expect(series.data).toEqual([
      { x: 1, y: 100 },
      { x: 2, y: null },
      { x: 3, y: 90 },
    ]);
  });

  it('disables chrome not relevant to a sparkline', () => {
    const options = buildSparklineOptions(points, 'line', '#123456');
    expect(options.legend?.enabled).toBe(false);
    expect(options.credits?.enabled).toBe(false);
    expect(options.xAxis).toMatchObject({ visible: false });
    expect(options.yAxis).toMatchObject({ visible: false });
  });

  it('applies a gradient fill for the area chart type only', () => {
    const area = buildSparklineOptions(points, 'area', '#123456');
    expect(area.series?.[0]).toHaveProperty('fillColor');

    const line = buildSparklineOptions(points, 'line', '#123456');
    expect(line.series?.[0]).not.toHaveProperty('fillColor');
  });

  it('produces valid gradient stop colors even when the series color is not 6-digit hex', () => {
    // A named color/rgb()/short hex can't take a bare `${color}55`-style hex alpha suffix (that
    // produced invalid CSS like 'green55'); every stop must still be a real, parseable color.
    const area = buildSparklineOptions(points, 'area', 'green');
    const series = area.series?.[0] as Highcharts.SeriesAreaOptions;
    const fillColor = series.fillColor as { stops: [number, string][] };

    fillColor.stops.forEach(([, stopColor]) => {
      expect(stopColor).not.toBe('green55');
      expect(stopColor).not.toBe('green00');
      expect(stopColor).toMatch(/^#[0-9a-f]{6,8}$/i);
    });
  });

  it('formats the tooltip using the value format config and the injected date formatter', () => {
    const options = buildSparklineOptions(points, 'line', '#123456', {
      numberFormatConfig: { name: 'Currency', symbol: '$' },
      formatDate: (epochMs) => `date:${epochMs}`,
    });
    const formatter = options.tooltip?.formatter as (
      this: Highcharts.TooltipFormatterContextObject,
    ) => string;
    const result = formatter.call({ x: 1, y: 1500 } as Highcharts.TooltipFormatterContextObject);
    expect(result).toBe('date:1: $1.5K');
  });

  it('formats the tooltip without a date prefix when no date formatter is provided', () => {
    const options = buildSparklineOptions(points, 'line', '#123456');
    const formatter = options.tooltip?.formatter as (
      this: Highcharts.TooltipFormatterContextObject,
    ) => string;
    const result = formatter.call({ x: 1, y: 1500 } as Highcharts.TooltipFormatterContextObject);
    expect(result).toBe('1.5K');
  });

  describe('explicit size', () => {
    it('sets chart.width/height from the measured cell when size is provided', () => {
      const options = buildSparklineOptions(
        points,
        'line',
        '#123456',
        {},
        { width: 274, height: 32 },
      );
      expect(options.chart?.width).toBe(274);
      expect(options.chart?.height).toBe(32);
    });

    it('omits chart.width/height (letting Highcharts auto-detect) when size is not provided', () => {
      const options = buildSparklineOptions(points, 'line', '#123456');
      expect(options.chart?.width).toBeUndefined();
      expect(options.chart?.height).toBeUndefined();
    });
  });
});
