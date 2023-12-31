/* eslint-disable max-lines-per-function */
import { isValue, ScatterChartDataOptionsInternal } from '../../chart-data-options/types';
import { PlotOptions } from '../chart-options-service';
import { ValueLabel, ValueLabelSettings } from './value-label-section';
import { ScatterChartDesignOptions } from './design-options';
import { InternalSeries } from './tooltip-utils';
import { ScatterCustomPointOptions } from './scatter-tooltip';
import {
  applyFormatPlainText,
  defaultConfig as defaultNumberFormattingConfig,
} from './number-format-config';

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

export type ScatterChartInternalSeries = InternalSeries & {
  point: {
    custom?: ScatterCustomPointOptions;
  };
};

const getScatterValueLabelSettings = (
  valueLabel: ValueLabel,
  chartDataOptions: ScatterChartDataOptionsInternal,
): ValueLabelSettings => {
  if (!valueLabel) {
    return { enabled: false };
  }

  let settings: ValueLabelSettings = {
    enabled: true,
    align: 'center',
    verticalAlign: 'middle',
    types: {
      count: false,
      relative: true,
      totals: true,
    },
  };

  switch (valueLabel) {
    case 'horizontal':
      settings = {
        ...settings,
        y: -1,
      };
      break;
    case 'diagonal':
      settings = {
        ...settings,
        rotation: -45,
      };
      break;
    case 'vertical':
      settings = {
        ...settings,
        rotation: -90,
      };
      break;
  }

  settings.formatter = function () {
    const that = this as ScatterChartInternalSeries;
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
    const usedDataItem = dataItemsByUsagePriority.find((dataItem) => dataItem && isValue(dataItem));
    const pointValueKey = Object.entries(pointValueKeyToDataItemMapping).find(
      ([, dataItem]) => dataItem === usedDataItem,
    )?.[0] as keyof ScatterCustomPointOptions;

    const pointValue = that.point.custom?.[pointValueKey] || '';

    if (isNaN(parseFloat(pointValue))) {
      return pointValue;
    }
    const numberFormatConfig = usedDataItem?.numberFormatConfig ?? defaultNumberFormattingConfig;
    return applyFormatPlainText(numberFormatConfig, parseFloat(pointValue));
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
      dataLabels: getScatterValueLabelSettings(chartDesignOptions.valueLabel, dataOptions),
      stickyTracking: false,
      turboThreshold: 0,
    },
  };
};
