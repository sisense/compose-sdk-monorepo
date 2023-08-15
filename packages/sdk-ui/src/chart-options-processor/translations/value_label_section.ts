/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */
import { Style } from '../chart_options_service';
import { CartesianChartDataOptionsInternal } from '../../chart-data-options/types';
import { defaultConfig, applyFormatPlainText } from './number_format_config';
import { AxisOrientation } from './axis_section';
import { InternalSeries } from '../tooltip';
import { PolarType } from './design_options';

export type ValueLabel = 'horizontal' | 'diagonal' | 'vertical' | null;

export type ValueLabelSettings = {
  enabled?: boolean;
  align?: string;
  crop?: boolean;
  rotation?: number;
  y?: number;
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
  formatter?: (this: InternalSeries) => string;
};

const defaultValueLabelSettings: ValueLabelSettings = {
  enabled: true,
  types: {
    count: false,
    relative: true,
    totals: true,
  },
};

const createValueLabelFormatter = (chartDataOptions: CartesianChartDataOptionsInternal) => {
  return function (this: InternalSeries) {
    if (this.y === undefined || isNaN(this.y)) {
      return '';
    }
    const numberFormatConfig =
      chartDataOptions?.y?.find((y) => y.name === this.series.name)?.numberFormatConfig ??
      defaultConfig;
    return applyFormatPlainText(numberFormatConfig, this.y);
  };
};

export const getValueLabelSettings = (
  xAxisOrientation: AxisOrientation,
  valueLabel: ValueLabel,
  chartDataOptions: CartesianChartDataOptionsInternal,
): ValueLabelSettings => {
  if (!valueLabel) {
    return { enabled: false };
  }

  const settings: ValueLabelSettings = {
    ...defaultValueLabelSettings,
    formatter: createValueLabelFormatter(chartDataOptions),
  };

  if (xAxisOrientation === 'vertical') {
    // Bar chart's value label has different settings from other charts,
    // because it's x-axis is vertical and other charts it's horizontal
    switch (valueLabel) {
      case 'horizontal':
        return {
          ...settings,
          align: 'left',
          verticalAlign: 'middle',
          padding: 5,
        };
      case 'diagonal':
        return {
          ...settings,
          align: 'top',
          rotation: -45,
          y: -15,
          verticalAlign: 'bottom',
        };
      case 'vertical':
        return {
          ...settings,
          align: 'top',
          rotation: -90,
          y: -10,
          verticalAlign: 'bottom',
        };
    }
  } else {
    switch (valueLabel) {
      case 'horizontal':
        return {
          ...settings,
          align: 'center',
          verticalAlign: 'bottom',
          padding: 5,
        };
      case 'diagonal':
        return {
          ...settings,
          align: 'top',
          rotation: -45,
          y: -15,
          verticalAlign: 'middle',
        };
      case 'vertical':
        return {
          ...settings,
          align: 'top',
          rotation: -90,
          y: -10,
          verticalAlign: 'middle',
        };
    }
  }
};

export const getPolarValueLabelSettings = (
  valueLabel: ValueLabel,
  chartDataOptions: CartesianChartDataOptionsInternal,
  polarType: PolarType,
): ValueLabelSettings => {
  if (!valueLabel) {
    return { enabled: false };
  }

  const settings: ValueLabelSettings = {
    ...defaultValueLabelSettings,
    verticalAlign: polarType === 'line' ? 'bottom' : 'middle',
    padding: 5,
    formatter: createValueLabelFormatter(chartDataOptions),
  };

  switch (valueLabel) {
    case 'horizontal':
      return {
        ...settings,
        align: 'center',
      };
    case 'diagonal':
      return {
        ...settings,
        align: 'center',
        rotation: -45,
      };
    case 'vertical':
      return {
        ...settings,
        align: 'left',
        rotation: -90,
      };
  }
};
