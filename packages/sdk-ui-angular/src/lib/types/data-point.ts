import {
  AreamapDataPoint,
  BoxplotDataPoint,
  CalendarHeatmapDataPoint,
  DataPoint,
  IndicatorDataPoint,
  ScatterDataPoint,
  ScattermapDataPoint,
  TextWidgetDataPoint,
} from '@ethings-os/sdk-ui-preact';

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

export type IndicatorDataPointEvent = {
  /** Data point that was clicked */
  point: IndicatorDataPoint;
  /** Native MouseEvent */
  nativeEvent: MouseEvent;
};

export type CalendarHeatmapDataPointEvent = {
  /** Data point that was clicked */
  point: CalendarHeatmapDataPoint;
  /** Native PointerEvent */
  nativeEvent: PointerEvent;
};

export type CalendarHeatmapDataPointsEvent = {
  /** Data points that were selected */
  points: CalendarHeatmapDataPoint[];
  /** Native MouseEvent */
  nativeEvent: MouseEvent;
};

export type TextWidgetDataPointEvent = {
  /** Data point that was clicked */
  point: TextWidgetDataPoint;
  /** Native MouseEvent */
  nativeEvent: MouseEvent;
};

export type ChartDataPointClickEvent =
  | DataPointEvent
  | ScatterDataPointEvent
  | BoxplotDataPointEvent
  | AreamapDataPointEvent
  | ScattermapDataPointEvent
  | IndicatorDataPointEvent
  | CalendarHeatmapDataPointEvent;

export type WidgetDataPointClickEvent = ChartDataPointClickEvent | TextWidgetDataPointEvent;

export type ChartDataPointContextMenuEvent =
  | DataPointEvent
  | ScatterDataPointEvent
  | BoxplotDataPointEvent
  | CalendarHeatmapDataPointEvent;

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

export type ChartDataPointsEvent =
  | DataPointsEvent
  | ScatterDataPointsEvent
  | CalendarHeatmapDataPointsEvent;

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

/** Click handler for when a data point on Indicator is clicked. */
export type IndicatorDataPointEventHandler = (event: IndicatorDataPointEvent) => void;

/**
 * Click handler for when a data point on Chart is clicked.
 */
export type ChartDataPointClickEventHandler = (event: ChartDataPointClickEvent) => void;

/** Click handler for when a data point on TextWidget is clicked. */
export type TextWidgetDataPointEventHandler = (event: TextWidgetDataPointEvent) => void;

/** Click handler for when a data point on Widget is clicked. */
export type WidgetDataPointClickEventHandler = (event: WidgetDataPointClickEvent) => void;

/**
 * Context menu handler for when a data point on the Chart is right-clicked.
 */
export type ChartDataPointContextMenuEventHandler = (event: ChartDataPointContextMenuEvent) => void;

/** Click handler for when multiple scatter data points are selected. */
export type ScatterDataPointsEventHandler = (event: ScatterDataPointsEvent) => void;

/** Click handler for when multiple data points are selected. */
export type DataPointsEventHandler = (event: DataPointsEvent) => void;

/**
 * Click handler for when a calendar-heatmap data point is clicked
 */
export type CalendarHeatmapDataPointEventHandler = (event: CalendarHeatmapDataPointEvent) => void;

/**
 * Click handler for when multiple calendar-heatmap data points are selected.
 */
export type CalendarHeatmapDataPointsEventHandler = (event: CalendarHeatmapDataPointsEvent) => void;

/** Click handler for when multiple data points on Chart are selected. */
export type ChartDataPointsEventHandler = (event: ChartDataPointsEvent) => void;
