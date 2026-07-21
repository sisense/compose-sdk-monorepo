import Highcharts from '@sisense/sisense-charts';

import {
  applyFormat,
  getCompleteNumberFormatConfig,
} from '@/domains/visualizations/core/chart-options-processor/translations/number-format-config.js';
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
};

const noMarker = {
  enabled: false,
  radius: 0,
  states: { hover: { enabled: false }, select: { enabled: false } },
};

/**
 * Builds the Highcharts options for the KPI card's inline sparkline.
 *
 * `'spline'` is a core Highcharts series type -- it's registered directly inside `highcharts.js`
 * (unlike `heatmap`/`sankey`/`streamgraph`/`series-label`, which are separate modules applied in
 * `highcharts-overrides.ts`) -- so no extra module import is needed to support it here.
 * @param points - Sparkline data; `null` `y` values are preserved as gaps.
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
  const { numberFormatConfig, formatDate } = formatting;
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
      outside: true,
      formatter(this: Highcharts.TooltipFormatterContextObject) {
        const x = typeof this.x === 'number' ? this.x : undefined;
        const dateText = x !== undefined && formatDate ? formatDate(x) : undefined;
        const valueText =
          typeof this.y === 'number' ? applyFormat(completeNumberFormatConfig, this.y) : '';
        return dateText ? `${dateText}: ${valueText}` : valueText;
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
        data: points,
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
