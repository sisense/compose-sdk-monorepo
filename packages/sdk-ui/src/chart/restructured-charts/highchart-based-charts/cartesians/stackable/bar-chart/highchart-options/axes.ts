import flow from 'lodash-es/flow';

import {
  withXAxisLabelPositioning,
  withYAxisLabelPositioning,
} from '@/chart-options-processor/cartesian/utils/chart-configuration';
import { AxisSettings } from '@/chart-options-processor/translations/axis-section';

import { BuildContext } from '../../../../types';
import { getCartesianXAxis } from '../../../helpers/highchart-options/axis';
import { getBasicYAxisSettings } from '../../../helpers/highchart-options/y-axis';
import { withStacking } from '../../helpers/highchart-options/stacking';
import { getBarChartSpacingForTotalLabels } from './labels-spacing';

export const getAxes = (
  ctx: BuildContext<'bar'>,
): { xAxis: AxisSettings[]; yAxis: AxisSettings[] } => {
  const basicXAxis = getCartesianXAxis(ctx, 'vertical');
  const basicYAxis = getBasicYAxisSettings(ctx, 'bar');

  return {
    xAxis: withBarChartXAxisLabelPositioning(ctx)(basicXAxis),
    yAxis: flow(withStacking(ctx), withBarChartYAxisLabelPositioning(ctx))(basicYAxis),
  };
};

function withBarChartXAxisLabelPositioning(
  ctx: BuildContext<'bar'>,
): (xAxis: AxisSettings[]) => AxisSettings[] {
  const { rightSpacing: totalLabelRightSpacing, topSpacing: totalLabelTopSpacing } =
    getBarChartSpacingForTotalLabels(ctx.designOptions);

  return withXAxisLabelPositioning({
    totalLabelRightSpacing,
    totalLabelTopSpacing,
  });
}

function withBarChartYAxisLabelPositioning(
  ctx: BuildContext<'bar'>,
): (yAxis: AxisSettings[]) => AxisSettings[] {
  // Calculate positioning based on whether total labels are shown with stack100
  const stackOptions = ctx.designOptions;
  const shouldApplyPositioning =
    stackOptions.totalLabels?.enabled && stackOptions.stackType === 'stack100';
  const rightShift = shouldApplyPositioning ? 0.1 : 0;
  const topShift = 0; // Bar charts use rightShift, not topShift

  return withYAxisLabelPositioning({
    rightShift,
    topShift,
  });
}
