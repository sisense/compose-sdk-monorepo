import { withPolarSpecificAxisSettings } from '@/domains/visualizations/core/chart-options-processor/cartesian/utils/axis/axis-transformers.js';
import { AxisSettings } from '@/domains/visualizations/core/chart-options-processor/translations/axis-section.js';

import { BuildContext } from '../../../types.js';
import { getCartesianXAxis } from '../../helpers/highchart-options/axis.js';
import { getBasicYAxisSettings } from '../../helpers/highchart-options/y-axis.js';

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
