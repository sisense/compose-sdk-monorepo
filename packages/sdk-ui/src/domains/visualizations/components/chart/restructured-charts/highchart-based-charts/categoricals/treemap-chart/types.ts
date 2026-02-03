import {
  CategoricalChartDataOptions,
  CategoricalChartDataOptionsInternal,
} from '@/domains/visualizations/core/chart-data-options/types';
import { CategoricalChartData } from '@/domains/visualizations/core/chart-data/types';
import { TreemapChartDesignOptions as TreemapDesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/design-options';
import { TreemapStyleOptions } from '@/types';

/**
 * Treemap chart specific type aliases for better readability.
 */
export type TreemapChartData = CategoricalChartData;
export type TreemapChartDataOptions = CategoricalChartDataOptions;
export type TreemapChartDataOptionsInternal = CategoricalChartDataOptionsInternal;
export type TreemapChartStyleOptions = TreemapStyleOptions;
export type TreemapChartDesignOptions = TreemapDesignOptions;
