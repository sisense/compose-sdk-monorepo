/* eslint-disable no-case-declarations */
import { DEFAULT_COLOR } from '../chart-data-options/coloring/consts.js';
import { getUniformColorOptionsFromString } from '../chart-data-options/coloring/uniform-coloring.js';
import {
  ConditionalDataColorOptions,
  DataColorOptions,
  RangeDataColorOptions,
  UniformDataColorOptions,
} from '../chart-data/data-coloring/index.js';
import { ValueToColorMap, MultiColumnValueToColorMap, Color } from '../types.js';
import { scaleBrightness, toGray } from '../utils/color/index.js';
import {
  PanelColorFormat,
  PanelColorFormatConditionSimple,
  PanelColorFormatRange,
  PanelItem,
  PanelMembersFormat,
} from './types.js';
import { normalizeName } from '@sisense/sdk-data';
import { getPaletteColor } from '../chart-data-options/coloring/utils.js';

const createRangeDataColorOptions = (
  format: PanelColorFormatRange,
  paletteColors?: Color[],
): RangeDataColorOptions => {
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

  const baseColor = getPaletteColor(paletteColors, 0);
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
  customPaletteColors?: Color[],
): DataColorOptions | undefined => {
  if (format === undefined) {
    return undefined;
  }

  switch (format.type) {
    case 'color':
      return {
        type: 'uniform',
        color: format.color || getPaletteColor(customPaletteColors, format.colorIndex || 0),
      } as UniformDataColorOptions;
    case 'range':
      return createRangeDataColorOptions(format, customPaletteColors);
    case 'condition':
      return {
        type: 'conditional',
        conditions: format.conditions
          .filter(
            (condition): condition is PanelColorFormatConditionSimple =>
              typeof condition.expression === 'string',
          )
          .map(({ color, expression, operator }) => ({
            color,
            expression,
            operator,
          })),
        defaultColor: getPaletteColor(customPaletteColors, 0),
      } as ConditionalDataColorOptions;
    default:
      return getUniformColorOptionsFromString(getPaletteColor(customPaletteColors, 0));
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
