import { HighchartsGradientColorObject, withGradientConversion } from '@/shared/utils/gradient';
import { omitUndefinedAndEmpty } from '@/shared/utils/omit-undefined';
import type { LegendOptions } from '@/types';

import type { TextStyle } from './types.js';

export type LegendPosition = 'top' | 'left' | 'right' | 'bottom' | null;

export type LegendSettings = {
  enabled: boolean;
  align?: 'center' | 'left' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  borderWidth?: number;
  borderColor?: string | HighchartsGradientColorObject;
  borderRadius?: number;
  backgroundColor?: string | HighchartsGradientColorObject;
  margin?: number;
  padding?: number;
  maxHeight?: number;
  shadow?: boolean;
  reversed?: boolean;
  rtl?: boolean;
  floating?: boolean;
  width?: number | string;
  x?: number;
  y?: number;

  layout?: 'horizontal' | 'vertical' | 'proximate';
  itemDistance?: number;
  itemWidth?: number;
  itemStyle?: TextStyle;
  itemHoverStyle?: TextStyle;
  itemHiddenStyle?: TextStyle;
  itemMarginBottom?: number;
  itemMarginTop?: number;

  symbolRadius?: number;
  symbolHeight?: number;
  symbolWidth?: number;
  symbolPadding?: number;
  squareSymbol?: boolean;

  title?: {
    text?: string;
    style?: TextStyle;
  };
};

export const legendItemStyleDefault: LegendSettings['itemStyle'] = {
  fontSize: '13px',
  fontWeight: 'normal',
  textOutline: 'none',
  pointerEvents: 'auto',
};

const transformDeprecatedLegendPositionToLegendSettings = (
  position: LegendPosition,
): LegendSettings => {
  switch (position) {
    case 'bottom':
      return {
        enabled: true,
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal',
      };
    case 'left':
      return {
        enabled: true,
        align: 'left',
        verticalAlign: 'middle',
        layout: 'vertical',
      };
    case 'right':
      return {
        enabled: true,
        align: 'right',
        verticalAlign: 'middle',
        layout: 'vertical',
      };
    case 'top':
      return {
        enabled: true,
        align: 'center',
        verticalAlign: 'top',
        layout: 'horizontal',
      };
    // edge case when position is something like bottomright or not selected in fusion.
    // eslint-disable-next-line sonarjs/no-duplicated-branches
    default:
      return {
        enabled: true,
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal',
      };
  }
};

const transformLegendTitleOptionsToLegendSettings = (title: LegendOptions['title']) => {
  if (title?.enabled === false || !title) return undefined;

  const { text, textStyle } = title;

  return {
    title: {
      text,
      style: textStyle,
    },
  };
};

const transformLegendItemsOptionsToLegendSettings = (items: LegendOptions['items']) => {
  if (!items) return undefined;
  const {
    layout,
    textStyle,
    marginBottom,
    marginTop,
    distance,
    width,
    hoverTextStyle,
    hiddenTextStyle,
  } = items || {};

  return {
    layout,
    itemStyle: textStyle,
    itemMarginBottom: marginBottom,
    itemMarginTop: marginTop,
    itemDistance: distance,
    itemWidth: width,
    itemHoverStyle: hoverTextStyle,
    itemHiddenStyle: hiddenTextStyle,
  };
};

const transformLegendSymbolsOptionsToLegendSettings = (symbols: LegendOptions['symbols']) => {
  if (!symbols) return undefined;

  const { radius, height, width, padding, squared } = symbols;

  return {
    symbolRadius: radius,
    symbolHeight: height,
    symbolWidth: width,
    symbolPadding: padding,
    squareSymbol: squared,
  };
};

const transformLegendOptionsToLegendSettings = (legend: LegendOptions): LegendSettings => {
  const {
    title,
    items,
    symbols,
    xOffset,
    yOffset,
    backgroundColor,
    borderColor,
    ...restLegendOptions
  } = legend;
  return omitUndefinedAndEmpty({
    ...restLegendOptions,
    ...transformLegendTitleOptionsToLegendSettings(title),
    ...transformLegendItemsOptionsToLegendSettings(items),
    ...transformLegendSymbolsOptionsToLegendSettings(symbols),
    x: xOffset,
    y: yOffset,
    backgroundColor: withGradientConversion(backgroundColor),
    borderColor: withGradientConversion(borderColor),
  });
};

export const getLegendSettings = (legend?: LegendOptions): LegendSettings => {
  const defaultSettings = {
    enabled: false,
    symbolRadius: 0,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    align: 'center' as const,
    verticalAlign: 'bottom' as const,
    layout: 'horizontal' as const,
  };

  if (!legend) {
    return defaultSettings;
  }

  const { position, ...restLegendOptions } = legend;

  const positionSettings = transformDeprecatedLegendPositionToLegendSettings(position || null);
  const legendSettings = transformLegendOptionsToLegendSettings(restLegendOptions);

  return omitUndefinedAndEmpty({
    ...defaultSettings,
    ...positionSettings,
    ...legendSettings,
    itemStyle: {
      ...legendItemStyleDefault,
      ...legendSettings.itemStyle,
    },
  });
};

export const isLegendOnRight = (legend?: LegendOptions) => {
  return (
    legend?.position === 'right' ||
    (legend?.align === 'right' &&
      legend?.items?.layout === 'vertical' &&
      legend?.verticalAlign === 'middle')
  );
};
