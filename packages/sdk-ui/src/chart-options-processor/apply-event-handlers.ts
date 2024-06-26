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
  ChartDataPoints,
  BoxplotDataPoint,
} from '../types';
import { DataPointsEventHandler, ScatterDataPointsEventHandler } from '../props';
import { HighchartsOptionsInternal } from '../chart-options-processor/chart-options-service';
import {
  SisenseChartDataPoint,
  SisenseChartDataPointEventHandler,
  SisenseChartDataPointsEventHandler,
} from '../sisense-chart/types';

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
    onDataPointClick?: SisenseChartDataPointEventHandler;
    onDataPointContextMenu?: SisenseChartDataPointEventHandler;
    onDataPointsSelected?: SisenseChartDataPointsEventHandler;
  } = {},
): HighchartsOptionsInternal => {
  const eventOptions: HighchartsEventOptions = {
    chart: { events: {} },
    plotOptions: {
      series: {
        point: {
          events: {
            // will be overwritten if onDataPointClick is provided
            click: () => {},
          },
        },
      },
    },
  };

  if (onDataPointsSelected) {
    eventOptions.chart.zoomType = 'x';
    onDataPointsSelected = onDataPointsSelected as DataPointsEventHandler;
    // make selection two dimensional for scatter charts
    if (['scatter', 'bubble'].includes(chartOptions.chart?.type)) {
      eventOptions.chart.zoomType = 'xy';
      onDataPointsSelected = onDataPointsSelected as ScatterDataPointsEventHandler;
    }
    eventOptions.chart.events.selection = (nativeEvent: HighchartsSelectEvent) => {
      nativeEvent.preventDefault();
      const { xAxis, yAxis, originalEvent } = nativeEvent;
      const selectedPoints = getSelectedPoints(xAxis[0], yAxis[0]);
      selectedPoints.forEach((point) => {
        point.state = '';
      });
      (onDataPointsSelected as DataPointsEventHandler | ScatterDataPointsEventHandler)(
        selectedPoints.map(getDataPoint) as ChartDataPoints,
        originalEvent,
      );
    };
  }

  if (onDataPointClick) {
    eventOptions.plotOptions.series.point.events.click = (nativeEvent: HighchartsPointerEvent) => {
      nativeEvent.point.state = 'hover';
      onDataPointClick(getDataPoint(nativeEvent.point), nativeEvent);
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

const getDataPoint = (point: HighchartsPoint): SisenseChartDataPoint => {
  switch (point.series?.initialType || point.series?.type) {
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

const getSelectedPoints = (
  xAxis: HighchartsSelectEventAxis,
  yAxis?: HighchartsSelectEventAxis,
): HighchartsPoint[] => {
  const xPoints = xAxis.axis.series
    .flatMap((series) => series.points)
    .filter(({ x }) => x >= xAxis.min && x <= xAxis.max);

  if (!yAxis) return xPoints;

  const yPoints = yAxis.axis.series
    .flatMap((series) => series.points)
    .filter(({ y }) => y >= yAxis.min && y <= yAxis.max);

  return xPoints.filter((point) => yPoints.includes(point));
};

const getCartesianDataPoint = (point: HighchartsPoint): DataPoint => ({
  value: point.custom?.rawValue,
  categoryValue: point.custom?.xValue?.[0],
  seriesValue: point.series?.options?.custom?.rawValue?.[0],
  categoryDisplayValue: point.name ?? point.category,
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
