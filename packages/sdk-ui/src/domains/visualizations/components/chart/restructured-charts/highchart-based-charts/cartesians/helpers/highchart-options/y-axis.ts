import {
  buildYAxisMeta,
  buildYAxisMinMax,
  hasSecondaryYAxis,
} from '@/domains/visualizations/core/chart-options-processor/cartesian/utils/axis/axis-builders.js';
import { getYAxisSettings } from '@/domains/visualizations/core/chart-options-processor/cartesian/utils/axis/axis-utils.js';
import { AxisSettings } from '@/domains/visualizations/core/chart-options-processor/translations/axis-section.js';

import { BuildContext } from '../../../types.js';
import { CartesianChartTypes } from '../../types.js';

/**
 * Creates basic Y-axis settings for cartesian charts with data-driven min/max calculation.
 * This function provides the foundation Y-axis configuration that can be enhanced
 * by chart-specific transformers later using functional programming patterns.
 *
 * The function always calculates min/max values from chart data, ensuring proper
 * scaling for all chart types. User-provided min/max values are handled separately
 * in the final axis settings, following the legacy behavior pattern.
 *
 * @param ctx - Build context containing chart data, options, and configuration
 * @param chartType - The specific chart type for min/max calculations
 * @returns Basic Y-axis settings array that can be enhanced by chart-specific transformers
 *
 * @example
 * ```typescript
 * // Basic usage
 * const basicYAxis = getBasicYAxisSettings(ctx, 'line');
 *
 * // Enhanced with chart-specific transformers
 * const enhancedYAxis = flow(
 *   withStacking(ctx, 'bar'),
 * )(basicYAxis);
 * ```
 */
export const getBasicYAxisSettings = (
  ctx: BuildContext<CartesianChartTypes>,
  // TODO: finalize making this function independent of chart type
  chartType: CartesianChartTypes,
): AxisSettings[] => {
  // Build Y-axis metadata (chart-type independent)
  const yAxisMeta = buildYAxisMeta(ctx.chartData, ctx.dataOptions);

  // Always calculate data-driven min/max values
  // User-provided min/max values will be handled later in getYAxisSettings
  // This ensures the Y-axis scales correctly based on actual chart data
  const primaryMinMax = buildYAxisMinMax(
    0,
    chartType,
    ctx.chartData,
    ctx.designOptions,
    yAxisMeta.side,
    yAxisMeta.treatNullAsZero,
  );

  const secondaryMinMax = hasSecondaryYAxis(yAxisMeta.side)
    ? buildYAxisMinMax(
        1,
        chartType,
        ctx.chartData,
        ctx.designOptions,
        yAxisMeta.side,
        yAxisMeta.treatNullAsZero,
      )
    : undefined;

  // Build Y-axis settings using the single-responsible getYAxisSettings function
  // Stacking-specific enhancements will be applied by withStacking transformer
  return getYAxisSettings(
    ctx.designOptions.yAxis,
    ctx.designOptions.y2Axis,
    primaryMinMax,
    secondaryMinMax,
    ctx.dataOptions,
    ctx.extraConfig.themeSettings,
  );
};
