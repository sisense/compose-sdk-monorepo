import { AxisSettings } from '@/chart-options-processor/translations/axis-section';

import { BuildContext } from '../../../../types';
import { getCartesianXAxis } from '../../../helpers/highchart-options/axis';
import { getBasicYAxisSettings } from '../../../helpers/highchart-options/y-axis';

/**
 * Build X and Y axis configurations for streamgraph charts.
 *
 * Streamgraphs use:
 * - Standard horizontal X-axis (like area/line charts)
 * - Minimal or hidden Y-axis (values are relative, not absolute)
 */
export const getAxes = (
  ctx: BuildContext<'streamgraph'>,
): { xAxis: AxisSettings[]; yAxis: AxisSettings[] } => {
  // Standard horizontal X-axis for categories/time
  const basicXAxis = getCartesianXAxis(ctx, 'horizontal');

  // Y-axis with minimal styling (often hidden)
  const basicYAxis = getBasicYAxisSettings(ctx, 'area'); // Use area type for now

  // Apply streamgraph-specific modifications
  const xAxis = basicXAxis.map((axis) => ({
    ...axis,
    // Remove or minimize gridlines for cleaner look
    gridLineWidth: ctx.designOptions.xAxis.gridLine ? 1 : 0,
    // Ensure categories/labels are visible
    labels: {
      ...axis.labels,
      enabled: ctx.designOptions.xAxis.labels ?? true,
    },
  }));

  const yAxis = basicYAxis.map((axis) => ({
    ...axis,
    // Hide Y-axis components by default for streamgraph aesthetic
    visible: ctx.designOptions.yAxis.enabled,
    gridLineWidth: ctx.designOptions.yAxis.gridLine ? 1 : 0,
    labels: {
      ...axis.labels,
      enabled: ctx.designOptions.yAxis.labels,
    },
    // Streamgraphs need padding for the centered offset
    startOnTick: false,
    endOnTick: false,
    minPadding: 0.1,
    maxPadding: 0.15,
    // Streamgraphs should drop y-axis limits calculated for area charts
    min: undefined,
    max: undefined,
  }));

  return { xAxis, yAxis };
};
