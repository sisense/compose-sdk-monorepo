import { ChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types';
import { ChartData } from '@/domains/visualizations/core/chart-data/types.js';
import { ChartDesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/types.js';
import { BeforeRenderHandler } from '@/props.js';
import {
  BoxplotChartType,
  BoxplotDataPoint,
  CalendarHeatmapDataPoint,
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

export type SisenseChartDataPoint =
  | DataPoint
  | ScatterDataPoint
  | BoxplotDataPoint
  | CalendarHeatmapDataPoint;

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
  size?: {
    width?: number;
    height?: number;
  };
}

export type SisenseChartType =
  | CartesianChartType
  | CategoricalChartType
  | ScatterChartType
  | BoxplotChartType;
