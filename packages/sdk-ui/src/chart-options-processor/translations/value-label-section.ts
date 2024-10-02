/* eslint-disable max-params */
import type { DataLabelsOptions } from '@sisense/sisense-charts';
import { Style } from '../chart-options-service';
import { applyFormatPlainText, getCompleteNumberFormatConfig } from './number-format-config';
import { AxisOrientation } from './axis-section';
import { InternalSeries } from './tooltip-utils';
import { PolarType } from './design-options';
import { NumberFormatConfig } from '@/types';

export type ValueLabelOptions = {
  enabled?: boolean;
  rotation?: number;
};

export type RotationType = 'horizontal' | 'diagonal' | 'vertical';

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

export const createValueLabelFormatter = (numberFormatConfig?: NumberFormatConfig) => {
  return function (this: InternalSeries) {
    if (this.y === undefined || isNaN(this.y)) {
      return '';
    }
    return applyFormatPlainText(getCompleteNumberFormatConfig(numberFormatConfig), this.y);
  };
};

export const getRotationType = (rotation: number): RotationType => {
  const normalizedRotation = Math.abs(rotation) % 180;
  if (normalizedRotation < 20) {
    return 'horizontal';
  } else if (normalizedRotation < 60) {
    return 'diagonal';
  } else if (normalizedRotation < 120) {
    return 'vertical';
  } else if (normalizedRotation < 160) {
    return 'diagonal';
  } else {
    return 'horizontal';
  }
};

/* eslint-disable-next-line max-params */
export const getValueLabelSettings = (
  xAxisOrientation: AxisOrientation,
  valueLabel: ValueLabelOptions,
  inside?: boolean,
): ValueLabelSettings => {
  if (!valueLabel.enabled) {
    return { enabled: false };
  }

  const settings: ValueLabelSettings = {
    ...defaultValueLabelSettings,
    align: 'center',
    verticalAlign: 'middle',
    rotation: valueLabel.rotation ?? 0,
  };

  if (inside) {
    return settings;
  }

  const rotationType = getRotationType(settings.rotation!);

  if (xAxisOrientation === 'vertical') {
    // Bar chart's value label has different settings from other charts,
    // because it's x-axis is vertical and other charts it's horizontal
    return {
      ...settings,
      align: rotationType === 'horizontal' ? 'left' : 'center',
    };
  } else {
    switch (rotationType) {
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
  valueLabel: ValueLabelOptions,
  polarType: PolarType,
): ValueLabelSettings => {
  if (!valueLabel) {
    return { enabled: false };
  }
  const rotation = valueLabel.rotation ?? 0;
  const enabled = valueLabel.enabled ?? defaultValueLabelSettings.enabled;
  return {
    ...defaultValueLabelSettings,
    verticalAlign: polarType === 'line' ? 'bottom' : 'middle',
    rotation: rotation,
    enabled: enabled,
    align: getRotationType(rotation) === 'vertical' ? 'left' : 'center',
    padding: 5,
  };
};
