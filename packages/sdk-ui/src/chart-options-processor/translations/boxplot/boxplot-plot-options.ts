import type { DataLabelsOptions } from '@sisense/sisense-charts';
import { PlotOptions } from '../../chart-options-service.js';
import { applyFormatPlainText, getCompleteNumberFormatConfig } from '../number-format-config.js';
import { HighchartsDataPointContext } from '../tooltip-utils.js';
import { SeriesLabels } from '@/types.js';
import { prepareDataLabelsOptions } from '@/chart-options-processor/series-labels.js';

const createDataLabelsFormatter = (seriesLabels: SeriesLabels | undefined) => {
  return function (
    this: HighchartsDataPointContext,
    _options?: DataLabelsOptions,
    valueProp?: string,
  ) {
    const value = valueProp ? (this.point[valueProp] as number) : undefined;
    if (value === undefined || isNaN(value)) {
      return '';
    }
    return `${seriesLabels?.prefix ?? ''}${applyFormatPlainText(
      getCompleteNumberFormatConfig(),
      value,
    )}${seriesLabels?.suffix ?? ''}`;
  };
};

export const getBoxplotPlotOptions = (seriesLabels: SeriesLabels | undefined): PlotOptions => {
  const dataLabelsFromDesignOptions = prepareDataLabelsOptions(seriesLabels);
  return {
    series: {
      dataLabels: {
        rotation: seriesLabels?.rotation ?? 0,
        align: 'center',
        ...dataLabelsFromDesignOptions,
        style: {
          fontSize: '13px',
          fontWeight: 'normal',
          ...dataLabelsFromDesignOptions.style,
        },
        formatter: createDataLabelsFormatter(seriesLabels),
      },
      grouping: false,
      stickyTracking: false,
      turboThreshold: 0,
      boostThreshold: 0,
      softThreshold: false,
    },
    boxplot: {
      dataLabels: {
        rotation: seriesLabels?.rotation ?? 0,
        align: 'center',
        ...dataLabelsFromDesignOptions,
        style: {
          fontSize: '13px',
          fontWeight: 'normal',
          ...dataLabelsFromDesignOptions.style,
        },
        formatter: createDataLabelsFormatter(seriesLabels),
      },
    },
    scatter: {
      dataLabels: {
        enabled: false,
      },
    },
  };
};
