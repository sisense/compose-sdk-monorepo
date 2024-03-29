import type { DataLabelsOptions } from '@sisense/sisense-charts';
import { PlotOptions } from '../../chart-options-service.js';
import { applyFormatPlainText, getCompleteNumberFormatConfig } from '../number-format-config.js';
import { ValueLabelOptions } from '../value-label-section.js';
import { InternalSeries } from '../tooltip-utils.js';
import { NumberFormatConfig } from '@/types.js';

const createValueLabelFormatter = (numberFormatConfig?: NumberFormatConfig) => {
  return function (this: InternalSeries, _options?: DataLabelsOptions, valueProp?: string) {
    const value = valueProp ? (this.point[valueProp] as number) : undefined;
    if (value === undefined || isNaN(value)) {
      return '';
    }
    return applyFormatPlainText(getCompleteNumberFormatConfig(numberFormatConfig), value);
  };
};

export const getBoxplotPlotOptions = (valueLabel: ValueLabelOptions): PlotOptions => {
  return {
    series: {
      dataLabels: {
        enabled: valueLabel.enabled ?? false,
        style: {
          fontFamily: 'Open Sans',
          fontSize: '13px',
          fontWeight: 'normal',
          color: '#001b4f',
        },
        rotation: valueLabel.rotation ?? 0,
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
        enabled: valueLabel.enabled ?? false,
        style: {
          fontFamily: 'Open Sans',
          fontSize: '13px',
          fontWeight: 'normal',
          color: '#001b4f',
        },
        rotation: valueLabel.rotation ?? 0,
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
