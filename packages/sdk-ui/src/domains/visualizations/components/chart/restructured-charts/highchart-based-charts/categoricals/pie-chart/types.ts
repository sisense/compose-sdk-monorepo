import {
  CategoricalChartDataOptions,
  CategoricalChartDataOptionsInternal,
} from '@/domains/visualizations/core/chart-data-options/types';
import { CategoricalChartData } from '@/domains/visualizations/core/chart-data/types';
import { PieChartDesignOptions as PieDesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/design-options';
import { PieStyleOptions } from '@/types';

/**
 * Pie chart specific type aliases for better readability.
 */
export type PieChartData = CategoricalChartData;
export type PieChartDataOptions = CategoricalChartDataOptions;
export type PieChartDataOptionsInternal = CategoricalChartDataOptionsInternal;
export type PieChartStyleOptions = PieStyleOptions;
export type PieChartDesignOptions = PieDesignOptions;
