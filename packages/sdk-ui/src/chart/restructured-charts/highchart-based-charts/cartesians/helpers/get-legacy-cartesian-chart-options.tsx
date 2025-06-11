import { getCartesianChartOptions } from '@/chart-options-processor/cartesian-chart-options';
import { BuildContext } from '../../types';
import { CartesianChartTypes } from '../types';

export const getLegacyCartesianChartOptions = (
  ctx: BuildContext<CartesianChartTypes>,
  chartType: CartesianChartTypes,
) => {
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
