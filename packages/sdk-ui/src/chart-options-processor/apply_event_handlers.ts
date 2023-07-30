/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-use-before-define */
import merge from 'deepmerge';
import {
  DataPoint,
  HighchartsPointerEvent,
  HighchartsSelectEvent,
  HighchartsPoint,
  HighchartsSelectEventAxis,
} from '../types';
import { HighchartsOptionsInternal } from '../chart-options-processor/chart_options_service';

/** Click handler for when multiple data points are selected. */
export type DataPointsEventHandler = (
  /** Data points that were selected */
  points: DataPoint[],
  /** Native MouseEvent */
  nativeEvent: MouseEvent,
) => void;

/** Click handler for when a data point is clicked. One parameter, `DataPoint`, is passed to the function. */
export type DataPointEventHandler = (
  /** Data point that was clicked */
  point: DataPoint,
  /** Native PointerEvent */
  nativeEvent: PointerEvent,
) => void;

type HighchartsEventOptions = {
  chart: { zoomType?: string; events: { selection?: (ev: HighchartsSelectEvent) => void } };
  plotOptions: {
    series: {
      point: {
        events: {
          click?: (ev: HighchartsPointerEvent) => void;
          contextmenu?: (ev: HighchartsPointerEvent) => void;
        };
      };
    };
  };
};

export const applyEventHandlersToChart = (
  chartOptions: HighchartsOptionsInternal,
  {
    onDataPointClick,
    onDataPointContextMenu,
    onDataPointsSelected,
  }: {
    onDataPointClick?: DataPointEventHandler;
    onDataPointContextMenu?: DataPointEventHandler;
    onDataPointsSelected?: DataPointsEventHandler;
  } = {},
): HighchartsOptionsInternal => {
  const eventOptions: HighchartsEventOptions = {
    chart: { events: {} },
    plotOptions: { series: { point: { events: {} } } },
  };

  if (onDataPointsSelected) {
    eventOptions.chart.zoomType = 'x';
    eventOptions.chart.events.selection = (nativeEvent: HighchartsSelectEvent) => {
      nativeEvent.preventDefault();
      const { xAxis, originalEvent } = nativeEvent;
      onDataPointsSelected(getSelections(xAxis[0]), originalEvent);
    };
  }

  if (onDataPointClick) {
    eventOptions.plotOptions.series.point.events.click = (nativeEvent: HighchartsPointerEvent) => {
      onDataPointClick?.(getDataPoint(nativeEvent.point), nativeEvent);
    };
  }

  if (onDataPointContextMenu) {
    eventOptions.plotOptions.series.point.events.contextmenu = (
      nativeEvent: HighchartsPointerEvent,
    ) => {
      nativeEvent.preventDefault();
      onDataPointContextMenu(getDataPoint(nativeEvent.point), nativeEvent);
    };
  }

  return merge(chartOptions, eventOptions);
};

const getDataPoint = (point: HighchartsPoint): DataPoint => {
  const value = point.custom.rawValue;
  const categoryValue = point.custom.xValue?.[0];
  const seriesValue = point.series.options.custom?.rawValue?.[0];
  const categoryDisplayValue = point.category;
  return {
    value,
    categoryValue,
    seriesValue,
    categoryDisplayValue,
  };
};

const getSelections = ({ min, max, axis }: HighchartsSelectEventAxis): DataPoint[] => {
  return axis.series[0].points.filter(({ x }) => x >= min && x <= max).map(getDataPoint);
};
