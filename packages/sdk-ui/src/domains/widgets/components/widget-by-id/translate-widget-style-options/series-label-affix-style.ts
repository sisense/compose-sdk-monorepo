import type { SeriesLabelsBase, SeriesLabelsTextStyle } from '@/types';

/** Fusion widget `seriesLabels` / categorical `labels` affix formatting fields. */
export type FusionSeriesLabelAffix = {
  prefix?: string;
  suffix?: string;
  color?: string | null;
  fontSize?: number | null;
  fontStyle?: 'normal' | 'italic' | null;
  backgroundColor?: string | null;
  backgroundPadding?: number | null;
  borderColor?: string | null;
  borderWidth?: number | null;
  borderRadius?: number | null;
  xOffset?: number | null;
  yOffset?: number | null;
};

type PublicSeriesLabelAffix = Pick<
  SeriesLabelsBase,
  | 'prefix'
  | 'suffix'
  | 'backgroundColor'
  | 'padding'
  | 'borderColor'
  | 'borderWidth'
  | 'borderRadius'
  | 'xOffset'
  | 'yOffset'
>;

/**
 * Clearable affix fields used during Fusion → StyleOptions translation.
 * `null` means an explicit reset; normalized away before public StyleOptions.
 *
 * @internal
 */
export type InternalSeriesLabelAffix = {
  [K in keyof PublicSeriesLabelAffix]?: PublicSeriesLabelAffix[K] | null;
};

type SeriesLabelColor = NonNullable<SeriesLabelsBase['backgroundColor']>;

const assignPublicField = <T extends keyof PublicSeriesLabelAffix>(
  result: Partial<PublicSeriesLabelAffix>,
  key: T,
  value: PublicSeriesLabelAffix[T] | null | undefined,
): void => {
  if (value != null) {
    result[key] = value;
  }
};

/**
 * Maps internal affix fields (which may carry explicit `null` clears) to public
 * StyleOptions fields. Cleared values are omitted from the public shape.
 *
 * @param affix - Internal affix fragment, possibly containing explicit clears
 * @returns Public series label affix fields safe for StyleOptions
 * @internal
 */
export function toPublicSeriesLabelAffixFields(
  affix: Partial<InternalSeriesLabelAffix>,
): Partial<PublicSeriesLabelAffix> {
  const result: Partial<PublicSeriesLabelAffix> = {};

  assignPublicField(result, 'prefix', affix.prefix);
  assignPublicField(result, 'suffix', affix.suffix);
  assignPublicField(result, 'backgroundColor', affix.backgroundColor);
  assignPublicField(result, 'padding', affix.padding);
  assignPublicField(result, 'borderColor', affix.borderColor);
  assignPublicField(result, 'borderWidth', affix.borderWidth);
  assignPublicField(result, 'borderRadius', affix.borderRadius);
  assignPublicField(result, 'xOffset', affix.xOffset);
  assignPublicField(result, 'yOffset', affix.yOffset);

  return result;
}

/**
 * Clearable text style used during Fusion → StyleOptions translation.
 * `null` means an explicit reset; normalized away before public StyleOptions.
 *
 * @internal
 */
export type InternalSeriesLabelTextStyle = SeriesLabelsTextStyle | null;

/**
 * Maps Fusion value label text color to internal CSDK textStyle props.
 *
 * @param labels - Fusion series label fragment containing optional `color`
 * @returns Internal text style; `null` means explicit clear, `undefined` means unset
 * @internal
 */
export function extractSeriesLabelTextStyleFromFusion(
  labels: Pick<FusionSeriesLabelAffix, 'color' | 'fontSize' | 'fontStyle'>,
): InternalSeriesLabelTextStyle | undefined {
  const textStyle: SeriesLabelsTextStyle = {};
  let hasTextStyle = false;

  if (labels.color != null && labels.color !== '') {
    textStyle.color = labels.color;
    hasTextStyle = true;
  }

  if (labels.fontSize != null) {
    textStyle.fontSize = `${Number(labels.fontSize)}px`;
    hasTextStyle = true;
  }

  if (labels.fontStyle === 'italic') {
    textStyle.fontStyle = 'italic';
    hasTextStyle = true;
  }

  if (labels.color === null) {
    return hasTextStyle ? textStyle : null;
  }

  return hasTextStyle ? textStyle : undefined;
}

/**
 * Maps CSDK series label color to Fusion string color; gradients and `auto` are not supported.
 *
 * @param color - CSDK series label color value
 * @returns Fusion-compatible color string, or `undefined` when not representable
 * @internal
 */
export const toFusionSeriesLabelColor = (
  color: SeriesLabelColor | string | null | undefined,
): string | null | undefined => (typeof color === 'string' && color !== 'auto' ? color : undefined);

const parseFusionSeriesLabelFontSize = (
  fontSize: SeriesLabelsTextStyle['fontSize'] | undefined,
): number | null | undefined => {
  if (fontSize == null || fontSize === '') {
    return undefined;
  }

  const parsed = parseInt(String(fontSize), 10);

  return Number.isFinite(parsed) ? parsed : undefined;
};

/**
 * Maps CSDK series label text style to Fusion DTO fields.
 *
 * @param seriesLabels - CSDK series label options
 * @returns Fusion text style fragment
 * @internal
 */
export function toFusionSeriesLabelTextStyleFromSdk(
  seriesLabels: Pick<SeriesLabelsBase, 'textStyle'> | undefined,
): Pick<FusionSeriesLabelAffix, 'color' | 'fontSize' | 'fontStyle'> {
  const textStyle = seriesLabels?.textStyle;

  if (!textStyle) {
    return {};
  }

  const result: Pick<FusionSeriesLabelAffix, 'color' | 'fontSize' | 'fontStyle'> = {};
  const color = toFusionSeriesLabelColor(textStyle.color);

  if (color) {
    result.color = color;
  }

  const fontSize = parseFusionSeriesLabelFontSize(textStyle.fontSize);

  if (fontSize != null) {
    result.fontSize = fontSize;
  }

  if (textStyle.fontStyle === 'italic') {
    result.fontStyle = 'italic';
  }

  return result;
}

/**
 * Maps Fusion series label affix fields to internal CSDK affix props.
 * Each field is mapped independently so pie/funnel and cartesian charts share the same rules.
 *
 * @param labels - Fusion series label affix fragment
 * @returns Partial internal affix props; may include explicit `null` clears
 * @internal
 */
export function extractSeriesLabelAffixFromFusion(
  labels: FusionSeriesLabelAffix,
): Partial<InternalSeriesLabelAffix> {
  const result: Partial<InternalSeriesLabelAffix> = {
    ...(labels.prefix && { prefix: labels.prefix }),
    ...(labels.suffix && { suffix: labels.suffix }),
    ...(labels.xOffset != null &&
      labels.xOffset !== 0 && {
        xOffset: labels.xOffset,
      }),
    ...(labels.yOffset != null &&
      labels.yOffset !== 0 && {
        yOffset: labels.yOffset,
      }),
  };

  if (labels.backgroundColor === null) {
    result.backgroundColor = null;
  } else if (labels.backgroundColor != null && labels.backgroundColor !== '') {
    result.backgroundColor = labels.backgroundColor;
  }

  if (labels.backgroundPadding != null) {
    result.padding = labels.backgroundPadding;
  } else if (labels.backgroundColor === null) {
    result.padding = null;
  }

  if (labels.borderColor === null) {
    result.borderColor = null;
  } else if (labels.borderColor != null && labels.borderColor !== '') {
    result.borderColor = labels.borderColor;
  }

  if (labels.borderWidth != null) {
    result.borderWidth = labels.borderWidth;
  } else if (labels.borderColor === null) {
    result.borderWidth = null;
  }

  if (labels.borderRadius != null) {
    result.borderRadius = labels.borderRadius;
  } else if (labels.borderColor === null) {
    result.borderRadius = null;
  }

  return result;
}

/**
 * Maps CSDK seriesLabels affix fields to a Fusion DTO fragment.
 *
 * @param seriesLabels - CSDK series label affix fields
 * @returns Fusion series label affix fragment
 * @internal
 */
export function toFusionSeriesLabelAffixFromSdk(
  seriesLabels: Partial<PublicSeriesLabelAffix> | undefined,
): FusionSeriesLabelAffix {
  if (!seriesLabels) {
    return {};
  }

  const backgroundColor = toFusionSeriesLabelColor(seriesLabels.backgroundColor);
  const borderColor = toFusionSeriesLabelColor(seriesLabels.borderColor);

  return {
    ...(seriesLabels.prefix && { prefix: seriesLabels.prefix }),
    ...(seriesLabels.suffix && { suffix: seriesLabels.suffix }),
    ...(backgroundColor && { backgroundColor }),
    ...(seriesLabels.padding != null && { backgroundPadding: seriesLabels.padding }),
    ...(borderColor && { borderColor }),
    ...(seriesLabels.borderWidth != null && { borderWidth: seriesLabels.borderWidth }),
    ...(seriesLabels.borderRadius != null && { borderRadius: seriesLabels.borderRadius }),
    ...(seriesLabels.xOffset != null && { xOffset: seriesLabels.xOffset }),
    ...(seriesLabels.yOffset != null && { yOffset: seriesLabels.yOffset }),
  };
}
