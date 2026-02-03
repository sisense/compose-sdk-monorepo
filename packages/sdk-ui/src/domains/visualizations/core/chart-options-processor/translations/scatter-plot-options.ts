import { isMeasureColumn } from '@/domains/visualizations/core/chart-data-options/utils';
import { SeriesLabels } from '@/types';

import { ScatterChartDataOptionsInternal } from '../../chart-data-options/types';
import { PlotOptions } from '../chart-options-service.js';
import { prepareDataLabelsOptions } from '../series-labels.js';
import { ScatterChartDesignOptions } from './design-options.js';
import { applyFormatPlainText, getCompleteNumberFormatConfig } from './number-format-config.js';
import { ScatterCustomPointOptions } from './scatter-tooltip.js';
import { HighchartsDataPointContext } from './tooltip-utils.js';
import { DataLabelsSettings, getRotationType } from './value-label-section.js';

// TODO write API docs
export type ScatterMarkerSize = {
  scatterDefaultSize: number;
  scatterBubbleMinSize: number;
  scatterBubbleMaxSize: number;
};

export type ScatterBubbleOptions = {
  animation: boolean;
  maxSize: number;
  minSize: number;
};

export const defaultScatterMarkerSize: ScatterMarkerSize = {
  scatterDefaultSize: 10,
  scatterBubbleMinSize: 12,
  scatterBubbleMaxSize: 48,
};

export type ScatterChartHighchartsDataPointContext = HighchartsDataPointContext & {
  point: {
    custom?: ScatterCustomPointOptions;
  };
};

const getScatterDataLabelsSettings = (
  seriesLabels: SeriesLabels | undefined,
  chartDataOptions: ScatterChartDataOptionsInternal,
): DataLabelsSettings => {
  if (!seriesLabels?.enabled) {
    return { enabled: false };
  }
  const translatedDataLabelsSettings = prepareDataLabelsOptions(seriesLabels);
  const rotation = seriesLabels.rotation ?? 0;
  const settings: DataLabelsSettings = {
    align: 'center',
    verticalAlign: 'middle',
    types: {
      count: false,
      relative: true,
      totals: true,
    },
    rotation,
    ...(getRotationType(rotation) === 'horizontal' ? { y: -1 } : null),
    ...translatedDataLabelsSettings,
    style: {
      fontWeight: '',
      textOutline: '',
      ...translatedDataLabelsSettings.style,
    },
  };

  settings.formatter = function () {
    const that = this as ScatterChartHighchartsDataPointContext;
    const pointValueKeyToDataItemMapping = {
      maskedY: chartDataOptions.y,
      maskedX: chartDataOptions.x,
      maskedSize: chartDataOptions.size,
      maskedBreakByColor: chartDataOptions.breakByColor,
    };
    const dataItemsByUsagePriority = [
      chartDataOptions.y,
      chartDataOptions.x,
      chartDataOptions.size,
      chartDataOptions.breakByColor,
    ];
    const usedDataItem = dataItemsByUsagePriority.find(
      (dataItem) => dataItem && isMeasureColumn(dataItem),
    );
    const pointValueKey = Object.entries(pointValueKeyToDataItemMapping).find(
      ([, dataItem]) => dataItem === usedDataItem,
    )?.[0] as keyof ScatterCustomPointOptions;

    const pointValue = that.point.custom?.[pointValueKey] || '';

    if (isNaN(parseFloat(pointValue))) {
      return pointValue;
    }
    const numberFormatConfig = getCompleteNumberFormatConfig(usedDataItem?.numberFormatConfig);
    return `${seriesLabels?.prefix ?? ''}${applyFormatPlainText(
      numberFormatConfig,
      parseFloat(pointValue),
    )}${seriesLabels?.suffix ?? ''}`;
  };

  return settings;
};

type MarkerSizeSettings = Pick<ScatterBubbleOptions, 'minSize' | 'maxSize'>;

const getScatterMarkerSizeSettings = (
  markerSize: ScatterMarkerSize,
  isRangeSize: boolean,
): MarkerSizeSettings => {
  return {
    minSize: isRangeSize ? markerSize.scatterBubbleMinSize : markerSize.scatterDefaultSize,
    maxSize: isRangeSize ? markerSize.scatterBubbleMaxSize : markerSize.scatterDefaultSize,
  };
};

export const getScatterPlotOptions = (
  chartDesignOptions: ScatterChartDesignOptions,
  dataOptions: ScatterChartDataOptionsInternal,
): PlotOptions => {
  const isRangeSize = !!dataOptions.size;

  return {
    bubble: {
      animation: false,
      ...getScatterMarkerSizeSettings(
        chartDesignOptions.markerSize ?? defaultScatterMarkerSize,
        isRangeSize,
      ),
    },
    series: {
      allowPointSelect: false,
      boostThreshold: 0,
      dataLabels: getScatterDataLabelsSettings(chartDesignOptions.seriesLabels, dataOptions),
      stickyTracking: false,
      turboThreshold: 0,
    },
  };
};
