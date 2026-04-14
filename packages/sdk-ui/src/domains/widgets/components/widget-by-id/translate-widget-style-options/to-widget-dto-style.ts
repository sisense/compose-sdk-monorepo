import { isWidgetDesignEnabled } from '@/domains/widgets/widget-model/widget-model-translator/utils.js';
import { AppSettings } from '@/infra/app/settings/settings.js';
import { LEGACY_DESIGN_TYPES } from '@/infra/themes/legacy-design-settings';
import type {
  AlignmentTypes,
  AreaStyleOptions,
  AxisLabel,
  CartesianStyleOptions,
  CompleteThemeSettings,
  DataLimits,
  GaugeIndicatorStyleOptions,
  IndicatorStyleOptions,
  LegendOptions,
  LineStyleOptions,
  LineWidth,
  Markers,
  Navigator,
  NumericBarIndicatorStyleOptions,
  NumericSimpleIndicatorStyleOptions,
  PieStyleOptions,
  RadiusSizes,
  SeriesLabels,
  ShadowsTypes,
  SpaceSizes,
  TotalLabels,
  WidgetStyleOptions,
} from '@/types.js';

import type {
  AxisStyle,
  CartesianWidgetStyle,
  WidgetDesign,
  WidgetStyle,
  WidgetSubtype,
} from '../types.js';

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

function buildCommonCartesianWidgetStyle(
  styleOptions: CartesianStyleOptions,
): Omit<CartesianWidgetStyle, 'seriesLabels'> {
  const legend = toLegendStyle(styleOptions.legend);
  const navigator = toNavigatorStyle(styleOptions.navigator);
  const xAxis = toAxisStyle(styleOptions.xAxis);
  const yAxis = toAxisStyle(styleOptions.yAxis);
  const y2Axis = styleOptions.y2Axis ? toAxisStyle(styleOptions.y2Axis) : undefined;
  const lineWidth =
    'lineWidth' in styleOptions ? toLineWidthStyle(styleOptions.lineWidth) : undefined;
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

const AREA_STACKED_SUBTYPES: ReadonlySet<WidgetSubtype> = new Set([
  'area/stacked',
  'area/stackedspline',
]);
const AREA_STACKED100_SUBTYPES: ReadonlySet<WidgetSubtype> = new Set([
  'area/stacked100',
  'area/stackedspline100',
]);

/**
 * Inverse of {@link extractValueLabelsOptions} for area chart subtypes: restores Fusion
 * `seriesLabels.labels` (stacked / stackedPercentage / types) from SDK model fields.
 */
function toAreaSeriesLabelsStyle(
  widgetSubtype: WidgetSubtype,
  seriesLabels?: SeriesLabels,
  totalLabels?: TotalLabels,
): CartesianWidgetStyle['seriesLabels'] {
  const enabled = seriesLabels?.enabled ?? false;
  const rotation = seriesLabels?.rotation ?? 0;
  const showValue = seriesLabels?.showValue ?? false;
  const showTotals = totalLabels?.enabled && enabled;

  if (AREA_STACKED_SUBTYPES.has(widgetSubtype)) {
    return {
      enabled,
      rotation,
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

  if (AREA_STACKED100_SUBTYPES.has(widgetSubtype)) {
    const showPercentage = seriesLabels?.showPercentage ?? false;
    return {
      enabled,
      rotation,
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
  widgetTheme: CompleteThemeSettings['widget'],
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
  themeSettings: CompleteThemeSettings,
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
  const l = styleOptions.labels ?? {};

  return {
    legend,
    labels: {
      enabled: l.enabled ?? true,
      categories: l.categories ?? true,
      percent: l.percent ?? true,
      value: l.value ?? false,
      decimals: l.decimals ?? false,
    },
    ...(dataLimits && { dataLimits }),
    ...(styleOptions.convolution && { convolution: styleOptions.convolution }),
  } as WidgetStyle;
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
  return {
    ...buildCommonCartesianWidgetStyle(styleOptions),
    seriesLabels: toSeriesLabelsStyle(styleOptions.seriesLabels),
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
  return {
    ...buildCommonCartesianWidgetStyle(styleOptions),
    seriesLabels: toAreaSeriesLabelsStyle(
      widgetSubtype,
      styleOptions.seriesLabels,
      styleOptions.totalLabels,
    ),
  };
}
