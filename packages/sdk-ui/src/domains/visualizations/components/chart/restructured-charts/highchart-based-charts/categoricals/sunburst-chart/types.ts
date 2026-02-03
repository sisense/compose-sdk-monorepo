import {
  CategoricalChartDataOptions,
  CategoricalChartDataOptionsInternal,
} from '@/domains/visualizations/core/chart-data-options/types';
import { CategoricalChartData } from '@/domains/visualizations/core/chart-data/types';
import { SunburstChartDesignOptions as SunburstDesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/design-options';
import { SunburstStyleOptions } from '@/types';

/**
 * Sunburst chart specific type aliases for better readability.
 */
export type SunburstChartData = CategoricalChartData;
export type SunburstChartDataOptions = CategoricalChartDataOptions;
export type SunburstChartDataOptionsInternal = CategoricalChartDataOptionsInternal;
export type SunburstChartStyleOptions = SunburstStyleOptions;
export type SunburstChartDesignOptions = SunburstDesignOptions;
