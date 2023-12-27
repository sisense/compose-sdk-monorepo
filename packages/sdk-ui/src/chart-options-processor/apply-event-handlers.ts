/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-use-before-define */
import merge from 'deepmerge';
import {
  DataPoint,
  HighchartsPointerEvent,
  HighchartsSelectEvent,
  HighchartsPoint,
  HighchartsSelectEventAxis,
  ScatterDataPoint,
  DataPoints,
  BoxplotDataPoint,
} from '../types';
import { HighchartsOptionsInternal } from '../chart-options-processor/chart-options-service';

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

/** Click handler for when a scatter data point is clicked */
export type ScatterDataPointEventHandler = (
  /** Data point that was clicked */
  point: ScatterDataPoint,
  /** Native PointerEvent */
  nativeEvent: PointerEvent,
) => void;

/** Click handler for when multiple scatter data points are selected. */
export type ScatterDataPointsEventHandler = (
  /** Data points that were selected */
  points: ScatterDataPoint[],
  /** Native MouseEvent */
  nativeEvent: MouseEvent,
) => void;

export type HighchartsEventOptions = {
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
    onDataPointClick?: DataPointEventHandler | ScatterDataPointEventHandler;
    onDataPointContextMenu?: DataPointEventHandler | ScatterDataPointEventHandler;
    onDataPointsSelected?: DataPointsEventHandler | ScatterDataPointsEventHandler;
  } = {},
): HighchartsOptionsInternal => {
  const eventOptions: HighchartsEventOptions = {
    chart: { events: {} },
    plotOptions: { series: { point: { events: {} } } },
  };

  if (onDataPointsSelected) {
    eventOptions.chart.zoomType = 'x';
    onDataPointsSelected = onDataPointsSelected as DataPointsEventHandler;
    onDataPointClick = onDataPointClick as DataPointEventHandler;
    // make selection two dimensional for scatter charts
    if (['scatter', 'bubble'].includes(chartOptions.chart?.type)) {
      eventOptions.chart.zoomType = 'xy';
      onDataPointsSelected = onDataPointsSelected as ScatterDataPointsEventHandler;
      onDataPointClick = onDataPointClick as ScatterDataPointEventHandler;
    }
    eventOptions.chart.events.selection = (nativeEvent: HighchartsSelectEvent) => {
      nativeEvent.preventDefault();
      const { xAxis, yAxis, originalEvent } = nativeEvent;
      (onDataPointsSelected as DataPointsEventHandler | ScatterDataPointsEventHandler)(
        getSelections(xAxis[0], yAxis[0]),
        originalEvent,
      );
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

const getDataPoint = (point: HighchartsPoint): DataPoint | ScatterDataPoint => {
  switch (point.series.initialType || point.series.type) {
    case 'bubble':
    case 'scatter':
      return getScatterDataPoint(point);
    case 'funnel':
      return getFunnelDataPoint(point);
    case 'boxplot':
      return getBoxplotDataPoint(point);
    default:
      return getCartesianDataPoint(point);
  }
};

const getSelections = (
  xAxis: HighchartsSelectEventAxis,
  yAxis?: HighchartsSelectEventAxis,
): DataPoints => {
  const xPoints = xAxis.axis.series
    .flatMap((series) => series.points)
    .filter(({ x }) => x >= xAxis.min && x <= xAxis.max);

  if (!yAxis) return xPoints.map(getDataPoint) as DataPoints;

  const yPoints = yAxis.axis.series
    .flatMap((series) => series.points)
    .filter(({ y }) => y >= yAxis.min && y <= yAxis.max);

  return xPoints.filter((point) => yPoints.includes(point)).map(getDataPoint) as DataPoints;
};

const getCartesianDataPoint = (point: HighchartsPoint): DataPoint => ({
  value: point.custom?.rawValue,
  categoryValue: point.custom?.xValue?.[0],
  seriesValue: point.series.options.custom?.rawValue?.[0],
  categoryDisplayValue: point.category,
});

const getScatterDataPoint = (point: HighchartsPoint): ScatterDataPoint => ({
  x: point.x,
  y: point.y,
  size: point.z,
  breakByPoint: point.custom?.maskedBreakByPoint,
  breakByColor: point.custom?.maskedBreakByColor,
});

const getFunnelDataPoint = (point: HighchartsPoint): DataPoint => ({
  value: point.options.custom.number1,
  categoryValue: point.options.name,
  categoryDisplayValue: point.name,
});

const getBoxplotDataPoint = (point: HighchartsPoint): BoxplotDataPoint => {
  return {
    boxMin: point.options.q1!,
    boxMedian: point.options.median!,
    boxMax: point.options.q3!,
    whiskerMin: point.options.low!,
    whiskerMax: point.options.high!,
    categoryValue: point.category,
    categoryDisplayValue: point.category,
  };
};
