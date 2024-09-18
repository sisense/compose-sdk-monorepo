import { BoxplotDataPoint, DataPoint, ScatterDataPoint } from '../types.js';

export type SisenseChartDataPointsEventHandler = (
  points: SisenseChartDataPoint[],
  nativeEvent: MouseEvent,
) => void;

export type SisenseChartDataPoint = DataPoint | ScatterDataPoint | BoxplotDataPoint;

export type SisenseChartDataPointEventHandler = (
  point: SisenseChartDataPoint,
  nativeEvent: PointerEvent,
) => void;
