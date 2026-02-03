import { getPieAlerts } from '@/domains/visualizations/core/chart-options-processor/translations/pie-series.js';

import { BuildContext } from '../../../types.js';

/**
 * Pie-specific alerts function that uses the specialized pie alerts logic.
 */
export const getPieChartAlerts = (ctx: BuildContext<'pie'>): string[] => {
  const { seriesCapacity } = ctx.designOptions.dataLimits;
  return getPieAlerts(ctx.chartData, seriesCapacity);
};
