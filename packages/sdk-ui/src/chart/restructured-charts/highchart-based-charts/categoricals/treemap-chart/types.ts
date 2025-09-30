import { CategoricalChartData } from '@/chart-data/types';
import {
  CategoricalChartDataOptions,
  CategoricalChartDataOptionsInternal,
} from '@/chart-data-options/types';
import { TreemapStyleOptions } from '@/types';
import { TreemapChartDesignOptions as TreemapDesignOptions } from '@/chart-options-processor/translations/design-options';

/**
 * Treemap chart specific type aliases for better readability.
 */
export type TreemapChartData = CategoricalChartData;
export type TreemapChartDataOptions = CategoricalChartDataOptions;
export type TreemapChartDataOptionsInternal = CategoricalChartDataOptionsInternal;
export type TreemapChartStyleOptions = TreemapStyleOptions;
export type TreemapChartDesignOptions = TreemapDesignOptions;
