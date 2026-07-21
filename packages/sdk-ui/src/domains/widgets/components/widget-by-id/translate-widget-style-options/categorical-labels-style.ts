import type { FunnelSeriesLabels, PieSeriesLabels, SeriesLabelsBase } from '@/types';

import {
  extractSeriesLabelAffixFromFusion,
  extractSeriesLabelTextStyleFromFusion,
  toFusionSeriesLabelColor,
  toFusionSeriesLabelTextStyleFromSdk,
  toPublicSeriesLabelAffixFields,
} from './series-label-affix-style.js';

/** Fusion funnel/pie `style.labels` including value-label formatting fields. */
export type CategoricalFusionLabels = {
  enabled: boolean;
  categories: boolean;
  percent: boolean;
  value: boolean;
  decimals: boolean;
  rotation?: number;
  customRotation?: number | null;
  prefix?: string;
  suffix?: string;
  labelColor?: string | null;
  fontSize?: number | null;
  fontStyle?: 'normal' | 'italic';
  backgroundColor?: string | null;
  backgroundPadding?: number | null;
  borderColor?: string | null;
  borderWidth?: number | null;
  borderRadius?: number | null;
  xOffset?: number | null;
  yOffset?: number | null;
};

export type CategoricalFusionLabelsDto = {
  enabled: boolean;
  categories: boolean;
  percent: boolean;
  value: boolean;
  decimals: boolean;
  rotation: number;
  customRotation: number | null;
  prefix: string;
  suffix: string;
  labelColor: string | null;
  fontSize: number | null;
  fontStyle: 'normal' | 'italic';
  backgroundColor: string | null;
  backgroundPadding: number;
  borderColor: string | null;
  borderWidth: number;
  borderRadius: number;
  xOffset: number;
  yOffset: number;
};

/**
 * Resolves effective label rotation from Fusion DTO (customRotation overrides preset).
 *
 * @param labels - Fusion categorical labels DTO fragment
 * @returns Effective rotation in degrees
 * @internal
 */
export function getFusionCategoricalLabelsRotation(labels: CategoricalFusionLabels): number {
  const { customRotation } = labels;
  if (customRotation != null) {
    return customRotation;
  }
  return labels.rotation ?? 0;
}

/**
 * Maps Fusion label formatting fields to CSDK seriesLabels styling props.
 *
 * @param labels - Fusion categorical labels DTO fragment
 * @returns Partial series label styling props derived from Fusion formatting fields
 * @internal
 */
export function extractCategoricalLabelFormatting(
  labels: CategoricalFusionLabels,
): Pick<
  SeriesLabelsBase,
  | 'rotation'
  | 'prefix'
  | 'suffix'
  | 'backgroundColor'
  | 'padding'
  | 'borderColor'
  | 'borderWidth'
  | 'borderRadius'
  | 'xOffset'
  | 'yOffset'
> {
  const textStyle = extractSeriesLabelTextStyleFromFusion({
    color: labels.labelColor,
    fontSize: labels.fontSize,
    fontStyle: labels.fontStyle,
  });

  return {
    rotation: getFusionCategoricalLabelsRotation(labels),
    ...(textStyle != null ? { textStyle } : {}),
    ...toPublicSeriesLabelAffixFields(extractSeriesLabelAffixFromFusion(labels)),
  };
}

/**
 * Builds CSDK pie series labels from Fusion funnel/pie `style.labels`.
 *
 * @param labels - Fusion categorical labels DTO
 * @returns Pie series labels configuration
 * @internal
 */
export function buildPieSeriesLabelsFromFusionLabels(
  labels: CategoricalFusionLabels,
): PieSeriesLabels {
  const { enabled, categories, percent, decimals, value } = labels;

  return {
    enabled: enabled ?? false,
    showCategory: categories,
    showValue: value,
    percentageLabels: {
      enabled: percent,
      showDecimals: decimals,
    },
    ...extractCategoricalLabelFormatting(labels),
  };
}

/**
 * Builds CSDK funnel series labels from Fusion funnel/pie `style.labels`.
 *
 * @param labels - Fusion categorical labels DTO
 * @returns Funnel series labels configuration
 * @internal
 */
export function buildFunnelSeriesLabelsFromFusionLabels(
  labels: CategoricalFusionLabels,
): FunnelSeriesLabels {
  const { enabled, categories, percent, decimals, value } = labels;

  return {
    enabled: enabled ?? false,
    showCategory: categories,
    showValue: value,
    showPercentage: percent,
    showPercentDecimals: decimals,
    ...extractCategoricalLabelFormatting(labels),
  };
}

type CategoricalSeriesLabels = PieSeriesLabels | FunnelSeriesLabels;

const readCategoricalSeriesLabelPercentEnabled = (
  seriesLabels: CategoricalSeriesLabels | undefined,
): boolean | undefined => {
  if (!seriesLabels) {
    return undefined;
  }
  if ('percentageLabels' in seriesLabels) {
    return seriesLabels.percentageLabels?.enabled;
  }
  if ('showPercentage' in seriesLabels) {
    return seriesLabels.showPercentage;
  }
  return undefined;
};

const readCategoricalSeriesLabelPercentDecimals = (
  seriesLabels: CategoricalSeriesLabels | undefined,
): boolean | undefined => {
  if (!seriesLabels) {
    return undefined;
  }
  if ('percentageLabels' in seriesLabels) {
    return seriesLabels.percentageLabels?.showDecimals;
  }
  if ('showPercentDecimals' in seriesLabels) {
    return seriesLabels.showPercentDecimals;
  }
  return undefined;
};

const resolveCategoricalFusionLabelColor = (
  sdkColor: SeriesLabelsBase['backgroundColor'] | undefined,
  fusionColor: string | null | undefined,
  defaultColor: string | null,
): string | null => toFusionSeriesLabelColor(sdkColor) ?? fusionColor ?? defaultColor;

export const DEFAULT_CATEGORICAL_FUSION_LABEL_FORMATTING = {
  rotation: 0,
  customRotation: null,
  prefix: '',
  suffix: '',
  labelColor: null,
  fontSize: null,
  fontStyle: 'normal',
  backgroundColor: null,
  backgroundPadding: 2,
  borderColor: null,
  borderWidth: 1,
  borderRadius: 0,
  xOffset: 0,
  yOffset: 0,
} as const;

/**
 * Maps CSDK seriesLabels back to Fusion funnel/pie `style.labels` DTO.
 *
 * @param labels - Partial Fusion categorical labels DTO fragment, if any
 * @param seriesLabels - CSDK pie or funnel series label options
 * @returns Fusion categorical labels DTO with formatting defaults applied
 * @internal
 */
export function toFusionCategoricalLabelsFromSeriesLabels(
  labels: Partial<CategoricalFusionLabels> | undefined,
  seriesLabels: CategoricalSeriesLabels | undefined,
): CategoricalFusionLabelsDto {
  const l = labels ?? {};
  const sl = seriesLabels;

  const percent = readCategoricalSeriesLabelPercentEnabled(sl) ?? l.percent ?? true;
  const decimals = readCategoricalSeriesLabelPercentDecimals(sl) ?? l.decimals ?? false;
  const fusionTextStyle = toFusionSeriesLabelTextStyleFromSdk(sl);

  return {
    enabled: sl?.enabled ?? l.enabled ?? true,
    categories: sl?.showCategory ?? l.categories ?? true,
    percent,
    value: sl?.showValue ?? l.value ?? false,
    decimals,
    rotation: sl?.rotation ?? l.rotation ?? DEFAULT_CATEGORICAL_FUSION_LABEL_FORMATTING.rotation,
    customRotation: l.customRotation ?? DEFAULT_CATEGORICAL_FUSION_LABEL_FORMATTING.customRotation,
    prefix: sl?.prefix ?? l.prefix ?? DEFAULT_CATEGORICAL_FUSION_LABEL_FORMATTING.prefix,
    suffix: sl?.suffix ?? l.suffix ?? DEFAULT_CATEGORICAL_FUSION_LABEL_FORMATTING.suffix,
    labelColor:
      fusionTextStyle.color ??
      l.labelColor ??
      DEFAULT_CATEGORICAL_FUSION_LABEL_FORMATTING.labelColor,
    fontSize:
      fusionTextStyle.fontSize ??
      l.fontSize ??
      DEFAULT_CATEGORICAL_FUSION_LABEL_FORMATTING.fontSize,
    fontStyle:
      fusionTextStyle.fontStyle ??
      l.fontStyle ??
      DEFAULT_CATEGORICAL_FUSION_LABEL_FORMATTING.fontStyle,
    backgroundColor: resolveCategoricalFusionLabelColor(
      sl?.backgroundColor,
      l.backgroundColor,
      DEFAULT_CATEGORICAL_FUSION_LABEL_FORMATTING.backgroundColor,
    ),
    backgroundPadding:
      sl?.padding ??
      l.backgroundPadding ??
      DEFAULT_CATEGORICAL_FUSION_LABEL_FORMATTING.backgroundPadding,
    borderColor: resolveCategoricalFusionLabelColor(
      sl?.borderColor,
      l.borderColor,
      DEFAULT_CATEGORICAL_FUSION_LABEL_FORMATTING.borderColor,
    ),
    borderWidth:
      sl?.borderWidth ?? l.borderWidth ?? DEFAULT_CATEGORICAL_FUSION_LABEL_FORMATTING.borderWidth,
    borderRadius:
      sl?.borderRadius ??
      l.borderRadius ??
      DEFAULT_CATEGORICAL_FUSION_LABEL_FORMATTING.borderRadius,
    xOffset: sl?.xOffset ?? l.xOffset ?? DEFAULT_CATEGORICAL_FUSION_LABEL_FORMATTING.xOffset,
    yOffset: sl?.yOffset ?? l.yOffset ?? DEFAULT_CATEGORICAL_FUSION_LABEL_FORMATTING.yOffset,
  };
}
