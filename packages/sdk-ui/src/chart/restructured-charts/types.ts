import { Attribute, Measure, QueryResultData } from '@sisense/sdk-data';
import { QueryDescription, QueryExecutionConfig } from '@sisense/sdk-query-client';
import type {
  AreamapStyleOptions,
  ChartDataOptions,
  ChartStyleOptions,
  ScattermapStyleOptions,
  StackableStyleOptions,
} from '@/types';
import type { SisenseChartProps } from '@/sisense-chart';
import type { ChartRendererProps } from '@/chart';
import type { CartesianChartData, ScattermapChartData } from '@/chart-data/types';
import {
  AreamapChartDataOptions,
  AreamapChartDataOptionsInternal,
  CartesianChartDataOptions,
  CartesianChartDataOptionsInternal,
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

export type SupportedChartType = 'areamap' | 'column' | 'bar'; // TODO: Extend with other chart types

export type TypedChartDataOptions<CT extends SupportedChartType> = CT extends 'areamap'
  ? AreamapChartDataOptions
  : CT extends 'scattermap'
  ? ScattermapChartDataOptions
  : CT extends 'column' | 'bar'
  ? CartesianChartDataOptions
  : // TODO: Extend with other chart types
    never;

export type TypedDataOptionsInternal<CT extends SupportedChartType> = CT extends 'areamap'
  ? AreamapChartDataOptionsInternal
  : CT extends 'scattermap'
  ? ScattermapChartDataOptionsInternal
  : CT extends 'column' | 'bar'
  ? CartesianChartDataOptionsInternal
  : // TODO: Extend with other chart types
    never;

export type TypedChartStyleOptions<CT extends SupportedChartType> = CT extends 'areamap'
  ? AreamapStyleOptions
  : CT extends 'scattermap'
  ? ScattermapStyleOptions
  : CT extends 'column' | 'bar'
  ? StackableStyleOptions
  : // TODO: Extend with other chart types
    never;

export type TypedDesignOptions<CT extends SupportedChartType> = DesignOptions<CT>;

export type TypedChartData<CT extends SupportedChartType> = CT extends 'areamap'
  ? AreamapData
  : CT extends 'scattermap'
  ? ScattermapChartData
  : CT extends 'column' | 'bar'
  ? CartesianChartData
  : // TODO: Extend with other chart types
    never;

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
  : CT extends 'column' | 'bar'
  ? SisenseChartProps
  : // TODO: Extend with other chart types
    never;

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
