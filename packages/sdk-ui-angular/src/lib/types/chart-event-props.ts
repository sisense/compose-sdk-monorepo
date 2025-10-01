import type { Data } from '@ethings-os/sdk-data';
import type { BeforeRenderHandler, IndicatorBeforeRenderHandler } from '@ethings-os/sdk-ui-preact';

import type {
  AreamapDataPointEventHandler,
  BoxplotDataPointEventHandler,
  CalendarHeatmapDataPointEventHandler,
  CalendarHeatmapDataPointsEventHandler,
  ChartDataPointClickEventHandler,
  ChartDataPointContextMenuEventHandler,
  ChartDataPointsEventHandler,
  DataPointEventHandler,
  DataPointsEventHandler,
  IndicatorDataPointEventHandler,
  ScatterDataPointEventHandler,
  ScatterDataPointsEventHandler,
  ScattermapDataPointEventHandler,
} from './data-point';

export interface HighchartsBasedChartEventProps {
  /**
   * {@inheritDoc @ethings-os/sdk-ui!ChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  beforeRender?: BeforeRenderHandler;
}

export interface BaseChartEventProps {
  /**
   * {@inheritDoc @ethings-os/sdk-ui!ChartProps.onDataReady}
   *
   * @category Callbacks
   */
  dataReady?: (data: Data) => Data;
}

/**
 * Event props for regular (non-specific) charts which uses DataPoint type
 * to describe data points for events.
 */
export interface RegularChartEventProps
  extends BaseChartEventProps,
    HighchartsBasedChartEventProps {
  /**
   * {@inheritDoc @ethings-os/sdk-ui!ChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  dataPointClick?: DataPointEventHandler;
  /**
   * {@inheritDoc @ethings-os/sdk-ui!ChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  dataPointContextMenu?: DataPointEventHandler;
  /**
   * {@inheritDoc @ethings-os/sdk-ui!ChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  dataPointsSelect?: DataPointsEventHandler;
}

/**
 * Event props for Scatter chart which uses ScatterDataPoint type
 * to describe data points for events.
 */
export interface ScatterChartEventProps
  extends BaseChartEventProps,
    HighchartsBasedChartEventProps {
  /**
   * {@inheritDoc @ethings-os/sdk-ui!ScatterChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  dataPointClick?: ScatterDataPointEventHandler;
  /**
   * {@inheritDoc @ethings-os/sdk-ui!ScatterChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  dataPointContextMenu?: ScatterDataPointEventHandler;
  /**
   * {@inheritDoc @ethings-os/sdk-ui!ScatterChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  dataPointsSelect?: ScatterDataPointsEventHandler;
}

/**
 * Event props for Areamap chart which uses AreamapDataPoint type
 * to describe data points for events.
 */
export interface AreamapChartEventProps extends BaseChartEventProps {
  /**
   * {@inheritDoc @ethings-os/sdk-ui!AreamapChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  dataPointClick?: AreamapDataPointEventHandler;
}

/**
 * Event props for Scattermap chart which uses ScattermapDataPoint type
 * to describe data points for events.
 */
export interface ScattermapChartEventProps extends BaseChartEventProps {
  /**
   * {@inheritDoc @ethings-os/sdk-ui!ScattermapChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  dataPointClick?: ScattermapDataPointEventHandler;
}

/**
 * Event props for Boxplot chart which uses BoxplotDataPoint type
 * to describe data points for events.
 */
export interface BoxplotChartEventProps
  extends BaseChartEventProps,
    HighchartsBasedChartEventProps {
  /**
   * {@inheritDoc @ethings-os/sdk-ui!BoxplotChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  dataPointClick?: BoxplotDataPointEventHandler;

  /**
   * {@inheritDoc @ethings-os/sdk-ui!BoxplotChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  dataPointContextMenu?: BoxplotDataPointEventHandler;

  /**
   * {@inheritDoc @ethings-os/sdk-ui!BoxplotChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  dataPointsSelect?: DataPointsEventHandler;
}

export interface IndicatorChartEventProps extends BaseChartEventProps {
  /**
   * {@inheritDoc @ethings-os/sdk-ui!IndicatorChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  beforeRender?: IndicatorBeforeRenderHandler;
  /**
   * {@inheritDoc @ethings-os/sdk-ui!IndicatorChartProps.onDataPointClick}
   *
   * @category Callbacks
   * @internal
   */
  dataPointClick?: IndicatorDataPointEventHandler;
}

/**
 * Event props for CalendarHeatmap chart which uses CalendarHeatmapDataPoint type
 * to describe data points for events.
 */
export interface CalendarHeatmapChartEventProps
  extends BaseChartEventProps,
    HighchartsBasedChartEventProps {
  /**
   * {@inheritDoc @ethings-os/sdk-ui!ScatterChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  dataPointClick?: CalendarHeatmapDataPointEventHandler;
  /**
   * {@inheritDoc @ethings-os/sdk-ui!ScatterChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  dataPointContextMenu?: CalendarHeatmapDataPointEventHandler;
  /**
   * {@inheritDoc @ethings-os/sdk-ui!ScatterChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  dataPointsSelect?: CalendarHeatmapDataPointsEventHandler;
}

export interface ChartEventProps extends BaseChartEventProps {
  /**
   * {@inheritDoc @ethings-os/sdk-ui!ChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  dataPointClick?: ChartDataPointClickEventHandler;

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  dataPointContextMenu?: ChartDataPointContextMenuEventHandler;

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  dataPointsSelect?: ChartDataPointsEventHandler;

  /**
   * {@inheritDoc @ethings-os/sdk-ui!ChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  beforeRender?:
    | HighchartsBasedChartEventProps['beforeRender']
    | IndicatorChartEventProps['beforeRender'];
}

export type WithoutPreactChartEventProps<T> = Omit<
  T,
  | 'onBeforeRender'
  | 'onDataReady'
  | 'onDataPointClick'
  | 'onDataPointContextMenu'
  | 'onDataPointsSelected'
>;
