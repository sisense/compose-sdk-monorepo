import Highcharts from '@sisense/sisense-charts';

import {
  colorChineseSilver,
  colorWhite,
} from '@/domains/visualizations/core/chart-data-options/coloring/consts.js';
import {
  applyFormat,
  getCompleteNumberFormatConfig,
} from '@/domains/visualizations/core/chart-options-processor/translations/number-format-config.js';
import {
  spanSegment,
  tooltipSeparator,
  tooltipWrapper,
} from '@/domains/visualizations/core/chart-options-processor/translations/scatter-tooltip.js';
import { applyOpacity } from '@/shared/utils/color/color-interpolation.js';
import type { NumberFormatConfig } from '@/types.js';

/**
 * Opacity of the area gradient's top stop (near-opaque fill) and bottom stop (fully transparent,
 * fading into the card background). Resolved through {@link applyOpacity} (rather than
 * string-concatenating a hex alpha suffix) since `color` isn't guaranteed to be 6-digit hex --
 * it can be a named color, `rgb()`/`hsl()`, or a shorter/8-digit hex, none of which a bare
 * `${color}55`-style suffix would produce a valid color for.
 * @internal
 */
const AREA_GRADIENT_TOP_OPACITY = 0x55 / 0xff;
/** @internal */
const AREA_GRADIENT_BOTTOM_OPACITY = 0;

/**
 * A sparkline data point; a `null` `y` is a gap in the line/area, never rendered as zero.
 *
 * @internal
 */
export type SparklinePoint = { x: number; y: number | null };

/**
 * A sparkline point as handed to Highcharts: a {@link SparklinePoint} optionally carrying its own
 * marker override (see {@link withIsolatedPointMarkers}).
 *
 * @internal
 */
export type SparklineSeriesPoint = SparklinePoint & {
  marker?: Highcharts.PointMarkerOptionsObject;
};

/**
 * Chart type the sparkline is drawn as.
 *
 * @internal
 */
export type SparklineChartType = 'line' | 'spline' | 'area' | 'column';

/**
 * Formatting inputs for the sparkline's tooltip.
 *
 * @internal
 */
export type SparklineFormatting = {
  /** Format config for the `y` value, matching the headline measure's own format. */
  numberFormatConfig?: NumberFormatConfig;
  /** Formats the point's `x` (an epoch-ms date) for the tooltip; omitted when there's no date axis. */
  formatDate?: (epochMs: number) => string;
  /**
   * Label above the value, the KPI card's counterpart of the series name every other chart's
   * tooltip leads with: the headline measure's title. Omitted when the measure has no title.
   */
  valueTitle?: string;
  /**
   * Color of the tooltip's value, defaulting to the series color.
   *
   * Worth passing explicitly whenever the series color was adjusted for the surface it's drawn on:
   * the KPI sparkline's color is resolved for contrast against the *card* background, so on a dark
   * card it becomes white -- invisible inside a tooltip, whose body is the same opaque white every
   * chart's tooltip uses. Passing the unadjusted theme accent keeps the value both visible and
   * consistent with the series color other charts put in their tooltips.
   */
  valueColor?: string;
};

const noMarker = {
  enabled: false,
  radius: 0,
  states: { hover: { enabled: false }, select: { enabled: false } },
};

/**
 * Radius, in px, of an isolated point's marker (see {@link withIsolatedPointMarkers}). Sized
 * against the 1.5px line width: the resulting 5px dot reads as a data point at the sparkline row's
 * height without dominating the card.
 * @internal
 */
const ISOLATED_POINT_MARKER_RADIUS = 2.5;

/**
 * Builds the marker that makes an isolated point visible, overriding the series-level
 * {@link noMarker}. `radius` must be set explicitly -- Highcharts resolves a point's radius as
 * `pick(pointMarker.radius, seriesMarker.radius)`, so without it the point would inherit
 * `noMarker`'s `radius: 0` and still draw nothing. `symbol` is pinned rather than left to the
 * series' index-derived default so the dot is a circle regardless of series index.
 *
 * A factory rather than a shared constant: Highcharts adopts each data object as the point's own
 * `options`, so no two points (or chart instances) should alias one marker object.
 * @internal
 */
const isolatedPointMarker = (): Highcharts.PointMarkerOptionsObject => ({
  enabled: true,
  radius: ISOLATED_POINT_MARKER_RADIUS,
  symbol: 'circle',
});

/** Whether a point exists and holds a real value, i.e. can anchor a line segment. */
function isDrawable(point: SparklinePoint | undefined): boolean {
  return typeof point?.y === 'number';
}

/**
 * Attaches a visible marker to every point that no line segment can reach -- one whose immediate
 * neighbors are both absent or `null`.
 *
 * `'line'`/`'spline'`/`'area'` series draw only the segments *between* consecutive non-null points,
 * so an isolated point contributes a lone `moveTo` (an area's fill path likewise collapses to zero
 * width) and renders nothing. A single-point series -- e.g. a filter narrowing the category down to
 * one bucket -- therefore drew a completely blank sparkline that nonetheless answered hover with a
 * tooltip. A per-point marker is the narrowest fix: Highcharts honors a point's own `marker` even
 * when the series disables markers (`drawPoints` falls back to its `_hasPointMarkers` path), so
 * every normal, connected sparkline renders exactly as before. Tooltips stay enabled throughout --
 * with the isolated point now drawn, hovering it is consistent with what the card shows.
 *
 * Assumes `connectNulls` stays off (the Highcharts default, never overridden here); with it on, a
 * point flanked by nulls would be connected and would need no marker.
 *
 * `'column'` is left untouched: a column series draws its own bar for a lone point, so it is
 * already visible and markers don't apply to it.
 * @internal
 */
export function withIsolatedPointMarkers(
  points: SparklinePoint[],
  chartType: SparklineChartType,
): SparklineSeriesPoint[] {
  if (chartType === 'column') return points;

  return points.map((point, index) =>
    isDrawable(point) && !isDrawable(points[index - 1]) && !isDrawable(points[index + 1])
      ? { ...point, marker: isolatedPointMarker() }
      : point,
  );
}

/**
 * Builds the Highcharts options for the KPI card's inline sparkline.
 *
 * `'spline'` is a core Highcharts series type -- it's registered directly inside `highcharts.js`
 * (unlike `heatmap`/`sankey`/`streamgraph`/`series-label`, which are separate modules applied in
 * `highcharts-overrides.ts`) -- so no extra module import is needed to support it here.
 * @param points - Sparkline data; `null` `y` values are preserved as gaps, and points no line
 * segment can reach are given their own marker so they stay visible -- see
 * {@link withIsolatedPointMarkers}.
 * @param chartType - Series type to render.
 * @param color - Series (and, for `'area'`, gradient fill) color.
 * @param formatting - Tooltip formatting inputs.
 * @param size - Explicit pixel size for the chart, measured from its cell. `HighchartsReact`'s
 * container div never triggers a Highcharts reflow on its own resize (only on a window resize),
 * so without an explicit `chart.width`/`chart.height` the chart can settle at Highcharts'
 * hardcoded 600x400 default instead of the cell's actual (often much smaller) size. Omitted
 * before the cell has been measured, letting Highcharts fall back to its own auto-detection for
 * the very first paint.
 * @returns Highcharts options for the sparkline, with mouse tracking and a tooltip enabled.
 * @internal
 */
export function buildSparklineOptions(
  points: SparklinePoint[],
  chartType: SparklineChartType,
  color: string,
  formatting: SparklineFormatting = {},
  size?: { width: number; height: number },
): Highcharts.Options {
  const { numberFormatConfig, formatDate, valueTitle, valueColor = color } = formatting;
  const completeNumberFormatConfig = getCompleteNumberFormatConfig(numberFormatConfig);

  return {
    chart: {
      type: chartType,
      margin: [4, 0, 4, 0],
      spacing: [0, 0, 0, 0],
      backgroundColor: 'transparent',
      animation: false,
      ...(size && { width: size.width, height: size.height }),
    },
    title: { text: undefined },
    subtitle: { text: undefined },
    credits: { enabled: false },
    exporting: { enabled: false },
    xAxis: { visible: false, labels: { enabled: false } },
    yAxis: { visible: false, labels: { enabled: false } },
    legend: { enabled: false },
    tooltip: {
      enabled: true,
      // `outside` keeps the tooltip from being clipped by the card's own box; the rest is the
      // chrome every other chart's tooltip is built from (opaque white body, 1px silver border,
      // 10px radius, HTML content), so a KPI card's hover readout matches its dashboard neighbors
      // instead of showing Highcharts' own default styling.
      outside: true,
      animation: false,
      backgroundColor: colorWhite,
      borderColor: colorChineseSilver,
      borderRadius: 10,
      borderWidth: 1,
      useHTML: true,
      formatter(this: Highcharts.TooltipFormatterContextObject) {
        const x = typeof this.x === 'number' ? this.x : undefined;
        const dateText = x !== undefined && formatDate ? formatDate(x) : undefined;
        const valueText =
          typeof this.y === 'number' ? applyFormat(completeNumberFormatConfig, this.y) : '';
        // Same three-part layout the other charts use: series label, colored value, then the
        // category value below a separator. Concatenated rather than interpolated into one template
        // so a missing title or date leaves behind no stray `<br />` or whitespace node -- and no
        // `<br />` ahead of the separator, which already breaks the line itself.
        // `tooltipWrapper` sanitizes the result.
        const heading = [valueTitle, spanSegment(valueText, valueColor)]
          .filter(Boolean)
          .join('<br />');
        // The separator divides the heading from the category value, so it only earns its place
        // when there is a heading: a titleless measure at a null point leaves nothing above it, and
        // the tooltip would otherwise open with a stray rule.
        const separator = heading ? tooltipSeparator() : '';
        const footer = dateText ? separator + dateText : '';

        return tooltipWrapper(heading + footer);
      },
    },
    plotOptions: {
      series: {
        animation: false,
        dataLabels: { enabled: false },
        enableMouseTracking: true,
        states: { hover: { enabled: true } },
        marker: noMarker,
      },
      area: { fillOpacity: 0.25, lineWidth: 1.5, marker: noMarker },
      line: { lineWidth: 1.5, marker: noMarker },
      spline: { lineWidth: 1.5, marker: noMarker },
      column: { borderWidth: 0, pointPadding: 0.05, groupPadding: 0.05 },
    },
    series: [
      {
        type: chartType,
        name: '',
        showInLegend: false,
        data: withIsolatedPointMarkers(points, chartType),
        color,
        marker: noMarker,
        ...(chartType === 'area'
          ? {
              fillColor: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                stops: [
                  [0, applyOpacity(color, AREA_GRADIENT_TOP_OPACITY)],
                  [1, applyOpacity(color, AREA_GRADIENT_BOTTOM_OPACITY)],
                ],
              },
            }
          : {}),
      },
    ],
  };
}
