import flow from 'lodash-es/flow';

import {
  withXAxisLabelPositioning,
  withYAxisLabelPositioning,
} from '@/domains/visualizations/core/chart-options-processor/cartesian/utils/chart-configuration.js';
import { AxisSettings } from '@/domains/visualizations/core/chart-options-processor/translations/axis-section.js';

import { BuildContext } from '../../../../types.js';
import { getCartesianXAxis } from '../../../helpers/highchart-options/axis.js';
import { getBasicYAxisSettings } from '../../../helpers/highchart-options/y-axis.js';
import { withStacking } from '../../helpers/highchart-options/stacking.js';
import { getAreaChartSpacingForTotalLabels } from './labels-spacing.js';

export const getAxes = (
  ctx: BuildContext<'area'>,
): { xAxis: AxisSettings[]; yAxis: AxisSettings[] } => {
  // Area chart uses horizontal X axis like line charts
  const basicXAxis = getCartesianXAxis(ctx, 'horizontal');
  const basicYAxis = getBasicYAxisSettings(ctx, 'area');

  return {
    xAxis: withAreaChartXAxisLabelPositioning(ctx)(basicXAxis),
    yAxis: flow(withStacking(ctx), withAreaChartYAxisLabelPositioning(ctx))(basicYAxis),
  };
};

function withAreaChartXAxisLabelPositioning(
  ctx: BuildContext<'area'>,
): (xAxis: AxisSettings[]) => AxisSettings[] {
  const { rightSpacing: totalLabelRightSpacing, topSpacing: totalLabelTopSpacing } =
    getAreaChartSpacingForTotalLabels(ctx.designOptions);

  return withXAxisLabelPositioning({
    totalLabelRightSpacing,
    totalLabelTopSpacing,
  });
}

function withAreaChartYAxisLabelPositioning(
  ctx: BuildContext<'area'>,
): (yAxis: AxisSettings[]) => AxisSettings[] {
  const topShift = calculateTopShift(ctx);
  const rightShift = 0; // Area charts don't use rightShift for Y-axis positioning

  return withYAxisLabelPositioning({
    rightShift,
    topShift,
  });
}

/**
 * Calculate the top shift for the Y-axis labels based on the total labels.
 * @param ctx - The build context.
 * @returns The top shift for the Y-axis labels.
 */
function calculateTopShift(ctx: BuildContext<'area'>): number {
  const stackOptions = ctx.designOptions;
  const shouldApplyPositioning =
    stackOptions.totalLabels?.enabled && stackOptions.stackType === 'stack100';

  if (!shouldApplyPositioning) {
    return 0;
  }

  // Calculate topShift using the same logic as legacy system
  // For area charts, topShift = -1 * (topSpacing / 2) where topSpacing comes from total labels
  const { topSpacing } = getAreaChartSpacingForTotalLabels(ctx.designOptions);
  return -1 * (topSpacing / 2); // Match legacy calculation: TOP_DIVISOR = 2
}
