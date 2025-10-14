import { AxisSettings } from '@/chart-options-processor/translations/axis-section';

import { BuildContext } from '../../../types';
import { getCartesianXAxis } from '../../helpers/highchart-options/axis';
import { getBasicYAxisSettings } from '../../helpers/highchart-options/y-axis';

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
