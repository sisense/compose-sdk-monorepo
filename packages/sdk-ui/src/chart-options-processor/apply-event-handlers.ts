/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-use-before-define */
import merge from 'deepmerge';
import isNull from 'lodash-es/isNull';
import {
  HighchartsPointerEvent,
  HighchartsSelectEvent,
  HighchartsPoint,
  HighchartsSelectEventAxis,
} from '../types';
import { HighchartsOptionsInternal } from '../chart-options-processor/chart-options-service';
import {
  SisenseChartDataPointEventHandler,
  SisenseChartDataPointsEventHandler,
} from '../sisense-chart/types';
import { ChartDataOptionsInternal } from '..';
import { getDataPoint } from './data-points';

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
  dataOptions: ChartDataOptionsInternal,
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
    // make selection two dimensional for scatter charts
    if (['scatter', 'bubble'].includes(chartOptions.chart?.type)) {
      eventOptions.chart.zoomType = 'xy';
    }
    eventOptions.chart.events.selection = (nativeEvent: HighchartsSelectEvent) => {
      nativeEvent.preventDefault();
      const { xAxis, yAxis, originalEvent } = nativeEvent;
      const selectedPoints = getSelectedPoints(xAxis[0], yAxis[0]);
      selectedPoints.forEach((point) => {
        point.state = '';
      });
      onDataPointsSelected(
        selectedPoints.map((p) => getDataPoint(p, dataOptions)),
        originalEvent,
      );
    };
  }

  if (onDataPointClick) {
    eventOptions.plotOptions.series.point.events.click = (nativeEvent: HighchartsPointerEvent) => {
      nativeEvent.point.state = 'hover';
      onDataPointClick(getDataPoint(nativeEvent.point, dataOptions), nativeEvent);
    };
  }

  if (onDataPointContextMenu) {
    eventOptions.plotOptions.series.point.events.contextmenu = (
      nativeEvent: HighchartsPointerEvent,
    ) => {
      nativeEvent.preventDefault();
      onDataPointContextMenu(getDataPoint(nativeEvent.point, dataOptions), nativeEvent);
    };
  }

  return merge(chartOptions, eventOptions);
};

const getSelectedPoints = (
  xAxis: HighchartsSelectEventAxis,
  yAxis?: HighchartsSelectEventAxis,
): HighchartsPoint[] => {
  const xPoints = xAxis.axis.series
    .flatMap((series) => series.points)
    .filter(({ x, y }) => {
      const isInRange = x >= xAxis.min && x <= xAxis.max;
      // filters out the redundant points (for cartesian chart with 2 categories)
      const isValidPoint = !isNull(y);
      return isInRange && isValidPoint;
    });

  if (!yAxis) return xPoints;

  const yPoints = yAxis.axis.series
    .flatMap((series) => series.points)
    .filter(({ y }) => y >= yAxis.min && y <= yAxis.max);

  return xPoints.filter((point) => yPoints.includes(point));
};
