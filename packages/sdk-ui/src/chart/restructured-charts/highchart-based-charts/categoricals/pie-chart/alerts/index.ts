import { getPieAlerts } from '@/chart-options-processor/translations/pie-series';
import { BuildContext } from '../../../types';

/**
 * Pie-specific alerts function that uses the specialized pie alerts logic.
 */
export const getPieChartAlerts = (ctx: BuildContext<'pie'>): string[] => {
  const { seriesCapacity } = ctx.designOptions.dataLimits;
  return getPieAlerts(ctx.chartData, seriesCapacity);
};
