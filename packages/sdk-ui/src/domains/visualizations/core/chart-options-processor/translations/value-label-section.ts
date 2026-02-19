/* eslint-disable max-params */
import type { DataLabelsOptions } from '@sisense/sisense-charts';

import { HighchartsGradientColorObject } from '@/shared/utils/gradient';
import { NumberFormatConfig, SeriesLabels } from '@/types';

import { prepareDataLabelsOptions } from '../series-labels.js';
import { AxisOrientation } from './axis-section.js';
import { PolarType } from './design-options.js';
import { applyFormatPlainText, getCompleteNumberFormatConfig } from './number-format-config.js';
import { HighchartsDataPointContext } from './tooltip-utils.js';
import { TextStyle } from './types.js';

export type ValueLabelOptions = {
  enabled?: boolean;
  rotation?: number;
  showValue?: boolean;
  showPercentage?: boolean;
};

export type RotationType = 'horizontal' | 'diagonal' | 'vertical';

export type DataLabelsSettings = {
  enabled?: boolean;
  align?: string;
  inside?: boolean;
  crop?: boolean;
  rotation?: number;
  y?: number;
  x?: number;
  style?: TextStyle;
  overflow?: string;
  allowOverlap?: boolean;
  verticalAlign?: 'bottom' | 'middle' | 'top';
  padding?: number;
  color?: 'contrast' | string;
  backgroundColor?: string | HighchartsGradientColorObject;
  borderColor?: string | HighchartsGradientColorObject;
  borderRadius?: number;
  borderWidth?: number;
  animation?: {
    defer?: boolean | number;
  };
  types?: {
    count: boolean;
    relative: boolean;
    totals: boolean;
  };
  formatter?: (
    this: HighchartsDataPointContext,
    options?: DataLabelsOptions,
    valuePropName?: string,
  ) => string;
};

const defaultDataLabelsSettings: DataLabelsSettings = {
  enabled: true,
  types: {
    count: false,
    relative: true,
    totals: true,
  },
};

export const createDataLabelsFormatter = (
  numberFormatConfig?: NumberFormatConfig,
  options?: SeriesLabels,
) => {
  return function (this: HighchartsDataPointContext) {
    const isDummyPointBetweenCategoriesGroups = this.y === 0 && this.x === ' ';
    if (this.y === undefined || isNaN(this.y) || isDummyPointBetweenCategoriesGroups) {
      return '';
    }

    let labelText = '';
    const showValue = options?.showValue ?? true;
    if (showValue) {
      labelText += applyFormatPlainText(getCompleteNumberFormatConfig(numberFormatConfig), this.y);
    }
    if (showValue && options?.showPercentage && this.percentage !== undefined) {
      labelText += ' / ';
    }
    if (options?.showPercentage && this.percentage !== undefined) {
      labelText += `${Math.round(this.percentage)}%`;
    }

    return `${options?.prefix ?? ''}${labelText}${options?.suffix ?? ''}`;
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

export const getDataLabelsSettings = (
  xAxisOrientation: AxisOrientation,
  seriesLabels?: SeriesLabels,
  inside?: boolean,
): DataLabelsSettings => {
  if (!seriesLabels?.enabled) {
    return { enabled: false };
  }

  const settings: DataLabelsSettings = {
    ...defaultDataLabelsSettings,
    align: 'center',
    verticalAlign: 'middle',
    rotation: seriesLabels.rotation ?? 0,
    ...prepareDataLabelsOptions(seriesLabels),
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
      ...prepareDataLabelsOptions(seriesLabels),
    };
  } else {
    switch (rotationType) {
      case 'horizontal':
        return {
          ...settings,
          verticalAlign: 'bottom',
          padding: 5,
          ...prepareDataLabelsOptions(seriesLabels),
        };
      case 'diagonal':
        return {
          ...settings,
          align: 'left',
          y: -10,
          x: -2,
          ...prepareDataLabelsOptions(seriesLabels),
        };
      case 'vertical':
        return {
          ...settings,
          align: 'left',
          y: -10,
          ...prepareDataLabelsOptions(seriesLabels),
        };
    }
  }
};

export const getPolarDataLabelsSettings = (
  seriesLabels: SeriesLabels | undefined,
  polarType: PolarType,
): DataLabelsSettings => {
  if (!seriesLabels) {
    return { enabled: false };
  }
  const rotation = seriesLabels.rotation ?? 0;
  const enabled = seriesLabels.enabled ?? defaultDataLabelsSettings.enabled;
  return {
    ...defaultDataLabelsSettings,
    verticalAlign: polarType === 'line' ? 'bottom' : 'middle',
    rotation: rotation,
    align: getRotationType(rotation) === 'vertical' ? 'left' : 'center',
    padding: 5,
    ...prepareDataLabelsOptions({ ...seriesLabels, enabled }),
  };
};
