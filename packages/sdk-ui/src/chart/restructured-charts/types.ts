import { Attribute, Measure, QueryResultData } from '@sisense/sdk-data';
import { QueryDescription, QueryExecutionConfig } from '@sisense/sdk-query-client';
import type {
  AreaStyleOptions,
  AreamapStyleOptions,
  CalendarHeatmapStyleOptions,
  ChartDataOptions,
  ChartStyleOptions,
  LineStyleOptions,
  PieStyleOptions,
  PolarStyleOptions,
  ScattermapStyleOptions,
  StackableStyleOptions,
} from '@/types';
import type { ChartRendererProps } from '@/chart';
import type {
  CartesianChartData,
  CategoricalChartData,
  ScattermapChartData,
} from '@/chart-data/types';
import {
  AreamapChartDataOptions,
  AreamapChartDataOptionsInternal,
  CalendarHeatmapChartDataOptions,
  CalendarHeatmapChartDataOptionsInternal,
  CartesianChartDataOptions,
  CartesianChartDataOptionsInternal,
  CategoricalChartDataOptions,
  CategoricalChartDataOptionsInternal,
  ChartDataOptionsInternal,
  ScattermapChartDataOptions,
  ScattermapChartDataOptionsInternal,
} from '@/chart-data-options/types';
import { DesignOptions } from '@/chart-options-processor/translations/types';

import { DataTable } from '@/chart-data-processor/table-processor';

import { ClientApplication } from '@/app/client-application';
import { AreamapProps } from '@/chart/restructured-charts/areamap-chart/renderer';
import { ScattermapProps } from '@/charts/map-charts/scattermap/scattermap';
import { AreamapData } from './areamap-chart/types';
import { HighchartsBasedChartRendererProps } from './highchart-based-charts/highcharts-based-chart-renderer/highcharts-based-chart-renderer';
import { CalendarHeatmapChartData } from './highchart-based-charts/calendar-heatmap-chart/data';

export type SupportedChartType =
  | 'areamap'
  | 'column'
  | 'bar'
  | 'line'
  | 'area'
  | 'polar'
  | 'pie'
  | 'calendar-heatmap';

export type TypedChartDataOptions<CT extends SupportedChartType> = CT extends 'areamap'
  ? AreamapChartDataOptions
  : CT extends 'scattermap'
  ? ScattermapChartDataOptions
  : CT extends 'pie'
  ? CategoricalChartDataOptions
  : CT extends 'column' | 'bar' | 'line' | 'area' | 'polar'
  ? CartesianChartDataOptions
  : CT extends 'calendar-heatmap'
  ? CalendarHeatmapChartDataOptions
  : never;

export type TypedDataOptionsInternal<CT extends SupportedChartType> = CT extends 'areamap'
  ? AreamapChartDataOptionsInternal
  : CT extends 'scattermap'
  ? ScattermapChartDataOptionsInternal
  : CT extends 'pie'
  ? CategoricalChartDataOptionsInternal
  : CT extends 'column' | 'bar' | 'line' | 'area' | 'polar'
  ? CartesianChartDataOptionsInternal
  : CT extends 'calendar-heatmap'
  ? CalendarHeatmapChartDataOptionsInternal
  : never;

export type TypedChartStyleOptions<CT extends SupportedChartType> = CT extends 'areamap'
  ? AreamapStyleOptions
  : CT extends 'scattermap'
  ? ScattermapStyleOptions
  : CT extends 'pie'
  ? PieStyleOptions
  : CT extends 'column' | 'bar'
  ? StackableStyleOptions
  : CT extends 'line'
  ? LineStyleOptions
  : CT extends 'area'
  ? AreaStyleOptions
  : CT extends 'polar'
  ? PolarStyleOptions
  : CT extends 'calendar-heatmap'
  ? CalendarHeatmapStyleOptions
  : never;

export type TypedDesignOptions<CT extends SupportedChartType> = DesignOptions<CT>;

export type TypedChartData<CT extends SupportedChartType> = CT extends 'areamap'
  ? AreamapData
  : CT extends 'scattermap'
  ? ScattermapChartData
  : CT extends 'pie'
  ? CategoricalChartData
  : CT extends 'column' | 'bar' | 'line' | 'area' | 'polar'
  ? CartesianChartData
  : CT extends 'calendar-heatmap'
  ? CalendarHeatmapChartData
  : never;

export type TypedLoadDataFunction<CT extends SupportedChartType> = (options: {
  app: ClientApplication;
  chartDataOptionsInternal: TypedDataOptionsInternal<CT>;
  queryDescription: QueryDescription;
  executionConfig?: QueryExecutionConfig;
}) => Promise<QueryResultData>;

export type TypedChartRendererProps<CT extends SupportedChartType> = CT extends 'areamap'
  ? AreamapProps
  : CT extends 'scattermap'
  ? ScattermapProps
  : CT extends 'column' | 'bar' | 'line' | 'area' | 'polar' | 'pie' | 'calendar-heatmap'
  ? HighchartsBasedChartRendererProps<CT>
  : never;

/**
 * Chart builder interface.
 */
export interface ChartBuilder<CT extends SupportedChartType = SupportedChartType> {
  /**
   * Data options translation utils.
   */
  dataOptions: {
    /**
     * Translates the data options to the internal format.
     */
    translateDataOptionsToInternal: (
      dataOptions: TypedChartDataOptions<CT>,
    ) => TypedDataOptionsInternal<CT>;

    /**
     * Returns the attributes from the internal data options.
     */
    getAttributes: (internalDataOptions: TypedDataOptionsInternal<CT>) => Attribute[];

    /**
     * Returns the measures from the internal data options.
     */
    getMeasures: (internalDataOptions: TypedDataOptionsInternal<CT>) => Measure[];

    /**
     * Validates and cleans the data options if needed.
     */
    validateAndCleanDataOptions?: (
      dataOptions: TypedChartDataOptions<CT>,
    ) => TypedChartDataOptions<CT>;

    /**
     * Checks if the data options are correct for the current chart type.
     */
    isCorrectDataOptions: (
      dataOptions: ChartDataOptions,
    ) => dataOptions is TypedChartDataOptions<CT>;

    /**
     * Checks if the data options are correct for the internal format.
     */
    isCorrectDataOptionsInternal: (
      dataOptions: ChartDataOptionsInternal,
    ) => dataOptions is TypedDataOptionsInternal<CT>;
  };

  /**
   * Data retrieving and translation utils.
   */
  data: {
    /**
     * Loads the data from backend.
     */
    loadData: TypedLoadDataFunction<CT>;

    /**
     * Translates the data table to the chart data.
     */
    getChartData: (
      chartDataOptions: TypedDataOptionsInternal<CT>,
      dataTable: DataTable,
    ) => TypedChartData<CT>;
  };

  /**
   * Design options translation utils.
   */
  designOptions: {
    /**
     * Translates the style options to the design options.
     */
    translateStyleOptionsToDesignOptions: (
      styleOptions: TypedChartStyleOptions<CT>,
      dataOptionsInternal: TypedDataOptionsInternal<CT>,
    ) => TypedDesignOptions<CT>;

    /**
     * Checks if the style options are correct for the current chart type.
     */
    isCorrectStyleOptions: (
      styleOptions: ChartStyleOptions,
    ) => styleOptions is TypedChartStyleOptions<CT>;
  };

  /**
   * Chart renderer component and related utils
   */
  renderer: {
    /**
     * Chart renderer component.
     */
    ChartRendererComponent: React.ComponentType<TypedChartRendererProps<CT>>;
    /**
     * Type guard for the chart renderer props.
     */
    isCorrectRendererProps: (props: ChartRendererProps) => props is TypedChartRendererProps<CT>;
  };
}
