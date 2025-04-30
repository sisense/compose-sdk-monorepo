import {
  AreamapDataPoint,
  BoxplotDataPoint,
  DataPoint,
  ScatterDataPoint,
  ScattermapDataPoint,
} from '@sisense/sdk-ui-preact';

export type DataPointEvent = {
  /** Data point that was clicked */
  point: DataPoint;
  /** Native PointerEvent */
  nativeEvent: PointerEvent;
};

export type ScatterDataPointEvent = {
  /** Data point that was clicked */
  point: ScatterDataPoint;
  /** Native PointerEvent */
  nativeEvent: PointerEvent;
};

export type AreamapDataPointEvent = {
  /** Data point that was clicked */
  point: AreamapDataPoint;
  /** Native MouseEvent */
  nativeEvent: MouseEvent;
};

export type ScattermapDataPointEvent = {
  /** Data point that was clicked */
  point: ScattermapDataPoint;
  /** Native MouseEvent */
  nativeEvent: MouseEvent;
};

export type BoxplotDataPointEvent = {
  /** Data point that was clicked */
  point: BoxplotDataPoint;
  /** Native PointerEvent */
  nativeEvent: PointerEvent;
};

export type ChartDataPointClickEvent =
  | DataPointEvent
  | ScatterDataPointEvent
  | BoxplotDataPointEvent
  | AreamapDataPointEvent
  | ScattermapDataPointEvent;

export type ChartDataPointContextMenuEvent =
  | DataPointEvent
  | ScatterDataPointEvent
  | BoxplotDataPointEvent;

export type DataPointsEvent = {
  /** Data points that were selected */
  points: DataPoint[];
  /** Native MouseEvent */
  nativeEvent: MouseEvent;
};

export type ScatterDataPointsEvent = {
  /** Data points that were selected */
  points: ScatterDataPoint[];
  /** Native MouseEvent */
  nativeEvent: MouseEvent;
};

export type BoxplotDataPointsEvent = {
  /** Data point that were selected */
  points: BoxplotDataPoint[];
  /** Native MouseEvent */
  nativeEvent: MouseEvent;
};

export type ChartDataPointsEvent = DataPointsEvent | ScatterDataPointsEvent;

/**
 * A handler function that allows you to customize what happens when certain events occur to
 * a data point.
 */
export type DataPointEventHandler = (event: DataPointEvent) => void;

/** Click handler for when a scatter data point is clicked */
export type ScatterDataPointEventHandler = (event: ScatterDataPointEvent) => void;

/**
 * Click handler for when a data point on Areamap is clicked.
 */
export type AreamapDataPointEventHandler = (event: AreamapDataPointEvent) => void;

/**
 * Click handler for when a data point on Scattermap is clicked.
 */
export type ScattermapDataPointEventHandler = (event: ScattermapDataPointEvent) => void;

/**
 * Click handler for when a data point on Boxplot is clicked.
 */
export type BoxplotDataPointEventHandler = (event: BoxplotDataPointEvent) => void;

/**
 * Click handler for when a data point on Chart is clicked.
 */
export type ChartDataPointClickEventHandler = (event: ChartDataPointClickEvent) => void;

/**
 * Context menu handler for when a data point on the Chart is right-clicked.
 */
export type ChartDataPointContextMenuEventHandler = (event: ChartDataPointContextMenuEvent) => void;

/** Click handler for when multiple scatter data points are selected. */
export type ScatterDataPointsEventHandler = (event: ScatterDataPointsEvent) => void;

/** Click handler for when multiple data points are selected. */
export type DataPointsEventHandler = (event: DataPointsEvent) => void;

/** Click handler for when multiple data points on Chart are selected. */
export type ChartDataPointsEventHandler = (event: ChartDataPointsEvent) => void;
