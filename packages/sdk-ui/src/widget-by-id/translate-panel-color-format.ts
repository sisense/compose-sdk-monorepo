/* eslint-disable no-case-declarations */
import { normalizeName } from '@sisense/sdk-data';

import { DEFAULT_COLOR } from '../chart-data-options/coloring/consts.js';
import { getUniformColorOptionsFromString } from '../chart-data-options/coloring/uniform-coloring.js';
import { getPaletteColor } from '../chart-data-options/coloring/utils.js';
import {
  ConditionalDataColorOptions,
  DataColorOptions,
  RangeDataColorOptions,
  UniformDataColorOptions,
} from '../chart-data/data-coloring/index.js';
import { Color, MultiColumnValueToColorMap, ValueToColorMap } from '../types.js';
import { scaleBrightness, toGray } from '../utils/color/index.js';
import {
  PanelColorFormat,
  PanelColorFormatConditionSimple,
  PanelColorFormatRange,
  PanelItem,
  PanelMembersFormat,
} from './types.js';

/**
 * Infers the range mode based on the provided colors and palette
 */
const inferRangeMode = (
  options: RangeDataColorOptions,
  paletteColors?: Color[],
): PanelColorFormatRange['rangeMode'] => {
  const baseColor = getPaletteColor(paletteColors, 0);
  const autoMinColor = toGray(baseColor);
  const autoMaxColor = scaleBrightness(baseColor, -0.2);

  const isAutoMin = options.minColor === DEFAULT_COLOR || options.minColor === autoMinColor;
  const isAutoMax = options.maxColor === DEFAULT_COLOR || options.maxColor === autoMaxColor;

  if (isAutoMin && isAutoMax) return 'auto';
  if (isAutoMin) return 'max';
  if (isAutoMax) return 'min';
  return 'both';
};

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
        ...(format.colorIndex !== undefined && { colorIndex: format.colorIndex }),
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
  return Object.entries(membersFormat).reduce<ValueToColorMap>((acc, [member, { color }]) => {
    acc[member] = color;
    return acc;
  }, {});
};

/**
 * Creates a PanelColorFormat from DataColorOptions
 *
 * TODO: basic use cases done for the studio assistant, need more testing with real Fusion widgets
 *
 * @param options The DataColorOptions to convert
 * @returns The corresponding PanelColorFormat
 */
export const createPanelColorFormat = (
  options: DataColorOptions | undefined,
  paletteColors?: Color[],
): PanelColorFormat | undefined => {
  if (options === undefined) {
    return undefined;
  }

  const defaultColor = getPaletteColor(paletteColors, 0);

  if (typeof options === 'string') {
    return {
      type: 'color',
      color: options,
    };
  }

  switch (options.type) {
    case 'uniform':
      return {
        type: 'color',
        color: options.color,
        ...(options.colorIndex !== undefined && { colorIndex: options.colorIndex }),
        isHandPickedColor: options.colorIndex === undefined,
      };
    case 'range': {
      const baseColor = getPaletteColor(paletteColors, 0);
      const autoMinColor = toGray(baseColor);
      const autoMaxColor = scaleBrightness(baseColor, -0.2);
      const rangeMode = inferRangeMode(options, paletteColors);

      const rangeFormat: PanelColorFormatRange = {
        type: 'range',
        steps: options.steps || 5,
        rangeMode,
        min: rangeMode === 'max' ? autoMinColor : options.minColor,
        max: rangeMode === 'min' ? autoMaxColor : options.maxColor,
      };

      if (rangeFormat.rangeMode !== 'auto') {
        if (options.minValue !== undefined) {
          rangeFormat.minvalue = options.minValue.toString();
        }
        if (options.midValue !== undefined) {
          rangeFormat.midvalue = options.midValue.toString();
        }
        if (options.maxValue !== undefined) {
          rangeFormat.maxvalue = options.maxValue.toString();
        }
      }

      return rangeFormat;
    }
    case 'conditional':
      return {
        type: 'condition',
        conditions: (options.conditions || [])
          .filter((condition) => typeof condition.expression === 'string')
          .map(({ color, expression, operator }) => ({
            color: color || defaultColor,
            expression,
            operator,
          })),
      };
    default:
      return {
        type: 'color',
        color: defaultColor,
        colorIndex: 0,
      };
  }
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
