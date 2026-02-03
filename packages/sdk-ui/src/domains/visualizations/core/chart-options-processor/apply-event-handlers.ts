/* eslint-disable import/no-extraneous-dependencies */

/* eslint-disable @typescript-eslint/no-use-before-define */
import Highcharts from '@sisense/sisense-charts';
import type { SeriesLegendItemClickCallbackFunction } from '@sisense/sisense-charts';
import merge from 'deepmerge';
import isNull from 'lodash-es/isNull';

import { ChartDataOptionsInternal } from '../../../..';
import {
  HighchartsPoint,
  HighchartsPointerEvent,
  HighchartsSelectEvent,
  HighchartsSelectEventAxis,
} from '../../../../types';
import {
  SisenseChartDataPointEventHandler,
  SisenseChartDataPointsEventHandler,
} from '../../components/chart/components/sisense-chart/types';
import { HighchartsOptionsInternal } from './chart-options-service';
import { getDataPoint } from './data-points';

type HighchartsChartWithCustomProperties = Highcharts.Chart & {
  /**
   * Custom property that indicates that redraw was triggered by drill action,

   * @internal
   */
  isDrillingDownAction?: boolean;
  /**
   * Method to drill up
   * Exposed Highchart internal method
   *
   * @internal
   */
  drillUp: () => void;
};

export type HighchartsEventOptions = {
  chart: {
    zoomType?: string;
    events: {
      selection?: (ev: HighchartsSelectEvent) => void;
      drilldown?: (this: HighchartsChartWithCustomProperties) => void;
      redraw?: (this: HighchartsChartWithCustomProperties) => void;
    };
  };
  plotOptions: {
    series: {
      events?: {
        legendItemClick?: SeriesLegendItemClickCallbackFunction;
      };
      point: {
        events: {
          click?: (ev: HighchartsPointerEvent) => void;
          contextmenu?: (ev: HighchartsPointerEvent) => void;
        };
      };
    };
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getStringProp = (obj: unknown, key: string): string | undefined => {
  if (!isRecord(obj)) return undefined;
  const value = obj[key];
  return typeof value === 'string' ? value : undefined;
};

const toggleRelatedSeriesVisibility: SeriesLegendItemClickCallbackFunction = function () {
  const clickedSeriesName = this.name;
  const clickedSeriesId = getStringProp(this.options, 'id');

  const nextVisible = !this.visible;
  const linkedSeries = this.chart.series.filter((series) => {
    if (series === this) return false;
    const relatesTo = getStringProp(series.options, 'statisticalSeriesRelatesToSeries');
    if (relatesTo === undefined) return false;
    return (
      relatesTo === clickedSeriesName ||
      (clickedSeriesId !== undefined && relatesTo === clickedSeriesId)
    );
  });

  linkedSeries.forEach((series) => series.setVisible(nextVisible, false));
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
    chart: {
      events: {
        drilldown: function () {
          if (this.options?.chart?.type === 'pie') {
            this.isDrillingDownAction = true; // Set custom flag
          }
        },
        redraw: function () {
          if (this.options?.chart?.type === 'pie') {
            if (!this.isDrillingDownAction) {
              this.drillUp();
            } else {
              delete this.isDrillingDownAction;
            }
          }
        },
      },
    },
    plotOptions: {
      series: {
        events: {
          legendItemClick: toggleRelatedSeriesVisibility,
        },
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
    // make selection one dimensional (X) for all charts except heatmap
    if (chartOptions.chart?.type !== 'heatmap') {
      eventOptions.chart.zoomType = 'x';
    }
    // make selection two dimensional (X and Y) for scatter charts
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
      const isValidPoint = !!nativeEvent.point.options; // any valid point should contain `options` property
      if (isValidPoint) {
        nativeEvent.point.state = 'hover';
        onDataPointClick(getDataPoint(nativeEvent.point, dataOptions), nativeEvent);
      }
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

/**
 * Composable variant of applyEventHandlersToChart.
 * Returns a function that applies event handlers to the chart options.
 *
 * @param dataOptions - The data options to use.
 * @param onDataPointClick - The event handler for data point click.
 * @param onDataPointContextMenu - The event handler for data point context menu.
 * @param onDataPointsSelected - The event handler for data points selected.
 * @returns A function that applies event handlers to the chart options.
 */

export function withEventHandlers(
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
): (chartOptions: HighchartsOptionsInternal) => HighchartsOptionsInternal {
  return (chartOptions) =>
    applyEventHandlersToChart(chartOptions, dataOptions, {
      onDataPointClick,
      onDataPointContextMenu,
      onDataPointsSelected,
    });
}

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
