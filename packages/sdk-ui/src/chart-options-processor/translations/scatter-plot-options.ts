import { ScatterChartDataOptionsInternal } from '../../chart-data-options/types';
import { PlotOptions } from '../chart-options-service';
import { getRotationType, DataLabelsSettings } from './value-label-section';
import { ScatterChartDesignOptions } from './design-options';
import { HighchartsDataPointContext } from './tooltip-utils';
import { ScatterCustomPointOptions } from './scatter-tooltip';
import { applyFormatPlainText, getCompleteNumberFormatConfig } from './number-format-config';
import { isMeasureColumn } from '@/chart-data-options/utils';
import { SeriesLabels } from '@/types';

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

  const rotation = seriesLabels.rotation ?? 0;
  const settings: DataLabelsSettings = {
    enabled: true,
    align: 'center',
    verticalAlign: 'middle',
    types: {
      count: false,
      relative: true,
      totals: true,
    },
    rotation,
    ...(getRotationType(rotation) === 'horizontal' ? { y: -1 } : null),
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
    return applyFormatPlainText(numberFormatConfig, parseFloat(pointValue));
  };

  settings.style = {
    ...settings.style,
    fontWeight: '',
    textOutline: '',
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
