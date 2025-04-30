import type { Data } from '@sisense/sdk-data';
import type { BeforeRenderHandler, IndicatorBeforeRenderHandler } from '@sisense/sdk-ui-preact';

import type {
  AreamapDataPointEventHandler,
  BoxplotDataPointEventHandler,
  ChartDataPointClickEventHandler,
  ChartDataPointContextMenuEventHandler,
  ChartDataPointsEventHandler,
  DataPointEventHandler,
  DataPointsEventHandler,
  ScatterDataPointEventHandler,
  ScatterDataPointsEventHandler,
  ScattermapDataPointEventHandler,
} from './data-point';

export interface HighchartsBasedChartEventProps {
  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  beforeRender?: BeforeRenderHandler;
}

export interface BaseChartEventProps {
  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.onDataReady}
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
   * {@inheritDoc @sisense/sdk-ui!ChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  dataPointClick?: DataPointEventHandler;
  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  dataPointContextMenu?: DataPointEventHandler;
  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.onDataPointsSelected}
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
   * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  dataPointClick?: ScatterDataPointEventHandler;
  /**
   * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  dataPointContextMenu?: ScatterDataPointEventHandler;
  /**
   * {@inheritDoc @sisense/sdk-ui!ScatterChartProps.onDataPointsSelected}
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
   * {@inheritDoc @sisense/sdk-ui!AreamapChartProps.onDataPointClick}
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
   * {@inheritDoc @sisense/sdk-ui!ScattermapChartProps.onDataPointClick}
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
   * {@inheritDoc @sisense/sdk-ui!BoxplotChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  dataPointClick?: BoxplotDataPointEventHandler;

  /**
   * {@inheritDoc @sisense/sdk-ui!BoxplotChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  dataPointContextMenu?: BoxplotDataPointEventHandler;

  /**
   * {@inheritDoc @sisense/sdk-ui!BoxplotChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  dataPointsSelect?: DataPointsEventHandler;
}

export interface IndicatorChartEventProps extends BaseChartEventProps {
  /**
   * {@inheritDoc @sisense/sdk-ui!IndicatorChartProps.onBeforeRender}
   *
   * @category Callbacks
   */
  beforeRender?: IndicatorBeforeRenderHandler;
}

export interface ChartEventProps extends BaseChartEventProps {
  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.onDataPointClick}
   *
   * @category Callbacks
   */
  dataPointClick?: ChartDataPointClickEventHandler;

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.onDataPointContextMenu}
   *
   * @category Callbacks
   */
  dataPointContextMenu?: ChartDataPointContextMenuEventHandler;

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.onDataPointsSelected}
   *
   * @category Callbacks
   */
  dataPointsSelect?: ChartDataPointsEventHandler;

  /**
   * {@inheritDoc @sisense/sdk-ui!ChartProps.onBeforeRender}
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
