/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */
/* eslint-disable max-params */
import type { DataLabelsOptions } from '@sisense/sisense-charts';
import { Style } from '../chart-options-service';
import { defaultConfig, applyFormatPlainText, NumberFormatConfig } from './number-format-config';
import { AxisOrientation } from './axis-section';
import { InternalSeries } from './tooltip-utils';
import { PolarType } from './design-options';

export type ValueLabel = 'horizontal' | 'diagonal' | 'vertical' | null;

export type ValueLabelSettings = {
  enabled?: boolean;
  align?: string;
  crop?: boolean;
  rotation?: number;
  y?: number;
  x?: number;
  style?: Style;
  overflow?: string;
  allowOverlap?: boolean;
  verticalAlign?: 'bottom' | 'middle' | 'top';
  padding?: number;
  types?: {
    count: boolean;
    relative: boolean;
    totals: boolean;
  };
  formatter?: (this: InternalSeries, options?: DataLabelsOptions, valuePropName?: string) => string;
};

const defaultValueLabelSettings: ValueLabelSettings = {
  enabled: true,
  types: {
    count: false,
    relative: true,
    totals: true,
  },
};

export const createValueLabelFormatter = (
  numberFormatConfig: NumberFormatConfig = defaultConfig,
) => {
  return function (this: InternalSeries) {
    if (this.y === undefined || isNaN(this.y)) {
      return '';
    }
    return applyFormatPlainText(numberFormatConfig, this.y);
  };
};

const getRotation = (valueLabel: ValueLabel) => {
  switch (valueLabel) {
    case 'horizontal':
      return 0;
    case 'diagonal':
      return -45;
    case 'vertical':
      return -90;
    default:
      return 0;
  }
};

/* eslint-disable-next-line max-params */
export const getValueLabelSettings = (
  xAxisOrientation: AxisOrientation,
  valueLabel: ValueLabel,
  inside?: boolean,
): ValueLabelSettings => {
  if (!valueLabel) {
    return { enabled: false };
  }

  const settings: ValueLabelSettings = {
    ...defaultValueLabelSettings,
    align: 'center',
    verticalAlign: 'middle',
    rotation: getRotation(valueLabel),
  };

  if (inside) {
    return settings;
  }

  if (xAxisOrientation === 'vertical') {
    // Bar chart's value label has different settings from other charts,
    // because it's x-axis is vertical and other charts it's horizontal
    return {
      ...settings,
      align: valueLabel === 'horizontal' ? 'left' : 'center',
    };
  } else {
    switch (valueLabel) {
      case 'horizontal':
        return {
          ...settings,
          verticalAlign: 'bottom',
          padding: 5,
        };
      case 'diagonal':
        return {
          ...settings,
          align: 'left',
          y: -10,
          x: -2,
        };
      case 'vertical':
        return {
          ...settings,
          align: 'left',
          y: -10,
        };
    }
  }
};

export const getPolarValueLabelSettings = (
  valueLabel: ValueLabel,
  polarType: PolarType,
): ValueLabelSettings => {
  if (!valueLabel) {
    return { enabled: false };
  }

  return {
    ...defaultValueLabelSettings,
    verticalAlign: polarType === 'line' ? 'bottom' : 'middle',
    rotation: getRotation(valueLabel),
    align: valueLabel == 'vertical' ? 'left' : 'center',
    padding: 5,
  };
};
