import { DataPointsEventHandler, ScatterDataPointsEventHandler } from '../props.js';
import { BoxplotDataPoint, DataPoint, ScatterDataPoint } from '../types.js';

export type SisenseChartDataPointsEventHandler =
  | DataPointsEventHandler
  | ScatterDataPointsEventHandler;

export type SisenseChartDataPoint = DataPoint | ScatterDataPoint | BoxplotDataPoint;

export type SisenseChartDataPointEventHandler = (
  point: SisenseChartDataPoint,
  nativeEvent: PointerEvent,
) => void;
