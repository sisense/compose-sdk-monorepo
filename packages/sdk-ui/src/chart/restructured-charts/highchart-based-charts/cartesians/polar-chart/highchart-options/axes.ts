import { AxisSettings } from '@/chart-options-processor/translations/axis-section';
import { BuildContext } from '../../../types';
import { getCartesianXAxis } from '../../helpers/highchart-options/axis';
import { getBasicYAxisSettings } from '../../helpers/highchart-options/y-axis';
import { withPolarSpecificAxisSettings } from '@/chart-options-processor/cartesian/utils/axis/axis-transformers';

export function getAxes(ctx: BuildContext<'polar'>): {
  xAxis: AxisSettings[];
  yAxis: AxisSettings[];
} {
  // Polar chart uses horizontal X axis like line charts
  const basicXAxis = getCartesianXAxis(ctx, 'horizontal');
  const basicYAxis = getBasicYAxisSettings(ctx, 'polar');

  return {
    xAxis: withPolarSpecificAxisSettings(basicXAxis),
    yAxis: basicYAxis, // Y-axis normalization is handled at design options level
  };
}
