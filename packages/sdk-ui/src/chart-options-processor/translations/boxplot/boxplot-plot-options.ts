import type { DataLabelsOptions } from '@sisense/sisense-charts';
import { PlotOptions } from '../../chart-options-service.js';
import { ValueLabel } from '../value-label-section.js';
import {
  defaultConfig,
  applyFormatPlainText,
  NumberFormatConfig,
} from '../number-format-config.js';
import { InternalSeries } from '../tooltip-utils.js';

const createValueLabelFormatter = (numberFormatConfig: NumberFormatConfig = defaultConfig) => {
  return function (this: InternalSeries, _options?: DataLabelsOptions, valueProp?: string) {
    const value = valueProp ? (this.point[valueProp] as number) : undefined;
    if (value === undefined || isNaN(value)) {
      return '';
    }
    return applyFormatPlainText(numberFormatConfig, value);
  };
};

export const getBoxplotPlotOptions = (valueLabel: ValueLabel): PlotOptions => {
  return {
    series: {
      dataLabels: {
        enabled: !!valueLabel,
        style: {
          fontFamily: 'Open Sans',
          fontSize: '13px',
          fontWeight: 'normal',
          color: '#001b4f',
        },
        rotation: 0,
        align: 'center',
        formatter: createValueLabelFormatter(),
      },
      grouping: false,
      stickyTracking: false,
      turboThreshold: 0,
      boostThreshold: 0,
      softThreshold: false,
    },
    boxplot: {
      dataLabels: {
        enabled: !!valueLabel,
        style: {
          fontFamily: 'Open Sans',
          fontSize: '13px',
          fontWeight: 'normal',
          color: '#001b4f',
        },
        rotation: 0,
        align: 'center',
        formatter: createValueLabelFormatter(),
      },
    },
    scatter: {
      dataLabels: {
        enabled: false,
      },
    },
  };
};
