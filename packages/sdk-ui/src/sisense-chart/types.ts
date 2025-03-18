import { ChartDataOptionsInternal } from '@/chart-data-options/types';
import { ChartData } from '@/chart-data/types.js';
import { ChartDesignOptions } from '@/chart-options-processor/translations/types.js';
import { BeforeRenderHandler } from '@/props.js';
import {
  BoxplotChartType,
  BoxplotDataPoint,
  CartesianChartType,
  CategoricalChartType,
  DataPoint,
  ScatterChartType,
  ScatterDataPoint,
} from '@/types.js';

export type SisenseChartDataPointsEventHandler = (
  points: SisenseChartDataPoint[],
  nativeEvent: MouseEvent,
) => void;

export type SisenseChartDataPoint = DataPoint | ScatterDataPoint | BoxplotDataPoint;

export type SisenseChartDataPointEventHandler = (
  point: SisenseChartDataPoint,
  nativeEvent: PointerEvent,
) => void;

export interface SisenseChartProps {
  chartType: SisenseChartType;
  chartData: ChartData;
  dataOptions: ChartDataOptionsInternal;
  designOptions: ChartDesignOptions;
  onDataPointClick?: SisenseChartDataPointEventHandler;
  onDataPointContextMenu?: SisenseChartDataPointEventHandler;
  onDataPointsSelected?: SisenseChartDataPointsEventHandler;
  onBeforeRender?: BeforeRenderHandler;
}

export type SisenseChartType =
  | CartesianChartType
  | CategoricalChartType
  | ScatterChartType
  | BoxplotChartType;
