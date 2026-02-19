import { CartesianChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types';
import { StackableChartDesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/design-options';
import { TextStyle } from '@/domains/visualizations/core/chart-options-processor/translations/types';

/**
 * Internal design options for Streamgraph charts.
 */
export interface StreamgraphChartDesignOptions
  extends Omit<StackableChartDesignOptions, 'stackType'> {
  /** Configuration for titles of series */
  seriesTitles?: {
    /** Boolean flag that defines if titles of series should be shown */
    enabled: boolean;
    /**
     * Text style for series titles
     *
     * Font size and weight are calculated automatically
     * */
    textStyle?: Omit<TextStyle, 'pointerEvents' | 'textOverflow' | 'fontSize' | 'fontWeight'>;
  };
}

/**
 * Data options internal format for streamgraph.
 * Uses the same structure as other Cartesian charts.
 */
export type StreamgraphChartDataOptionsInternal = CartesianChartDataOptionsInternal;
