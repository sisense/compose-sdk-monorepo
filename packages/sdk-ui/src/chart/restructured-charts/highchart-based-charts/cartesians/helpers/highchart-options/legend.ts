import {
  LegendPosition,
  LegendSettings,
} from '@/chart-options-processor/translations/legend-section';
import type { LegendOptions } from '@/types';

const legendItemStyleDefault: LegendSettings['itemStyle'] = {
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
      ...(text !== undefined && { text }),
      ...(textStyle !== undefined && { style: textStyle }),
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
    ...(layout !== undefined && { layout }),
    ...(textStyle !== undefined && { itemStyle: textStyle }),
    ...(marginBottom !== undefined && { itemMarginBottom: marginBottom }),
    ...(marginTop !== undefined && { itemMarginTop: marginTop }),
    ...(distance !== undefined && { itemDistance: distance }),
    ...(width !== undefined && { itemWidth: width }),
    ...(hoverTextStyle !== undefined && { itemHoverStyle: hoverTextStyle }),
    ...(hiddenTextStyle !== undefined && { itemHiddenStyle: hiddenTextStyle }),
  };
};

const transformLegendSymbolsOptionsToLegendSettings = (symbols: LegendOptions['symbols']) => {
  if (!symbols) return undefined;

  const { radius, height, width, padding, squared } = symbols;

  return {
    ...(radius !== undefined && { symbolRadius: radius }),
    ...(height !== undefined && { symbolHeight: height }),
    ...(width !== undefined && { symbolWidth: width }),
    ...(padding !== undefined && { symbolPadding: padding }),
    ...(squared !== undefined && { squareSymbol: squared }),
  };
};

const transformLegendOptionsToLegendSettings = (legend: LegendOptions): LegendSettings => {
  const { title, items, symbols, xOffset, yOffset, ...restLegendOptions } = legend;
  return {
    ...restLegendOptions,
    ...transformLegendTitleOptionsToLegendSettings(title),
    ...transformLegendItemsOptionsToLegendSettings(items),
    ...transformLegendSymbolsOptionsToLegendSettings(symbols),
    ...(xOffset !== undefined && { x: xOffset }),
    ...(yOffset !== undefined && { y: yOffset }),
  };
};

export const getBasicCartesianLegend = (legend?: LegendOptions): LegendSettings => {
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

  return {
    ...defaultSettings,
    ...positionSettings,
    ...legendSettings,
    itemStyle: {
      ...legendItemStyleDefault,
      ...legendSettings.itemStyle,
    },
  };
};
