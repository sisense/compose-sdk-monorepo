import { AxisSettings } from '@/domains/visualizations/core/chart-options-processor/translations/axis-section.js';

import { BuildContext } from '../../../types.js';
import { getCartesianXAxis } from '../../helpers/highchart-options/axis.js';
import { getBasicYAxisSettings } from '../../helpers/highchart-options/y-axis.js';

export const getAxes = (
  ctx: BuildContext<'line'>,
): { xAxis: AxisSettings[]; yAxis: AxisSettings[] } => {
  // Line chart uses horizontal X axis
  const basicXAxis = getCartesianXAxis(ctx, 'horizontal');
  const basicYAxis = getBasicYAxisSettings(ctx, 'line');

  return {
    xAxis: basicXAxis,
    yAxis: basicYAxis,
  };
};
