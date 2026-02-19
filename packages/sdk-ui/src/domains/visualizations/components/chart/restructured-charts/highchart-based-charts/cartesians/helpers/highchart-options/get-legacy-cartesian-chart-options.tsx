import { getCartesianChartOptions } from '@/domains/visualizations/core/chart-options-processor/cartesian/cartesian-chart-options.js';
import { HighchartsOptionsInternal } from '@/domains/visualizations/core/chart-options-processor/chart-options-service.js';

import { BuildContext } from '../../../types.js';
import { CartesianChartTypes } from '../../types.js';

export const getLegacyCartesianChartOptions = (
  ctx: BuildContext<CartesianChartTypes>,
  chartType: CartesianChartTypes,
): HighchartsOptionsInternal => {
  const cartesianChartOptions = getCartesianChartOptions(
    ctx.chartData,
    chartType,
    ctx.designOptions,
    ctx.dataOptions,
    ctx.extraConfig.translate,
    ctx.extraConfig.themeSettings,
    ctx.extraConfig.dateFormatter,
  );

  return cartesianChartOptions.options;
};
