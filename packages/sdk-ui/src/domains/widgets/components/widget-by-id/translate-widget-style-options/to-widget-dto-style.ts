import type {
  AxisLabel,
  DataLimits,
  LegendOptions,
  LineStyleOptions,
  LineWidth,
  Markers,
  Navigator,
  SeriesLabels,
} from '@/types.js';

import type { AxisStyle, CartesianWidgetStyle } from '../types.js';

const DEFAULT_LEGEND = { enabled: true, position: 'bottom' as const };
const DEFAULT_NAVIGATOR = { enabled: false };
const DEFAULT_SERIES_LABELS: CartesianWidgetStyle['seriesLabels'] = {
  enabled: false,
  rotation: 0,
};
const DEFAULT_AXIS_STYLE: AxisStyle = {
  inactive: false,
  enabled: true,
  ticks: true,
  labels: { enabled: true, rotation: 0 },
  gridLines: true,
  isIntervalEnabled: false,
};

/**
 * Maps SDK legend options to Fusion DTO legend style.
 *
 * @internal
 */
export function toLegendStyle(legend?: LegendOptions): CartesianWidgetStyle['legend'] {
  if (!legend) return DEFAULT_LEGEND;
  return {
    enabled: legend.enabled,
    position: (legend.position as string) ?? 'bottom',
  };
}

/**
 * Maps SDK axis label options to Fusion DTO axis style.
 * Fields not stored in SDK (ticks, inactive) use sensible defaults.
 *
 * @internal
 */
export function toAxisStyle(axisLabel?: AxisLabel): AxisStyle {
  if (!axisLabel) return { ...DEFAULT_AXIS_STYLE };
  return {
    inactive: false,
    enabled: axisLabel.enabled ?? true,
    ticks: true,
    labels: {
      enabled: axisLabel.labels?.enabled ?? true,
      rotation: 0,
    },
    title: axisLabel.title,
    gridLines: axisLabel.gridLines ?? true,
    isIntervalEnabled: axisLabel.isIntervalEnabled ?? false,
    logarithmic: axisLabel.logarithmic,
    min: axisLabel.min,
    max: axisLabel.max,
    intervalJumps: axisLabel.intervalJumps,
    x2Title: axisLabel.x2Title,
  };
}

/**
 * Maps SDK series labels to Fusion DTO labels style.
 * For line charts (non-stacked), only enabled and rotation are restored.
 *
 * @internal
 */
export function toSeriesLabelsStyle(
  seriesLabels?: SeriesLabels,
): CartesianWidgetStyle['seriesLabels'] {
  if (!seriesLabels) return DEFAULT_SERIES_LABELS;
  return {
    enabled: seriesLabels.enabled ?? false,
    rotation: seriesLabels.rotation ?? 0,
  };
}

/**
 * Maps SDK navigator options to Fusion DTO navigator style.
 * scrollerLocation is not written back (stored in widget.options).
 *
 * @internal
 */
export function toNavigatorStyle(navigator?: Navigator): CartesianWidgetStyle['navigator'] {
  if (!navigator) return DEFAULT_NAVIGATOR;
  return { enabled: navigator.enabled };
}

/** Allowed line width tokens for CartesianWidgetStyle (thin=1, bold=3, thick=5). */
const LINE_WIDTH_TOKENS = ['thin', 'bold', 'thick'] as const;
export type LineWidthToken = (typeof LINE_WIDTH_TOKENS)[number];

const LINE_WIDTH_TOKEN_SET: Set<string> = new Set(LINE_WIDTH_TOKENS);

function isLineWidthToken(s: string): s is LineWidthToken {
  return LINE_WIDTH_TOKEN_SET.has(s);
}

/**
 * Maps numeric line width to token using thresholds aligned with token semantics
 * (thin=1, bold=3, thick=5).
 *
 * @internal
 */
function numericToLineWidthToken(n: number): LineWidthToken {
  if (n <= 2) return 'thin';
  if (n < 5) return 'bold';
  return 'thick';
}

/**
 * Maps SDK line width options to Fusion DTO line width style.
 * Validates string tokens and maps numeric widths to 'thin' | 'bold' | 'thick'.
 *
 * @internal
 */
export function toLineWidthStyle(
  lineWidth?: LineWidth | { width?: string | number },
): CartesianWidgetStyle['lineWidth'] {
  if (!lineWidth) return undefined;
  const width = lineWidth.width;
  if (width === undefined || width === null) return undefined;
  if (typeof width === 'number') {
    return { width: numericToLineWidthToken(width) };
  }
  if (isLineWidthToken(width)) {
    return { width };
  }
  return undefined;
}

/**
 * Maps SDK markers options to Fusion DTO markers style.
 *
 * @internal
 */
export function toMarkersStyle(markers?: Markers): CartesianWidgetStyle['markers'] {
  if (!markers) return undefined;
  return {
    enabled: markers.enabled,
    size: markers.size ?? 'small',
    fill: markers.fill ?? 'filled',
  };
}

/**
 * Maps SDK data limits to Fusion DTO data limits.
 *
 * @internal
 */
export function toDataLimitsStyle(dataLimits?: DataLimits): CartesianWidgetStyle['dataLimits'] {
  if (!dataLimits) return undefined;
  return {
    seriesCapacity: dataLimits.seriesCapacity,
    categoriesCapacity: dataLimits.categoriesCapacity,
  };
}

/**
 * Maps SDK line chart style options to Fusion CartesianWidgetStyle (DTO).
 * Used when serializing a line chart widget back to WidgetDto.
 *
 * @param styleOptions - Extracted line chart style options from WidgetModel.styleOptions
 * @returns Fusion CartesianWidgetStyle for the widget DTO
 * @internal
 */
export function toLineWidgetStyle(styleOptions: LineStyleOptions): CartesianWidgetStyle {
  const legend = toLegendStyle(styleOptions.legend);
  const navigator = toNavigatorStyle(styleOptions.navigator);
  const seriesLabels = toSeriesLabelsStyle(styleOptions.seriesLabels);
  const xAxis = toAxisStyle(styleOptions.xAxis);
  const yAxis = toAxisStyle(styleOptions.yAxis);
  const y2Axis = styleOptions.y2Axis ? toAxisStyle(styleOptions.y2Axis) : undefined;
  const lineWidth = toLineWidthStyle(styleOptions.lineWidth);
  const markers = toMarkersStyle(styleOptions.markers);
  const dataLimits = toDataLimitsStyle(styleOptions.dataLimits);

  return {
    legend,
    navigator,
    seriesLabels,
    xAxis,
    yAxis,
    ...(y2Axis && { y2Axis }),
    ...(lineWidth && { lineWidth }),
    ...(markers && { markers }),
    ...(dataLimits && { dataLimits }),
  };
}
