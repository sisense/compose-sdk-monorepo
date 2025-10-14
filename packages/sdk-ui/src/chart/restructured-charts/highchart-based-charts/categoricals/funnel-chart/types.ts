import {
  CategoricalChartDataOptions,
  CategoricalChartDataOptionsInternal,
} from '@/chart-data-options/types';
import { CategoricalChartData } from '@/chart-data/types';
import { FunnelChartDesignOptions as FunnelDesignOptions } from '@/chart-options-processor/translations/design-options';
import { FunnelStyleOptions } from '@/types';

/**
 * Funnel chart specific type aliases for better readability.
 */
export type FunnelChartData = CategoricalChartData;
export type FunnelChartDataOptions = CategoricalChartDataOptions;
export type FunnelChartDataOptionsInternal = CategoricalChartDataOptionsInternal;
export type FunnelChartStyleOptions = FunnelStyleOptions;
export type FunnelChartDesignOptions = FunnelDesignOptions;
