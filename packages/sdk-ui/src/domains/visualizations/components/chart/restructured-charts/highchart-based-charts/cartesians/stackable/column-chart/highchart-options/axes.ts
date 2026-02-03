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
import { getColumnChartSpacingForTotalLabels } from './labels-spacing.js';

export const getAxes = (
  ctx: BuildContext<'column'>,
): { xAxis: AxisSettings[]; yAxis: AxisSettings[] } => {
  // Column chart uses horizontal X axis
  const basicXAxis = getCartesianXAxis(ctx, 'horizontal');
  const basicYAxis = getBasicYAxisSettings(ctx, 'column');

  return {
    xAxis: withColumnChartXAxisLabelPositioning(ctx)(basicXAxis),
    yAxis: flow(withStacking(ctx), withColumnChartYAxisLabelPositioning(ctx))(basicYAxis),
  };
};

function withColumnChartXAxisLabelPositioning(
  ctx: BuildContext<'column'>,
): (xAxis: AxisSettings[]) => AxisSettings[] {
  const { rightSpacing: totalLabelRightSpacing, topSpacing: totalLabelTopSpacing } =
    getColumnChartSpacingForTotalLabels(ctx.designOptions);

  return withXAxisLabelPositioning({
    totalLabelRightSpacing,
    totalLabelTopSpacing,
  });
}

function withColumnChartYAxisLabelPositioning(
  ctx: BuildContext<'column'>,
): (yAxis: AxisSettings[]) => AxisSettings[] {
  // Calculate positioning based on whether total labels are shown with stack100
  const stackOptions = ctx.designOptions;
  const shouldApplyPositioning =
    stackOptions.totalLabels?.enabled && stackOptions.stackType === 'stack100';

  // Calculate topShift using the same logic as legacy system
  // For column charts, topShift = -1 * (topSpacing / 2) where topSpacing comes from total labels
  let topShift = 0;
  if (shouldApplyPositioning) {
    const { topSpacing } = getColumnChartSpacingForTotalLabels(ctx.designOptions);
    topShift = -1 * (topSpacing / 2); // Match legacy calculation: TOP_DIVISOR = 2
  }

  const rightShift = 0; // Column charts don't use rightShift for Y-axis positioning

  return withYAxisLabelPositioning({
    rightShift,
    topShift,
  });
}
