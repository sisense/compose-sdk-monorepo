/* eslint-disable no-case-declarations */
/* eslint-disable complexity */
import { DEFAULT_COLOR } from '../chart-data-options/coloring/consts';
import { getUniformColorOptionsFromString } from '../chart-data-options/coloring/uniform-coloring';
import { DataColorOptions, RangeDataColorOptions } from '../chart-data/series-data-color-service';
import { getAPaletteColor } from '../chart-options-processor/translations/pie-series';
import { CompleteThemeSettings, ValueToColorMap, MultiColumnValueToColorMap } from '../types';
import { scaleBrightness, toGray } from '../utils/color';
import {
  PanelColorFormat,
  PanelColorFormatConditionSimple,
  PanelColorFormatRange,
  PanelItem,
  PanelMembersFormat,
} from './types';
import { normalizeName } from '@sisense/sdk-data';

const getDefaultColor = (themeSettings?: CompleteThemeSettings, index = 0) =>
  getAPaletteColor(themeSettings?.palette.variantColors, index);

const createRangeValueColorOptions = (
  format: PanelColorFormatRange,
  themeSettings?: CompleteThemeSettings,
) => {
  let options: RangeDataColorOptions = {
    type: 'range',
    steps: format.steps,
  };

  if (format.rangeMode !== 'auto') {
    const minValue = parseFloat(`${format.minvalue}`);
    const midValue = parseFloat(`${format.midvalue}`);
    const maxValue = parseFloat(`${format.maxvalue}`);

    options = {
      ...options,
      ...(minValue && { minValue }),
      ...(midValue && { midValue }),
      ...(maxValue && { maxValue }),
    };
  }

  const baseColor = getDefaultColor(themeSettings);
  const defaultMinColor = scaleBrightness(baseColor, 0.2);
  const defaultMaxColor = scaleBrightness(baseColor, -0.2);

  switch (format.rangeMode) {
    case 'auto':
      return {
        ...options,
        minColor: toGray(baseColor),
        maxColor: defaultMaxColor,
      };
    case 'both':
      return {
        ...options,
        minColor: format.min || defaultMinColor,
        maxColor: format.max || defaultMaxColor,
      };
    case 'min':
      return {
        ...options,
        minColor: format.min || defaultMinColor,
        maxColor: DEFAULT_COLOR,
      };
    case 'max':
      return {
        ...options,
        minColor: DEFAULT_COLOR,
        maxColor: format.max || defaultMaxColor,
      };
  }
};

export const createValueColorOptions = (
  format?: PanelColorFormat,
  themeSettings?: CompleteThemeSettings,
): DataColorOptions | undefined => {
  if (format === undefined) {
    return undefined;
  }

  switch (format.type) {
    case 'color':
      return {
        type: 'uniform',
        color: format.color || getDefaultColor(themeSettings, format.colorIndex),
      };
    case 'range':
      return createRangeValueColorOptions(format, themeSettings);
    case 'condition':
      return {
        type: 'conditional',
        conditions: format.conditions.filter(
          (condition): condition is PanelColorFormatConditionSimple =>
            typeof condition.expression === 'string',
        ),
        defaultColor: getDefaultColor(themeSettings),
      };
    default:
      return getUniformColorOptionsFromString(getDefaultColor(themeSettings));
  }
};

export const createValueToColorMap = (membersFormat: PanelMembersFormat): ValueToColorMap => {
  return Object.entries(membersFormat).reduce((acc, [member, { color }]) => {
    acc[member] = color;
    return acc;
  }, {});
};

export const createValueToColorMultiColumnsMap = (
  items: PanelItem[],
): MultiColumnValueToColorMap => {
  return items.reduce((map: MultiColumnValueToColorMap, item: PanelItem) => {
    if (item.format?.members) {
      map[normalizeName(item.jaql.title)] = createValueToColorMap(item.format?.members);
    }
    return map;
  }, {});
};
