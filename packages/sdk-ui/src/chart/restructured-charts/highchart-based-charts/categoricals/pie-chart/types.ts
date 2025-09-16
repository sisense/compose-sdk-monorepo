import { CategoricalChartData } from '@/chart-data/types';
import {
  CategoricalChartDataOptions,
  CategoricalChartDataOptionsInternal,
} from '@/chart-data-options/types';
import { PieStyleOptions } from '@/types';
import { PieChartDesignOptions as PieDesignOptions } from '@/chart-options-processor/translations/design-options';

/**
 * Pie chart specific type aliases for better readability.
 */
export type PieChartData = CategoricalChartData;
export type PieChartDataOptions = CategoricalChartDataOptions;
export type PieChartDataOptionsInternal = CategoricalChartDataOptionsInternal;
export type PieChartStyleOptions = PieStyleOptions;
export type PieChartDesignOptions = PieDesignOptions;
