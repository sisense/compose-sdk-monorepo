import type { PivotGrandTotals } from '@sisense/sdk-data';

import { CALENDAR_HEATMAP_DEFAULTS } from '@/domains/visualizations/components/chart/restructured-charts/highchart-based-charts/calendar-heatmap-chart/constants.js';
import type { BoxWhiskerType } from '@/domains/visualizations/core/chart-data-options/types.js';
import { isWidgetDesignEnabled } from '@/domains/widgets/widget-model/widget-model-translator/utils.js';
import { AppSettings } from '@/infra/app/settings/settings.js';
import { LEGACY_DESIGN_TYPES } from '@/infra/themes/legacy-design-settings';
import type {
  AlignmentTypes,
  AreamapType,
  AreaStyleOptions,
  AxisLabel,
  BoxplotStyleOptions,
  CalendarHeatmapStyleOptions,
  CartesianStyleOptions,
  CompleteThemeSettingsInternal,
  DataLimits,
  FunnelStyleOptions,
  GaugeIndicatorStyleOptions,
  IndicatorStyleOptions,
  KpiStyleOptions,
  KpiValueMode,
  LegendOptions,
  LineOptions,
  LineStyleOptions,
  LineWidth,
  Markers,
  Navigator,
  NumericBarIndicatorStyleOptions,
  NumericSimpleIndicatorStyleOptions,
  PieStyleOptions,
  PivotTableWidgetStyleOptions,
  PolarStyleOptions,
  RadiusSizes,
  SankeyStyleOptions,
  ScattermapStyleOptions,
  ScatterStyleOptions,
  SeriesLabels,
  ShadowsTypes,
  SpaceSizes,
  StackableStyleOptions,
  SunburstStyleOptions,
  TableStyleOptions,
  TotalLabels,
  TreemapStyleOptions,
  WidgetStyleOptions,
} from '@/types.js';

import type {
  AxisStyle,
  BoxplotWidgetStyle,
  CalendarHeatmapWidgetStyle,
  CartesianWidgetStyle,
  FunnelWidgetStyle,
  KpiWidgetStyle,
  PivotWidgetStyle,
  PolarWidgetStyle,
  SankeyWidgetStyle,
  ScattermapWidgetStyle,
  ScatterWidgetStyle,
  SunburstWidgetStyle,
  TableWidgetStyle,
  TreemapWidgetStyle,
  WidgetDesign,
  WidgetStyle,
  WidgetSubtype,
} from '../types.js';
import { toFusionCategoricalLabelsFromSeriesLabels } from './categorical-labels-style.js';
import {
  toFusionSeriesLabelAffixFromSdk,
  toFusionSeriesLabelTextStyleFromSdk,
} from './series-label-affix-style.js';

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
    ...toFusionSeriesLabelTextStyleFromSdk({
      textStyle: legend.items?.textStyle,
    }),
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
    ...toFusionSeriesLabelAffixFromSdk(seriesLabels),
    ...toFusionSeriesLabelTextStyleFromSdk(seriesLabels),
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
 * Maps CSDK line.width (px) to Fusion lineWidth.customWidth on DTO.
 *
 * @internal
 */
export function toLineCustomWidthStyle(line?: LineOptions): number | undefined {
  const width = line?.width;
  if (width != null && width > 0) {
    return width;
  }
  return undefined;
}

/**
 * Maps SDK line dash options to Fusion DTO line style.
 *
 * @internal
 */
export function toLineDashStyle(line?: LineOptions): CartesianWidgetStyle['line'] {
  if (!line?.dashStyle) return undefined;
  return { dashStyle: line.dashStyle };
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

function buildCommonCartesianWidgetStyle(
  styleOptions: CartesianStyleOptions,
): Omit<CartesianWidgetStyle, 'seriesLabels'> {
  const legend = toLegendStyle(styleOptions.legend);
  const navigator = toNavigatorStyle(styleOptions.navigator);
  const xAxis = toAxisStyle(styleOptions.xAxis);
  const yAxis = toAxisStyle(styleOptions.yAxis);
  const y2Axis = styleOptions.y2Axis ? toAxisStyle(styleOptions.y2Axis) : undefined;
  const lineWidthToken =
    'lineWidth' in styleOptions ? toLineWidthStyle(styleOptions.lineWidth) : undefined;
  const customWidth =
    'line' in styleOptions ? toLineCustomWidthStyle(styleOptions.line) : undefined;
  const lineWidth =
    lineWidthToken != null
      ? customWidth != null
        ? { ...lineWidthToken, customWidth }
        : lineWidthToken
      : customWidth != null
      ? { width: 'bold', customWidth }
      : undefined;
  const markers = toMarkersStyle(styleOptions.markers);
  const dataLimits = toDataLimitsStyle(styleOptions.dataLimits);

  return {
    legend,
    navigator,
    xAxis,
    yAxis,
    ...(y2Axis && { y2Axis }),
    ...(lineWidth && { lineWidth }),
    ...(markers && { markers }),
    ...(dataLimits && { dataLimits }),
  };
}

const STACKED_SUBTYPES: ReadonlySet<WidgetSubtype> = new Set([
  'area/stacked',
  'area/stackedspline',
  'column/stackedcolumn',
  'bar/stacked',
]);
const STACKED100_SUBTYPES: ReadonlySet<WidgetSubtype> = new Set([
  'area/stacked100',
  'area/stackedspline100',
  'column/stackedcolumn100',
  'bar/stacked100',
]);

/**
 * Inverse of {@link extractValueLabelsOptions} for stacked chart subtypes (area, bar, column):
 * restores Fusion `seriesLabels.labels` (stacked / stackedPercentage / types) from SDK model fields.
 */
function toStackedSeriesLabelsStyle(
  widgetSubtype: WidgetSubtype,
  seriesLabels?: SeriesLabels,
  totalLabels?: TotalLabels,
): CartesianWidgetStyle['seriesLabels'] {
  const enabled = seriesLabels?.enabled ?? false;
  const rotation = seriesLabels?.rotation ?? 0;
  const showValue = seriesLabels?.showValue ?? false;
  const showTotals = !!(totalLabels?.enabled && enabled);
  const affix = toFusionSeriesLabelAffixFromSdk(seriesLabels);
  const textStyle = toFusionSeriesLabelTextStyleFromSdk(seriesLabels);

  if (STACKED_SUBTYPES.has(widgetSubtype)) {
    return {
      enabled,
      rotation,
      ...affix,
      ...textStyle,
      labels: {
        enabled: true,
        stacked: true,
        stackedPercentage: false,
        types: {
          count: false,
          percentage: false,
          relative: showValue,
          totals: showTotals,
        },
      },
    };
  }

  if (STACKED100_SUBTYPES.has(widgetSubtype)) {
    const showPercentage = seriesLabels?.showPercentage ?? false;
    return {
      enabled,
      rotation,
      ...affix,
      ...textStyle,
      labels: {
        enabled: true,
        stacked: false,
        stackedPercentage: true,
        types: {
          count: showValue,
          percentage: showPercentage,
          relative: false,
          totals: showTotals,
        },
      },
    };
  }

  return toSeriesLabelsStyle(seriesLabels);
}

type LegacyDesignKey = keyof typeof LEGACY_DESIGN_TYPES;

const SPACE_AROUND_TO_DTO: Record<SpaceSizes, LegacyDesignKey> = {
  None: 'none',
  Small: 'small',
  Medium: 'medium',
  Large: 'large',
};

const CORNER_RADIUS_TO_DTO: Record<RadiusSizes, LegacyDesignKey> = {
  None: 'none',
  Small: 'small',
  Medium: 'medium',
  Large: 'large',
};

const SHADOW_TO_DTO: Record<ShadowsTypes, LegacyDesignKey> = {
  None: 'none',
  Light: 'light',
  Medium: 'medium',
  Dark: 'dark',
};

const ALIGNMENT_TO_DTO: Record<AlignmentTypes, LegacyDesignKey> = {
  Left: 'left',
  Center: 'center',
  Right: 'right',
};

/**
 * Returns true when {@link WidgetModel.styleOptions} carries any widget container / design
 * field that was produced by {@link getFlattenWidgetDesign} (and should be written back).
 *
 * @internal
 */
export function hasWidgetContainerStyleFields(styleOptions: WidgetStyleOptions): boolean {
  if (
    styleOptions.backgroundColor !== undefined ||
    styleOptions.spaceAround !== undefined ||
    styleOptions.cornerRadius !== undefined ||
    styleOptions.shadow !== undefined ||
    styleOptions.border !== undefined ||
    styleOptions.borderColor !== undefined
  ) {
    return true;
  }
  const header = styleOptions.header;
  return (
    header !== undefined &&
    (header.titleTextColor !== undefined ||
      header.titleAlignment !== undefined ||
      header.dividerLine !== undefined ||
      header.dividerLineColor !== undefined ||
      header.backgroundColor !== undefined)
  );
}

/**
 * Rebuilds Fusion `style.widgetDesign` from flattened container options (inverse of
 * {@link getFlattenWidgetDesign}).
 *
 * Missing fields default to the corresponding values from `themeSettings.widget` so that
 * the resulting {@link WidgetDesign} is always fully populated which is critical for the widget design feature in Fusion.
 *
 * @internal
 */
export function toWidgetDesign(
  styleOptions: WidgetStyleOptions,
  widgetTheme: CompleteThemeSettingsInternal['widget'],
): WidgetDesign | undefined {
  if (!hasWidgetContainerStyleFields(styleOptions)) {
    return undefined;
  }
  const header = styleOptions.header;
  return {
    widgetBackgroundColor: styleOptions.backgroundColor ?? '',
    widgetSpacing: SPACE_AROUND_TO_DTO[styleOptions.spaceAround ?? widgetTheme.spaceAround],
    widgetCornerRadius: CORNER_RADIUS_TO_DTO[styleOptions.cornerRadius ?? widgetTheme.cornerRadius],
    widgetShadow: SHADOW_TO_DTO[styleOptions.shadow ?? widgetTheme.shadow],
    widgetBorderEnabled: styleOptions.border ?? widgetTheme.border,
    widgetBorderColor: styleOptions.borderColor ?? widgetTheme.borderColor,
    widgetTitleColor: header?.titleTextColor ?? widgetTheme.header.titleTextColor,
    widgetTitleAlignment:
      ALIGNMENT_TO_DTO[header?.titleAlignment ?? widgetTheme.header.titleAlignment],
    widgetTitleDividerEnabled: header?.dividerLine ?? widgetTheme.header.dividerLine,
    widgetTitleDividerColor: header?.dividerLineColor ?? widgetTheme.header.dividerLineColor,
    widgetTitleBackgroundColor: header?.backgroundColor ?? widgetTheme.header.backgroundColor,
  } as WidgetDesign;
}

/**
 * Attaches `style.widgetDesign` built from widget container fields in `styleOptions`.
 * When the feature flag is off, or when `styleOptions` carries no container fields, the
 * base style is returned unchanged.
 *
 * @param baseStyle - The base style to be attached with the widget design
 * @param styleOptions - The style options to be used for the widget design
 * @param themeSettings - The theme settings to be used for the widget design
 * @param appSettings - The application settings to be used for the widget design
 * @returns The widget style with the widget design
 */
export function withWidgetDesign(
  baseStyle: WidgetStyle,
  styleOptions: WidgetStyleOptions,
  themeSettings: CompleteThemeSettingsInternal,
  appSettings?: AppSettings,
): WidgetStyle {
  if (!appSettings || !isWidgetDesignEnabled(appSettings)) {
    return baseStyle;
  }
  const widgetDesign = toWidgetDesign(styleOptions, themeSettings.widget);
  if (!widgetDesign) {
    return baseStyle;
  }
  return { ...baseStyle, widgetDesign };
}

/**
 * Maps SDK pie chart style options to Fusion PieWidgetStyle (DTO).
 * Inverse of {@link extractPieChartStyleOptions}.
 *
 * @param styleOptions - Pie style options from WidgetModel.styleOptions
 * @returns Fusion PieWidgetStyle for the widget DTO
 * @internal
 */
export function toPieWidgetStyle(styleOptions: PieStyleOptions): WidgetStyle {
  const legend = toLegendStyle(styleOptions.legend);
  const dataLimits = toDataLimitsStyle(styleOptions.dataLimits);

  return {
    legend,
    navigator: toNavigatorStyle(undefined),
    labels: toFusionCategoricalLabelsFromSeriesLabels(
      styleOptions.labels,
      styleOptions.seriesLabels,
    ),
    ...(dataLimits && { dataLimits }),
    ...(styleOptions.convolution && { convolution: styleOptions.convolution }),
  };
}

/**
 * Maps SDK indicator style options to Fusion IndicatorWidgetStyle (DTO).
 * Inverse of {@link extractIndicatorChartStyleOptions}.
 *
 * @param styleOptions - Indicator style options from WidgetModel.styleOptions
 * @returns Fusion IndicatorWidgetStyle for the widget DTO
 * @internal
 */
export function toIndicatorWidgetStyle(styleOptions: IndicatorStyleOptions): WidgetStyle {
  let dtoSubtype: 'simple' | 'bar' | 'round';
  let skin: string | undefined;

  if (styleOptions.subtype === 'indicator/gauge') {
    dtoSubtype = 'round';
    skin = String((styleOptions as GaugeIndicatorStyleOptions).skin ?? 1);
  } else if ((styleOptions as NumericBarIndicatorStyleOptions).numericSubtype === 'numericBar') {
    dtoSubtype = 'bar';
  } else {
    dtoSubtype = 'simple';
    skin = (styleOptions as NumericSimpleIndicatorStyleOptions).skin ?? 'vertical';
  }

  const components = styleOptions.indicatorComponents;

  return {
    subtype: dtoSubtype,
    ...(skin !== undefined && { skin }),
    components: {
      ticks: {
        inactive: false,
        enabled: components?.ticks?.shouldBeShown ?? true,
      },
      labels: {
        inactive: false,
        enabled: components?.labels?.shouldBeShown ?? true,
      },
      title: {
        inactive: false,
        enabled: components?.title?.shouldBeShown ?? true,
      },
      secondaryTitle: {
        inactive: true,
        enabled: true,
      },
    },
  } as WidgetStyle;
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
  const line = toLineDashStyle(styleOptions.line);
  return {
    ...buildCommonCartesianWidgetStyle(styleOptions),
    seriesLabels: toSeriesLabelsStyle(styleOptions.seriesLabels),
    ...(line && { line }),
  };
}

/**
 * Converts area chart style options to Fusion CartesianWidgetStyle DTO.
 * Used when serializing an area chart widget back to WidgetDto.
 *
 * @param styleOptions - Area style options from WidgetModel.styleOptions
 * @param widgetSubtype - Resolved Fusion widget subtype (e.g. after `area/basic` default)
 * @returns Fusion CartesianWidgetStyle for the widget DTO
 */
export function toAreaWidgetStyle(
  styleOptions: AreaStyleOptions,
  widgetSubtype: WidgetSubtype,
): CartesianWidgetStyle {
  const line = toLineDashStyle(styleOptions.line);
  return {
    ...toStackedCartesianWidgetStyle(styleOptions, widgetSubtype),
    ...(line && { line }),
  };
}

function toStackedCartesianWidgetStyle(
  styleOptions: AreaStyleOptions | StackableStyleOptions,
  widgetSubtype: WidgetSubtype,
): CartesianWidgetStyle {
  return {
    ...buildCommonCartesianWidgetStyle(styleOptions),
    seriesLabels: toStackedSeriesLabelsStyle(
      widgetSubtype,
      styleOptions.seriesLabels,
      styleOptions.totalLabels,
    ),
  };
}

/**
 * Converts funnel chart style options to Fusion FunnelWidgetStyle DTO.
 * Inverse of {@link extractFunnelChartStyleOptions}.
 *
 * @param styleOptions - Funnel style options from WidgetModel.styleOptions
 * @returns Fusion FunnelWidgetStyle for the widget DTO
 * @internal
 */
export function toFunnelWidgetStyle(styleOptions: FunnelStyleOptions): FunnelWidgetStyle {
  return {
    legend: toLegendStyle(styleOptions.legend),
    navigator: toNavigatorStyle(undefined),
    size: styleOptions.funnelSize ?? 'regular',
    type: styleOptions.funnelType ?? 'regular',
    direction: styleOptions.funnelDirection ?? 'regular',
    labels: toFusionCategoricalLabelsFromSeriesLabels(
      styleOptions.labels,
      styleOptions.seriesLabels,
    ),
  } as FunnelWidgetStyle;
}

/**
 * Converts sankey chart style options to Fusion SankeyWidgetStyle DTO.
 * Inverse of {@link extractSankeyChartStyleOptions}.
 *
 * @param styleOptions - Sankey style options from WidgetModel.styleOptions
 * @returns Fusion SankeyWidgetStyle for the widget DTO
 * @internal
 */
export function toSankeyWidgetStyle(styleOptions: SankeyStyleOptions): SankeyWidgetStyle {
  return {
    orientation: styleOptions.orientation,
    nodeAlignment: styleOptions.nodeAlignment,
    curveFactor: styleOptions.curveFactor,
    linkOpacity: styleOptions.linkOpacity,
    nodeWidth: styleOptions.nodeWidth,
    nodePadding: styleOptions.nodePadding,
    minLinkWidth: styleOptions.minLinkWidth,
  };
}

/**
 * Converts kpi chart style options to Fusion KpiWidgetStyle DTO.
 * Inverse of {@link extractKpiChartStyleOptions}. Carries every style group whole, including
 * fields with no Design control — see {@link KpiWidgetStyle}.
 *
 * `valueMode` lives on {@link KpiChartDataOptions} in the WidgetModel rather than on
 * `styleOptions`, so it is passed in separately and written into the DTO style — the same
 * treatment `boxType` / `outliersEnabled` get in {@link toBoxplotWidgetStyle}. It is omitted
 * when unset, leaving the chart's own `'last'` default to apply on the way back in.
 *
 * @param styleOptions - Kpi style options from WidgetModel.styleOptions
 * @param valueMode - Headline value mode from WidgetModel.dataOptions.valueMode
 * @returns Fusion KpiWidgetStyle for the widget DTO
 * @internal
 */
export function toKpiWidgetStyle(
  styleOptions: KpiStyleOptions,
  valueMode?: KpiValueMode,
): KpiWidgetStyle {
  // Every group is carried whole. Fields with no Design control (`comparison.color`,
  // a `'spline'` sparkline, `card.backgroundColor`, …) are still round-tripped rather than
  // dropped — see {@link KpiWidgetStyle} for why erasing them would be the worse default.
  return {
    ...(styleOptions.layout && { layout: styleOptions.layout }),
    ...(valueMode && { valueMode }),
    ...(styleOptions.value && { value: styleOptions.value }),
    ...(styleOptions.title && { title: styleOptions.title }),
    ...(styleOptions.sparkline && { sparkline: styleOptions.sparkline }),
    ...(styleOptions.comparison && { comparison: styleOptions.comparison }),
    ...(styleOptions.card && { card: styleOptions.card }),
  };
}

/**
 * Converts treemap chart style options to Fusion TreemapWidgetStyle DTO.
 * Inverse of {@link extractTreemapChartStyleOptions}.
 *
 * @param styleOptions - Treemap style options from WidgetModel.styleOptions
 * @returns Fusion TreemapWidgetStyle for the widget DTO
 * @internal
 */
export function toTreemapWidgetStyle(styleOptions: TreemapStyleOptions): TreemapWidgetStyle {
  const isValueMode = styleOptions.tooltip?.mode !== 'contribution';
  return {
    'title/1': styleOptions.labels?.category?.[0]?.enabled ?? true,
    'title/2': styleOptions.labels?.category?.[1]?.enabled ?? true,
    'title/3': styleOptions.labels?.category?.[2]?.enabled ?? true,
    'tooltip/value': isValueMode,
    'tooltip/contribution': !isValueMode,
  };
}

/**
 * Converts sunburst chart style options to Fusion SunburstWidgetStyle DTO.
 * Inverse of {@link extractSunburstChartStyleOptions}.
 *
 * @param styleOptions - Sunburst style options from WidgetModel.styleOptions
 * @returns Fusion SunburstWidgetStyle for the widget DTO
 * @internal
 */
export function toSunburstWidgetStyle(styleOptions: SunburstStyleOptions): SunburstWidgetStyle {
  const isValueMode = styleOptions.tooltip?.mode !== 'contribution';
  return {
    'legend/enabled': styleOptions.legend?.enabled ?? true,
    'legend/position': styleOptions.legend?.position ?? 'bottom',
    'tooltip/value': isValueMode,
    'tooltip/contribution': !isValueMode,
  };
}

/**
 * Converts bar chart style options to Fusion CartesianWidgetStyle DTO.
 * Used when serializing a bar chart widget back to WidgetDto.
 *
 * @param styleOptions - Bar/stackable style options from WidgetModel.styleOptions
 * @param widgetSubtype - Resolved Fusion widget subtype (e.g. 'bar/classic', 'bar/stacked', 'bar/stacked100')
 * @returns Fusion CartesianWidgetStyle for the widget DTO
 * @internal
 */
export function toBarWidgetStyle(
  styleOptions: StackableStyleOptions,
  widgetSubtype: WidgetSubtype,
): CartesianWidgetStyle {
  return toStackedCartesianWidgetStyle(styleOptions, widgetSubtype);
}

/**
 * Converts column chart style options to Fusion CartesianWidgetStyle DTO.
 * Used when serializing a column chart widget back to WidgetDto.
 *
 * @param styleOptions - Column/stackable style options from WidgetModel.styleOptions
 * @param widgetSubtype - Resolved Fusion widget subtype (e.g. 'column/classic', 'column/stackedcolumn', 'column/stackedcolumn100')
 * @returns Fusion CartesianWidgetStyle for the widget DTO
 * @internal
 */
export const toColumnWidgetStyle = toBarWidgetStyle;

/**
 * Converts polar chart style options to Fusion PolarWidgetStyle DTO.
 * Uses `categories` / `axis` field names (instead of `xAxis` / `yAxis` used by Cartesian charts).
 * Used when serializing a polar chart widget back to WidgetDto.
 *
 * @param styleOptions - Polar style options from WidgetModel.styleOptions
 * @returns Fusion PolarWidgetStyle for the widget DTO
 * @internal
 */
export function toPolarWidgetStyle(styleOptions: PolarStyleOptions): PolarWidgetStyle {
  const dataLimits = toDataLimitsStyle(styleOptions.dataLimits);
  return {
    legend: toLegendStyle(styleOptions.legend),
    navigator: toNavigatorStyle(styleOptions.navigator),
    categories: toAxisStyle(styleOptions.xAxis),
    axis: toAxisStyle(styleOptions.yAxis),
    seriesLabels: toSeriesLabelsStyle(styleOptions.seriesLabels),
    ...(dataLimits && { dataLimits }),
  };
}

/**
 * Maps SDK scatter marker size to Fusion DTO marker size style.
 * Inverse of the extraction performed by `extractScatterChartStyleOptions`.
 *
 * @internal
 */
export function toScatterMarkerSizeStyle(
  markerSize?: ScatterStyleOptions['markerSize'],
): ScatterWidgetStyle['markerSize'] {
  if (!markerSize) return undefined;
  return {
    defaultSize: markerSize.scatterDefaultSize,
    min: markerSize.scatterBubbleMinSize,
    max: markerSize.scatterBubbleMaxSize,
  };
}

/**
 * Converts scatter chart style options to Fusion ScatterWidgetStyle DTO.
 * Inverse of `extractScatterChartStyleOptions`.
 *
 * @param styleOptions - Scatter style options from WidgetModel.styleOptions
 * @returns Fusion ScatterWidgetStyle for the widget DTO
 * @internal
 */
export function toScatterWidgetStyle(styleOptions: ScatterStyleOptions): ScatterWidgetStyle {
  const dataLimits = toDataLimitsStyle(styleOptions.dataLimits);
  const markerSize = toScatterMarkerSizeStyle(styleOptions.markerSize);
  return {
    legend: toLegendStyle(styleOptions.legend),
    navigator: toNavigatorStyle(styleOptions.navigator),
    xAxis: toAxisStyle(styleOptions.xAxis),
    yAxis: toAxisStyle(styleOptions.yAxis),
    seriesLabels: toSeriesLabelsStyle(styleOptions.seriesLabels),
    ...(dataLimits && { dataLimits }),
    ...(markerSize && { markerSize }),
  };
}

/** Fusion's baked-in defaults for `style.markers` on a scattermap widget */
const DEFAULT_SCATTERMAP_MARKERS: ScattermapWidgetStyle['markers'] = {
  fill: 'filled',
  size: { defaultSize: 4, min: 4, max: 24 },
};

/**
 * Converts scattermap style options to Fusion ScattermapWidgetStyle DTO.
 * Inverse of `extractScattermapChartStyleOptions`. Missing SDK fields fall back
 * to Fusion's scattermap defaults so the emitted DTO always carries a fully
 * populated `markers` object (Fusion assumes it is always set).
 *
 * @param styleOptions - Scattermap style options from WidgetModel.styleOptions
 * @returns Fusion ScattermapWidgetStyle for the widget DTO
 * @internal
 */
export function toScattermapWidgetStyle(
  styleOptions: ScattermapStyleOptions,
): ScattermapWidgetStyle {
  const { fill, size } = styleOptions.markers ?? {};
  return {
    markers: {
      fill: fill ?? DEFAULT_SCATTERMAP_MARKERS.fill,
      size: {
        defaultSize: size?.defaultSize ?? DEFAULT_SCATTERMAP_MARKERS.size.defaultSize,
        min: size?.minSize ?? DEFAULT_SCATTERMAP_MARKERS.size.min,
        max: size?.maxSize ?? DEFAULT_SCATTERMAP_MARKERS.size.max,

        // Defaults from Fusion
        inactive: false,
        lowest: 1,
        highest: 42,
        step: 1,
      },
    },
  };
}

/**
 * Maps an SDK areamap `mapType` to the Fusion widget subtype used as the DTO
 * `subtype` field. Inverse of the `subtype → mapType` mapping performed by
 * {@link extractAreamapChartStyleOptions}. Defaults to `areamap/world` when
 * `mapType` is unset or unrecognized — matching Fusion default.
 *
 * @internal
 */
export function toAreamapSubtype(mapType?: AreamapType): 'areamap/world' | 'areamap/usa' {
  return mapType === 'usa' ? 'areamap/usa' : 'areamap/world';
}

/**
 * Maps an SDK {@link BoxWhiskerType} to the Fusion `style.whisker` flag object —
 * exactly one of `'whisker/iqr' | 'whisker/extremums' | 'whisker/deviation'` is
 * true. Inverse of `extractBoxplotBoxType`.
 */
function toBoxplotWhiskerStyle(boxType: BoxWhiskerType): BoxplotWidgetStyle['whisker'] {
  return {
    'whisker/iqr': boxType === 'iqr',
    'whisker/extremums': boxType === 'extremums',
    'whisker/deviation': boxType === 'standardDeviation',
  };
}

/**
 * Converts boxplot style options to Fusion BoxplotWidgetStyle DTO.
 * Inverse of `extractBoxplotChartStyleOptions`.
 *
 * The whisker algorithm (`boxType`) and `outliersEnabled` flag live on
 * {@link BoxplotChartDataOptions} in the WidgetModel rather than on `styleOptions`,
 * so they are passed in separately. `boxType` defaults to `'iqr'` — the same default
 * the boxplot translator falls back to when no whisker flag is selected.
 *
 * @param styleOptions - Boxplot style options from WidgetModel.styleOptions
 * @param boxType - Whisker algorithm from WidgetModel.dataOptions.boxType
 * @param outliersEnabled - Whether to render boxplot outliers
 * @returns Fusion BoxplotWidgetStyle for the widget DTO
 * @internal
 */
export function toBoxplotWidgetStyle(
  styleOptions: BoxplotStyleOptions,
  boxType: BoxWhiskerType = 'iqr',
  outliersEnabled?: boolean,
): BoxplotWidgetStyle {
  const dataLimits = toDataLimitsStyle(styleOptions.dataLimits);
  // Cast through `unknown` because `BoxplotWidgetStyle` does not declare `legend`
  // or `navigator`, but the inverse extractor reads them via `'legend' in style`
  // checks and Fusion's boxplot widgets carry both fields in practice — emitting
  // them keeps the round-trip intact.
  return {
    legend: toLegendStyle(styleOptions.legend),
    navigator: toNavigatorStyle(styleOptions.navigator),
    xAxis: toAxisStyle(styleOptions.xAxis),
    yAxis: toAxisStyle(styleOptions.yAxis),
    seriesLabels: toSeriesLabelsStyle(styleOptions.seriesLabels),
    ...(dataLimits && { dataLimits }),
    whisker: toBoxplotWhiskerStyle(boxType),
    outliers: { enabled: outliersEnabled ?? false },
  } as unknown as BoxplotWidgetStyle;
}

/**
 * Converts calendar-heatmap style options to Fusion CalendarHeatmapWidgetStyle DTO.
 * Inverse of {@link extractCalendarHeatmapChartStyleOptions}.
 *
 * Only the fields the inverse extractor reads are round-trippable. Cosmetic fields
 * that the extractor synthesizes from {@link CALENDAR_HEATMAP_DEFAULTS}
 * (`monthLabels.enabled`, `weekends.cellColor`, `weekends.hideValues`,
 * `pagination.enabled`) are not written back because the Fusion DTO has no fields
 * for them.
 *
 * The CSDK `subtype` (`'calendar-heatmap/split' | 'calendar-heatmap/continuous'`)
 * is NOT the DTO `subtype` — the DTO uses `'heatmap'` and encodes view as the
 * `'view/weekly'` / `'view/monthly'` style flags.
 *
 * `pagination.startMonth` is emitted as `{year, month}` because Fusion's startMonth
 * object form is the canonical write shape; the string form is read-only legacy input.
 *
 * @param styleOptions - Calendar heatmap style options from WidgetModel.styleOptions
 * @returns Fusion CalendarHeatmapWidgetStyle for the widget DTO
 * @internal
 */
export function toCalendarHeatmapWidgetStyle(
  styleOptions: CalendarHeatmapStyleOptions,
): CalendarHeatmapWidgetStyle {
  const subtype = styleOptions.subtype ?? CALENDAR_HEATMAP_DEFAULTS.SUBTYPE;
  const viewType = styleOptions.viewType ?? CALENDAR_HEATMAP_DEFAULTS.VIEW_TYPE;
  const startOfWeek = styleOptions.startOfWeek ?? CALENDAR_HEATMAP_DEFAULTS.START_OF_WEEK;

  const startMonthDate = styleOptions.pagination?.startMonth;
  const startMonth =
    startMonthDate instanceof Date
      ? { year: startMonthDate.getFullYear(), month: startMonthDate.getMonth() }
      : undefined;

  return {
    dayNameEnabled: styleOptions.dayLabels?.enabled ?? CALENDAR_HEATMAP_DEFAULTS.SHOW_DAY_LABEL,
    dayNumberEnabled: styleOptions.cellLabels?.enabled ?? CALENDAR_HEATMAP_DEFAULTS.SHOW_CELL_LABEL,
    grayoutEnabled: styleOptions.weekends?.enabled ?? CALENDAR_HEATMAP_DEFAULTS.WEEKEND_ENABLED,
    'view/monthly': subtype === 'calendar-heatmap/split',
    'view/weekly': subtype === 'calendar-heatmap/continuous',
    'domain/month': viewType === 'month',
    'domain/quarter': viewType === 'quarter',
    'domain/half-year': viewType === 'half-year',
    'domain/year': viewType === 'year',
    'week/monday': startOfWeek === 'monday',
    'week/sunday': startOfWeek === 'sunday',
    ...(startMonth && { startMonth }),
  };
}

/**
 * Converts table style options to Fusion TableWidgetStyle DTO.
 * Used when serializing a table widget back to WidgetDto.
 *
 * @param styleOptions - Table style options from WidgetModel.styleOptions
 * @returns Fusion TableWidgetStyle for the widget DTO
 * @internal
 */
export function toTableWidgetStyle(styleOptions: TableStyleOptions): TableWidgetStyle {
  const columnsWidth = styleOptions.columns?.width;
  return {
    pageSize: styleOptions.rowsPerPage ?? 25,
    'colors/headers': styleOptions.header?.color?.enabled ?? true,
    'colors/rows': styleOptions.rows?.alternatingColor?.enabled ?? true,
    'colors/columns': styleOptions.columns?.alternatingColor?.enabled ?? false,
    'width/content': columnsWidth === 'content' || columnsWidth === undefined,
    'width/window': columnsWidth === 'auto',
    ...(styleOptions.isAutoHeight !== undefined && { automaticHeight: styleOptions.isAutoHeight }),
  };
}

/**
 * Converts pivot table style options to Fusion PivotWidgetStyle DTO.
 * Inverse of {@link extractPivotTableStyleOptions}.
 *
 * Grand totals come from {@link PivotTableDataOptions.grandTotals} in the WidgetModel, not
 * from `styleOptions`, so they are passed in separately.
 *
 * @param styleOptions - Pivot table style options from WidgetModel.styleOptions
 * @param grandTotals - Grand totals config from WidgetModel.dataOptions.grandTotals
 * @returns Fusion PivotWidgetStyle for the widget DTO
 * @internal
 */
export function toPivotTableWidgetStyle(
  styleOptions: PivotTableWidgetStyleOptions,
  grandTotals?: PivotGrandTotals,
): PivotWidgetStyle {
  return {
    ...(grandTotals?.rows !== undefined && { rowsGrandTotal: grandTotals.rows }),
    ...(grandTotals?.columns !== undefined && { columnsGrandTotal: grandTotals.columns }),
    colors: {
      rows: styleOptions.alternatingRowsColor,
      columns: styleOptions.alternatingColumnsColor,
      headers: styleOptions.headersColor,
      members: styleOptions.membersColor,
      totals: styleOptions.totalsColor,
    },
    ...(styleOptions.rowsPerPage !== undefined && { pageSize: styleOptions.rowsPerPage }),
    ...(styleOptions.rowHeight !== undefined && { rowHeight: styleOptions.rowHeight }),
    ...(styleOptions.isAutoHeight !== undefined && { automaticHeight: styleOptions.isAutoHeight }),
  };
}
