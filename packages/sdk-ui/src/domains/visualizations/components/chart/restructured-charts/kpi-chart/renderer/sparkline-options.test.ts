import Highcharts from '@sisense/sisense-charts';

import {
  buildSparklineOptions,
  SparklinePoint,
  withIsolatedPointMarkers,
} from './sparkline-options.js';

// Every point here is connected to at least one neighbor (the interior null only breaks the line
// between two otherwise-connected runs), so none of them qualifies for an isolated-point marker --
// keeping the shared fixture free of the markers asserted on in `withIsolatedPointMarkers` below.
const points: SparklinePoint[] = [
  { x: 1, y: 100 },
  { x: 2, y: 90 },
  { x: 3, y: null },
  { x: 4, y: 80 },
  { x: 5, y: 70 },
];

const seriesDataOf = (options: Highcharts.Options) =>
  (options.series?.[0] as Highcharts.SeriesLineOptions).data;

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
    expect(seriesDataOf(options)).toEqual(points);
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

  describe('tooltip', () => {
    const formatTooltip = (
      options: Highcharts.Options,
      point: Partial<Highcharts.TooltipFormatterContextObject> = { x: 1, y: 1500 },
    ) => {
      const formatter = options.tooltip?.formatter as (
        this: Highcharts.TooltipFormatterContextObject,
      ) => string;
      return formatter.call(point as Highcharts.TooltipFormatterContextObject);
    };

    it('carries the same chrome as every other chart tooltip', () => {
      const options = buildSparklineOptions(points, 'line', '#123456');
      expect(options.tooltip).toMatchObject({
        animation: false,
        backgroundColor: '#FFFFFF',
        borderColor: '#CCCCCC',
        borderRadius: 10,
        borderWidth: 1,
        useHTML: true,
      });
    });

    it('escapes the card box so a small card cannot clip it', () => {
      const options = buildSparklineOptions(points, 'line', '#123456');
      expect(options.tooltip?.outside).toBe(true);
    });

    it('formats the value with the format config and the date with the injected formatter', () => {
      const options = buildSparklineOptions(points, 'line', '#123456', {
        numberFormatConfig: { name: 'Currency', symbol: '$' },
        formatDate: (epochMs) => `date:${epochMs}`,
      });
      const result = formatTooltip(options);

      expect(result).toContain('$1.5K');
      expect(result).toContain('date:1');
    });

    it('leads with the value title and separates the date from the value', () => {
      const options = buildSparklineOptions(points, 'line', '#123456', {
        formatDate: () => 'Jun 2020',
        valueTitle: 'Total Revenue',
      });
      const result = formatTooltip(options);

      // Series label, colored value, separator, category value -- the standard tooltip layout.
      expect(result).toMatch(/Total Revenue[\s\S]*1\.5K[\s\S]*<hr[\s\S]*Jun 2020/);
    });

    it('omits the leading label when the measure has no title', () => {
      const options = buildSparklineOptions(points, 'line', '#123456', {
        formatDate: () => 'Jun 2020',
      });
      const result = formatTooltip(options);

      expect(result).toContain('1.5K');
      expect(result).not.toContain('<br');
    });

    it('omits the date and its separator when no date formatter is provided', () => {
      const options = buildSparklineOptions(points, 'line', '#123456');
      const result = formatTooltip(options);

      expect(result).toContain('1.5K');
      expect(result).not.toContain('<hr');
    });

    it('colors the value with the series color by default', () => {
      const options = buildSparklineOptions(points, 'line', '#123456');
      expect(formatTooltip(options)).toContain('color:#123456');
    });

    it('prefers an explicit value color over the series color', () => {
      // A dark card resolves the sparkline itself to white (see `resolveSparklineColor`), which
      // would be invisible against the tooltip's own white body; the accent is passed instead.
      const options = buildSparklineOptions(points, 'line', '#ffffff', {
        valueColor: '#ffcb05',
      });
      const result = formatTooltip(options);

      expect(result).toContain('color:#ffcb05');
      expect(result).not.toContain('color:#ffffff');
    });

    it('renders no value span at all for a null point', () => {
      const options = buildSparklineOptions(points, 'line', '#123456', {
        formatDate: () => 'Jun 2020',
      });
      const result = formatTooltip(options, { x: 1, y: undefined });

      expect(result).not.toContain('<span');
      expect(result).toContain('Jun 2020');
      // Nothing above the date to divide it from, so the tooltip must not open with a stray rule.
      expect(result).not.toContain('<hr');
    });

    it('keeps the separator above the date when only the title survives a null point', () => {
      const options = buildSparklineOptions(points, 'line', '#123456', {
        formatDate: () => 'Jun 2020',
        valueTitle: 'Total Revenue',
      });
      const result = formatTooltip(options, { x: 1, y: undefined });

      expect(result).toMatch(/Total Revenue[\s\S]*<hr[\s\S]*Jun 2020/);
    });
  });

  describe('single-point series', () => {
    const singlePoint: SparklinePoint[] = [{ x: 1, y: 100 }];

    it.each(['line', 'spline', 'area'] as const)(
      'draws a visible marker for the lone point of a %s series, which would otherwise render nothing',
      (chartType) => {
        const options = buildSparklineOptions(singlePoint, chartType, '#123456');
        const [point] = seriesDataOf(options) as Highcharts.PointOptionsObject[];

        expect(point.marker?.enabled).toBe(true);
        // Must be explicit: a point inheriting the series' `radius: 0` still draws nothing.
        expect(point.marker?.radius).toBeGreaterThan(0);
      },
    );

    it('leaves a column series untouched, since its bar is already visible', () => {
      const options = buildSparklineOptions(singlePoint, 'column', '#123456');
      expect(seriesDataOf(options)).toEqual(singlePoint);
    });

    it('keeps the tooltip enabled, so hovering the now-visible point stays consistent', () => {
      const options = buildSparklineOptions(singlePoint, 'line', '#123456');
      expect(options.tooltip?.enabled).toBe(true);
      expect(options.plotOptions?.series?.enableMouseTracking).toBe(true);
    });
  });

  describe('withIsolatedPointMarkers', () => {
    const markedIndexesOf = (points: SparklinePoint[], chartType: 'line' | 'column' = 'line') =>
      withIsolatedPointMarkers(points, chartType).flatMap((point, index) =>
        point.marker ? [index] : [],
      );

    it('marks the lone point of a single-point series', () => {
      expect(markedIndexesOf([{ x: 1, y: 100 }])).toEqual([0]);
    });

    it('marks a point flanked by nulls on both sides', () => {
      expect(
        markedIndexesOf([
          { x: 1, y: null },
          { x: 2, y: 100 },
          { x: 3, y: null },
        ]),
      ).toEqual([1]);
    });

    it('marks the first and last point when the only interior value is null', () => {
      // The pre-fix rendering of this series: three points, two of them real, and nothing drawn --
      // neither run of values is long enough to stroke a segment.
      expect(
        markedIndexesOf([
          { x: 1, y: 100 },
          { x: 2, y: null },
          { x: 3, y: 90 },
        ]),
      ).toEqual([0, 2]);
    });

    it('leaves points that a line segment reaches unmarked', () => {
      expect(markedIndexesOf(points)).toEqual([]);
    });

    it('never marks a null point itself', () => {
      const marked = withIsolatedPointMarkers(
        [
          { x: 1, y: null },
          { x: 2, y: null },
        ],
        'line',
      );
      expect(marked.every((point) => point.marker === undefined)).toBe(true);
    });

    it('treats y: 0 as a real value rather than a gap', () => {
      expect(markedIndexesOf([{ x: 1, y: 0 }])).toEqual([0]);
      expect(
        markedIndexesOf([
          { x: 1, y: 0 },
          { x: 2, y: 0 },
        ]),
      ).toEqual([]);
    });

    it('returns the original points for a column series', () => {
      expect(markedIndexesOf([{ x: 1, y: 100 }], 'column')).toEqual([]);
    });

    it('does not mutate the input points', () => {
      const input: SparklinePoint[] = [{ x: 1, y: 100 }];
      withIsolatedPointMarkers(input, 'line');
      expect(input).toEqual([{ x: 1, y: 100 }]);
    });

    it('handles an empty series', () => {
      expect(withIsolatedPointMarkers([], 'line')).toEqual([]);
    });
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
